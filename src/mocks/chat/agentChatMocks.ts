import type { ConversationMessage } from '@/types/chat.type';
import {
  readSessionMessages,
  writeSessionMessages,
} from '@/components/layout/project/agentChat.utils';

export type MessageReviewStatus = 'pending' | 'accepted' | 'rejected';

export const MOCK_NEW_PORTFOLIO_USER_PROMPT =
  'React + Vite로 투두 앱 만들어줘. 할 일 추가, 삭제, 완료 체크 기능 포함해줘.';

export const MOCK_REPO_EDIT_USER_PROMPT =
  '포트폴리오 맨 하단에 감사하다는 의미를 담은 섹션 추가해줘.';

type MockScriptStep = {
  templateMessageId: number;
  content: string;
  tokenCount: number;
  requiresApproval: boolean;
};

const MOCK_ASSISTANT_REPLY_DELAY_MS = 700;
const MOCK_CODE_WRITING_DELAY_MS = 2500;
const MOCK_SAVE_PROMPT_DELAY_MS = 400;
const MOCK_DEPLOY_DELAY_MS = 1500;

/** GitHub Pages 배포 수락 단계 — 수락 시 파이프라인 실행 */
export const DEPLOY_APPROVAL_TEMPLATE_IDS = new Set([10043, 20043]);

const CODE_COMPLETE_COMMIT_TEMPLATE_ID = 1002;

const MOCK_CODE_COMPLETE_COMMIT_STEP: MockScriptStep = {
  templateMessageId: CODE_COMPLETE_COMMIT_TEMPLATE_ID,
  content:
    'React + Vite 투두 앱 생성을 완료했습니다!\n\n**구현된 기능**\n- 할 일 추가 (Enter 키 지원)\n- 완료 체크 / 해제\n- 항목 삭제\n- 전체 / 활성 / 완료 필터\n\n프리뷰를 확인해보세요! 변경된 코드를 커밋할까요?',
  tokenCount: 842,
  requiresApproval: true,
};

const REPO_EDIT_ANALYZING_TEMPLATE_ID = 2002;
const REPO_EDIT_ANALYZE_COMPLETE_TEMPLATE_ID = 2003;
const REPO_EDIT_COMPLETE_COMMIT_TEMPLATE_ID = 2004;
const REPO_EDIT_GITHUB_PAGES_DEPLOY_TEMPLATE_ID = 20043;
const REPO_EDIT_DEPLOY_START_TEMPLATE_ID = 20044;
const REPO_EDIT_DEPLOY_COMPLETE_TEMPLATE_ID = 20045;

const MOCK_REPO_EDIT_DEPLOY_URL = 'https://dldnsgkr.github.io/portfolio_fix';

/** 기존 레포 수정 대화 (conversation 예: 2) */
const MOCK_REPO_EDIT_SCRIPT: MockScriptStep[] = [
  {
    templateMessageId: REPO_EDIT_ANALYZING_TEMPLATE_ID,
    content: '코드를 분석하고 있습니다. 잠시만 기다려 주세요...',
    tokenCount: 28,
    requiresApproval: false,
  },
  {
    templateMessageId: REPO_EDIT_ANALYZE_COMPLETE_TEMPLATE_ID,
    content: '분석을 완료했습니다. 감사 섹션 추가를 시작합니다...',
    tokenCount: 32,
    requiresApproval: false,
  },
  {
    templateMessageId: REPO_EDIT_COMPLETE_COMMIT_TEMPLATE_ID,
    content:
      '감사 섹션 추가를 완료했습니다!\n\n방문해주신 분들에 대한 감사 메시지를 포트폴리오 맨 아래에 자연스럽게 담았습니다. 프리뷰에서 확인해보세요! 변경된 코드를 커밋할까요?',
    tokenCount: 521,
    requiresApproval: true,
  },
];

const MOCK_REPO_EDIT_GITHUB_PAGES_DEPLOY_PROMPT_STEP: MockScriptStep = {
  templateMessageId: REPO_EDIT_GITHUB_PAGES_DEPLOY_TEMPLATE_ID,
  content: '커밋이 완료됐습니다!\n\nGitHub Pages에 배포할까요?',
  tokenCount: 38,
  requiresApproval: true,
};

const MOCK_REPO_EDIT_DEPLOY_START_STEP: MockScriptStep = {
  templateMessageId: REPO_EDIT_DEPLOY_START_TEMPLATE_ID,
  content: '변경 사항을 GitHub Pages에 배포하고 있습니다. 잠시만 기다려 주세요...',
  tokenCount: 42,
  requiresApproval: false,
};

const MOCK_REPO_EDIT_DEPLOY_COMPLETE_STEP: MockScriptStep = {
  templateMessageId: REPO_EDIT_DEPLOY_COMPLETE_TEMPLATE_ID,
  content: `배포를 완료했습니다!\n\n**배포 정보**\n- 배포 URL: ${MOCK_REPO_EDIT_DEPLOY_URL}\n- 상태: 성공\n\n감사 섹션이 반영된 포트폴리오를 확인해보세요!`,
  tokenCount: 387,
  requiresApproval: false,
};

const REPO_CREATED_ACK_TEMPLATE_ID = 10041;
const REPO_COMMIT_COMPLETE_TEMPLATE_ID = 10042;
const COMMIT_IN_PROGRESS_TEMPLATE_ID = 10049;

const MOCK_REPO_COMMIT_COMPLETE_STEP: MockScriptStep = {
  templateMessageId: REPO_COMMIT_COMPLETE_TEMPLATE_ID,
  content: '레포지토리 생성이 완료됐습니다. 코드를 커밋할게요.',
  tokenCount: 32,
  requiresApproval: false,
};

const MOCK_COMMIT_IN_PROGRESS_STEP: MockScriptStep = {
  templateMessageId: COMMIT_IN_PROGRESS_TEMPLATE_ID,
  content: '커밋하고 있습니다...',
  tokenCount: 14,
  requiresApproval: false,
};

const GITHUB_PAGES_DEPLOY_TEMPLATE_ID = 10043;

const MOCK_GITHUB_PAGES_DEPLOY_PROMPT_STEP: MockScriptStep = {
  templateMessageId: GITHUB_PAGES_DEPLOY_TEMPLATE_ID,
  content: '커밋이 완료됐습니다!\n\nGitHub Pages에 배포할까요?',
  tokenCount: 38,
  requiresApproval: true,
};

const MOCK_GITHUB_PAGES_DEPLOY_START_STEP: MockScriptStep = {
  templateMessageId: 10044,
  content: 'GitHub Pages 배포를 시작합니다. 잠시만 기다려 주세요...',
  tokenCount: 38,
  requiresApproval: false,
};

const DEPLOY_COMPLETE_TEMPLATE_ID = 10045;
const DOMAIN_METHOD_PROMPT_TEMPLATE_ID = 10046;
const DOMAIN_CONNECT_START_TEMPLATE_ID = 10047;
const DOMAIN_CONNECT_COMPLETE_TEMPLATE_ID = 10048;

const MOCK_DOMAIN_CONNECT_DELAY_MS = 3000;

const conversationRepoNames = new Map<number, string>();

function buildDeployCompleteStep(repoName: string): MockScriptStep {
  return {
    templateMessageId: DEPLOY_COMPLETE_TEMPLATE_ID,
    content: `GitHub Pages 배포를 완료했습니다!\n\n**배포 정보**\n- 배포 URL: https://dldnsgkr.github.io/${repoName}\n- 상태: 성공\n\n배포가 반영되기까지 수 분이 소요될 수 있습니다. 이후 위 URL로 접속하시면 투두 앱을 확인하실 수 있습니다.\n\n도메인 연결도 진행할까요?`,
    tokenCount: 614,
    requiresApproval: true,
  };
}

const MOCK_DOMAIN_METHOD_PROMPT_STEP: MockScriptStep = {
  templateMessageId: DOMAIN_METHOD_PROMPT_TEMPLATE_ID,
  content:
    '도메인 연결 방식을 선택해 주세요.\n\n#0 managed_subdomain — Dvely에서 제공하는 서브도메인을 사용합니다. (예: todo.dvely.app)\n#1 purchasable_domain — 새 도메인을 구매해 연결합니다. (예: todo.com)\n#2 custom_domain — 이미 보유한 도메인을 직접 연결합니다. (예: todo.qeploy.com)',
  tokenCount: 112,
  requiresApproval: false,
};

function resolveDomainFromChoice(choice: string, repoName: string): string {
  const normalized = choice.trim().toLowerCase();

  if (normalized === '0' || normalized.includes('managed')) {
    return `${repoName}.dvely.app`;
  }

  if (normalized === '1' || normalized.includes('purchase')) {
    return 'todo.com';
  }

  return 'todo.qeploy.com';
}

const MOCK_APPROVAL_FOLLOWUPS: Record<number, MockScriptStep> = {
  [DEPLOY_COMPLETE_TEMPLATE_ID]: MOCK_DOMAIN_METHOD_PROMPT_STEP,
};

const FALLBACK_ASSISTANT_REPLY =
  '알겠습니다. 요청하신 내용을 반영해 프리뷰에 적용할게요. 잠시만 기다려 주세요.';

let localMessageId = -1;
const pendingReplyTimers = new Map<number, number>();
const completedReplyUserMessageIds = new Set<number>();
const messageReviewStatusById = new Map<number, MessageReviewStatus>();
const messageTemplateIdByLocalId = new Map<number, number>();
const portfolioScriptStartedConversationIds = new Set<number>();
const repoEditScriptStartedConversationIds = new Set<number>();

type MockAssistantReplyListener = (conversationId: number, messages: ConversationMessage[]) => void;

let mockAssistantReplyListener: MockAssistantReplyListener | null = null;

export function setMockAssistantReplyListener(listener: MockAssistantReplyListener | null) {
  mockAssistantReplyListener = listener;
}

export function isMockAssistantReplyPending(conversationId: number): boolean {
  return pendingReplyTimers.has(conversationId);
}

export function getMessageReviewStatus(messageId: number): MessageReviewStatus | null {
  return messageReviewStatusById.get(messageId) ?? null;
}

export function setMessageReviewStatus(messageId: number, status: MessageReviewStatus) {
  messageReviewStatusById.set(messageId, status);
}

export function isDeployApprovalMessage(messageId: number): boolean {
  const templateMessageId = messageTemplateIdByLocalId.get(messageId);
  return templateMessageId !== undefined && DEPLOY_APPROVAL_TEMPLATE_IDS.has(templateMessageId);
}

export function hasPendingMessageReview(messages: ConversationMessage[]): boolean {
  return messages.some(
    (message) =>
      message.role === 'assistant' && messageReviewStatusById.get(message.messageId) === 'pending',
  );
}

export function createLocalMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
  tokenCount = role === 'assistant' ? 96 : 0,
): ConversationMessage {
  const messageId = localMessageId;
  localMessageId -= 1;

  return {
    messageId,
    conversationId,
    role,
    content,
    tokenCount,
    createdAt: new Date().toISOString(),
  };
}

function isRepoEditRequest(content: string): boolean {
  const normalized = content.trim();
  if (normalized === MOCK_REPO_EDIT_USER_PROMPT) return true;

  return /포트폴리오/i.test(normalized) && /(감사|섹션)/.test(normalized);
}

function getLastAssistantTemplateId(conversationId: number): number | undefined {
  const messages = readSessionMessages(conversationId);
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'assistant') {
      return messageTemplateIdByLocalId.get(messages[index].messageId);
    }
  }
  return undefined;
}

function isAwaitingDomainMethodSelection(conversationId: number): boolean {
  return getLastAssistantTemplateId(conversationId) === DOMAIN_METHOD_PROMPT_TEMPLATE_ID;
}

function handleRepoEditCommitApprovalAccepted(conversationId: number) {
  appendScriptMessage(conversationId, MOCK_COMMIT_IN_PROGRESS_STEP);

  scheduleConversationUpdate(
    conversationId,
    () => {
      appendScriptMessage(conversationId, MOCK_REPO_EDIT_GITHUB_PAGES_DEPLOY_PROMPT_STEP);
    },
    MOCK_ASSISTANT_REPLY_DELAY_MS,
  );
}

function handleCommitApprovalAccepted(conversationId: number) {
  const repoName = conversationRepoNames.get(conversationId) ?? 'my-todo-app';

  appendScriptMessage(conversationId, {
    templateMessageId: REPO_CREATED_ACK_TEMPLATE_ID,
    content: `${repoName} 레포지토리를 생성합니다...`,
    tokenCount: 24,
    requiresApproval: false,
  });

  scheduleConversationUpdate(
    conversationId,
    () => {
      appendScriptMessage(conversationId, MOCK_REPO_COMMIT_COMPLETE_STEP);

      scheduleConversationUpdate(
        conversationId,
        () => {
          appendScriptMessage(conversationId, MOCK_COMMIT_IN_PROGRESS_STEP);

          scheduleConversationUpdate(
            conversationId,
            () => {
              appendScriptMessage(conversationId, MOCK_GITHUB_PAGES_DEPLOY_PROMPT_STEP);
            },
            MOCK_ASSISTANT_REPLY_DELAY_MS,
          );
        },
        MOCK_ASSISTANT_REPLY_DELAY_MS,
      );
    },
    MOCK_ASSISTANT_REPLY_DELAY_MS,
  );
}

function handleDomainMethodSubmit(conversationId: number, content: string) {
  const repoName = conversationRepoNames.get(conversationId) ?? 'my-todo-app';
  const domain = resolveDomainFromChoice(content, repoName);

  scheduleConversationUpdate(
    conversationId,
    () => {
      appendScriptMessage(conversationId, {
        templateMessageId: DOMAIN_CONNECT_START_TEMPLATE_ID,
        content: `${domain} 도메인 연결을 시작합니다...`,
        tokenCount: 28,
        requiresApproval: false,
      });

      scheduleConversationUpdate(
        conversationId,
        () => {
          appendScriptMessage(conversationId, {
            templateMessageId: DOMAIN_CONNECT_COMPLETE_TEMPLATE_ID,
            content: `도메인 연결을 완료했습니다!\n\n**연결 정보**\n- 도메인: ${domain}\n- 연결된 저장소: ${repoName}\n\nDNS 전파는 최대 24시간 소요될 수 있습니다. 이후 ${domain} 으로 접속하시면 투두 앱을 확인하실 수 있습니다.`,
            tokenCount: 398,
            requiresApproval: false,
          });
        },
        MOCK_DOMAIN_CONNECT_DELAY_MS,
      );
    },
    MOCK_ASSISTANT_REPLY_DELAY_MS,
  );
}

function notifyConversationUpdate(conversationId: number) {
  mockAssistantReplyListener?.(conversationId, readSessionMessages(conversationId));
}

function clearPendingReplyTimer(conversationId: number) {
  const timerId = pendingReplyTimers.get(conversationId);
  if (timerId !== undefined) {
    window.clearTimeout(timerId);
    pendingReplyTimers.delete(conversationId);
  }
}

function scheduleConversationUpdate(conversationId: number, deliver: () => void, delayMs: number) {
  clearPendingReplyTimer(conversationId);

  const timerId = window.setTimeout(() => {
    pendingReplyTimers.delete(conversationId);
    deliver();
    notifyConversationUpdate(conversationId);
  }, delayMs);

  pendingReplyTimers.set(conversationId, timerId);
}

function appendScriptMessage(conversationId: number, step: MockScriptStep) {
  const assistantMessage = createLocalMessage(
    conversationId,
    'assistant',
    step.content,
    step.tokenCount,
  );

  messageTemplateIdByLocalId.set(assistantMessage.messageId, step.templateMessageId);

  const next = [...readSessionMessages(conversationId), assistantMessage];
  writeSessionMessages(conversationId, next);

  if (step.requiresApproval) {
    messageReviewStatusById.set(assistantMessage.messageId, 'pending');
  }

  return assistantMessage;
}

function runScriptSteps(
  conversationId: number,
  steps: MockScriptStep[],
  delaysAfterFirst: number[],
) {
  scheduleConversationUpdate(
    conversationId,
    () => {
      appendScriptMessage(conversationId, steps[0]);

      if (steps.length < 2) return;

      scheduleConversationUpdate(
        conversationId,
        () => {
          appendScriptMessage(conversationId, steps[1]);

          if (steps.length < 3) return;

          scheduleConversationUpdate(
            conversationId,
            () => {
              appendScriptMessage(conversationId, steps[2]);
            },
            delaysAfterFirst[1] ?? MOCK_SAVE_PROMPT_DELAY_MS,
          );
        },
        delaysAfterFirst[0] ?? MOCK_CODE_WRITING_DELAY_MS,
      );
    },
    MOCK_ASSISTANT_REPLY_DELAY_MS,
  );
}

function startPortfolioScript(conversationId: number) {
  portfolioScriptStartedConversationIds.add(conversationId);
  conversationRepoNames.set(conversationId, 'my-todo-app');
  scheduleConversationUpdate(
    conversationId,
    () => {
      appendScriptMessage(conversationId, MOCK_CODE_COMPLETE_COMMIT_STEP);
    },
    MOCK_CODE_WRITING_DELAY_MS,
  );
}

function startRepoEditScript(conversationId: number) {
  repoEditScriptStartedConversationIds.add(conversationId);
  runScriptSteps(conversationId, MOCK_REPO_EDIT_SCRIPT, [
    MOCK_CODE_WRITING_DELAY_MS,
    MOCK_SAVE_PROMPT_DELAY_MS,
  ]);
}

function appendFallbackReply(conversationId: number) {
  appendScriptMessage(conversationId, {
    templateMessageId: -1,
    content: FALLBACK_ASSISTANT_REPLY,
    tokenCount: 96,
    requiresApproval: false,
  });
}

export function scheduleMockAssistantReply({
  conversationId,
  userMessageId,
  content,
}: {
  conversationId: number;
  userMessageId: number;
  content: string;
}) {
  if (completedReplyUserMessageIds.has(userMessageId)) {
    notifyConversationUpdate(conversationId);
    return;
  }

  completedReplyUserMessageIds.add(userMessageId);

  if (isRepoEditRequest(content)) {
    if (!repoEditScriptStartedConversationIds.has(conversationId)) {
      startRepoEditScript(conversationId);
    } else {
      scheduleConversationUpdate(
        conversationId,
        () => {
          appendFallbackReply(conversationId);
        },
        MOCK_ASSISTANT_REPLY_DELAY_MS,
      );
    }
    notifyConversationUpdate(conversationId);
    return;
  }

  if (!portfolioScriptStartedConversationIds.has(conversationId)) {
    startPortfolioScript(conversationId);
    notifyConversationUpdate(conversationId);
    return;
  }

  if (isAwaitingDomainMethodSelection(conversationId)) {
    handleDomainMethodSubmit(conversationId, content);
    notifyConversationUpdate(conversationId);
    return;
  }

  scheduleConversationUpdate(
    conversationId,
    () => {
      appendFallbackReply(conversationId);
    },
    MOCK_ASSISTANT_REPLY_DELAY_MS,
  );
  notifyConversationUpdate(conversationId);
}

export async function resolveMockScriptReview(
  conversationId: number,
  messageId: number,
  status: Exclude<MessageReviewStatus, 'pending'>,
  options?: {
    runDeployPipeline?: () => Promise<void>;
  },
) {
  if (status === 'rejected') return;

  const templateMessageId = messageTemplateIdByLocalId.get(messageId);
  if (templateMessageId === undefined) return;

  const isDeployApproval = DEPLOY_APPROVAL_TEMPLATE_IDS.has(templateMessageId);
  const isRepoEditCommitApproval = templateMessageId === REPO_EDIT_COMPLETE_COMMIT_TEMPLATE_ID;
  const isCommitPreviewApproval = templateMessageId === CODE_COMPLETE_COMMIT_TEMPLATE_ID;
  const delayMs =
    isRepoEditCommitApproval || isCommitPreviewApproval
      ? MOCK_ASSISTANT_REPLY_DELAY_MS
      : MOCK_DEPLOY_DELAY_MS;

  if (isCommitPreviewApproval) {
    scheduleConversationUpdate(
      conversationId,
      () => {
        handleCommitApprovalAccepted(conversationId);
      },
      delayMs,
    );
    notifyConversationUpdate(conversationId);
    return;
  }

  if (isRepoEditCommitApproval) {
    scheduleConversationUpdate(
      conversationId,
      () => {
        handleRepoEditCommitApprovalAccepted(conversationId);
      },
      delayMs,
    );
    notifyConversationUpdate(conversationId);
    return;
  }

  const deliverFollowUp = () => {
    const followUpStep = MOCK_APPROVAL_FOLLOWUPS[templateMessageId];
    if (!followUpStep) return;

    appendScriptMessage(conversationId, followUpStep);
    notifyConversationUpdate(conversationId);
  };

  const deliverGithubPagesDeployComplete = () => {
    const repoName = conversationRepoNames.get(conversationId) ?? 'my-todo-app';
    appendScriptMessage(conversationId, buildDeployCompleteStep(repoName));
    notifyConversationUpdate(conversationId);
  };

  if (isDeployApproval && options?.runDeployPipeline) {
    if (templateMessageId === GITHUB_PAGES_DEPLOY_TEMPLATE_ID) {
      appendScriptMessage(conversationId, MOCK_GITHUB_PAGES_DEPLOY_START_STEP);
      notifyConversationUpdate(conversationId);
    } else if (templateMessageId === REPO_EDIT_GITHUB_PAGES_DEPLOY_TEMPLATE_ID) {
      appendScriptMessage(conversationId, MOCK_REPO_EDIT_DEPLOY_START_STEP);
      notifyConversationUpdate(conversationId);
    }

    await options.runDeployPipeline();

    if (templateMessageId === GITHUB_PAGES_DEPLOY_TEMPLATE_ID) {
      scheduleConversationUpdate(conversationId, deliverGithubPagesDeployComplete, 0);
      return;
    }

    if (templateMessageId === REPO_EDIT_GITHUB_PAGES_DEPLOY_TEMPLATE_ID) {
      scheduleConversationUpdate(
        conversationId,
        () => {
          appendScriptMessage(conversationId, MOCK_REPO_EDIT_DEPLOY_COMPLETE_STEP);
          notifyConversationUpdate(conversationId);
        },
        0,
      );
      return;
    }

    scheduleConversationUpdate(conversationId, deliverFollowUp, 0);
    return;
  }

  if (!MOCK_APPROVAL_FOLLOWUPS[templateMessageId]) return;

  scheduleConversationUpdate(conversationId, deliverFollowUp, delayMs);
  notifyConversationUpdate(conversationId);
}
