import { z } from 'zod';

const cloudProviderSchema = z.enum(['AWS', 'GCP']);
const cloudStatusSchema = z.enum([
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
const verificationJobStatusSchema = z.enum(['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED']);

const cloudConnectionSchema = z.object({
  cloudConnectionId: z.number().int(),
  provider: cloudProviderSchema,
  displayName: z.string().prefault(''),
  accountId: z.string().nullable().prefault(null),
  region: z.string().prefault(''),
  roleArn: z.string().nullable().prefault(null),
  awsCredentialType: z.enum(['ACCESS_KEY', 'ROLE_ARN']).nullable().prefault(null),
  accessKeyId: z.string().nullable().prefault(null),
  secretAccessKeyConfigured: z.boolean().prefault(false),
  sessionTokenConfigured: z.boolean().prefault(false),
  gcpCredentialType: z
    .enum(['SERVICE_ACCOUNT_KEY', 'SERVICE_ACCOUNT_EMAIL'])
    .nullable()
    .prefault(null),
  serviceAccountKeyConfigured: z.boolean().prefault(false),
  projectId: z.string().nullable().prefault(null),
  serviceAccountEmail: z.string().nullable().prefault(null),
  status: cloudStatusSchema,
  lastCheckedAt: z.string().nullable().prefault(null),
  createdAt: z.string().prefault(''),
  updatedAt: z.string().prefault(''),
});

const createCloudConnectionReqSchema = z.object({
  provider: cloudProviderSchema,
  displayName: z.string().prefault(''),
  region: z.string().min(1),
  accountId: z.string().nullable().optional(),
  awsCredentialType: z.enum(['ACCESS_KEY', 'ROLE_ARN']).nullable().optional(),
  accessKeyId: z.string().nullable().optional(),
  secretAccessKey: z.string().nullable().optional(),
});

const createCloudConnectionResSchema = z.object({
  cloudConnectionId: z.number().int(),
  provider: cloudProviderSchema,
  status: cloudStatusSchema,
  jobId: z.string().prefault(''),
});

const cloudConnectionHealthSchema = z.object({
  cloudConnectionId: z.number().int(),
  provider: cloudProviderSchema,
  status: cloudStatusSchema,
  message: z.string().prefault(''),
  checkedAt: z.string().prefault(''),
});

const cloudVerificationJobSchema = z.object({
  jobId: z.string(),
  cloudConnectionId: z.number().int(),
  status: verificationJobStatusSchema,
  connectionStatus: cloudStatusSchema.nullable().prefault(null),
  message: z.string().nullable().prefault(null),
  attempt: z.number().int().prefault(1),
  createdAt: z.string().prefault(''),
  startedAt: z.string().nullable().prefault(null),
  completedAt: z.string().nullable().prefault(null),
});

type CloudConnection = z.infer<typeof cloudConnectionSchema>;
type CreateCloudConnectionReqType = z.infer<typeof createCloudConnectionReqSchema>;
type CreateCloudConnectionResType = z.infer<typeof createCloudConnectionResSchema>;
type CloudConnectionHealth = z.infer<typeof cloudConnectionHealthSchema>;
type CloudVerificationJob = z.infer<typeof cloudVerificationJobSchema>;

export {
  cloudProviderSchema,
  cloudStatusSchema,
  cloudConnectionSchema,
  createCloudConnectionReqSchema,
  createCloudConnectionResSchema,
  cloudConnectionHealthSchema,
  cloudVerificationJobSchema,
  type CloudConnection,
  type CreateCloudConnectionReqType,
  type CreateCloudConnectionResType,
  type CloudConnectionHealth,
  type CloudVerificationJob,
};
