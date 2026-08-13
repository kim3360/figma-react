import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Check, Play, Settings, X } from 'lucide-react';
import {
  useApproveApprovalMutation,
  useProjectApprovalListQuery,
  useRejectApprovalMutation,
} from '@/api/approvals';
import { useChangeDiffQuery, useProjectChangeListQuery } from '@/api/changes';
import {
  useChatSettingsQuery,
  useCostBudgetQuery,
  useDisconnectRepositoryMutation,
  useInfrastructureChangeHistoryQuery,
  useInfrastructureConfigurationQuery,
  useInfrastructureSettingsQuery,
  useRepositorySettingsQuery,
  useUpdateChatSettingsMutation,
  useUpdateCostBudgetMutation,
} from '@/api/projectSettings';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import ProjectSettingsDialog from '@/components/layout/project/ProjectSettingsDialog';
import type { Approval } from '@/types/approvals.type';
import type { Change } from '@/types/changes.type';
import type {
  GetProjectActivityLogListResType,
  GetProjectCommitListResType,
  GetProjectDetailResType,
  GetProjectOverviewResType,
  GetProjectRepositoryHealthResType,
} from '@/types/projects.type';
import { cn } from '@/lib/utils';

type DetailTab = 'overview' | 'changes' | 'approvals' | 'activity' | 'settings';

const projectStatusLabel: Record<GetProjectDetailResType['status'], string> = {
  DRAFT: '초안',
  ACTIVE: '활성',
  ARCHIVED: '보관됨',
};

const projectStatusBadgeClass: Record<GetProjectDetailResType['status'], string> = {
  DRAFT: 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]',
  ACTIVE: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
  ARCHIVED: 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]',
};

const deployStatusLabel: Record<NonNullable<GetProjectOverviewResType['deployStatus']>, string> = {
  DRAFT: 'Draft',
  PENDING: '대기',
  IN_PROGRESS: '배포 중',
  PREVIEW_READY: '미리보기',
  LIVE: 'Live',
  FAILED: '실패',
};

const approvalStatusLabel: Record<Approval['status'], string> = {
  PENDING: '대기',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨',
};

const changeStatusLabel: Record<Change['status'], string> = {
  PREVIEW_READY: '프리뷰 준비',
  MERGED: '머지됨',
  REJECTED: '거절됨',
  DEPLOYED: '배포됨',
};

type ProjectDetailPageProps = {
  projectId: number;
  project: GetProjectDetailResType;
  overview?: GetProjectOverviewResType;
  commits?: GetProjectCommitListResType;
  activityLogs?: GetProjectActivityLogListResType;
  repositoryHealth?: GetProjectRepositoryHealthResType;
  isRelatedLoading?: boolean;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-[#0f172a]">{title}</h2>
        {description ? <p className="mt-1 text-[12px] text-[#64748b]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] py-2.5 last:border-b-0">
      <span className="shrink-0 text-[12px] text-[#94a3b8]">{label}</span>
      <span className="min-w-0 text-right text-[13px] font-medium text-[#0f172a]">{value}</span>
    </div>
  );
}

function ProjectDetailPage({
  projectId,
  project,
  overview,
  commits = [],
  activityLogs = [],
  repositoryHealth,
}: ProjectDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedChangeId, setSelectedChangeId] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState('50');

  const { data: approvals = [] } = useProjectApprovalListQuery('project-detail', projectId);
  const { data: changes = [] } = useProjectChangeListQuery('project-detail', projectId);
  const { data: changeDiff } = useChangeDiffQuery('project-detail', selectedChangeId);
  const { data: chatSettings } = useChatSettingsQuery('project-detail', projectId);
  const { data: costBudget } = useCostBudgetQuery('project-detail', projectId);
  const { data: infraSettings } = useInfrastructureSettingsQuery('project-detail', projectId);
  const { data: infraConfig } = useInfrastructureConfigurationQuery('project-detail', projectId);
  const { data: infraHistory = [] } = useInfrastructureChangeHistoryQuery('project-detail', projectId);
  const { data: repoSettings } = useRepositorySettingsQuery('project-detail', projectId);

  const approveMutation = useApproveApprovalMutation(projectId);
  const rejectMutation = useRejectApprovalMutation(projectId);
  const updateChatMutation = useUpdateChatSettingsMutation(projectId);
  const updateBudgetMutation = useUpdateCostBudgetMutation(projectId);
  const disconnectRepoMutation = useDisconnectRepositoryMutation(projectId);

  const [chatDraft, setChatDraft] = useState({
    changeApprovalRequired: true,
    deploymentApprovalRequired: true,
    domainApprovalRequired: true,
    infraApprovalRequired: true,
    resultApprovalRequired: true,
  });

  useEffect(() => {
    if (!chatSettings) return;
    setChatDraft({
      changeApprovalRequired: chatSettings.changeApprovalRequired,
      deploymentApprovalRequired: chatSettings.deploymentApprovalRequired,
      domainApprovalRequired: chatSettings.domainApprovalRequired,
      infraApprovalRequired: chatSettings.infraApprovalRequired,
      resultApprovalRequired: chatSettings.resultApprovalRequired,
    });
  }, [chatSettings]);

  const chatForm = chatDraft;

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: '개요' },
    { id: 'changes', label: 'Changes' },
    { id: 'approvals', label: '승인' },
    { id: 'activity', label: '커밋·활동' },
    { id: 'settings', label: '설정' },
  ];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1040px]">
          <Link
            to="/project"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#64748b] transition hover:text-[#0f172a]"
          >
            <ArrowLeft className="size-4" />
            프로젝트 목록으로 돌아가기
          </Link>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
                {formatProjectDisplayName(project.name, project.projectId)}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${projectStatusBadgeClass[project.status]}`}
              >
                {projectStatusLabel[project.status]}
              </span>
              {overview ? (
                <span className="rounded-full border border-[#e2e8f0] bg-white px-2.5 py-0.5 text-[12px] font-semibold text-[#475569]">
                  {deployStatusLabel[overview.deployStatus]}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/project/$slug/agent"
                params={{ slug: String(projectId) }}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition hover:bg-[#6d28d9]"
              >
                <Play className="size-4 fill-current" />
                AI Agent
              </Link>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
              >
                <Settings className="size-4" />
                일반 설정
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#e2e8f0]">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition',
                  tab === item.id
                    ? 'border-[#7c3aed] text-[#7c3aed]'
                    : 'border-transparent text-[#94a3b8] hover:text-[#64748b]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {tab === 'overview' ? (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <SectionCard title="배포 · 도메인" description="GET /projects/{id}/overview">
                    <MetaRow label="현재 URL" value={overview?.currentUrl ?? '미배포'} />
                    <MetaRow
                      label="배포 상태"
                      value={overview ? deployStatusLabel[overview.deployStatus] : '-'}
                    />
                    <MetaRow label="배포 버전" value={overview?.currentVersion ?? '-'} />
                    <MetaRow label="저장소 버전" value={overview?.repositoryVersion ?? '-'} />
                    <MetaRow
                      label="도메인"
                      value={
                        overview?.domainSummary
                          ? `${overview.domainSummary.hostname} · ${overview.domainSummary.status}`
                          : '연결 없음'
                      }
                    />
                    <MetaRow
                      label="저장소 health"
                      value={
                        overview?.repositoryHealth?.health ??
                        repositoryHealth?.health ??
                        '미연결'
                      }
                    />
                  </SectionCard>

                  <SectionCard title="클라우드 · 운영 조치" description="cloudSummary / operationActions">
                    <MetaRow
                      label="클라우드"
                      value={
                        overview?.cloudSummary?.configured
                          ? `${overview.cloudSummary.provider} · ${overview.cloudSummary.displayName}`
                          : '미선택'
                      }
                    />
                    <MetaRow
                      label="리전"
                      value={overview?.cloudSummary?.region ?? '-'}
                    />
                    <MetaRow
                      label="연결 상태"
                      value={overview?.cloudSummary?.status ?? '-'}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(overview?.operationActions ?? []).map((action) => (
                        <span
                          key={action.type}
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            action.available
                              ? 'bg-[#ede9fe] text-[#6d28d9]'
                              : 'bg-[#f1f5f9] text-[#94a3b8]',
                          )}
                          title={action.reason ?? undefined}
                        >
                          {action.type}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                <SectionCard title="최근 이벤트" description="overview.recentChanges (최대 3건)">
                  <ul className="space-y-2">
                    {(overview?.recentChanges ?? []).map((item) => (
                      <li
                        key={`${item.type}-${item.occurredAt}-${item.message}`}
                        className="rounded-xl bg-[#f8fafc] px-3 py-2.5"
                      >
                        <p className="text-[13px] font-medium text-[#0f172a]">{item.message}</p>
                        <p className="mt-1 text-[11px] text-[#94a3b8]">
                          {item.type} · {item.occurredAt}
                        </p>
                      </li>
                    ))}
                    {(overview?.recentChanges?.length ?? 0) === 0 ? (
                      <p className="text-[13px] text-[#94a3b8]">최근 이벤트가 없습니다.</p>
                    ) : null}
                  </ul>
                </SectionCard>
              </>
            ) : null}

            {tab === 'changes' ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <SectionCard title="Change 목록" description="GET /projects/{id}/changes">
                  <ul className="space-y-2">
                    {changes.map((change) => (
                      <li key={change.changeId}>
                        <button
                          type="button"
                          onClick={() => setSelectedChangeId(change.changeId)}
                          className={cn(
                            'w-full rounded-xl border px-3 py-3 text-left transition',
                            selectedChangeId === change.changeId
                              ? 'border-[#c4b5fd] bg-[#f5f3ff]'
                              : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-semibold text-[#0f172a]">
                              #{change.changeId} {change.summary}
                            </p>
                            <span className="shrink-0 rounded bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#64748b]">
                              {changeStatusLabel[change.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-[#94a3b8]">
                            task {change.taskId ?? '-'} · {change.createdAt}
                          </p>
                        </button>
                      </li>
                    ))}
                    {changes.length === 0 ? (
                      <p className="text-[13px] text-[#94a3b8]">Change가 없습니다.</p>
                    ) : null}
                  </ul>
                </SectionCard>

                <SectionCard title="Change Diff" description="GET /changes/{changeId}/diff">
                  {selectedChangeId == null ? (
                    <p className="text-[13px] text-[#94a3b8]">왼쪽에서 Change를 선택하세요.</p>
                  ) : (
                    <pre className="max-h-[420px] overflow-auto rounded-xl bg-[#0f172a] p-4 text-[12px] leading-relaxed text-[#e2e8f0]">
                      {changeDiff?.diff ?? 'diff를 불러오는 중...'}
                    </pre>
                  )}
                </SectionCard>
              </div>
            ) : null}

            {tab === 'approvals' ? (
              <SectionCard
                title="승인 목록"
                description="GET /projects/{id}/approvals · POST approve/reject"
              >
                <ul className="space-y-3">
                  {approvals.map((approval) => (
                    <li
                      key={approval.approvalId}
                      className="rounded-xl border border-[#e2e8f0] bg-[#fafafa] px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-[#ede9fe] px-2 py-0.5 text-[10px] font-bold text-[#6d28d9]">
                              {approval.type}
                            </span>
                            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#64748b] ring-1 ring-[#e2e8f0]">
                              {approvalStatusLabel[approval.status]}
                            </span>
                          </div>
                          <p className="mt-2 text-[13px] font-medium text-[#0f172a]">
                            {approval.summary}
                          </p>
                          <p className="mt-1 text-[11px] text-[#94a3b8]">
                            #{approval.approvalId} · {approval.createdAt}
                          </p>
                        </div>

                        {approval.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={rejectMutation.isPending || approveMutation.isPending}
                              onClick={() => rejectMutation.mutate(approval.approvalId)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#fecaca] bg-white px-3 text-[12px] font-semibold text-[#b91c1c]"
                            >
                              <X className="size-3.5" />
                              거절
                            </button>
                            <button
                              type="button"
                              disabled={rejectMutation.isPending || approveMutation.isPending}
                              onClick={() => approveMutation.mutate(approval.approvalId)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#0f172a] px-3 text-[12px] font-semibold text-white"
                            >
                              <Check className="size-3.5" />
                              승인
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                  {approvals.length === 0 ? (
                    <p className="text-[13px] text-[#94a3b8]">승인 요청이 없습니다.</p>
                  ) : null}
                </ul>
              </SectionCard>
            ) : null}

            {tab === 'activity' ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="커밋 목록" description="GET /projects/{id}/commits">
                  <ul className="space-y-2">
                    {commits.map((commit) => (
                      <li key={commit.sha} className="rounded-xl bg-[#f8fafc] px-3 py-2.5">
                        <p className="font-mono text-[12px] text-[#7c3aed]">
                          {commit.sha.slice(0, 7)}
                        </p>
                        <p className="mt-1 text-[13px] font-medium text-[#0f172a]">{commit.message}</p>
                        <p className="mt-1 text-[11px] text-[#94a3b8]">
                          {commit.author} · {commit.relativeTime ?? commit.committedAt}
                        </p>
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title="활동 로그" description="GET /projects/{id}/activity-logs">
                  <ul className="space-y-2">
                    {activityLogs.map((log) => (
                      <li
                        key={`${log.type}-${log.occurredAt}-${log.message}`}
                        className="rounded-xl bg-[#f8fafc] px-3 py-2.5"
                      >
                        <p className="text-[13px] font-medium text-[#0f172a]">{log.message}</p>
                        <p className="mt-1 text-[11px] text-[#94a3b8]">
                          {log.type} · {log.occurredAt}
                        </p>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>
            ) : null}

            {tab === 'settings' ? (
              <div className="space-y-4">
                <SectionCard title="Chat 승인 정책" description="GET/PATCH /settings/chat">
                  <div className="space-y-3">
                    {(
                      [
                        ['changeApprovalRequired', 'CODE 변경 승인'],
                        ['deploymentApprovalRequired', '배포 승인'],
                        ['domainApprovalRequired', '도메인 연결 승인'],
                        ['infraApprovalRequired', '인프라 작업 승인'],
                        ['resultApprovalRequired', '결과(main 반영) 승인'],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] px-3 py-2.5"
                      >
                        <span className="text-[13px] text-[#334155]">{label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(chatForm[key])}
                          onChange={(event) =>
                            setChatDraft({
                              ...chatForm,
                              [key]: event.target.checked,
                            })
                          }
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      disabled={updateChatMutation.isPending}
                      onClick={() =>
                        updateChatMutation.mutate({
                          changeApprovalRequired: chatForm.changeApprovalRequired,
                          deploymentApprovalRequired: chatForm.deploymentApprovalRequired,
                          domainApprovalRequired: chatForm.domainApprovalRequired,
                          infraApprovalRequired: chatForm.infraApprovalRequired,
                          resultApprovalRequired: chatForm.resultApprovalRequired,
                        })
                      }
                      className="rounded-lg bg-[#0f172a] px-4 py-2 text-[12px] font-semibold text-white"
                    >
                      승인 정책 저장
                    </button>
                  </div>
                </SectionCard>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SectionCard title="Repository 설정" description="GET /settings/repository">
                    <MetaRow
                      label="연결"
                      value={repoSettings?.connected ? '연결됨' : '미연결'}
                    />
                    <MetaRow label="저장소" value={repoSettings?.repositoryFullName ?? '-'} />
                    <MetaRow label="기본 브랜치" value={repoSettings?.defaultBranch ?? '-'} />
                    <MetaRow label="공개 범위" value={repoSettings?.repositoryVisibility ?? '-'} />
                    <MetaRow label="Health" value={repoSettings?.repositoryHealth ?? '-'} />
                    {repoSettings?.connected ? (
                      <button
                        type="button"
                        disabled={disconnectRepoMutation.isPending}
                        onClick={() => disconnectRepoMutation.mutate()}
                        className="mt-3 rounded-lg border border-[#fecaca] px-3 py-2 text-[12px] font-semibold text-[#b91c1c]"
                      >
                        저장소 연결 해제
                      </button>
                    ) : (
                      <p className="mt-3 text-[12px] text-[#94a3b8]">
                        Agent 화면의 GitHub picker로 연결할 수 있습니다.
                      </p>
                    )}
                  </SectionCard>

                  <SectionCard title="비용 · 예산" description="GET/PUT /settings/cost-budget">
                    <MetaRow
                      label="추정 가능"
                      value={costBudget?.costAvailable ? '가능' : '불가'}
                    />
                    <MetaRow
                      label="월 예상 비용"
                      value={
                        costBudget?.estimatedMonthlyCost != null
                          ? `$${costBudget.estimatedMonthlyCost}`
                          : '-'
                      }
                    />
                    <MetaRow label="예산 상태" value={costBudget?.budgetStatus ?? '-'} />
                    <MetaRow
                      label="사용률"
                      value={
                        costBudget?.budgetUsagePercent != null
                          ? `${costBudget.budgetUsagePercent}%`
                          : '-'
                      }
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={budgetInput}
                        onChange={(event) => setBudgetInput(event.target.value)}
                        className="h-9 w-28 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
                        placeholder="USD"
                      />
                      <button
                        type="button"
                        disabled={updateBudgetMutation.isPending}
                        onClick={() =>
                          updateBudgetMutation.mutate({
                            monthlyBudgetAmount: Number(budgetInput),
                          })
                        }
                        className="rounded-lg bg-[#0f172a] px-3 py-2 text-[12px] font-semibold text-white"
                      >
                        예산 저장
                      </button>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {(costBudget?.resourceCosts ?? []).map((item) => (
                        <li
                          key={`${item.resourceType}-${item.description}`}
                          className="text-[12px] text-[#64748b]"
                        >
                          {item.resourceType}: {item.description} · ${item.monthlyCost}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                </div>

                <SectionCard
                  title="Infrastructure"
                  description="GET /settings/infrastructure · configuration · history"
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[12px] font-semibold text-[#64748b]">클라우드 연결</p>
                      <MetaRow label="연결명" value={infraSettings?.displayName ?? '미선택'} />
                      <MetaRow label="Provider" value={infraSettings?.provider ?? '-'} />
                      <MetaRow label="Region" value={infraSettings?.region ?? '-'} />
                      <MetaRow label="Status" value={infraSettings?.status ?? '-'} />
                    </div>
                    <div>
                      <p className="mb-2 text-[12px] font-semibold text-[#64748b]">현재 구성</p>
                      <MetaRow
                        label="편집 가능"
                        value={infraConfig?.configurable ? '가능' : '불가'}
                      />
                      <MetaRow
                        label="Architecture"
                        value={infraConfig?.settings?.deploymentArchitecture ?? '-'}
                      />
                      <MetaRow label="Tier" value={infraConfig?.settings?.computeTier ?? '-'} />
                      <MetaRow label="Storage" value={infraConfig?.settings?.storageType ?? '-'} />
                      <MetaRow label="Network" value={infraConfig?.settings?.networkAccess ?? '-'} />
                      {infraConfig?.pendingChange ? (
                        <p className="mt-2 rounded-lg bg-[#fff7ed] px-3 py-2 text-[12px] text-[#c2410c]">
                          승인 대기 변경: {infraConfig.pendingChange.computeTier} · approval #
                          {infraConfig.pendingChange.approvalId}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[12px] font-semibold text-[#64748b]">변경 이력</p>
                    <ul className="space-y-2">
                      {infraHistory.map((item) => (
                        <li
                          key={item.changeId}
                          className="rounded-xl border border-[#e2e8f0] px-3 py-2 text-[12px] text-[#475569]"
                        >
                          #{item.changeId} {item.action} · {item.status} · {item.computeTier} /{' '}
                          {item.deploymentArchitecture}
                        </li>
                      ))}
                      {infraHistory.length === 0 ? (
                        <p className="text-[12px] text-[#94a3b8]">이력이 없습니다.</p>
                      ) : null}
                    </ul>
                  </div>
                </SectionCard>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ProjectSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        projectId={projectId}
        projectName={project.name}
      />
    </div>
  );
}

export default ProjectDetailPage;
