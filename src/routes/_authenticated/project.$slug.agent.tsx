import { createFileRoute } from '@tanstack/react-router';
import ProjectAgentPage, {
  type AgentPanelView,
  isAgentPanelView,
} from '@/components/layout/project/ProjectAgentPage';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';
import { useProjectDetailQuery } from '@/api/projects';

type AgentSearch = {
  view?: AgentPanelView;
};

export const Route = createFileRoute('/_authenticated/project/$slug/agent')({
  validateSearch: (search: Record<string, unknown>): AgentSearch => {
    const view = search.view;
    if (isAgentPanelView(view)) return { view };
    return {};
  },
  component: ProjectAgentRoute,
});

function ProjectAgentRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const { view = 'preview' } = Route.useSearch();
  const parsedProjectId = Number(slug);
  const { data: project, isLoading } = useProjectDetailQuery('project-agent-page', parsedProjectId);

  if (isLoading) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 불러오는 중...</div>;
  }

  if (!project) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 찾을 수 없습니다.</div>;
  }

  return <ProjectAgentPage projectId={parsedProjectId} project={project} panelView={view} />;
}
