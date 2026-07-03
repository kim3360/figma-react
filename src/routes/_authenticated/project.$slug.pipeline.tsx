import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import ProjectPipelinePanel from '@/components/layout/project/ProjectPipelinePanel';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';
import { useProjectDetailQuery } from '@/api/projects';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';

export const Route = createFileRoute('/_authenticated/project/$slug/pipeline')({
  component: ProjectPipelineRoute,
});

function ProjectPipelineRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const parsedProjectId = Number(slug);
  const { data: project, isLoading } = useProjectDetailQuery('project-pipeline-page', parsedProjectId);

  if (isLoading) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 불러오는 중...</div>;
  }

  if (!project) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 찾을 수 없습니다.</div>;
  }

  const projectName = formatProjectDisplayName(project.name, project.projectId);

  return (
    <div className="flex h-[calc(100vh)] min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#e2e8f0] px-4 py-2.5">
        <Link
          to="/project/$slug/agent"
          params={{ slug: String(parsedProjectId) }}
          className="flex size-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f8fafc]"
          aria-label="에이전트로 돌아가기"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#0f172a]">{projectName}</p>
          <p className="text-[12px] text-[#64748b]">배포 파이프라인</p>
        </div>
      </header>
      <ProjectPipelinePanel />
    </div>
  );
}
