import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import ProjectWorkspaceNav from '@/components/layout/project/ProjectWorkspaceNav';

const activitySkeletonRows = Array.from({ length: 3 }, (_, index) => index);

type ProjectDetailPageSkeletonProps = {
  projectId: number;
};

function ProjectDetailPageSkeleton({ projectId }: ProjectDetailPageSkeletonProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]" aria-busy="true">
      <span className="sr-only">프로젝트 상세를 불러오는 중</span>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1280px]">
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
                <div className="h-8 w-48 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="h-6 w-14 animate-pulse rounded-full bg-[#e2e8f0]" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-10 w-36 animate-pulse rounded-lg bg-[#e2e8f0]" />
                <div className="h-10 w-32 animate-pulse rounded-lg bg-[#e2e8f0]" />
              </div>
            </div>
          </div>

          <ProjectWorkspaceNav projectId={projectId} active="overview" />

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-12">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="size-28 animate-pulse rounded-full bg-[#e2e8f0]" />
              <div className="mt-8 h-5 w-64 animate-pulse rounded bg-[#e2e8f0]" />
              <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#f1f5f9]" />
              <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded bg-[#f1f5f9]" />
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 lg:col-span-2">
              <div className="h-4 w-20 animate-pulse rounded bg-[#e2e8f0]" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />

              <div className="mt-6 h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
              <div className="mt-3 overflow-hidden rounded-lg border border-[#f1f5f9]">
                <table className="w-full table-fixed text-left text-[13px]">
                  <thead className="bg-[#f8fafc]">
                    <tr>
                      <th className="px-4 py-2.5">
                        <div className="h-3 w-10 animate-pulse rounded bg-[#e2e8f0]" />
                      </th>
                      <th className="w-[120px] px-4 py-2.5">
                        <div className="h-3 w-8 animate-pulse rounded bg-[#e2e8f0]" />
                      </th>
                      <th className="w-[200px] px-4 py-2.5">
                        <div className="h-3 w-8 animate-pulse rounded bg-[#e2e8f0]" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {activitySkeletonRows.map((index) => (
                      <tr key={`activity-skeleton-${index}`}>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="flex flex-col gap-5">
              <section className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <div className="h-4 w-28 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="mt-3 h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#e2e8f0]" />
              </section>

              <section className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#e2e8f0]" />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPageSkeleton;
