import { z } from 'zod';

const environmentVariableSchema = z.object({
  variableId: z.number().int(),
  projectId: z.number().int(),
  key: z.string().prefault(''),
  isSecret: z.boolean(),
  valuePreview: z.string().nullable().prefault(null),
  updatedAt: z.string().prefault(''),
  createdAt: z.string().prefault(''),
});

const createEnvironmentVariableReqSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  isSecret: z.boolean().prefault(false),
});

const updateEnvironmentVariableReqSchema = z.object({
  value: z.string().min(1),
  isSecret: z.boolean().optional(),
});

const environmentVariableHistorySchema = z.object({
  historyId: z.number().int(),
  variableId: z.number().int().nullable().prefault(null),
  key: z.string().prefault(''),
  action: z.enum(['CREATED', 'UPDATED', 'DELETED']),
  actorUserId: z.number().int().nullable().prefault(null),
  createdAt: z.string().prefault(''),
});

type EnvironmentVariable = z.infer<typeof environmentVariableSchema>;
type CreateEnvironmentVariableReqType = z.infer<typeof createEnvironmentVariableReqSchema>;
type UpdateEnvironmentVariableReqType = z.infer<typeof updateEnvironmentVariableReqSchema>;
type EnvironmentVariableHistory = z.infer<typeof environmentVariableHistorySchema>;

export {
  environmentVariableSchema,
  createEnvironmentVariableReqSchema,
  updateEnvironmentVariableReqSchema,
  environmentVariableHistorySchema,
  type EnvironmentVariable,
  type CreateEnvironmentVariableReqType,
  type UpdateEnvironmentVariableReqType,
  type EnvironmentVariableHistory,
};
