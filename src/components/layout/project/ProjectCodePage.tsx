import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import type { GetProjectDetailResType } from '@/types/projects.type';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import ProjectCodeExplorerPanel from '@/components/layout/project/ProjectCodeExplorerPanel';

type ProjectCodePageProps = {
  projectId: number;
  project: GetProjectDetailResType;
};

function ProjectCodePage({ projectId, project }: ProjectCodePageProps) {
  const projectName = formatProjectDisplayName(project.name, project.projectId);

  return (
    <div className="flex h-[calc(100vh)] min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#e2e8f0] px-4 py-2.5">
        <Link
          to="/project/$slug/agent"
          params={{ slug: String(projectId) }}
          className="flex size-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f8fafc]"
          aria-label="에이전트로 돌아가기"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#0f172a]">{projectName}</p>
          <p className="text-[12px] text-[#64748b]">코드 변경 사항</p>
        </div>
      </header>

      <ProjectCodeExplorerPanel />
    </div>
  );
}

export default ProjectCodePage;
