import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import {
  domainBindingSubmissionSchema,
  domainSchema,
  getDomainSearchResSchema,
  getDomainVerificationGuideResSchema,
  getProjectDomainListResSchema,
  postProjectDomainBindReqSchema,
  type Domain,
  type DomainBindingSubmission,
  type GetDomainSearchResType,
  type GetDomainVerificationGuideResType,
  type GetProjectDomainListResType,
  type PostProjectDomainBindReqType,
  getHostingTargetsResSchema,
  type GetHostingTargetsResType,
} from '@/types/domain.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/**
 * 이 서버가 붙일 수 있는 호스팅 대상 목록 조회 API GET.
 *
 * **운영 백엔드에는 아직 이 엔드포인트가 없다.** 그래서 실패를 정상 경로로 다룬다 —
 * 못 읽으면 운영이 실제로 지원하는 둘로 떨어진다. 화면이 서버보다 앞서 나가서 "고를 수는
 * 있는데 누르면 실패하는" 옵션을 내보이던 문제를 이 폴백이 막는다.
 *
 * 나중에 운영에도 이 엔드포인트가 생기면 폴백은 저절로 안 쓰이게 된다.
 */
const FALLBACK_HOSTING_TARGETS = ['GITHUB_PAGES', 'AWS'];

async function getHostingTargets(): Promise<string[]> {
  return Http.instance
    .get<GetHostingTargetsResType>('/domains/hosting-targets')
    .then((response) => {
      const body = succesResponse<GetHostingTargetsResType>(response);
      return getHostingTargetsResSchema.parse(unwrapApiData(body)).hostingTargets;
    })
    .catch(() => FALLBACK_HOSTING_TARGETS);
}

/**
 * 호스팅 대상 목록 Query Hook. 서버 배포로만 바뀌는 값이라 폴링하지 않는다.
 *
 * 실패해도 화면이 멈추지 않는다 — 조회 함수가 폴백을 돌려주므로 오류 상태가 없다.
 */
function useHostingTargetsQuery(queryKey: unknown) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['hosting-targets', queryKey],
    queryFn: getHostingTargets,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** 프로젝트 도메인 목록 조회 API GET */
async function getProjectDomainList(projectId: number) {
  return Http.instance
    .get<GetProjectDomainListResType>(`/projects/${projectId}/domains`)
    .then((response) => {
      const body = succesResponse<GetProjectDomainListResType>(response);
      return getProjectDomainListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 도메인 연결 요청 API POST */
async function postProjectDomainBind(projectId: number, params: PostProjectDomainBindReqType) {
  const payload = postProjectDomainBindReqSchema.parse(params);

  return Http.instance
    .post(`/projects/${projectId}/domains`, payload)
    .then((response) => {
      const body = succesResponse(response);
      if (body == null || body === '') return undefined;
      return domainBindingSubmissionSchema.parse(unwrapApiData(body)) as DomainBindingSubmission;
    })
    .catch(errorResponse());
}

/** DNS 검증 재시도 API POST */
async function postDomainVerificationCheck(domainId: number) {
  return Http.instance
    .post<Domain>(`/domains/${domainId}/verification-checks`)
    .then((response) => {
      const body = succesResponse<Domain>(response);
      return domainSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 도메인 상태 조회 API GET */
async function getDomainDetail(domainId: number) {
  return Http.instance
    .get<Domain>(`/domains/${domainId}`)
    .then((response) => {
      const body = succesResponse<Domain>(response);
      return domainSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * 도메인 연결 해제 API DELETE.
 *
 * **바로 지워지지 않는다.** 서버는 해제를 작업으로 접수하고 202 를 돌려주는데, 그
 * 작업은 사람이 승인해야 진행된다 — 붙일 때와 마찬가지다. 즉 202 는 "지웠다" 가 아니라
 * "접수했으니 승인해 달라" 는 뜻이다.
 *
 * 그래서 접수 여부를 같이 돌려준다. 이걸 구분하지 않으면 화면이 곧바로 목록을 다시
 * 읽고, 도메인이 그대로 있으니 **누른 사람은 아무 일도 안 일어난 것으로 본다.**
 */
async function deleteDomain(domainId: number) {
  return Http.instance
    .delete(`/domains/${domainId}`)
    .then((response) => {
      succesResponse(response);
      /** 202 면 승인을 기다리는 중이다. 그 외(200·204)는 그 자리에서 끝난 것이다 */
      return { acceptedForApproval: response.status === 202 };
    })
    .catch(errorResponse());
}

/** DNS 검증 가이드 조회 API GET */
async function getDomainVerificationGuide(domainId: number) {
  return Http.instance
    .get<GetDomainVerificationGuideResType>(`/domains/${domainId}/verification-guide`)
    .then((response) => {
      const body = succesResponse<GetDomainVerificationGuideResType>(response);
      return getDomainVerificationGuideResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 도메인 검색 API GET */
async function getDomainSearch(keyword: string) {
  return Http.instance
    .get<GetDomainSearchResType>('/domain-search', { params: { keyword } })
    .then((response) => {
      const body = succesResponse<GetDomainSearchResType>(response);
      return getDomainSearchResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

const DOMAIN_POLL_MS = 10000;
/** 약 20분. 서버가 확정을 못 하는 경우가 있어 상한 없이는 폴링이 안 멈춘다 */
const MAX_DOMAIN_POLLS = 120;

/** 서버가 알아서 다음 상태로 옮기는 중인 도메인 */
const TRANSITIONAL_DOMAIN_STATUSES = new Set(['REQUESTED', 'PROVISIONING', 'VERIFYING']);

/**
 * 프로젝트 도메인 목록 조회 Query Hook.
 * 확정 대기 중인 도메인이 있으면 폴링한다 — 검증은 서버 워커가 1분마다 돌려 확정하므로,
 * 폴링하지 않으면 사용자가 새로고침할 때까지 화면이 VERIFYING 에 멈춰 있다.
 */
function useProjectDomainListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-domain-list', queryKey, projectId],
    queryFn: () => getProjectDomainList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
    refetchInterval: (query) => {
      const domains = query.state.data;
      if (!domains?.some((domain) => TRANSITIONAL_DOMAIN_STATUSES.has(domain.status))) return false;
      if (query.state.dataUpdateCount > MAX_DOMAIN_POLLS) return false;
      return DOMAIN_POLL_MS;
    },
  });
}

export {
  getHostingTargets,
  useHostingTargetsQuery,
  FALLBACK_HOSTING_TARGETS,
  getProjectDomainList,
  postProjectDomainBind,
  postDomainVerificationCheck,
  getDomainDetail,
  deleteDomain,
  getDomainVerificationGuide,
  getDomainSearch,
  useProjectDomainListQuery,
};
