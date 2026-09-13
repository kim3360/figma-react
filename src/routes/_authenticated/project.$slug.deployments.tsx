import { createFileRoute } from '@tanstack/react-router';
import ProjectDeploymentsPage from '@/components/layout/project/ProjectDeploymentsPage';
import ProjectSectionShell from '@/components/layout/project/ProjectSectionShell';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';

export const Route = createFileRoute('/_authenticated/project/$slug/deployments')({
  component: ProjectDeploymentsRoute,
});

function ProjectDeploymentsRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const projectId = Number(slug);

  return (
    <ProjectSectionShell projectId={projectId} active="deployments">
      <ProjectDeploymentsPage projectId={projectId} />
    </ProjectSectionShell>
  );
}
