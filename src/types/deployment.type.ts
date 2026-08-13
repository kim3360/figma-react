import { z } from 'zod';

const deployTargetTypeSchema = z.enum(['LATEST', 'VERSION']);
const deploymentRunStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'LIVE', 'FAILED']);

const deploymentHistorySchema = z.object({
  historyId: z.number().int(),
  projectId: z.number().int(),
  deployTargetType: deployTargetTypeSchema,
  versionLabel: z.string().nullable().prefault(null),
  deployedUrl: z.string().nullable().prefault(null),
  status: deploymentRunStatusSchema,
  triggeredAt: z.string().prefault(''),
  updatedAt: z.string().prefault(''),
  retriedFromHistoryId: z.number().int().nullable().prefault(null),
});

const deploymentStatusSchema = z.object({
  historyId: z.number().int(),
  projectId: z.number().int(),
  deployTargetType: deployTargetTypeSchema,
  versionLabel: z.string().nullable().prefault(null),
  deployedUrl: z.string().nullable().prefault(null),
  status: deploymentRunStatusSchema,
  buildStatus: z.string().nullable().prefault(null),
  buildConclusion: z.string().nullable().prefault(null),
  triggeredAt: z.string().prefault(''),
  updatedAt: z.string().prefault(''),
});

const deployReqSchema = z.object({
  deployTargetType: deployTargetTypeSchema,
  versionName: z.string().nullable().optional(),
});

const deployResSchema = z.object({
  historyId: z.number().int(),
  projectId: z.number().int(),
  status: deploymentRunStatusSchema,
  versionLabel: z.string().nullable().prefault(null),
});

const deploymentCandidateSchema = z.object({
  deployTargetType: deployTargetTypeSchema,
  versionName: z.string().nullable().prefault(null),
  label: z.string().prefault(''),
  available: z.boolean(),
  reason: z.string().nullable().prefault(null),
});

const deploymentLogsSchema = z.object({
  historyId: z.number().int(),
  lines: z.array(z.string()).prefault([]),
});

const deploymentFailureAnalysisSchema = z.object({
  historyId: z.number().int(),
  summary: z.string().prefault(''),
  rootCause: z.string().nullable().prefault(null),
  suggestedActions: z.array(z.string()).prefault([]),
  analyzedAt: z.string().prefault(''),
});

const versionSchema = z.object({
  versionId: z.number().int(),
  projectId: z.number().int(),
  versionName: z.string().prefault(''),
  commitSha: z.string().prefault(''),
  createdAt: z.string().prefault(''),
  message: z.string().nullable().prefault(null),
});

type DeploymentHistory = z.infer<typeof deploymentHistorySchema>;
type DeploymentStatus = z.infer<typeof deploymentStatusSchema>;
type DeployReqType = z.infer<typeof deployReqSchema>;
type DeployResType = z.infer<typeof deployResSchema>;
type DeploymentCandidate = z.infer<typeof deploymentCandidateSchema>;
type DeploymentLogs = z.infer<typeof deploymentLogsSchema>;
type DeploymentFailureAnalysis = z.infer<typeof deploymentFailureAnalysisSchema>;
type ProjectVersion = z.infer<typeof versionSchema>;

export {
  deployTargetTypeSchema,
  deploymentRunStatusSchema,
  deploymentHistorySchema,
  deploymentStatusSchema,
  deployReqSchema,
  deployResSchema,
  deploymentCandidateSchema,
  deploymentLogsSchema,
  deploymentFailureAnalysisSchema,
  versionSchema,
  type DeploymentHistory,
  type DeploymentStatus,
  type DeployReqType,
  type DeployResType,
  type DeploymentCandidate,
  type DeploymentLogs,
  type DeploymentFailureAnalysis,
  type ProjectVersion,
};
