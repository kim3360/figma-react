import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Project                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 프로젝트 상태
 * @example "DRAFT"
 */
const projectStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

/**
 * 배포 상태
 * @example "DRAFT"
 */
const deployStatusSchema = z.enum(['DRAFT', 'IN_PROGRESS', 'PREVIEW_READY', 'LIVE', 'FAILED']);

/**
 * 저장소 공개 범위
 * @example "PRIVATE"
 */
const repositoryVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);

/**
 * 저장소 연결 상태
 * @example "BOUND"
 */
const repositoryBindingStatusSchema = z.enum(['NOT_BOUND', 'BOUND']);

/**
 * 저장소 health 상태
 * @example "HEALTHY"
 */
const repositoryHealthStatusSchema = z.enum([
  'HEALTHY',
  'REPOSITORY_NOT_FOUND',
  'ACCESS_DENIED',
  'PERMISSION_MISMATCH',
  'UNKNOWN_ERROR',
]);

/**
 * 프로젝트 삭제 범위
 * @example "PROJECT_ONLY"
 */
const projectDeleteModeSchema = z.enum(['PROJECT_ONLY', 'PROJECT_AND_REPOSITORY']);

/**
 * 프로젝트 시작 방식
 * @example "blank"
 */
const startModeSchema = z.enum(['blank', 'template']);

/**
 * 저장소 연결 방식
 * @example "create"
 */
const repositoryModeSchema = z.enum(['create', 'existing']);

/* -------------------------------------------------------------------------- */
/* Deployment                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 배포 대상 유형
 * @example "LATEST"
 */
const deployTargetTypeSchema = z.enum(['LATEST', 'VERSION']);

/**
 * 빌드 상태
 * @example "queued"
 */
const buildStatusSchema = z.enum(['queued', 'in_progress', 'completed']);

/**
 * 빌드 결과. 값이 없으면 null
 * @example "success"
 */
const buildConclusionSchema = z.enum(['success', 'failure', 'cancelled']).nullable().prefault(null);

/* -------------------------------------------------------------------------- */
/* CloudConnection                                                            */
/* -------------------------------------------------------------------------- */

/**
 * 클라우드 제공자
 * @example "AWS"
 */
const cloudProviderSchema = z.enum(['AWS', 'GCP']);

/**
 * AWS 자격 증명 유형
 * @example "ACCESS_KEY"
 */
const awsCredentialTypeSchema = z.enum(['ACCESS_KEY', 'ROLE_ARN']);

/**
 * GCP 자격 증명 유형
 * @example "SERVICE_ACCOUNT_KEY"
 */
const gcpCredentialTypeSchema = z.enum(['SERVICE_ACCOUNT_KEY', 'SERVICE_ACCOUNT_EMAIL']);

/**
 * 클라우드 연결 상태
 * @example "CONNECTED"
 */
const cloudConnectionStatusSchema = z.enum([
  'CHECKING',
  'CONNECTED',
  'PERMISSION_MISSING',
  'BILLING_DISABLED',
  'REGION_UNSUPPORTED',
  'INVALID_CREDENTIAL',
  'UNKNOWN_ERROR',
]);

/* -------------------------------------------------------------------------- */
/* Domain                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * 도메인 유형
 * @example "managed_subdomain"
 */
const domainTypeSchema = z.enum(['managed_subdomain', 'purchasable_domain', 'custom_domain']);

/**
 * 도메인 상태
 * @example "REQUESTED"
 */
const domainStatusSchema = z.enum([
  'REQUESTED',
  'PROVISIONING',
  'VERIFYING',
  'CONNECTED',
  'FAILED',
]);

/**
 * 도메인 검증 방식
 * @example "CNAME"
 */
const verificationMethodSchema = z.enum(['CNAME', 'A']);

/* -------------------------------------------------------------------------- */
/* Chat                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * 채팅 메시지 역할
 * @example "user"
 */
const chatRoleSchema = z.enum(['user', 'assistant', 'system']);

/** @deprecated deployStatusSchema 사용 */
const projectDeployStatusSchema = deployStatusSchema;

/** @deprecated repositoryHealthStatusSchema 사용 */
const repositoryHealthSchema = repositoryHealthStatusSchema;

/** 프로젝트 상태 */
type ProjectStatus = z.infer<typeof projectStatusSchema>;
/** 배포 상태 */
type DeployStatus = z.infer<typeof deployStatusSchema>;
/** 저장소 공개 범위 */
type RepositoryVisibility = z.infer<typeof repositoryVisibilitySchema>;
/** 저장소 연결 상태 */
type RepositoryBindingStatus = z.infer<typeof repositoryBindingStatusSchema>;
/** 저장소 health 상태 */
type RepositoryHealthStatus = z.infer<typeof repositoryHealthStatusSchema>;
/** 프로젝트 삭제 범위 */
type ProjectDeleteMode = z.infer<typeof projectDeleteModeSchema>;
/** 프로젝트 시작 방식 */
type StartMode = z.infer<typeof startModeSchema>;
/** 저장소 연결 방식 */
type RepositoryMode = z.infer<typeof repositoryModeSchema>;
/** 배포 대상 유형 */
type DeployTargetType = z.infer<typeof deployTargetTypeSchema>;
/** 빌드 상태 */
type BuildStatus = z.infer<typeof buildStatusSchema>;
/** 빌드 결과 */
type BuildConclusion = z.infer<typeof buildConclusionSchema>;
/** 클라우드 제공자 */
type CloudProvider = z.infer<typeof cloudProviderSchema>;
/** AWS 자격 증명 유형 */
type AwsCredentialType = z.infer<typeof awsCredentialTypeSchema>;
/** GCP 자격 증명 유형 */
type GcpCredentialType = z.infer<typeof gcpCredentialTypeSchema>;
/** 클라우드 연결 상태 */
type CloudConnectionStatus = z.infer<typeof cloudConnectionStatusSchema>;
/** 도메인 유형 */
type DomainType = z.infer<typeof domainTypeSchema>;
/** 도메인 상태 */
type DomainStatus = z.infer<typeof domainStatusSchema>;
/** 도메인 검증 방식 */
type VerificationMethod = z.infer<typeof verificationMethodSchema>;
/** 채팅 메시지 역할 */
type ChatRole = z.infer<typeof chatRoleSchema>;

export {
  projectStatusSchema,
  deployStatusSchema,
  repositoryVisibilitySchema,
  repositoryBindingStatusSchema,
  repositoryHealthStatusSchema,
  projectDeleteModeSchema,
  startModeSchema,
  repositoryModeSchema,
  deployTargetTypeSchema,
  buildStatusSchema,
  buildConclusionSchema,
  cloudProviderSchema,
  awsCredentialTypeSchema,
  gcpCredentialTypeSchema,
  cloudConnectionStatusSchema,
  domainTypeSchema,
  domainStatusSchema,
  verificationMethodSchema,
  chatRoleSchema,
  projectDeployStatusSchema,
  repositoryHealthSchema,
  type ProjectStatus,
  type DeployStatus,
  type RepositoryVisibility,
  type RepositoryBindingStatus,
  type RepositoryHealthStatus,
  type ProjectDeleteMode,
  type StartMode,
  type RepositoryMode,
  type DeployTargetType,
  type BuildStatus,
  type BuildConclusion,
  type CloudProvider,
  type AwsCredentialType,
  type GcpCredentialType,
  type CloudConnectionStatus,
  type DomainType,
  type DomainStatus,
  type VerificationMethod,
  type ChatRole,
};
