import { z } from 'zod';
import {
  deployStatusSchema,
  projectDeleteModeSchema,
  projectStatusSchema,
  repositoryBindingStatusSchema,
  repositoryHealthStatusSchema,
  repositoryModeSchema,
  repositoryVisibilitySchema,
  startModeSchema,
} from '@/types/common.enum';

/**
 * 프로젝트 목록 항목
 */
const projectListItemSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 프로젝트 이름 */
  name: z.string().min(1, '프로젝트 이름이 없습니다.').prefault(''),
  /** 현재 배포 상태 */
  deployStatus: deployStatusSchema,
  /** 현재 배포 URL. 배포 전이면 null */
  currentUrl: z.string().nullable().prefault(''),
  /** 프로젝트 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().min(1, '수정 시각이 없습니다.').prefault(''),
  /** 마지막 수정 시각의 상대 표현 (예: "2시간 전") */
  updatedAtRelativeText: z.string().min(1, '상대 시각 표현이 없습니다.').prefault(''),
  /** 템플릿 유형. 미설정 시 null */
  templateType: z.string().nullable().prefault(null),
  /** 프로젝트 시작 방식. 미설정 시 null */
  startMode: startModeSchema.nullable().prefault(null),
});

/**
 * GET /projects 프로젝트 목록 조회 응답
 */
const getProjectListResSchema = z.array(projectListItemSchema);

/**
 * GET /projects/{projectId} 프로젝트 상세 조회 요청 (path)
 */
const getProjectDetailParamsSchema = z.object({
  /** 조회할 프로젝트 ID */
  projectId: z.number().int(),
});

/**
 * GET /projects/{projectId} 프로젝트 상세 조회 응답
 */
const getProjectDetailResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 프로젝트 이름 */
  name: z.string().min(1, '프로젝트 이름이 없습니다.').prefault(''),
  /** 프로젝트 상태 */
  status: projectStatusSchema,
  /** 프로젝트 시작 방식 */
  startMode: startModeSchema,
  /** 템플릿 유형 */
  templateType: z.string().nullable().prefault(''),
  /** 초안 생성 방식 */
  draftMode: z.string().min(1, '초안 생성 방식이 없습니다.').prefault(''),
  /** 프로젝트 생성 시각 (ISO 8601 date-time) */
  createdAt: z.string().min(1, '생성 시각이 없습니다.').prefault(''),
  /** 프로젝트 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().min(1, '수정 시각이 없습니다.').prefault(''),
});

/**
 * DELETE /projects/{projectId} 프로젝트 삭제 요청 (path + query)
 */
const deleteProjectParamsSchema = z.object({
  /** 삭제할 프로젝트 ID */
  projectId: z.number().int(),
  /** 삭제 범위. 생략 시 백엔드 기본값(PROJECT_ONLY) */
  deleteMode: projectDeleteModeSchema.nullable().optional(),
});

/**
 * PATCH /projects/{projectId} 프로젝트 수정 요청
 */
const patchProjectReqSchema = z.object({
  /** 변경할 프로젝트 이름 */
  name: z.string().min(1, '변경할 프로젝트 이름을 입력해주세요.').prefault(''),
});

/**
 * POST /projects 프로젝트 생성 요청
 */
const postProjectCreateReqSchema = z.object({
  /** 프로젝트 이름 */
  name: z.string().min(1, '프로젝트 이름을 입력해주세요.').prefault(''),
  /** 프로젝트 시작 방식 */
  startMode: startModeSchema,
  /** 템플릿 유형. startMode가 템플릿 기반일 때 사용 */
  templateType: z.string().nullable().prefault(''),
  /** 초안 생성 방식. 값이 없으면 fast로 보정됩니다. */
  draftMode: z.string().nullable().prefault(''),
});

/**
 * POST /projects 프로젝트 생성 응답
 */
const postProjectCreateResSchema = z.object({
  /** 생성된 프로젝트 ID */
  projectId: z.number().int(),
  /** 프로젝트 이름 */
  name: z.string().min(1, '프로젝트 이름이 없습니다.').prefault(''),
  /** 프로젝트 상태 */
  status: projectStatusSchema,
  /** 초기 코드 생성 Agent task ID */
  taskId: z.string().nullable().prefault(null),
  /** 초기 코드 생성 task 상태 */
  taskStatus: z.string().nullable().prefault(null),
  /** 초기 코드 생성에 필요한 승인 ID */
  approvalIds: z.array(z.number().int()).prefault([]),
});

/**
 * POST /projects/{projectId}/repository 프로젝트 GitHub 저장소 연결 요청
 */
const postProjectRepositoryReqSchema = z.object({
  /** 저장소 연결 방식 */
  repositoryMode: repositoryModeSchema,
  /** 새 저장소 생성 시 사용할 저장소 이름 */
  repositoryName: z.string().nullable().prefault(''),
  /** 기존 저장소 연결 시 owner/repo 형식의 전체 이름 */
  repositoryFullName: z.string().nullable().prefault(''),
  /** 새 저장소 생성 시 공개 범위. 값이 없으면 PRIVATE */
  repositoryVisibility: repositoryVisibilitySchema.nullable().prefault(null),
});

/**
 * GET /projects/{projectId}/repository-health 프로젝트 저장소 health 응답
 */
const getProjectRepositoryHealthResSchema = z.object({
  /** 저장소 접근 상태 */
  health: repositoryHealthStatusSchema,
});

/**
 * 프로젝트 저장소 커밋 정보
 */
const projectLatestCommitSchema = z.object({
  /** 커밋 SHA */
  sha: z.string().min(1, '커밋 SHA가 없습니다.').prefault(''),
  /** 커밋 메시지 */
  message: z.string().min(1, '커밋 메시지가 없습니다.').prefault(''),
  /** 커밋 작성자 */
  author: z.string().min(1, '커밋 작성자가 없습니다.').prefault(''),
  /** 커밋 시각 (ISO 8601 date-time) */
  committedAt: z.string().min(1, '커밋 시각이 없습니다.').prefault(''),
  /** 상대 시간 표현 */
  relativeTime: z.string().nullable().prefault(null),
});

/**
 * GET /projects/{projectId}/commits 프로젝트 커밋 목록 조회 응답
 */
const getProjectCommitListResSchema = z.array(projectLatestCommitSchema);

/**
 * 프로젝트 활동 로그
 */
const projectActivityLogSchema = z.object({
  /** 활동 유형 (예: PROJECT_CREATED, DEPLOYMENT_SUCCEEDED) */
  type: z.string().prefault(''),
  /** 활동 메시지 */
  message: z.string().min(1, '활동 메시지가 없습니다.').prefault(''),
  /** 활동 발생 시각 (ISO 8601 date-time) */
  occurredAt: z.string().min(1, '활동 발생 시각이 없습니다.').prefault(''),
});

/**
 * GET /projects/{projectId}/activity-logs 프로젝트 활동 로그 조회 응답
 */
const getProjectActivityLogListResSchema = z.array(projectActivityLogSchema);

/**
 * 연결 저장소 health 요약
 */
const projectRepositoryHealthSummarySchema = z.object({
  /** 저장소 접근 상태 */
  health: repositoryHealthStatusSchema,
});

const projectDomainSummarySchema = z.object({
  domainId: z.number().int(),
  hostname: z.string().prefault(''),
  url: z.string().prefault(''),
  type: z.enum(['managed_subdomain', 'custom_domain', 'purchasable_domain']),
  hostingTarget: z.enum(['GITHUB_PAGES', 'AWS', 'GCP']),
  status: z.enum(['REQUESTED', 'PROVISIONING', 'VERIFYING', 'CONNECTED', 'FAILED']),
  httpsEnforced: z.boolean(),
  certificateStatus: z.enum(['PENDING', 'PROVISIONING', 'ACTIVE', 'FAILED']).nullable().prefault(null),
  certificateExpiresAt: z.string().nullable().prefault(null),
  lastCheckedAt: z.string().nullable().prefault(null),
});

const projectCloudSummarySchema = z.object({
  configured: z.boolean(),
  cloudConnectionId: z.number().int().nullable().prefault(null),
  provider: z.enum(['AWS', 'GCP']).nullable().prefault(null),
  displayName: z.string().nullable().prefault(null),
  region: z.string().nullable().prefault(null),
  status: z
    .enum([
      'VALIDATED',
      'VERIFYING',
      'CHECKING',
      'CONNECTED',
      'PERMISSION_MISSING',
      'BILLING_DISABLED',
      'REGION_UNSUPPORTED',
      'INVALID_CREDENTIAL',
      'UNKNOWN_ERROR',
    ])
    .nullable()
    .prefault(null),
  lastCheckedAt: z.string().nullable().prefault(null),
});

const projectOperationActionSchema = z.object({
  type: z.enum([
    'DEPLOY',
    'MANAGE_DOMAIN',
    'MANAGE_CLOUD',
    'OPEN_AI_AGENT',
    'PROJECT_SETTINGS',
    'REMOVE_PROJECT',
  ]),
  available: z.boolean(),
  reason: z.string().nullable().prefault(null),
});

/**
 * GET /projects/{projectId}/overview 프로젝트 개요 조회 응답
 */
const getProjectOverviewResSchema = z.object({
  /** 현재 배포 URL. 배포 전이면 null */
  currentUrl: z.string().nullable().prefault(null),
  /** 현재 배포 상태 */
  deployStatus: deployStatusSchema,
  /** 현재 배포 버전 */
  currentVersion: z.string().nullable().prefault(null),
  /** GitHub webhook으로 동기화된 최신 저장소 태그 */
  repositoryVersion: z.string().nullable().prefault(null),
  /** 최근 운영 이벤트 */
  recentChanges: z.array(projectActivityLogSchema).prefault([]),
  /** 연결 저장소의 최신 커밋. 저장소가 없으면 null */
  latestCommit: projectLatestCommitSchema.nullable().prefault(null),
  /** 연결 저장소 health 요약 */
  repositoryHealth: projectRepositoryHealthSummarySchema.nullable().prefault(null),
  /** 현재 우선 도메인 요약 */
  domainSummary: projectDomainSummarySchema.nullable().prefault(null),
  /** 선택된 클라우드 연결 상태 */
  cloudSummary: projectCloudSummarySchema.nullable().prefault(null),
  /** 현재 프로젝트 상태에 따른 운영 조치 */
  operationActions: z.array(projectOperationActionSchema).prefault([]),
});

/**
 * POST /projects/{projectId}/repository 프로젝트 GitHub 저장소 연결 응답
 */
const postProjectRepositoryResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 연결된 GitHub 저장소 전체 이름 */
  repositoryFullName: z.string().min(1, '저장소 전체 이름이 없습니다.').prefault(''),
  /** 저장소 공개 범위 */
  repositoryVisibility: repositoryVisibilitySchema,
  /** 저장소 연결 상태 */
  bindingStatus: repositoryBindingStatusSchema,
  /** 저장소 health 상태 */
  repositoryHealth: repositoryHealthStatusSchema,
});

/**
 * GitHub 저장소 정보
 */
const githubRepositorySchema = z.object({
  /** owner/repo 형식의 저장소 전체 이름 */
  fullName: z.string().min(1, '저장소 전체 이름이 없습니다.').prefault(''),
  /** 저장소 이름 */
  name: z.string().min(1, '저장소 이름이 없습니다.').prefault(''),
  /** 저장소 소유자 GitHub 로그인명 */
  owner: z.string().min(1, '저장소 소유자가 없습니다.').prefault(''),
  /** GitHub 저장소 설명 */
  description: z.string().nullable().prefault(''),
  /** 저장소 공개 범위 */
  visibility: repositoryVisibilitySchema,
  /** 기본 브랜치명 */
  defaultBranch: z.string().min(1, '기본 브랜치명이 없습니다.').prefault(''),
  /** GitHub 저장소 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().min(1, '수정 시각이 없습니다.').prefault(''),
});

/**
 * GET /projects/github/repositories GitHub 저장소 목록 조회 응답
 */
const getGithubRepositoryListResSchema = z.array(githubRepositorySchema);

/** 프로젝트 목록 항목 */
type ProjectListItem = z.infer<typeof projectListItemSchema>;
/** GET /projects 프로젝트 목록 조회 응답 */
type GetProjectListResType = z.infer<typeof getProjectListResSchema>;
/** GET /projects/{projectId} 프로젝트 상세 조회 요청 (path) */
type GetProjectDetailParamsType = z.infer<typeof getProjectDetailParamsSchema>;
/** GET /projects/{projectId} 프로젝트 상세 조회 응답 */
type GetProjectDetailResType = z.infer<typeof getProjectDetailResSchema>;
/** DELETE /projects/{projectId} 프로젝트 삭제 요청 (path + query) */
type DeleteProjectParamsType = z.infer<typeof deleteProjectParamsSchema>;
/** PATCH /projects/{projectId} 프로젝트 수정 요청 */
type PatchProjectReqType = z.infer<typeof patchProjectReqSchema>;
/** POST /projects 프로젝트 생성 요청 */
type PostProjectCreateReqType = z.infer<typeof postProjectCreateReqSchema>;
/** POST /projects 프로젝트 생성 응답 */
type PostProjectCreateResType = z.infer<typeof postProjectCreateResSchema>;
/** POST /projects/{projectId}/repository 프로젝트 GitHub 저장소 연결 요청 */
type PostProjectRepositoryReqType = z.infer<typeof postProjectRepositoryReqSchema>;
/** GET /projects/{projectId}/repository-healty 프로젝트 저장소 health 응답 */
type GetProjectRepositoryHealthResType = z.infer<typeof getProjectRepositoryHealthResSchema>;
/** 프로젝트 저장소 커밋 정보 */
type ProjectLatestCommit = z.infer<typeof projectLatestCommitSchema>;
/** GET /projects/{projectId}/commits 프로젝트 커밋 목록 조회 응답 */
type GetProjectCommitListResType = z.infer<typeof getProjectCommitListResSchema>;
/** 프로젝트 활동 로그 */
type ProjectActivityLog = z.infer<typeof projectActivityLogSchema>;
/** GET /projects/{projectId}/activity-logs 프로젝트 활동 로그 조회 응답 */
type GetProjectActivityLogListResType = z.infer<typeof getProjectActivityLogListResSchema>;
/** 연결 저장소 health 요약 */
type ProjectRepositoryHealthSummary = z.infer<typeof projectRepositoryHealthSummarySchema>;
/** GET /projects/{projectId}/overview 프로젝트 개요 조회 응답 */
type GetProjectOverviewResType = z.infer<typeof getProjectOverviewResSchema>;
/** POST /projects/{projectId}/repository 프로젝트 GitHub 저장소 연결 응답 */
type PostProjectRepositoryResType = z.infer<typeof postProjectRepositoryResSchema>;
/** GitHub 저장소 정보 */
type GithubRepository = z.infer<typeof githubRepositorySchema>;
/** GET /projects/github/repositories GitHub 저장소 목록 조회 응답 */
type GetGithubRepositoryListResType = z.infer<typeof getGithubRepositoryListResSchema>;

export {
  projectListItemSchema,
  getProjectListResSchema,
  getProjectDetailParamsSchema,
  getProjectDetailResSchema,
  deleteProjectParamsSchema,
  patchProjectReqSchema,
  postProjectCreateReqSchema,
  postProjectCreateResSchema,
  postProjectRepositoryReqSchema,
  getProjectRepositoryHealthResSchema,
  projectLatestCommitSchema,
  getProjectCommitListResSchema,
  projectActivityLogSchema,
  getProjectActivityLogListResSchema,
  projectRepositoryHealthSummarySchema,
  projectDomainSummarySchema,
  projectCloudSummarySchema,
  projectOperationActionSchema,
  getProjectOverviewResSchema,
  postProjectRepositoryResSchema,
  githubRepositorySchema,
  getGithubRepositoryListResSchema,
  type ProjectListItem,
  type GetProjectListResType,
  type GetProjectDetailParamsType,
  type GetProjectDetailResType,
  type DeleteProjectParamsType,
  type PatchProjectReqType,
  type PostProjectCreateReqType,
  type PostProjectCreateResType,
  type PostProjectRepositoryReqType,
  type GetProjectRepositoryHealthResType,
  type ProjectLatestCommit,
  type GetProjectCommitListResType,
  type ProjectActivityLog,
  type GetProjectActivityLogListResType,
  type ProjectRepositoryHealthSummary,
  type GetProjectOverviewResType,
  type PostProjectRepositoryResType,
  type GithubRepository,
  type GetGithubRepositoryListResType,
};
