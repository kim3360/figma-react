import { z } from 'zod';
import {
  budgetStatusSchema,
  cloudProviderSchema,
  computeTierSchema,
  deploymentArchitectureSchema,
  networkAccessSchema,
  repositoryBindingStatusSchema,
  repositoryHealthStatusSchema,
  repositoryVisibilitySchema,
  storageTypeSchema,
} from '@/types/common.enum';

/**
 * GET|PATCH /projects/{projectId}/settings/chat Chat 승인 정책
 */
const projectChatSettingsSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 코드 변경 승인 필요 여부 */
  changeApprovalRequired: z.boolean(),
  /** 배포 승인 필요 여부 */
  deploymentApprovalRequired: z.boolean(),
  /** 도메인 승인 필요 여부 */
  domainApprovalRequired: z.boolean(),
  /** 인프라 승인 필요 여부 */
  infraApprovalRequired: z.boolean(),
  /** 결과 승인 필요 여부 */
  resultApprovalRequired: z.boolean(),
});

const patchProjectChatSettingsReqSchema = z.object({
  /** 코드 변경 승인 필요 여부 */
  changeApprovalRequired: z.boolean(),
  /** 배포 승인 필요 여부 */
  deploymentApprovalRequired: z.boolean(),
  /** 도메인 승인 필요 여부 */
  domainApprovalRequired: z.boolean(),
  /** 인프라 승인 필요 여부 */
  infraApprovalRequired: z.boolean(),
  /** 결과 승인 필요 여부 */
  resultApprovalRequired: z.boolean(),
});

/**
 * PUT /projects/{projectId}/settings/infrastructure 클라우드 연결 선택 요청
 */
const putProjectInfrastructureSettingsReqSchema = z.object({
  /** 선택할 클라우드 연결 ID */
  cloudConnectionId: z.number().int(),
});

const getProjectInfrastructureSettingsResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 클라우드 연결 ID. 없으면 null */
  cloudConnectionId: z.number().int().nullable().prefault(null),
  /** 클라우드 제공자. 없으면 null */
  provider: cloudProviderSchema.nullable().prefault(null),
  /** 연결 표시 이름. 없으면 null */
  displayName: z.string().nullable().prefault(''),
  /** 리전. 없으면 null */
  region: z.string().nullable().prefault(''),
  /**
   * 인프라 설정 상태. 연결이 선택돼 있으면 그 연결의 상태를, 없으면 NOT_CONFIGURED 를 준다.
   * 즉 클라우드 연결 상태의 상위집합이라 cloudConnectionStatusSchema 로 받으면 안 된다.
   * 화면은 이 값으로 분기하지 않고 cloudConnectionId 만 읽으므로 열린 문자열로 둔다 —
   * 닫아둔 탓에 NOT_CONFIGURED 하나 때문에 응답 전체가 파싱에 실패하고 있었다.
   */
  status: z.string().nullable().prefault(null),
  /** 마지막 확인 시각. 없으면 null */
  lastCheckedAt: z.string().nullable().prefault(''),
  /** 수정 시각. 없으면 null */
  updatedAt: z.string().nullable().prefault(''),
});

const infrastructureSettingsValuesSchema = z.object({
  /** 배포 아키텍처 */
  deploymentArchitecture: deploymentArchitectureSchema,
  /** 컴퓨팅 티어 */
  computeTier: computeTierSchema,
  /** 스토리지 유형 */
  storageType: storageTypeSchema,
  /** 네트워크 접근 */
  networkAccess: networkAccessSchema,
  /** 수정 시각. 없으면 null */
  updatedAt: z.string().nullable().prefault(''),
});

const putProjectInfrastructureConfigurationReqSchema = z.object({
  /** 배포 아키텍처 */
  deploymentArchitecture: deploymentArchitectureSchema,
  /** 컴퓨팅 티어 */
  computeTier: computeTierSchema,
  /** 스토리지 유형 */
  storageType: storageTypeSchema,
  /** 네트워크 접근 */
  networkAccess: networkAccessSchema,
});

const pendingInfrastructureChangeSchema = z.object({
  /** Change ID */
  changeId: z.number().int(),
  /** 승인 ID. 없으면 null */
  approvalId: z.number().int().nullable().prefault(null),
  /** 변경 유형 */
  action: z.enum(['CREATED', 'UPDATED']),
  /** 배포 아키텍처 */
  deploymentArchitecture: deploymentArchitectureSchema,
  /** 컴퓨팅 티어 */
  computeTier: computeTierSchema,
  /** 스토리지 유형 */
  storageType: storageTypeSchema,
  /** 네트워크 접근 */
  networkAccess: networkAccessSchema,
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
});

const getProjectInfrastructureConfigurationResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 설정 가능 여부 */
  configurable: z.boolean(),
  /** 현재 설정. 없으면 null */
  settings: infrastructureSettingsValuesSchema.nullable().prefault(null),
  /** 대기 중인 변경. 없으면 null */
  pendingChange: pendingInfrastructureChangeSchema.nullable().prefault(null),
});

const projectInfrastructureChangeSchema = z.object({
  /** Change ID */
  changeId: z.number().int(),
  /** 변경 유형 */
  action: z.enum(['CREATED', 'UPDATED']),
  /** 적용 상태 */
  status: z.enum(['APPLIED', 'PENDING_APPROVAL', 'REJECTED']),
  /** 배포 아키텍처 */
  deploymentArchitecture: deploymentArchitectureSchema,
  /** 컴퓨팅 티어 */
  computeTier: computeTierSchema,
  /** 스토리지 유형 */
  storageType: storageTypeSchema,
  /** 네트워크 접근 */
  networkAccess: networkAccessSchema,
  /** 승인 ID. 없으면 null */
  approvalId: z.number().int().nullable().prefault(null),
  /** 변경한 사용자 ID. 없으면 null */
  actorUserId: z.number().int().nullable().prefault(null),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 결정 시각. 없으면 null */
  decidedAt: z.string().nullable().prefault(''),
});

const getProjectInfrastructureConfigurationHistoryResSchema = z.array(
  projectInfrastructureChangeSchema,
);

const putProjectCostBudgetReqSchema = z.object({
  /** 월 예산 금액 */
  monthlyBudgetAmount: z.number(),
  /** 통화. 없으면 null */
  currency: z.string().nullable().prefault(''),
});

const budgetSchema = z.object({
  /** 월 예산 금액 */
  monthlyBudgetAmount: z.number(),
  /** 통화 */
  currency: z.string().prefault(''),
  /** 수정 시각. 없으면 null */
  updatedAt: z.string().nullable().prefault(''),
});

const resourceCostSchema = z.object({
  /** 리소스 유형 */
  resourceType: z.enum(['COMPUTE', 'STORAGE', 'NETWORK']),
  /** 설명. 없으면 null */
  description: z.string().nullable().prefault(''),
  /** 월 비용 */
  monthlyCost: z.number(),
});

const getProjectCostBudgetResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 비용 정보 사용 가능 여부 */
  costAvailable: z.boolean(),
  /** 클라우드 제공자. 없으면 null */
  provider: cloudProviderSchema.nullable().prefault(null),
  /** 통화. 없으면 null */
  currency: z.string().nullable().prefault(''),
  /** 예상 월 비용. 없으면 null */
  estimatedMonthlyCost: z.number().nullable().prefault(null),
  /** 리소스별 비용 */
  resourceCosts: z.array(resourceCostSchema),
  /** 비용 산정 가정 */
  assumptions: z.array(z.string()),
  /** 가격표 버전. 없으면 null */
  priceTableVersion: z.string().nullable().prefault(''),
  /** 예산. 없으면 null */
  budget: budgetSchema.nullable().prefault(null),
  /** 예산 상태 */
  budgetStatus: budgetStatusSchema,
  /** 예산 사용률. 없으면 null */
  budgetUsagePercent: z.number().nullable().prefault(null),
});

const getProjectRepositorySettingsResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 저장소 연결 여부 */
  connected: z.boolean(),
  /** 저장소 전체 이름. 없으면 null */
  repositoryFullName: z.string().nullable().prefault(''),
  /** 저장소 URL. 없으면 null */
  repositoryUrl: z.string().nullable().prefault(''),
  /** 기본 브랜치. 없으면 null */
  defaultBranch: z.string().nullable().prefault(''),
  /** 공개 범위. 없으면 null */
  repositoryVisibility: repositoryVisibilitySchema.nullable().prefault(null),
  /** 연결 상태. 없으면 null */
  bindingStatus: repositoryBindingStatusSchema.nullable().prefault(null),
  /** health 상태. 없으면 null */
  repositoryHealth: repositoryHealthStatusSchema.nullable().prefault(null),
  /** 연결 시각. 없으면 null */
  connectedAt: z.string().nullable().prefault(''),
  /** 마지막 동기화 시각. 없으면 null */
  lastSyncedAt: z.string().nullable().prefault(''),
});

type ProjectChatSettings = z.infer<typeof projectChatSettingsSchema>;
type PatchProjectChatSettingsReqType = z.infer<typeof patchProjectChatSettingsReqSchema>;
type PutProjectInfrastructureSettingsReqType = z.infer<
  typeof putProjectInfrastructureSettingsReqSchema
>;
type GetProjectInfrastructureSettingsResType = z.infer<
  typeof getProjectInfrastructureSettingsResSchema
>;
type PutProjectInfrastructureConfigurationReqType = z.infer<
  typeof putProjectInfrastructureConfigurationReqSchema
>;
type GetProjectInfrastructureConfigurationResType = z.infer<
  typeof getProjectInfrastructureConfigurationResSchema
>;
type GetProjectInfrastructureConfigurationHistoryResType = z.infer<
  typeof getProjectInfrastructureConfigurationHistoryResSchema
>;
type PutProjectCostBudgetReqType = z.infer<typeof putProjectCostBudgetReqSchema>;
type GetProjectCostBudgetResType = z.infer<typeof getProjectCostBudgetResSchema>;
type GetProjectRepositorySettingsResType = z.infer<typeof getProjectRepositorySettingsResSchema>;

export {
  projectChatSettingsSchema,
  patchProjectChatSettingsReqSchema,
  putProjectInfrastructureSettingsReqSchema,
  getProjectInfrastructureSettingsResSchema,
  putProjectInfrastructureConfigurationReqSchema,
  getProjectInfrastructureConfigurationResSchema,
  getProjectInfrastructureConfigurationHistoryResSchema,
  putProjectCostBudgetReqSchema,
  getProjectCostBudgetResSchema,
  getProjectRepositorySettingsResSchema,
  type ProjectChatSettings,
  type PatchProjectChatSettingsReqType,
  type PutProjectInfrastructureSettingsReqType,
  type GetProjectInfrastructureSettingsResType,
  type PutProjectInfrastructureConfigurationReqType,
  type GetProjectInfrastructureConfigurationResType,
  type GetProjectInfrastructureConfigurationHistoryResType,
  type PutProjectCostBudgetReqType,
  type GetProjectCostBudgetResType,
  type GetProjectRepositorySettingsResType,
};
