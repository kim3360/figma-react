import { z } from 'zod';

const agentTaskStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'WAITING_INPUT',
  'WAITING_APPROVAL',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
]);

const agentStepSchema = z.object({
  stepId: z.string(),
  name: z.string().prefault(''),
  status: z.enum(['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED']),
  startedAt: z.string().nullable().prefault(null),
  finishedAt: z.string().nullable().prefault(null),
});

const decisionReqSchema = z.object({
  projectId: z.number().int(),
  conversationId: z.number().int().nullable().optional(),
  prompt: z.string().min(1),
});

const decisionResSchema = z.object({
  taskId: z.string(),
  status: agentTaskStatusSchema,
  approvalIds: z.array(z.number().int()).prefault([]),
});

const taskStatusSchema = z.object({
  taskId: z.string(),
  projectId: z.number().int(),
  conversationId: z.number().int().nullable().prefault(null),
  status: agentTaskStatusSchema,
  summary: z.string().nullable().prefault(null),
  currentStep: z.string().nullable().prefault(null),
  steps: z.array(agentStepSchema).prefault([]),
  createdAt: z.string().prefault(''),
  updatedAt: z.string().prefault(''),
});

const agentTaskEventSchema = z.object({
  eventId: z.string(),
  taskId: z.string(),
  type: z.string().prefault(''),
  message: z.string().prefault(''),
  createdAt: z.string().prefault(''),
});

const taskInputReqSchema = z.object({
  content: z.string().min(1),
});

const previewStatusSchema = z.object({
  sessionId: z.string(),
  projectId: z.number().int(),
  status: z.enum(['STARTING', 'READY', 'STOPPING', 'STOPPED', 'FAILED']),
  previewUrl: z.string().nullable().prefault(null),
  message: z.string().nullable().prefault(null),
  startedAt: z.string().nullable().prefault(null),
  updatedAt: z.string().prefault(''),
});

const previewLogsSchema = z.object({
  sessionId: z.string(),
  lines: z.array(z.string()).prefault([]),
});

type AgentTaskStatus = z.infer<typeof agentTaskStatusSchema>;
type DecisionReqType = z.infer<typeof decisionReqSchema>;
type DecisionResType = z.infer<typeof decisionResSchema>;
type TaskStatus = z.infer<typeof taskStatusSchema>;
type AgentTaskEvent = z.infer<typeof agentTaskEventSchema>;
type TaskInputReqType = z.infer<typeof taskInputReqSchema>;
type PreviewStatus = z.infer<typeof previewStatusSchema>;
type PreviewLogs = z.infer<typeof previewLogsSchema>;

export {
  agentTaskStatusSchema,
  agentStepSchema,
  decisionReqSchema,
  decisionResSchema,
  taskStatusSchema,
  agentTaskEventSchema,
  taskInputReqSchema,
  previewStatusSchema,
  previewLogsSchema,
  type AgentTaskStatus,
  type DecisionReqType,
  type DecisionResType,
  type TaskStatus,
  type AgentTaskEvent,
  type TaskInputReqType,
  type PreviewStatus,
  type PreviewLogs,
};
