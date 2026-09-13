import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteCloudConnection,
  getCloudConnectionHealth,
  postCloudConnectionCreate,
  postCloudConnectionVerificationJob,
  useCloudConnectionListQuery,
} from '@/api/cloudConnections';
import type { CloudProvider } from '@/types/common.enum';

const skeletonItems = Array.from({ length: 3 }, (_, index) => `cloud-skeleton-${index}`);

function MeCloudConnectionsPanel() {
  const [provider, setProvider] = useState<CloudProvider>('AWS');
  const [displayName, setDisplayName] = useState('');
  const [region, setRegion] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: connections = [], isLoading } = useCloudConnectionListQuery('me-cloud-connections');

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['cloud-connection-list'] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      postCloudConnectionCreate({
        provider,
        displayName,
        region,
        accountId: provider === 'AWS' ? accountId.trim() : '',
        roleArn: '',
        awsCredentialType: provider === 'AWS' ? 'ACCESS_KEY' : null,
        accessKeyId,
        secretAccessKey,
        sessionToken: provider === 'AWS' ? sessionToken.trim() : '',
        gcpCredentialType: provider === 'GCP' ? 'SERVICE_ACCOUNT_KEY' : null,
        serviceAccountKeyJson: provider === 'GCP' ? secretAccessKey : '',
        projectId: '',
        serviceAccountEmail: '',
      }),
    onSuccess: () => {
      setDisplayName('');
      setRegion('');
      setAccessKeyId('');
      setSecretAccessKey('');
      setAccountId('');
      setSessionToken('');
      invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCloudConnection,
    onSuccess: invalidate,
  });

  const handleCreate = async () => {
    setFormError(null);
    try {
      await createMutation.mutateAsync();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '클라우드 연결에 실패했습니다.');
    }
  };

  const handleHealth = async (cloudConnectionId: number) => {
    try {
      const health = await getCloudConnectionHealth(cloudConnectionId);
      setFormError(`health: ${health.status}${health.message ? ` · ${health.message}` : ''}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'health 조회에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <p className="text-[13px] leading-relaxed text-[#64748b]">
          AWS/GCP 계정을 연결하면 프로젝트 인프라 설정에서 선택할 수 있습니다.
        </p>
        {formError ? <p className="mt-3 text-[12px] text-[#7c3aed]">{formError}</p> : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as CloudProvider)}
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
          >
            <option value="AWS">AWS</option>
            <option value="GCP">GCP</option>
          </select>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="표시 이름"
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
          />
          <input
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="리전"
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
          />
          <input
            value={accessKeyId}
            onChange={(event) => setAccessKeyId(event.target.value)}
            placeholder={provider === 'AWS' ? 'Access Key ID' : '프로젝트/계정 ID'}
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
          />
          <input
            type="password"
            value={secretAccessKey}
            onChange={(event) => setSecretAccessKey(event.target.value)}
            placeholder={provider === 'AWS' ? 'Secret Access Key' : 'Service Account JSON'}
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px] sm:col-span-2"
          />
          {/*
            AWS 전용 두 칸. GCP 는 계정 ID 를 키 JSON 에서 뽑고 세션 토큰 개념도 없다.

            accountId 는 서버가 아티팩트 버킷 이름을 qeploy-artifacts-{accountId}-{region}
            으로 짓는 데 쓴다. 비워 보내면 이름에 계정 부분이 통째로 빠져서, 서로 다른
            계정이 같은 버킷 이름을 노리게 된다(S3 이름은 전역이라 그 순간 충돌한다).

            sessionToken 은 ASIA 로 시작하는 임시 자격(SSO)에만 필요하다. AKIA 장기 키는
            비워 두면 되므로 필수로 걸지 않는다 — 대신 언제 필요한지 아래에 적어둔다.
          */}
          {provider === 'AWS' ? (
            <>
              <input
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                inputMode="numeric"
                placeholder="AWS 계정 ID (12자리)"
                className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
              />
              <input
                type="password"
                value={sessionToken}
                onChange={(event) => setSessionToken(event.target.value)}
                placeholder="Session Token (임시 자격만)"
                className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
              />
            </>
          ) : null}
        </div>
        {provider === 'AWS' ? (
          <p className="mt-2 text-[12px] leading-relaxed text-[#94a3b8]">
            Access Key가 <span className="font-mono">ASIA</span>로 시작하면 임시 자격(SSO)이라
            Session Token까지 넣어야 합니다. <span className="font-mono">AKIA</span>로 시작하는 장기
            키는 비워 두세요.
          </p>
        ) : null}
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={() => void handleCreate()}
          className="mt-3 h-9 rounded-lg bg-[#0f172a] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          연결 등록
        </button>
      </section>

      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h3 className="text-[14px] font-bold text-[#0f172a]">등록된 연결</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {isLoading ? (
            skeletonItems.map((key) => (
              <li key={key} className="h-14 animate-pulse rounded-xl bg-[#f8fafc]" />
            ))
          ) : connections.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[#e2e8f0] px-4 py-8 text-center text-[13px] text-[#94a3b8]">
              등록된 클라우드 연결이 없습니다.
            </li>
          ) : (
            connections.map((connection) => (
              <li
                key={connection.cloudConnectionId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f1f5f9] px-4 py-3"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#0f172a]">
                    {connection.displayName}
                  </p>
                  <p className="text-[11px] text-[#94a3b8]">
                    {connection.provider} · {connection.region} · {connection.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleHealth(connection.cloudConnectionId)}
                    className="h-8 rounded-lg border border-[#e2e8f0] px-3 text-[12px] font-semibold"
                  >
                    Health
                  </button>
                  <button
                    type="button"
                    onClick={() => postCloudConnectionVerificationJob(connection.cloudConnectionId)}
                    className="h-8 rounded-lg border border-[#e2e8f0] px-3 text-[12px] font-semibold"
                  >
                    재검증
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(connection.cloudConnectionId)}
                    className="h-8 rounded-lg border border-[#fecaca] px-3 text-[12px] font-semibold text-[#dc2626]"
                  >
                    해제
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

export default MeCloudConnectionsPanel;
