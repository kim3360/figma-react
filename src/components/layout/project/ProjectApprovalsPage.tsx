import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getApprovalDetail,
  postApprovalApprove,
  postApprovalReject,
  useProjectApprovalListQuery,
} from '@/api/approvals';
import { getChangeDiff, useProjectChangeListQuery } from '@/api/changes';
import { getPreviewSessionStatus } from '@/api/preview';
import AgentApprovalCard from '@/components/layout/project/AgentApprovalCard';
import { APPROVAL_STATUS_LABEL, describeApprovalType } from '@/lib/approvalCopy';

type ProjectApprovalsPageProps = {
  projectId: number;
};

const skeletonItems = Array.from({ length: 4 }, (_, index) => `approval-skeleton-${index}`);

function ProjectApprovalsPage({ projectId }: ProjectApprovalsPageProps) {
  const [busyApprovalId, setBusyApprovalId] = useState<number | null>(null);
  const [selectedChangeId, setSelectedChangeId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: approvals = [], isLoading: isApprovalsLoading } = useProjectApprovalListQuery(
    'project-approvals-page',
    projectId,
  );
  const { data: changes = [], isLoading: isChangesLoading } = useProjectChangeListQuery(
    'project-approvals-page',
    projectId,
  );
  const selectedChange = changes.find((change) => change.changeId === selectedChangeId);
  const { data: changeDiff, isLoading: isDiffLoading } = useQuery({
    queryKey: ['change-diff', selectedChangeId],
    queryFn: () => getChangeDiff(selectedChangeId as number),
    enabled: selectedChangeId != null,
    gcTime: 0,
  });
  const { data: previewStatus } = useQuery({
    queryKey: ['preview-session-status', selectedChange?.previewSessionId],
    queryFn: () => getPreviewSessionStatus(selectedChange?.previewSessionId as string),
    enabled: Boolean(selectedChange?.previewSessionId),
    gcTime: 0,
  });

  // 대기와 이력을 갈라 놓는다. 한 목록에 섞여 있으면 "승인 대기"라는 제목 아래
  // 이미 끝난 것들이 함께 놓여, 지금 결정할 게 뭔지 한눈에 안 들어온다
  const pendingApprovals = approvals.filter((approval) => approval.status === 'PENDING');
  const decidedApprovals = approvals.filter((approval) => approval.status !== 'PENDING');

  const invalidateApprovals = () => {
    void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
    void queryClient.invalidateQueries({ queryKey: ['project-change-list'] });
  };

  const approveMutation = useMutation({
    // 입력 명세가 있는 승인(REPOSITORY_BINDING)은 값을 실어 보낸다. 비워 보내면
    // 서버가 defaultValue 를 쓴다 — 그래서 payload 는 선택이다
    mutationFn: ({
      approvalId,
      payload,
    }: {
      approvalId: number;
      payload?: Record<string, string>;
    }) => postApprovalApprove(approvalId, payload),
    onSuccess: invalidateApprovals,
  });
  const rejectMutation = useMutation({
    mutationFn: postApprovalReject,
    onSuccess: invalidateApprovals,
  });

  const handleDecide = async (
    approvalId: number,
    action: 'approve' | 'reject',
    payload?: Record<string, string>,
  ) => {
    if (busyApprovalId !== null) return;
    setBusyApprovalId(approvalId);
    setActionError(null);
    try {
      await getApprovalDetail(approvalId);
      if (action === 'approve') {
        await approveMutation.mutateAsync({ approvalId, payload });
      } else {
        await rejectMutation.mutateAsync(approvalId);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '승인 처리에 실패했습니다.');
    } finally {
      setBusyApprovalId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">승인 대기</h2>
        <p className="mt-1 text-[13px] text-[#64748b]">
          에이전트 작업·배포·도메인·인프라 변경을 확인하고 승인하거나 거절합니다.
        </p>
        {actionError ? <p className="mt-3 text-[12px] text-[#dc2626]">{actionError}</p> : null}

        {isApprovalsLoading ? (
          <ul className="mt-4 flex flex-col gap-2">
            {skeletonItems.map((key) => (
              <li key={key} className="rounded-xl border border-[#f1f5f9] p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
              </li>
            ))}
          </ul>
        ) : pendingApprovals.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-[#e2e8f0] px-4 py-8 text-center text-[13px] text-[#94a3b8]">
            대기 중인 승인이 없습니다.
          </p>
        ) : (
          /*
            채팅과 같은 카드를 쓴다. 여기 오는 DATABASE_PROVISION·SERVER_PROVISION 은
            채팅을 거치지 않고 인프라 탭에서 만들어지는데, 예전에는 이 화면이 원시 유형만
            보여줘서 "당신의 AWS 계정에 서버를 만듭니다. 켜져 있는 동안 과금됩니다"를
            읽을 자리가 아예 없었다. 과금 승인을 글자만 보고 누르게 두면 안 된다.
          */
          <ul className="mt-4 flex flex-col gap-3">
            {pendingApprovals.map((approval) => (
              <li key={approval.approvalId}>
                <AgentApprovalCard
                  approval={approval}
                  isBusy={busyApprovalId === approval.approvalId}
                  onApprove={(payload) =>
                    void handleDecide(approval.approvalId, 'approve', payload)
                  }
                  onReject={() => void handleDecide(approval.approvalId, 'reject')}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {decidedApprovals.length > 0 ? (
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
          <h2 className="text-[16px] font-bold text-[#0f172a]">처리된 승인</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {decidedApprovals.map((approval) => (
              <li
                key={approval.approvalId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f1f5f9] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#0f172a]">
                    {describeApprovalType(approval.type)}
                  </p>
                  {approval.summary ? (
                    <p className="mt-0.5 break-all text-[12px] text-[#64748b]">
                      {approval.summary}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    {approval.decidedAt || approval.createdAt}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#64748b]">
                  {APPROVAL_STATUS_LABEL[approval.status] ?? approval.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">Change</h2>
        <p className="mt-1 text-[13px] text-[#64748b]">코드 변경과 프리뷰 세션을 확인합니다.</p>
        <ul className="mt-4 flex flex-col gap-2">
          {isChangesLoading
            ? skeletonItems.map((key) => (
                <li key={key} className="h-14 animate-pulse rounded-xl bg-[#f8fafc]" />
              ))
            : changes.map((change) => (
                <li key={change.changeId}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedChangeId((current) =>
                        current === change.changeId ? null : change.changeId,
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-[#f1f5f9] px-4 py-3 text-left hover:bg-[#f8fafc]"
                  >
                    <span className="text-[13px] font-semibold text-[#0f172a]">
                      {change.summary || `Change #${change.changeId}`}
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">{change.status}</span>
                  </button>
                  {selectedChangeId === change.changeId ? (
                    <div className="mt-2 rounded-xl bg-[#0f172a] p-4 text-[12px] text-[#e2e8f0]">
                      {previewStatus ? (
                        <p className="mb-2 text-[#c4b5fd]">
                          Preview {previewStatus.sessionStatus}
                          {previewStatus.containerRunning ? ' · 컨테이너 실행 중' : ''}
                        </p>
                      ) : null}
                      {isDiffLoading ? (
                        <div className="h-24 animate-pulse rounded bg-white/10" />
                      ) : (
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap">
                          {changeDiff?.diff || '표시할 diff가 없습니다.'}
                        </pre>
                      )}
                    </div>
                  ) : null}
                </li>
              ))}
        </ul>
      </section>
    </div>
  );
}

export default ProjectApprovalsPage;
