import { useState } from 'react';
import {
  useCreateDeploymentMutation,
  useDeploymentCandidatesQuery,
  useDeploymentLogsQuery,
  useProjectDeploymentsQuery,
  useProjectVersionsQuery,
  useRetryDeploymentMutation,
} from '@/api/deployments';
import { MetaRow, SectionCard } from '@/components/layout/project/ProjectSectionCard';

export default function ProjectDeploymentsPanel({ projectId }: { projectId: number }) {
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const { data: deployments = [] } = useProjectDeploymentsQuery('detail', projectId);
  const { data: candidates = [] } = useDeploymentCandidatesQuery('detail', projectId);
  const { data: versions = [] } = useProjectVersionsQuery('detail', projectId);
  const { data: logs } = useDeploymentLogsQuery('detail', selectedHistoryId);
  const createMutation = useCreateDeploymentMutation(projectId);
  const retryMutation = useRetryDeploymentMutation();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <SectionCard title="배포 이력" description="GET/POST /projects/{id}/deployments">
        <div className="mb-3 flex flex-wrap gap-2">
          {candidates.map((c) => (
            <button
              key={`${c.deployTargetType}-${c.versionName}`}
              type="button"
              disabled={!c.available || createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  deployTargetType: c.deployTargetType,
                  versionName: c.versionName,
                })
              }
              className="rounded-lg bg-[#0f172a] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              배포: {c.label}
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          {deployments.map((d) => (
            <li key={d.historyId}>
              <button
                type="button"
                onClick={() => setSelectedHistoryId(d.historyId)}
                className="w-full rounded-xl border border-[#e2e8f0] px-3 py-2.5 text-left hover:bg-[#f8fafc]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#0f172a]">
                    #{d.historyId} · {d.versionLabel ?? '-'}
                  </p>
                  <span className="text-[11px] font-semibold text-[#64748b]">{d.status}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  {d.deployTargetType} · {d.triggeredAt}
                </p>
              </button>
              {d.status === 'FAILED' ? (
                <button
                  type="button"
                  className="mt-1 text-[11px] font-semibold text-[#7c3aed]"
                  onClick={() => retryMutation.mutate(d.historyId)}
                >
                  재시도
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="배포 로그" description="GET /deployments/{id}/logs">
          {selectedHistoryId == null ? (
            <p className="text-[13px] text-[#94a3b8]">이력을 선택하세요.</p>
          ) : (
            <pre className="max-h-[240px] overflow-auto rounded-xl bg-[#0f172a] p-3 text-[12px] text-[#e2e8f0]">
              {(logs?.lines ?? []).join('\n')}
            </pre>
          )}
        </SectionCard>
        <SectionCard title="버전 목록" description="GET /projects/{id}/versions">
          {versions.map((v) => (
            <MetaRow
              key={v.versionId}
              label={v.versionName}
              value={`${v.commitSha.slice(0, 7)} · ${v.message ?? '-'}`}
            />
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
