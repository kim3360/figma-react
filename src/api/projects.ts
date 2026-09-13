import Http from '@/utils/httpClients';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorResponse, succesResponse, unwrapApiData } from '@/utils/response';
import type { ApiResponse } from '@/types/response.type';
import type { DeployStatus } from '@/types/common.enum';
import {
  deleteProjectParamsSchema,
  getProjectDetailParamsSchema,
  getProjectDetailResSchema,
  getProjectListResSchema,
  getGithubRepositoryListResSchema,
  getProjectActivityLogListResSchema,
  getProjectCommitListResSchema,
  getProjectOverviewResSchema,
  getProjectRepositoryHealthResSchema,
  patchProjectReqSchema,
  postProjectCreateReqSchema,
  postProjectCreateResSchema,
  postProjectRepositoryReqSchema,
  postProjectRepositoryResSchema,
  type DeleteProjectParamsType,
  type GetProjectDetailResType,
  type GetProjectListResType,
  type GetGithubRepositoryListResType,
  type GetProjectActivityLogListResType,
  type GetProjectCommitListResType,
  type GetProjectOverviewResType,
  type GetProjectRepositoryHealthResType,
  type PatchProjectReqType,
  type PostProjectCreateReqType,
  type PostProjectCreateResType,
  type PostProjectRepositoryReqType,
  type PostProjectRepositoryResType,
} from '@/types/projects.type';
import {
  getProjectCostBudgetResSchema,
  getProjectInfrastructureConfigurationHistoryResSchema,
  getProjectInfrastructureConfigurationResSchema,
  getProjectInfrastructureSettingsResSchema,
  getProjectRepositorySettingsResSchema,
  patchProjectChatSettingsReqSchema,
  projectChatSettingsSchema,
  putProjectCostBudgetReqSchema,
  putProjectInfrastructureConfigurationReqSchema,
  putProjectInfrastructureSettingsReqSchema,
  type GetProjectCostBudgetResType,
  type GetProjectInfrastructureConfigurationHistoryResType,
  type GetProjectInfrastructureConfigurationResType,
  type GetProjectInfrastructureSettingsResType,
  type GetProjectRepositorySettingsResType,
  type PatchProjectChatSettingsReqType,
  type ProjectChatSettings,
  type PutProjectCostBudgetReqType,
  type PutProjectInfrastructureConfigurationReqType,
  type PutProjectInfrastructureSettingsReqType,
} from '@/types/projectSettings.type';

const endpoint = '/projects';
const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

/** GitHub 저장소 목록 조회 API GET */
async function getGithubRepositoryList() {
  return Http.instance
    .get<ApiResponse<GetGithubRepositoryListResType>>(`${endpoint}/github/repositories`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetGithubRepositoryListResType>>(response);
      return getGithubRepositoryListResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 목록 조회 API GET */
async function getProjectList() {
  return Http.instance
    .get<ApiResponse<GetProjectListResType>>(endpoint)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectListResType>>(response);
      return getProjectListResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 상세 조회 API GET */
async function getProjectDetail(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<ApiResponse<GetProjectDetailResType>>(`${endpoint}/${id}`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectDetailResType>>(response);
      return getProjectDetailResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

async function getProjectDetailBundle(projectId: number) {
  const [projectResult, overviewResult, commitsResult, activityLogsResult, repositoryHealthResult] =
    await Promise.allSettled([
      getProjectDetail(projectId),
      getProjectOverview(projectId),
      getProjectCommitList(projectId),
      getProjectActivityLogList(projectId),
      getProjectRepositoryHealth(projectId),
    ]);

  if (projectResult.status === 'rejected') {
    throw projectResult.reason;
  }

  // 곁다리 조회는 실패해도 화면을 살리려고 빈 값으로 떨어뜨린다.
  // 그래서 스키마가 어긋나도 콘솔에 아무것도 안 남아 원인을 찾기 어렵다 — 최소한 흔적은 남긴다
  const settledParts = {
    overview: overviewResult,
    commits: commitsResult,
    activityLogs: activityLogsResult,
    repositoryHealth: repositoryHealthResult,
  };
  Object.entries(settledParts).forEach(([name, result]) => {
    if (result.status === 'rejected') {
      console.warn(`[project-detail] ${name} 조회 실패 — 빈 값으로 표시합니다`, result.reason);
    }
  });

  return {
    project: projectResult.value,
    overview: overviewResult.status === 'fulfilled' ? overviewResult.value : undefined,
    commits: commitsResult.status === 'fulfilled' ? commitsResult.value : [],
    activityLogs: activityLogsResult.status === 'fulfilled' ? activityLogsResult.value : [],
    repositoryHealth:
      repositoryHealthResult.status === 'fulfilled' ? repositoryHealthResult.value : undefined,
  };
}

/** 프로젝트 생성 API POST */
async function postProjectCreate(params: PostProjectCreateReqType) {
  const payload = postProjectCreateReqSchema.parse(params);

  return Http.instance
    .post<ApiResponse<PostProjectCreateResType>>(endpoint, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<PostProjectCreateResType>>(response);
      return postProjectCreateResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 활동 로그 조회 API GET */
async function getProjectActivityLogList(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<ApiResponse<GetProjectActivityLogListResType>>(`${endpoint}/${id}/activity-logs`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectActivityLogListResType>>(response);
      return getProjectActivityLogListResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 커밋 목록 조회 API GET */
async function getProjectCommitList(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<ApiResponse<GetProjectCommitListResType>>(`${endpoint}/${id}/commits`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectCommitListResType>>(response);
      return getProjectCommitListResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 개요 조회 API GET */
async function getProjectOverview(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<ApiResponse<GetProjectOverviewResType>>(`${endpoint}/${id}/overview`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectOverviewResType>>(response);
      return getProjectOverviewResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 저장소 health 확인 API GET */
async function getProjectRepositoryHealth(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<ApiResponse<GetProjectRepositoryHealthResType>>(`${endpoint}/${id}/repository-health`)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectRepositoryHealthResType>>(response);
      return getProjectRepositoryHealthResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 GitHub 저장소 연결 API POST */
async function postProjectRepository(projectId: number, params: PostProjectRepositoryReqType) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });
  const payload = postProjectRepositoryReqSchema.parse(params);

  return Http.instance
    .post<ApiResponse<PostProjectRepositoryResType>>(`${endpoint}/${id}/repository`, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<PostProjectRepositoryResType>>(response);
      return postProjectRepositoryResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 수정 API PATCH */
async function patchProject(projectId: number, params: PatchProjectReqType) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });
  const payload = patchProjectReqSchema.parse(params);

  return Http.instance
    .patch<ApiResponse<GetProjectDetailResType>>(`${endpoint}/${id}`, payload)
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectDetailResType>>(response);
      return getProjectDetailResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** 프로젝트 삭제 API DELETE */
async function deleteProject(params: DeleteProjectParamsType) {
  const { projectId, deleteMode } = deleteProjectParamsSchema.parse(params);
  const query = deleteMode != null ? { deleteMode } : undefined;

  return Http.instance
    .delete(`${endpoint}/${projectId}`, { params: query })
    .then(succesResponse)
    .catch(errorResponse());
}

/** 프로젝트 GitHub 저장소 연결 해제 API DELETE */
async function deleteProjectRepository(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .delete(`${endpoint}/${id}/repository`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 프로젝트 Chat 승인 정책 조회 API GET */
async function getProjectChatSettings(projectId: number) {
  return Http.instance
    .get<ProjectChatSettings>(`${endpoint}/${projectId}/settings/chat`)
    .then((response) => {
      const body = succesResponse<ProjectChatSettings>(response);
      return projectChatSettingsSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 Chat 승인 정책 수정 API PATCH */
async function patchProjectChatSettings(
  projectId: number,
  params: PatchProjectChatSettingsReqType,
) {
  const payload = patchProjectChatSettingsReqSchema.parse(params);

  return Http.instance
    .patch<ProjectChatSettings>(`${endpoint}/${projectId}/settings/chat`, payload)
    .then((response) => {
      const body = succesResponse<ProjectChatSettings>(response);
      return projectChatSettingsSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 Infrastructure 설정 조회 API GET */
async function getProjectInfrastructureSettings(projectId: number) {
  return Http.instance
    .get<GetProjectInfrastructureSettingsResType>(
      `${endpoint}/${projectId}/settings/infrastructure`,
    )
    .then((response) => {
      const body = succesResponse<GetProjectInfrastructureSettingsResType>(response);
      const payload = unwrapApiData(body);
      // 선택된 클라우드 연결이 없으면 서버가 data: null 을 준다. 오류가 아니라 정상 상태라
      // 파싱하지 않고 그대로 비운다 — 호출부는 이미 optional chaining 으로 읽는다
      if (payload == null) return null;
      return getProjectInfrastructureSettingsResSchema.parse(payload);
    })
    .catch(errorResponse());
}

/** 프로젝트 클라우드 연결 선택 API PUT */
async function putProjectInfrastructureSettings(
  projectId: number,
  params: PutProjectInfrastructureSettingsReqType,
) {
  const payload = putProjectInfrastructureSettingsReqSchema.parse(params);

  return Http.instance
    .put<GetProjectInfrastructureSettingsResType>(
      `${endpoint}/${projectId}/settings/infrastructure`,
      payload,
    )
    .then((response) => {
      const body = succesResponse<GetProjectInfrastructureSettingsResType>(response);
      return getProjectInfrastructureSettingsResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 클라우드 연결 선택 해제 API DELETE */
async function deleteProjectInfrastructureSettings(projectId: number) {
  return Http.instance
    .delete(`${endpoint}/${projectId}/settings/infrastructure`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 프로젝트 인프라 구성 조회 API GET */
async function getProjectInfrastructureConfiguration(projectId: number) {
  return Http.instance
    .get<GetProjectInfrastructureConfigurationResType>(
      `${endpoint}/${projectId}/settings/infrastructure/configuration`,
    )
    .then((response) => {
      const body = succesResponse<GetProjectInfrastructureConfigurationResType>(response);
      return getProjectInfrastructureConfigurationResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 인프라 구성 수정 API PUT */
async function putProjectInfrastructureConfiguration(
  projectId: number,
  params: PutProjectInfrastructureConfigurationReqType,
) {
  const payload = putProjectInfrastructureConfigurationReqSchema.parse(params);

  return Http.instance
    .put<GetProjectInfrastructureConfigurationResType>(
      `${endpoint}/${projectId}/settings/infrastructure/configuration`,
      payload,
    )
    .then((response) => {
      const body = succesResponse<GetProjectInfrastructureConfigurationResType>(response);
      return getProjectInfrastructureConfigurationResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 인프라 구성 히스토리 조회 API GET */
async function getProjectInfrastructureConfigurationHistory(projectId: number, limit?: number) {
  return Http.instance
    .get<GetProjectInfrastructureConfigurationHistoryResType>(
      `${endpoint}/${projectId}/settings/infrastructure/configuration/history`,
      { params: limit != null ? { limit } : undefined },
    )
    .then((response) => {
      const body = succesResponse<GetProjectInfrastructureConfigurationHistoryResType>(response);
      return getProjectInfrastructureConfigurationHistoryResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 비용 예산 조회 API GET */
async function getProjectCostBudget(projectId: number) {
  return Http.instance
    .get<GetProjectCostBudgetResType>(`${endpoint}/${projectId}/settings/cost-budget`)
    .then((response) => {
      const body = succesResponse<GetProjectCostBudgetResType>(response);
      return getProjectCostBudgetResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 비용 예산 수정 API PUT */
async function putProjectCostBudget(projectId: number, params: PutProjectCostBudgetReqType) {
  const payload = putProjectCostBudgetReqSchema.parse(params);

  return Http.instance
    .put<GetProjectCostBudgetResType>(`${endpoint}/${projectId}/settings/cost-budget`, payload)
    .then((response) => {
      const body = succesResponse<GetProjectCostBudgetResType>(response);
      return getProjectCostBudgetResSchema.parse(unwrapApiData(body));
    })
    .catch(errorResponse());
}

/** 프로젝트 비용 예산 삭제 API DELETE */
async function deleteProjectCostBudget(projectId: number) {
  return Http.instance
    .delete(`${endpoint}/${projectId}/settings/cost-budget`)
    .then(succesResponse)
    .catch(errorResponse());
}

/** 프로젝트 저장소 설정 조회 API GET */
async function getProjectRepositorySettings(projectId: number) {
  return Http.instance
    .get<ApiResponse<GetProjectRepositorySettingsResType>>(
      `${endpoint}/${projectId}/settings/repository`,
    )
    .then((response) => {
      const body = succesResponse<ApiResponse<GetProjectRepositorySettingsResType>>(response);
      return getProjectRepositorySettingsResSchema.parse(body.data);
    })
    .catch(errorResponse());
}

/** GitHub 저장소 목록 조회 Query Hook */
function useGithubRepositoryListQuery(queryKey: unknown, options?: { enabled?: boolean }) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['github-repository-list', queryKey],
    queryFn: getGithubRepositoryList,
    enabled: options?.enabled ?? true,
    ...defaultQueryOptions,
  });
}

function useProjectRepositorySettingsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-repository-settings', queryKey, projectId],
    queryFn: () => getProjectRepositorySettings(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

type UseProjectListQueryOptions = {
  enabled?: boolean;
};

/** 프로젝트 목록 조회 Query Hook */
function useProjectListQuery(queryKey: unknown, options?: UseProjectListQueryOptions) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-list', queryKey],
    queryFn: getProjectList,
    enabled: options?.enabled ?? true,
    ...defaultQueryOptions,
  });
}

const DEPLOY_POLL_MS = 5000;

/** 배포가 아직 끝나지 않은 상태 */
function isDeployInFlight(status?: DeployStatus) {
  return status === 'PENDING' || status === 'IN_PROGRESS';
}

/** 프로젝트 상세 조회 Query Hook */
function useProjectDetailQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-detail', queryKey, projectId],
    queryFn: () => getProjectDetail(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

/** 프로젝트 활동 로그 조회 Query Hook */
function useProjectActivityLogListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-activity-log-list', queryKey, projectId],
    queryFn: () => getProjectActivityLogList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

/** 프로젝트 커밋 목록 조회 Query Hook */
function useProjectCommitListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-commit-list', queryKey, projectId],
    queryFn: () => getProjectCommitList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

/** 프로젝트 개요 조회 Query Hook */
/**
 * 프로젝트 개요 조회 Query Hook.
 * 배포 중에는 폴링한다 — 배포 완료는 태스크가 끝난 한참 뒤 GitHub 웹훅으로 확정되므로,
 * 태스크 종료 시점에 멈추면 LIVE/FAILED 전이를 놓치고 새로고침해야만 보인다.
 */
function useProjectOverviewQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-overview', queryKey, projectId],
    queryFn: () => getProjectOverview(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
    // 상시 폴링하지 않는다. 이 응답을 만들려고 서버가 GitHub 을 두 번 때리므로
    // (최근 커밋 · 저장소 상태) 폴링 비용이 다른 조회와 다르다.
    // 배포 중인 것이 이미 확인된 동안에만 지켜보고, 종료 상태가 되면 멈춘다.
    refetchInterval: (query) =>
      isDeployInFlight(query.state.data?.deployStatus) ? DEPLOY_POLL_MS : false,
  });
}

/** 프로젝트 저장소 health 조회 Query Hook */
function useProjectRepositoryHealthQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-repository-health', queryKey, projectId],
    queryFn: () => getProjectRepositoryHealth(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useProjectDetailBundleQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-detail-bundle', queryKey, projectId],
    queryFn: () => getProjectDetailBundle(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

/** 프로젝트 삭제 Mutation Hook */
function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-list'] });
    },
  });
}

export {
  getGithubRepositoryList,
  getProjectList,
  getProjectDetail,
  postProjectCreate,
  getProjectActivityLogList,
  getProjectCommitList,
  getProjectOverview,
  getProjectRepositoryHealth,
  postProjectRepository,
  deleteProjectRepository,
  patchProject,
  deleteProject,
  getProjectChatSettings,
  patchProjectChatSettings,
  getProjectInfrastructureSettings,
  putProjectInfrastructureSettings,
  deleteProjectInfrastructureSettings,
  getProjectInfrastructureConfiguration,
  putProjectInfrastructureConfiguration,
  getProjectInfrastructureConfigurationHistory,
  getProjectCostBudget,
  putProjectCostBudget,
  deleteProjectCostBudget,
  getProjectRepositorySettings,
  useGithubRepositoryListQuery,
  useProjectRepositorySettingsQuery,
  useProjectListQuery,
  useProjectDetailQuery,
  useProjectActivityLogListQuery,
  useProjectCommitListQuery,
  useProjectOverviewQuery,
  useProjectRepositoryHealthQuery,
  useProjectDetailBundleQuery,
  useDeleteProjectMutation,
};
