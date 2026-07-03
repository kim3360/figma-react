import Http from '@/utils/httpClients';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorResponse, succesResponse } from '@/utils/response';
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
    .get<GetGithubRepositoryListResType>(`${endpoint}/github/repositories`)
    .then((response) => {
      const data = succesResponse<GetGithubRepositoryListResType>(response);
      return getGithubRepositoryListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 목록 조회 API GET */
async function getProjectList() {
  return Http.instance
    .get<GetProjectListResType>(endpoint)
    .then((response) => {
      const data = succesResponse<GetProjectListResType>(response);
      return getProjectListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 상세 조회 API GET */
async function getProjectDetail(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<GetProjectDetailResType>(`${endpoint}/${id}`)
    .then((response) => {
      const data = succesResponse<GetProjectDetailResType>(response);
      return getProjectDetailResSchema.parse(data);
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
    .post<PostProjectCreateResType>(endpoint, payload)
    .then((response) => {
      const data = succesResponse<PostProjectCreateResType>(response);
      return postProjectCreateResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 활동 로그 조회 API GET */
async function getProjectActivityLogList(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<GetProjectActivityLogListResType>(`${endpoint}/${id}/activity-logs`)
    .then((response) => {
      const data = succesResponse<GetProjectActivityLogListResType>(response);
      return getProjectActivityLogListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 커밋 목록 조회 API GET */
async function getProjectCommitList(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<GetProjectCommitListResType>(`${endpoint}/${id}/commits`)
    .then((response) => {
      const data = succesResponse<GetProjectCommitListResType>(response);
      return getProjectCommitListResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 개요 조회 API GET */
async function getProjectOverview(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<GetProjectOverviewResType>(`${endpoint}/${id}/overview`)
    .then((response) => {
      const data = succesResponse<GetProjectOverviewResType>(response);
      return getProjectOverviewResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 저장소 health 확인 API GET */
async function getProjectRepositoryHealth(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });

  return Http.instance
    .get<GetProjectRepositoryHealthResType>(`${endpoint}/${id}/repository-health`)
    .then((response) => {
      const data = succesResponse<GetProjectRepositoryHealthResType>(response);
      return getProjectRepositoryHealthResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 GitHub 저장소 연결 API POST */
async function postProjectRepository(projectId: number, params: PostProjectRepositoryReqType) {
  const payload = postProjectRepositoryReqSchema.parse(params);

  return Http.instance
    .post<PostProjectRepositoryResType>(`${endpoint}/${projectId}/repository`, payload)
    .then((response) => {
      const data = succesResponse<PostProjectRepositoryResType>(response);
      return postProjectRepositoryResSchema.parse(data);
    })
    .catch(errorResponse());
}

/** 프로젝트 수정 API PATCH */
async function patchProject(projectId: number, params: PatchProjectReqType) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });
  const payload = patchProjectReqSchema.parse(params);

  return Http.instance
    .patch<GetProjectDetailResType>(`${endpoint}/${id}`, payload)
    .then((response) => {
      const data = succesResponse<GetProjectDetailResType>(response);
      return getProjectDetailResSchema.parse(data);
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

/** GitHub 저장소 목록 조회 Query Hook */
function useGithubRepositoryListQuery(queryKey: unknown) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['github-repository-list', queryKey],
    queryFn: getGithubRepositoryList,
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
function useProjectOverviewQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-overview', queryKey, projectId],
    queryFn: () => getProjectOverview(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
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
  patchProject,
  deleteProject,
  useGithubRepositoryListQuery,
  useProjectListQuery,
  useProjectDetailQuery,
  useProjectActivityLogListQuery,
  useProjectCommitListQuery,
  useProjectOverviewQuery,
  useProjectRepositoryHealthQuery,
  useProjectDetailBundleQuery,
  useDeleteProjectMutation,
};
