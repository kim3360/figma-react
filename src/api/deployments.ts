import Http from '@/utils/httpClients';
import { useQuery } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import {
  deployResponseSchema,
  deploymentFailureAnalysisSchema,
  deploymentLogsSchema,
  deploymentStatusSchema,
  getProjectDeploymentCandidateListResSchema,
  getProjectDeploymentListResSchema,
  getProjectVersionListResSchema,
  postProjectDeploymentCreateReqSchema,
  versionDetailSchema,
  type DeployResponse,
  type DeploymentFailureAnalysis,
  type DeploymentLogs,
  type DeploymentStatus,
  type GetProjectDeploymentCandidateListResType,
  type GetProjectDeploymentListResType,
  type GetProjectVersionListResType,
  type PostProjectDeploymentCreateReqType,
  type VersionDetail,
} from '@/types/deployment.type';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/** 배포 이력 목록 조회 API GET */
async function getProjectDeploymentList(projectId: number) {
  return Http.instance
    .get<GetProjectDeploymentListResType>(`/projects/${projectId}/deployments`)
    .then((response) => {
      const body = succesResponse<GetProjectDeploymentListResType>(response);
      return getProjectDeploymentListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/**
 * 배포 요청 API POST.
 *
 * 프론트 호스팅이 셋(GitHub Pages · S3 · EC2)이라 이름을 Pages 로 부르지 않는다.
 * 응답의 approvalIds 가 비어 있지 않으면 **승인 전까지 아무것도 진행되지 않으므로**,
 * 호출부는 그 값을 반드시 읽어야 한다.
 */
async function postProjectDeploymentCreate(
  projectId: number,
  params: PostProjectDeploymentCreateReqType,
) {
  const payload = postProjectDeploymentCreateReqSchema.parse(params);

  return Http.instance
    .post(`/projects/${projectId}/deployments`, payload)
    .then((response) => {
      const body = succesResponse(response);
      if (body == null || body === '') return undefined;
      return deployResponseSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 배포 재시도 API POST */
async function postDeploymentRetry(deploymentId: number) {
  return Http.instance
    .post<DeployResponse>(`/deployments/${deploymentId}/retry`)
    .then((response) => {
      const body = succesResponse<DeployResponse>(response);
      return deployResponseSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 배포 실패 분석 조회 API GET */
async function getDeploymentFailureAnalysis(deploymentId: number) {
  return Http.instance
    .get<DeploymentFailureAnalysis>(`/deployments/${deploymentId}/failure-analysis`)
    .then((response) => {
      const body = succesResponse<DeploymentFailureAnalysis>(response);
      return deploymentFailureAnalysisSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 배포 실패 분석 요청 API POST */
async function postDeploymentFailureAnalysis(deploymentId: number) {
  return Http.instance
    .post<DeploymentFailureAnalysis>(`/deployments/${deploymentId}/failure-analysis`)
    .then((response) => {
      const body = succesResponse<DeploymentFailureAnalysis>(response);
      return deploymentFailureAnalysisSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 버전 상세 조회 API GET */
async function getVersionDetail(versionId: number) {
  return Http.instance
    .get<VersionDetail>(`/versions/${versionId}`)
    .then((response) => {
      const body = succesResponse<VersionDetail>(response);
      return versionDetailSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 버전 목록 조회 API GET */
async function getProjectVersionList(projectId: number) {
  return Http.instance
    .get<GetProjectVersionListResType>(`/projects/${projectId}/versions`)
    .then((response) => {
      const body = succesResponse<GetProjectVersionListResType>(response);
      return getProjectVersionListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 배포 가능 후보 목록 조회 API GET */
async function getProjectDeploymentCandidateList(projectId: number) {
  return Http.instance
    .get<GetProjectDeploymentCandidateListResType>(`/projects/${projectId}/deployment-candidates`)
    .then((response) => {
      const body = succesResponse<GetProjectDeploymentCandidateListResType>(response);
      return getProjectDeploymentCandidateListResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 배포 상태 조회 API GET */
async function getDeploymentStatus(deploymentId: number) {
  return Http.instance
    .get<DeploymentStatus>(`/deployments/${deploymentId}`)
    .then((response) => {
      const body = succesResponse<DeploymentStatus>(response);
      return deploymentStatusSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 배포 로그 조회 API GET */
async function getDeploymentLogs(deploymentId: number) {
  return Http.instance
    .get<DeploymentLogs>(`/deployments/${deploymentId}/logs`)
    .then((response) => {
      const body = succesResponse<DeploymentLogs>(response);
      return deploymentLogsSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

function useProjectDeploymentListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-deployment-list', queryKey, projectId],
    queryFn: () => getProjectDeploymentList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export {
  getProjectDeploymentList,
  postProjectDeploymentCreate,
  postDeploymentRetry,
  getDeploymentFailureAnalysis,
  postDeploymentFailureAnalysis,
  getVersionDetail,
  getProjectVersionList,
  getProjectDeploymentCandidateList,
  getDeploymentStatus,
  getDeploymentLogs,
  useProjectDeploymentListQuery,
};
