import { createFileRoute, redirect } from '@tanstack/react-router';
import ProjectDetailPage from '@/components/layout/project/ProjectDetailPage';
import { useProjectDetailBundleQuery } from '@/api/projects';
import {
  isProjectDetailTab,
  type ProjectDetailTab,
} from '@/lib/projectDetailTabs';

const RESERVED_SLUG_CHILDREN = new Set(['agent', 'code', 'pipeline']);

export const Route = createFileRoute('/_authenticated/project/$slug/$tab')({
  beforeLoad: ({ params }) => {
    if (RESERVED_SLUG_CHILDREN.has(params.tab)) {
      return;
    }
    if (!isProjectDetailTab(params.tab) || params.tab === 'overview') {
      throw redirect({
        to: '/project/$slug',
        params: { slug: params.slug },
        replace: true,
      });
    }
  },
  component: ProjectDetailTabRoute,
});

function ProjectDetailTabRoute() {
  const { slug, tab } = Route.useParams();
  const parsedProjectId = Number(slug);
  const activeTab = tab as ProjectDetailTab;
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
      tab={activeTab}
      isRelatedLoading={false}
    />
  );
}
