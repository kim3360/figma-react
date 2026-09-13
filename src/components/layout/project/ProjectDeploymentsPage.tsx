import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getProjectInfrastructureSettings } from '@/api/projects';
import {
  getDeploymentFailureAnalysis,
  getDeploymentLogs,
  getProjectDeploymentCandidateList,
  postDeploymentFailureAnalysis,
  postDeploymentRetry,
  postProjectDeploymentCreate,
  useProjectDeploymentListQuery,
} from '@/api/deployments';

type ProjectDeploymentsPageProps = {
  projectId: number;
};

const skeletonItems = Array.from({ length: 4 }, (_, index) => `deploy-skeleton-${index}`);

/**
 * 프론트를 어디에 올릴지.
 *
 * S3·EC2 는 사용자 AWS 계정에 실제 자원을 만든다. GitHub Pages 만 무료이고, 나머지는
 * 무엇이 다른지 고르기 전에 읽혀야 한다 — 고르고 나서 알게 하면 늦다.
 */
const HOSTING_OPTIONS: {
  value: string;
  label: string;
  description: string;
  needsCloud: boolean;
}[] = [
  {
    value: 'GITHUB_PAGES',
    label: 'GitHub Pages',
    description: '무료. 별도 설정 없이 바로 배포됩니다.',
    needsCloud: false,
  },
  {
    value: 'S3',
    label: 'AWS S3 (정적 호스팅)',
    description: '당신의 AWS 계정에 올립니다. 정적 파일 보관·전송 비용이 듭니다.',
    needsCloud: true,
  },
  {
    value: 'EC2',
    label: 'AWS EC2 (전용 서버)',
    description:
      '당신의 AWS 계정에 서버를 띄웁니다. 켜져 있는 동안 과금되고, 승인 절차를 거칩니다.',
    needsCloud: true,
  },
];

/**
 * RESULT_UNKNOWN 은 실패가 아니다. 회수 워커가 GitHub 에서 실행을 못 찾고 포기한 것이라
 * 사이트는 실제로 떠 있을 수 있다. 서버는 이력을 FAILED 로 닫지만 화면까지 그렇게
 * 말하면 멀쩡히 배포된 것을 실패로 알리게 된다.
 */
const DEPLOYMENT_FAILURE_LABEL: Record<string, string> = {
  WORKFLOW_FAILED: '배포 실패',
  RETRY_EXHAUSTED: '배포 실패 (재시도 한도 소진)',
  RESULT_UNKNOWN: '결과 확인 불가',
};

function describeDeploymentStatus(item: { status: string; errorCode?: string | null }): string {
  if (item.status !== 'FAILED') return item.status;
  return DEPLOYMENT_FAILURE_LABEL[item.errorCode ?? ''] ?? item.status;
}

/**
 * 상세 사유. 서버 문구를 그대로 보여준다 — 분류(errorCode)는 위 라벨이 맡고,
 * 이쪽은 "무슨 일이 있었나"를 서버가 아는 대로 전한다.
 * 분류가 붙기 전에 닫힌 옛 이력은 errorCode 가 null 이고 이 값만 있다.
 */
function failureReason(item: { errorMessage?: string | null }) {
  return item.errorMessage?.trim() || null;
}

function ProjectDeploymentsPage({ projectId }: ProjectDeploymentsPageProps) {
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [versionName, setVersionName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: deployments = [], isLoading } = useProjectDeploymentListQuery(
    'project-deployments-page',
    projectId,
  );
  const { data: candidates = [] } = useQuery({
    queryKey: ['project-deployment-candidates', projectId],
    queryFn: () => getProjectDeploymentCandidateList(projectId),
    enabled: !!projectId,
    gcTime: 0,
  });
  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['deployment-logs', selectedHistoryId],
    queryFn: () => getDeploymentLogs(selectedHistoryId as number),
    enabled: selectedHistoryId != null,
    gcTime: 0,
  });
  const { data: analysis } = useQuery({
    queryKey: ['deployment-failure-analysis', selectedHistoryId],
    queryFn: () => getDeploymentFailureAnalysis(selectedHistoryId as number),
    enabled: selectedHistoryId != null,
    gcTime: 0,
    retry: false,
  });

  /*
    비워 두면 프로젝트에 저장된 현재 설정을 쓴다. 화면이 기본값을 지어내지 않는다 —
    서버가 아는 값을 화면이 되풀이하면 둘이 어긋날 때 어느 쪽이 참인지 알 수 없다.
  */
  const [hostingType, setHostingType] = useState('');
  // 승인이 필요한 배포(EC2)를 요청했을 때. 승인 전에는 아무것도 진행되지 않는다
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  // S3·EC2 는 사용자 AWS 계정에 자원을 만든다. 연결이 없으면 서버가 막는데,
  // 인프라 탭에 그 설정이 있으니 눌러보기 전에 알린다(RDS·서버 섹션과 같은 판단)
  const { data: infraSettings } = useQuery({
    queryKey: ['project-infra-settings', projectId],
    queryFn: () => getProjectInfrastructureSettings(projectId),
    enabled: !!projectId,
    gcTime: 0,
  });
  const isCloudConnected =
    infraSettings?.cloudConnectionId != null && infraSettings.status === 'CONNECTED';
  const selectedHosting = HOSTING_OPTIONS.find((option) => option.value === hostingType);
  const needsCloudConnection = (selectedHosting?.needsCloud ?? false) && !isCloudConnected;

  const invalidateDeployments = () => {
    void queryClient.invalidateQueries({ queryKey: ['project-deployment-list'] });
  };

  const deployMutation = useMutation({
    mutationFn: () =>
      postProjectDeploymentCreate(projectId, {
        deployTargetType: versionName ? 'VERSION' : 'LATEST',
        versionName: versionName || '',
        // 안 고르면 필드를 아예 뺀다 — 프로젝트에 저장된 설정을 쓰게 둔다
        ...(hostingType ? { frontendHostingType: hostingType } : {}),
      }),
    onSuccess: (result) => {
      /*
        승인이 필요한 배포(EC2)는 여기서 끝이 아니다. 응답의 approvalIds 가 비어 있지
        않으면 **승인하기 전까지 아무것도 진행되지 않는다** — 목록만 새로고침하고 넘어가면
        멈춰 있는 것을 진행처럼 보여주게 된다.
      */
      setAwaitingApproval((result?.approvalIds.length ?? 0) > 0);
      invalidateDeployments();
      void queryClient.invalidateQueries({ queryKey: ['project-approval-list'] });
      void queryClient.invalidateQueries({ queryKey: ['project-server-list'] });
    },
  });
  const retryMutation = useMutation({
    mutationFn: postDeploymentRetry,
    onSuccess: invalidateDeployments,
  });
  const analyzeMutation = useMutation({
    mutationFn: postDeploymentFailureAnalysis,
    onSuccess: (_, deploymentId) => {
      void queryClient.invalidateQueries({
        queryKey: ['deployment-failure-analysis', deploymentId],
      });
    },
  });

  const handleDeploy = async () => {
    setFormError(null);
    try {
      await deployMutation.mutateAsync();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '배포 요청에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">배포 요청</h2>
        <p className="mt-1 text-[13px] text-[#64748b]">
          최신 커밋 또는 선택한 버전으로 배포합니다.
        </p>
        {formError ? <p className="mt-3 text-[12px] text-[#dc2626]">{formError}</p> : null}
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-[12px] font-medium text-[#475569]">
            배포 버전
            <select
              value={versionName}
              onChange={(event) => setVersionName(event.target.value)}
              className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] text-[#334155]"
            >
              <option value="">최신 (LATEST)</option>
              {candidates.map((candidate) => (
                <option key={candidate.versionId} value={candidate.versionName}>
                  {candidate.versionName} · {candidate.title || candidate.commitSha}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-[12px] font-medium text-[#475569]">
            호스팅
            <select
              value={hostingType}
              onChange={(event) => setHostingType(event.target.value)}
              className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] text-[#334155]"
            >
              <option value="">현재 설정 유지</option>
              {HOSTING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={deployMutation.isPending || needsCloudConnection}
            onClick={() => void handleDeploy()}
            className="h-9 rounded-lg bg-[#0f172a] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deployMutation.isPending ? '요청 중' : '배포'}
          </button>
        </div>

        {selectedHosting ? (
          <p className="mt-2 text-[12px] leading-relaxed text-[#64748b]">
            {selectedHosting.description}
          </p>
        ) : null}

        {needsCloudConnection ? (
          <p className="mt-2 text-[12px] leading-relaxed text-[#b45309]">
            이 방식은 연결된 클라우드 계정이 있어야 합니다. 인프라 탭에서 먼저 연결해 주세요.{' '}
            <Link
              to="/onboarding/cloud"
              className="font-semibold underline underline-offset-2 hover:text-[#92400e]"
            >
              AWS가 처음이신가요?
            </Link>
          </p>
        ) : null}

        {awaitingApproval ? (
          <div className="mt-4 rounded-xl border border-[#fcd34d] bg-[#fffbeb] px-4 py-3">
            <p className="text-[13px] font-semibold text-[#92400e]">승인을 기다리고 있습니다</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#b45309]">
              과금되는 서버를 띄우는 방식이라 승인 절차를 거칩니다.{' '}
              <b className="font-semibold">승인하기 전까지는 배포가 시작되지 않습니다.</b> 승인
              탭에서 결정해 주세요.
            </p>
            <div className="mt-2 flex gap-3">
              <Link
                to="/project/$slug/approvals"
                params={{ slug: String(projectId) }}
                className="text-[12px] font-semibold text-[#92400e] underline underline-offset-2"
              >
                승인 탭으로 가기
              </Link>
              <button
                type="button"
                onClick={() => setAwaitingApproval(false)}
                className="cursor-pointer text-[12px] font-medium text-[#b45309] hover:underline"
              >
                확인했습니다
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">배포 이력</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            skeletonItems.map((key) => (
              <li key={key} className="h-16 animate-pulse rounded-xl bg-[#f8fafc]" />
            ))
          ) : deployments.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[#e2e8f0] px-4 py-8 text-center text-[13px] text-[#94a3b8]">
              배포 이력이 없습니다.
            </li>
          ) : (
            deployments.map((item) => {
              const isSelected = selectedHistoryId === item.historyId;

              return (
                <li key={item.historyId} className="rounded-xl border border-[#f1f5f9]">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedHistoryId((current) =>
                        current === item.historyId ? null : item.historyId,
                      )
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-[#0f172a]">
                        {item.versionLabel || item.deployTargetType}
                      </p>
                      <p className="mt-1 text-[11px] text-[#94a3b8]">
                        {describeDeploymentStatus(item)} · {item.triggeredAt}
                      </p>
                      {failureReason(item) ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-[#b91c1c]">
                          {failureReason(item)}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[12px] text-[#64748b]">
                      {item.deployedUrl || 'URL 없음'}
                    </span>
                  </button>
                  {isSelected ? (
                    <div className="border-t border-[#f1f5f9] px-4 py-3">
                      <div className="mb-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => retryMutation.mutate(item.historyId)}
                          className="h-8 rounded-lg border border-[#e2e8f0] px-3 text-[12px] font-semibold"
                        >
                          재시도
                        </button>
                        <button
                          type="button"
                          onClick={() => analyzeMutation.mutate(item.historyId)}
                          className="h-8 rounded-lg border border-[#e2e8f0] px-3 text-[12px] font-semibold"
                        >
                          실패 분석
                        </button>
                      </div>
                      {analysis?.summary ? (
                        <p className="mb-2 text-[12px] text-[#7c3aed]">{analysis.summary}</p>
                      ) : null}
                      {isLogsLoading ? (
                        <div className="h-24 animate-pulse rounded bg-[#f8fafc]" />
                      ) : (
                        <pre className="max-h-56 overflow-auto rounded-lg bg-[#0f172a] p-3 text-[11px] text-[#e2e8f0]">
                          {logs?.logText || '로그가 없습니다.'}
                        </pre>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}

export default ProjectDeploymentsPage;
