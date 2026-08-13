import { createFileRoute } from '@tanstack/react-router';
import CloudConnectionsPage from '@/components/layout/cloud/CloudConnectionsPage';

export const Route = createFileRoute('/_authenticated/cloud-connections')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CloudConnectionsPage />;
}
