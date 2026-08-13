import { useState } from 'react';
import {
  useCloudConnectionsQuery,
  useCreateCloudConnectionMutation,
  useCreateVerificationJobMutation,
  useDeleteCloudConnectionMutation,
} from '@/api/cloudConnections';
import { MetaRow, SectionCard } from '@/components/layout/project/ProjectSectionCard';

export default function CloudConnectionsPage() {
  const [displayName, setDisplayName] = useState('AWS Demo');
  const [region, setRegion] = useState('ap-northeast-2');
  const [accessKeyId, setAccessKeyId] = useState('AKIATESTKEY1234');
  const [secretAccessKey, setSecretAccessKey] = useState('secret');

  const { data: connections = [] } = useCloudConnectionsQuery('page');
  const createMutation = useCreateCloudConnectionMutation();
  const deleteMutation = useDeleteCloudConnectionMutation();
  const verifyMutation = useCreateVerificationJobMutation();

  return (
    <div className="min-h-full bg-[#f8fafc] px-6 py-6">
      <div className="mx-auto max-w-[960px] space-y-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#0f172a]">클라우드 연결</h1>
          <p className="mt-1 text-[13px] text-[#64748b]">
            Swagger cloudconnection 그룹 — 등록/해제/health/재검증 (더미)
          </p>
        </div>

        <SectionCard title="연결 등록" description="POST /cloud-connections">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
              placeholder="표시 이름"
            />
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-9 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
              placeholder="리전"
            />
            <input
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              className="h-9 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
              placeholder="Access Key ID"
            />
            <input
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              className="h-9 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
              placeholder="Secret Access Key"
              type="password"
            />
          </div>
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                provider: 'AWS',
                displayName,
                region,
                awsCredentialType: 'ACCESS_KEY',
                accessKeyId,
                secretAccessKey,
              })
            }
            className="mt-3 rounded-lg bg-[#0f172a] px-4 py-2 text-[12px] font-semibold text-white"
          >
            AWS 연결 등록
          </button>
        </SectionCard>

        <SectionCard title="연결 목록" description="GET /cloud-connections">
          <ul className="space-y-3">
            {connections.map((c) => (
              <li key={c.cloudConnectionId} className="rounded-xl border border-[#e2e8f0] px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[#0f172a]">
                      {c.displayName} · {c.provider}
                    </p>
                    <p className="mt-1 text-[12px] text-[#64748b]">
                      #{c.cloudConnectionId} · {c.region} · {c.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-[12px] font-semibold text-[#334155]"
                      onClick={() => verifyMutation.mutate(c.cloudConnectionId)}
                    >
                      재검증
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#fecaca] px-3 py-1.5 text-[12px] font-semibold text-[#b91c1c]"
                      onClick={() => deleteMutation.mutate(c.cloudConnectionId)}
                    >
                      해제
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <MetaRow label="Access Key" value={c.accessKeyId ?? '-'} />
                  <MetaRow
                    label="Secret 저장"
                    value={c.secretAccessKeyConfigured || c.serviceAccountKeyConfigured ? '예' : '아니오'}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
