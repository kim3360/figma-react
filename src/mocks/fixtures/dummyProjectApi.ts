import type { Approval, GetProjectApprovalListResType } from '@/types/approvals.type';
import type {
  Change,
  ChangeDiff,
  GetProjectChangeListResType,
} from '@/types/changes.type';
import type {
  GetProjectInfrastructureChangeHistoryResType,
  ProjectChatSettings,
  ProjectCostBudget,
  ProjectInfrastructureConfiguration,
  ProjectInfrastructureSettings,
  ProjectRepositorySettings,
  UpdateProjectBudgetReqType,
  UpdateProjectChatSettingsReqType,
  UpdateProjectInfrastructureConfigurationReqType,
  UpdateProjectInfrastructureSettingsReqType,
} from '@/types/projectSettings.type';
import type {
  GetProjectActivityLogListResType,
  GetProjectCommitListResType,
  GetProjectOverviewResType,
  PostProjectRepositoryReqType,
  PostProjectRepositoryResType,
} from '@/types/projects.type';

const ISO_NOW = '2026-07-03T06:00:00.000Z';
const ISO_HOUR_AGO = '2026-07-03T05:00:00.000Z';
const ISO_YESTERDAY = '2026-07-02T10:00:00.000Z';

const DUMMY_APPROVALS: Approval[] = [
  {
    approvalId: 34,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_deploy_1',
    type: 'DEPLOYMENT',
    status: 'PENDING',
    summary: '[서비스 영향] GitHub Pages 프로덕션 배포를 진행할까요?',
    createdAt: ISO_NOW,
    decidedAt: null,
  },
  {
    approvalId: 35,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_code_1',
    type: 'RESULT',
    status: 'APPROVED',
    summary: '히어로 카피 변경 결과를 main에 반영',
    createdAt: ISO_HOUR_AGO,
    decidedAt: ISO_HOUR_AGO,
  },
  {
    approvalId: 36,
    projectId: 1,
    conversationId: null,
    taskId: null,
    type: 'INFRA_OPERATION',
    status: 'PENDING',
    summary: '[비용 증가 가능] 인프라 티어 SMALL → MEDIUM 변경',
    createdAt: ISO_NOW,
    decidedAt: null,
  },
  {
    approvalId: 40,
    projectId: 2,
    conversationId: 102,
    taskId: 'task_code_2',
    type: 'CHANGE',
    status: 'REJECTED',
    summary: '포트폴리오 감사 섹션 추가',
    createdAt: ISO_YESTERDAY,
    decidedAt: ISO_YESTERDAY,
  },
];

const DUMMY_CHANGES: Change[] = [
  {
    changeId: 11,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_code_1',
    previewSessionId: 'preview_sess_11',
    status: 'MERGED',
    summary: '히어로 섹션 카피 및 CTA 색상 수정',
    approvalId: 35,
    prNumber: 3,
    mergeCommitSha: 'a1b2c3d4e5f6',
    mergedAt: ISO_HOUR_AGO,
    createdAt: ISO_HOUR_AGO,
    updatedAt: ISO_HOUR_AGO,
  },
  {
    changeId: 12,
    projectId: 1,
    conversationId: 101,
    taskId: 'task_code_3',
    previewSessionId: 'preview_sess_12',
    status: 'PREVIEW_READY',
    summary: '모바일 히어로 간격 조정',
    approvalId: null,
    prNumber: null,
    mergeCommitSha: null,
    mergedAt: null,
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    changeId: 21,
    projectId: 2,
    conversationId: 102,
    taskId: 'task_code_2',
    previewSessionId: 'preview_sess_21',
    status: 'REJECTED',
    summary: '감사 섹션 추가',
    approvalId: 40,
    prNumber: null,
    mergeCommitSha: null,
    mergedAt: null,
    createdAt: ISO_YESTERDAY,
    updatedAt: ISO_YESTERDAY,
  },
];

const DUMMY_CHANGE_DIFFS: Record<number, string> = {
  11: `diff --git a/src/App.jsx b/src/App.jsx
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -12,7 +12,7 @@
-      <h1>Welcome</h1>
+      <h1>카페를 더 가깝게</h1>
`,
  12: `diff --git a/src/styles.css b/src/styles.css
--- a/src/styles.css
+++ b/src/styles.css
@@ -4,3 +4,6 @@
+.hero { padding: 24px 16px; }
`,
  21: `diff --git a/src/components/Thanks.jsx b/src/components/Thanks.jsx
new file mode 100644
--- /dev/null
+++ b/src/components/Thanks.jsx
@@ -0,0 +1,8 @@
+export function Thanks() {
+  return <section>감사합니다</section>;
+}
`,
};

const chatSettingsByProject = new Map<number, ProjectChatSettings>();
const costBudgetByProject = new Map<number, ProjectCostBudget>();
const infraSettingsByProject = new Map<number, ProjectInfrastructureSettings>();
const infraConfigByProject = new Map<number, ProjectInfrastructureConfiguration>();
const repoSettingsByProject = new Map<number, ProjectRepositorySettings>();

function ensureChatSettings(projectId: number): ProjectChatSettings {
  const existing = chatSettingsByProject.get(projectId);
  if (existing) return existing;
  const created: ProjectChatSettings = {
    projectId,
    changeApprovalRequired: true,
    deploymentApprovalRequired: true,
    domainApprovalRequired: true,
    infraApprovalRequired: true,
    resultApprovalRequired: true,
  };
  chatSettingsByProject.set(projectId, created);
  return created;
}

function ensureCostBudget(projectId: number): ProjectCostBudget {
  const existing = costBudgetByProject.get(projectId);
  if (existing) return existing;
  const created: ProjectCostBudget =
    projectId === 1
      ? {
          projectId,
          costAvailable: true,
          provider: 'AWS',
          currency: 'USD',
          estimatedMonthlyCost: 26.15,
          resourceCosts: [
            { resourceType: 'COMPUTE', description: 'SERVERLESS · MICRO (AWS)', monthlyCost: 17 },
            { resourceType: 'STORAGE', description: 'OBJECT_STORAGE', monthlyCost: 5.15 },
            { resourceType: 'NETWORK', description: 'PUBLIC egress', monthlyCost: 4 },
          ],
          assumptions: ['월 요청 100만 회', '스토리지 20GB', 'egress 50GB'],
          priceTableVersion: '2026-07.static.1',
          budget: { monthlyBudgetAmount: 50, currency: 'USD', updatedAt: ISO_YESTERDAY },
          budgetStatus: 'WITHIN_BUDGET',
          budgetUsagePercent: 52.3,
        }
      : {
          projectId,
          costAvailable: false,
          provider: null,
          currency: 'USD',
          estimatedMonthlyCost: null,
          resourceCosts: [],
          assumptions: [],
          priceTableVersion: null,
          budget: null,
          budgetStatus: 'NO_BUDGET',
          budgetUsagePercent: null,
        };
  costBudgetByProject.set(projectId, created);
  return created;
}

function ensureInfraSettings(projectId: number): ProjectInfrastructureSettings {
  const existing = infraSettingsByProject.get(projectId);
  if (existing) return existing;
  const created: ProjectInfrastructureSettings =
    projectId === 1
      ? {
          projectId,
          cloudConnectionId: 3,
          provider: 'AWS',
          displayName: '개인 AWS 계정',
          region: 'ap-northeast-2',
          status: 'CONNECTED',
          lastCheckedAt: ISO_NOW,
          updatedAt: ISO_YESTERDAY,
        }
      : {
          projectId,
          cloudConnectionId: null,
          provider: null,
          displayName: null,
          region: null,
          status: null,
          lastCheckedAt: null,
          updatedAt: null,
        };
  infraSettingsByProject.set(projectId, created);
  return created;
}

function ensureInfraConfig(projectId: number): ProjectInfrastructureConfiguration {
  const existing = infraConfigByProject.get(projectId);
  if (existing) return existing;
  const created: ProjectInfrastructureConfiguration =
    projectId === 1
      ? {
          projectId,
          configurable: true,
          settings: {
            deploymentArchitecture: 'SERVERLESS',
            computeTier: 'MICRO',
            storageType: 'OBJECT_STORAGE',
            networkAccess: 'PUBLIC',
            updatedAt: ISO_YESTERDAY,
          },
          pendingChange: {
            changeId: 12,
            approvalId: 36,
            action: 'UPDATED',
            deploymentArchitecture: 'SERVERLESS',
            computeTier: 'MEDIUM',
            storageType: 'OBJECT_STORAGE',
            networkAccess: 'PUBLIC',
            createdAt: ISO_NOW,
          },
        }
      : {
          projectId,
          configurable: false,
          settings: null,
          pendingChange: null,
        };
  infraConfigByProject.set(projectId, created);
  return created;
}

function ensureRepoSettings(projectId: number): ProjectRepositorySettings {
  const existing = repoSettingsByProject.get(projectId);
  if (existing) return existing;
  const created: ProjectRepositorySettings =
    projectId === 1
      ? {
          projectId,
          connected: true,
          repositoryFullName: 'demo-user/cafe-landing-page',
          repositoryUrl: 'https://github.com/demo-user/cafe-landing-page',
          defaultBranch: 'main',
          repositoryVisibility: 'PRIVATE',
          bindingStatus: 'BOUND',
          repositoryHealth: 'HEALTHY',
          connectedAt: ISO_YESTERDAY,
          lastSyncedAt: ISO_NOW,
        }
      : {
          projectId,
          connected: false,
          repositoryFullName: null,
          repositoryUrl: null,
          defaultBranch: null,
          repositoryVisibility: null,
          bindingStatus: 'NOT_BOUND',
          repositoryHealth: null,
          connectedAt: null,
          lastSyncedAt: null,
        };
  repoSettingsByProject.set(projectId, created);
  return created;
}

export function dummyGetProjectOverviewV2(
  projectId: number,
  opts: {
    name: string;
    deployStatus: GetProjectOverviewResType['deployStatus'];
    currentUrl: string | null;
  },
): GetProjectOverviewResType {
  const connected = ensureRepoSettings(projectId).connected;
  const infra = ensureInfraSettings(projectId);

  return {
    currentUrl: opts.currentUrl || null,
    deployStatus: opts.deployStatus,
    currentVersion: opts.deployStatus === 'LIVE' ? 'v3' : opts.deployStatus === 'DRAFT' ? null : 'v2',
    repositoryVersion: connected ? 'v3' : null,
    recentChanges: dummyGetProjectActivityLogList(projectId).slice(0, 3),
    latestCommit: connected
      ? {
          sha: 'a1b2c3d4e5f6',
          message: 'feat: update landing hero copy',
          author: 'demo-user',
          committedAt: ISO_NOW,
          relativeTime: '2시간 전',
        }
      : null,
    repositoryHealth: connected ? { health: 'HEALTHY' } : null,
    domainSummary:
      opts.currentUrl != null && opts.currentUrl !== ''
        ? {
            domainId: 7,
            hostname: `${opts.name}.qeploy.app`,
            url: `https://${opts.name}.qeploy.app`,
            type: 'managed_subdomain',
            hostingTarget: 'GITHUB_PAGES',
            status: 'CONNECTED',
            httpsEnforced: true,
            certificateStatus: 'ACTIVE',
            certificateExpiresAt: '2027-07-03',
            lastCheckedAt: ISO_NOW,
          }
        : null,
    cloudSummary: {
      configured: infra.cloudConnectionId != null,
      cloudConnectionId: infra.cloudConnectionId,
      provider: infra.provider,
      displayName: infra.displayName,
      region: infra.region,
      status: infra.status,
      lastCheckedAt: infra.lastCheckedAt,
    },
    operationActions: [
      {
        type: 'DEPLOY',
        available: connected && opts.deployStatus !== 'IN_PROGRESS',
        reason: connected
          ? opts.deployStatus === 'IN_PROGRESS'
            ? '배포가 진행 중입니다.'
            : '최신 변경을 배포할 수 있습니다.'
          : '저장소가 연결되지 않았습니다.',
      },
      { type: 'MANAGE_DOMAIN', available: true, reason: '도메인 연결을 관리합니다.' },
      { type: 'MANAGE_CLOUD', available: true, reason: '클라우드 연결을 관리합니다.' },
      { type: 'OPEN_AI_AGENT', available: true, reason: 'AI Agent에서 계속 수정합니다.' },
      { type: 'PROJECT_SETTINGS', available: true, reason: '프로젝트 설정을 엽니다.' },
      { type: 'REMOVE_PROJECT', available: true, reason: '프로젝트를 삭제합니다.' },
    ],
  };
}

export function dummyGetProjectCommitList(): GetProjectCommitListResType {
  return [
    {
      sha: 'a1b2c3d4e5f6',
      message: 'feat: update landing hero copy',
      author: 'demo-user',
      committedAt: ISO_NOW,
      relativeTime: '2시간 전',
    },
    {
      sha: 'b2c3d4e5f6a1',
      message: 'chore: adjust spacing on mobile',
      author: 'demo-user',
      committedAt: ISO_HOUR_AGO,
      relativeTime: '3시간 전',
    },
    {
      sha: 'c3d4e5f6a1b2',
      message: 'init: scaffold vite react app',
      author: 'demo-user',
      committedAt: ISO_YESTERDAY,
      relativeTime: '어제',
    },
  ];
}

export function dummyGetProjectActivityLogList(projectId: number): GetProjectActivityLogListResType {
  return [
    {
      type: 'APPROVAL_PENDING',
      message: `프로젝트 #${projectId}: 배포 승인 대기 중`,
      occurredAt: ISO_NOW,
    },
    {
      type: 'CHANGE_MERGED',
      message: '히어로 섹션 카피 변경이 main에 반영되었습니다.',
      occurredAt: ISO_HOUR_AGO,
    },
    {
      type: 'DEPLOYMENT_SUCCEEDED',
      message: 'GitHub Pages 배포가 완료되었습니다 (v3).',
      occurredAt: ISO_HOUR_AGO,
    },
    {
      type: 'PROJECT_CREATED',
      message: '프로젝트가 생성되었습니다.',
      occurredAt: ISO_YESTERDAY,
    },
  ];
}

export function dummyGetProjectApprovalList(projectId: number): GetProjectApprovalListResType {
  return DUMMY_APPROVALS.filter((item) => item.projectId === projectId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function dummyGetApprovalDetail(approvalId: number): Approval {
  const found = DUMMY_APPROVALS.find((item) => item.approvalId === approvalId);
  if (!found) throw new Error(`승인을 찾을 수 없습니다: ${approvalId}`);
  return { ...found };
}

export function dummyApprove(approvalId: number): Approval {
  const approval = dummyGetApprovalDetail(approvalId);
  if (approval.status !== 'PENDING') {
    throw new Error('PENDING 상태의 승인만 처리할 수 있습니다.');
  }
  approval.status = 'APPROVED';
  approval.decidedAt = ISO_NOW;
  Object.assign(
    DUMMY_APPROVALS.find((item) => item.approvalId === approvalId)!,
    approval,
  );
  return approval;
}

export function dummyReject(approvalId: number): Approval {
  const approval = dummyGetApprovalDetail(approvalId);
  if (approval.status !== 'PENDING') {
    throw new Error('PENDING 상태의 승인만 처리할 수 있습니다.');
  }
  approval.status = 'REJECTED';
  approval.decidedAt = ISO_NOW;
  Object.assign(
    DUMMY_APPROVALS.find((item) => item.approvalId === approvalId)!,
    approval,
  );
  return approval;
}

export function dummyGetProjectChangeList(projectId: number): GetProjectChangeListResType {
  return DUMMY_CHANGES.filter((item) => item.projectId === projectId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function dummyGetChangeDetail(changeId: number): Change {
  const found = DUMMY_CHANGES.find((item) => item.changeId === changeId);
  if (!found) throw new Error(`Change를 찾을 수 없습니다: ${changeId}`);
  return { ...found };
}

export function dummyGetChangeDiff(changeId: number): ChangeDiff {
  dummyGetChangeDetail(changeId);
  return {
    changeId,
    diff: DUMMY_CHANGE_DIFFS[changeId] ?? 'diff --git a/README.md b/README.md\n',
  };
}

export function dummyGetChatSettings(projectId: number) {
  return { ...ensureChatSettings(projectId) };
}

export function dummyUpdateChatSettings(
  projectId: number,
  params: UpdateProjectChatSettingsReqType,
) {
  const current = ensureChatSettings(projectId);
  const next: ProjectChatSettings = {
    ...current,
    changeApprovalRequired: params.changeApprovalRequired,
    deploymentApprovalRequired: params.deploymentApprovalRequired,
    domainApprovalRequired: params.domainApprovalRequired,
    infraApprovalRequired: params.infraApprovalRequired,
    resultApprovalRequired:
      params.resultApprovalRequired == null
        ? current.resultApprovalRequired
        : params.resultApprovalRequired,
  };
  chatSettingsByProject.set(projectId, next);
  return { ...next };
}

export function dummyGetCostBudget(projectId: number) {
  return structuredClone(ensureCostBudget(projectId));
}

export function dummyUpdateCostBudget(projectId: number, params: UpdateProjectBudgetReqType) {
  const current = ensureCostBudget(projectId);
  current.budget = {
    monthlyBudgetAmount: params.monthlyBudgetAmount,
    currency: 'USD',
    updatedAt: ISO_NOW,
  };
  if (current.estimatedMonthlyCost == null) {
    current.budgetStatus = 'NOT_EVALUABLE';
    current.budgetUsagePercent = null;
  } else {
    const usage = (current.estimatedMonthlyCost / params.monthlyBudgetAmount) * 100;
    current.budgetUsagePercent = Math.round(usage * 10) / 10;
    current.budgetStatus = usage > 100 ? 'OVER_BUDGET' : 'WITHIN_BUDGET';
  }
  costBudgetByProject.set(projectId, current);
  return structuredClone(current);
}

export function dummyDeleteCostBudget(projectId: number) {
  const current = ensureCostBudget(projectId);
  current.budget = null;
  current.budgetStatus = current.costAvailable ? 'NO_BUDGET' : 'NO_BUDGET';
  current.budgetUsagePercent = null;
  costBudgetByProject.set(projectId, current);
}

export function dummyGetInfrastructureSettings(projectId: number) {
  return { ...ensureInfraSettings(projectId) };
}

export function dummyUpdateInfrastructureSettings(
  projectId: number,
  params: UpdateProjectInfrastructureSettingsReqType,
) {
  const next: ProjectInfrastructureSettings = {
    projectId,
    cloudConnectionId: params.cloudConnectionId,
    provider: 'AWS',
    displayName: `Cloud #${params.cloudConnectionId}`,
    region: 'ap-northeast-2',
    status: 'CONNECTED',
    lastCheckedAt: ISO_NOW,
    updatedAt: ISO_NOW,
  };
  infraSettingsByProject.set(projectId, next);
  const config = ensureInfraConfig(projectId);
  config.configurable = true;
  infraConfigByProject.set(projectId, config);
  return { ...next };
}

export function dummyDeleteInfrastructureSettings(projectId: number) {
  infraSettingsByProject.set(projectId, {
    projectId,
    cloudConnectionId: null,
    provider: null,
    displayName: null,
    region: null,
    status: null,
    lastCheckedAt: null,
    updatedAt: ISO_NOW,
  });
  const config = ensureInfraConfig(projectId);
  config.configurable = false;
  infraConfigByProject.set(projectId, config);
}

export function dummyGetInfrastructureConfiguration(projectId: number) {
  return structuredClone(ensureInfraConfig(projectId));
}

export function dummyUpdateInfrastructureConfiguration(
  projectId: number,
  params: UpdateProjectInfrastructureConfigurationReqType,
) {
  const infra = ensureInfraSettings(projectId);
  if (infra.status !== 'CONNECTED') {
    throw new Error('CONNECTED 클라우드 연결이 필요합니다.');
  }
  const config = ensureInfraConfig(projectId);
  if (config.pendingChange) {
    throw new Error('승인 대기 중인 인프라 변경이 있습니다.');
  }
  const chat = ensureChatSettings(projectId);
  if (chat.infraApprovalRequired) {
    config.pendingChange = {
      changeId: Date.now(),
      approvalId: Date.now(),
      action: config.settings ? 'UPDATED' : 'CREATED',
      ...params,
      createdAt: ISO_NOW,
    };
  } else {
    config.settings = { ...params, updatedAt: ISO_NOW };
    config.pendingChange = null;
  }
  infraConfigByProject.set(projectId, config);
  return structuredClone(config);
}

export function dummyGetInfrastructureChangeHistory(
  projectId: number,
): GetProjectInfrastructureChangeHistoryResType {
  if (projectId !== 1) return [];
  return [
    {
      changeId: 12,
      action: 'UPDATED',
      status: 'PENDING_APPROVAL',
      deploymentArchitecture: 'SERVERLESS',
      computeTier: 'MEDIUM',
      storageType: 'OBJECT_STORAGE',
      networkAccess: 'PUBLIC',
      approvalId: 36,
      actorUserId: 1,
      createdAt: ISO_NOW,
      decidedAt: null,
    },
    {
      changeId: 8,
      action: 'CREATED',
      status: 'APPLIED',
      deploymentArchitecture: 'SERVERLESS',
      computeTier: 'MICRO',
      storageType: 'OBJECT_STORAGE',
      networkAccess: 'PUBLIC',
      approvalId: null,
      actorUserId: 1,
      createdAt: ISO_YESTERDAY,
      decidedAt: ISO_YESTERDAY,
    },
  ];
}

export function dummyGetRepositorySettings(projectId: number) {
  return { ...ensureRepoSettings(projectId) };
}

export function dummyConnectRepository(
  projectId: number,
  params: PostProjectRepositoryReqType,
): PostProjectRepositoryResType {
  const fullName =
    params.repositoryFullName ||
    (params.repositoryName ? `demo-user/${params.repositoryName}` : 'demo-user/my-repo');
  const visibility = params.repositoryVisibility ?? 'PRIVATE';
  repoSettingsByProject.set(projectId, {
    projectId,
    connected: true,
    repositoryFullName: fullName,
    repositoryUrl: `https://github.com/${fullName}`,
    defaultBranch: 'main',
    repositoryVisibility: visibility,
    bindingStatus: 'BOUND',
    repositoryHealth: 'HEALTHY',
    connectedAt: ISO_NOW,
    lastSyncedAt: ISO_NOW,
  });
  return {
    projectId,
    repositoryFullName: fullName,
    repositoryVisibility: visibility,
    bindingStatus: 'BOUND',
    repositoryHealth: 'HEALTHY',
  };
}

export function dummyDisconnectRepository(projectId: number) {
  repoSettingsByProject.set(projectId, {
    projectId,
    connected: false,
    repositoryFullName: null,
    repositoryUrl: null,
    defaultBranch: null,
    repositoryVisibility: null,
    bindingStatus: 'NOT_BOUND',
    repositoryHealth: null,
    connectedAt: null,
    lastSyncedAt: null,
  });
}
