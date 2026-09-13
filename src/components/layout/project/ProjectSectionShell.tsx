import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Play } from 'lucide-react';
import { useProjectDetailQuery } from '@/api/projects';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import ProjectWorkspaceNav, {
  type ProjectWorkspaceTab,
} from '@/components/layout/project/ProjectWorkspaceNav';

type ProjectSectionShellProps = {
  projectId: number;
  active: ProjectWorkspaceTab;
  children: ReactNode;
};

function ProjectSectionShell({ projectId, active, children }: ProjectSectionShellProps) {
  const { data: project, isLoading } = useProjectDetailQuery('project-section-shell', projectId);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1280px]">
          <Link
            to="/project"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#64748b] transition hover:text-[#0f172a]"
          >
            <ArrowLeft className="size-4" />
            프로젝트 목록으로 돌아가기
          </Link>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            {isLoading ? (
              <div className="h-8 w-48 animate-pulse rounded bg-[#e2e8f0]" />
            ) : (
              <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
                {project
                  ? formatProjectDisplayName(project.name, project.projectId)
                  : '프로젝트를 찾을 수 없습니다.'}
              </h1>
            )}
            <Link
              to="/project/$slug/agent"
              params={{ slug: String(projectId) }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition hover:bg-[#6d28d9]"
            >
              <Play className="size-4 fill-current" />
              Open AI Agent
            </Link>
          </div>

          <ProjectWorkspaceNav projectId={projectId} active={active} />

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ProjectSectionShell;
