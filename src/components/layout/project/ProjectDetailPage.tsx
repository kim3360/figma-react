import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ChevronRight, Play, Settings } from 'lucide-react';
import { formatActivityTime } from '@/lib/projectActivity';
import { toSafeHttpUrl } from '@/lib/safeUrl';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import ProjectActivityDetailDialog from '@/components/layout/project/ProjectActivityDetailDialog';
import ProjectSettingsDialog from '@/components/layout/project/ProjectSettingsDialog';
import ProjectWorkspaceNav from '@/components/layout/project/ProjectWorkspaceNav';
import type {
  GetProjectActivityLogListResType,
  GetProjectCommitListResType,
  GetProjectDetailResType,
  GetProjectOverviewResType,
  GetProjectRepositoryHealthResType,
  ProjectActivityLog,
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
  const [detailActivity, setDetailActivity] = useState<ProjectActivityLog | null>(null);
  // 링크로 쓰기 전에 스킴을 검증한다 — javascript: 가 섞이면 클릭 시 실행된다
  const currentUrlHref = toSafeHttpUrl(overview?.currentUrl);
  const domainHref = toSafeHttpUrl(overview?.domainSummary?.url);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1280px]">
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

          <ProjectWorkspaceNav projectId={projectId} active="overview" />

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
                  {/* 도메인을 연결하면 서버가 currentUrl 을 커스텀 도메인으로 승격시킨다 */}
                  {currentUrlHref ? (
                    <a
                      href={currentUrlHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-[#7c3aed] underline underline-offset-2 hover:text-[#6d28d9]"
                    >
                      {currentUrlHref}
                    </a>
                  ) : (
                    '프로젝트가 라이브되면 여기에 URL이 표시됩니다.'
                  )}
                </p>
              )}

              <h3 className="mt-6 text-[14px] font-bold text-[#0f172a]">최근 반영 이력</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-[#f1f5f9]">
                {/* table-fixed 여야 내용 칸이 남은 폭만 차지하고 truncate가 먹는다 */}
                <table className="w-full table-fixed text-left text-[13px]">
                  <thead className="bg-[#f8fafc] text-[12px] font-semibold text-[#64748b]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">내용</th>
                      <th className="w-[120px] px-4 py-2.5 font-semibold">시간</th>
                      <th className="w-[200px] px-4 py-2.5 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {isRelatedLoading ? (
                      Array.from({ length: 3 }, (_, index) => (
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
                    ) : activityRows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-[12px] text-[#94a3b8]">
                          표시할 이력이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      activityRows.map((row) => (
                        <tr
                          key={`${row.type}-${row.occurredAt}`}
                          onClick={() => setDetailActivity(row)}
                          className="cursor-pointer text-[#334155] transition hover:bg-[#f8fafc]"
                        >
                          {/* CHANGE_* 는 30줄짜리 마크다운이 들어온다. 목록은 한 줄로 자르고
                                전문은 상세 모달에서 본다 */}
                          <td className="max-w-0 px-4 py-3">
                            <p className="truncate">{row.message}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#64748b]">
                            {formatActivityTime(row.occurredAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#64748b]">
                                {row.type}
                              </span>
                              <button
                                type="button"
                                aria-label={`${row.type} 상세 보기`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDetailActivity(row);
                                }}
                                className="shrink-0 cursor-pointer text-[#94a3b8] transition hover:text-[#0f172a]"
                              >
                                <ChevronRight className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
                    <p>트래픽 요약 정보가 없습니다.</p>
                    {/*
                      url 은 status 가 CONNECTED 일 때만 채워진다 — 값이 있으면 지금 열어도 되는
                      주소라는 뜻이라 그대로 링크 노출 조건으로 쓴다.

                      certificateStatus 는 여전히 안 보여준다. GitHub Pages 대상은 Cloudflare
                      프록시 때문에 그 값이 영원히 PENDING 으로 남는다 — 브라우저 HTTPS 는 엣지
                      인증서로 멀쩡한데 화면에는 끝나지 않는 진행 표시가 된다.

                      httpsEnforced 는 다시 보여준다. 서버가 실제 https 프로브 결과로 이 값을
                      올려 주게 됐다(BE #154) — 인증서 관점이 PENDING 이어도 실제로 열리면 true 다.
                      즉 이제 이 값은 "지금 https 로 열리나" 를 그대로 뜻한다.

                      true 일 때만 표시한다. false 는 아직 준비 중인지 정말 안 되는지를 구분하지
                      못하는데, 연결 직후 잠깐 false 인 것을 "HTTPS 안 됨" 으로 내보이면 멀쩡한
                      상태를 고장처럼 읽게 만든다.
                    */}
                    {domainHref ? (
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span>도메인:</span>
                        <a
                          href={domainHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-[#7c3aed] underline underline-offset-2 hover:text-[#6d28d9]"
                        >
                          {overview?.domainSummary?.hostname}
                        </a>
                        {overview?.domainSummary?.httpsEnforced ? (
                          <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-medium text-[#15803d]">
                            HTTPS
                          </span>
                        ) : null}
                      </p>
                    ) : overview?.domainSummary ? (
                      <p>도메인: {overview.domainSummary.hostname} (연결 확인 중)</p>
                    ) : (
                      <p>연결된 도메인이 없습니다.</p>
                    )}
                    <p>저장소 상태: {repositoryHealth?.health ?? '확인 불가'}</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      <ProjectActivityDetailDialog
        activity={detailActivity}
        onClose={() => setDetailActivity(null)}
      />

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
