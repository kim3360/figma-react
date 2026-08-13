import { z } from 'zod';

const changeStatusSchema = z.enum(['PREVIEW_READY', 'MERGED', 'REJECTED', 'DEPLOYED']);

/** GET /changes/{id}, GET /projects/{id}/changes */
const changeSchema = z.object({
  changeId: z.number().int(),
  projectId: z.number().int(),
  conversationId: z.number().int().nullable().prefault(null),
  taskId: z.string().nullable().prefault(null),
  previewSessionId: z.string().nullable().prefault(null),
  status: changeStatusSchema,
  summary: z.string().prefault(''),
  approvalId: z.number().int().nullable().prefault(null),
  prNumber: z.number().int().nullable().prefault(null),
  mergeCommitSha: z.string().nullable().prefault(null),
  mergedAt: z.string().nullable().prefault(null),
  createdAt: z.string().prefault(''),
  updatedAt: z.string().prefault(''),
});

const changeDiffSchema = z.object({
  changeId: z.number().int(),
  diff: z.string().prefault(''),
});

const getProjectChangeListResSchema = z.array(changeSchema);
const getChangeDetailResSchema = changeSchema;
const getChangeDiffResSchema = changeDiffSchema;

type ChangeStatus = z.infer<typeof changeStatusSchema>;
type Change = z.infer<typeof changeSchema>;
type ChangeDiff = z.infer<typeof changeDiffSchema>;
type GetProjectChangeListResType = z.infer<typeof getProjectChangeListResSchema>;
type GetChangeDetailResType = z.infer<typeof getChangeDetailResSchema>;
type GetChangeDiffResType = z.infer<typeof getChangeDiffResSchema>;

export {
  changeStatusSchema,
  changeSchema,
  changeDiffSchema,
  getProjectChangeListResSchema,
  getChangeDetailResSchema,
  getChangeDiffResSchema,
  type ChangeStatus,
  type Change,
  type ChangeDiff,
  type GetProjectChangeListResType,
  type GetChangeDetailResType,
  type GetChangeDiffResType,
};
