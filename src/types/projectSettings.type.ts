import { z } from 'zod';
import {
  repositoryBindingStatusSchema,
  repositoryHealthStatusSchema,
  repositoryVisibilitySchema,
} from '@/types/common.enum';

const cloudProviderSchema = z.enum(['AWS', 'GCP']);
const cloudConnectionStatusSchema = z.enum([
  'VALIDATED',
  'VERIFYING',
  'CHECKING',
  'CONNECTED',
  'PERMISSION_MISSING',
  'BILLING_DISABLED',
  'REGION_UNSUPPORTED',
  'INVALID_CREDENTIAL',
  'UNKNOWN_ERROR',
]);

const deploymentArchitectureSchema = z.enum(['SERVER', 'CONTAINER', 'SERVERLESS']);
const computeTierSchema = z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE']);
const storageTypeSchema = z.enum(['NONE', 'OBJECT_STORAGE']);
const networkAccessSchema = z.enum(['PUBLIC', 'PRIVATE']);
const infraChangeActionSchema = z.enum(['CREATED', 'UPDATED']);
const infraChangeStatusSchema = z.enum(['APPLIED', 'PENDING_APPROVAL', 'REJECTED']);
const budgetStatusSchema = z.enum(['NO_BUDGET', 'WITHIN_BUDGET', 'OVER_BUDGET', 'NOT_EVALUABLE']);
const resourceCostTypeSchema = z.enum(['COMPUTE', 'STORAGE', 'NETWORK']);

/** GET/PATCH /projects/{id}/settings/chat */
const projectChatSettingsSchema = z.object({
  projectId: z.number().int(),
  changeApprovalRequired: z.boolean(),
  deploymentApprovalRequired: z.boolean(),
  domainApprovalRequired: z.boolean(),
  infraApprovalRequired: z.boolean(),
  resultApprovalRequired: z.boolean(),
});

const updateProjectChatSettingsReqSchema = z.object({
  changeApprovalRequired: z.boolean(),
  deploymentApprovalRequired: z.boolean(),
  domainApprovalRequired: z.boolean(),
  infraApprovalRequired: z.boolean(),
  resultApprovalRequired: z.boolean().nullable().optional(),
});

const resourceCostSchema = z.object({
  resourceType: resourceCostTypeSchema,
  description: z.string().prefault(''),
  monthlyCost: z.number(),
});

const budgetSchema = z.object({
  monthlyBudgetAmount: z.number(),
  currency: z.string().prefault('USD'),
  updatedAt: z.string().prefault(''),
});

/** GET/PUT /projects/{id}/settings/cost-budget */
const projectCostBudgetSchema = z.object({
  projectId: z.number().int(),
  costAvailable: z.boolean(),
  provider: cloudProviderSchema.nullable().prefault(null),
  currency: z.string().prefault('USD'),
  estimatedMonthlyCost: z.number().nullable().prefault(null),
  resourceCosts: z.array(resourceCostSchema).prefault([]),
  assumptions: z.array(z.string()).prefault([]),
  priceTableVersion: z.string().nullable().prefault(null),
  budget: budgetSchema.nullable().prefault(null),
  budgetStatus: budgetStatusSchema,
  budgetUsagePercent: z.number().nullable().prefault(null),
});

const updateProjectBudgetReqSchema = z.object({
  monthlyBudgetAmount: z.number().positive(),
});

/** GET/PUT /projects/{id}/settings/infrastructure */
const projectInfrastructureSettingsSchema = z.object({
  projectId: z.number().int(),
  cloudConnectionId: z.number().int().nullable().prefault(null),
  provider: cloudProviderSchema.nullable().prefault(null),
  displayName: z.string().nullable().prefault(null),
  region: z.string().nullable().prefault(null),
  status: cloudConnectionStatusSchema.nullable().prefault(null),
  lastCheckedAt: z.string().nullable().prefault(null),
  updatedAt: z.string().nullable().prefault(null),
});

const updateProjectInfrastructureSettingsReqSchema = z.object({
  cloudConnectionId: z.number().int(),
});

const infrastructureSettingsValuesSchema = z.object({
  deploymentArchitecture: deploymentArchitectureSchema,
  computeTier: computeTierSchema,
  storageType: storageTypeSchema,
  networkAccess: networkAccessSchema,
  updatedAt: z.string().prefault(''),
});

const pendingInfraChangeSchema = z.object({
  changeId: z.number().int(),
  approvalId: z.number().int(),
  action: infraChangeActionSchema,
  deploymentArchitecture: deploymentArchitectureSchema,
  computeTier: computeTierSchema,
  storageType: storageTypeSchema,
  networkAccess: networkAccessSchema,
  createdAt: z.string().prefault(''),
});

/** GET/PUT /projects/{id}/settings/infrastructure/configuration */
const projectInfrastructureConfigurationSchema = z.object({
  projectId: z.number().int(),
  configurable: z.boolean(),
  settings: infrastructureSettingsValuesSchema.nullable().prefault(null),
  pendingChange: pendingInfraChangeSchema.nullable().prefault(null),
});

const updateProjectInfrastructureConfigurationReqSchema = z.object({
  deploymentArchitecture: deploymentArchitectureSchema,
  computeTier: computeTierSchema,
  storageType: storageTypeSchema,
  networkAccess: networkAccessSchema,
});

/** GET /projects/{id}/settings/infrastructure/configuration/history */
const projectInfrastructureChangeSchema = z.object({
  changeId: z.number().int(),
  action: infraChangeActionSchema,
  status: infraChangeStatusSchema,
  deploymentArchitecture: deploymentArchitectureSchema,
  computeTier: computeTierSchema,
  storageType: storageTypeSchema,
  networkAccess: networkAccessSchema,
  approvalId: z.number().int().nullable().prefault(null),
  actorUserId: z.number().int().nullable().prefault(null),
  createdAt: z.string().prefault(''),
  decidedAt: z.string().nullable().prefault(null),
});

const getProjectInfrastructureChangeHistoryResSchema = z.array(projectInfrastructureChangeSchema);

/** GET /projects/{id}/settings/repository */
const projectRepositorySettingsSchema = z.object({
  projectId: z.number().int(),
  connected: z.boolean(),
  repositoryFullName: z.string().nullable().prefault(null),
  repositoryUrl: z.string().nullable().prefault(null),
  defaultBranch: z.string().nullable().prefault(null),
  repositoryVisibility: repositoryVisibilitySchema.nullable().prefault(null),
  bindingStatus: repositoryBindingStatusSchema.nullable().prefault(null),
  repositoryHealth: repositoryHealthStatusSchema.nullable().prefault(null),
  connectedAt: z.string().nullable().prefault(null),
  lastSyncedAt: z.string().nullable().prefault(null),
});

type ProjectChatSettings = z.infer<typeof projectChatSettingsSchema>;
type UpdateProjectChatSettingsReqType = z.infer<typeof updateProjectChatSettingsReqSchema>;
type ProjectCostBudget = z.infer<typeof projectCostBudgetSchema>;
type UpdateProjectBudgetReqType = z.infer<typeof updateProjectBudgetReqSchema>;
type ProjectInfrastructureSettings = z.infer<typeof projectInfrastructureSettingsSchema>;
type UpdateProjectInfrastructureSettingsReqType = z.infer<
  typeof updateProjectInfrastructureSettingsReqSchema
>;
type ProjectInfrastructureConfiguration = z.infer<typeof projectInfrastructureConfigurationSchema>;
type UpdateProjectInfrastructureConfigurationReqType = z.infer<
  typeof updateProjectInfrastructureConfigurationReqSchema
>;
type ProjectInfrastructureChange = z.infer<typeof projectInfrastructureChangeSchema>;
type GetProjectInfrastructureChangeHistoryResType = z.infer<
  typeof getProjectInfrastructureChangeHistoryResSchema
>;
type ProjectRepositorySettings = z.infer<typeof projectRepositorySettingsSchema>;

export {
  cloudProviderSchema,
  cloudConnectionStatusSchema,
  deploymentArchitectureSchema,
  computeTierSchema,
  storageTypeSchema,
  networkAccessSchema,
  projectChatSettingsSchema,
  updateProjectChatSettingsReqSchema,
  projectCostBudgetSchema,
  updateProjectBudgetReqSchema,
  projectInfrastructureSettingsSchema,
  updateProjectInfrastructureSettingsReqSchema,
  projectInfrastructureConfigurationSchema,
  updateProjectInfrastructureConfigurationReqSchema,
  projectInfrastructureChangeSchema,
  getProjectInfrastructureChangeHistoryResSchema,
  projectRepositorySettingsSchema,
  type ProjectChatSettings,
  type UpdateProjectChatSettingsReqType,
  type ProjectCostBudget,
  type UpdateProjectBudgetReqType,
  type ProjectInfrastructureSettings,
  type UpdateProjectInfrastructureSettingsReqType,
  type ProjectInfrastructureConfiguration,
  type UpdateProjectInfrastructureConfigurationReqType,
  type ProjectInfrastructureChange,
  type GetProjectInfrastructureChangeHistoryResType,
  type ProjectRepositorySettings,
};
