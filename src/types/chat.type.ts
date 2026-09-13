import { z } from 'zod';
import { chatRoleSchema } from '@/types/common.enum';

/**
 * 대화 세션 정보
 */
const conversationResponseSchema = z.object({
  /** 대화 ID */
  conversationId: z.number().int(),
  /** 대화가 속한 프로젝트 ID */
  projectId: z.number().int(),
  /** 휴지통 이동 여부 */
  deleted: z.boolean(),
  /** 휴지통 이동 시각. 삭제되지 않은 대화는 null */
  deletedAt: z.string().nullable().prefault(''),
  /** 대화 생성 시각 (ISO 8601 date-time) */
  createdAt: z.string().prefault(''),
  /** 대화 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().prefault(''),
});

/**
 * GET /conversations/{conversationId} 대화 상세 조회 요청 (path)
 */
const getConversationDetailParamsSchema = z.object({
  /** 조회할 대화 ID */
  conversationId: z.number().int(),
});

/**
 * GET /conversations/{conversationId} 대화 상세 조회 응답
 */
const getConversationDetailResSchema = conversationResponseSchema;

/**
 * DELETE /conversations/{conversationId} 대화 삭제 요청 (path)
 */
const deleteConversationParamsSchema = z.object({
  /** 휴지통으로 이동할 대화 ID */
  conversationId: z.number().int(),
});

/**
 * GET /projects/{projectId}/conversations 프로젝트 대화 목록 조회 요청 (path)
 */
const getProjectConversationListParamsSchema = z.object({
  /** 대화 목록을 조회할 프로젝트 ID */
  projectId: z.number().int(),
});

/**
 * GET /projects/{projectId}/conversations 프로젝트 대화 목록 조회 응답
 */
const getProjectConversationListResSchema = z.array(conversationResponseSchema);

/**
 * POST /projects/{projectId}/conversations 프로젝트 대화 생성 요청 (path)
 */
const postProjectConversationCreateParamsSchema = z.object({
  /** 대화를 생성할 프로젝트 ID */
  projectId: z.number().int(),
});

/**
 * POST /projects/{projectId}/conversations 프로젝트 대화 생성 응답
 */
const postProjectConversationCreateResSchema = conversationResponseSchema;

/**
 * POST /trash/conversations/{conversationId}/restore 휴지통 대화 복구 요청 (path)
 */
const postTrashConversationRestoreParamsSchema = z.object({
  /** 복구할 대화 ID */
  conversationId: z.number().int(),
});

/**
 * POST /trash/conversations/{conversationId}/restore 휴지통 대화 복구 응답
 */
const postTrashConversationRestoreResSchema = conversationResponseSchema;

/**
 * DELETE /trash/conversations/{conversationId} 휴지통 대화 영구 삭제 요청 (path)
 */
const deleteTrashConversationParamsSchema = z.object({
  /** 영구 삭제할 대화 ID */
  conversationId: z.number().int(),
});

/**
 * GET /trash/conversations 휴지통 대화 목록 조회 응답
 */
const getTrashConversationListResSchema = z.array(conversationResponseSchema);

/**
 * 대화 메시지 정보
 */
const conversationMessageSchema = z.object({
  /** 메시지 ID */
  messageId: z.number().int(),
  /** 대화 ID */
  conversationId: z.number().int(),
  /** 메시지 역할 */
  role: chatRoleSchema,
  /** 메시지 본문 */
  content: z.string().prefault(''),
  /** 메시지 토큰 수. 현재 사용자 메시지는 0으로 저장됩니다. */
  tokenCount: z.number().int(),
  /** 메시지 생성 시각 (ISO 8601 date-time) */
  createdAt: z.string().prefault(''),
  /** 큐잉된 Agent 작업 ID. 없거나 과거 메시지 조회 시 null */
  taskId: z.string().nullable().prefault(''),
  /**
   * 서버가 이 줄을 왜 남겼는지.
   *
   * 알려진 값: AGENT_RESULT · TASK_PROGRESS · APPROVAL_REQUESTED · INPUT_REQUIRED ·
   * CLARIFICATION_ANSWER · TASK_FAILED · TASK_CANCELLED.
   *
   * 이게 없을 때는 본문을 읽어야 종류를 알 수 있었는데, 그건 하면 안 되는 일이다 —
   * 서버가 문구를 한 글자 다듬으면 화면이 조용히 어긋나고, 모델이 비슷한 문장을
   * 지어내면 없는 의미가 붙는다(mergeConversationMessages 주석의 그 사고다).
   *
   * 열린 문자열로 받는다. 종류는 계속 늘기로 되어 있고, 모르는 값은 평범한 줄로
   * 떨어뜨린다. 사용자 메시지와 이 필드 이전에 쌓인 줄은 null 이다.
   */
  kind: z.string().nullable().prefault(null),
});

/**
 * GET /conversations/{conversationId}/messages 대화 메시지 목록 조회 요청 (path)
 */
const getConversationMessageListParamsSchema = z.object({
  /** 메시지 목록을 조회할 대화 ID */
  conversationId: z.number().int(),
});

/**
 * GET /conversations/{conversationId}/messages 대화 메시지 목록 조회 응답
 */
const getConversationMessageListResSchema = z.array(conversationMessageSchema);

/**
 * POST /conversations/{conversationId}/messages 대화 메시지 생성 요청
 */
const postConversationMessageCreateReqSchema = z.object({
  /** 저장할 사용자 메시지 본문 */
  content: z.string().min(1, '메시지 본문을 입력해주세요.').prefault(''),
  /**
   * 이 메시지로 도는 에이전트가 쓸 AI 제공자. 생략하면 서버 기본값이다.
   *
   * 값을 열거하지 않는다 — 쓸 수 있는 제공자는 서버 설정이고 화면은 그 목록을 받아
   * 채운다(`GET /agent/ai-providers`). 여기에 적어두면 두 벌이 된다.
   */
  aiProvider: z.string().optional(),
});

/**
 * POST /conversations/{conversationId}/messages 대화 메시지 생성 응답
 */
const postConversationMessageCreateResSchema = conversationMessageSchema;

/** 대화 세션 정보 */
type ConversationResponse = z.infer<typeof conversationResponseSchema>;
/** GET /conversations/{conversationId} 대화 상세 조회 요청 (path) */
type GetConversationDetailParamsType = z.infer<typeof getConversationDetailParamsSchema>;
/** GET /conversations/{conversationId} 대화 상세 조회 응답 */
type GetConversationDetailResType = z.infer<typeof getConversationDetailResSchema>;
/** DELETE /conversations/{conversationId} 대화 삭제 요청 (path) */
type DeleteConversationParamsType = z.infer<typeof deleteConversationParamsSchema>;
/** GET /projects/{projectId}/conversations 프로젝트 대화 목록 조회 요청 (path) */
type GetProjectConversationListParamsType = z.infer<typeof getProjectConversationListParamsSchema>;
/** GET /projects/{projectId}/conversations 프로젝트 대화 목록 조회 응답 */
type GetProjectConversationListResType = z.infer<typeof getProjectConversationListResSchema>;
/** POST /projects/{projectId}/conversations 프로젝트 대화 생성 요청 (path) */
type PostProjectConversationCreateParamsType = z.infer<
  typeof postProjectConversationCreateParamsSchema
>;
/** POST /projects/{projectId}/conversations 프로젝트 대화 생성 응답 */
type PostProjectConversationCreateResType = z.infer<typeof postProjectConversationCreateResSchema>;
/** POST /trash/conversations/{conversationId}/restore 휴지통 대화 복구 요청 (path) */
type PostTrashConversationRestoreParamsType = z.infer<
  typeof postTrashConversationRestoreParamsSchema
>;
/** POST /trash/conversations/{conversationId}/restore 휴지통 대화 복구 응답 */
type PostTrashConversationRestoreResType = z.infer<typeof postTrashConversationRestoreResSchema>;
/** DELETE /trash/conversations/{conversationId} 휴지통 대화 영구 삭제 요청 (path) */
type DeleteTrashConversationParamsType = z.infer<typeof deleteTrashConversationParamsSchema>;
/** GET /trash/conversations 휴지통 대화 목록 조회 응답 */
type GetTrashConversationListResType = z.infer<typeof getTrashConversationListResSchema>;
/** 대화 메시지 정보 */
type ConversationMessage = z.infer<typeof conversationMessageSchema>;
/** GET /conversations/{conversationId}/messages 대화 메시지 목록 조회 요청 (path) */
type GetConversationMessageListParamsType = z.infer<typeof getConversationMessageListParamsSchema>;
/** GET /conversations/{conversationId}/messages 대화 메시지 목록 조회 응답 */
type GetConversationMessageListResType = z.infer<typeof getConversationMessageListResSchema>;
/** POST /conversations/{conversationId}/messages 대화 메시지 생성 요청 */
type PostConversationMessageCreateReqType = z.infer<typeof postConversationMessageCreateReqSchema>;
/** POST /conversations/{conversationId}/messages 대화 메시지 생성 응답 */
type PostConversationMessageCreateResType = z.infer<typeof postConversationMessageCreateResSchema>;

export {
  conversationResponseSchema,
  getConversationDetailParamsSchema,
  getConversationDetailResSchema,
  deleteConversationParamsSchema,
  getProjectConversationListParamsSchema,
  getProjectConversationListResSchema,
  postProjectConversationCreateParamsSchema,
  postProjectConversationCreateResSchema,
  postTrashConversationRestoreParamsSchema,
  postTrashConversationRestoreResSchema,
  deleteTrashConversationParamsSchema,
  getTrashConversationListResSchema,
  conversationMessageSchema,
  getConversationMessageListParamsSchema,
  getConversationMessageListResSchema,
  postConversationMessageCreateReqSchema,
  postConversationMessageCreateResSchema,
  type ConversationResponse,
  type GetConversationDetailParamsType,
  type GetConversationDetailResType,
  type DeleteConversationParamsType,
  type GetProjectConversationListParamsType,
  type GetProjectConversationListResType,
  type PostProjectConversationCreateParamsType,
  type PostProjectConversationCreateResType,
  type PostTrashConversationRestoreParamsType,
  type PostTrashConversationRestoreResType,
  type DeleteTrashConversationParamsType,
  type GetTrashConversationListResType,
  type ConversationMessage,
  type GetConversationMessageListParamsType,
  type GetConversationMessageListResType,
  type PostConversationMessageCreateReqType,
  type PostConversationMessageCreateResType,
};
