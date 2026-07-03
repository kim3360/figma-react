import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import ProjectSettingsDialog from '@/components/layout/project/ProjectSettingsDialog';
import type {
  GetProjectActivityLogListResType,
  GetProjectCommitListResType,
  GetProjectDetailResType,
  GetProjectOverviewResType,
  GetProjectRepositoryHealthResType,
} from '@/types/projects.type';

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

type ProjectDetailPageProps = {
  projectId: number;
  project: GetProjectDetailResType;
  overview?: GetProjectOverviewResType;
  commits?: GetProjectCommitListResType;
  activityLogs?: GetProjectActivityLogListResType;
  repositoryHealth?: GetProjectRepositoryHealthResType;
  isRelatedLoading?: boolean;
};

function ProjectDetailPage({
  projectId,
  project,
  overview,
  commits = [],
  activityLogs = [],
  repositoryHealth,
  isRelatedLoading = false,
}: ProjectDetailPageProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isPending = project.status === 'DRAFT';
  const latestCommit = commits[0] ?? overview?.latestCommit ?? null;
  const activityRows = activityLogs.slice(0, 5);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[960px]">
          {/* 프로젝트 헤더 */}
          <div className="mb-6">
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
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/project/$slug/agent"
                  params={{ slug: String(projectId) }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition hover:bg-[#6d28d9]"
                >
                  <Play className="size-4 fill-current" />
                  Open AI Agent
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 text-[13px] font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
                >
                  <Settings className="size-4" />
                  프로젝트 설정
                </button>
              </div>
            </div>
          </div>

          {/* 메인 카드 */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-12">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div
                  className="size-28 rounded-full bg-gradient-to-br from-[#a78bfa] via-[#7c3aed] to-[#6366f1] shadow-[0_20px_50px_rgba(124,58,237,0.35)]"
                  aria-hidden
                />
                <h2 className="mt-8 text-[18px] font-bold text-[#0f172a]">
                  아직 배포되지 않은 프로젝트입니다
                </h2>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#64748b]">
                  AI 에이전트와 대화하며 페이지를 만들고, 한 번에 배포까지 이어 가 보세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-[14px] text-[#64748b]">
                  프로젝트 상태: {projectStatusLabel[project.status]}
                </p>
                <Link
                  to="/project/$slug/agent"
                  params={{ slug: String(projectId) }}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-5 text-[13px] font-semibold text-white"
                >
                  <Play className="size-4 fill-current" />
                  Open AI Agent
                </Link>
              </div>
            )}
          </div>

          {/* 하단 정보 */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 lg:col-span-2">
              <h3 className="text-[14px] font-bold text-[#0f172a]">현재 URL</h3>
              {isRelatedLoading ? (
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
              ) : (
                <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
                  {overview?.currentUrl ?? '프로젝트가 라이브되면 여기에 URL이 표시됩니다.'}
                </p>
              )}

              <h3 className="mt-6 text-[14px] font-bold text-[#0f172a]">최근 반영 이력</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-[#f1f5f9]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f8fafc] text-[12px] font-semibold text-[#64748b]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">내용</th>
                      <th className="px-4 py-2.5 font-semibold">시간</th>
                      <th className="px-4 py-2.5 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {isRelatedLoading
                      ? Array.from({ length: 3 }, (_, index) => (
                          <tr key={`activity-skeleton-${index}`} className="text-[#334155]">
                            <td className="px-4 py-3">
                              <div className="h-4 w-5/6 animate-pulse rounded bg-[#e2e8f0]" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-[#e2e8f0]" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="h-4 w-14 animate-pulse rounded bg-[#e2e8f0]" />
                            </td>
                          </tr>
                        ))
                      : activityRows.map((row) => (
                          <tr key={`${row.type}-${row.occurredAt}`} className="text-[#334155]">
                            <td className="px-4 py-3">{row.message}</td>
                            <td className="px-4 py-3 text-[#64748b]">{row.occurredAt}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#64748b]">
                                {row.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="flex flex-col gap-5">
              <section className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <h3 className="text-[14px] font-bold text-[#0f172a]">가장 최근 커밋</h3>
                {isRelatedLoading ? (
                  <>
                    <div className="mt-3 h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                  </>
                ) : latestCommit ? (
                  <>
                    <p className="mt-3 truncate font-mono text-[13px] font-semibold text-[#7c3aed]">
                      {latestCommit.sha}
                    </p>
                    <p className="mt-1 text-[12px] text-[#64748b]">{latestCommit.message}</p>
                    <p className="mt-1 text-[12px] text-[#94a3b8]">{latestCommit.committedAt}</p>
                  </>
                ) : (
                  <p className="mt-3 text-[12px] text-[#94a3b8]">표시할 커밋이 없습니다.</p>
                )}
              </section>

              <section className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <h3 className="text-[14px] font-bold text-[#0f172a]">프로젝트 요약</h3>
                {isRelatedLoading ? (
                  <>
                    <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-[#e2e8f0]" />
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#e2e8f0]" />
                  </>
                ) : (
                  <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#94a3b8]">
                    <p>{overview?.trafficSummary ?? '트래픽 요약 정보가 없습니다.'}</p>
                    <p>{overview?.domainSummary ?? '도메인 요약 정보가 없습니다.'}</p>
                    <p>저장소 상태: {repositoryHealth?.health ?? '확인 불가'}</p>
                  </div>
                )}
              </section>
            </div>
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
