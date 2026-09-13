import { z } from 'zod';
import { deployTargetTypeSchema } from '@/types/common.enum';

/**
 * POST /projects/{projectId}/deployments 배포 요청
 */
/**
 * 프론트를 어디에 올릴지. 생략하면 프로젝트에 저장된 현재 설정을 쓴다.
 *
 * 값을 닫지 않는다 — 호스팅 종류는 늘어나기 쉽고(로드맵에 AWS_S3_FRONTEND 같은 세분화가
 * 이미 있다), 닫아두면 값이 하나 늘 때 배포 화면이 통째로 파싱에 실패한다.
 */
const frontendHostingTypeSchema = z.string().prefault('');

const postProjectDeploymentCreateReqSchema = z.object({
  /** 배포 대상 유형 */
  deployTargetType: deployTargetTypeSchema,
  /** 버전 이름. LATEST면 null */
  versionName: z.string().nullable().prefault(''),
  /** 프론트 호스팅 방식. 생략하면 프로젝트 설정을 따른다 */
  frontendHostingType: z.string().optional(),
});

const deployResponseSchema = z.object({
  /** 배포 ID */
  deploymentId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 배포 대상 유형 */
  deployTargetType: z.string().prefault(''),
  /** 버전 이름. 없으면 null */
  versionName: z.string().nullable().prefault(''),
  /** 배포 상태 */
  status: z.string().prefault(''),
  /** GitHub Pages URL. 없으면 null */
  pagesUrl: z.string().nullable().prefault(''),
  /** 생성 시각 */
  createdAt: z.string().prefault(''),
  /**
   * 이 요청이 만든 승인 ID. 비어 있으면 승인 없이 바로 배포가 돈다.
   *
   * EC2 호스팅만 채워진다 — 과금되는 인스턴스를 띄우기 때문이다. 그때는 deploymentId 가
   * 배포 id 가 아니라 **대기 중인 서버 id** 이고, 승인하기 전까지 아무것도 진행되지 않는다.
   * 이 값을 안 읽으면 화면이 "요청됨" 으로만 보여서 멈춰 있는 것을 진행처럼 읽게 된다.
   */
  approvalIds: z.array(z.number().int()).prefault([]),
});

const deploymentHistorySchema = z.object({
  /** 배포 이력 ID */
  historyId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 배포 대상 유형 */
  deployTargetType: z.string().prefault(''),
  /** 버전 라벨. 없으면 null */
  versionLabel: z.string().nullable().prefault(''),
  /** 배포 URL. 없으면 null */
  deployedUrl: z.string().nullable().prefault(''),
  /** 배포 상태 */
  status: z.string().prefault(''),
  /** 트리거 시각 */
  triggeredAt: z.string().prefault(''),
  /** 수정 시각 */
  updatedAt: z.string().prefault(''),
  /** 재시도 원본 이력 ID. 없으면 null */
  retriedFromHistoryId: z.number().int().nullable().prefault(null),
  /**
   * 실패 분류. 성공·진행 중이면 null.
   * 분류가 붙기 전에 닫힌 옛 이력도 null 이라, errorMessage 만 있는 경우가 있다.
   * 열린 문자열로 받는다 — 화면은 아는 값만 문구로 바꾸고 모르는 값은 상세로 넘긴다.
   */
  errorCode: z.string().nullable().prefault(null),
  /** 실패 상세. 서버 문구 그대로 온다. 성공·진행 중이면 null */
  errorMessage: z.string().nullable().prefault(null),
});

const getProjectDeploymentListResSchema = z.array(deploymentHistorySchema);

const deploymentFailureAnalysisSchema = z.object({
  /** 배포 ID */
  deploymentId: z.number().int(),
  /** 실패 요약. 없으면 null */
  summary: z.string().nullable().prefault(''),
  /** 로그 발췌. 없으면 null */
  logExcerpt: z.string().nullable().prefault(''),
  /** 권장 수정. 없으면 null */
  suggestedFix: z.string().nullable().prefault(''),
  /** 분석 출처. 없으면 null */
  analysisSource: z.string().nullable().prefault(''),
  /** 분석 시각. 없으면 null */
  analyzedAt: z.string().nullable().prefault(''),
});

const versionDetailSchema = z.object({
  /** 버전 ID */
  versionId: z.number().int(),
  /** 버전 이름 */
  versionName: z.string().prefault(''),
  /** 커밋 SHA. 없으면 null */
  commitSha: z.string().nullable().prefault(''),
  /** 제목. 없으면 null */
  title: z.string().nullable().prefault(''),
  /** 설명. 없으면 null */
  description: z.string().nullable().prefault(''),
  /** 배포 상태. 없으면 null */
  deployStatus: z.string().nullable().prefault(''),
  /** 배포 URL. 없으면 null */
  deployedUrl: z.string().nullable().prefault(''),
  /** 머지한 사용자. 없으면 null */
  mergedBy: z.string().nullable().prefault(''),
  /** 머지한 사용자 아바타. 없으면 null */
  mergedByAvatarUrl: z.string().nullable().prefault(''),
  /** PR 번호. 없으면 null */
  prNumber: z.number().int().nullable().prefault(null),
  /** 머지 시각. 없으면 null */
  mergedAt: z.string().nullable().prefault(''),
});

const versionSummarySchema = z.object({
  /** 버전 ID */
  versionId: z.number().int(),
  /** 버전 이름 */
  versionName: z.string().prefault(''),
  /** 커밋 SHA. 없으면 null */
  commitSha: z.string().nullable().prefault(''),
  /** 제목. 없으면 null */
  title: z.string().nullable().prefault(''),
  /** 배포 상태. 없으면 null */
  deployStatus: z.string().nullable().prefault(''),
  /** 머지 시각. 없으면 null */
  mergedAt: z.string().nullable().prefault(''),
});

const getProjectVersionListResSchema = z.array(versionSummarySchema);

const deploymentCandidateSchema = z.object({
  /** 버전 ID */
  versionId: z.number().int(),
  /** 버전 이름 */
  versionName: z.string().prefault(''),
  /** 커밋 SHA. 없으면 null */
  commitSha: z.string().nullable().prefault(''),
  /** 제목. 없으면 null */
  title: z.string().nullable().prefault(''),
  /** 배포 상태. 없으면 null */
  deployStatus: z.string().nullable().prefault(''),
  /** 배포 URL. 없으면 null */
  deployedUrl: z.string().nullable().prefault(''),
  /** 배포 시각. 없으면 null */
  deployedAt: z.string().nullable().prefault(''),
});

const getProjectDeploymentCandidateListResSchema = z.array(deploymentCandidateSchema);

const deploymentStatusSchema = z.object({
  /** 배포 이력 ID */
  historyId: z.number().int(),
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 배포 대상 유형 */
  deployTargetType: z.string().prefault(''),
  /** 버전 라벨. 없으면 null */
  versionLabel: z.string().nullable().prefault(''),
  /** 배포 URL. 없으면 null */
  deployedUrl: z.string().nullable().prefault(''),
  /** 배포 상태 */
  status: z.string().prefault(''),
  /** 빌드 상태. 없으면 null */
  buildStatus: z.string().nullable().prefault(''),
  /** 빌드 결과. 없으면 null */
  buildConclusion: z.string().nullable().prefault(''),
  /** 트리거 시각 */
  triggeredAt: z.string().prefault(''),
  /** 수정 시각 */
  updatedAt: z.string().prefault(''),
});

const deploymentStepSchema = z.object({
  /** 스텝 번호 */
  number: z.number().int(),
  /** 스텝 이름 */
  name: z.string().prefault(''),
  /** 상태. 없으면 null */
  status: z.string().nullable().prefault(''),
  /** 결과. 없으면 null */
  conclusion: z.string().nullable().prefault(''),
});

const deploymentJobSchema = z.object({
  /** Job ID */
  jobId: z.number().int(),
  /** Job 이름 */
  name: z.string().prefault(''),
  /** 상태. 없으면 null */
  status: z.string().nullable().prefault(''),
  /** 결과. 없으면 null */
  conclusion: z.string().nullable().prefault(''),
  /** 스텝 목록 */
  steps: z.array(deploymentStepSchema),
});

const deploymentLogsSchema = z.object({
  /** 배포 이력 ID */
  historyId: z.number().int(),
  /** 워크플로 런 ID. 없으면 null */
  workflowRunId: z.number().int().nullable().prefault(null),
  /** Job 목록 */
  jobs: z.array(deploymentJobSchema),
  /** 로그 텍스트. 없으면 null */
  logText: z.string().nullable().prefault(''),
});

type PostProjectDeploymentCreateReqType = z.infer<typeof postProjectDeploymentCreateReqSchema>;
type DeployResponse = z.infer<typeof deployResponseSchema>;
type GetProjectDeploymentListResType = z.infer<typeof getProjectDeploymentListResSchema>;
type DeploymentFailureAnalysis = z.infer<typeof deploymentFailureAnalysisSchema>;
type VersionDetail = z.infer<typeof versionDetailSchema>;
type GetProjectVersionListResType = z.infer<typeof getProjectVersionListResSchema>;
type GetProjectDeploymentCandidateListResType = z.infer<
  typeof getProjectDeploymentCandidateListResSchema
>;
type DeploymentStatus = z.infer<typeof deploymentStatusSchema>;
type DeploymentLogs = z.infer<typeof deploymentLogsSchema>;

export {
  frontendHostingTypeSchema,
  postProjectDeploymentCreateReqSchema,
  deployResponseSchema,
  deploymentHistorySchema,
  getProjectDeploymentListResSchema,
  deploymentFailureAnalysisSchema,
  versionDetailSchema,
  versionSummarySchema,
  getProjectVersionListResSchema,
  deploymentCandidateSchema,
  getProjectDeploymentCandidateListResSchema,
  deploymentStatusSchema,
  deploymentLogsSchema,
  type PostProjectDeploymentCreateReqType,
  type DeployResponse,
  type GetProjectDeploymentListResType,
  type DeploymentFailureAnalysis,
  type VersionDetail,
  type GetProjectVersionListResType,
  type GetProjectDeploymentCandidateListResType,
  type DeploymentStatus,
  type DeploymentLogs,
};
