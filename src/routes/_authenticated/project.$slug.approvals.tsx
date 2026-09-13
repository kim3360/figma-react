import { createFileRoute } from '@tanstack/react-router';
import ProjectApprovalsPage from '@/components/layout/project/ProjectApprovalsPage';
import ProjectSectionShell from '@/components/layout/project/ProjectSectionShell';
import { Route as ProjectSlugRoute } from '@/routes/_authenticated/project.$slug';

export const Route = createFileRoute('/_authenticated/project/$slug/approvals')({
  component: ProjectApprovalsRoute,
});

function ProjectApprovalsRoute() {
  const { slug } = ProjectSlugRoute.useParams();
  const projectId = Number(slug);

  return (
    <ProjectSectionShell projectId={projectId} active="approvals">
      <ProjectApprovalsPage projectId={projectId} />
    </ProjectSectionShell>
  );
}
