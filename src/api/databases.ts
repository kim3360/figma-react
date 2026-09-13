import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import {
  getProjectDatabaseListResSchema,
  postProjectDatabaseReqSchema,
  postProjectDatabaseResSchema,
  type GetProjectDatabaseListResType,
  type PostProjectDatabaseReqType,
  type PostProjectDatabaseResType,
} from '@/types/database.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

const DATABASE_POLL_MS = 5000;
const EXPIRING_DATABASE_POLL_MS = 30000;

/** 서버가 알아서 다음 상태로 옮기는 중인 DB */
const TRANSITIONAL_DATABASE_STATUSES = new Set(['PENDING', 'PROVISIONING']);

/** 프로젝트 DB 목록 조회 API GET. 서버가 EXPIRED 를 제외하고 활성 자원만 준다 */
async function getProjectDatabaseList(projectId: number) {
  return Http.instance
    .get<ApiResponse<GetProjectDatabaseListResType>>(`/projects/${projectId}/databases`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectDatabaseListResType>>(response);
      return getProjectDatabaseListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * 프로젝트 DB 생성 API POST.
 * 응답의 password 는 이 한 번만 내려온다 — 이후 조회에는 없으므로 호출부가 사용자에게 보여줘야 한다.
 */
async function postProjectDatabase(projectId: number, params: PostProjectDatabaseReqType) {
  const payload = postProjectDatabaseReqSchema.parse(params);

  return Http.instance
    .post<ApiResponse<PostProjectDatabaseResType>>(`/projects/${projectId}/databases`, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<PostProjectDatabaseResType>>(response);
      return postProjectDatabaseResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * DB 삭제 API DELETE.
 *
 * 경로에 projectId 가 없다 — 서버가 databaseId 로 소유권을 확인한다(서버 종료와 같은 모양).
 * 204 라 응답 본문이 없으므로 파싱하지 않는다. 멱등이라 이미 지워진 DB 에도 안전하다.
 */
async function deleteProjectDatabase(databaseId: number) {
  return Http.instance
    .delete<ApiResponse<null>>(`/databases/${databaseId}`)
    .then(() => undefined)
    .catch(errorResponse());
}

/**
 * 프로젝트 DB 목록 조회 Query Hook.
 *
 * 프로비저닝 중인 자원이 있으면 폴링한다 — LOCAL 은 몇 초, RDS 는 5~10분 걸리고 그동안
 * 서버가 상태를 옮기므로, 폴링하지 않으면 사용자가 새로고침할 때까지 PROVISIONING 에 멈춰 있다.
 *
 * 만료 시각이 있는 자원(LOCAL)은 상태가 READY 여도 느리게 계속 읽는다. 회수 워커가
 * EXPIRED 로 넘기면 목록에서 빠지는데, 폴링을 멈추면 이미 사라진 DB 가 화면에 남는다.
 * 이 재조회가 남은 시간 표시도 함께 갱신해서 별도 타이머가 필요 없다.
 *
 * 목록은 순수 DB 조회라 폴링 비용이 싸다(개요처럼 외부 API 를 때리지 않는다).
 */
function useProjectDatabaseListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-database-list', queryKey, projectId],
    queryFn: () => getProjectDatabaseList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
    refetchInterval: (query) => {
      const databases = query.state.data;
      if (!databases?.length) return false;
      if (databases.some((database) => TRANSITIONAL_DATABASE_STATUSES.has(database.status))) {
        return DATABASE_POLL_MS;
      }
      if (databases.some((database) => database.expiresAt)) return EXPIRING_DATABASE_POLL_MS;
      return false;
    },
  });
}

export {
  getProjectDatabaseList,
  postProjectDatabase,
  deleteProjectDatabase,
  useProjectDatabaseListQuery,
};
