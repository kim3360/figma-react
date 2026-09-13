import { z } from 'zod';
import { environmentVariableScopeSchema } from '@/types/common.enum';

/**
 * POST /projects/{projectId}/environment-variables 환경변수 생성 요청
 */
const postEnvironmentVariableCreateReqSchema = z.object({
  /** 환경변수 키 */
  key: z.string().min(1, '키를 입력해주세요.').prefault(''),
  /** 환경변수 값 */
  value: z.string().min(1, '값을 입력해주세요.').prefault(''),
  /** 적용 범위 */
  scope: environmentVariableScopeSchema,
  /** 시크릿 여부 */
  secret: z.boolean(),
});

const environmentVariableSchema = z.object({
  /** 환경변수 ID */
  environmentVariableId: z.number().int(),
  /** 적용 범위 */
  scope: environmentVariableScopeSchema,
  /** 환경변수 키 */
  key: z.string().prefault(''),
  /** 환경변수 값. 시크릿이면 마스킹될 수 있음 */
  value: z.string().nullable().prefault(''),
  /** 시크릿 여부 */
  secret: z.boolean(),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 수정 시각 */
  updatedAt: z.string().prefault(''),
});

const getEnvironmentVariableListResSchema = z.array(environmentVariableSchema);

/**
 * PATCH /projects/{projectId}/environment-variables/{variableId} 환경변수 수정 요청
 */
const patchEnvironmentVariableReqSchema = z.object({
  /** 변경할 값. 없으면 null */
  value: z.string().nullable().prefault(''),
  /** 시크릿 여부. 미변경 시 null */
  secret: z.boolean().nullable().prefault(null),
});

const environmentVariableHistorySchema = z.object({
  /** 히스토리 ID */
  historyId: z.number().int(),
  /** 환경변수 ID */
  environmentVariableId: z.number().int(),
  /** 적용 범위 */
  scope: z.string().prefault(''),
  /** 환경변수 키 */
  key: z.string().prefault(''),
  /** 변경 유형 */
  action: z.string().prefault(''),
  /** 시크릿 여부 */
  secret: z.boolean(),
  /** 값 변경 여부 */
  valueChanged: z.boolean(),
  /** 변경한 사용자 ID. 없으면 null */
  actorUserId: z.number().int().nullable().prefault(null),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
});

const getEnvironmentVariableHistoryListResSchema = z.array(environmentVariableHistorySchema);

type PostEnvironmentVariableCreateReqType = z.infer<typeof postEnvironmentVariableCreateReqSchema>;
type EnvironmentVariable = z.infer<typeof environmentVariableSchema>;
type GetEnvironmentVariableListResType = z.infer<typeof getEnvironmentVariableListResSchema>;
type PatchEnvironmentVariableReqType = z.infer<typeof patchEnvironmentVariableReqSchema>;
type GetEnvironmentVariableHistoryListResType = z.infer<
  typeof getEnvironmentVariableHistoryListResSchema
>;

export {
  postEnvironmentVariableCreateReqSchema,
  environmentVariableSchema,
  getEnvironmentVariableListResSchema,
  patchEnvironmentVariableReqSchema,
  environmentVariableHistorySchema,
  getEnvironmentVariableHistoryListResSchema,
  type PostEnvironmentVariableCreateReqType,
  type EnvironmentVariable,
  type GetEnvironmentVariableListResType,
  type PatchEnvironmentVariableReqType,
  type GetEnvironmentVariableHistoryListResType,
};
