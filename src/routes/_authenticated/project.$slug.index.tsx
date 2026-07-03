import { createFileRoute } from '@tanstack/react-router';
import ProjectDetailPage from '@/components/layout/project/ProjectDetailPage';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';
import { useProjectDetailBundleQuery } from '@/api/projects';

export const Route = createFileRoute('/_authenticated/project/$slug/')({
  component: ProjectDetailRoute,
});

function ProjectDetailRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const parsedProjectId = Number(slug);
  const { data, isLoading } = useProjectDetailBundleQuery('project-detail-page', parsedProjectId);

  if (isLoading) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 불러오는 중...</div>;
  }

  if (!data?.project) {
    return <div className="p-6 text-sm text-[#94a3b8]">프로젝트 상세를 찾을 수 없습니다.</div>;
  }

  return (
    <ProjectDetailPage
      projectId={parsedProjectId}
      project={data.project}
      overview={data.overview}
      commits={data.commits}
      activityLogs={data.activityLogs}
      repositoryHealth={data.repositoryHealth}
      isRelatedLoading={false}
    />
  );
}
