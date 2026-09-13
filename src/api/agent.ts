import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import {
  getAiProviderListResSchema,
  type GetAiProviderListResType,
} from '@/types/aiProvider.type';
import {
  agentTaskEventSchema,
  getAgentTaskEventListParamsSchema,
  getAgentTaskEventListResSchema,
  getAgentTaskEventStreamParamsSchema,
  getAgentTaskParamsSchema,
  getAgentTaskResSchema,
  postAgentDecisionReqSchema,
  postAgentDecisionResSchema,
  postAgentTaskInputParamsSchema,
  postAgentTaskInputReqSchema,
  type AgentTaskEvent,
  type AgentTaskStatus,
  type GetAgentTaskEventListResType,
  type GetAgentTaskResType,
  type PostAgentDecisionReqType,
  type PostAgentDecisionResType,
  type PostAgentTaskInputReqType,
  getActiveTaskResSchema,
  type GetActiveTaskResType,
} from '@/types/agent.type';

const endpoint = '/agent';

function unwrapApiData<T>(body: T | ApiResponse<T>): T {
  if (body && typeof body === 'object' && 'data' in body && body.data != null) {
    return body.data;
  }
  return body as T;
}

/** 폴링을 멈춰도 되는 태스크 상태(완료·실패·입력/승인 대기) */
const SETTLED_AGENT_TASK_STATUSES = new Set<AgentTaskStatus>([
  'DONE',
  'FAILED',
  'CANCELLED',
  'WAITING_INPUT',
  'WAITING_APPROVAL',
  'WAITING_RESULT_APPROVAL',
]);

const DEFAULT_POLL_INTERVAL_MS = 2000;
/**
 * 1분이 지나면 느리게 본다.
 *
 * 빌드는 분 단위로 움직인다 — 의존성 내려받고 컴파일하는 동안 상태가 바뀌지 않는데
 * 2초마다 두드릴 이유가 없다. 사용자가 체감하는 차이도 없다.
 */
const SLOW_POLL_INTERVAL_MS = 5000;
const SLOW_POLL_AFTER_MS = 60_000;
/**
 * 폴링을 이어갈 최대 시간.
 *
 * 예전에는 150회(=5분) 상한이었는데, 실제 Spring Boot 빌드가 그 언저리다. 의존성이
 * 많으면 넘어간다 — 그러면 **작업은 멀쩡히 도는데 화면에는 실패가 뜬다.**
 *
 * 그래서 두 가지를 바꿨다. 상한을 넉넉히 잡고, 넘어가도 실패로 만들지 않는다
 * (AgentPollTimeoutError 참고).
 */
const DEFAULT_MAX_POLL_MS = 20 * 60 * 1000;

/**
 * 쓸 수 있는 AI 제공자 목록 조회 API GET.
 *
 * 실패해도 화면을 막지 않는다 — 목록이 없으면 제공자 선택을 감추고 서버 기본값으로
 * 보내면 지금까지와 똑같이 동작한다. 이 엔드포인트가 아직 없는 서버에 붙어도 마찬가지다.
 */
async function getAiProviderList() {
  return Http.instance
    .get<ApiResponse<GetAiProviderListResType>>(`${endpoint}/ai-providers`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetAiProviderListResType>>(response);
      return getAiProviderListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 쓸 수 있는 AI 제공자 목록 Query Hook. 자주 바뀌지 않아 폴링하지 않는다 */
function useAiProviderListQuery(queryKey: unknown) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['ai-provider-list', queryKey],
    queryFn: getAiProviderList,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** 에이전트 요청 제출 API POST */
async function postAgentDecision(params: PostAgentDecisionReqType) {
  const payload = postAgentDecisionReqSchema.parse(params);

  return Http.instance
    .post<ApiResponse<PostAgentDecisionResType>>(`${endpoint}/decision`, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<PostAgentDecisionResType>>(response);
      return postAgentDecisionResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 에이전트 세션 종료 API DELETE */
async function deleteAgentSession() {
  return Http.instance.delete(`${endpoint}/session`).then(succesResponse).catch(errorResponse());
}

/** 에이전트 태스크 상태 조회 API GET */
/**
 * 이 대화에서 아직 안 끝난 태스크를 묻는다.
 *
 * 화면은 진행 중이던 태스크를 메모리에만 들고 있어서 새로고침하면 잊는다. 그러면 답을
 * 기다리던 질문에 답할 길도, 취소할 길도 사라진다 — 그 태스크는 영원히 대기로 남는다.
 *
 * 없으면 204 로 온다. 그건 오류가 아니라 "되살릴 게 없다" 는 정상 응답이다.
 */
async function getConversationActiveTask(conversationId: number) {
  return Http.instance
    .get<ApiResponse<GetActiveTaskResType>>(`/agent/conversations/${conversationId}/active-task`)
    .then((response) => {
      if (response.status === 204 || !response.data) return null;
      const body = succesResponse<ApiResponse<GetActiveTaskResType>>(response);
      const data = unwrapApiData(body);
      if (!data) return null;
      const parsed = getActiveTaskResSchema.parse(data);
      return parsed.taskId ? parsed : null;
    })
    .catch(errorResponse());
}

async function getAgentTask(taskId: string) {
  const { taskId: id } = getAgentTaskParamsSchema.parse({ taskId });

  return Http.instance
    .get<ApiResponse<GetAgentTaskResType>>(`${endpoint}/tasks/${id}`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetAgentTaskResType>>(response);
      return getAgentTaskResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

const getAgentTaskStatus = getAgentTask;

/**
 * 상한까지 기다렸는데 태스크가 아직 안 끝났다.
 *
 * **실패가 아니다.** 서버는 계속 돌고 있고, 끝나면 결과를 chat_messages 에 적는다.
 * 메시지 목록이 주기적으로 다시 읽으므로 사용자는 결국 결과를 받는다. 그래서 호출부는
 * 이걸 오류 알림이 아니라 "오래 걸리는 중" 안내로 다뤄야 한다.
 *
 * 예전에는 평범한 Error 를 던져서 성공할 작업이 실패로 보였다.
 */
class AgentPollTimeoutError extends Error {
  readonly lastTask: GetAgentTaskResType | null;

  constructor(lastTask: GetAgentTaskResType | null) {
    super('작업이 아직 진행 중입니다.');
    this.name = 'AgentPollTimeoutError';
    this.lastTask = lastTask;
  }
}

type PollAgentTaskOptions = {
  intervalMs?: number;
  /** 이 시간을 넘기면 폴링을 멈추고 AgentPollTimeoutError 를 던진다. 실패가 아니다 */
  maxWaitMs?: number;
  signal?: AbortSignal;
  /** true면 폴링을 종료한다. 없으면 종료·입력/승인 대기 상태에서 멈춘다. */
  until?: (task: GetAgentTaskResType) => boolean;
  /**
   * 폴링이 태스크를 읽을 때마다 부른다.
   *
   * 이 함수는 끝날 때까지 await 되므로, 그동안 화면은 태스크가 어디까지 갔는지 알 수
   * 없었다 — 빌드가 몇 분 걸리는 동안 사용자는 글자 없는 스켈레톤만 봤다. 이미 2초마다
   * 받아오고 있는 상태를 버리지 않고 호출부에 넘긴다.
   */
  onProgress?: (task: GetAgentTaskResType) => void;
};

/** 에이전트 태스크가 종료·입력/승인 대기 상태가 될 때까지 폴링한다. */
async function pollAgentTask(taskId: string, options: PollAgentTaskOptions = {}) {
  const baseIntervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const maxWaitMs = options.maxWaitMs ?? DEFAULT_MAX_POLL_MS;
  const isComplete =
    options.until ?? ((task: GetAgentTaskResType) => SETTLED_AGENT_TASK_STATUSES.has(task.status));

  const startedAt = Date.now();
  let lastTask: GetAgentTaskResType | null = null;

  // 횟수가 아니라 경과 시간으로 센다. 간격이 도중에 바뀌므로 횟수로는 얼마나 기다렸는지
  // 알 수 없다 — "5분 상한"이라고 적어둔 값이 실제로는 다른 시간을 뜻하게 된다
  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError');
    }

    const task = await getAgentTask(taskId);
    lastTask = task;
    options.onProgress?.(task);
    if (isComplete(task)) {
      return task;
    }

    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs >= maxWaitMs) {
      throw new AgentPollTimeoutError(lastTask);
    }

    const intervalMs =
      options.intervalMs != null || elapsedMs < SLOW_POLL_AFTER_MS
        ? baseIntervalMs
        : SLOW_POLL_INTERVAL_MS;

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Polling aborted', 'AbortError'));
      };

      const timeoutId = window.setTimeout(() => {
        options.signal?.removeEventListener('abort', onAbort);
        resolve();
      }, intervalMs);

      options.signal?.addEventListener('abort', onAbort, { once: true });
    });
  }
}

/** 에이전트 태스크 취소 API DELETE */
async function deleteAgentTask(taskId: string) {
  return Http.instance
    .delete(`${endpoint}/tasks/${taskId}`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 에이전트 태스크 이벤트 목록 조회 API GET */
async function getAgentTaskEventList(taskId: string, afterEventId: number | null = 0) {
  const params = getAgentTaskEventListParamsSchema.parse({
    taskId,
    afterEventId,
  });

  return Http.instance
    .get<ApiResponse<GetAgentTaskEventListResType>>(`${endpoint}/tasks/${params.taskId}/events`, {
      params: {
        afterEventId: params.afterEventId ?? 0,
      },
    })
    .then((response) => {
      const body = succesResponse<ApiResponse<GetAgentTaskEventListResType>>(response);
      // AgentController 에 메서드 하나만 봉투 없이 내려간다. 어느 것인지 확정되기 전까지
      // body.data 를 직접 읽지 않는다 — unwrapApiData 는 raw 여도 그대로 통과시킨다
      return getAgentTaskEventListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 태스크 이벤트 스트림 경로 */
function getAgentTaskEventStreamPath(taskId: string, afterEventId?: number) {
  const query = afterEventId != null ? `?afterEventId=${afterEventId}` : '';
  return `${endpoint}/tasks/${taskId}/events/stream${query}`;
}

type OpenAgentTaskEventStreamOptions = {
  afterEventId?: number | null;
  signal?: AbortSignal;
  onEvent: (event: AgentTaskEvent) => void;
};

/**
 * SSE 프레임 하나를 이벤트로 옮긴다. 실패하면 null 이고, 던지지 않는다.
 *
 * 예전에는 그대로 던졌다. 그러면 **이벤트 하나가 파싱에 실패할 때 스트림 전체가
 * 죽는다** — 서버가 필드를 하나 늘리거나 프레임이 잘려 도착한 것뿐인데, 그 뒤로 오는
 * 멀쩡한 진행 이벤트를 전부 잃는다. 한 프레임을 버리는 편이 낫다.
 *
 * 서버는 `id:` · `event:`(=type) · `data:`(JSON) 3줄에 빈 줄로 프레임을 가른다.
 * 여기서는 `data:` 만 읽는다 — 나머지는 그 JSON 안에 다시 들어 있다.
 */
function parseSseChunk(chunk: string): AgentTaskEvent | null {
  const dataLines: string[] = [];

  for (const line of chunk.split('\n')) {
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) return null;

  const raw = dataLines.join('\n').trim();
  if (!raw || raw === '[DONE]') return null;

  try {
    return agentTaskEventSchema.parse(JSON.parse(raw));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug('[agent] 이벤트 프레임 하나를 건너뜁니다', { raw, error });
    }
    return null;
  }
}

/** 에이전트 태스크 이벤트 SSE 스트림. envelope 없이 text/event-stream을 직접 수신한다. */
async function openAgentTaskEventStream(taskId: string, options: OpenAgentTaskEventStreamOptions) {
  const params = getAgentTaskEventStreamParamsSchema.parse({
    taskId,
    afterEventId: options.afterEventId ?? 0,
  });

  const baseUrl = import.meta.env.VITE_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  const search = new URLSearchParams({
    afterEventId: String(params.afterEventId ?? 0),
  });
  const url = `${baseUrl}${endpoint}/tasks/${params.taskId}/events/stream?${search.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    signal: options.signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `SSE 연결 실패 (${response.status})`);
  }

  if (!response.body) {
    throw new Error('SSE 응답 본문이 없습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      const event = parseSseChunk(chunk);
      if (event) options.onEvent(event);
    }
  }

  if (buffer.trim()) {
    const event = parseSseChunk(buffer);
    if (event) options.onEvent(event);
  }
}

/** 에이전트 태스크 사용자 입력 제출 API POST */
async function postAgentTaskInput(taskId: string, params: PostAgentTaskInputReqType) {
  const { taskId: id } = postAgentTaskInputParamsSchema.parse({ taskId });
  const payload = postAgentTaskInputReqSchema.parse(params);

  return Http.instance
    .post(`${endpoint}/tasks/${id}/input`, payload)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 실패한 태스크 재시도 API POST */
async function postAgentTaskRetry(taskId: string) {
  return Http.instance
    .post(`${endpoint}/tasks/${taskId}/retry`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 에이전트 태스크 상태 조회 Query Hook (진행 중이면 자동 폴링) */
/**
 * 승인을 기다렸다 도는 작업이 어떻게 끝났는지 지켜본다.
 *
 * 도메인 연결처럼 화면에서 시작하는 작업은 승인을 거쳐야 실제로 돈다. 그런데 그
 * 결과는 화면 어디에도 안 돌아온다 — 성공하면 목록에 도메인이 생겨서 알 수 있지만,
 * **실패하면 아무 일도 안 일어난 것과 구분되지 않는다.** 눌렀는데 그대로인 화면만 남는다.
 *
 * 그래서 접수할 때 받은 태스크 ID 를 들고 결과를 본다. 실패하면 사유를 띄운다.
 *
 * 폴링이 촘촘하면 안 된다 — 사람이 승인을 누를 때까지 기다리는 시간이라 대부분 아무
 * 변화가 없다. 그리고 영원히 물을 수도 없어서 상한을 둔다. 승인을 한참 뒤에 누르면
 * 못 잡지만, 그 경우는 애초에 화면을 떠난 뒤라 띄워 줄 곳도 없다.
 */
const APPROVAL_TASK_WATCH_MS = 5000;
/** 이만큼 물어보고 그만둔다. 5초 간격이므로 대략 10분이다 */
const APPROVAL_TASK_WATCH_LIMIT = 120;
/**
 * 여기서 멈춘다. 정말 끝난 것만이다.
 *
 * `SETTLED_AGENT_TASK_STATUSES` 를 쓰면 안 된다 — 거기엔 승인 대기가 들어 있어서
 * 접수 직후 바로 멈춘다. **그 뒤에 도는 구간이 우리가 보려는 곳이다.**
 */
const WATCH_TERMINAL_STATUSES = new Set(['DONE', 'FAILED', 'CANCELLED']);

function useApprovalTaskWatchQuery(queryKey: unknown, taskId: string | null) {
  if (!queryKey) throw new Error('queryKey is required');

  return useQuery({
    queryKey: ['approval-task-watch', queryKey, taskId],
    queryFn: () => getAgentTask(taskId!),
    enabled: typeof taskId === 'string' && taskId.length > 0,
    gcTime: 0,
    refetchInterval: (query) => {
      const task = query.state.data;
      if (task && WATCH_TERMINAL_STATUSES.has(task.status)) return false;
      if (query.state.dataUpdateCount > APPROVAL_TASK_WATCH_LIMIT) return false;
      return APPROVAL_TASK_WATCH_MS;
    },
  });
}

function useAgentTaskQuery(queryKey: unknown, taskId: string | null) {
  if (!queryKey) throw new Error('queryKey is required');

  return useQuery({
    queryKey: ['agent-task', queryKey, taskId],
    queryFn: () => getAgentTask(taskId!),
    enabled: typeof taskId === 'string' && taskId.length > 0,
    gcTime: 0,
    refetchInterval: (query) => {
      const task = query.state.data;
      if (task?.previewUrl?.trim()) return false;
      if (task?.status === 'DONE' || task?.status === 'FAILED' || task?.status === 'CANCELLED') {
        return false;
      }
      return DEFAULT_POLL_INTERVAL_MS;
    },
  });
}

/** 에이전트 태스크 이벤트 목록 조회 Query Hook */
function useAgentTaskEventListQuery(
  queryKey: unknown,
  taskId: string | null,
  afterEventId: number | null = 0,
) {
  if (!queryKey) throw new Error('queryKey is required');

  return useQuery({
    queryKey: ['agent-task-events', queryKey, taskId, afterEventId],
    queryFn: () => getAgentTaskEventList(taskId!, afterEventId),
    enabled: typeof taskId === 'string' && taskId.length > 0,
    gcTime: 0,
  });
}

export {
  AgentPollTimeoutError,
  getConversationActiveTask,
  getAiProviderList,
  useAiProviderListQuery,
  postAgentDecision,
  deleteAgentSession,
  getAgentTask,
  getAgentTaskStatus,
  pollAgentTask,
  deleteAgentTask,
  getAgentTaskEventList,
  getAgentTaskEventStreamPath,
  openAgentTaskEventStream,
  postAgentTaskInput,
  postAgentTaskRetry,
  useAgentTaskQuery,
  useApprovalTaskWatchQuery,
  useAgentTaskEventListQuery,
  SETTLED_AGENT_TASK_STATUSES,
};
