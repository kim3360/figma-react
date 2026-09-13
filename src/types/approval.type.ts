import { z } from 'zod';
import { approvalStatusSchema, approvalTypeSchema } from '@/types/common.enum';

/**
 * 승인과 함께 값을 받아야 할 때 서버가 내려주는 입력 명세.
 * PENDING인 REPOSITORY_BINDING에만 채워지고 나머지는 null이다.
 */
const approvalInputSchema = z.object({
  /** 승인 본문에 실어 보낼 필드명 */
  field: z.string().min(1, '입력 필드명이 없습니다.'),
  /** 비워서 보내면 서버가 쓰는 값 */
  defaultValue: z.string().nullable().prefault(''),
  /** 값이 반드시 필요한지 */
  required: z.boolean().prefault(false),
  /** 값 검증용 정규식. 없으면 null */
  pattern: z.string().nullable().prefault(null),
  /** 최대 길이. 없으면 null */
  maxLength: z.number().int().nullable().prefault(null),
});

const approvalSchema = z.object({
  /** 승인 ID */
  approvalId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 대화 ID. 없으면 null */
  conversationId: z.number().int().nullable().prefault(null),
  /** 태스크 ID. 없으면 null */
  taskId: z.string().nullable().prefault(''),
  /** 승인 유형 */
  type: approvalTypeSchema,
  /** 승인 상태 */
  status: approvalStatusSchema,
  /** 요약. 없으면 null */
  summary: z.string().nullable().prefault(''),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 결정 시각. 없으면 null */
  decidedAt: z.string().nullable().prefault(''),
  /** 승인과 함께 받아야 할 입력 명세. 필요 없으면 null */
  input: approvalInputSchema.nullable().prefault(null),
});

const getProjectApprovalListResSchema = z.array(approvalSchema);
const getApprovalDetailResSchema = approvalSchema;
const postApprovalDecideResSchema = approvalSchema;

type Approval = z.infer<typeof approvalSchema>;
type ApprovalInput = z.infer<typeof approvalInputSchema>;
type GetProjectApprovalListResType = z.infer<typeof getProjectApprovalListResSchema>;
type GetApprovalDetailResType = z.infer<typeof getApprovalDetailResSchema>;
type PostApprovalDecideResType = z.infer<typeof postApprovalDecideResSchema>;

export {
  approvalInputSchema,
  approvalSchema,
  getProjectApprovalListResSchema,
  getApprovalDetailResSchema,
  postApprovalDecideResSchema,
  type Approval,
  type ApprovalInput,
  type GetProjectApprovalListResType,
  type GetApprovalDetailResType,
  type PostApprovalDecideResType,
};
