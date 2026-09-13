import { z } from 'zod';
import {
  deployStatusSchema,
  projectDeleteModeSchema,
  projectStatusSchema,
  repositoryBindingStatusSchema,
  repositoryHealthStatusSchema,
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
  name: z.string().prefault(''),
  /** 현재 배포 상태 */
  deployStatus: deployStatusSchema,
  /** 현재 배포 URL. 배포 전이면 null */
  currentUrl: z.string().nullable().prefault(''),
  /** 프로젝트 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().prefault(''),
  /** 마지막 수정 시각의 상대 표현 (예: "2시간 전") */
  updatedAtRelativeText: z.string().prefault(''),
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
  name: z.string().prefault(''),
  /** 프로젝트 상태 */
  status: projectStatusSchema,
  /** 프로젝트 시작 방식 */
  startMode: startModeSchema,
  /** 템플릿 유형 */
  templateType: z.string().nullable().prefault(''),
  /** 초안 생성 방식 */
  draftMode: z.string().prefault(''),
  /** 프로젝트 생성 시각 (ISO 8601 date-time) */
  createdAt: z.string().prefault(''),
  /** 프로젝트 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().prefault(''),
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
  /**
   * 사용자가 고른 콘텐츠 템플릿. startMode가 템플릿 기반일 때 사용한다.
   * 빌드 프레임워크가 아니다 — nextjs·vite 같은 이름을 넣지 말 것.
   * 배포가 이 값을 publish 디렉터리 힌트로 읽던 폴백이 있었고(백엔드 #134로 제거),
   * 프레임워크 이름을 넣으면 빈 산출물이 조용히 배포됐다.
   * 지금은 저장만 되고 코드 생성에 반영되지 않는다.
   */
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
  name: z.string().prefault(''),
  /** 프로젝트 상태 */
  status: projectStatusSchema,
});

/**
 * GitHub 저장소 이름
 */
const githubRepositoryNameSchema = z.object({
  /** 새 저장소 생성 시 사용할 저장소 이름 */
  repositoryName: z
    .string()
    .min(1, '저장소 이름을 입력해주세요.')
    .max(100, '저장소 이름은 100자 이하여야 합니다.')
    .regex(/^[A-Za-z0-9._-]+$/, '영문, 숫자, 하이픈(-), 밑줄(_), 점(.)만 사용할 수 있습니다.')
    .refine((value) => value !== '.' && value !== '..', {
      message: '저장소 이름이 올바르지 않습니다.',
    })
    .prefault(''),
});

/**
 * POST /projects/{projectId}/repository 새 저장소 생성 폼
 */
const postProjectRepositoryCreateFormSchema = githubRepositoryNameSchema.extend({
  /** 새 저장소 생성 시 공개 범위 */
  repositoryVisibility: repositoryVisibilitySchema,
});

/**
 * POST /projects/{projectId}/repository 새 저장소 생성 요청
 */
const postProjectRepositoryCreateReqSchema = githubRepositoryNameSchema.extend({
  /** 저장소 연결 방식 */
  repositoryMode: z.literal('create'),
  /** 기존 저장소 연결 시 owner/repo 형식의 전체 이름 */
  repositoryFullName: z.string().nullable().prefault(''),
  /** 새 저장소 생성 시 공개 범위. 값이 없으면 PRIVATE */
  repositoryVisibility: repositoryVisibilitySchema.nullable().prefault(null),
});

/**
 * POST /projects/{projectId}/repository 기존 저장소 연결 요청
 */
const postProjectRepositoryExistingReqSchema = z.object({
  /** 저장소 연결 방식 */
  repositoryMode: z.literal('existing'),
  /** 새 저장소 생성 시 사용할 저장소 이름 */
  repositoryName: z.string().nullable().prefault(''),
  /** 기존 저장소 연결 시 owner/repo 형식의 전체 이름 */
  repositoryFullName: z.string().min(1, '연결할 저장소를 선택해주세요.').prefault(''),
  /** 새 저장소 생성 시 공개 범위. 값이 없으면 PRIVATE */
  repositoryVisibility: repositoryVisibilitySchema.nullable().prefault(null),
});

/**
 * POST /projects/{projectId}/repository 프로젝트 GitHub 저장소 연결 요청
 */
const postProjectRepositoryReqSchema = z.discriminatedUnion('repositoryMode', [
  postProjectRepositoryCreateReqSchema,
  postProjectRepositoryExistingReqSchema,
]);

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
  sha: z.string().prefault(''),
  /** 커밋 메시지 */
  message: z.string().prefault(''),
  /** 커밋 작성자 */
  author: z.string().prefault(''),
  /** 커밋 시각 (ISO 8601 date-time) */
  committedAt: z.string().prefault(''),
});

/**
 * GET /projects/{projectId}/commit 프로젝트 커밋 목록 조회 응답
 */
const getProjectCommitListResSchema = z.array(projectLatestCommitSchema);

/**
 * 프로젝트 활동 유형
 * @example "PROJECT_CREATED"
 */
/**
 * 활동 유형. 화면은 이 값을 배지 문자열로 보여줄 뿐 분기하지 않으므로 열린 문자열로 받는다.
 *
 * 고정 목록이 아니다 — 서버가 `접두사 + 상태 enum`으로 조합해 만든다
 * (`DEPLOYMENT_` `CHANGE_` `APPROVAL_` `DOMAIN_` + 각 상태, 그리고 `PROJECT_CREATED`).
 * 네 enum 중 어디에 값이 하나 늘어도 새 유형이 저절로 생기므로 닫힌 enum으로 두면
 * 목록 전체가 파싱에 실패해 표가 통째로 빈다. 실제로 그렇게 비어 있었다.
 */
const projectActivityTypeSchema = z.string().prefault('');

/**
 * 프로젝트 활동 로그
 */
const projectActivityLogSchema = z.object({
  /** 활동 유형 */
  type: projectActivityTypeSchema,
  /** 활동 메시지 */
  message: z.string().prefault(''),
  /** 활동 발생 시각 (ISO 8601 date-time) */
  occurredAt: z.string().prefault(''),
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
 * 프로젝트 개요에 실리는 연결 도메인 요약.
 *
 * 상태 계열 필드는 열린 문자열로 받는다. 화면은 `url` 하나로 링크 노출을 판단하고
 * 나머지로 분기하지 않는데, 닫힌 enum 으로 두면 서버가 값을 늘릴 때마다 개요 응답
 * 전체가 파싱에 실패한다. 실제로 이 필드가 문자열 스키마인 채로 객체를 받아
 * 개요 조회가 통째로 실패하고 있었다.
 *
 * `type` 은 서버가 대문자(`MANAGED_SUBDOMAIN`)로 주는데 domain.type.ts 의
 * domainTypeSchema 는 소문자다. 그 불일치도 여기서 닫지 않는 이유다.
 */
const projectDomainSummarySchema = z.object({
  /** 도메인 ID */
  domainId: z.number().int(),
  /** 호스트명 */
  hostname: z.string().prefault(''),
  /** 접속 주소. status가 CONNECTED일 때만 채워진다 — 값이 있으면 지금 열어도 되는 주소다 */
  url: z.string().nullable().prefault(null),
  /** 도메인 유형 */
  type: z.string().nullable().prefault(null),
  /** 호스팅 대상 */
  hostingTarget: z.string().nullable().prefault(null),
  /** 도메인 상태 */
  status: z.string().nullable().prefault(null),
  /** HTTPS 강제 여부 */
  httpsEnforced: z.boolean().prefault(false),
  /** 인증서 상태 */
  certificateStatus: z.string().nullable().prefault(null),
  /** 인증서 만료 시각. 없으면 null */
  certificateExpiresAt: z.string().nullable().prefault(null),
  /** 마지막 확인 시각. 없으면 null */
  lastCheckedAt: z.string().nullable().prefault(null),
});

/**
 * GET /projects/{projectId}/overview 프로젝트 개요 조회 응답
 */
const getProjectOverviewResSchema = z.object({
  /** 현재 배포 URL. 배포 전이면 null */
  currentUrl: z.string().nullable().prefault(''),
  /** 현재 배포 상태 */
  deployStatus: deployStatusSchema,
  /** 현재 배포 버전. 배포 전이면 null */
  currentVersion: z.string().nullable().prefault(null),
  /** 연결 저장소의 최신 커밋. 저장소가 없으면 null */
  latestCommit: projectLatestCommitSchema.nullable().prefault(null),
  /** 연결 저장소 health 요약 */
  repositoryHealth: projectRepositoryHealthSummarySchema,
  /** 연결된 도메인 요약. 연결된 도메인이 없으면 null */
  domainSummary: projectDomainSummarySchema.nullable().prefault(null),
});

/**
 * POST /projects/{projectId}/repository 프로젝트 GitHub 저장소 연결 응답
 */
const postProjectRepositoryResSchema = z.object({
  /** 프로젝트 ID */
  projectId: z.number().int(),
  /** 연결된 GitHub 저장소 전체 이름 */
  repositoryFullName: z.string().prefault(''),
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
  fullName: z.string().prefault(''),
  /** 저장소 이름 */
  name: z.string().prefault(''),
  /** 저장소 소유자 GitHub 로그인명 */
  owner: z.string().prefault(''),
  /** GitHub 저장소 설명 */
  description: z.string().nullable().prefault(''),
  /** 저장소 공개 범위 */
  visibility: repositoryVisibilitySchema,
  /** 기본 브랜치명 */
  defaultBranch: z.string().prefault(''),
  /** GitHub 저장소 마지막 수정 시각 (ISO 8601 date-time) */
  updatedAt: z.string().prefault(''),
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
/** GitHub 저장소 이름 */
type GithubRepositoryName = z.infer<typeof githubRepositoryNameSchema>;
/** POST /projects/{projectId}/repository 새 저장소 생성 폼 */
type PostProjectRepositoryCreateFormType = z.infer<typeof postProjectRepositoryCreateFormSchema>;
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
  githubRepositoryNameSchema,
  postProjectRepositoryCreateFormSchema,
  postProjectRepositoryCreateReqSchema,
  postProjectRepositoryExistingReqSchema,
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
  type GithubRepositoryName,
  type PostProjectRepositoryCreateFormType,
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
