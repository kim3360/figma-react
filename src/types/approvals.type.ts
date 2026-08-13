import { z } from 'zod';

const approvalTypeSchema = z.enum([
  'CHANGE',
  'DEPLOYMENT',
  'DOMAIN_BINDING',
  'INFRA_OPERATION',
  'RESULT',
]);

const approvalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

/** GET /approvals/{id}, GET /projects/{id}/approvals */
const approvalSchema = z.object({
  approvalId: z.number().int(),
  projectId: z.number().int(),
  conversationId: z.number().int().nullable().prefault(null),
  taskId: z.string().nullable().prefault(null),
  type: approvalTypeSchema,
  status: approvalStatusSchema,
  summary: z.string().prefault(''),
  createdAt: z.string().prefault(''),
  decidedAt: z.string().nullable().prefault(null),
});

const getProjectApprovalListResSchema = z.array(approvalSchema);
const getApprovalDetailResSchema = approvalSchema;

type ApprovalType = z.infer<typeof approvalTypeSchema>;
type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
type Approval = z.infer<typeof approvalSchema>;
type GetProjectApprovalListResType = z.infer<typeof getProjectApprovalListResSchema>;
type GetApprovalDetailResType = z.infer<typeof getApprovalDetailResSchema>;

export {
  approvalTypeSchema,
  approvalStatusSchema,
  approvalSchema,
  getProjectApprovalListResSchema,
  getApprovalDetailResSchema,
  type ApprovalType,
  type ApprovalStatus,
  type Approval,
  type GetProjectApprovalListResType,
  type GetApprovalDetailResType,
};
