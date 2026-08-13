import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEnvironmentVariableReqSchema,
  environmentVariableHistorySchema,
  environmentVariableSchema,
  updateEnvironmentVariableReqSchema,
  type CreateEnvironmentVariableReqType,
  type UpdateEnvironmentVariableReqType,
} from '@/types/environment.type';
import {
  dummyCreateEnvVar,
  dummyDeleteEnvVar,
  dummyListEnvHistory,
  dummyListEnvVars,
  dummyUpdateEnvVar,
} from '@/mocks/fixtures/dummyExtraApis';

const opts = { gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

async function listEnvVars(projectId: number) {
  return environmentVariableSchema.array().parse(dummyListEnvVars(projectId));
}

async function createEnvVar(projectId: number, params: CreateEnvironmentVariableReqType) {
  const payload = createEnvironmentVariableReqSchema.parse(params);
  return environmentVariableSchema.parse(dummyCreateEnvVar(projectId, payload));
}

async function updateEnvVar(
  projectId: number,
  variableId: number,
  params: UpdateEnvironmentVariableReqType,
) {
  const payload = updateEnvironmentVariableReqSchema.parse(params);
  return environmentVariableSchema.parse(dummyUpdateEnvVar(projectId, variableId, payload));
}

async function deleteEnvVar(projectId: number, variableId: number) {
  dummyDeleteEnvVar(projectId, variableId);
}

async function listEnvHistory(projectId: number) {
  return environmentVariableHistorySchema.array().parse(dummyListEnvHistory(projectId));
}

function useProjectEnvVarsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-env-vars', queryKey, projectId],
    queryFn: () => listEnvVars(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useProjectEnvHistoryQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-env-history', queryKey, projectId],
    queryFn: () => listEnvHistory(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useCreateEnvVarMutation(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateEnvironmentVariableReqType) => createEnvVar(projectId, params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-env-vars'] });
      await qc.invalidateQueries({ queryKey: ['project-env-history'] });
    },
  });
}

function useDeleteEnvVarMutation(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variableId: number) => deleteEnvVar(projectId, variableId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-env-vars'] });
      await qc.invalidateQueries({ queryKey: ['project-env-history'] });
    },
  });
}

export {
  listEnvVars,
  createEnvVar,
  updateEnvVar,
  deleteEnvVar,
  listEnvHistory,
  useProjectEnvVarsQuery,
  useProjectEnvHistoryQuery,
  useCreateEnvVarMutation,
  useDeleteEnvVarMutation,
};
