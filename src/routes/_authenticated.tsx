import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@/lib/requireAuth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: requireAuth,
  component: () => <Outlet />,
});
