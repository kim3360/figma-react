import { mockGithubRepositories } from '@/mocks/github/githubRepositories';
import type {
  DeleteProjectParamsType,
  GetGithubRepositoryListResType,
  GetProjectActivityLogListResType,
  GetProjectCommitListResType,
  GetProjectDetailResType,
  GetProjectListResType,
  GetProjectOverviewResType,
  GetProjectRepositoryHealthResType,
  PatchProjectReqType,
  PostProjectCreateReqType,
  PostProjectCreateResType,
  PostProjectRepositoryReqType,
  PostProjectRepositoryResType,
} from '@/types/projects.type';
import type {
  GetConversationDetailResType,
  GetConversationMessageListResType,
  GetProjectConversationListResType,
  GetTrashConversationListResType,
  PostConversationMessageCreateReqType,
  PostConversationMessageCreateResType,
  PostProjectConversationCreateResType,
  PostTrashConversationRestoreResType,
} from '@/types/chat.type';
import type { GetUserMeResType } from '@/types/user.type';
import type { GitHubCallbackResult } from '@/types/auth.type';
import type { ApiResponse } from '@/types/response.type';
import { readStoredUser } from '@/lib/userStorage';

const ISO_NOW = '2026-07-03T06:00:00.000Z';

const DUMMY_PROJECT_LIST: GetProjectListResType = [
  {
    projectId: 1,
    name: 'cafe-landing-page',
    deployStatus: 'LIVE',
    currentUrl: 'https://cafe-demo.example.com',
    updatedAt: ISO_NOW,
    updatedAtRelativeText: '2시간 전',
    templateType: 'landing',
    startMode: 'template',
  },
  {
    projectId: 2,
    name: 'portfolio-2024',
    deployStatus: 'IN_PROGRESS',
    currentUrl: '',
    updatedAt: ISO_NOW,
    updatedAtRelativeText: '어제',
    templateType: 'portfolio',
    startMode: 'template',
  },
  {
    projectId: 3,
    name: 'saas-intro-site',
    deployStatus: 'PREVIEW_READY',
    currentUrl: 'https://intro-demo.example.com',
    updatedAt: ISO_NOW,
    updatedAtRelativeText: '3일 전',
    templateType: 'business',
    startMode: 'blank',
  },
];

const DUMMY_CONVERSATIONS: GetProjectConversationListResType = [
  {
    conversationId: 101,
    projectId: 1,
    deleted: false,
    deletedAt: '',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    conversationId: 102,
    projectId: 2,
    deleted: false,
    deletedAt: '',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const DUMMY_TRASH: GetTrashConversationListResType = [];

let nextConversationId = 200;
let nextMessageId = 1000;

function findProjectListItem(projectId: number) {
  return DUMMY_PROJECT_LIST.find((p) => p.projectId === projectId);
}

function getProjectDetail(projectId: number): GetProjectDetailResType | null {
  const item = findProjectListItem(projectId);
  if (!item) return null;

  return {
    projectId: item.projectId,
    name: item.name,
    status: 'ACTIVE',
    startMode: item.startMode ?? 'blank',
    templateType: item.templateType ?? '',
    draftMode: 'fast',
    createdAt: ISO_NOW,
    updatedAt: item.updatedAt,
  };
}

export function dummyGetUserInfo(): GetUserMeResType {
  const user = readStoredUser() ?? {
    id: 1,
    username: 'demo-user',
    avatarUrl: '',
    githubAppInstalled: true,
  };

  return {
    status: 200,
    code: '',
    message: '',
    data: user,
  };
}

export function dummyGetGitHubAuthUrl(): ApiResponse<{ url: string; state?: string }> {
  return {
    status: 200,
    code: '',
    message: '',
    data: { url: '', state: 'dummy-state' },
  };
}

export function dummyCompleteGitHubCallback(): ApiResponse<GitHubCallbackResult> {
  return {
    status: 200,
    code: '',
    message: '',
    data: {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
      githubAppInstalled: true,
    },
  };
}

export function dummyGetGitHubAppInstallUrl(): ApiResponse<{ url: string }> {
  return {
    status: 200,
    code: '',
    message: '',
    data: { url: '#' },
  };
}

export async function dummyLogout(): Promise<ApiResponse<void>> {
  return { status: 200, code: '', message: '' };
}

export function dummyGetGithubRepositoryList(): GetGithubRepositoryListResType {
  return mockGithubRepositories;
}

export function dummyGetProjectList(): GetProjectListResType {
  return [...DUMMY_PROJECT_LIST];
}

export function dummyGetProjectDetail(projectId: number): GetProjectDetailResType {
  const project = getProjectDetail(projectId);
  if (!project) {
    throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}`);
  }
  return project;
}

export function dummyGetProjectOverview(projectId: number): GetProjectOverviewResType {
  const project = getProjectDetail(projectId);
  const listItem = findProjectListItem(projectId);

  return {
    currentUrl: listItem?.currentUrl ?? '',
    deployStatus: listItem?.deployStatus ?? 'DRAFT',
    currentVersion: 'v1',
    recentChanges: ['히어로 섹션 카피 수정', 'CTA 버튼 색상 변경'],
    latestCommit: {
      sha: 'a1b2c3d',
      message: 'feat: update landing hero copy',
      author: 'demo-user',
      committedAt: ISO_NOW,
    },
    trafficSummary: '더미 데이터 — 트래픽 지표는 API 연동 후 표시됩니다.',
    repositoryHealth: { health: 'HEALTHY' },
    domainSummary: project ? `${project.name}.devely.app` : '도메인 미연결',
  };
}

export function dummyGetProjectCommitList(): GetProjectCommitListResType {
  return [
    {
      sha: 'a1b2c3d4e5f6',
      message: 'feat: update landing hero copy',
      author: 'demo-user',
      committedAt: ISO_NOW,
    },
    {
      sha: 'b2c3d4e5f6a1',
      message: 'chore: adjust spacing on mobile',
      author: 'demo-user',
      committedAt: ISO_NOW,
    },
  ];
}

export function dummyGetProjectActivityLogList(): GetProjectActivityLogListResType {
  return [
    {
      type: 'PROJECT_CREATED',
      message: '프로젝트가 생성되었습니다.',
      occurredAt: ISO_NOW,
    },
  ];
}

export function dummyGetProjectRepositoryHealth(): GetProjectRepositoryHealthResType {
  return { health: 'HEALTHY' };
}

export function dummyGetProjectDetailBundle(projectId: number) {
  return {
    project: dummyGetProjectDetail(projectId),
    overview: dummyGetProjectOverview(projectId),
    commits: dummyGetProjectCommitList(),
    activityLogs: dummyGetProjectActivityLogList(),
    repositoryHealth: dummyGetProjectRepositoryHealth(),
  };
}

export function dummyPostProjectCreate(params: PostProjectCreateReqType): PostProjectCreateResType {
  const projectId = DUMMY_PROJECT_LIST.length + 1;
  DUMMY_PROJECT_LIST.push({
    projectId,
    name: params.name,
    deployStatus: 'DRAFT',
    currentUrl: '',
    updatedAt: ISO_NOW,
    updatedAtRelativeText: '방금 전',
    templateType: params.templateType,
    startMode: params.startMode,
  });

  return {
    projectId,
    name: params.name,
    status: 'DRAFT',
  };
}

export function dummyPatchProject(
  projectId: number,
  params: PatchProjectReqType,
): GetProjectDetailResType {
  const listItem = findProjectListItem(projectId);
  if (listItem) {
    listItem.name = params.name;
    listItem.updatedAt = ISO_NOW;
    listItem.updatedAtRelativeText = '방금 전';
  }
  return dummyGetProjectDetail(projectId);
}

export function dummyDeleteProject(params: DeleteProjectParamsType): void {
  const idx = DUMMY_PROJECT_LIST.findIndex((p) => p.projectId === params.projectId);
  if (idx >= 0) {
    DUMMY_PROJECT_LIST.splice(idx, 1);
  }
}

export function dummyPostProjectRepository(
  projectId: number,
  params: PostProjectRepositoryReqType,
): PostProjectRepositoryResType {
  const fullName =
    params.repositoryFullName ??
    (params.repositoryName ? `demo-user/${params.repositoryName}` : 'demo-user/my-repo');

  return {
    projectId,
    repositoryFullName: fullName,
    repositoryVisibility: params.repositoryVisibility ?? 'PRIVATE',
    bindingStatus: 'BOUND',
    repositoryHealth: 'HEALTHY',
  };
}

export function dummyGetProjectConversationList(
  projectId: number,
): GetProjectConversationListResType {
  return DUMMY_CONVERSATIONS.filter((c) => c.projectId === projectId && !c.deleted);
}

export function dummyPostProjectConversationCreate(
  projectId: number,
): PostProjectConversationCreateResType {
  const conversation = {
    conversationId: nextConversationId++,
    projectId,
    deleted: false,
    deletedAt: '',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  };
  DUMMY_CONVERSATIONS.push(conversation);
  return conversation;
}

export function dummyGetConversationDetail(conversationId: number): GetConversationDetailResType {
  const found = DUMMY_CONVERSATIONS.find((c) => c.conversationId === conversationId);
  if (!found) {
    throw new Error(`대화를 찾을 수 없습니다: ${conversationId}`);
  }
  return found;
}

export function dummyGetConversationMessageList(
  conversationId: number,
): GetConversationMessageListResType {
  return [
    {
      messageId: 1,
      conversationId,
      role: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요?',
      tokenCount: 0,
      createdAt: ISO_NOW,
    },
  ];
}

export function dummyPostConversationMessageCreate(
  conversationId: number,
  params: PostConversationMessageCreateReqType,
): PostConversationMessageCreateResType {
  return {
    messageId: nextMessageId++,
    conversationId,
    role: 'user',
    content: params.content,
    tokenCount: 0,
    createdAt: ISO_NOW,
  };
}

export function dummyDeleteConversation(conversationId: number): void {
  const conv = DUMMY_CONVERSATIONS.find((c) => c.conversationId === conversationId);
  if (!conv) return;
  conv.deleted = true;
  conv.deletedAt = ISO_NOW;
  DUMMY_TRASH.push({ ...conv });
}

export function dummyGetTrashConversationList(): GetTrashConversationListResType {
  return [...DUMMY_TRASH];
}

export function dummyPostTrashConversationRestore(
  conversationId: number,
): PostTrashConversationRestoreResType {
  const trashIdx = DUMMY_TRASH.findIndex((c) => c.conversationId === conversationId);
  if (trashIdx >= 0) {
    const restored = { ...DUMMY_TRASH[trashIdx], deleted: false, deletedAt: '' };
    DUMMY_TRASH.splice(trashIdx, 1);
    const conv = DUMMY_CONVERSATIONS.find((c) => c.conversationId === conversationId);
    if (conv) {
      Object.assign(conv, restored);
    } else {
      DUMMY_CONVERSATIONS.push(restored);
    }
    return restored;
  }

  return dummyGetConversationDetail(conversationId);
}
