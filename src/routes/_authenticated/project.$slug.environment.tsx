import { createFileRoute } from '@tanstack/react-router';
import ProjectEnvironmentPage from '@/components/layout/project/ProjectEnvironmentPage';
import ProjectSectionShell from '@/components/layout/project/ProjectSectionShell';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';

export const Route = createFileRoute('/_authenticated/project/$slug/environment')({
  component: ProjectEnvironmentRoute,
});

function ProjectEnvironmentRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const projectId = Number(slug);

  return (
    <ProjectSectionShell projectId={projectId} active="environment">
      <ProjectEnvironmentPage projectId={projectId} />
    </ProjectSectionShell>
  );
}
