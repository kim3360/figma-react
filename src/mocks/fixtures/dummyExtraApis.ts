import type {
  CloudConnection,
  CloudConnectionHealth,
  CloudVerificationJob,
  CreateCloudConnectionReqType,
  CreateCloudConnectionResType,
} from '@/types/cloudConnection.type';
import type {
  DeployReqType,
  DeployResType,
  DeploymentCandidate,
  DeploymentFailureAnalysis,
  DeploymentHistory,
  DeploymentLogs,
  DeploymentStatus,
  ProjectVersion,
} from '@/types/deployment.type';
import type {
  BindDomainReqType,
  Domain,
  DomainBindingSubmission,
  DomainSearch,
  VerificationGuide,
} from '@/types/domain.type';
import type {
  CreateEnvironmentVariableReqType,
  EnvironmentVariable,
  EnvironmentVariableHistory,
  UpdateEnvironmentVariableReqType,
} from '@/types/environment.type';
import type {
  AgentTaskEvent,
  DecisionReqType,
  DecisionResType,
  PreviewLogs,
  PreviewStatus,
  TaskInputReqType,
  TaskStatus,
} from '@/types/agentPreview.type';

const ISO_NOW = '2026-07-03T06:00:00.000Z';
const ISO_HOUR = '2026-07-03T05:00:00.000Z';

let nextCloudId = 10;
let nextDomainId = 20;
let nextEnvId = 30;
let nextHistoryId = 100;
let nextTaskSeq = 1;

const cloudConnections: CloudConnection[] = [
  {
    cloudConnectionId: 3,
    provider: 'AWS',
    displayName: '개인 AWS 계정',
    accountId: '123456789012',
    region: 'ap-northeast-2',
    roleArn: null,
    awsCredentialType: 'ACCESS_KEY',
    accessKeyId: 'AKIA************3XYZ',
    secretAccessKeyConfigured: true,
    sessionTokenConfigured: false,
    gcpCredentialType: null,
    serviceAccountKeyConfigured: false,
    projectId: null,
    serviceAccountEmail: null,
    status: 'CONNECTED',
    lastCheckedAt: ISO_NOW,
    createdAt: ISO_HOUR,
    updatedAt: ISO_NOW,
  },
  {
    cloudConnectionId: 4,
    provider: 'GCP',
    displayName: '데모 GCP',
    accountId: null,
    region: 'asia-northeast3',
    roleArn: null,
    awsCredentialType: null,
    accessKeyId: null,
    secretAccessKeyConfigured: false,
    sessionTokenConfigured: false,
    gcpCredentialType: 'SERVICE_ACCOUNT_KEY',
    serviceAccountKeyConfigured: true,
    projectId: 'qeploy-demo',
    serviceAccountEmail: 'deploy@qeploy-demo.iam.gserviceaccount.com',
    status: 'VALIDATED',
    lastCheckedAt: ISO_HOUR,
    createdAt: ISO_HOUR,
    updatedAt: ISO_HOUR,
  },
];

const verificationJobs = new Map<string, CloudVerificationJob>();

const deploymentsByProject = new Map<number, DeploymentHistory[]>([
  [
    1,
    [
      {
        historyId: 501,
        projectId: 1,
        deployTargetType: 'LATEST',
        versionLabel: 'v3',
        deployedUrl: 'https://demo-user.github.io/cafe-landing-page/',
        status: 'LIVE',
        triggeredAt: ISO_HOUR,
        updatedAt: ISO_NOW,
        retriedFromHistoryId: null,
      },
      {
        historyId: 500,
        projectId: 1,
        deployTargetType: 'VERSION',
        versionLabel: 'v2',
        deployedUrl: null,
        status: 'FAILED',
        triggeredAt: ISO_HOUR,
        updatedAt: ISO_HOUR,
        retriedFromHistoryId: null,
      },
    ],
  ],
]);

const domainsByProject = new Map<number, Domain[]>([
  [
    1,
    [
      {
        domainId: 7,
        projectId: 1,
        hostname: 'cafe-landing-page.qeploy.app',
        url: 'https://cafe-landing-page.qeploy.app',
        type: 'managed_subdomain',
        hostingTarget: 'GITHUB_PAGES',
        status: 'CONNECTED',
        httpsEnforced: true,
        certificateStatus: 'ACTIVE',
        createdAt: ISO_HOUR,
        updatedAt: ISO_NOW,
      },
      {
        domainId: 8,
        projectId: 1,
        hostname: 'cafe.example.com',
        url: null,
        type: 'custom_domain',
        hostingTarget: 'GITHUB_PAGES',
        status: 'VERIFYING',
        httpsEnforced: false,
        certificateStatus: 'PENDING',
        createdAt: ISO_NOW,
        updatedAt: ISO_NOW,
      },
    ],
  ],
]);

const envVarsByProject = new Map<number, EnvironmentVariable[]>([
  [
    1,
    [
      {
        variableId: 1,
        projectId: 1,
        key: 'VITE_API_BASE',
        isSecret: false,
        valuePreview: 'https://api.example.com',
        createdAt: ISO_HOUR,
        updatedAt: ISO_HOUR,
      },
      {
        variableId: 2,
        projectId: 1,
        key: 'GITHUB_TOKEN',
        isSecret: true,
        valuePreview: '••••••••',
        createdAt: ISO_HOUR,
        updatedAt: ISO_NOW,
      },
    ],
  ],
]);

const envHistoryByProject = new Map<number, EnvironmentVariableHistory[]>([
  [
    1,
    [
      {
        historyId: 1,
        variableId: 2,
        key: 'GITHUB_TOKEN',
        action: 'UPDATED',
        actorUserId: 1,
        createdAt: ISO_NOW,
      },
      {
        historyId: 2,
        variableId: 1,
        key: 'VITE_API_BASE',
        action: 'CREATED',
        actorUserId: 1,
        createdAt: ISO_HOUR,
      },
    ],
  ],
]);

const tasks = new Map<string, TaskStatus>([
  [
    'task_deploy_1',
    {
      taskId: 'task_deploy_1',
      projectId: 1,
      conversationId: 101,
      status: 'WAITING_APPROVAL',
      summary: 'GitHub Pages 배포 준비',
      currentStep: 'await_approval',
      steps: [
        { stepId: 's1', name: '계획 수립', status: 'SUCCEEDED', startedAt: ISO_HOUR, finishedAt: ISO_HOUR },
        { stepId: 's2', name: '배포 승인 대기', status: 'RUNNING', startedAt: ISO_NOW, finishedAt: null },
      ],
      createdAt: ISO_HOUR,
      updatedAt: ISO_NOW,
    },
  ],
  [
    'task_code_1',
    {
      taskId: 'task_code_1',
      projectId: 1,
      conversationId: 101,
      status: 'SUCCEEDED',
      summary: '히어로 카피 수정',
      currentStep: null,
      steps: [
        { stepId: 's1', name: '코드 생성', status: 'SUCCEEDED', startedAt: ISO_HOUR, finishedAt: ISO_HOUR },
        { stepId: 's2', name: '프리뷰 반영', status: 'SUCCEEDED', startedAt: ISO_HOUR, finishedAt: ISO_NOW },
      ],
      createdAt: ISO_HOUR,
      updatedAt: ISO_NOW,
    },
  ],
]);

const taskEvents = new Map<string, AgentTaskEvent[]>([
  [
    'task_deploy_1',
    [
      {
        eventId: 'e1',
        taskId: 'task_deploy_1',
        type: 'STATUS',
        message: '배포 승인 대기 중',
        createdAt: ISO_NOW,
      },
      {
        eventId: 'e0',
        taskId: 'task_deploy_1',
        type: 'INFO',
        message: '배포 플랜 생성 완료',
        createdAt: ISO_HOUR,
      },
    ],
  ],
]);

const previewSessions = new Map<string, PreviewStatus>([
  [
    'preview_sess_12',
    {
      sessionId: 'preview_sess_12',
      projectId: 1,
      status: 'READY',
      previewUrl: 'https://preview.qeploy.app/s/preview_sess_12',
      message: '프리뷰 컨테이너 준비됨',
      startedAt: ISO_HOUR,
      updatedAt: ISO_NOW,
    },
  ],
]);

/* Cloud */
export function dummyListCloudConnections() {
  return [...cloudConnections];
}

export function dummyGetCloudConnection(id: number) {
  const found = cloudConnections.find((c) => c.cloudConnectionId === id);
  if (!found) throw new Error(`클라우드 연결을 찾을 수 없습니다: ${id}`);
  return { ...found };
}

export function dummyCreateCloudConnection(
  params: CreateCloudConnectionReqType,
): CreateCloudConnectionResType {
  const id = nextCloudId++;
  const jobId = `job_${id}`;
  cloudConnections.push({
    cloudConnectionId: id,
    provider: params.provider,
    displayName: params.displayName || `${params.provider} 연결`,
    accountId: params.accountId ?? null,
    region: params.region,
    roleArn: null,
    awsCredentialType: params.awsCredentialType ?? 'ACCESS_KEY',
    accessKeyId: params.accessKeyId ? `${params.accessKeyId.slice(0, 4)}************XXXX` : null,
    secretAccessKeyConfigured: Boolean(params.secretAccessKey),
    sessionTokenConfigured: false,
    gcpCredentialType: null,
    serviceAccountKeyConfigured: false,
    projectId: null,
    serviceAccountEmail: null,
    status: 'VALIDATED',
    lastCheckedAt: ISO_NOW,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  });
  verificationJobs.set(jobId, {
    jobId,
    cloudConnectionId: id,
    status: 'RUNNING',
    connectionStatus: null,
    message: '실 권한 확인 중',
    attempt: 1,
    createdAt: ISO_NOW,
    startedAt: ISO_NOW,
    completedAt: null,
  });
  return { cloudConnectionId: id, provider: params.provider, status: 'VALIDATED', jobId };
}

export function dummyDeleteCloudConnection(id: number) {
  const idx = cloudConnections.findIndex((c) => c.cloudConnectionId === id);
  if (idx >= 0) cloudConnections.splice(idx, 1);
}

export function dummyGetCloudHealth(id: number): CloudConnectionHealth {
  const conn = dummyGetCloudConnection(id);
  return {
    cloudConnectionId: id,
    provider: conn.provider,
    status: conn.status,
    message: conn.status === 'CONNECTED' ? '정상 연결됨' : '추가 검증이 필요합니다',
    checkedAt: conn.lastCheckedAt ?? ISO_NOW,
  };
}

export function dummyCreateVerificationJob(id: number): CloudVerificationJob {
  dummyGetCloudConnection(id);
  const jobId = `job_recheck_${id}_${Date.now()}`;
  const job: CloudVerificationJob = {
    jobId,
    cloudConnectionId: id,
    status: 'SUCCEEDED',
    connectionStatus: 'CONNECTED',
    message: '권한 확인 완료',
    attempt: 1,
    createdAt: ISO_NOW,
    startedAt: ISO_NOW,
    completedAt: ISO_NOW,
  };
  verificationJobs.set(jobId, job);
  const conn = cloudConnections.find((c) => c.cloudConnectionId === id);
  if (conn) {
    conn.status = 'CONNECTED';
    conn.lastCheckedAt = ISO_NOW;
  }
  return job;
}

export function dummyGetVerificationJob(jobId: string) {
  const job = verificationJobs.get(jobId);
  if (!job) throw new Error(`검증 Job을 찾을 수 없습니다: ${jobId}`);
  return { ...job };
}

/* Deployment */
export function dummyListDeployments(projectId: number): DeploymentHistory[] {
  return [...(deploymentsByProject.get(projectId) ?? [])];
}

export function dummyGetDeploymentStatus(historyId: number): DeploymentStatus {
  for (const list of deploymentsByProject.values()) {
    const found = list.find((d) => d.historyId === historyId);
    if (found) {
      return {
        ...found,
        buildStatus: found.status === 'IN_PROGRESS' ? 'in_progress' : 'completed',
        buildConclusion: found.status === 'FAILED' ? 'failure' : found.status === 'LIVE' ? 'success' : null,
      };
    }
  }
  throw new Error(`배포를 찾을 수 없습니다: ${historyId}`);
}

export function dummyListDeploymentCandidates(projectId: number): DeploymentCandidate[] {
  void projectId;
  return [
    { deployTargetType: 'LATEST', versionName: null, label: '최신 main', available: true, reason: null },
    {
      deployTargetType: 'VERSION',
      versionName: 'v3',
      label: 'v3',
      available: true,
      reason: null,
    },
    {
      deployTargetType: 'VERSION',
      versionName: 'v2',
      label: 'v2',
      available: true,
      reason: null,
    },
  ];
}

export function dummyCreateDeployment(projectId: number, params: DeployReqType): DeployResType {
  const historyId = nextHistoryId++;
  const item: DeploymentHistory = {
    historyId,
    projectId,
    deployTargetType: params.deployTargetType,
    versionLabel: params.versionName ?? 'latest',
    deployedUrl: null,
    status: 'IN_PROGRESS',
    triggeredAt: ISO_NOW,
    updatedAt: ISO_NOW,
    retriedFromHistoryId: null,
  };
  const list = deploymentsByProject.get(projectId) ?? [];
  list.unshift(item);
  deploymentsByProject.set(projectId, list);
  return {
    historyId,
    projectId,
    status: 'IN_PROGRESS',
    versionLabel: item.versionLabel,
  };
}

export function dummyRetryDeployment(historyId: number): DeployResType {
  const status = dummyGetDeploymentStatus(historyId);
  return dummyCreateDeployment(status.projectId, {
    deployTargetType: status.deployTargetType,
    versionName: status.versionLabel,
  });
}

export function dummyGetDeploymentLogs(historyId: number): DeploymentLogs {
  return {
    historyId,
    lines: [
      `[deploy #${historyId}] checkout repository`,
      `[deploy #${historyId}] npm ci`,
      `[deploy #${historyId}] vite build`,
      `[deploy #${historyId}] publish gh-pages`,
    ],
  };
}

export function dummyGetFailureAnalysis(historyId: number): DeploymentFailureAnalysis {
  return {
    historyId,
    summary: '빌드 중 TypeScript 오류로 실패했습니다.',
    rootCause: 'src/App.tsx에서 존재하지 않는 prop 사용',
    suggestedActions: ['타입 오류 수정 후 재배포', '의존성 버전 고정 확인'],
    analyzedAt: ISO_NOW,
  };
}

export function dummyRunFailureAnalysis(historyId: number) {
  return dummyGetFailureAnalysis(historyId);
}

export function dummyListVersions(projectId: number): ProjectVersion[] {
  return [
    {
      versionId: 31,
      projectId,
      versionName: 'v3',
      commitSha: 'a1b2c3d4',
      createdAt: ISO_NOW,
      message: 'hero copy update',
    },
    {
      versionId: 30,
      projectId,
      versionName: 'v2',
      commitSha: 'b2c3d4e5',
      createdAt: ISO_HOUR,
      message: 'initial landing',
    },
  ];
}

export function dummyGetVersion(versionId: number): ProjectVersion {
  const found = dummyListVersions(1).find((v) => v.versionId === versionId);
  if (!found) throw new Error(`버전을 찾을 수 없습니다: ${versionId}`);
  return found;
}

/* Domain */
export function dummyListDomains(projectId: number) {
  return [...(domainsByProject.get(projectId) ?? [])];
}

export function dummyGetDomain(domainId: number) {
  for (const list of domainsByProject.values()) {
    const found = list.find((d) => d.domainId === domainId);
    if (found) return { ...found };
  }
  throw new Error(`도메인을 찾을 수 없습니다: ${domainId}`);
}

export function dummyBindDomain(projectId: number, params: BindDomainReqType): DomainBindingSubmission {
  const domainId = nextDomainId++;
  const domain: Domain = {
    domainId,
    projectId,
    hostname: params.hostname,
    url: null,
    type: params.type,
    hostingTarget: params.hostingTarget ?? 'GITHUB_PAGES',
    status: 'REQUESTED',
    httpsEnforced: false,
    certificateStatus: 'PENDING',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  };
  const list = domainsByProject.get(projectId) ?? [];
  list.unshift(domain);
  domainsByProject.set(projectId, list);
  return { domainId, status: 'REQUESTED', hostname: params.hostname };
}

export function dummyUnbindDomain(domainId: number) {
  for (const [projectId, list] of domainsByProject.entries()) {
    const next = list.filter((d) => d.domainId !== domainId);
    if (next.length !== list.length) {
      domainsByProject.set(projectId, next);
      return;
    }
  }
}

export function dummySearchDomains(query: string): DomainSearch {
  return {
    query,
    results: [
      {
        hostname: `${query || 'example'}.qeploy.app`,
        available: true,
        price: null,
        type: 'managed_subdomain',
      },
      {
        hostname: `${query || 'example'}.com`,
        available: false,
        price: '$12/yr',
        type: 'purchasable_domain',
      },
    ],
  };
}

export function dummyGetVerificationGuide(domainId: number): VerificationGuide {
  const domain = dummyGetDomain(domainId);
  return {
    domainId,
    hostname: domain.hostname,
    records: [
      { type: 'CNAME', name: domain.hostname, value: 'demo-user.github.io', ttl: 300 },
      { type: 'TXT', name: `_qeploy.${domain.hostname}`, value: 'qeploy-verify=abc123', ttl: 300 },
    ],
    instructions: 'DNS에 아래 레코드를 추가한 뒤 검증을 재시도하세요.',
  };
}

export function dummyRetryDomainVerification(domainId: number) {
  const domain = dummyGetDomain(domainId);
  domain.status = 'VERIFYING';
  domain.updatedAt = ISO_NOW;
  for (const list of domainsByProject.values()) {
    const idx = list.findIndex((d) => d.domainId === domainId);
    if (idx >= 0) list[idx] = domain;
  }
  return domain;
}

/* Environment */
export function dummyListEnvVars(projectId: number) {
  return [...(envVarsByProject.get(projectId) ?? [])];
}

export function dummyCreateEnvVar(
  projectId: number,
  params: CreateEnvironmentVariableReqType,
): EnvironmentVariable {
  const variableId = nextEnvId++;
  const item: EnvironmentVariable = {
    variableId,
    projectId,
    key: params.key,
    isSecret: params.isSecret,
    valuePreview: params.isSecret ? '••••••••' : params.value,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  };
  const list = envVarsByProject.get(projectId) ?? [];
  list.push(item);
  envVarsByProject.set(projectId, list);
  const history = envHistoryByProject.get(projectId) ?? [];
  history.unshift({
    historyId: nextHistoryId++,
    variableId,
    key: params.key,
    action: 'CREATED',
    actorUserId: 1,
    createdAt: ISO_NOW,
  });
  envHistoryByProject.set(projectId, history);
  return item;
}

export function dummyUpdateEnvVar(
  projectId: number,
  variableId: number,
  params: UpdateEnvironmentVariableReqType,
) {
  const list = envVarsByProject.get(projectId) ?? [];
  const item = list.find((v) => v.variableId === variableId);
  if (!item) throw new Error(`환경변수를 찾을 수 없습니다: ${variableId}`);
  item.isSecret = params.isSecret ?? item.isSecret;
  item.valuePreview = item.isSecret ? '••••••••' : params.value;
  item.updatedAt = ISO_NOW;
  return { ...item };
}

export function dummyDeleteEnvVar(projectId: number, variableId: number) {
  const list = envVarsByProject.get(projectId) ?? [];
  const item = list.find((v) => v.variableId === variableId);
  envVarsByProject.set(
    projectId,
    list.filter((v) => v.variableId !== variableId),
  );
  if (item) {
    const history = envHistoryByProject.get(projectId) ?? [];
    history.unshift({
      historyId: nextHistoryId++,
      variableId,
      key: item.key,
      action: 'DELETED',
      actorUserId: 1,
      createdAt: ISO_NOW,
    });
    envHistoryByProject.set(projectId, history);
  }
}

export function dummyListEnvHistory(projectId: number) {
  return [...(envHistoryByProject.get(projectId) ?? [])];
}

/* Agent / Preview */
export function dummyListProjectTasks(projectId: number) {
  return [...tasks.values()].filter((t) => t.projectId === projectId);
}

export function dummyGetTask(taskId: string) {
  const task = tasks.get(taskId);
  if (!task) throw new Error(`태스크를 찾을 수 없습니다: ${taskId}`);
  return structuredClone(task);
}

export function dummySubmitDecision(params: DecisionReqType): DecisionResType {
  const taskId = `task_${nextTaskSeq++}`;
  tasks.set(taskId, {
    taskId,
    projectId: params.projectId,
    conversationId: params.conversationId ?? null,
    status: 'QUEUED',
    summary: params.prompt.slice(0, 80),
    currentStep: 'queued',
    steps: [{ stepId: 's1', name: '대기열 등록', status: 'PENDING', startedAt: null, finishedAt: null }],
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  });
  taskEvents.set(taskId, [
    {
      eventId: `ev_${taskId}`,
      taskId,
      type: 'CREATED',
      message: '에이전트 요청이 제출되었습니다.',
      createdAt: ISO_NOW,
    },
  ]);
  return { taskId, status: 'QUEUED', approvalIds: [] };
}

export function dummyCancelTask(taskId: string) {
  const task = dummyGetTask(taskId);
  task.status = 'CANCELLED';
  task.updatedAt = ISO_NOW;
  tasks.set(taskId, task);
  return task;
}

export function dummyRetryTask(taskId: string) {
  const task = dummyGetTask(taskId);
  task.status = 'QUEUED';
  task.updatedAt = ISO_NOW;
  tasks.set(taskId, task);
  return task;
}

export function dummySubmitTaskInput(taskId: string, params: TaskInputReqType) {
  const task = dummyGetTask(taskId);
  task.status = 'RUNNING';
  task.updatedAt = ISO_NOW;
  tasks.set(taskId, task);
  const events = taskEvents.get(taskId) ?? [];
  events.unshift({
    eventId: `ev_input_${Date.now()}`,
    taskId,
    type: 'USER_INPUT',
    message: params.content,
    createdAt: ISO_NOW,
  });
  taskEvents.set(taskId, events);
  return task;
}

export function dummyListTaskEvents(taskId: string) {
  dummyGetTask(taskId);
  return [...(taskEvents.get(taskId) ?? [])];
}

export function dummyGetPreviewStatus(sessionId: string): PreviewStatus {
  const session = previewSessions.get(sessionId);
  if (!session) {
    return {
      sessionId,
      projectId: 1,
      status: 'STOPPED',
      previewUrl: null,
      message: '세션이 종료되었거나 없습니다.',
      startedAt: null,
      updatedAt: ISO_NOW,
    };
  }
  return { ...session };
}

export function dummyGetPreviewLogs(sessionId: string): PreviewLogs {
  return {
    sessionId,
    lines: [
      `[preview ${sessionId}] container started`,
      `[preview ${sessionId}] vite ready on :4173`,
      `[preview ${sessionId}] health check ok`,
    ],
  };
}

export function dummyStopPreview(sessionId: string) {
  const session = previewSessions.get(sessionId);
  if (session) {
    session.status = 'STOPPED';
    session.previewUrl = null;
    session.updatedAt = ISO_NOW;
    previewSessions.set(sessionId, session);
  }
}

export function dummyListPreviewSessions(projectId: number) {
  return [...previewSessions.values()].filter((s) => s.projectId === projectId);
}
