import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SendHorizontal } from 'lucide-react';
import {
  postConversationMessageCreate,
  postProjectConversationCreate,
  useConversationMessageListQuery,
} from '@/api/chat';
import {
  AgentPollTimeoutError,
  deleteAgentTask,
  pollAgentTask,
  postAgentTaskInput,
  postAgentTaskRetry,
  SETTLED_AGENT_TASK_STATUSES,
  useAiProviderListQuery,
  getConversationActiveTask,
  getAgentTask,
} from '@/api/agent';
import {
  getProjectApprovalList,
  postApprovalApprove,
  postApprovalReject,
  useApprovalDetailQuery,
  useConversationPendingApprovalQuery,
} from '@/api/approvals';
import { composeApiErrorMessage, dispatchApiErrorAction } from '@/lib/apiErrorGuide';
import { refreshUserInfoInBackground } from '@/api/user';
import AppAlertDialog from '@/components/common/AppAlertDialog';
import AgentApprovalCard from '@/components/layout/project/AgentApprovalCard';
import AgentRetryCard from '@/components/layout/project/AgentRetryCard';
import { useAgentTaskEventStream } from '@/hooks/useAgentTaskEventStream';
import type {
  AgentTaskEvent,
  AnsweredClarification,
  GetAgentTaskResType,
  TaskClarification,
} from '@/types/agent.type';
import AgentClarificationForm from '@/components/layout/project/AgentClarificationForm';
import AgentAnsweredClarificationCard from '@/components/layout/project/AgentAnsweredClarificationCard';
import AgentTaskTimeline from '@/components/layout/project/AgentTaskTimeline';
import {
  canRenderAnsweredChoices,
  canRenderAsChoices,
} from '@/components/layout/project/agentClarification.utils';
import {
  findCardCoveredMessageId,
  toMessageTone,
} from '@/components/layout/project/chatMessageKind.utils';
import type { ConversationMessage } from '@/types/chat.type';
import {
  AGENT_CHAT_QUERY_KEY,
  clearHomeAgentPromptSendGuard,
  createLocalMessage,
  mergeConversationMessages,
  migrateSessionMessages,
  readConversationTaskId,
  readSessionMessages,
  rememberConversationTaskId,
  shouldSendHomeAgentPromptOnce,
  writeSessionMessages,
} from '@/components/layout/project/agentChat.utils';

const suggestedPrompts = [
  {
    label: '포트폴리오 만들기',
    prompt: 'React + Vite로 포트폴리오 사이트를 만들어줘.',
  },
  {
    label: '기존 레포 수정',
    prompt: '현재 프로젝트에서 수정하고 싶은 부분을 알려줄게.',
  },
] as const;

type AgentConversationPanelProps = {
  /**
   * 클라우드 연결이 없어서 멈춘 되묻기를 바깥에 알린다.
   *
   * 이 안내는 프리뷰 위로 덮어야 해서 이 패널이 그릴 수 없다. 상태만 올려 보내고
   * 그리는 것은 페이지가 맡는다.
   */
  onCloudConnectRequired?: (payload: { taskId: string; question: string } | null) => void;
  /**
   * 값이 바뀌면 서버에 진행 상태를 다시 묻는다.
   *
   * 연결을 마치고 재시도한 뒤 이 패널이 들고 있던 "답을 기다리는 중" 이 그대로 남으면
   * 안 된다. 화면이 스스로 지우는 대신 서버에 다시 물어 맞춘다.
   */
  restoreToken?: number;
  projectId: number;
  projectName: string;
  conversationId: number | null;
  isNewConversation: boolean;
  initialPrompt?: string | null;
  onConversationCreated: (conversationId: number) => void;
  onConversationActivity?: (conversationId: number) => void;
  /** Agent 태스크가 도는 중인지 알린다. 프리뷰 세션 폴링을 열어 두는 데 쓰인다 */
  onAgentTaskActiveChange?: (isActive: boolean) => void;
  /** 배포 중이면 서버가 완료 안내를 나중에 덧붙이므로 메시지를 계속 다시 읽는다 */
  isDeployInFlight?: boolean;
};

// 태스크 상태를 사람이 읽을 문구로 옮기던 formatAgentTaskReply 는 없앴다.
// 서버가 모든 종료 상태를 chat_messages 에 남기므로 FE 가 같은 사건을 다시 서술하면
// 문구만 다른 두 벌이 된다. 서술은 서버 하나가 소유한다.

const APPROVAL_WAIT_STATUSES = new Set(['WAITING_APPROVAL', 'WAITING_RESULT_APPROVAL']);

/** 답이 아니라 화면이 무언가를 해 줘야 하는 되묻기 — 클라우드 연결이 없을 때 온다 */
const CLOUD_CONNECT_ACTION = 'CONNECT_CLOUD';

/**
 * 진행 중 상태 문구.
 *
 * 빌드는 몇 분 걸리는데 그동안 화면에는 글자 없는 스켈레톤만 있었다. 사용자는 멈춘
 * 줄 알고 새로고침하거나 같은 요청을 다시 보낸다. 이미 2초마다 받고 있는 status 를
 * 한 줄로 보여주면 그 오해가 사라진다.
 *
 * 종료 상태(DONE·FAILED·CANCELLED)는 여기 없다 — 그때는 스켈레톤 자체가 사라지고
 * 서버가 적은 결과 메시지가 자리를 대신한다.
 */
const TASK_PROGRESS_LABEL: Record<string, string> = {
  PENDING: '요청을 접수했습니다',
  QUEUED: '작업을 기다리는 중',
  RUNNING: '작업 중',
  RETRY_WAIT: '재시도를 기다리는 중',
  WAITING_APPROVAL: '승인을 기다리는 중',
  WAITING_RESULT_APPROVAL: '결과 확인을 기다리는 중',
  WAITING_INPUT: '질문에 답해 주세요',
};

/**
 * 되묻는 중이면 taskId 와 질문을 **짝으로** 만든다.
 *
 * 둘을 따로 들면 태스크가 바뀌는 순간 앞 질문이 새 태스크의 것처럼 잠깐 보인다.
 * 그러면 사용자가 엉뚱한 질문에 답을 보내게 되므로 항상 같이 세운다.
 */
function toAwaitingInput(
  task: { status?: string; clarification?: TaskClarification | null } | null | undefined,
  taskId: string | null | undefined,
) {
  if (!task || task.status !== 'WAITING_INPUT' || !taskId) return null;
  return { taskId, clarification: task.clarification ?? null };
}

/**
 * 이어서 다시 돌릴 수 있는 실패인가.
 *
 * `retryable` 은 서버가 승인 대기 여부까지 반영해 계산해 준다. 다만 그 값은 읽는 시점에
 * 따라 잠깐 낡을 수 있다고 서버가 밝혀 두었다 — 진짜 관문은 `/retry` 호출이고, 거기서
 * 막히면 409 가 온다. 그래서 여기서는 화면에 버튼을 내보낼지만 정하고, 실패는 호출부가
 * 정상 경로로 받는다.
 */
function isRetryableFailure(task: GetAgentTaskResType | null): boolean {
  return task?.status === 'FAILED' && task.retryable === true && task.pendingApprovalId == null;
}

/**
 * 스켈레톤 옆에 붙일 한 줄. 모르는 상태가 와도 "작업 중"으로 떨어진다 —
 * status 는 열린 문자열이라 서버가 단계를 늘리면 여기 없는 값이 온다.
 */
function describeTaskProgress(task: GetAgentTaskResType | null): string {
  if (!task) return '작업 중';

  const label = TASK_PROGRESS_LABEL[task.status] ?? '작업 중';
  // 재시도는 몇 번째인지가 정보다. "재시도를 기다리는 중"만 있으면 언제 끝날지 모른다
  if (task.status === 'RETRY_WAIT' && task.attempt != null && task.maxAttempts != null) {
    return `${label} (${task.attempt}/${task.maxAttempts})`;
  }
  return label;
}

async function resolvePendingApprovalId(
  task: GetAgentTaskResType,
  projectId: number,
  conversationId: number | null,
) {
  if (task.pendingApprovalId != null) return task.pendingApprovalId;

  /*
    태스크가 끝났어도 승인을 찾는다.

    예전에는 태스크가 승인 대기 상태일 때만 찾았다. 그런데 배포는 승인을 만들어 놓고
    태스크를 그 자리에서 끝낸다 — 실제 프로비저닝은 워커가 비동기로 돌기 때문이다.
    그러면 채팅은 승인이 생긴 것을 모른 채 "승인해주세요" 라고만 말하고 누를 것을 주지
    않았다. 사용자가 승인 탭을 스스로 찾아가야 했다.

    말은 해 놓고 방법을 안 주는 화면이었다. 상태 조건을 걷어내면 그 자리에 카드가 뜬다.
  */
  const approvals = await getProjectApprovalList(projectId);
  const pending = approvals.find((approval) => {
    if (approval.status !== 'PENDING') return false;
    if (approval.taskId && approval.taskId === task.taskId) return true;
    if (conversationId != null && approval.conversationId === conversationId) return true;
    return false;
  });

  // 이 태스크·대화에 속한 승인만 쓴다. 예전에는 매칭이 실패하면 프로젝트 안 아무 PENDING이나
  // 집어왔는데, 스캐폴딩 승인이 WAITING_APPROVAL로 남아 쌓이는 구조라 다른 대화의 승인 카드가
  // 뜰 수 있었다. 승인은 되돌리기 어려우므로 엉뚱한 것을 띄우느니 아무것도 안 띄운다.
  //
  // 상태 조건을 걷어낸 뒤에도 이 범위 제한이 남아 있어야 안전하다. 넓히는 것은 "언제
  // 찾나" 이지 "무엇을 고르나" 가 아니다.
  //
  // 배포처럼 승인이 둘 이상 생기면 하나씩 뜬다. 하나를 결정하면 그 자리에서 다시 찾아
  // 다음 것을 세우므로(승인 mutation 참고) 순서대로 이어진다.
  return pending?.approvalId ?? null;
}

/**
 * 오류 문구. 서버가 코드를 붙여 보냈으면 다음 행동을 한 줄 덧붙인다 —
 * "다른 AI 제공자를 골라 다시 보내보세요" 같은 것. 코드가 없거나 모르는
 * 코드면 서버 문장만 그대로 나간다.
 */
function formatApiErrorMessage(error: unknown) {
  return composeApiErrorMessage(error);
}

function AgentConversationPanel({
  projectId,
  projectName,
  conversationId,
  isNewConversation,
  initialPrompt,
  onConversationCreated,
  onConversationActivity,
  onAgentTaskActiveChange,
  isDeployInFlight = false,
  onCloudConnectRequired,
  restoreToken = 0,
}: AgentConversationPanelProps) {
  const [input, setInput] = useState('');
  const [overlayMessages, setOverlayMessages] = useState<ConversationMessage[]>([]);
  const [isAssistantReplying, setIsAssistantReplying] = useState(false);
  // 폴링이 읽어오는 태스크. 진행 문구를 만드는 데만 쓴다
  const [progressTask, setProgressTask] = useState<GetAgentTaskResType | null>(null);
  /*
    에이전트가 되물어서 멈춰 선 태스크.
    "배포해줘"에 저장소 이름을, "도메인 연결해줘"에 도메인을 묻는 자리다.

    이때 사용자가 입력창에 적는 것은 **새 요청이 아니라 그 질문의 답**이다. 새 메시지로
    보내면 서버는 새 태스크를 만들고, 원래 태스크는 WAITING_INPUT 인 채 영원히 남는다
    — 배포가 되묻는 순간부터 빠져나올 길이 없어진다.
  */
  const [awaitingInput, setAwaitingInput] = useState<{
    taskId: string;
    clarification: TaskClarification | null;
  } | null>(null);
  const awaitingInputTaskId = awaitingInput?.taskId ?? null;
  /*
    답이 끝난 되묻기. **폼이 아니라 기록이다.**

    되묻기 폼은 답한 순간 사라진다 — 서버가 `clarification` 을 null 로 만들어 이중 제출을
    막기 때문이다. 그 동작은 그대로 둔다. 되살리면 폼이 다시 떠서 두 번 보낼 창이 열린다.

    그런데 그러고 나면 **무엇을 골랐는지 확인할 길이 없었다.** 서버가 답한 시점의
    스냅샷을 따로 남기기 시작했으므로(`answeredClarification`), 그것을 읽기 전용 카드로
    세운다.

    taskId 와 짝으로 든다 — 되묻기 폼과 같은 이유다. 따로 들면 태스크가 바뀌는 순간 앞
    태스크의 결정이 새 태스크의 것처럼 보인다.
  */
  const [answeredClarification, setAnsweredClarification] = useState<{
    taskId: string;
    answered: AnsweredClarification;
  } | null>(null);

  /*
    연결이 없어서 멈춘 되묻기는 답을 받을 게 아니다.

    사용자가 여기 적을 수 있는 것이 없다 — 다른 화면에서 계정을 연결하고 프로젝트에
    골라야 한다. 그래서 질문 폼 대신 안내를 띄우는데, 그 안내는 프리뷰 위로 덮어야
    해서 이 패널이 그릴 수 없다. 상태만 올려 보낸다.

    모르는 actionType 은 여기 안 걸린다 — 지금까지처럼 자유 입력으로 다뤄진다.
  */
  const cloudConnectRequest = useMemo(() => {
    if (!awaitingInput || awaitingInput.clarification?.actionType !== CLOUD_CONNECT_ACTION) {
      return null;
    }
    return { taskId: awaitingInput.taskId, question: awaitingInput.clarification.question };
    // 값이 같으면 같은 객체를 유지한다 — 매 렌더 새 객체를 올려 보내면 바깥이 계속 다시 그린다
  }, [awaitingInput]);

  useEffect(() => {
    onCloudConnectRequired?.(cloudConnectRequest);
  }, [cloudConnectRequest, onCloudConnectRequired]);
  /*
    상한까지 기다렸는데 아직 도는 중. 실패가 아니라서 오류 알림을 띄우면 안 된다 —
    서버는 계속 돌고 결과는 채팅에 올라온다. 조용한 안내로 남긴다.

    불리언이 아니라 **그때의 메시지 수**를 담는다. 새 메시지가 붙으면 그게 곧 결과가
    도착했다는 뜻이라 안내가 저절로 사라진다 — "끝나면 올라옵니다"라고 해놓고 정작
    올라온 뒤에도 그 말이 남아 있으면 아직 안 끝난 것처럼 읽힌다.
  */
  const [longRunningBaseline, setLongRunningBaseline] = useState<number | null>(null);
  /*
    실패했지만 이어서 다시 돌릴 수 있는 작업.

    서버가 plan 과 실패한 스텝을 들고 있어 그 지점부터 재개한다. 이 카드가 없으면
    사용자는 요청 전체를 처음부터 다시 적어야 했다 — 몇 분짜리 빌드를 통째로 다시 도는
    셈이다. postAgentTaskRetry 는 만들어져 있었지만 부르는 곳이 없었다.
  */
  const [retryableTask, setRetryableTask] = useState<GetAgentTaskResType | null>(null);
  /*
    지금 도는 태스크. 취소 대상이다.

    progressTask 로도 알 수 있지만 그건 첫 폴링이 돌아온 뒤에야 채워진다. 요청을 보내고
    첫 응답이 오기까지도 몇 초 걸리는데, 그동안 멈출 방법이 없으면 잘못 보낸 걸 알아챈
    사용자가 할 수 있는 게 없다.
  */
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  /*
    고른 AI 제공자. 비어 있으면 서버 기본값으로 보낸다.

    목록이 없거나(엔드포인트 미배포·조회 실패) 하나뿐이면 셀렉트를 아예 안 그린다 —
    고를 게 없는 셀렉트는 자리만 차지하고, 그때 동작은 지금과 똑같다.
  */
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  // 승인 대기 여부는 서버만 안다 — 채팅 본문에서 유추하지 않는다
  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);

  /*
    실행 이벤트 스트림. 도는 태스크가 있을 때만 연다.

    상태 문구("빌드 중")는 지금 무엇을 기다리는지만 말한다. 이벤트는 **여기까지 왔다**를
    말한다 — 몇 분짜리 빌드에서 그 차이가 크다. 서버가 결과를 chat_messages 에 적는 것과
    별개라 겹치지 않는다: 이건 진행이고 그건 결과다.
  */
  const { events: taskEvents } = useAgentTaskEventStream(runningTaskId, {
    enabled: isAssistantReplying,
  });

  /**
   * 태스크에 답이 끝난 되묻기가 실려 있으면 카드로 세운다.
   *
   * 값이 그대로면 상태를 바꾸지 않는다 — 폴링이 2초마다 같은 값을 새 객체로 넣으면
   * 카드가 매번 다시 그려진다.
   */
  const captureAnsweredClarification = (task: GetAgentTaskResType) => {
    const answered = task.answeredClarification;
    // 자유 입력으로 물은 되묻기는 카드로 그리지 않는다 — 답 문장은 이미 말풍선으로 남아
    // 있어서, 질문과 나머지 선택지가 없으면 같은 문장을 두 번 보여줄 뿐이다
    if (!answered || !canRenderAnsweredChoices(answered) || !task.taskId) return;

    setAnsweredClarification((prev) =>
      prev && prev.taskId === task.taskId && prev.answered.answer === answered.answer
        ? prev
        : { taskId: task.taskId, answered },
    );
  };

  /**
   * 폴링이 태스크를 읽을 때마다 부른다. 진행 문구와 "이렇게 정했습니다" 를 같이 세운다.
   *
   * 둘을 한 자리에서 받는 이유는, 되묻기에 답한 뒤 이어 도는 구간을 지켜보는 것이 곧
   * 폴링이기 때문이다. 폴링 밖에서 따로 조회하면 같은 것을 두 번 묻게 된다.
   */
  const captureTaskProgress = (task: GetAgentTaskResType) => {
    setProgressTask(task);
    captureAnsweredClarification(task);
  };

  const { data: aiProviders } = useAiProviderListQuery(AGENT_CHAT_QUERY_KEY);
  const providerOptions = aiProviders?.providers ?? [];
  // 둘 이상일 때만 고를 의미가 있다. 하나뿐이면 서버 기본값과 같아서 보여줄 이유가 없다
  const canChooseProvider = providerOptions.length > 1;

  const queryClient = useQueryClient();
  const { data: serverMessages, isLoading: isMessagesLoading } = useConversationMessageListQuery(
    AGENT_CHAT_QUERY_KEY,
    conversationId ?? 0,
    // 오래 걸려 폴링을 놓은 동안에는 결과 메시지를 더 자주 확인한다. "끝나면 여기에
    // 올라옵니다"라고 안내해 놓고 15초씩 늦게 올리면 그 말이 무색해진다
    isDeployInFlight || longRunningBaseline != null,
  );
  // 기준보다 메시지가 늘었으면 결과가 도착한 것이다
  const isLongRunning =
    longRunningBaseline != null && (serverMessages?.length ?? 0) <= longRunningBaseline;

  const displayMessages = useMemo(() => {
    const merged = mergeConversationMessages(serverMessages ?? [], overlayMessages);

    /*
      "이렇게 정했습니다" 카드가 떠 있으면 같은 답을 말하는 줄을 접는다.

      본문을 보고 고르지 않는다 — 서버가 붙여 주는 `kind` 와 `taskId` 로만 찾는다
      (BE #310·#315). 카드는 새로고침하면 사라지고 이 줄은 남으므로, 지우는 게 아니라
      카드가 있는 동안만 감추는 것이다.
    */
    const coveredId = findCardCoveredMessageId(merged, answeredClarification?.taskId ?? null);
    return coveredId == null ? merged : merged.filter((m) => m.messageId !== coveredId);
  }, [serverMessages, overlayMessages, answeredClarification]);
  const pollAbortRef = useRef<AbortController | null>(null);

  /*
    태스크가 끝난 뒤에 생기는 승인을 놓치지 않는다.

    태스크 종료 시점에 한 번 묻는 것만으로는 그보다 늦게 생기는 승인을 못 잡는다.
    계속 지켜보면 언제 생기든 다음 주기에 걸린다.

    대화 ID 가 실린 승인만 걸린다. 화면 쪽에서 시작한 것(도메인 해제 등)은 그 값이
    없어 승인 화면에서 눌러야 한다. 범위를 넓혀 잡으려 하면 다른 대화의 승인이 뜨던
    예전 문제로 돌아가므로 넓히지 않는다.

    이미 결정한 것은 뺀다 — 서버가 상태를 바꾸기 전에 한 번 더 조회가 돌면 방금 누른
    카드가 잠깐 되살아나고, 그 사이 두 번 누를 수 있다.
  */
  const { data: watchedApprovalId } = useConversationPendingApprovalQuery(
    AGENT_CHAT_QUERY_KEY,
    projectId,
    conversationId,
  );
  const decidedApprovalIdsRef = useRef<Set<number>>(new Set());
  const visibleApprovalId =
    pendingApprovalId ??
    (watchedApprovalId != null && !decidedApprovalIdsRef.current.has(watchedApprovalId)
      ? watchedApprovalId
      : null);

  const { data: pendingApproval } = useApprovalDetailQuery(AGENT_CHAT_QUERY_KEY, visibleApprovalId);
  const activeApproval = pendingApproval?.status === 'PENDING' ? pendingApproval : null;

  // 대화를 열거나 바꿀 때 미결 승인을 서버에서 복원한다.
  //
  // taskId로 복원하면 안 된다 — taskId는 메시지 생성 응답에만 실려 오고 메모리에만 남아서,
  // 새로고침하면 사라진다. 그러면 승인은 PENDING인데 카드가 없어 결정할 방법이 없어진다.
  // 승인 목록에는 conversationId·taskId·input이 다 들어 있으므로 이쪽으로 찾는다.
  useEffect(() => {
    // 대화가 바뀌면 초기화한다. 남겨두면 다른 대화의 질문에 답을 보내게 된다
    setAwaitingInput(null);
    setLongRunningBaseline(null);
    setRetryableTask(null);
    setRunningTaskId(null);
    setAnsweredClarification(null);

    if (conversationId == null) {
      setPendingApprovalId(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const approvals = await getProjectApprovalList(projectId);
        // 반드시 conversationId로 거른다. 프로젝트 단위로 찾으면 conversationId가 null인
        // 고아 스캐폴딩 승인이 잡혀서, 다른 대화의 승인 카드가 뜨던 문제가 재현된다
        const pending = approvals.find(
          (approval) => approval.status === 'PENDING' && approval.conversationId === conversationId,
        );
        if (!cancelled) setPendingApprovalId(pending?.approvalId ?? null);
      } catch {
        // 복원에 실패하면 승인 없음으로 둔다 — 없는 승인을 띄우는 것보다 낫다
        if (!cancelled) setPendingApprovalId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, projectId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      let targetConversationId = conversationId;

      if (isNewConversation || targetConversationId === null) {
        const created = await postProjectConversationCreate(projectId);
        targetConversationId = created.conversationId;
      }

      const createdMessage = await postConversationMessageCreate(targetConversationId, {
        content,
        // 고르지 않았으면 보내지 않는다 — 서버 기본값을 쓰게 둔다
        ...(selectedProvider ? { aiProvider: selectedProvider } : {}),
      });

      const taskId = createdMessage.taskId?.trim() || '';
      if (!taskId) {
        return {
          conversationId: targetConversationId,
          task: null,
          taskId: '',
          pendingApprovalId: null,
        };
      }

      rememberConversationTaskId(targetConversationId, taskId);
      setRunningTaskId(taskId);
      onConversationActivity?.(targetConversationId);

      const sessionMessages = readSessionMessages(targetConversationId);
      const lastUserIndex = [...sessionMessages]
        .map((message, index) => ({ message, index }))
        .reverse()
        .find(({ message }) => message.role === 'user' && message.content === content)?.index;
      if (lastUserIndex != null) {
        const nextMessages = sessionMessages.map((message, index) =>
          index === lastUserIndex ? { ...message, taskId } : message,
        );
        writeSessionMessages(targetConversationId, nextMessages);
      }

      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;
      const task = await pollAgentTask(taskId, {
        signal: controller.signal,
        onProgress: captureTaskProgress,
      });

      const pendingApprovalId = await resolvePendingApprovalId(
        task,
        projectId,
        targetConversationId,
      );

      return {
        conversationId: targetConversationId,
        task,
        taskId,
        pendingApprovalId,
      };
    },
    onMutate: (content) => {
      const draftConversationId = conversationId ?? 0;
      const userMessage = createLocalMessage(draftConversationId, 'user', content);
      setOverlayMessages((prev) => {
        const next = [...mergeConversationMessages(serverMessages ?? [], prev), userMessage];
        writeSessionMessages(draftConversationId, next);
        return next;
      });
      setInput('');
      setIsAssistantReplying(true);
      setLongRunningBaseline(null);
      setRetryableTask(null);
      // 앞선 실행의 문구가 남아 있으면 새 요청이 그 상태인 것처럼 보인다
      setProgressTask(null);
      // 새 요청은 새 태스크다. 앞 태스크의 결정을 남기면 이번에 그렇게 정한 것처럼 읽힌다
      setAnsweredClarification(null);
      return { content, userMessage, draftConversationId };
    },
    onSuccess: (result, _content, context) => {
      const targetConversationId = result.conversationId;

      if (context?.userMessage && context.draftConversationId !== targetConversationId) {
        migrateSessionMessages(context.draftConversationId, targetConversationId);
      }

      const pendingApprovalId = result.task?.pendingApprovalId ?? result.pendingApprovalId ?? null;
      setPendingApprovalId(pendingApprovalId);
      setRetryableTask(isRetryableFailure(result.task) ? result.task : null);
      // 에이전트가 되물었으면 다음 입력은 새 요청이 아니라 그 답이다
      setAwaitingInput(toAwaitingInput(result.task, result.taskId));

      // 어시스턴트 답변을 task.summary 로 직접 만들지 않는다. 서버가 같은 사건을
      // chat_messages 에 이미 적어두는데 문구가 달라서(요약 전문 vs 짧은 안내) 병합에
      // 걸리지 않고 두 벌로 보였다. 새로고침하면 서버 것만 남아 하나로 줄던 게 그 증거다.
      // 사용자 메시지는 오버레이에 남겨 둔다 — 서버 목록이 도착하면 본문이 같아 병합된다.
      const sessionMessages = readSessionMessages(targetConversationId);
      setOverlayMessages(sessionMessages);

      if (isNewConversation || conversationId === null) {
        onConversationCreated(targetConversationId);
      }

      if (result.taskId) {
        rememberConversationTaskId(targetConversationId, result.taskId);
      }

      void queryClient.invalidateQueries({
        queryKey: ['project-conversation-list', AGENT_CHAT_QUERY_KEY, projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, targetConversationId],
      });

      if (!result.task && context?.userMessage) {
        console.warn('[agent] message created without taskId', {
          conversationId: targetConversationId,
          taskId: result.taskId,
        });
        setAlertMessage('메시지는 저장됐지만 작업이 시작되지 않았습니다. 다시 요청해 주세요.');
      }

      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      onConversationActivity?.(targetConversationId);
    },
    onError: (error, content, context) => {
      /*
        상한까지 기다렸지만 작업은 아직 돈다 — 실패가 아니다. 오류 알림을 띄우면
        성공할 작업을 실패로 오해하게 된다. 조용히 알리고 물러난다. 결과는 서버가
        채팅에 적고 메시지 목록 폴링이 가져온다.
      */
      if (error instanceof AgentPollTimeoutError) {
        setIsAssistantReplying(false);
        setProgressTask(null);
        setRunningTaskId(null);
        setLongRunningBaseline(serverMessages?.length ?? 0);
        return;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        setIsAssistantReplying(false);
        setProgressTask(null);
        setRunningTaskId(null);
        return;
      }

      console.error('[agent] send/poll failed', error);

      setAlertMessage(formatApiErrorMessage(error));
      // GitHub App 권한이 원인이면 여기서 설정 진입점을 띄운다. 문구만 보여주면
      // 사용자가 GitHub 설정까지 스스로 찾아가야 한다
      dispatchApiErrorAction(error);

      if (!(conversationId != null && context?.userMessage)) {
        setInput(content);
        if (context?.userMessage) {
          setOverlayMessages((prev) =>
            prev.filter((message) => message.messageId !== context.userMessage.messageId),
          );
        }
      }
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
    },
  });

  const decideApprovalMutation = useMutation({
    mutationFn: async ({
      approvalId,
      action,
      taskId,
      payload,
    }: {
      approvalId: number;
      action: 'approve' | 'reject';
      taskId: string;
      payload?: Record<string, string>;
    }) => {
      if (action === 'approve') {
        await postApprovalApprove(approvalId, payload);
      } else {
        await postApprovalReject(approvalId);
      }

      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;
      rememberConversationTaskId(conversationId ?? 0, taskId);
      setRunningTaskId(taskId);
      const task = await pollAgentTask(taskId, {
        signal: controller.signal,
        onProgress: captureTaskProgress,
        until: (nextTask) => {
          const stillSameApproval =
            nextTask.pendingApprovalId === approvalId &&
            APPROVAL_WAIT_STATUSES.has(nextTask.status);
          if (stillSameApproval) return false;
          return SETTLED_AGENT_TASK_STATUSES.has(nextTask.status);
        },
      });
      const nextPendingApprovalId = await resolvePendingApprovalId(task, projectId, conversationId);
      const pendingApprovalId = nextPendingApprovalId === approvalId ? null : nextPendingApprovalId;

      return { task, pendingApprovalId, decidedApprovalId: approvalId };
    },
    onMutate: ({ approvalId }) => {
      // 누른 즉시 적어 둔다. 감시 조회가 서버 상태보다 먼저 한 번 더 돌면 방금 누른
      // 카드가 되살아나는데, 그 사이 두 번 누르면 같은 승인을 두 번 보내게 된다
      decidedApprovalIdsRef.current.add(approvalId);
      setIsAssistantReplying(true);
      setLongRunningBaseline(null);
      setRetryableTask(null);
      // 앞선 실행의 문구가 남아 있으면 새 요청이 그 상태인 것처럼 보인다
      setProgressTask(null);
      setPendingApprovalId(null);
    },
    onSuccess: ({ task, pendingApprovalId }) => {
      const targetConversationId = conversationId;
      if (targetConversationId == null) return;

      rememberConversationTaskId(targetConversationId, task.taskId);

      // 찾았으면 띄운다. 태스크가 끝났어도 승인이 남아 있으면 사용자가 눌러야 할 것이다
      setPendingApprovalId(pendingApprovalId);
      setRetryableTask(isRetryableFailure(task) ? task : null);
      // 승인 뒤 이어 달리다 되물을 수도 있다
      setAwaitingInput(toAwaitingInput(task, task.taskId));

      // 태스크가 끝났으면 게이트 안내와 결과가 서버에 기록돼 있다.
      // 로컬 임시 메시지를 덧붙이면 곧 도착할 서버 메시지와 겹치므로 오버레이를 비우고
      // 서버 목록을 단일 출처로 삼는다 (기존 메시지는 그대로 남아 화면이 비지 않는다)
      setOverlayMessages([]);
      writeSessionMessages(targetConversationId, []);

      void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      // 승인은 서버 쪽 상태를 바꾼다 — 결정 뒤 화면에 남아 있는 옛 값을 걷어낸다.
      // 메시지: 게이트 안내와 결과가 서버에 기록되므로 다시 읽어야 이력이 보인다
      // 저장소 설정·프로젝트: REPOSITORY_BINDING 승인이 저장소를 붙인다
      void queryClient.invalidateQueries({
        queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, targetConversationId],
      });
      void queryClient.invalidateQueries({ queryKey: ['project-repository-settings'] });
      void queryClient.invalidateQueries({ queryKey: ['project-detail'] });
      // DEPLOYMENT 승인이면 이 시점부터 배포가 돈다. 개요를 다시 읽어야 IN_PROGRESS 를
      // 보고 폴링이 켜지고, 그래야 웹훅이 나중에 붙이는 완료 안내를 받는다
      void queryClient.invalidateQueries({ queryKey: ['project-overview'] });
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      onConversationActivity?.(targetConversationId);
    },
    onError: (error, variables) => {
      // onMutate에서 낙관적으로 감췄던 승인을 되돌린다 — 실패했으면 아직 대기 중이다.
      // 다만 방치 승인은 서버가 TTL로 CANCELLED 처리하므로(409) 상태를 다시 읽는다.
      // PENDING이면 카드가 돌아오고, 이미 닫혔으면 사라진다
      setPendingApprovalId(variables.approvalId);
      void queryClient.invalidateQueries({ queryKey: ['approval-detail'] });

      /*
        상한까지 기다렸지만 작업은 아직 돈다 — 실패가 아니다. 오류 알림을 띄우면
        성공할 작업을 실패로 오해하게 된다. 조용히 알리고 물러난다. 결과는 서버가
        채팅에 적고 메시지 목록 폴링이 가져온다.
      */
      if (error instanceof AgentPollTimeoutError) {
        setIsAssistantReplying(false);
        setProgressTask(null);
        setRunningTaskId(null);
        setLongRunningBaseline(serverMessages?.length ?? 0);
        return;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        setIsAssistantReplying(false);
        setProgressTask(null);
        setRunningTaskId(null);
        return;
      }

      setAlertMessage(formatApiErrorMessage(error));
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      // 서버가 코드로 원인을 알려줬으면 그것으로 바로 진입점을 띄운다
      if (!dispatchApiErrorAction(error)) {
        // 코드가 없으면 예전 방식으로 — 저장소 연결 승인은 서버가 GitHub 을 호출하므로
        // 사용자 정보를 다시 읽어 재인증이 필요한지 확인한다
        void refreshUserInfoInBackground();
      }
    },
  });

  /**
   * 에이전트 질문에 대한 답을 제출한다.
   *
   * 새 메시지가 아니라 `POST /agent/tasks/{taskId}/input` 으로 보낸다 — 서버는 이 값을
   * 받아 멈춰 있던 태스크를 그 자리에서 이어 달리게 한다(WAITING_INPUT → QUEUED).
   * 새 메시지로 보내면 새 태스크가 생기고 원래 태스크는 영영 멈춰 있는다.
   *
   * 서버는 이 답을 채팅에 남기지 않는다(이벤트만 남긴다). 그래서 여기서 화면에 얹어
   * 준다 — 안 그러면 대화가 "질문 → (공백) → 결과" 로 읽힌다.
   */
  const submitInputMutation = useMutation({
    mutationFn: async ({ taskId, value }: { taskId: string; value: string }) => {
      await postAgentTaskInput(taskId, { value });
      setRunningTaskId(taskId);

      /*
        답이 닿자마자 대화를 다시 읽는다.

        서버가 답을 대화에 남기므로(#305) 화면이 그것을 그대로 쓰면 되는데, 메시지 목록은
        기본 15초 주기라 그냥 두면 **답한 뒤 최대 15초 동안 자기가 뭘 보냈는지 화면에서
        사라진다.** 폴링이 끝난 뒤(=작업이 다 끝난 뒤) 무효화하는 것으로는 늦다 — 그
        사이가 몇 분이다.
      */
      if (conversationId != null) {
        void queryClient.invalidateQueries({
          queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, conversationId],
        });
      }

      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;
      const task = await pollAgentTask(taskId, {
        signal: controller.signal,
        onProgress: captureTaskProgress,
      });

      const pendingApprovalId = await resolvePendingApprovalId(task, projectId, conversationId);
      return { task, taskId, pendingApprovalId };
    },
    onMutate: () => {
      /*
        답을 말풍선으로 미리 얹지 않는다.

        예전에는 여기서 사용자 메시지를 하나 만들어 붙였다. 서버가 답을 대화에 안 남기던
        때라 그러지 않으면 대화가 "질문 → (공백) → 결과" 로 읽혔기 때문이다. 지금은 서버가
        남긴다(#305) — 그런데 문구가 다르고("답변을 반영해 작업을 이어갑니다: X") role 도
        달라서 병합에 안 걸린다. 그대로 두면 같은 답이 두 줄로 보인다.

        서술은 서버 하나가 소유한다는 이 파일의 규칙을 그대로 따른다. 대신 답이 닿는 즉시
        대화를 다시 읽어(mutationFn 참고) 빈 구간을 짧게 만든다.
      */
      setInput('');
      setIsAssistantReplying(true);
      setLongRunningBaseline(null);
      setRetryableTask(null);
      setProgressTask(null);
      // 답을 보냈으니 대기 상태를 푼다. 이어 달리다 또 물으면 onSuccess 가 다시 세운다
      setAwaitingInput(null);
    },
    onSuccess: ({ task, taskId, pendingApprovalId }) => {
      if (conversationId == null) return;

      rememberConversationTaskId(conversationId, taskId);
      setPendingApprovalId(pendingApprovalId);
      setAwaitingInput(toAwaitingInput(task, task.taskId));
      setRetryableTask(isRetryableFailure(task) ? task : null);

      void queryClient.invalidateQueries({
        queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, conversationId],
      });
      void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      void queryClient.invalidateQueries({ queryKey: ['project-detail'] });
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      onConversationActivity?.(conversationId);
    },
    onError: (error, variables) => {
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);

      if (error instanceof DOMException && error.name === 'AbortError') return;

      // 상한까지 기다렸지만 아직 도는 중 — 실패가 아니다. 답은 이미 서버가 받았다
      if (error instanceof AgentPollTimeoutError) {
        setLongRunningBaseline(serverMessages?.length ?? 0);
        return;
      }

      /*
        태스크가 더 이상 입력을 기다리지 않으면(취소됐거나 만료) 서버가 400·404 를 준다.
        그때는 사용자가 적은 말을 잃지 않도록 평범한 메시지로 다시 보낸다 — 답이 갈 곳이
        없어졌다고 사용자에게 되돌려주면 같은 말을 두 번 적게 된다.
      */
      setAwaitingInput(null);
      sendMessageMutation.mutate(variables.value);
    },
  });

  /**
   * 실패한 작업을 이어서 다시 돌린다.
   *
   * 서버는 저장된 plan 의 실패한 스텝부터 재개한다 — 요청을 처음부터 다시 보내는 것과
   * 다르다. 재시도가 등록되면(202) 태스크가 다시 큐에 들어가므로 같은 taskId 를 계속
   * 폴링하면 된다.
   */
  const retryMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await postAgentTaskRetry(taskId);
      setRunningTaskId(taskId);

      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;
      const task = await pollAgentTask(taskId, {
        signal: controller.signal,
        onProgress: captureTaskProgress,
      });

      const pendingApprovalId = await resolvePendingApprovalId(task, projectId, conversationId);
      return { task, taskId, pendingApprovalId };
    },
    onMutate: () => {
      setRetryableTask(null);
      setIsAssistantReplying(true);
      setLongRunningBaseline(null);
      setProgressTask(null);
    },
    onSuccess: ({ task, taskId, pendingApprovalId }) => {
      if (conversationId == null) return;

      rememberConversationTaskId(conversationId, taskId);
      setPendingApprovalId(pendingApprovalId);
      setAwaitingInput(toAwaitingInput(task, task.taskId));
      // 또 실패하면 카드를 다시 띄운다. 남은 시도 횟수가 줄어든 채로 온다
      setRetryableTask(isRetryableFailure(task) ? task : null);

      void queryClient.invalidateQueries({
        queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, conversationId],
      });
      void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      void queryClient.invalidateQueries({ queryKey: ['project-detail'] });
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      onConversationActivity?.(conversationId);
    },
    onError: (error, taskId) => {
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);

      if (error instanceof DOMException && error.name === 'AbortError') return;

      if (error instanceof AgentPollTimeoutError) {
        setLongRunningBaseline(serverMessages?.length ?? 0);
        return;
      }

      /*
        409 는 정상 경로다. `retryable` 은 읽는 시점에 따라 잠깐 낡을 수 있어서(서버가
        그렇게 밝혀 두었다), 버튼을 눌렀을 때 이미 재시도가 막혀 있을 수 있다 — 승인이
        새로 생겼거나 시도 횟수를 다 썼거나. 그때는 서버 문구를 그대로 보여주고 카드를
        되살리지 않는다. 다시 눌러도 같은 결과라 버튼을 남기면 사용자만 헛돈다.
      */
      setAlertMessage(formatApiErrorMessage(error));
      void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      // 승인이 생겨서 막혔을 수 있다 — 그 카드를 띄워 주면 사용자가 나아갈 길이 생긴다
      void (async () => {
        try {
          const approvals = await getProjectApprovalList(projectId);
          const pending = approvals.find(
            (approval) =>
              approval.status === 'PENDING' &&
              (approval.taskId === taskId ||
                (conversationId != null && approval.conversationId === conversationId)),
          );
          if (pending) setPendingApprovalId(pending.approvalId);
        } catch {
          // 못 찾으면 그냥 둔다 — 없는 승인을 띄우는 것보다 낫다
        }
      })();
    },
  });

  /**
   * 도는 작업을 멈춘다.
   *
   * 서버는 태스크를 CANCELLED 로 닫고 **딸린 PENDING 승인도 함께 취소한다** — 그래서
   * 승인 카드가 남아 있으면 안 된다. 그리고 "작업을 취소했습니다."를 채팅에 남기므로
   * 여기서 따로 메시지를 만들지 않는다.
   *
   * 확인 대화상자는 두지 않았다. 되돌릴 수 없는 것도, 돈이 드는 것도 아니고 — 다시
   * 보내면 그만이다. 잘못 보낸 걸 알아챈 사용자를 한 번 더 붙잡을 이유가 없다.
   */
  /*
    새로고침하면 진행 중이던 태스크를 통째로 잊는다.

    화면은 그 기억을 메모리에만 들고 있어서, 페이지를 다시 열면 답을 기다리던 질문도
    취소 버튼도 사라진다. 그러면 그 태스크는 **영원히 대기로 남는다** — 새로 적은 글은
    새 태스크가 되고, 원래 것은 아무도 못 건드린다. 되묻기가 생기면서 이 자리에 설 일이
    많아졌다.

    그래서 마운트할 때 서버에 묻는다. 서버는 안 끝난 것만 주므로 받은 것만 믿으면 되고,
    낡은 폼이 뜰 걱정이 없다.

    실패해도 조용히 넘어간다 — 복구는 있으면 좋은 것이지, 없다고 화면을 막을 일이 아니다.
  */
  useEffect(() => {
    if (conversationId == null) return;
    let cancelled = false;

    void (async () => {
      try {
        const active = await getConversationActiveTask(conversationId);
        if (cancelled || !active) return;

        const task = await getAgentTask(active.taskId);
        if (cancelled) return;

        rememberConversationTaskId(conversationId, task.taskId);
        setRunningTaskId(task.taskId || null);
        setAwaitingInput(toAwaitingInput(task, task.taskId));
        // 새로고침해도 무엇을 정했는지는 남아 있어야 한다 — 서버가 들고 있는 기록이라
        // 다시 물으면 그대로 온다. 진행 문구는 세우지 않는다: 여기서 되살리는 것은
        // 기록이지 "지금 도는 중" 이 아니다
        captureAnsweredClarification(task);
      } catch {
        // 못 되살려도 대화는 그대로 쓸 수 있다
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, restoreToken]);

  const cancelTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteAgentTask(taskId),
    onSuccess: () => {
      // 로컬 폴링을 끊는다. mutationFn 이 아니라 여기서 끊는 이유는, 서버가 실제로
      // 받아들인 뒤에 멈춰야 "화면만 멈추고 작업은 계속 도는" 상태가 안 생기기 때문이다
      pollAbortRef.current?.abort();
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      setLongRunningBaseline(null);
      setRetryableTask(null);
      setAwaitingInput(null);
      setAnsweredClarification(null);
      // 서버가 딸린 승인도 함께 취소했다 — 카드를 남기면 이미 닫힌 승인을 누르게 된다
      setPendingApprovalId(null);

      if (conversationId != null) {
        void queryClient.invalidateQueries({
          queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, conversationId],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
    },
    onError: (error) => {
      // 404 는 이미 끝났거나 취소된 것이다 — 사용자가 원한 결과와 같으니 조용히 정리한다
      pollAbortRef.current?.abort();
      setIsAssistantReplying(false);
      setProgressTask(null);
      setRunningTaskId(null);
      if (import.meta.env.DEV) {
        console.debug('[agent] 취소 실패 — 이미 끝난 작업일 수 있습니다', error);
      }
    },
  });

  const isSending = sendMessageMutation.isPending;
  const isInputLocked =
    isSending || isAssistantReplying || submitInputMutation.isPending || retryMutation.isPending;

  // 세 경로 모두 mutationFn 안에서 태스크가 끝날 때까지 폴링하므로, 이 값이 참인 동안이 곧 작업 구간이다
  const isAgentTaskActive = isInputLocked || decideApprovalMutation.isPending;

  useEffect(() => {
    onAgentTaskActiveChange?.(isAgentTaskActive);
  }, [isAgentTaskActive, onAgentTaskActiveChange]);

  // 작업 중에 패널이 사라지면 부모가 참인 채로 남아 폴링이 멈추지 않는다
  useEffect(() => () => onAgentTaskActiveChange?.(false), [onAgentTaskActiveChange]);

  const showMessageSkeletons = isMessagesLoading && displayMessages.length === 0;
  const showWelcome =
    !showMessageSkeletons &&
    isNewConversation &&
    !isSending &&
    !isAssistantReplying &&
    displayMessages.length === 0;

  const handleSend = () => {
    const content = input.trim();
    if (!content || isInputLocked) return;

    // 에이전트가 되물어 놓은 상태면 이건 새 요청이 아니라 그 질문의 답이다
    if (awaitingInputTaskId) {
      submitInputMutation.mutate({ taskId: awaitingInputTaskId, value: content });
      return;
    }

    sendMessageMutation.mutate(content);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleAlertOpenChange = (open: boolean) => {
    if (!open) setAlertMessage(null);
  };

  const handleDecideApproval = (action: 'approve' | 'reject', payload?: Record<string, string>) => {
    if (decideApprovalMutation.isPending || isAssistantReplying || !activeApproval) {
      return;
    }

    const taskId = activeApproval.taskId?.trim() || readConversationTaskId(conversationId);
    if (!taskId) {
      setAlertMessage('이어서 진행할 작업 ID를 찾지 못했습니다.');
      return;
    }

    decideApprovalMutation.mutate({
      approvalId: activeApproval.approvalId,
      action,
      taskId,
      payload,
    });
  };

  useEffect(() => {
    const content = initialPrompt?.trim();
    if (!content || !shouldSendHomeAgentPromptOnce(content)) return;

    sendMessageMutation.mutate(content, {
      onError: () => clearHomeAgentPromptSendGuard(content),
    });
    // 홈에서 넘어온 프롬프트는 마운트 시 한 번만 전송한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  useEffect(() => {
    return () => {
      pollAbortRef.current?.abort();
    };
  }, []);

  return (
    <>
      <div role="tabpanel" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {showWelcome ? (
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-3 text-[13px] leading-relaxed text-[#475569]">
              안녕하세요! <span className="font-semibold text-[#0f172a]">{projectName}</span>{' '}
              워크스페이스입니다. 메시지를 입력하면 대화가 시작됩니다.
            </div>
          ) : null}
          {showMessageSkeletons
            ? [0, 1, 2, 3].map((item) => (
                <AssistantReplySkeleton key={`message-skeleton-${item}`} />
              ))
            : displayMessages.map((message) => (
                <MessageBubble key={message.messageId} message={message} />
              ))}
          {/*
            무엇을 정했는지. 답하는 폼이 사라진 자리를 대신하는 **읽기 전용** 기록이다.

            메시지 다음, 결정할 것들(승인·재시도) 앞에 둔다 — 이건 방금 지나온 일이고
            아래 둘은 지금 눌러야 할 일이라, 순서가 곧 읽는 순서가 된다.
          */}
          {answeredClarification ? (
            <AgentAnsweredClarificationCard
              key={answeredClarification.taskId}
              answered={answeredClarification.answered}
            />
          ) : null}
          {activeApproval ? (
            <AgentApprovalCard
              key={activeApproval.approvalId}
              approval={activeApproval}
              isBusy={decideApprovalMutation.isPending}
              onApprove={(payload) => handleDecideApproval('approve', payload)}
              onReject={() => handleDecideApproval('reject')}
            />
          ) : null}
          {/*
            승인 카드와 같은 자리에 둔다 — 둘 다 "지금 사용자가 결정할 일"이고, 대화의
            마지막에 있어야 실패 메시지 바로 아래에서 읽힌다.
          */}
          {retryableTask ? (
            <AgentRetryCard
              key={retryableTask.taskId}
              task={retryableTask}
              isBusy={retryMutation.isPending}
              onRetry={() => retryMutation.mutate(retryableTask.taskId)}
              onDismiss={() => setRetryableTask(null)}
            />
          ) : null}
          {isSending || isAssistantReplying ? (
            <AssistantReplySkeleton
              progressLabel={describeTaskProgress(progressTask)}
              events={taskEvents}
              onCancel={
                runningTaskId && !cancelTaskMutation.isPending
                  ? () => cancelTaskMutation.mutate(runningTaskId)
                  : undefined
              }
            />
          ) : null}
          <div
            key={`${displayMessages.length}-${isAssistantReplying ? 'replying' : 'idle'}`}
            ref={(node) => {
              node?.scrollIntoView({ block: 'end' });
            }}
            aria-hidden="true"
            className="h-px shrink-0"
          />
        </div>
      </div>

      <footer className="border-t border-[#f1f5f9] p-3">
        {/*
          지금 적는 말이 새 요청이 아니라 위 질문의 답이라는 것을 알린다. 이 표시가 없으면
          사용자는 평소처럼 말을 걸었다고 생각하는데, 실제로는 멈춰 선 작업이 이어 달린다
        */}
        {isLongRunning ? (
          /*
            실패 알림(모달)이 아니라 조용한 줄로 둔다. 작업은 돌고 있고 사용자가 할 일도
            없다 — 모달로 막아 세우면 실패한 것처럼 읽힌다.
          */
          <div className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-[#f8fafc] px-2.5 py-1.5">
            <p className="text-[12px] leading-relaxed text-[#64748b]">
              작업이 오래 걸리고 있습니다. 계속 진행 중이며, 끝나면 결과가 여기에 올라옵니다.
            </p>
            <button
              type="button"
              onClick={() => setLongRunningBaseline(null)}
              className="shrink-0 cursor-pointer text-[12px] font-medium text-[#94a3b8] hover:text-[#64748b]"
            >
              닫기
            </button>
          </div>
        ) : null}
        {/*
          되묻기가 선택형이면 고르게 하고, 아니면 지금까지처럼 채팅창으로 답하게 둔다.

          선택형인데도 채팅창은 계속 살아 있다 — 적어서 보내도 같은 태스크의 답으로 간다.
          고르는 쪽이 서버가 아는 이름과 어긋나지 않아 편할 뿐, 막을 이유는 없다.
        */}
        {cloudConnectRequest ? null : awaitingInput &&
          canRenderAsChoices(awaitingInput.clarification) ? (
          <AgentClarificationForm
            key={awaitingInput.taskId}
            clarification={awaitingInput.clarification as TaskClarification}
            isSubmitting={submitInputMutation.isPending}
            onSubmit={(value) =>
              submitInputMutation.mutate({ taskId: awaitingInput.taskId, value })
            }
            onCancel={() => cancelTaskMutation.mutate(awaitingInput.taskId)}
          />
        ) : awaitingInputTaskId ? (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-[#faf5ff] px-2.5 py-1.5">
            <p className="text-[12px] font-medium text-[#6d28d9]">
              에이전트가 답을 기다리고 있습니다. 여기에 적으면 하던 작업을 이어서 진행합니다.
            </p>
            <button
              type="button"
              onClick={() => cancelTaskMutation.mutate(awaitingInputTaskId)}
              disabled={cancelTaskMutation.isPending}
              className="shrink-0 cursor-pointer text-[12px] font-medium text-[#a78bfa] underline underline-offset-2 hover:text-[#7c3aed] disabled:cursor-not-allowed"
            >
              작업 취소
            </button>
          </div>
        ) : null}
        {/*
          쓸 수 있는 제공자가 둘 이상일 때만 보여준다. 목록은 서버가 apiKey 가 설정된
          것만 담아 주므로, 여기 뜨는 것은 전부 실제로 쓸 수 있다 — 골랐는데 실패하는
          항목이 없다.

          크레딧이 없는 제공자는 서버도 미리 알 수 없어 고른 뒤에야 503 으로 드러난다.
          그때는 오류 안내가 "다른 제공자를 골라 다시 보내보세요" 라고 말하는데, 이
          셀렉트가 그 말이 가리키는 자리다.
        */}
        {canChooseProvider ? (
          <label className="mb-2 flex items-center gap-2">
            <span className="text-[12px] text-[#94a3b8]">AI</span>
            <select
              value={selectedProvider}
              disabled={isInputLocked}
              onChange={(event) => setSelectedProvider(event.target.value)}
              className="h-7 rounded-lg border border-[#e2e8f0] bg-white px-2 text-[12px] text-[#334155] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">기본값</option>
              {providerOptions.map((option) => (
                <option key={option.provider} value={option.provider}>
                  {option.provider}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestedPrompts.map(({ label, prompt }) => (
            <button
              key={label}
              type="button"
              disabled={isInputLocked}
              onClick={() => setInput(prompt)}
              className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#475569] transition hover:border-[#c4b5fd] hover:text-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 focus-within:border-[#a5b4fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6366f1]/15">
          <textarea
            rows={2}
            value={input}
            disabled={isInputLocked}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={awaitingInputTaskId ? '위 질문에 답해 주세요' : '메시지를 입력하세요'}
            className="min-h-[40px] flex-1 resize-none bg-transparent text-[13px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] disabled:opacity-60"
          />
          <button
            type="button"
            disabled={!input.trim() || isInputLocked}
            onClick={handleSend}
            className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#7c3aed] text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="전송"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </footer>

      <AppAlertDialog
        open={alertMessage != null}
        message={alertMessage ?? ''}
        onOpenChange={handleAlertOpenChange}
      />
    </>
  );
}

type MessageBubbleProps = {
  message: ConversationMessage;
};

const MESSAGE_URL_REGEX = /(https?:\/\/[^\s]+)/g;

function normalizeMessageUrl(url: string) {
  return url.replace(/[.,;:!?)]+$/, '');
}

function linkifyMessageContent(content: string, linkClassName: string) {
  return content.split(MESSAGE_URL_REGEX).map((part, index) => {
    if (!part.startsWith('http://') && !part.startsWith('https://')) {
      return part;
    }

    const href = normalizeMessageUrl(part);

    return (
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {part}
      </a>
    );
  });
}

/**
 * 두 곳에서 쓴다 — 메시지 목록을 처음 읽는 동안과, 에이전트가 도는 동안.
 * 앞쪽은 곧 끝나므로 문구가 없고, 뒤쪽은 몇 분 걸릴 수 있어 지금 무슨 단계인지 적는다.
 */
function AssistantReplySkeleton({
  progressLabel,
  events = [],
  onCancel,
}: {
  progressLabel?: string;
  events?: AgentTaskEvent[];
  onCancel?: () => void;
}) {
  return (
    <div className="px-3.5 py-3">
      {progressLabel ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          {/*
            aria-live 로 읽어준다. 몇 분 걸리는 작업이라 화면을 계속 보고 있지 않은
            사용자에게도 단계가 바뀌는 것이 전달돼야 한다
          */}
          <p aria-live="polite" className="text-[12px] font-medium text-[#7c3aed]">
            {progressLabel}
          </p>
          {/* 멈출 방법은 기다리는 자리에 있어야 한다 — 다른 화면을 찾아다니게 하지 않는다 */}
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 cursor-pointer text-[12px] font-medium text-[#94a3b8] underline underline-offset-2 hover:text-[#64748b]"
            >
              작업 중단
            </button>
          ) : null}
        </div>
      ) : null}
      {/*
        지나온 단계와 지금 도는 단계. 서버가 이벤트마다 사용자 말로 문장을 적어 보내므로
        그대로 보여준다 — FE 가 다시 서술하면 서버 문구와 두 벌이 된다.
      */}
      <AgentTaskTimeline events={events} />
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className="h-3 w-[78%] animate-pulse rounded bg-[#e2e8f0]" />
        <div className="h-3 w-[92%] animate-pulse rounded bg-[#e2e8f0]" />
        <div className="h-3 w-[64%] animate-pulse rounded bg-[#f1f5f9]" />
      </div>
    </div>
  );
}

/**
 * 어시스턴트 줄의 무게별 모양.
 *
 * 실패만 배경까지 준다 — 대화를 훑을 때 걸려야 하는 유일한 줄이라서다. 흐린 것은
 * 색만 낮춘다: 진행 안내는 안 읽어도 되지만 찾으면 읽을 수는 있어야 한다.
 */
const ASSISTANT_TONE_CLASS = {
  default: 'px-3.5 py-3 text-[#475569]',
  muted: 'px-3.5 py-3 text-[#94a3b8]',
  failed: 'rounded-xl border-l-2 border-[#fca5a5] bg-[#fef2f2] px-3.5 py-3 text-[#b91c1c]',
} as const;

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  // 종류는 서버가 알려준 것만 믿는다. 모르는 값이면 지금까지와 똑같이 그려진다
  const tone = isAssistant ? toMessageTone(message.kind) : 'default';
  const linkClassName = isUser
    ? 'underline underline-offset-2 hover:text-[#5b21b6]'
    : tone === 'failed'
      ? 'underline underline-offset-2 hover:text-[#7f1d1d]'
      : 'text-[#7c3aed] underline underline-offset-2 hover:text-[#6d28d9]';

  return (
    <div className={isUser ? 'ml-6' : undefined}>
      <div
        className={`text-[13px] leading-relaxed ${
          isUser
            ? 'rounded-xl border border-[#c4b5fd] bg-[#ede9fe] px-3.5 py-3 text-[#4c1d95]'
            : isAssistant
              ? ASSISTANT_TONE_CLASS[tone]
              : 'rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-3 text-[#64748b]'
        }`}
      >
        <p className="whitespace-pre-wrap">
          {linkifyMessageContent(message.content, linkClassName)}
        </p>
      </div>
    </div>
  );
}

export default AgentConversationPanel;
