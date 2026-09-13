import { createFileRoute } from '@tanstack/react-router';
import ProjectInfraPage from '@/components/layout/project/ProjectInfraPage';
import ProjectSectionShell from '@/components/layout/project/ProjectSectionShell';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';

export const Route = createFileRoute('/_authenticated/project/$slug/infra')({
  component: ProjectInfraRoute,
});

function ProjectInfraRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const projectId = Number(slug);

  return (
    <ProjectSectionShell projectId={projectId} active="infra">
      <ProjectInfraPage projectId={projectId} />
    </ProjectSectionShell>
  );
}
