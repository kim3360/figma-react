const ISO_NOW = '2026-09-10T06:00:00.000Z';

export type DummyHttpResult = {
  status: number;
  data: unknown;
};

type DummyRequest = {
  method: string;
  path: string;
  body?: unknown;
  params?: Record<string, unknown>;
};

function envelope(data: unknown, status = 200): DummyHttpResult {
  return {
    status,
    data: { status, code: 'OK', message: '', data },
  };
}

function raw(data: unknown, status = 200): DummyHttpResult {
  return { status, data };
}

const projects = [
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

let nextProjectId = 4;
let nextConversationId = 200;
let nextMessageId = 1000;
let nextEnvId = 3;
let nextCloudId = 3;
let nextDbId = 2;
let nextServerId = 2;
let nextTaskSeq = 1;

const conversations: Array<{
  conversationId: number;
  projectId: number;
  deleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    conversationId: 101,
    projectId: 1,
    deleted: false,
    deletedAt: null,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    conversationId: 102,
    projectId: 2,
    deleted: false,
    deletedAt: null,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const messages: Record<
  number,
  Array<{
    messageId: number;
    conversationId: number;
    role: string;
    content: string;
    tokenCount: number;
    createdAt: string;
    taskId: string | null;
    kind: string | null;
  }>
> = {
  101: [
    {
      messageId: 1,
      conversationId: 101,
      role: 'user',
      content: '카페 랜딩 히어로 문구를 더 짧게 바꿔줘',
      tokenCount: 0,
      createdAt: ISO_NOW,
      taskId: null,
      kind: null,
    },
    {
      messageId: 2,
      conversationId: 101,
      role: 'assistant',
      content: '히어로 카피를 짧게 다듬고 미리보기에 반영했습니다.',
      tokenCount: 48,
      createdAt: ISO_NOW,
      taskId: 'task_demo_1',
      kind: 'AGENT_RESULT',
    },
  ],
};

const approvals = [
  {
    approvalId: 34,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_demo_1',
    type: 'DEPLOYMENT',
    status: 'PENDING',
    summary: 'GitHub Pages 프로덕션 배포를 진행할까요?',
    createdAt: ISO_NOW,
    decidedAt: null,
    input: null,
  },
  {
    approvalId: 35,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_code_1',
    type: 'RESULT',
    status: 'APPROVED',
    summary: '히어로 카피 변경 결과를 main에 반영',
    createdAt: ISO_NOW,
    decidedAt: ISO_NOW,
    input: null,
  },
];

const changes = [
  {
    changeId: 11,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_demo_1',
    previewSessionId: 'preview_sess_12',
    status: 'MERGED',
    summary: '히어로 카피 수정',
    approvalId: 35,
    prNumber: 18,
    mergeCommitSha: 'a1b2c3d',
    mergedAt: ISO_NOW,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const cloudConnections = [
  {
    cloudConnectionId: 1,
    provider: 'AWS',
    displayName: '개인 AWS',
    accountId: '123456789012',
    region: 'ap-northeast-2',
    roleArn: null,
    awsCredentialType: 'ACCESS_KEY',
    accessKeyId: 'AKIADUMMY1234',
    secretAccessKeyConfigured: true,
    sessionTokenConfigured: false,
    gcpCredentialType: null,
    serviceAccountKeyConfigured: false,
    projectId: null,
    serviceAccountEmail: null,
    status: 'CONNECTED',
    lastCheckedAt: ISO_NOW,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const envVars = [
  {
    environmentVariableId: 1,
    scope: 'PREVIEW',
    key: 'VITE_API_URL',
    value: 'https://api.example.com',
    secret: false,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const domains = [
  {
    domainId: 1,
    projectId: 1,
    type: 'custom_domain',
    hostingTarget: 'GITHUB_PAGES',
    hostname: 'cafe.example.com',
    status: 'CONNECTED',
    verificationMethod: 'CNAME',
    dnsTarget: 'dvely.github.io',
    httpsEnforced: true,
    serverId: null,
    certificateStatus: 'ACTIVE',
    certificateExpiresAt: '2027-09-10T00:00:00.000Z',
    lastCheckedAt: ISO_NOW,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const servers = [
  {
    serverId: 1,
    projectId: 1,
    status: 'RUNNING',
    webOnly: false,
    instanceType: 't3.micro',
    host: '13.125.10.20',
    port: 8080,
    url: 'http://13.125.10.20:8080',
    domainUrl: 'https://api.cafe.example.com',
    instanceId: 'i-0123456789abcdef0',
    errorCode: null,
    errorMessage: null,
    healthy: true,
    lastHealthCheckAt: ISO_NOW,
    recoveryAttemptedAt: null,
    hasBootDiagnostics: false,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const databases = [
  {
    databaseId: 1,
    projectId: 1,
    method: 'LOCAL',
    engine: 'POSTGRESQL',
    status: 'READY',
    origin: 'MANUAL',
    host: '127.0.0.1',
    port: 5432,
    database: 'cafe_app',
    username: 'cafe',
    expiresAt: null,
    errorCode: null,
    errorMessage: null,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

const deployments = [
  {
    historyId: 21,
    projectId: 1,
    deployTargetType: 'LATEST',
    versionLabel: 'v1.2.0',
    deployedUrl: 'https://cafe-demo.example.com',
    status: 'SUCCEEDED',
    triggeredAt: ISO_NOW,
    updatedAt: ISO_NOW,
    retriedFromHistoryId: null,
    errorCode: null,
    errorMessage: null,
  },
];

function num(value: string | undefined) {
  return Number(value);
}

function match(path: string, pattern: RegExp) {
  return path.match(pattern);
}

function group(result: RegExpMatchArray | null, index = 1) {
  return result?.[index] ?? '';
}

function projectDetail(projectId: number) {
  const item = projects.find((project) => project.projectId === projectId);
  if (!item) return null;
  return {
    projectId: item.projectId,
    name: item.name,
    status: 'ACTIVE',
    startMode: item.startMode,
    templateType: item.templateType,
    draftMode: 'fast',
    createdAt: ISO_NOW,
    updatedAt: item.updatedAt,
  };
}

function chatSettings(projectId: number) {
  return {
    projectId,
    changeApprovalRequired: true,
    deploymentApprovalRequired: true,
    domainApprovalRequired: false,
    infraApprovalRequired: true,
    resultApprovalRequired: false,
  };
}

function demoUser() {
  return {
    id: 1,
    username: 'demo-user',
    avatarUrl: '',
    githubAppInstalled: true,
    githubAppTokenLinked: true,
    githubAppTokenExpired: false,
    githubAppReauthorizationRequired: false,
    githubAppAccessTokenExpiresAt: '2026-12-31T00:00:00.000Z',
    githubAppRefreshTokenExpiresAt: '2027-12-31T00:00:00.000Z',
  };
}

function previewSession(projectId: number) {
  return {
    sessionId: `preview_sess_${projectId}`,
    projectId,
    taskId: 'task_demo_1',
    status: 'ACTIVE',
    previewUrl: '/template/crimson',
    expiresAt: '2026-09-10T10:00:00.000Z',
    failureReason: '',
  };
}

function agentTask(taskId: string) {
  return {
    taskId,
    status: 'DONE',
    previewUrl: '/template/crimson',
    summary: '요청한 수정을 반영하고 미리보기를 갱신했습니다.',
    error: null,
    question: null,
    clarification: null,
    failureLog: null,
    suggestedFix: null,
    attempt: 1,
    maxAttempts: 3,
    retryable: false,
    pendingApprovalId: null,
    answeredClarification: null,
  };
}

export function resolveDummyHttp(request: DummyRequest): DummyHttpResult {
  const method = request.method.toUpperCase();
  const path = request.path.replace(/^\/api\/v1/, '') || '/';
  const body = (request.body ?? {}) as Record<string, unknown>;

  if (method === 'GET' && path === '/auth/github/url') {
    return envelope({
      url: `${window.location.origin}/auth/callback?code=dummy-code&state=dummy-state`,
      state: 'dummy-state',
    });
  }
  if (method === 'GET' && path.startsWith('/auth/github/callback')) {
    return envelope({
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
      githubAppInstalled: true,
    });
  }
  if (method === 'GET' && path.includes('/auth/github/app/')) {
    return envelope({ url: `${window.location.origin}/auth/app-callback`, state: 'dummy-state' });
  }
  if (method === 'POST' && path === '/auth/refresh') {
    return envelope({
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
      githubAppInstalled: true,
    });
  }
  if (method === 'DELETE' && path === '/auth/logout') {
    return envelope(null);
  }

  if (method === 'GET' && path === '/users/me') {
    return envelope(demoUser());
  }

  if (method === 'GET' && path === '/projects/github/repositories') {
    return envelope([
      {
        fullName: 'dvely-team/crimson-landing',
        name: 'crimson-landing',
        owner: 'dvely-team',
        description: '크림슨 랜딩',
        visibility: 'PUBLIC',
        defaultBranch: 'main',
        updatedAt: ISO_NOW,
      },
      {
        fullName: 'dvely-team/portfolio-studio',
        name: 'portfolio-studio',
        owner: 'dvely-team',
        description: '포트폴리오',
        visibility: 'PRIVATE',
        defaultBranch: 'main',
        updatedAt: ISO_NOW,
      },
    ]);
  }

  if (method === 'GET' && path === '/projects') {
    return envelope(projects);
  }
  if (method === 'POST' && path === '/projects') {
    const created = {
      projectId: nextProjectId,
      name: String(body.name ?? `project-${nextProjectId}`),
      deployStatus: 'DRAFT',
      currentUrl: '',
      updatedAt: ISO_NOW,
      updatedAtRelativeText: '방금',
      templateType: String(body.templateType ?? 'landing'),
      startMode: String(body.startMode ?? 'blank'),
    };
    nextProjectId += 1;
    projects.unshift(created);
    return envelope({
      projectId: created.projectId,
      name: created.name,
      status: 'ACTIVE',
    });
  }

  let m = match(path, /^\/projects\/(\d+)\/overview$/);
  if (method === 'GET' && m) {
    return envelope({
      currentUrl: 'https://cafe-demo.example.com',
      deployStatus: 'LIVE',
      currentVersion: 'v1.2.0',
      latestCommit: {
        sha: 'a1b2c3d4e5f6',
        message: '히어로 카피 수정',
        author: 'demo-user',
        committedAt: ISO_NOW,
      },
      repositoryHealth: { health: 'HEALTHY' },
      domainSummary: {
        domainId: 1,
        hostname: 'cafe.example.com',
        url: 'https://cafe.example.com',
        type: 'custom_domain',
        hostingTarget: 'GITHUB_PAGES',
        status: 'CONNECTED',
        httpsEnforced: true,
        certificateStatus: 'ACTIVE',
        certificateExpiresAt: '2027-09-10T00:00:00.000Z',
        lastCheckedAt: ISO_NOW,
      },
    });
  }

  m = match(path, /^\/projects\/(\d+)\/activity-logs$/);
  if (method === 'GET' && m) {
    return envelope([
      { type: 'PROJECT_CREATED', message: '프로젝트가 생성되었습니다.', occurredAt: ISO_NOW },
      { type: 'CHANGE_MERGED', message: '히어로 카피 변경이 머지되었습니다.', occurredAt: ISO_NOW },
    ]);
  }

  m = match(path, /^\/projects\/(\d+)\/commits$/);
  if (method === 'GET' && m) {
    return envelope([
      {
        sha: 'a1b2c3d4e5f6',
        message: '히어로 카피 수정',
        author: 'demo-user',
        committedAt: ISO_NOW,
      },
    ]);
  }

  m = match(path, /^\/projects\/(\d+)\/repository-health$/);
  if (method === 'GET' && m) return envelope({ health: 'HEALTHY' });

  m = match(path, /^\/projects\/(\d+)\/repository$/);
  if (method === 'POST' && m) {
    return envelope({
      projectId: num(group(m)),
      repositoryFullName: body.repositoryFullName ?? 'dvely-team/crimson-landing',
      repositoryVisibility: 'PUBLIC',
      bindingStatus: 'BOUND',
      repositoryHealth: 'HEALTHY',
    });
  }
  if (method === 'DELETE' && m) return envelope(null);

  m = match(path, /^\/projects\/(\d+)\/settings\/chat$/);
  if (m && (method === 'GET' || method === 'PATCH')) return envelope(chatSettings(num(group(m))));

  m = match(path, /^\/projects\/(\d+)\/settings\/infrastructure\/configuration\/history$/);
  if (method === 'GET' && m) return envelope([]);

  m = match(path, /^\/projects\/(\d+)\/settings\/infrastructure\/configuration$/);
  if (m) {
    return envelope({
      projectId: num(group(m)),
      configurable: true,
      settings: {
        deploymentArchitecture: 'SERVER',
        computeTier: 'SMALL',
        storageType: 'OBJECT_STORAGE',
        networkAccess: 'PUBLIC',
        updatedAt: ISO_NOW,
      },
      pendingChange: null,
    });
  }

  m = match(path, /^\/projects\/(\d+)\/settings\/infrastructure$/);
  if (method === 'DELETE' && m) return envelope(null);
  if (m) {
    return envelope({
      projectId: num(group(m)),
      cloudConnectionId: 1,
      provider: 'AWS',
      displayName: '개인 AWS',
      region: 'ap-northeast-2',
      status: 'CONNECTED',
      lastCheckedAt: ISO_NOW,
      updatedAt: ISO_NOW,
    });
  }

  m = match(path, /^\/projects\/(\d+)\/settings\/cost-budget$/);
  if (method === 'DELETE' && m) return envelope(null);
  if (m) {
    return envelope({
      projectId: num(group(m)),
      costAvailable: true,
      provider: 'AWS',
      currency: 'USD',
      estimatedMonthlyCost: 24,
      resourceCosts: [{ resourceType: 'COMPUTE', description: 't3.micro', monthlyCost: 24 }],
      assumptions: ['서울 리전 기준 예상 비용입니다.'],
      priceTableVersion: '2026-09',
      budget: { monthlyBudgetAmount: 50, currency: 'USD', updatedAt: ISO_NOW },
      budgetStatus: 'WITHIN_BUDGET',
      budgetUsagePercent: 48,
    });
  }

  m = match(path, /^\/projects\/(\d+)\/settings\/repository$/);
  if (method === 'GET' && m) {
    return envelope({
      projectId: num(group(m)),
      connected: true,
      repositoryFullName: 'dvely-team/crimson-landing',
      repositoryUrl: 'https://github.com/dvely-team/crimson-landing',
      defaultBranch: 'main',
      repositoryVisibility: 'PUBLIC',
      bindingStatus: 'BOUND',
      repositoryHealth: 'HEALTHY',
      connectedAt: ISO_NOW,
      lastSyncedAt: ISO_NOW,
    });
  }

  m = match(path, /^\/projects\/(\d+)\/conversations$/);
  if (method === 'GET' && m) {
    return envelope(conversations.filter((item) => item.projectId === num(group(m)) && !item.deleted));
  }
  if (method === 'POST' && m) {
    const created = {
      conversationId: nextConversationId,
      projectId: num(group(m)),
      deleted: false,
      deletedAt: null,
      createdAt: ISO_NOW,
      updatedAt: ISO_NOW,
    };
    nextConversationId += 1;
    conversations.unshift(created);
    messages[created.conversationId] = [];
    return envelope(created);
  }

  m = match(path, /^\/projects\/(\d+)\/approvals$/);
  if (method === 'GET' && m) {
    return envelope(approvals.filter((item) => item.projectId === num(group(m))));
  }

  m = match(path, /^\/projects\/(\d+)\/changes$/);
  if (method === 'GET' && m) {
    return envelope(changes.filter((item) => item.projectId === num(group(m))));
  }

  m = match(path, /^\/projects\/(\d+)\/preview-session$/);
  if (m) return envelope(previewSession(num(group(m))), method === 'POST' ? 200 : 200);

  m = match(path, /^\/projects\/(\d+)\/preview\/runtime$/);
  if (m) {
    return envelope({
      projectId: num(group(m)),
      runtimeType: 'STATIC',
      startCommand: null,
      apiPathPrefix: null,
      healthPath: null,
      dbEngine: null,
      source: 'DEFAULT',
    });
  }

  m = match(path, /^\/projects\/(\d+)\/servers$/);
  if (method === 'GET' && m) {
    return envelope(servers.filter((item) => item.projectId === num(group(m))));
  }
  if (method === 'POST' && m) {
    const created = {
      ...servers[0],
      serverId: nextServerId,
      projectId: num(group(m)),
      status: 'PENDING',
    };
    nextServerId += 1;
    servers.unshift(created);
    return envelope({
      requiresApproval: true,
      serverId: created.serverId,
      approvalIds: [34],
    });
  }

  m = match(path, /^\/projects\/(\d+)\/databases$/);
  if (method === 'GET' && m) {
    return envelope(databases.filter((item) => item.projectId === num(group(m))));
  }
  if (method === 'POST' && m) {
    const created = {
      ...databases[0],
      databaseId: nextDbId,
      projectId: num(group(m)),
      password: 'dummy-password',
    };
    nextDbId += 1;
    databases.unshift(created);
    return envelope({
      requiresApproval: false,
      database: created,
      taskId: null,
      approvalIds: [],
    });
  }

  m = match(path, /^\/projects\/(\d+)\/domains$/);
  if (method === 'GET' && m) {
    return envelope(domains.filter((item) => item.projectId === num(group(m))));
  }
  if (method === 'POST' && m) {
    return envelope({
      taskId: `task_domain_${nextTaskSeq++}`,
      status: 'WAITING_APPROVAL',
      approvalIds: [34],
    });
  }

  m = match(path, /^\/projects\/(\d+)\/environment-variables\/history$/);
  if (method === 'GET' && m) {
    return envelope([
      {
        historyId: 1,
        environmentVariableId: 1,
        scope: 'PREVIEW',
        key: 'VITE_API_URL',
        action: 'CREATED',
        secret: false,
        valueChanged: true,
        createdAt: ISO_NOW,
      },
    ]);
  }

  m = match(path, /^\/projects\/(\d+)\/environment-variables(?:\/(\d+))?$/);
  if (method === 'GET' && m && !group(m, 2)) return envelope(envVars);
  if (method === 'POST' && m && !group(m, 2)) {
    const created = {
      environmentVariableId: nextEnvId,
      scope: String(body.scope ?? 'PREVIEW'),
      key: String(body.key ?? 'NEW_KEY'),
      value: body.secret ? '' : String(body.value ?? ''),
      secret: Boolean(body.secret),
      createdAt: ISO_NOW,
      updatedAt: ISO_NOW,
    };
    nextEnvId += 1;
    envVars.unshift(created);
    return envelope(created);
  }
  if (m?.[2] && (method === 'PATCH' || method === 'DELETE')) {
    const id = num(group(m, 2));
    if (method === 'DELETE') {
      const index = envVars.findIndex((item) => item.environmentVariableId === id);
      if (index >= 0) envVars.splice(index, 1);
      return envelope(null);
    }
    const item = envVars.find((entry) => entry.environmentVariableId === id);
    if (item && typeof body.value === 'string') item.value = body.value;
    return envelope(item);
  }

  m = match(path, /^\/projects\/(\d+)\/deployments$/);
  if (method === 'GET' && m) {
    return envelope(deployments.filter((item) => item.projectId === num(group(m))));
  }
  if (method === 'POST' && m) {
    return envelope({
      deploymentId: 99,
      projectId: num(group(m)),
      deployTargetType: body.deployTargetType ?? 'LATEST',
      versionName: body.versionName ?? null,
      status: 'QUEUED',
      pagesUrl: null,
      createdAt: ISO_NOW,
      approvalIds: [],
    });
  }

  m = match(path, /^\/projects\/(\d+)\/versions$/);
  if (method === 'GET' && m) {
    return envelope([{ versionId: 1, versionName: 'v1.2.0', createdAt: ISO_NOW }]);
  }

  m = match(path, /^\/projects\/(\d+)\/deployment-candidates$/);
  if (method === 'GET' && m) return envelope([]);

  m = match(path, /^\/projects\/(\d+)$/);
  if (method === 'GET' && m) return envelope(projectDetail(num(group(m))));
  if (method === 'PATCH' && m) {
    const item = projects.find((project) => project.projectId === num(group(m)));
    if (item && typeof body.name === 'string') item.name = body.name;
    return envelope(projectDetail(num(group(m))));
  }
  if (method === 'DELETE' && m) {
    const index = projects.findIndex((project) => project.projectId === num(group(m)));
    if (index >= 0) projects.splice(index, 1);
    return envelope(null);
  }

  m = match(path, /^\/conversations\/(\d+)\/messages$/);
  if (method === 'GET' && m) return envelope(messages[num(group(m))] ?? []);
  if (method === 'POST' && m) {
    const conversationId = num(group(m));
    const created = {
      messageId: nextMessageId,
      conversationId,
      role: 'user',
      content: String(body.content ?? ''),
      tokenCount: 0,
      createdAt: new Date().toISOString(),
      taskId: `task_demo_${nextTaskSeq++}`,
      kind: null,
    };
    nextMessageId += 1;
    messages[conversationId] = [...(messages[conversationId] ?? []), created];
    return envelope(created);
  }

  m = match(path, /^\/conversations\/(\d+)$/);
  if (method === 'GET' && m) {
    return envelope(conversations.find((item) => item.conversationId === num(group(m))) ?? conversations[0]);
  }
  if (method === 'DELETE' && m) {
    const item = conversations.find((entry) => entry.conversationId === num(group(m)));
    if (item) {
      item.deleted = true;
      item.deletedAt = ISO_NOW;
    }
    return envelope(null);
  }

  if (method === 'GET' && path === '/trash/conversations') {
    return envelope(conversations.filter((item) => item.deleted));
  }
  m = match(path, /^\/trash\/conversations\/(\d+)\/restore$/);
  if (method === 'POST' && m) {
    const item = conversations.find((entry) => entry.conversationId === num(group(m)));
    if (item) {
      item.deleted = false;
      item.deletedAt = null;
    }
    return envelope(item);
  }
  m = match(path, /^\/trash\/conversations\/(\d+)$/);
  if (method === 'DELETE' && m) {
    const index = conversations.findIndex((item) => item.conversationId === num(group(m)));
    if (index >= 0) conversations.splice(index, 1);
    return envelope(null);
  }

  if (method === 'GET' && path === '/agent/ai-providers') {
    return envelope({
      providers: [
        { provider: 'OPENAI', defaultModel: 'gpt-4.1', models: ['gpt-4.1'], thinkingModels: [] },
      ],
    });
  }
  if (method === 'POST' && path === '/agent/decision') {
    return envelope({
      steps: [{ agentType: 'CODE', parameters: {} }],
      reasoning: '요청을 코드 변경으로 처리합니다.',
      aiProvider: 'OPENAI',
      taskId: `task_demo_${nextTaskSeq++}`,
      status: 'DONE',
      approvalIds: [],
    });
  }
  if (method === 'DELETE' && path === '/agent/session') return envelope(null);

  m = match(path, /^\/agent\/conversations\/(\d+)\/active-task$/);
  if (method === 'GET' && m) return raw(null, 204);

  m = match(path, /^\/agent\/tasks\/([^/]+)\/events$/);
  if (method === 'GET' && m) {
    return envelope([
      {
        eventId: 1,
        taskId: group(m),
        type: 'COMPLETED',
        status: 'DONE',
        message: '작업을 완료했습니다.',
        stepIndex: 1,
        stepTotal: 1,
        agentType: 'CODE',
        createdAt: ISO_NOW,
      },
    ]);
  }
  m = match(path, /^\/agent\/tasks\/([^/]+)\/input$/);
  if (method === 'POST' && m) return envelope(agentTask(group(m)));
  m = match(path, /^\/agent\/tasks\/([^/]+)\/retry$/);
  if (method === 'POST' && m) return envelope(agentTask(group(m)));
  m = match(path, /^\/agent\/tasks\/([^/]+)$/);
  if (method === 'GET' && m) return envelope(agentTask(group(m)));
  if (method === 'DELETE' && m) return envelope(null);

  m = match(path, /^\/approvals\/(\d+)\/(approve|reject)$/);
  if (method === 'POST' && m) {
    const item = approvals.find((entry) => entry.approvalId === num(group(m)));
    if (item) {
      item.status = group(m, 2) === 'approve' ? 'APPROVED' : 'REJECTED';
      item.decidedAt = new Date().toISOString();
    }
    return envelope(item);
  }
  m = match(path, /^\/approvals\/(\d+)$/);
  if (method === 'GET' && m) {
    return envelope(approvals.find((item) => item.approvalId === num(group(m))) ?? approvals[0]);
  }

  m = match(path, /^\/changes\/(\d+)\/diff$/);
  if (method === 'GET' && m) {
    return raw({
      changeId: num(group(m)),
      diff: '--- a/src/App.tsx\n+++ b/src/App.tsx\n@@ -1,3 +1,3 @@\n-히어로\n+짧은 히어로\n',
    });
  }
  m = match(path, /^\/changes\/(\d+)$/);
  if (method === 'GET' && m) {
    return raw(changes.find((item) => item.changeId === num(group(m))) ?? changes[0]);
  }

  m = match(path, /^\/preview-sessions\/([^/]+)\/status$/);
  if (method === 'GET' && m) {
    return raw({
      sessionId: group(m),
      projectId: 1,
      taskId: 'task_demo_1',
      sessionStatus: 'ACTIVE',
      containerRunning: true,
      oomKilled: false,
      exitCode: null,
      startedAt: ISO_NOW,
      expiresAt: '2026-09-10T10:00:00.000Z',
      resources: null,
    });
  }
  m = match(path, /^\/preview-sessions\/([^/]+)\/logs$/);
  if (method === 'GET' && m) {
    return raw({
      sessionId: group(m),
      containerRunning: true,
      logText: 'dummy preview is ready\n',
    });
  }
  m = match(path, /^\/preview-sessions\/([^/]+)\/access$/);
  if (method === 'POST' && m) {
    return envelope({
      sessionId: group(m),
      previewUrl: '/template/crimson',
      expiresAt: '2026-09-10T10:00:00.000Z',
    });
  }
  m = match(path, /^\/preview-sessions\/([^/]+)$/);
  if (method === 'DELETE' && m) return envelope(null);

  if (method === 'GET' && path === '/cloud-connections/requirements') {
    return envelope({
      provider: 'AWS',
      credentialType: 'ACCESS_KEY',
      recommendedCredentialType: 'ACCESS_KEY',
      credentialOptions: [
        { type: 'ACCESS_KEY', label: '액세스 키', recommended: true, summary: '개발용' },
      ],
      fields: [
        {
          key: 'accessKeyId',
          label: 'Access Key',
          description: null,
          whereToFind: 'IAM',
          example: 'AKIA...',
          required: true,
          secret: false,
        },
      ],
      steps: [{ order: 1, title: 'IAM 사용자 생성', detail: '액세스 키를 발급하세요.' }],
      policyName: 'DvelyAccess',
      roleName: null,
      recommendedPolicy: { Version: '2012-10-17', Statement: [] },
      trustPolicy: null,
      notes: ['검증은 권한 전체를 확인하지 않습니다.'],
    });
  }
  if (method === 'GET' && path === '/cloud-connections') return envelope(cloudConnections);
  if (method === 'POST' && path === '/cloud-connections') {
    const created = {
      ...cloudConnections[0],
      cloudConnectionId: nextCloudId,
      displayName: String(body.displayName ?? `연결 ${nextCloudId}`),
      provider: String(body.provider ?? 'AWS'),
    };
    nextCloudId += 1;
    cloudConnections.unshift(created);
    return envelope({
      cloudConnectionId: created.cloudConnectionId,
      provider: created.provider,
      status: 'CONNECTED',
      jobId: 'job_1',
    });
  }
  m = match(path, /^\/cloud-connections\/(\d+)\/health$/);
  if (method === 'GET' && m) {
    return envelope({
      cloudConnectionId: num(group(m)),
      provider: 'AWS',
      status: 'CONNECTED',
      message: '정상입니다.',
      checkedAt: ISO_NOW,
    });
  }
  m = match(path, /^\/cloud-connections\/(\d+)\/verification-jobs$/);
  if (method === 'POST' && m) return envelope({ jobId: 'job_1' });
  m = match(path, /^\/cloud-connections\/(\d+)$/);
  if (method === 'GET' && m) {
    return envelope(
      cloudConnections.find((item) => item.cloudConnectionId === num(group(m))) ?? cloudConnections[0],
    );
  }
  if (method === 'DELETE' && m) {
    const index = cloudConnections.findIndex((item) => item.cloudConnectionId === num(group(m)));
    if (index >= 0) cloudConnections.splice(index, 1);
    return envelope(null);
  }
  m = match(path, /^\/cloud-connection-verification-jobs\/([^/]+)$/);
  if (method === 'GET' && m) {
    return envelope({
      jobId: group(m),
      cloudConnectionId: 1,
      status: 'SUCCEEDED',
      connectionStatus: 'CONNECTED',
      message: '검증이 완료되었습니다.',
      attempt: 1,
      createdAt: ISO_NOW,
      startedAt: ISO_NOW,
      completedAt: ISO_NOW,
    });
  }

  if (method === 'GET' && path === '/domains/hosting-targets') {
    return envelope({ hostingTargets: ['GITHUB_PAGES', 'AWS'] });
  }
  m = match(path, /^\/domains\/(\d+)\/verification-checks$/);
  if (method === 'POST' && m) return envelope(domains[0]);
  m = match(path, /^\/domains\/(\d+)\/verification-guide$/);
  if (method === 'GET' && m) {
    return envelope({
      hostname: 'cafe.example.com',
      verificationMethod: 'CNAME',
      records: [{ type: 'CNAME', host: 'www', value: 'dvely.github.io' }],
    });
  }
  m = match(path, /^\/domains\/(\d+)$/);
  if (method === 'GET' && m) return envelope(domains[0]);
  if (method === 'DELETE' && m) {
    const index = domains.findIndex((item) => item.domainId === num(group(m)));
    if (index >= 0) domains.splice(index, 1);
    return envelope(null);
  }

  m = match(path, /^\/servers\/(\d+)\/terminate$/);
  if (method === 'POST' && m) {
    const item = servers.find((entry) => entry.serverId === num(group(m)));
    if (item) item.status = 'TERMINATED';
    return envelope(null);
  }
  m = match(path, /^\/servers\/(\d+)\/logs$/);
  if (method === 'GET' && m) {
    return envelope({
      serverId: num(group(m)),
      source: request.params?.source ?? 'APP',
      content: '[boot] server started\n[app] listening on 8080\n',
    });
  }

  m = match(path, /^\/databases\/(\d+)$/);
  if (method === 'DELETE' && m) {
    const index = databases.findIndex((item) => item.databaseId === num(group(m)));
    if (index >= 0) databases.splice(index, 1);
    return envelope(null);
  }

  m = match(path, /^\/deployments\/(\d+)\/retry$/);
  if (method === 'POST' && m) {
    return envelope({
      deploymentId: num(group(m)),
      projectId: 1,
      deployTargetType: 'LATEST',
      versionName: null,
      status: 'QUEUED',
      pagesUrl: null,
      createdAt: ISO_NOW,
      approvalIds: [],
    });
  }
  m = match(path, /^\/deployments\/(\d+)\/failure-analysis$/);
  if (m) {
    return envelope({
      deploymentId: num(group(m)),
      summary: '더미 실패 분석입니다.',
      logExcerpt: 'Error: build failed',
      suggestedFix: '로그를 확인한 뒤 다시 배포해 보세요.',
      analysisSource: 'DUMMY',
      analyzedAt: ISO_NOW,
    });
  }
  m = match(path, /^\/deployments\/(\d+)\/logs$/);
  if (method === 'GET' && m) {
    return envelope({
      historyId: num(group(m)),
      workflowRunId: 1001,
      jobs: [
        {
          jobId: 1,
          name: 'build',
          status: 'completed',
          conclusion: 'success',
          steps: [{ number: 1, name: 'Install', status: 'completed', conclusion: 'success' }],
        },
      ],
      logText: 'dummy deploy succeeded\n',
    });
  }
  m = match(path, /^\/deployments\/(\d+)$/);
  if (method === 'GET' && m) {
    return envelope({
      historyId: num(group(m)),
      projectId: 1,
      deployTargetType: 'LATEST',
      versionLabel: 'v1.2.0',
      deployedUrl: 'https://cafe-demo.example.com',
      status: 'SUCCEEDED',
      buildStatus: 'completed',
      buildConclusion: 'success',
      triggeredAt: ISO_NOW,
      updatedAt: ISO_NOW,
    });
  }
  m = match(path, /^\/versions\/(\d+)$/);
  if (method === 'GET' && m) {
    return envelope({ versionId: num(group(m)), versionName: 'v1.2.0', createdAt: ISO_NOW });
  }

  return envelope(null);
}
