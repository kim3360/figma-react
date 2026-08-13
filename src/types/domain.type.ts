import { z } from 'zod';

const domainTypeSchema = z.enum(['managed_subdomain', 'custom_domain', 'purchasable_domain']);
const domainStatusSchema = z.enum([
  'REQUESTED',
  'PROVISIONING',
  'VERIFYING',
  'CONNECTED',
  'FAILED',
]);
const hostingTargetSchema = z.enum(['GITHUB_PAGES', 'AWS', 'GCP']);

const domainSchema = z.object({
  domainId: z.number().int(),
  projectId: z.number().int(),
  hostname: z.string().prefault(''),
  url: z.string().nullable().prefault(null),
  type: domainTypeSchema,
  hostingTarget: hostingTargetSchema,
  status: domainStatusSchema,
  httpsEnforced: z.boolean().prefault(false),
  certificateStatus: z
    .enum(['PENDING', 'PROVISIONING', 'ACTIVE', 'FAILED'])
    .nullable()
    .prefault(null),
  createdAt: z.string().prefault(''),
  updatedAt: z.string().prefault(''),
});

const bindDomainReqSchema = z.object({
  hostname: z.string().min(1),
  type: domainTypeSchema,
  hostingTarget: hostingTargetSchema.optional(),
});

const domainBindingSubmissionSchema = z.object({
  domainId: z.number().int(),
  status: domainStatusSchema,
  hostname: z.string().prefault(''),
});

const domainSearchSchema = z.object({
  query: z.string().prefault(''),
  results: z.array(
    z.object({
      hostname: z.string(),
      available: z.boolean(),
      price: z.string().nullable().prefault(null),
      type: domainTypeSchema,
    }),
  ),
});

const verificationGuideSchema = z.object({
  domainId: z.number().int(),
  hostname: z.string().prefault(''),
  records: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      value: z.string(),
      ttl: z.number().nullable().prefault(null),
    }),
  ),
  instructions: z.string().prefault(''),
});

type Domain = z.infer<typeof domainSchema>;
type BindDomainReqType = z.infer<typeof bindDomainReqSchema>;
type DomainBindingSubmission = z.infer<typeof domainBindingSubmissionSchema>;
type DomainSearch = z.infer<typeof domainSearchSchema>;
type VerificationGuide = z.infer<typeof verificationGuideSchema>;

export {
  domainTypeSchema,
  domainStatusSchema,
  hostingTargetSchema,
  domainSchema,
  bindDomainReqSchema,
  domainBindingSubmissionSchema,
  domainSearchSchema,
  verificationGuideSchema,
  type Domain,
  type BindDomainReqType,
  type DomainBindingSubmission,
  type DomainSearch,
  type VerificationGuide,
};
