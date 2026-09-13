import { createFileRoute } from '@tanstack/react-router';
import ProjectCodePage from '@/components/layout/project/ProjectCodePage';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';
import { useProjectDetailQuery } from '@/api/projects';

export const Route = createFileRoute('/_authenticated/project/$slug/code')({
  component: ProjectCodeRoute,
});

function ProjectCodeRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const parsedProjectId = Number(slug);
  const { data: project, isLoading } = useProjectDetailQuery('project-code-page', parsedProjectId);

  if (isLoading) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 불러오는 중...</div>;
  }

  if (!project) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 찾을 수 없습니다.</div>;
  }

  return <ProjectCodePage projectId={parsedProjectId} project={project} />;
}
