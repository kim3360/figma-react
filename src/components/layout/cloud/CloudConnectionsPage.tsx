import { useState } from 'react';
import { CheckCircle2, Cloud, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  useCloudConnectionsQuery,
  useCreateCloudConnectionMutation,
  useCreateVerificationJobMutation,
  useDeleteCloudConnectionMutation,
} from '@/api/cloudConnections';
import type { CloudConnection } from '@/types/cloudConnection.type';
import { cn } from '@/lib/utils';

const STATUS_META: Record<
  CloudConnection['status'],
  { label: string; dot: string; chip: string }
> = {
  CONNECTED: {
    label: 'Connected',
    dot: 'bg-[#0070f3]',
    chip: 'bg-[#0070f3]/10 text-[#0070f3]',
  },
  VALIDATED: {
    label: 'Validated',
    dot: 'bg-[#f5a623]',
    chip: 'bg-[#f5a623]/10 text-[#a15c00]',
  },
  VERIFYING: {
    label: 'Verifying',
    dot: 'bg-[#666]',
    chip: 'bg-[#f2f2f2] text-[#666]',
  },
  CHECKING: {
    label: 'Checking',
    dot: 'bg-[#666]',
    chip: 'bg-[#f2f2f2] text-[#666]',
  },
  PERMISSION_MISSING: {
    label: 'Permission missing',
    dot: 'bg-[#e00]',
    chip: 'bg-[#e00]/10 text-[#e00]',
  },
  BILLING_DISABLED: {
    label: 'Billing disabled',
    dot: 'bg-[#e00]',
    chip: 'bg-[#e00]/10 text-[#e00]',
  },
  REGION_UNSUPPORTED: {
    label: 'Region unsupported',
    dot: 'bg-[#e00]',
    chip: 'bg-[#e00]/10 text-[#e00]',
  },
  INVALID_CREDENTIAL: {
    label: 'Invalid credential',
    dot: 'bg-[#e00]',
    chip: 'bg-[#e00]/10 text-[#e00]',
  },
  UNKNOWN_ERROR: {
    label: 'Error',
    dot: 'bg-[#e00]',
    chip: 'bg-[#e00]/10 text-[#e00]',
  },
};

function StatusBadge({ status }: { status: CloudConnection['status'] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium',
        meta.chip,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-medium text-[#666]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-[14px] text-[#171717] outline-none transition placeholder:text-[#a1a1a1] focus:border-[#171717] focus:ring-1 focus:ring-[#171717]';

export default function CloudConnectionsPage() {
  const [displayName, setDisplayName] = useState('AWS Demo');
  const [region, setRegion] = useState('ap-northeast-2');
  const [accessKeyId, setAccessKeyId] = useState('AKIATESTKEY1234');
  const [secretAccessKey, setSecretAccessKey] = useState('secret');
  const [showForm, setShowForm] = useState(true);

  const { data: connections = [], isLoading } = useCloudConnectionsQuery('page');
  const createMutation = useCreateCloudConnectionMutation();
  const deleteMutation = useDeleteCloudConnectionMutation();
  const verifyMutation = useCreateVerificationJobMutation();

  const connectedCount = connections.filter((c) => c.status === 'CONNECTED').length;

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-[920px] px-6 py-10">
        {/* Header — Vercel dashboard style */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[#eaeaea] bg-[#fafafa]">
              <Cloud className="size-4 text-[#171717]" strokeWidth={1.75} />
            </div>
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#171717]">
              클라우드 연결
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#666]">
              AWS·GCP 계정을 연결하고 배포·인프라 작업에 사용할 권한을 검증합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#171717] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#000]"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            새 연결
          </button>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: '전체 연결', value: connections.length },
            { label: 'Connected', value: connectedCount },
            {
              label: '검증 필요',
              value: connections.length - connectedCount,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[#eaeaea] bg-[#fafafa] px-4 py-3"
            >
              <p className="text-[12px] font-medium text-[#666]">{stat.label}</p>
              <p className="mt-1 text-[22px] font-semibold tracking-tight text-[#171717]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm ? (
          <section className="mt-6 overflow-hidden rounded-xl border border-[#eaeaea] bg-white">
            <div className="flex items-center justify-between border-b border-[#eaeaea] px-5 py-3.5">
              <div>
                <h2 className="text-[14px] font-semibold text-[#171717]">연결 등록</h2>
                <p className="mt-0.5 font-mono text-[11px] text-[#999]">POST /cloud-connections</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[13px] font-medium text-[#666] hover:text-[#171717]"
              >
                닫기
              </button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Display name">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  placeholder="Production AWS"
                />
              </Field>
              <Field label="Region">
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={inputClass}
                  placeholder="ap-northeast-2"
                />
              </Field>
              <Field label="Access Key ID">
                <input
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  className={cn(inputClass, 'font-mono text-[13px]')}
                  placeholder="AKIA..."
                />
              </Field>
              <Field label="Secret Access Key">
                <input
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  className={cn(inputClass, 'font-mono text-[13px]')}
                  placeholder="••••••••"
                  type="password"
                />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#eaeaea] bg-[#fafafa] px-5 py-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex h-8 items-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-[#171717] hover:bg-[#fafafa]"
              >
                취소
              </button>
              <button
                type="button"
                disabled={createMutation.isPending}
                onClick={() =>
                  createMutation.mutate(
                    {
                      provider: 'AWS',
                      displayName,
                      region,
                      awsCredentialType: 'ACCESS_KEY',
                      accessKeyId,
                      secretAccessKey,
                    },
                    { onSuccess: () => setShowForm(false) },
                  )
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#171717] px-3 text-[13px] font-medium text-white hover:bg-[#000] disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                AWS 연결 등록
              </button>
            </div>
          </section>
        ) : null}

        {/* Connection list */}
        <section className="mt-6 overflow-hidden rounded-xl border border-[#eaeaea]">
          <div className="flex items-center justify-between border-b border-[#eaeaea] px-5 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold text-[#171717]">연결 목록</h2>
              <p className="mt-0.5 font-mono text-[11px] text-[#999]">GET /cloud-connections</p>
            </div>
            <span className="text-[12px] text-[#666]">{connections.length} connections</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-16 text-[13px] text-[#666]">
              <Loader2 className="size-4 animate-spin" />
              불러오는 중…
            </div>
          ) : connections.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-[14px] font-medium text-[#171717]">아직 연결된 클라우드가 없습니다</p>
              <p className="mt-1 text-[13px] text-[#666]">새 연결을 추가해 배포에 사용할 계정을 등록하세요.</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-[#171717] hover:bg-[#fafafa]"
              >
                <Plus className="size-3.5" />
                첫 연결 만들기
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#eaeaea]">
              {connections.map((c) => (
                <li
                  key={c.cloudConnectionId}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fafafa] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[14px] font-semibold text-[#171717]">
                        {c.displayName}
                      </p>
                      <span className="rounded border border-[#eaeaea] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#666]">
                        {c.provider}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#666]">
                      <span className="font-mono text-[#999]">#{c.cloudConnectionId}</span>
                      <span>{c.region}</span>
                      <span className="font-mono">
                        {c.accessKeyId ?? c.serviceAccountEmail ?? '—'}
                      </span>
                      <span>
                        Secret{' '}
                        {c.secretAccessKeyConfigured || c.serviceAccountKeyConfigured
                          ? 'configured'
                          : 'missing'}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={verifyMutation.isPending}
                      onClick={() => verifyMutation.mutate(c.cloudConnectionId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#eaeaea] bg-white px-2.5 text-[12px] font-medium text-[#171717] transition hover:bg-[#f2f2f2] disabled:opacity-50"
                    >
                      <RefreshCw className="size-3.5" strokeWidth={1.75} />
                      재검증
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(c.cloudConnectionId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#eaeaea] bg-white px-2.5 text-[12px] font-medium text-[#e00] transition hover:border-[#e00]/30 hover:bg-[#e00]/5 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                      해제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
