import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deployReqSchema,
  deployResSchema,
  deploymentCandidateSchema,
  deploymentFailureAnalysisSchema,
  deploymentHistorySchema,
  deploymentLogsSchema,
  deploymentStatusSchema,
  versionSchema,
  type DeployReqType,
} from '@/types/deployment.type';
import {
  dummyCreateDeployment,
  dummyGetDeploymentLogs,
  dummyGetDeploymentStatus,
  dummyGetFailureAnalysis,
  dummyGetVersion,
  dummyListDeploymentCandidates,
  dummyListDeployments,
  dummyListVersions,
  dummyRetryDeployment,
  dummyRunFailureAnalysis,
} from '@/mocks/fixtures/dummyExtraApis';

const opts = { gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

async function listDeployments(projectId: number) {
  return deploymentHistorySchema.array().parse(dummyListDeployments(projectId));
}

async function getDeploymentStatus(historyId: number) {
  return deploymentStatusSchema.parse(dummyGetDeploymentStatus(historyId));
}

async function listDeploymentCandidates(projectId: number) {
  return deploymentCandidateSchema.array().parse(dummyListDeploymentCandidates(projectId));
}

async function createDeployment(projectId: number, params: DeployReqType) {
  const payload = deployReqSchema.parse(params);
  return deployResSchema.parse(dummyCreateDeployment(projectId, payload));
}

async function retryDeployment(historyId: number) {
  return deployResSchema.parse(dummyRetryDeployment(historyId));
}

async function getDeploymentLogs(historyId: number) {
  return deploymentLogsSchema.parse(dummyGetDeploymentLogs(historyId));
}

async function getFailureAnalysis(historyId: number) {
  return deploymentFailureAnalysisSchema.parse(dummyGetFailureAnalysis(historyId));
}

async function runFailureAnalysis(historyId: number) {
  return deploymentFailureAnalysisSchema.parse(dummyRunFailureAnalysis(historyId));
}

async function listVersions(projectId: number) {
  return versionSchema.array().parse(dummyListVersions(projectId));
}

async function getVersion(versionId: number) {
  return versionSchema.parse(dummyGetVersion(versionId));
}

function useProjectDeploymentsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-deployments', queryKey, projectId],
    queryFn: () => listDeployments(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useDeploymentCandidatesQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['deployment-candidates', queryKey, projectId],
    queryFn: () => listDeploymentCandidates(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useProjectVersionsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-versions', queryKey, projectId],
    queryFn: () => listVersions(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useDeploymentLogsQuery(queryKey: unknown, historyId: number | null) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['deployment-logs', queryKey, historyId],
    queryFn: () => getDeploymentLogs(historyId!),
    enabled: historyId != null,
    ...opts,
  });
}

function useCreateDeploymentMutation(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: DeployReqType) => createDeployment(projectId, params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-deployments'] });
    },
  });
}

function useRetryDeploymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: retryDeployment,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-deployments'] });
    },
  });
}

export {
  listDeployments,
  getDeploymentStatus,
  listDeploymentCandidates,
  createDeployment,
  retryDeployment,
  getDeploymentLogs,
  getFailureAnalysis,
  runFailureAnalysis,
  listVersions,
  getVersion,
  useProjectDeploymentsQuery,
  useDeploymentCandidatesQuery,
  useProjectVersionsQuery,
  useDeploymentLogsQuery,
  useCreateDeploymentMutation,
  useRetryDeploymentMutation,
};
