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
});

/**
 * GET /projects/{projectId}/commit 프로젝트 커밋 목록 조회 응답
 */
const getProjectCommitListResSchema = z.array(projectLatestCommitSchema);

/**
 * 프로젝트 활동 유형
 * @example "PROJECT_CREATED"
 */
const projectActivityTypeSchema = z.enum(['PROJECT_CREATED']);

/**
 * 프로젝트 활동 로그
 */
const projectActivityLogSchema = z.object({
  /** 활동 유형 */
  type: projectActivityTypeSchema,
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

/**
 * GET /projects/{projectId}/overview 프로젝트 개요 조회 응답
 */
const getProjectOverviewResSchema = z.object({
  /** 현재 배포 URL. 배포 전이면 null */
  currentUrl: z.string().nullable().prefault(''),
  /** 현재 배포 상태 */
  deployStatus: deployStatusSchema,
  /** 현재 배포 버전 */
  currentVersion: z.string().min(1, '배포 버전이 없습니다.').prefault(''),
  /** 최근 프로젝트 변경 요약 */
  recentChanges: z.array(z.string().min(1, '변경 요약이 없습니다.').prefault('')),
  /** 연결 저장소의 최신 커밋. 저장소가 없으면 null */
  latestCommit: projectLatestCommitSchema.nullable().prefault(null),
  /** 트래픽 요약. 현재는 외부 지표 미연동 안내 문구 */
  trafficSummary: z.string().min(1, '트래픽 요약이 없습니다.').prefault(''),
  /** 연결 저장소 health 요약 */
  repositoryHealth: projectRepositoryHealthSummarySchema,
  /** 도메인 요약. 현재는 관리형 도메인 미연동 안내 문구 */
  domainSummary: z.string().min(1, '도메인 요약이 없습니다.').prefault(''),
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
/** GET /projects/{projectId}/commit 프로젝트 커밋 목록 조회 응답 */
type GetProjectCommitListResType = z.infer<typeof getProjectCommitListResSchema>;
/** 프로젝트 활동 유형 */
type ProjectActivityType = z.infer<typeof projectActivityTypeSchema>;
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
  projectActivityTypeSchema,
  projectActivityLogSchema,
  getProjectActivityLogListResSchema,
  projectRepositoryHealthSummarySchema,
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
  type ProjectActivityType,
  type ProjectActivityLog,
  type GetProjectActivityLogListResType,
  type ProjectRepositoryHealthSummary,
  type GetProjectOverviewResType,
  type PostProjectRepositoryResType,
  type GithubRepository,
  type GetGithubRepositoryListResType,
};
