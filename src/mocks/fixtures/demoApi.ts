import type {
  GetProjectActivityLogListResType,
  GetProjectCommitListResType,
  GetProjectDetailResType,
  GetProjectListResType,
  GetProjectOverviewResType,
  GetProjectRepositoryHealthResType,
  PostProjectCreateReqType,
  PostProjectCreateResType,
} from '@/types/projects.type';
import type {
  GetConversationDetailResType,
  GetConversationMessageListResType,
  GetProjectConversationListResType,
  GetTrashConversationListResType,
  PostConversationMessageCreateReqType,
  PostConversationMessageCreateResType,
  PostProjectConversationCreateResType,
} from '@/types/chat.type';
import type { GetUserMeResType } from '@/types/user.type';
import { readStoredUser } from '@/lib/userStorage';

const ISO_NOW = '2026-07-03T06:00:00.000Z';

const DEMO_PROJECT_LIST: GetProjectListResType = [
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

function getDemoProjectDetail(projectId: number): GetProjectDetailResType | null {
  const item = DEMO_PROJECT_LIST.find((p) => p.projectId === projectId);
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

const DEMO_CONVERSATIONS: GetProjectConversationListResType = [
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

let nextConversationId = 200;
let nextMessageId = 1000;

export function demoGetUserInfo(): GetUserMeResType {
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

export function demoGetProjectList(): GetProjectListResType {
  return DEMO_PROJECT_LIST;
}

export function demoGetProjectDetail(projectId: number): GetProjectDetailResType {
  const project = getDemoProjectDetail(projectId);
  if (!project) {
    throw new Error(`Demo project not found: ${projectId}`);
  }
  return project;
}

export function demoGetProjectOverview(projectId: number): GetProjectOverviewResType {
  const project = getDemoProjectDetail(projectId);
  const listItem = DEMO_PROJECT_LIST.find((p) => p.projectId === projectId);

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
    trafficSummary: '데모 모드 — 트래픽 데이터는 API 연동 후 표시됩니다.',
    repositoryHealth: { health: 'HEALTHY' },
    domainSummary: project
      ? `${project.name}.devely.app (데모)`
      : '도메인 미연결 (데모)',
  };
}

export function demoGetProjectCommitList(): GetProjectCommitListResType {
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

export function demoGetProjectActivityLogList(): GetProjectActivityLogListResType {
  return [
    {
      type: 'PROJECT_CREATED',
      message: '프로젝트가 생성되었습니다.',
      occurredAt: ISO_NOW,
    },
  ];
}

export function demoGetProjectRepositoryHealth(): GetProjectRepositoryHealthResType {
  return { health: 'HEALTHY' };
}

export function demoGetProjectDetailBundle(projectId: number) {
  return {
    project: demoGetProjectDetail(projectId),
    overview: demoGetProjectOverview(projectId),
    commits: demoGetProjectCommitList(),
    activityLogs: demoGetProjectActivityLogList(),
    repositoryHealth: demoGetProjectRepositoryHealth(),
  };
}

export function demoPostProjectCreate(
  params: PostProjectCreateReqType,
): PostProjectCreateResType {
  const projectId = DEMO_PROJECT_LIST.length + 1;
  DEMO_PROJECT_LIST.push({
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

export function demoGetProjectConversationList(
  projectId: number,
): GetProjectConversationListResType {
  return DEMO_CONVERSATIONS.filter((c) => c.projectId === projectId);
}

export function demoPostProjectConversationCreate(
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
  DEMO_CONVERSATIONS.push(conversation);
  return conversation;
}

export function demoGetConversationDetail(
  conversationId: number,
): GetConversationDetailResType {
  const found = DEMO_CONVERSATIONS.find((c) => c.conversationId === conversationId);
  if (!found) {
    throw new Error(`Demo conversation not found: ${conversationId}`);
  }
  return found;
}

export function demoGetConversationMessageList(
  conversationId: number,
): GetConversationMessageListResType {
  return [
    {
      messageId: 1,
      conversationId,
      role: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요? (데모 모드)',
      tokenCount: 0,
      createdAt: ISO_NOW,
    },
  ];
}

export function demoPostConversationMessageCreate(
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

export function demoGetTrashConversationList(): GetTrashConversationListResType {
  return [];
}
