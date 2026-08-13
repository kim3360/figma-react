import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProjectInfrastructureChangeHistoryResSchema,
  projectChatSettingsSchema,
  projectCostBudgetSchema,
  projectInfrastructureConfigurationSchema,
  projectInfrastructureSettingsSchema,
  projectRepositorySettingsSchema,
  updateProjectBudgetReqSchema,
  updateProjectChatSettingsReqSchema,
  updateProjectInfrastructureConfigurationReqSchema,
  updateProjectInfrastructureSettingsReqSchema,
  type UpdateProjectBudgetReqType,
  type UpdateProjectChatSettingsReqType,
  type UpdateProjectInfrastructureConfigurationReqType,
  type UpdateProjectInfrastructureSettingsReqType,
} from '@/types/projectSettings.type';
import {
  dummyDeleteCostBudget,
  dummyDeleteInfrastructureSettings,
  dummyDisconnectRepository,
  dummyGetChatSettings,
  dummyGetCostBudget,
  dummyGetInfrastructureChangeHistory,
  dummyGetInfrastructureConfiguration,
  dummyGetInfrastructureSettings,
  dummyGetRepositorySettings,
  dummyUpdateChatSettings,
  dummyUpdateCostBudget,
  dummyUpdateInfrastructureConfiguration,
  dummyUpdateInfrastructureSettings,
} from '@/mocks/fixtures/dummyProjectApi';

const defaultQueryOptions = {
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

async function getChatSettings(projectId: number) {
  return projectChatSettingsSchema.parse(dummyGetChatSettings(projectId));
}

async function updateChatSettings(projectId: number, params: UpdateProjectChatSettingsReqType) {
  const payload = updateProjectChatSettingsReqSchema.parse(params);
  return projectChatSettingsSchema.parse(dummyUpdateChatSettings(projectId, payload));
}

async function getCostBudget(projectId: number) {
  return projectCostBudgetSchema.parse(dummyGetCostBudget(projectId));
}

async function updateCostBudget(projectId: number, params: UpdateProjectBudgetReqType) {
  const payload = updateProjectBudgetReqSchema.parse(params);
  return projectCostBudgetSchema.parse(dummyUpdateCostBudget(projectId, payload));
}

async function deleteCostBudget(projectId: number) {
  dummyDeleteCostBudget(projectId);
}

async function getInfrastructureSettings(projectId: number) {
  return projectInfrastructureSettingsSchema.parse(dummyGetInfrastructureSettings(projectId));
}

async function updateInfrastructureSettings(
  projectId: number,
  params: UpdateProjectInfrastructureSettingsReqType,
) {
  const payload = updateProjectInfrastructureSettingsReqSchema.parse(params);
  return projectInfrastructureSettingsSchema.parse(
    dummyUpdateInfrastructureSettings(projectId, payload),
  );
}

async function deleteInfrastructureSettings(projectId: number) {
  dummyDeleteInfrastructureSettings(projectId);
}

async function getInfrastructureConfiguration(projectId: number) {
  return projectInfrastructureConfigurationSchema.parse(
    dummyGetInfrastructureConfiguration(projectId),
  );
}

async function updateInfrastructureConfiguration(
  projectId: number,
  params: UpdateProjectInfrastructureConfigurationReqType,
) {
  const payload = updateProjectInfrastructureConfigurationReqSchema.parse(params);
  return projectInfrastructureConfigurationSchema.parse(
    dummyUpdateInfrastructureConfiguration(projectId, payload),
  );
}

async function getInfrastructureChangeHistory(projectId: number) {
  return getProjectInfrastructureChangeHistoryResSchema.parse(
    dummyGetInfrastructureChangeHistory(projectId),
  );
}

async function getRepositorySettings(projectId: number) {
  return projectRepositorySettingsSchema.parse(dummyGetRepositorySettings(projectId));
}

async function disconnectRepository(projectId: number) {
  dummyDisconnectRepository(projectId);
}

function useChatSettingsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-chat-settings', queryKey, projectId],
    queryFn: () => getChatSettings(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useCostBudgetQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-cost-budget', queryKey, projectId],
    queryFn: () => getCostBudget(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useInfrastructureSettingsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-infra-settings', queryKey, projectId],
    queryFn: () => getInfrastructureSettings(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useInfrastructureConfigurationQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-infra-configuration', queryKey, projectId],
    queryFn: () => getInfrastructureConfiguration(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useInfrastructureChangeHistoryQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-infra-history', queryKey, projectId],
    queryFn: () => getInfrastructureChangeHistory(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useRepositorySettingsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-repository-settings', queryKey, projectId],
    queryFn: () => getRepositorySettings(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

function useUpdateChatSettingsMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateProjectChatSettingsReqType) => updateChatSettings(projectId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-chat-settings'] });
    },
  });
}

function useUpdateCostBudgetMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateProjectBudgetReqType) => updateCostBudget(projectId, params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-cost-budget'] });
    },
  });
}

function useDeleteCostBudgetMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCostBudget(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-cost-budget'] });
    },
  });
}

function useDisconnectRepositoryMutation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => disconnectRepository(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-repository-settings'] });
      await queryClient.invalidateQueries({ queryKey: ['project-detail-bundle'] });
    },
  });
}

export {
  getChatSettings,
  updateChatSettings,
  getCostBudget,
  updateCostBudget,
  deleteCostBudget,
  getInfrastructureSettings,
  updateInfrastructureSettings,
  deleteInfrastructureSettings,
  getInfrastructureConfiguration,
  updateInfrastructureConfiguration,
  getInfrastructureChangeHistory,
  getRepositorySettings,
  disconnectRepository,
  useChatSettingsQuery,
  useCostBudgetQuery,
  useInfrastructureSettingsQuery,
  useInfrastructureConfigurationQuery,
  useInfrastructureChangeHistoryQuery,
  useRepositorySettingsQuery,
  useUpdateChatSettingsMutation,
  useUpdateCostBudgetMutation,
  useDeleteCostBudgetMutation,
  useDisconnectRepositoryMutation,
};
