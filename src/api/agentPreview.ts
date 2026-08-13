import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  agentTaskEventSchema,
  decisionReqSchema,
  decisionResSchema,
  previewLogsSchema,
  previewStatusSchema,
  taskInputReqSchema,
  taskStatusSchema,
  type DecisionReqType,
  type TaskInputReqType,
} from '@/types/agentPreview.type';
import {
  dummyCancelTask,
  dummyGetPreviewLogs,
  dummyGetPreviewStatus,
  dummyGetTask,
  dummyListPreviewSessions,
  dummyListProjectTasks,
  dummyListTaskEvents,
  dummyRetryTask,
  dummyStopPreview,
  dummySubmitDecision,
  dummySubmitTaskInput,
} from '@/mocks/fixtures/dummyExtraApis';

const opts = { gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

async function listProjectTasks(projectId: number) {
  return taskStatusSchema.array().parse(dummyListProjectTasks(projectId));
}

async function getTask(taskId: string) {
  return taskStatusSchema.parse(dummyGetTask(taskId));
}

async function submitDecision(params: DecisionReqType) {
  const payload = decisionReqSchema.parse(params);
  return decisionResSchema.parse(dummySubmitDecision(payload));
}

async function cancelTask(taskId: string) {
  return taskStatusSchema.parse(dummyCancelTask(taskId));
}

async function retryTask(taskId: string) {
  return taskStatusSchema.parse(dummyRetryTask(taskId));
}

async function submitTaskInput(taskId: string, params: TaskInputReqType) {
  const payload = taskInputReqSchema.parse(params);
  return taskStatusSchema.parse(dummySubmitTaskInput(taskId, payload));
}

async function listTaskEvents(taskId: string) {
  return agentTaskEventSchema.array().parse(dummyListTaskEvents(taskId));
}

async function getPreviewStatus(sessionId: string) {
  return previewStatusSchema.parse(dummyGetPreviewStatus(sessionId));
}

async function getPreviewLogs(sessionId: string) {
  return previewLogsSchema.parse(dummyGetPreviewLogs(sessionId));
}

async function stopPreview(sessionId: string) {
  dummyStopPreview(sessionId);
}

async function listPreviewSessions(projectId: number) {
  return previewStatusSchema.array().parse(dummyListPreviewSessions(projectId));
}

function useProjectTasksQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['project-agent-tasks', queryKey, projectId],
    queryFn: () => listProjectTasks(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function useTaskEventsQuery(queryKey: unknown, taskId: string | null) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['agent-task-events', queryKey, taskId],
    queryFn: () => listTaskEvents(taskId!),
    enabled: !!taskId,
    ...opts,
  });
}

function usePreviewSessionsQuery(queryKey: unknown, projectId: number) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['preview-sessions', queryKey, projectId],
    queryFn: () => listPreviewSessions(projectId),
    enabled: !!projectId,
    ...opts,
  });
}

function usePreviewLogsQuery(queryKey: unknown, sessionId: string | null) {
  if (!queryKey) throw new Error('queryKey is required');
  return useQuery({
    queryKey: ['preview-logs', queryKey, sessionId],
    queryFn: () => getPreviewLogs(sessionId!),
    enabled: !!sessionId,
    ...opts,
  });
}

function useSubmitDecisionMutation(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prompt: string) => submitDecision({ projectId, prompt }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-agent-tasks'] });
    },
  });
}

function useCancelTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelTask,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project-agent-tasks'] });
    },
  });
}

function useStopPreviewMutation(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stopPreview,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['preview-sessions', undefined, projectId] });
      await qc.invalidateQueries({ queryKey: ['preview-sessions'] });
    },
  });
}

export {
  listProjectTasks,
  getTask,
  submitDecision,
  cancelTask,
  retryTask,
  submitTaskInput,
  listTaskEvents,
  getPreviewStatus,
  getPreviewLogs,
  stopPreview,
  listPreviewSessions,
  useProjectTasksQuery,
  useTaskEventsQuery,
  usePreviewSessionsQuery,
  usePreviewLogsQuery,
  useSubmitDecisionMutation,
  useCancelTaskMutation,
  useStopPreviewMutation,
};
