import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import {
  getPreviewSessionLogsResSchema,
  getPreviewSessionStatusResSchema,
  getProjectPreviewSessionParamsSchema,
  getProjectPreviewSessionResSchema,
  postProjectPreviewSessionResSchema,
  postPreviewAccessResSchema,
  type GetPreviewSessionLogsResType,
  type GetPreviewSessionStatusResType,
  type GetProjectPreviewSessionResType,
  type PostProjectPreviewSessionResType,
  type PostPreviewAccessResType,
} from '@/types/preview.type';

const PROJECT_PREVIEW_POLL_MS = 4000;

/**
 * 떠 있는 프리뷰를 다시 확인하는 간격.
 *
 * 조회 자체가 정리 경로다 — 서버는 ACTIVE 행을 읽을 때 컨테이너가 실제로 있는지 한 번
 * 보고, 없으면 그 자리에서 EXPIRED 로 내리고 빈 값을 준다. 그래서 이 폴링은 상태를
 * 구경하는 게 아니라 **죽은 세션을 실제로 걷어낸다.**
 *
 * 화면은 프레임이 살아 있는지 알 수 없다(다른 오리진이라 404 도 onload 로 온다).
 * 이 조회가 그걸 대신 알아봐 주는 유일한 길이라 ACTIVE 일 때도 멈추지 않는다.
 *
 * 30초는 짧지 않다 — 사라진 컨테이너는 사용자가 뭘 하든 안 돌아오므로 급할 이유가 없고,
 * 이 조회는 컨테이너 확인을 한 번 곁들이므로 공짜도 아니다.
 */
const ACTIVE_PREVIEW_RECHECK_MS = 30_000;

function unwrapApiData<T>(body: T | ApiResponse<T>): T {
  if (body && typeof body === 'object' && 'data' in body && body.data != null) {
    return body.data;
  }
  return body as T;
}

function emptyProjectPreviewSession(projectId: number): GetProjectPreviewSessionResType {
  return getProjectPreviewSessionResSchema.parse({
    sessionId: '',
    projectId,
    taskId: null,
    status: null,
    previewUrl: '',
    expiresAt: '',
    failureReason: '',
  });
}

/** Preview 세션 종료 API DELETE */
async function deletePreviewSession(sessionId: string) {
  return Http.instance
    .delete(`/preview-sessions/${sessionId}`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** Preview 세션 상태 조회 API GET */
async function getPreviewSessionStatus(sessionId: string) {
  return Http.instance
    .get<GetPreviewSessionStatusResType>(`/preview-sessions/${sessionId}/status`)
    .then((response) => {
      const data = succesResponse<GetPreviewSessionStatusResType>(response);
      return getPreviewSessionStatusResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** Preview 세션 로그 조회 API GET */
async function getPreviewSessionLogs(sessionId: string) {
  return Http.instance
    .get<GetPreviewSessionLogsResType>(`/preview-sessions/${sessionId}/logs`)
    .then((response) => {
      const data = succesResponse<GetPreviewSessionLogsResType>(response);
      return getPreviewSessionLogsResSchema.parse(data);
    })
    .catch(errorResponse());
}

/**
 * 프리뷰 열람 권한 발급 API POST. iframe 표시 직전에 호출한다.
 * accessToken이 회전되므로 응답의 previewUrl만 유효하고, 이전에 받은 주소는 즉시 404가 된다.
 * 소유권 쿠키(HttpOnly)는 withCredentials로 브라우저가 자동 보관한다.
 */
async function postPreviewSessionAccess(sessionId: string) {
  return Http.instance
    .post<ApiResponse<PostPreviewAccessResType>>(`/preview-sessions/${sessionId}/access`)
    .then((response) => {
      const body = succesResponse<ApiResponse<PostPreviewAccessResType>>(response);
      return postPreviewAccessResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트의 현재 프리뷰 조회 API GET. 세션이 없으면 204 → 빈 세션 */
async function getProjectPreviewSession(projectId: number) {
  const { projectId: id } = getProjectPreviewSessionParamsSchema.parse({ projectId });

  return Http.instance
    .get<ApiResponse<GetProjectPreviewSessionResType>>(`/projects/${id}/preview-session`, {
      validateStatus: (status) => status === 200 || status === 204,
    })
    .then((response) => {
      const body = response.data as ApiResponse<GetProjectPreviewSessionResType> | '' | null | undefined;
      if (response.status === 204 || body == null || body === '') {
        return emptyProjectPreviewSession(id);
      }

      return getProjectPreviewSessionResSchema.parse({
        ...emptyProjectPreviewSession(id),
        ...unwrapApiData(body),
      });
    })
    .catch(errorResponse());
}

/**
 * 프로젝트 프리뷰 띄우기 API POST.
 *
 * **새로 빌드했는지 여부는 본문이 아니라 상태 코드로 온다.** 서버는 컨테이너가 이미 떠
 * 있으면 다시 빌드하지 않고 그 세션에 도로 붙이는데, 그 구분이 200/202 다:
 *
 * - **200** — 살아 있던 컨테이너에 다시 연결했다. 리빌드하지 않았고 바로 쓸 수 있다
 * - **202** — 새로 빌드를 시작했거나 이미 준비 중이다. 상태를 지켜봐야 한다
 *
 * 응답 DTO 에는 이 구분이 없어서 상태 코드가 유일한 근거다. 그래서 여기서 같이 돌려준다 —
 * 세션 ID 가 같은지로 짐작할 수도 있지만 그건 우연히 맞는 방식이고, 계약은 이쪽이다.
 *
 * `force` 를 주면 붙지 않고 항상 새로 빌드한다 — 떠 있던 컨테이너를 버리고 preview 브랜치를
 * 다시 받아 온다. **멀쩡한 프리뷰도 죽이므로** 자동 재시도에 물리면 안 되고, 사용자가
 * 그러기로 정했을 때만 보낸다. force 요청은 언제나 202 라 재연결 판정과 부딪히지 않는다.
 */
async function postProjectPreviewSession(projectId: number, { force = false } = {}) {
  const { projectId: id } = getProjectPreviewSessionParamsSchema.parse({ projectId });

  return Http.instance
    .post<ApiResponse<PostProjectPreviewSessionResType>>(`/projects/${id}/preview-session`, undefined, {
      // 켤 때만 붙인다 — 기본 요청은 지금까지와 한 글자도 다르지 않게 둔다
      params: force ? { force: true } : undefined,
      validateStatus: (status) => status === 200 || status === 202,
    })
    .then((response) => {
      const body = succesResponse<ApiResponse<PostProjectPreviewSessionResType>>(response);
      return {
        session: postProjectPreviewSessionResSchema.parse({
          ...emptyProjectPreviewSession(id),
          ...unwrapApiData(body),
        }),
        /** 200 이면 리빌드 없이 살아 있던 컨테이너에 다시 붙은 것이다 */
        reattached: response.status === 200,
      };
    })
    .catch(errorResponse());
}

/**
 * ACTIVE 세션의 열람 권한 발급 쿼리. frameKey가 바뀌면(새로고침) 재발급한다.
 * 발급마다 토큰이 회전되므로 자동 refetch는 모두 끈다 — 회전되면 떠 있는 iframe의 주소가 무효가 된다.
 */
function usePreviewAccessQuery(queryKey: unknown, sessionId: string | null, frameKey: number) {
  if (!queryKey) throw new Error('queryKey is required');

  return useQuery({
    queryKey: ['preview-access', queryKey, sessionId, frameKey],
    queryFn: () => postPreviewSessionAccess(sessionId as string),
    enabled: typeof sessionId === 'string' && sessionId.length > 0,
    gcTime: 0,
    staleTime: Infinity,
    // 재시도도 토큰을 회전시킨다 — 첫 응답이 늦게 도착하면 그 주소가 이미 무효라 404가 된다.
    // 실패는 그대로 드러내고, 사용자가 새로고침(frameKey)으로 다시 발급받게 둔다.
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * 프로젝트의 현재 프리뷰 세션 쿼리.
 * isAgentTaskActive는 Agent 작업이 도는 중인지 — 세션이 아직 없어도 폴링을 유지할지 결정한다.
 */
function useProjectPreviewQuery(
  queryKey: unknown,
  projectId: number,
  isAgentTaskActive = false,
) {
  if (!queryKey) throw new Error('queryKey is required');

  return useQuery({
    queryKey: ['project-preview-session', queryKey, projectId],
    queryFn: () => getProjectPreviewSession(projectId),
    enabled: Number.isInteger(projectId) && projectId > 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PROVISIONING') return PROJECT_PREVIEW_POLL_MS;
      // 세션이 아직 없어도(204) Agent 작업 중이면 계속 지켜본다.
      // CODE 스텝이 세션을 만드는 시점은 이 쿼리의 첫 조회보다 늦을 수 있는데,
      // 여기서 멈추면 PROVISIONING → ACTIVE 전이를 통째로 놓치고 작업이 끝날 때까지
      // "프리뷰 없음" 화면이 남는다.
      if (isAgentTaskActive && status == null) return PROJECT_PREVIEW_POLL_MS;
      // 떠 있어도 계속 확인한다. 컨테이너가 밖에서 죽는 일이 있고(도커 재시작·외부 정리),
      // 그때 이 조회가 세션을 정리해 줘야 화면이 "다시 띄우기" 로 돌아올 수 있다.
      //
      // 세션 status 만 따로 읽으면 안 된다 — 그 값은 TTL 30분까지 ACTIVE 로 남는다.
      // 컨테이너 확인이 붙어 있는 건 이 조회 쪽이다.
      if (status === 'ACTIVE') return ACTIVE_PREVIEW_RECHECK_MS;
      return false;
    },
  });
}

export {
  deletePreviewSession,
  getPreviewSessionStatus,
  getPreviewSessionLogs,
  getProjectPreviewSession,
  postProjectPreviewSession,
  postPreviewSessionAccess,
  usePreviewAccessQuery,
  useProjectPreviewQuery,
};
