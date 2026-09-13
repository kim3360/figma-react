import { z } from 'zod';

/**
 * DB 마련 방식.
 * LOCAL 만 실제로 동작하고 RDS·DOCKER 는 서버가 아직 막아둔다(승인 흐름과 함께 다음 단계).
 */
const databaseMethodSchema = z.enum(['LOCAL', 'RDS', 'DOCKER']);

/** DB 엔진 */
const databaseEngineSchema = z.enum(['POSTGRESQL', 'MYSQL']);

/**
 * 프로비저닝 상태. 알려진 값: PENDING · PROVISIONING · READY · FAILED · EXPIRED.
 * PENDING·PROVISIONING 은 서버가 다음 상태로 옮기는 중이라 폴링을 이어간다.
 *
 * 열린 문자열로 받는다 — 화면은 아는 값만 라벨로 바꾸고 모르는 값은 그대로 보여주며,
 * 폴링 판단도 Set 조회라 모르는 값이 와도 종료 상태로 떨어질 뿐 목록이 죽지 않는다.
 * 방식이 늘면(RDS·DOCKER) 상태가 늘 여지도 함께 커진다.
 */
const databaseStatusSchema = z
  .string().prefault('');

/**
 * 프로비저닝된 DB.
 *
 * password 는 생성 응답에만 있고 목록·상세에는 절대 안 나온다 — FE 가 비밀값을 들고 있지
 * 않도록 서버가 마스킹한다. 환경변수(`value: null`)와 같은 방식이다.
 *
 * errorCode 는 닫지 않는다. 클라우드 오류 종류는 늘어날 수 있고 화면은 아는 값만 문구로
 * 바꾸면 되는데, 닫아두면 값이 하나 늘 때마다 목록 전체가 파싱에 실패해 화면이 통째로 빈다.
 */
const provisionedDatabaseSchema = z.object({
  /** DB ID */
  databaseId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 마련 방식 */
  method: databaseMethodSchema,
  /** 엔진 */
  engine: databaseEngineSchema,
  /** 프로비저닝 상태 */
  status: databaseStatusSchema,
  /**
   * 누가 만들었는지. MANUAL 은 사용자가 이 화면에서, PREVIEW_AUTO 는 서버형 프리뷰가
   * 뜨면서 자동으로 마련한 것이다. 열린 문자열로 받는다 — 화면은 아는 값만 라벨로 바꾼다.
   */
  origin: z.string().nullable().prefault(null),
  /** 접속 호스트. 준비 전이면 null */
  host: z.string().nullable().prefault(null),
  /** 접속 포트. 준비 전이면 null */
  port: z.number().int().nullable().prefault(null),
  /** 데이터베이스 이름. 준비 전이면 null */
  database: z.string().nullable().prefault(null),
  /** 접속 사용자명. 준비 전이면 null */
  username: z.string().nullable().prefault(null),
  /** 회수 시각. LOCAL 만 값이 있고 RDS·DOCKER 는 null. OffsetDateTime */
  expiresAt: z.string().nullable().prefault(null),
  /** 실패 분류. 성공·진행 중이면 null. 모르는 값은 PROVIDER_ERROR 로 취급한다 */
  errorCode: z.string().nullable().prefault(null),
  /** 실패 상세. 서버 문구 그대로 */
  errorMessage: z.string().nullable().prefault(null),
  /** 생성 시각. OffsetDateTime */
  createdAt: z.string().nullable().prefault(null),
  /** 수정 시각. OffsetDateTime */
  updatedAt: z.string().nullable().prefault(null),
});

/** 생성 응답에만 실리는 비밀번호를 더한 형태 */
const createdDatabaseSchema = provisionedDatabaseSchema.extend({
  /** 이 응답에서만 내려온다. 이후 조회에는 없다 */
  password: z.string().nullable().prefault(null),
});

/**
 * POST /projects/{projectId}/databases 응답.
 *
 * method 와 무관하게 형태가 하나다. 승인이 필요한지를 requiresApproval 로 판별하고,
 * 요청 내용으로 응답 형태를 추측하지 않는다 — LOCAL 이 나중에 승인을 거치게 바뀌어도
 * 이 형태는 그대로다.
 */
const postProjectDatabaseResSchema = z.object({
  /** 승인이 필요한지. LOCAL 은 false, RDS·DOCKER 는 true */
  requiresApproval: z.boolean(),
  /** requiresApproval 이 false 일 때만 채워진다 */
  database: createdDatabaseSchema.nullable().prefault(null),
  /** 승인 흐름의 태스크 ID */
  taskId: z.string().nullable().prefault(null),
  /** 생성된 승인 ID 목록 */
  approvalIds: z.array(z.number().int()).prefault([]),
});

/** GET /projects/{projectId}/databases 응답. 서버가 EXPIRED 를 제외하고 활성 자원만 준다 */
const getProjectDatabaseListResSchema = z.array(provisionedDatabaseSchema);

/** POST /projects/{projectId}/databases 요청 */
const postProjectDatabaseReqSchema = z.object({
  method: databaseMethodSchema,
  engine: databaseEngineSchema,
});

type DatabaseMethod = z.infer<typeof databaseMethodSchema>;
type DatabaseEngine = z.infer<typeof databaseEngineSchema>;
type DatabaseStatus = z.infer<typeof databaseStatusSchema>;
type ProvisionedDatabase = z.infer<typeof provisionedDatabaseSchema>;
type CreatedDatabase = z.infer<typeof createdDatabaseSchema>;
type GetProjectDatabaseListResType = z.infer<typeof getProjectDatabaseListResSchema>;
type PostProjectDatabaseReqType = z.infer<typeof postProjectDatabaseReqSchema>;
type PostProjectDatabaseResType = z.infer<typeof postProjectDatabaseResSchema>;

export {
  databaseMethodSchema,
  databaseEngineSchema,
  databaseStatusSchema,
  provisionedDatabaseSchema,
  createdDatabaseSchema,
  getProjectDatabaseListResSchema,
  postProjectDatabaseReqSchema,
  postProjectDatabaseResSchema,
  type DatabaseMethod,
  type DatabaseEngine,
  type DatabaseStatus,
  type ProvisionedDatabase,
  type CreatedDatabase,
  type GetProjectDatabaseListResType,
  type PostProjectDatabaseReqType,
  type PostProjectDatabaseResType,
};
