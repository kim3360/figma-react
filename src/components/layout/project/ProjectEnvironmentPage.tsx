import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteEnvironmentVariable,
  getEnvironmentVariableHistoryList,
  patchEnvironmentVariable,
  postEnvironmentVariableCreate,
  useEnvironmentVariableListQuery,
} from '@/api/environment';
import type { EnvironmentVariableScope } from '@/types/common.enum';

type ProjectEnvironmentPageProps = {
  projectId: number;
};

const skeletonItems = Array.from({ length: 4 }, (_, index) => `env-skeleton-${index}`);

function ProjectEnvironmentPage({ projectId }: ProjectEnvironmentPageProps) {
  const [keyName, setKeyName] = useState('');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState<EnvironmentVariableScope>('PREVIEW');
  const [secret, setSecret] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: variables = [], isLoading } = useEnvironmentVariableListQuery(
    'project-environment-page',
    projectId,
  );
  const { data: history = [] } = useQuery({
    queryKey: ['environment-variable-history', projectId],
    queryFn: () => getEnvironmentVariableHistoryList(projectId),
    enabled: !!projectId,
    gcTime: 0,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['environment-variable-list'] });
    void queryClient.invalidateQueries({ queryKey: ['environment-variable-history'] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      postEnvironmentVariableCreate(projectId, {
        key: keyName,
        value,
        scope,
        secret,
      }),
    onSuccess: () => {
      setKeyName('');
      setValue('');
      invalidate();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (variableId: number) => deleteEnvironmentVariable(projectId, variableId),
    onSuccess: invalidate,
  });

  const handleCreate = async () => {
    setFormError(null);
    try {
      await createMutation.mutateAsync();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '환경변수를 저장하지 못했습니다.');
    }
  };

  const handleToggleSecret = async (
    variableId: number,
    nextSecret: boolean,
    currentValue: string,
  ) => {
    try {
      await patchEnvironmentVariable(projectId, variableId, {
        value: currentValue,
        secret: nextSecret,
      });
      invalidate();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '환경변수를 수정하지 못했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">환경변수 추가</h2>
        {formError ? <p className="mt-3 text-[12px] text-[#dc2626]">{formError}</p> : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={keyName}
            onChange={(event) => setKeyName(event.target.value)}
            placeholder="KEY"
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 font-mono text-[13px]"
          />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="VALUE"
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
          />
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as EnvironmentVariableScope)}
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-[13px]"
          >
            <option value="PREVIEW">PREVIEW</option>
            <option value="PRODUCTION">PRODUCTION</option>
          </select>
          <label className="flex h-9 items-center gap-2 text-[13px] text-[#475569]">
            <input
              type="checkbox"
              checked={secret}
              onChange={(event) => setSecret(event.target.checked)}
            />
            Secret
          </label>
        </div>
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={() => void handleCreate()}
          className="mt-3 h-9 rounded-lg bg-[#0f172a] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          추가
        </button>
      </section>

      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">환경변수 목록</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            skeletonItems.map((key) => (
              <li key={key} className="h-12 animate-pulse rounded-xl bg-[#f8fafc]" />
            ))
          ) : variables.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[#e2e8f0] px-4 py-8 text-center text-[13px] text-[#94a3b8]">
              등록된 환경변수가 없습니다.
            </li>
          ) : (
            variables.map((item) => (
              <li
                key={item.environmentVariableId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f1f5f9] px-4 py-3"
              >
                <div>
                  <p className="font-mono text-[13px] font-semibold text-[#0f172a]">{item.key}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    {item.scope} · {item.secret ? 'secret' : 'plain'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void handleToggleSecret(
                        item.environmentVariableId,
                        !item.secret,
                        item.value || '',
                      )
                    }
                    className="h-8 rounded-lg border border-[#e2e8f0] px-3 text-[12px] font-semibold"
                  >
                    Secret 전환
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.environmentVariableId)}
                    className="h-8 rounded-lg border border-[#fecaca] px-3 text-[12px] font-semibold text-[#dc2626]"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
        <h2 className="text-[16px] font-bold text-[#0f172a]">변경 이력</h2>
        <ul className="mt-3 space-y-2 text-[12px] text-[#64748b]">
          {history.slice(0, 8).map((item) => (
            <li key={item.historyId}>
              {item.action} · {item.key} · {item.createdAt}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ProjectEnvironmentPage;
