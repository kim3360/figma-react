import { z } from 'zod';
import { changeStatusSchema } from '@/types/common.enum';

const changeSchema = z.object({
  /** Change ID */
  changeId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 대화 ID. 없으면 null */
  conversationId: z.number().int().nullable().prefault(null),
  /** 태스크 ID. 없으면 null */
  taskId: z.string().nullable().prefault(''),
  /** 프리뷰 세션 ID. 없으면 null */
  previewSessionId: z.string().nullable().prefault(''),
  /** Change 상태 */
  status: changeStatusSchema,
  /** 요약. 없으면 null */
  summary: z.string().nullable().prefault(''),
  /** 승인 ID. 없으면 null */
  approvalId: z.number().int().nullable().prefault(null),
  /** PR 번호. 없으면 null */
  prNumber: z.number().int().nullable().prefault(null),
  /** 머지 커밋 SHA. 없으면 null */
  mergeCommitSha: z.string().nullable().prefault(''),
  /** 머지 시각. 없으면 null */
  mergedAt: z.string().nullable().prefault(''),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 수정 시각 */
  updatedAt: z.string().prefault(''),
});

const getProjectChangeListResSchema = z.array(changeSchema);
const getChangeDetailResSchema = changeSchema;

/**
 * GET /changes/{changeId}/diff Change diff 응답
 */
const getChangeDiffResSchema = z.object({
  /** Change ID */
  changeId: z.number().int(),
  /** diff 본문. 없으면 null */
  diff: z.string().nullable().prefault(''),
});

type Change = z.infer<typeof changeSchema>;
type GetProjectChangeListResType = z.infer<typeof getProjectChangeListResSchema>;
type GetChangeDetailResType = z.infer<typeof getChangeDetailResSchema>;
type GetChangeDiffResType = z.infer<typeof getChangeDiffResSchema>;

export {
  changeSchema,
  getProjectChangeListResSchema,
  getChangeDetailResSchema,
  getChangeDiffResSchema,
  type Change,
  type GetProjectChangeListResType,
  type GetChangeDetailResType,
  type GetChangeDiffResType,
};
