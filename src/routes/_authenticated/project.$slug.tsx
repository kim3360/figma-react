import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/project/$slug')({
  component: ProjectSlugLayout,
});

function ProjectSlugLayout() {
  return <Outlet />;
}
