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
import { readStoredUser } from '@/lib/userStorage';
import {
  dummyConnectRepository,
  dummyGetProjectActivityLogList as dummyActivityLogs,
  dummyGetProjectCommitList as dummyCommits,
  dummyGetProjectOverviewV2,
} from '@/mocks/fixtures/dummyProjectApi';

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

  return dummyGetProjectOverviewV2(projectId, {
    name: project?.name ?? `project-${projectId}`,
    deployStatus: listItem?.deployStatus ?? 'DRAFT',
    currentUrl: listItem?.currentUrl || null,
  });
}

export function dummyGetProjectCommitList(): GetProjectCommitListResType {
  return dummyCommits();
}

export function dummyGetProjectActivityLogList(
  projectId = 1,
): GetProjectActivityLogListResType {
  return dummyActivityLogs(projectId);
}

export function dummyGetProjectRepositoryHealth(): GetProjectRepositoryHealthResType {
  return { health: 'HEALTHY' };
}

export function dummyGetProjectDetailBundle(projectId: number) {
  return {
    project: dummyGetProjectDetail(projectId),
    overview: dummyGetProjectOverview(projectId),
    commits: dummyGetProjectCommitList(),
    activityLogs: dummyGetProjectActivityLogList(projectId),
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
    taskId: `task_init_${projectId}`,
    taskStatus: 'QUEUED',
    approvalIds: [],
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
  return dummyConnectRepository(projectId, params);
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
