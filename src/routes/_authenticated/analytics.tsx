import { createFileRoute, Link } from '@tanstack/react-router';
import { useProjectDeploymentsQuery } from '@/api/deployments';
import { useCloudConnectionsQuery } from '@/api/cloudConnections';
import { useProjectDomainsQuery } from '@/api/domains';
import { SectionCard } from '@/components/layout/project/ProjectSectionCard';

export const Route = createFileRoute('/_authenticated/analytics')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: cloud = [] } = useCloudConnectionsQuery('analytics');
  const { data: deployments = [] } = useProjectDeploymentsQuery('analytics', 1);
  const { data: domains = [] } = useProjectDomainsQuery('analytics', 1);

  const liveCount = deployments.filter((d) => d.status === 'LIVE').length;
  const connectedDomains = domains.filter((d) => d.status === 'CONNECTED').length;
  const connectedCloud = cloud.filter((c) => c.status === 'CONNECTED').length;

  return (
    <div className="min-h-full bg-[#f8fafc] px-6 py-6">
      <div className="mx-auto max-w-[960px] space-y-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#0f172a]">분석</h1>
          <p className="mt-1 text-[13px] text-[#64748b]">
            더미 데이터 기준 운영 요약 (deployment / domain / cloudconnection)
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SectionCard title="클라우드 연결">
            <p className="text-[28px] font-bold text-[#0f172a]">{connectedCloud}</p>
            <p className="text-[12px] text-[#64748b]">CONNECTED / 전체 {cloud.length}</p>
          </SectionCard>
          <SectionCard title="배포 LIVE">
            <p className="text-[28px] font-bold text-[#0f172a]">{liveCount}</p>
            <p className="text-[12px] text-[#64748b]">프로젝트 #1 기준 · 전체 {deployments.length}</p>
          </SectionCard>
          <SectionCard title="연결된 도메인">
            <p className="text-[28px] font-bold text-[#0f172a]">{connectedDomains}</p>
            <p className="text-[12px] text-[#64748b]">프로젝트 #1 기준 · 전체 {domains.length}</p>
          </SectionCard>
        </div>

        <SectionCard title="바로가기">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/cloud-connections"
              className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-[12px] font-semibold text-[#334155]"
            >
              클라우드 연결
            </Link>
            <Link
              to="/project/$slug"
              params={{ slug: '1' }}
              className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-[12px] font-semibold text-[#334155]"
            >
              프로젝트 #1 상세
            </Link>
            <Link
              to="/trash"
              className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-[12px] font-semibold text-[#334155]"
            >
              휴지통 (chat)
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
