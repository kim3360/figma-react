import { z } from 'zod';
import { agentTaskStatusSchema, agentTypeSchema, aiProviderSchema } from '@/types/common.enum';

const agentStepSchema = z.object({
  /** 에이전트 작업 유형 */
  agentType: agentTypeSchema,
  /** 단계 파라미터 */
  parameters: z.record(z.string(), z.unknown()),
});

/**
 * POST /agent/decision 에이전트 요청 제출 요청
 */
const postAgentDecisionReqSchema = z.object({
  /** 사용자 요청 본문 */
  content: z.string().min(1, '요청 본문을 입력해주세요.').prefault(''),
  /** AI 제공자 */
  aiProvider: aiProviderSchema,
  /** 대상 프로젝트 ID. 없으면 null */
  projectId: z.number().int().nullable().prefault(null),
  /** 대상 대화 ID. 없으면 null */
  conversationId: z.number().int().nullable().prefault(null),
});

/**
 * POST /agent/decision 에이전트 요청 제출 응답
 */
/**
 * GET /agent/conversations/{id}/active-task 응답.
 *
 * 이 대화에서 아직 안 끝난 태스크를 가리킨다. 끝난 것은 오지 않으므로, 화면은 받은
 * 것만 믿고 되살리면 된다 — 낡은 폼이 뜰 일이 없다.
 *
 * 새로고침하면 화면은 진행 중이던 것을 통째로 잊는다. 그 기억을 서버에 두는 포인터다.
 */
const getActiveTaskResSchema = z.object({
  taskId: z.string().prefault(''),
  /** 열어 둔다 — 서버가 상태를 늘려도 이 조회가 통째로 실패하면 안 된다 */
  status: z.string().prefault(''),
});

/** 되묻기 선택지 하나 */
const clarificationOptionSchema = z.object({
  /** 서버가 구분하는 값. 화면에는 label 을 쓴다 */
  value: z.string().prefault(''),
  /** 사람이 읽는 이름. 답으로 보내는 것도 이 문자열이다 */
  label: z.string().prefault(''),
  /** 에이전트가 미는 쪽. 하나만 true 인 것을 전제하지 않는다 */
  recommended: z.boolean().nullable().prefault(false),
});

/**
 * 빌드 전에 스펙을 되묻는 질문.
 *
 * inputType 을 열린 문자열로 둔다 — 서버가 새 형태를 더해도 화면이 통째로 못 읽는 일이
 * 없어야 한다. 모르는 값이 오면 자유 입력으로 떨어뜨린다.
 */
const taskClarificationSchema = z.object({
  question: z.string().prefault(''),
  /** TEXT | SINGLE_SELECT | MULTI_SELECT. 모르는 값은 TEXT 로 다룬다 */
  inputType: z.string().prefault('TEXT'),
  options: z.array(clarificationOptionSchema).prefault([]),
  /** 선택지 말고 직접 적을 수도 있는지 */
  allowOther: z.boolean().nullable().prefault(false),
  /**
   * 답을 받는 대신 화면이 무언가를 해 줘야 하는 되묻기.
   *
   * `CONNECT_CLOUD` 는 "클라우드 연결이 없어서 못 간다" 는 뜻이다. 이때 사용자가 적을
   * 답이 없다 — 다른 화면에서 연결을 마치고 돌아와야 한다. 그래서 입력창 대신 안내를
   * 띄운다.
   *
   * 열어 둔다. 서버가 다른 종류를 더해도 화면이 통째로 못 읽으면 안 되고, 모르는 값은
   * 지금까지처럼 자유 입력으로 떨어뜨린다.
   */
  actionType: z.string().nullable().prefault(null),
});

/**
 * 답이 끝난 되묻기의 스냅샷.
 *
 * 되묻기 폼은 **답한 순간 사라진다** — 서버가 `clarification` 을 null 로 만들어 이중 제출을
 * 막는다. 그래서 답하고 나면 무엇을 골랐는지 확인할 길이 없었다. 이 필드는 그 자리를
 * 대신하는 읽기 전용 기록이다. 폼을 되살리는 것이 아니다.
 *
 * 구조화 질문이 아니었던 되묻기(저장소 이름·도메인처럼 자유 입력)는 `question` 과
 * `options` 가 비어 오고 `answer` 만 온다.
 *
 * 되묻기를 거치지 않은 태스크면 이 필드 자체가 null 이다.
 */
const answeredClarificationSchema = z.object({
  /** 그때 물었던 질문. 자유 입력 되묻기면 null */
  question: z.string().nullable().prefault(null),
  /** TEXT | SINGLE_SELECT | MULTI_SELECT. 자유 입력 되묻기면 null */
  inputType: z.string().nullable().prefault(null),
  /** 그때 보여준 선택지 전부. 고른 것만이 아니라 전부다 — 무엇 중에서 골랐는지가 정보다 */
  options: z.array(clarificationOptionSchema).nullable().prefault(null),
  allowOther: z.boolean().nullable().prefault(false),
  /** 실제로 보낸 답. 선택형이면 고른 것의 label 이고, 여럿이면 ", " 로 이어져 있다 */
  answer: z.string().prefault(''),
});

const postAgentDecisionResSchema = z.object({
  /** 실행 단계 */
  steps: z.array(agentStepSchema),
  /** 판단 근거 */
  reasoning: z.string().nullable().prefault(''),
  /** AI 제공자 */
  aiProvider: aiProviderSchema,
  /** 태스크 ID */
  taskId: z.string().prefault(''),
  /** 태스크 상태 */
  status: z.string().prefault(''),
  /** 생성된 승인 ID 목록 */
  approvalIds: z.array(z.number().int()),
});

/**
 * GET /agent/tasks/{taskId} 태스크 상태 조회 요청 (path)
 */
const getAgentTaskParamsSchema = z.object({
  /** 조회할 에이전트 태스크 ID */
  taskId: z.string().min(1, '태스크 ID가 없습니다.').prefault(''),
});

/**
 * GET /agent/tasks/{taskId} 태스크 상태 조회 응답
 */
const getAgentTaskResSchema = z.object({
  /** 태스크 ID */
  taskId: z.string().prefault(''),
  /** 태스크 상태 */
  status: agentTaskStatusSchema,
  /** 토큰 기반 프리뷰 gateway URL. CODE 스텝 완료 시에만 설정됨 */
  previewUrl: z.string().nullable().prefault(''),
  /** 작업 완료 요약. 배포 URL, 도메인 연결 결과 등 포함 */
  summary: z.string().nullable().prefault(''),
  /** 실패 원인 메시지. status가 FAILED일 때 설정됨 */
  error: z.string().nullable().prefault(''),
  /** 에이전트가 사용자에게 묻는 질문. WAITING_INPUT일 때 설정됨 */
  question: z.string().nullable().prefault(''),
  /**
   * 고를 수 있는 형태의 되묻기. WAITING_INPUT 이면서 선택형일 때만 온다.
   *
   * **null 이면 자유 입력이다** — 지금까지처럼 질문만 보여주고 입력창을 쓴다. 배포가
   * 저장소 이름을 묻는 자리가 그쪽이다.
   */
  clarification: taskClarificationSchema.nullable().prefault(null),
  /** 실패 로그의 마지막 일부 */
  failureLog: z.string().nullable().prefault(''),
  /** 사용자에게 제안하는 최선의 수정안 */
  suggestedFix: z.string().nullable().prefault(''),
  /** 현재 재시도 횟수 */
  attempt: z.number().int().nullable().prefault(null),
  /** 최대 재시도 횟수 */
  maxAttempts: z.number().int().nullable().prefault(null),
  /** POST /tasks/{taskId}/retry 호출이 실제로 성공할지 여부 */
  retryable: z.boolean().nullable().prefault(null),
  /** PENDING 승인 ID. 없으면 null */
  pendingApprovalId: z.number().int().nullable().prefault(null),
  /**
   * 이 태스크에서 되물었고 이미 답이 끝난 것. 되묻기를 안 거쳤으면 null.
   *
   * `clarification` 과 배타적이다 — 답하는 폼은 지금까지처럼 `status == WAITING_INPUT &&
   * clarification != null` 일 때만 뜨고, 이 필드는 그 뒤에 남는 기록이다.
   */
  answeredClarification: answeredClarificationSchema.nullable().prefault(null),
});

const getAgentTaskStatusResSchema = getAgentTaskResSchema;

/**
 * GET /agent/tasks/{taskId}/events 태스크 이벤트 조회 요청 (path + query)
 */
const getAgentTaskEventListParamsSchema = z.object({
  /** 조회할 에이전트 태스크 ID */
  taskId: z.string().min(1, '태스크 ID가 없습니다.').prefault(''),
  /** 마지막으로 받은 event ID. 이 값 이후 이벤트만 반환 */
  afterEventId: z.number().int().nullable().prefault(null),
});

/**
 * GET /agent/tasks/{taskId}/events 태스크 이벤트 항목
 */
const agentTaskEventSchema = z.object({
  /** 이벤트 ID */
  eventId: z.number().int(),
  /** 태스크 ID */
  taskId: z.string().prefault(''),
  /** 이벤트 타입 (CREATED, STARTED, COMPLETED 등) */
  type: z.string().prefault(''),
  /** 이벤트 시점의 태스크 상태 */
  status: agentTaskStatusSchema,
  /** 진행 메시지 */
  message: z.string().nullable().prefault(''),
  /**
   * 계획의 몇 번째 단계인지. 스텝 이벤트(STEP_STARTED·STEP_COMPLETED)에만 실린다 —
   * 태스크 생명주기 이벤트(CREATED·QUEUED 등)에는 null 이다.
   */
  stepIndex: z.number().int().nullable().prefault(null),
  /** 계획의 전체 단계 수. 위와 같이 스텝 이벤트에만 실린다 */
  stepTotal: z.number().int().nullable().prefault(null),
  /**
   * 이 단계를 도는 에이전트 종류(CODE·DEPLOY 등). 스텝 이벤트에만 실린다.
   *
   * 열린 문자열이다. 화면은 아는 값에만 라벨을 붙이고 모르는 값은 조용히 넘긴다 —
   * 원시 대문자를 그대로 보여주면 사용자에게는 뜻이 없다.
   */
  agentType: z.string().nullable().prefault(null),
  /** 이벤트 생성 시각 (ISO 8601 date-time) */
  createdAt: z.string().prefault(''),
});

/**
 * GET /agent/tasks/{taskId}/events 태스크 이벤트 목록 응답
 */
const getAgentTaskEventListResSchema = z.array(agentTaskEventSchema);

/**
 * GET /agent/tasks/{taskId}/events/stream 태스크 이벤트 스트림 요청 (path + query)
 */
const getAgentTaskEventStreamParamsSchema = getAgentTaskEventListParamsSchema;

/**
 * POST /agent/tasks/{taskId}/input 사용자 입력 제출 요청 (path)
 */
const postAgentTaskInputParamsSchema = z.object({
  /** 입력을 제출할 에이전트 태스크 ID */
  taskId: z.string().min(1, '태스크 ID가 없습니다.').prefault(''),
});

/**
 * POST /agent/tasks/{taskId}/input 사용자 입력 제출 요청 body
 */
const postAgentTaskInputReqSchema = z.object({
  /** 에이전트 질문에 대한 사용자 응답값 */
  value: z.string().min(1, '입력값을 입력해주세요.').prefault(''),
});

/** 에이전트 태스크 상태 */
type AgentTaskStatus = z.infer<typeof agentTaskStatusSchema>;
/** GET /agent/tasks/{taskId} 태스크 상태 조회 요청 (path) */
type GetAgentTaskParamsType = z.infer<typeof getAgentTaskParamsSchema>;
/** GET /agent/tasks/{taskId} 태스크 상태 조회 응답 */
type GetAgentTaskResType = z.infer<typeof getAgentTaskResSchema>;
/** GET /agent/tasks/{taskId} 태스크 상태 조회 응답 */
type GetAgentTaskStatusResType = GetAgentTaskResType;
/** GET /agent/tasks/{taskId}/events 태스크 이벤트 조회 요청 (path + query) */
type GetAgentTaskEventListParamsType = z.infer<typeof getAgentTaskEventListParamsSchema>;
/** GET /agent/tasks/{taskId}/events 태스크 이벤트 항목 */
type AgentTaskEvent = z.infer<typeof agentTaskEventSchema>;
/** GET /agent/tasks/{taskId}/events 태스크 이벤트 목록 응답 */
type GetAgentTaskEventListResType = z.infer<typeof getAgentTaskEventListResSchema>;
/** GET /agent/tasks/{taskId}/events/stream 태스크 이벤트 스트림 요청 (path + query) */
type GetAgentTaskEventStreamParamsType = z.infer<typeof getAgentTaskEventStreamParamsSchema>;
/** POST /agent/tasks/{taskId}/input 사용자 입력 제출 요청 (path) */
type PostAgentTaskInputParamsType = z.infer<typeof postAgentTaskInputParamsSchema>;
/** POST /agent/tasks/{taskId}/input 사용자 입력 제출 요청 body */
type PostAgentTaskInputReqType = z.infer<typeof postAgentTaskInputReqSchema>;
type AgentStep = z.infer<typeof agentStepSchema>;
type TaskClarification = z.infer<typeof taskClarificationSchema>;
type AnsweredClarification = z.infer<typeof answeredClarificationSchema>;
type GetActiveTaskResType = z.infer<typeof getActiveTaskResSchema>;
type ClarificationOption = z.infer<typeof clarificationOptionSchema>;
type PostAgentDecisionReqType = z.infer<typeof postAgentDecisionReqSchema>;
type PostAgentDecisionResType = z.infer<typeof postAgentDecisionResSchema>;

export {
  getActiveTaskResSchema,
  type GetActiveTaskResType,
  taskClarificationSchema,
  answeredClarificationSchema,
  clarificationOptionSchema,
  type TaskClarification,
  type AnsweredClarification,
  type ClarificationOption,
  agentStepSchema,
  postAgentDecisionReqSchema,
  postAgentDecisionResSchema,
  getAgentTaskParamsSchema,
  getAgentTaskResSchema,
  getAgentTaskStatusResSchema,
  getAgentTaskEventListParamsSchema,
  agentTaskEventSchema,
  getAgentTaskEventListResSchema,
  getAgentTaskEventStreamParamsSchema,
  postAgentTaskInputParamsSchema,
  postAgentTaskInputReqSchema,
  type AgentStep,
  type PostAgentDecisionReqType,
  type PostAgentDecisionResType,
  type AgentTaskStatus,
  type GetAgentTaskParamsType,
  type GetAgentTaskResType,
  type GetAgentTaskStatusResType,
  type GetAgentTaskEventListParamsType,
  type AgentTaskEvent,
  type GetAgentTaskEventListResType,
  type GetAgentTaskEventStreamParamsType,
  type PostAgentTaskInputParamsType,
  type PostAgentTaskInputReqType,
};
