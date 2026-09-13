import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import {
  getProjectServerListResSchema,
  getServerLogsResSchema,
  postProjectServerReqSchema,
  postProjectServerResSchema,
  type GetProjectServerListResType,
  type GetServerLogsResType,
  type PostProjectServerReqType,
  type PostProjectServerResType,
  type ServerLogSource,
} from '@/types/server.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/** 서버가 스스로 다음 단계로 넘기는 중 — 빌드·인스턴스 생성·헬스체크가 수 분 걸린다 */
const BUILDING_SERVER_POLL_MS = 5000;
/** 승인 대기는 사람이 누르기를 기다리는 시간이라 자주 볼 이유가 없다 */
const AWAITING_APPROVAL_POLL_MS = 15000;

/** 워커가 알아서 다음 상태로 옮기는 중인 서버 */
const TRANSITIONAL_SERVER_STATUSES = new Set(['QUEUED', 'BUILDING', 'PROVISIONING']);

/** 프로젝트 EC2 서버 목록 조회 API GET */
async function getProjectServerList(projectId: number) {
  return Http.instance
    .get<ApiResponse<GetProjectServerListResType>>(`/projects/${projectId}/servers`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectServerListResType>>(response);
      return getProjectServerListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * 프로젝트 EC2 서버 생성 요청 API POST.
 * 과금 자원이라 서버가 대기 행과 승인만 만들고 끝난다 — 실제 빌드·인스턴스 생성은 승인 후 워커가 한다.
 */
async function postProjectServer(projectId: number, params: PostProjectServerReqType = {}) {
  const payload = postProjectServerReqSchema.parse(params);

  return Http.instance
    .post<ApiResponse<PostProjectServerResType>>(`/projects/${projectId}/servers`, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<PostProjectServerResType>>(response);
      return postProjectServerResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * EC2 서버 종료 API POST. 인스턴스를 끄고 부수 자원(SSM·S3)까지 정리한다.
 *
 * 경로에 projectId 가 없다 — 서버가 serverId 로 소유권을 확인한다.
 * 응답 본문이 없으므로 파싱하지 않는다. 멱등이라 이미 종료된 서버에도 안전하다.
 */
async function postServerTerminate(serverId: number) {
  return Http.instance
    .post<ApiResponse<null>>(`/servers/${serverId}/terminate`)
    .then(() => undefined)
    .catch(errorResponse());
}

/**
 * EC2 서버 최근 로그 조회 API GET.
 *
 * 살아있는 인스턴스에서 SSM Run Command 로 tail 한다 — 종료된 서버는 인스턴스가 없어
 * 서버가 오류로 막는다(그때 errorResponse 가 메시지를 던진다). 조회 시점마다 새로 tail 하므로
 * 캐시하지 않는다.
 */
/**
 * 로그 요청에만 거는 상한.
 *
 * 서버는 인스턴스에 명령을 보내고 최대 38.5초까지 응답을 기다린다 — 부팅 직후나 인증서
 * 발급 중이면 에이전트가 늦게 집어간다. 그보다 먼저 끊으면 서버가 늘려 둔 예산이
 * 무의미해지므로 넉넉히 위에 둔다.
 *
 * 무제한(axios 기본값)으로 두지 않는 이유는 반대쪽이다 — 응답이 영영 안 오면 스피너가
 * 영원히 돌고 사용자는 기다릴지 말지도 판단할 수 없다. 서버가 스스로 끊는 시점을 넘겨서
 * 걸어 두면 정상 동작을 방해하지 않으면서 그 경우만 잡는다.
 */
const SERVER_LOG_TIMEOUT_MS = 60_000;

async function getServerLogs(serverId: number, source: ServerLogSource) {
  return Http.instance
    .get<ApiResponse<GetServerLogsResType>>(`/servers/${serverId}/logs`, {
      params: { source },
      timeout: SERVER_LOG_TIMEOUT_MS,
    })
    .then((response) => {
      const body = succesResponse<ApiResponse<GetServerLogsResType>>(response);
      return getServerLogsResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * 프로젝트 EC2 서버 목록 조회 Query Hook.
 *
 * 빌드·인스턴스 생성이 수 분 걸리고 그동안 워커가 상태를 옮기므로, 폴링하지 않으면
 * 사용자가 새로고침할 때까지 BUILDING 에 멈춰 있다.
 *
 * 승인 대기(PENDING)도 계속 읽되 느리게 읽는다 — 승인은 채팅 탭에서 이뤄져서 이 화면이
 * 그 사실을 달리 알 방법이 없는데, 사람이 누르기를 기다리는 시간을 5초마다 두드릴 이유는 없다.
 *
 * 목록은 순수 DB 조회라 폴링 비용이 싸다(개요처럼 외부 API 를 때리지 않는다).
 */
function useProjectServerListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-server-list', queryKey, projectId],
    queryFn: () => getProjectServerList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
    refetchInterval: (query) => {
      const servers = query.state.data;
      if (!servers?.length) return false;
      if (servers.some((server) => TRANSITIONAL_SERVER_STATUSES.has(server.status))) {
        return BUILDING_SERVER_POLL_MS;
      }
      if (servers.some((server) => server.status === 'PENDING')) return AWAITING_APPROVAL_POLL_MS;
      return false;
    },
  });
}

export {
  getProjectServerList,
  getServerLogs,
  postProjectServer,
  postServerTerminate,
  useProjectServerListQuery,
};
