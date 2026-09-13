import { z } from 'zod';

/**
 * EC2 백엔드 서버 프로비저닝 상태.
 * 알려진 값: PENDING(승인 대기) · QUEUED(승인됨, 워커 대기) · BUILDING(빌드 중) ·
 * PROVISIONING(인스턴스 생성됨, 헬스체크 대기) · RUNNING · FAILED · TERMINATED.
 *
 * DB 와 같은 이유로 열린 문자열이다 — 배포 파이프라인 단계는 늘어나기 쉽고(빌드가
 * 쪼개지거나 롤백 단계가 붙는 식), 닫아두면 값이 하나 늘 때마다 목록 전체가 파싱에
 * 실패해 화면이 통째로 빈다. 화면은 아는 값만 라벨로 바꾸고 모르는 값은 그대로 보여준다.
 */
const serverStatusSchema = z.string().prefault('');

/**
 * 프로비저닝된 EC2 백엔드 서버. 서버가 비밀값(키페어·SSM 파라미터)은 싣지 않는다.
 */
const provisionedServerSchema = z.object({
  /** 서버 ID */
  serverId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 프로비저닝 상태 */
  status: serverStatusSchema,
  /**
   * 프론트 전용 서버인지. true 면 정적 웹 서버(nginx), false 면 백엔드 앱 서버다.
   *
   * 한 프로젝트에 둘이 함께 뜰 수 있어서 목록에서 구분해야 한다 — 둘 다 "인스턴스" 로만
   * 보이면 어느 쪽을 끄는지 모른 채 종료를 누르게 된다.
   */
  webOnly: z.boolean().nullable().prefault(null),
  /** 인스턴스 티어. 예: t3.micro */
  instanceType: z.string().nullable().prefault(null),
  /** 퍼블릭 호스트. 인스턴스가 뜨기 전이면 null */
  host: z.string().nullable().prefault(null),
  /** 앱 포트. 백엔드 규약상 8080 고정이지만 서버가 주는 값을 쓴다 */
  port: z.number().int().nullable().prefault(null),
  /** RUNNING 일 때만 접속 URL, 아니면 null. EIP 직접 접속이라 http · 8080 이다 */
  url: z.string().nullable().prefault(null),
  /**
   * 백엔드에 도메인이 연결돼 있을 때의 주소. 없으면 null.
   *
   * 인스턴스의 Caddy 가 443 에서 HTTPS 를 끝내므로 `https://{host}` 형태이고 포트가 없다.
   * 즉 `url`(http · EIP · :8080)보다 이쪽이 사람에게 보여줄 주소다 — 둘 다 있으면 이걸 쓴다.
   */
  domainUrl: z.string().nullable().prefault(null),
  /** EC2 인스턴스 ID. 생성 전이면 null */
  instanceId: z.string().nullable().prefault(null),
  /** 실패 분류. 성공·진행 중이면 null. 사용자 거부도 null(=거부됨) */
  errorCode: z.string().nullable().prefault(null),
  /** 실패 상세. 서버 문구 그대로 */
  errorMessage: z.string().nullable().prefault(null),
  /**
   * RUNNING 이후 앱 건강(주기 TCP 헬스체크 결과). status 와 별개다 —
   * status=RUNNING 은 "인스턴스가 떠 있다", 이 값은 "그 위 앱이 응답한다" 이다.
   *
   * true=응답 · false=포트 무응답(인스턴스는 살아있는데 앱이 죽었을 수 있음) ·
   * null=아직 미확인(RUNNING 직후 첫 헬스체크 전, ~1분). status=RUNNING 인데 이 값이
   * false 면 "떠 있는데 안 되는" 상태라 화면에서 눈에 띄게 갈라줘야 한다.
   */
  healthy: z.boolean().nullable().prefault(null),
  /** 마지막 헬스체크 시각. 아직 확인 전이면 null */
  lastHealthCheckAt: z.string().nullable().prefault(null),
  /**
   * 자동복구를 시도한 시각. 시도한 적 없으면 null.
   *
   * 서버는 앱이 두 번 연속 무응답이면 컨테이너를 스스로 재시작한다. 그래서 `healthy`
   * 하나만으로는 부족하다 — **무응답인데 아직 복구를 안 해본 상태**(기다리면 된다)와
   * **복구해봤는데도 안 살아난 상태**(사람이 재배포해야 한다)는 사용자가 할 일이 다르다.
   * 되살아나면 서버가 이 값을 다시 null 로 지운다.
   */
  recoveryAttemptedAt: z.string().nullable().prefault(null),
  /**
   * 종료된 서버의 부트 로그가 보존돼 있는지.
   *
   * 부트 타임아웃으로 실패하면 인스턴스가 종료돼 로그를 볼 수 없었다 — **왜 안 떴는지
   * 알 방법이 아예 없었다.** 이제 종료 직전 스냅샷을 남기므로, 이 값이 true 면 FAILED
   * 서버에서도 BOOT 로그를 읽을 수 있다(APP·CADDY 는 인스턴스가 없어 안 된다).
   */
  hasBootDiagnostics: z.boolean().prefault(false),
  /** 생성 시각 */
  createdAt: z.string().nullable().prefault(null),
  /** 수정 시각 */
  updatedAt: z.string().nullable().prefault(null),
});

/**
 * 조회할 서버 로그 종류. 실행 형태(NATIVE/DOCKER)와 무관한 논리적 소스다 — 서버가
 * 형태별 실제 셸 명령으로 옮긴다. APP=앱이 뭘 찍었나 · BOOT=왜 안 떴나(부트스트랩) ·
 * CADDY=HTTPS 종단.
 */
const serverLogSourceSchema = z.enum(['APP', 'BOOT', 'CADDY']);

/**
 * GET /servers/{serverId}/logs 응답. 살아있는 인스턴스에서 SSM 으로 tail 한 최근 로그다 —
 * 종료된 서버는 인스턴스가 없어 조회되지 않는다. content 는 매우 길면 SSM 인라인 한계로 잘릴 수 있다.
 */
const getServerLogsResSchema = z.object({
  serverId: z.number().int(),
  source: z.string(),
  content: z.string().nullable().prefault(''),
});

/** GET /projects/{projectId}/servers 응답 */
const getProjectServerListResSchema = z.array(provisionedServerSchema);

/** POST /projects/{projectId}/servers 요청. instanceType 을 비우면 서버가 t3.micro 를 쓴다 */
const postProjectServerReqSchema = z.object({
  instanceType: z.string().optional(),
});

/**
 * POST /projects/{projectId}/servers 응답.
 *
 * 과금 자원이라 서버는 항상 승인 대기로 돌려준다(requiresApproval=true). 그래도 값을
 * 그대로 읽어 화면을 가른다 — "항상 true" 를 FE 가 가정해 버리면 나중에 정책이 바뀌었을 때
 * 화면만 조용히 틀린 안내를 계속하게 된다.
 */
const postProjectServerResSchema = z.object({
  /** 승인이 필요한지 */
  requiresApproval: z.boolean(),
  /** 생성 대기 행의 ID */
  serverId: z.number().int().nullable().prefault(null),
  /** 생성된 승인 ID 목록 */
  approvalIds: z.array(z.number().int()).prefault([]),
});

type ServerStatus = z.infer<typeof serverStatusSchema>;
type ProvisionedServer = z.infer<typeof provisionedServerSchema>;
type GetProjectServerListResType = z.infer<typeof getProjectServerListResSchema>;
type PostProjectServerReqType = z.infer<typeof postProjectServerReqSchema>;
type PostProjectServerResType = z.infer<typeof postProjectServerResSchema>;
type ServerLogSource = z.infer<typeof serverLogSourceSchema>;
type GetServerLogsResType = z.infer<typeof getServerLogsResSchema>;

export {
  serverStatusSchema,
  provisionedServerSchema,
  getProjectServerListResSchema,
  postProjectServerReqSchema,
  postProjectServerResSchema,
  serverLogSourceSchema,
  getServerLogsResSchema,
  type ServerStatus,
  type ProvisionedServer,
  type GetProjectServerListResType,
  type PostProjectServerReqType,
  type PostProjectServerResType,
  type ServerLogSource,
  type GetServerLogsResType,
};
