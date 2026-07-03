import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  type PatchProjectReqType,
  type PostProjectCreateReqType,
  type PostProjectRepositoryReqType,
} from '@/types/projects.type';
import {
  dummyDeleteProject,
  dummyGetGithubRepositoryList,
  dummyGetProjectActivityLogList,
  dummyGetProjectCommitList,
  dummyGetProjectDetail,
  dummyGetProjectDetailBundle,
  dummyGetProjectList,
  dummyGetProjectOverview,
  dummyGetProjectRepositoryHealth,
  dummyPatchProject,
  dummyPostProjectCreate,
  dummyPostProjectRepository,
} from '@/mocks/fixtures/dummyData';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

async function getGithubRepositoryList() {
  const data = dummyGetGithubRepositoryList();
  return getGithubRepositoryListResSchema.parse(data);
}

async function getProjectList() {
  const data = dummyGetProjectList();
  return getProjectListResSchema.parse(data);
}

async function getProjectDetail(projectId: number) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });
  const data = dummyGetProjectDetail(id);
  return getProjectDetailResSchema.parse(data);
}

async function getProjectDetailBundle(projectId: number) {
  return dummyGetProjectDetailBundle(projectId);
}

async function postProjectCreate(params: PostProjectCreateReqType) {
  const payload = postProjectCreateReqSchema.parse(params);
  const data = dummyPostProjectCreate(payload);
  return postProjectCreateResSchema.parse(data);
}

async function getProjectActivityLogList(projectId: number) {
  getProjectDetailParamsSchema.parse({ projectId });
  const data = dummyGetProjectActivityLogList();
  return getProjectActivityLogListResSchema.parse(data);
}

async function getProjectCommitList(projectId: number) {
  getProjectDetailParamsSchema.parse({ projectId });
  const data = dummyGetProjectCommitList();
  return getProjectCommitListResSchema.parse(data);
}

async function getProjectOverview(projectId: number) {
  getProjectDetailParamsSchema.parse({ projectId });
  const data = dummyGetProjectOverview(projectId);
  return getProjectOverviewResSchema.parse(data);
}

async function getProjectRepositoryHealth(projectId: number) {
  getProjectDetailParamsSchema.parse({ projectId });
  const data = dummyGetProjectRepositoryHealth();
  return getProjectRepositoryHealthResSchema.parse(data);
}

async function postProjectRepository(projectId: number, params: PostProjectRepositoryReqType) {
  const payload = postProjectRepositoryReqSchema.parse(params);
  const data = dummyPostProjectRepository(projectId, payload);
  return postProjectRepositoryResSchema.parse(data);
}

async function patchProject(projectId: number, params: PatchProjectReqType) {
  const { projectId: id } = getProjectDetailParamsSchema.parse({ projectId });
  const payload = patchProjectReqSchema.parse(params);
  const data = dummyPatchProject(id, payload);
  return getProjectDetailResSchema.parse(data);
}

async function deleteProject(params: DeleteProjectParamsType) {
  const parsed = deleteProjectParamsSchema.parse(params);
  dummyDeleteProject(parsed);
}

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

function useProjectListQuery(queryKey: unknown, options?: UseProjectListQueryOptions) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-list', queryKey],
    queryFn: getProjectList,
    enabled: options?.enabled ?? true,
    ...defaultQueryOptions,
  });
}

function useProjectDetailQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-detail', queryKey, projectId],
    queryFn: () => getProjectDetail(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useProjectActivityLogListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-activity-log-list', queryKey, projectId],
    queryFn: () => getProjectActivityLogList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useProjectCommitListQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-commit-list', queryKey, projectId],
    queryFn: () => getProjectCommitList(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useProjectOverviewQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-overview', queryKey, projectId],
    queryFn: () => getProjectOverview(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

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
