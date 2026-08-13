import { useState } from 'react';
import {
  useBindDomainMutation,
  useDomainSearchQuery,
  useProjectDomainsQuery,
  useRetryDomainVerificationMutation,
  useUnbindDomainMutation,
  useVerificationGuideQuery,
} from '@/api/domains';
import { MetaRow, SectionCard } from '@/components/layout/project/ProjectSectionCard';

export default function ProjectDomainsPanel({ projectId }: { projectId: number }) {
  const [hostname, setHostname] = useState('mysite.qeploy.app');
  const [search, setSearch] = useState('cafe');
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);

  const { data: domains = [] } = useProjectDomainsQuery('detail', projectId);
  const { data: searchResult } = useDomainSearchQuery('detail', search, search.length > 0);
  const { data: guide } = useVerificationGuideQuery('detail', selectedDomainId);
  const bindMutation = useBindDomainMutation(projectId);
  const unbindMutation = useUnbindDomainMutation();
  const retryMutation = useRetryDomainVerificationMutation();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="도메인 목록" description="GET/POST /projects/{id}/domains">
          <div className="mb-3 flex gap-2">
            <input
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
              placeholder="hostname"
            />
            <button
              type="button"
              disabled={bindMutation.isPending}
              onClick={() =>
                bindMutation.mutate({ hostname, type: 'managed_subdomain', hostingTarget: 'GITHUB_PAGES' })
              }
              className="rounded-lg bg-[#0f172a] px-3 text-[12px] font-semibold text-white"
            >
              연결 요청
            </button>
          </div>
          <ul className="space-y-2">
            {domains.map((d) => (
              <li key={d.domainId} className="rounded-xl border border-[#e2e8f0] px-3 py-2.5">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedDomainId(d.domainId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#0f172a]">{d.hostname}</p>
                    <span className="text-[11px] font-semibold text-[#64748b]">{d.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    {d.type} · {d.hostingTarget}
                  </p>
                </button>
                <div className="mt-2 flex gap-2">
                  {d.status === 'VERIFYING' || d.status === 'FAILED' ? (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-[#7c3aed]"
                      onClick={() => retryMutation.mutate(d.domainId)}
                    >
                      DNS 검증 재시도
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-[#b91c1c]"
                    onClick={() => unbindMutation.mutate(d.domainId)}
                  >
                    연결 해제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="도메인 검색" description="GET /domain-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 h-9 w-full rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
            placeholder="검색어"
          />
          <ul className="space-y-2">
            {(searchResult?.results ?? []).map((r) => (
              <li key={r.hostname} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-[13px]">
                <span className="font-semibold text-[#0f172a]">{r.hostname}</span>
                <span className="ml-2 text-[11px] text-[#64748b]">
                  {r.available ? '사용 가능' : '사용 불가'} {r.price ?? ''}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="DNS 검증 가이드" description="GET /domains/{id}/verification-guide">
        {selectedDomainId == null ? (
          <p className="text-[13px] text-[#94a3b8]">도메인을 선택하세요.</p>
        ) : (
          <>
            <p className="mb-2 text-[13px] text-[#334155]">{guide?.instructions}</p>
            {(guide?.records ?? []).map((record) => (
              <MetaRow
                key={`${record.type}-${record.name}`}
                label={`${record.type} ${record.name}`}
                value={record.value}
              />
            ))}
          </>
        )}
      </SectionCard>
    </div>
  );
}
