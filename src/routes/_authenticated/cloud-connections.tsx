import { createFileRoute } from '@tanstack/react-router';
import MeCloudConnectionsPanel from '@/components/layout/me/MeCloudConnectionsPanel';

export const Route = createFileRoute('/_authenticated/cloud-connections')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-[28px] font-bold tracking-tight text-[#0f172a]">클라우드 연결</h1>
      <MeCloudConnectionsPanel />
    </div>
  );
}
