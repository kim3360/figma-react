import { createFileRoute } from '@tanstack/react-router';
import ProjectDomainsPage from '@/components/layout/project/ProjectDomainsPage';
import ProjectSectionShell from '@/components/layout/project/ProjectSectionShell';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';

export const Route = createFileRoute('/_authenticated/project/$slug/domains')({
  component: ProjectDomainsRoute,
});

function ProjectDomainsRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const projectId = Number(slug);

  return (
    <ProjectSectionShell projectId={projectId} active="domains">
      <ProjectDomainsPage projectId={projectId} />
    </ProjectSectionShell>
  );
}
