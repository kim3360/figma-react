import { z } from 'zod';
import {
  awsCredentialTypeSchema,
  cloudProviderSchema,
  cloudVerificationJobStatusSchema,
  gcpCredentialTypeSchema,
} from '@/types/common.enum';

/**
 * POST /cloud-connections 클라우드 연결 등록 요청
 */
const postCloudConnectionCreateReqSchema = z.object({
  /** 클라우드 제공자 */
  provider: cloudProviderSchema,
  /** 연결 표시 이름 */
  displayName: z.string().min(1, '표시 이름을 입력해주세요.').prefault(''),
  /** 계정 ID. 없으면 null */
  accountId: z.string().nullable().prefault(''),
  /** 리전 */
  region: z.string().min(1, '리전을 입력해주세요.').prefault(''),
  /** AWS Role ARN. 없으면 null */
  roleArn: z.string().nullable().prefault(''),
  /** AWS 자격 증명 유형. 없으면 null */
  awsCredentialType: awsCredentialTypeSchema.nullable().prefault(null),
  /** AWS Access Key ID. 없으면 null */
  accessKeyId: z.string().nullable().prefault(''),
  /** AWS Secret Access Key. 없으면 null */
  secretAccessKey: z.string().nullable().prefault(''),
  /** AWS 세션 토큰. 없으면 null */
  sessionToken: z.string().nullable().prefault(''),
  /** GCP 자격 증명 유형. 없으면 null */
  gcpCredentialType: gcpCredentialTypeSchema.nullable().prefault(null),
  /** GCP 서비스 계정 키 JSON. 없으면 null */
  serviceAccountKeyJson: z.string().nullable().prefault(''),
  /** GCP 프로젝트 ID. 없으면 null */
  projectId: z.string().nullable().prefault(''),
  /** GCP 서비스 계정 이메일. 없으면 null */
  serviceAccountEmail: z.string().nullable().prefault(''),
});

/**
 * POST /cloud-connections 클라우드 연결 등록 응답
 */
const postCloudConnectionCreateResSchema = z.object({
  /** 클라우드 연결 ID */
  cloudConnectionId: z.number().int(),
  /** 클라우드 제공자 */
  provider: cloudProviderSchema,
  /** 연결 상태 */
  status: z.string().prefault(''),
  /** 검증 Job ID */
  jobId: z.string().prefault(''),
});

const cloudConnectionSchema = z.object({
  /** 클라우드 연결 ID */
  cloudConnectionId: z.number().int(),
  /** 클라우드 제공자 */
  provider: cloudProviderSchema,
  /** 연결 표시 이름 */
  displayName: z.string().prefault(''),
  /** 계정 ID. 없으면 null */
  accountId: z.string().nullable().prefault(''),
  /** 리전 */
  region: z.string().prefault(''),
  /** AWS Role ARN. 없으면 null */
  roleArn: z.string().nullable().prefault(''),
  /** AWS 자격 증명 유형. 없으면 null */
  awsCredentialType: awsCredentialTypeSchema.nullable().prefault(null),
  /** AWS Access Key ID. 없으면 null */
  accessKeyId: z.string().nullable().prefault(''),
  /** Secret Access Key 설정 여부 */
  secretAccessKeyConfigured: z.boolean(),
  /** 세션 토큰 설정 여부 */
  sessionTokenConfigured: z.boolean(),
  /** GCP 자격 증명 유형. 없으면 null */
  gcpCredentialType: gcpCredentialTypeSchema.nullable().prefault(null),
  /** 서비스 계정 키 설정 여부 */
  serviceAccountKeyConfigured: z.boolean(),
  /** GCP 프로젝트 ID. 없으면 null */
  projectId: z.string().nullable().prefault(''),
  /** GCP 서비스 계정 이메일. 없으면 null */
  serviceAccountEmail: z.string().nullable().prefault(''),
  /** 연결 상태 */
  status: z.string().prefault(''),
  /** 마지막 확인 시각. 없으면 null */
  lastCheckedAt: z.string().nullable().prefault(''),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 수정 시각 */
  updatedAt: z.string().prefault(''),
});

const getCloudConnectionListResSchema = z.array(cloudConnectionSchema);
const getCloudConnectionDetailResSchema = cloudConnectionSchema;

/**
 * GET /cloud-connections/{id}/health 클라우드 연결 health 응답
 */
const getCloudConnectionHealthResSchema = z.object({
  /** 클라우드 연결 ID */
  cloudConnectionId: z.number().int(),
  /** 클라우드 제공자 */
  provider: cloudProviderSchema,
  /** 연결 상태 */
  status: z.string().prefault(''),
  /** 상태 메시지. 없으면 null */
  message: z.string().nullable().prefault(''),
  /** 확인 시각. 없으면 null */
  checkedAt: z.string().nullable().prefault(''),
});

/**
 * GET /cloud-connection-verification-jobs/{jobId} 검증 Job 조회 응답
 */
const getCloudConnectionVerificationJobResSchema = z.object({
  /** Job ID */
  jobId: z.string().prefault(''),
  /** 클라우드 연결 ID */
  cloudConnectionId: z.number().int(),
  /** Job 상태 */
  status: cloudVerificationJobStatusSchema,
  /** 연결 상태. 없으면 null */
  connectionStatus: z.string().nullable().prefault(''),
  /** 상태 메시지. 없으면 null */
  message: z.string().nullable().prefault(''),
  /** 시도 횟수 */
  attempt: z.number().int(),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /** 시작 시각. 없으면 null */
  startedAt: z.string().nullable().prefault(''),
  /** 완료 시각. 없으면 null */
  completedAt: z.string().nullable().prefault(''),
});

type PostCloudConnectionCreateReqType = z.infer<typeof postCloudConnectionCreateReqSchema>;
type PostCloudConnectionCreateResType = z.infer<typeof postCloudConnectionCreateResSchema>;
type CloudConnection = z.infer<typeof cloudConnectionSchema>;
type GetCloudConnectionListResType = z.infer<typeof getCloudConnectionListResSchema>;
type GetCloudConnectionDetailResType = z.infer<typeof getCloudConnectionDetailResSchema>;
type GetCloudConnectionHealthResType = z.infer<typeof getCloudConnectionHealthResSchema>;
type GetCloudConnectionVerificationJobResType = z.infer<
  typeof getCloudConnectionVerificationJobResSchema
>;

export {
  postCloudConnectionCreateReqSchema,
  postCloudConnectionCreateResSchema,
  cloudConnectionSchema,
  getCloudConnectionListResSchema,
  getCloudConnectionDetailResSchema,
  getCloudConnectionHealthResSchema,
  getCloudConnectionVerificationJobResSchema,
  type PostCloudConnectionCreateReqType,
  type PostCloudConnectionCreateResType,
  type CloudConnection,
  type GetCloudConnectionListResType,
  type GetCloudConnectionDetailResType,
  type GetCloudConnectionHealthResType,
  type GetCloudConnectionVerificationJobResType,
};

/**
 * 연결에 무엇이 필요한지 서버가 알려 주는 내용.
 *
 * 지금까지 이 안내는 화면이 들고 있었다 — IAM 정책 전문이 컴포넌트 안에 문자열로 박혀
 * 있었고 이번 주에만 다섯 번 고쳤다. 서버가 요구하는 권한이 바뀌면 화면을 다시 배포해야
 * 하고, 잊으면 **화면이 낡은 정책을 안내한다.** 사용자는 그대로 붙였다가 나중에 권한
 * 부족으로 막힌다. 무엇이 필요한지 아는 쪽은 서버다.
 */

/** 자격 방식 하나(역할 위임·액세스 키 등) */
const credentialOptionSchema = z.object({
  /** 이 값을 재조회의 credentialType 으로 보낸다 */
  type: z.string().prefault(''),
  label: z.string().prefault(''),
  /** 서버가 미는 방식. 하나만 true 인 것을 전제하지 않는다 */
  recommended: z.boolean().nullable().prefault(false),
  summary: z.string().nullable().prefault(''),
});

/** 사용자가 채워야 할 입력 한 칸 */
const requirementFieldSchema = z.object({
  key: z.string().prefault(''),
  label: z.string().prefault(''),
  description: z.string().nullable().prefault(''),
  /** 이 값을 콘솔 어디서 가져오는지 */
  whereToFind: z.string().nullable().prefault(''),
  example: z.string().nullable().prefault(''),
  required: z.boolean().nullable().prefault(true),
  /** 화면에 그대로 보여주면 안 되는 값 */
  secret: z.boolean().nullable().prefault(false),
});

/** 연결 전에 콘솔에서 밟아야 하는 단계 */
const requirementStepSchema = z.object({
  order: z.number().int().nullable().prefault(null),
  title: z.string().prefault(''),
  detail: z.string().nullable().prefault(''),
});

/**
 * GET /cloud-connections/requirements 응답.
 *
 * 정책은 **전체본**으로 온다. 조각으로 나눠 보여주면 사용자가 이어 붙이다 틀리고, 그
 * 틀림은 한참 뒤 권한 오류로만 드러난다. 통째로 주고 복사하게 한다.
 */
const getCloudRequirementsResSchema = z.object({
  provider: z.string().prefault(''),
  credentialType: z.string().prefault(''),
  recommendedCredentialType: z.string().nullable().prefault(''),
  credentialOptions: z.array(credentialOptionSchema).prefault([]),
  fields: z.array(requirementFieldSchema).prefault([]),
  steps: z.array(requirementStepSchema).prefault([]),
  policyName: z.string().nullable().prefault(''),
  roleName: z.string().nullable().prefault(''),
  /** 권한 정책 전문. 임의 구조라 그대로 받아 화면에서 문자열로 만든다 */
  recommendedPolicy: z.unknown().nullable().prefault(null),
  /** 신뢰 정책. 역할 위임에만 있고 액세스 키면 null 이라 그때는 자리를 감춘다 */
  trustPolicy: z.unknown().nullable().prefault(null),
  /** 주의 사항. "검증은 권한을 확인하지 않는다" 같은 것이 여기 온다 */
  notes: z.array(z.string()).prefault([]),
});

type CredentialOption = z.infer<typeof credentialOptionSchema>;
type RequirementField = z.infer<typeof requirementFieldSchema>;
type RequirementStep = z.infer<typeof requirementStepSchema>;
type GetCloudRequirementsResType = z.infer<typeof getCloudRequirementsResSchema>;

export {
  credentialOptionSchema,
  requirementFieldSchema,
  requirementStepSchema,
  getCloudRequirementsResSchema,
  type CredentialOption,
  type RequirementField,
  type RequirementStep,
  type GetCloudRequirementsResType,
};
