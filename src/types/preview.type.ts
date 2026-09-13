import { z } from 'zod';

const previewResourceUsageSchema = z.object({
  /** 메모리 사용량(byte). 없으면 null */
  memoryUsageBytes: z.number().int().nullable().prefault(null),
  /** 메모리 한도(byte). 없으면 null */
  memoryLimitBytes: z.number().int().nullable().prefault(null),
  /** 메모리 사용률. 없으면 null */
  memoryUsagePercent: z.number().nullable().prefault(null),
  /** CPU 사용률. 없으면 null */
  cpuPercent: z.number().nullable().prefault(null),
});

/**
 * 프로젝트 프리뷰 세션 상태
 * @example "ACTIVE"
 */
const projectPreviewSessionStatusSchema = z.enum(['ACTIVE', 'PROVISIONING', 'FAILED']);

/**
 * GET /preview-sessions/{sessionId}/status Preview 세션 상태 응답
 */
const getPreviewSessionStatusResSchema = z.object({
  /** 세션 ID */
  sessionId: z.string().prefault(''),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 태스크 ID. 없으면 null */
  taskId: z.string().nullable().prefault(''),
  /** 세션 상태 */
  sessionStatus: z.string().prefault(''),
  /** 컨테이너 실행 여부 */
  containerRunning: z.boolean(),
  /** OOM 종료 여부 */
  oomKilled: z.boolean(),
  /** 종료 코드. 없으면 null */
  exitCode: z.number().int().nullable().prefault(null),
  /** 시작 시각. 없으면 null */
  startedAt: z.string().nullable().prefault(''),
  /** 만료 시각. 없으면 null */
  expiresAt: z.string().nullable().prefault(''),
  /** 리소스 사용량. 없으면 null */
  resources: previewResourceUsageSchema.nullable().prefault(null),
});

/**
 * GET /preview-sessions/{sessionId}/logs Preview 세션 로그 응답
 */
const getPreviewSessionLogsResSchema = z.object({
  /** 세션 ID */
  sessionId: z.string().prefault(''),
  /** 컨테이너 실행 여부 */
  containerRunning: z.boolean(),
  /** 로그 텍스트. 없으면 null */
  logText: z.string().nullable().prefault(''),
});

/**
 * GET|POST /projects/{projectId}/preview-session 경로
 */
const getProjectPreviewSessionParamsSchema = z.object({
  /** 프리뷰 세션을 조회할 프로젝트 ID */
  projectId: z.number().int(),
});

/**
 * GET|POST /projects/{projectId}/preview-session 프로젝트 프리뷰 세션 응답
 */
const getProjectPreviewSessionResSchema = z.object({
  /** Preview 세션 ID */
  sessionId: z.string().nullable().prefault(''),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 이 프리뷰를 만든 Agent 작업 ID. 프로젝트 단위 프리뷰는 null */
  taskId: z.string().nullable().prefault(''),
  /** ACTIVE | PROVISIONING | FAILED. 세션이 없으면 null */
  status: projectPreviewSessionStatusSchema.nullable().prefault(null),
  /** 프리뷰 주소. status=ACTIVE 일 때만 값이 있음 */
  previewUrl: z.string().nullable().prefault(''),
  /** 컨테이너 회수 시각. 없으면 null */
  expiresAt: z.string().nullable().prefault(''),
  /** status=FAILED 일 때의 실패 사유. 없으면 null */
  failureReason: z.string().nullable().prefault(''),
});

const postProjectPreviewSessionResSchema = getProjectPreviewSessionResSchema;

/**
 * POST /preview-sessions/{sessionId}/access 프리뷰 열람 권한 발급 응답.
 * 소유권 쿠키는 Set-Cookie로 내려와 브라우저가 자동 보관한다(HttpOnly — FE가 값을 다룰 일 없음)
 */
const postPreviewAccessResSchema = z.object({
  /** Preview 세션 ID */
  sessionId: z.string().prefault(''),
  /** 이 호출로 새로 발급된 프리뷰 주소. 이전 주소는 회전으로 즉시 무효 */
  previewUrl: z.string().min(1, '프리뷰 주소가 없습니다.'),
  /** 세션 만료 시각. 없으면 null */
  expiresAt: z.string().nullable().prefault(''),
});

type GetPreviewSessionStatusResType = z.infer<typeof getPreviewSessionStatusResSchema>;
type GetPreviewSessionLogsResType = z.infer<typeof getPreviewSessionLogsResSchema>;
type ProjectPreviewSessionStatus = z.infer<typeof projectPreviewSessionStatusSchema>;
type GetProjectPreviewSessionParamsType = z.infer<typeof getProjectPreviewSessionParamsSchema>;
type GetProjectPreviewSessionResType = z.infer<typeof getProjectPreviewSessionResSchema>;
type PostProjectPreviewSessionResType = z.infer<typeof postProjectPreviewSessionResSchema>;
type PostPreviewAccessResType = z.infer<typeof postPreviewAccessResSchema>;

export {
  previewResourceUsageSchema,
  projectPreviewSessionStatusSchema,
  getPreviewSessionStatusResSchema,
  getPreviewSessionLogsResSchema,
  getProjectPreviewSessionParamsSchema,
  getProjectPreviewSessionResSchema,
  postProjectPreviewSessionResSchema,
  postPreviewAccessResSchema,
  type GetPreviewSessionStatusResType,
  type GetPreviewSessionLogsResType,
  type ProjectPreviewSessionStatus,
  type GetProjectPreviewSessionParamsType,
  type GetProjectPreviewSessionResType,
  type PostProjectPreviewSessionResType,
  type PostPreviewAccessResType,
};
