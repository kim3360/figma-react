import { useState } from 'react';
import {
  useCreateEnvVarMutation,
  useDeleteEnvVarMutation,
  useProjectEnvHistoryQuery,
  useProjectEnvVarsQuery,
} from '@/api/environment';
import { SectionCard } from '@/components/layout/project/ProjectSectionCard';

export default function ProjectEnvironmentPanel({ projectId }: { projectId: number }) {
  const [key, setKey] = useState('NEW_KEY');
  const [value, setValue] = useState('value');
  const [isSecret, setIsSecret] = useState(false);

  const { data: vars = [] } = useProjectEnvVarsQuery('detail', projectId);
  const { data: history = [] } = useProjectEnvHistoryQuery('detail', projectId);
  const createMutation = useCreateEnvVarMutation(projectId);
  const deleteMutation = useDeleteEnvVarMutation(projectId);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        title="환경변수"
        description="GET/POST/PATCH/DELETE /projects/{id}/environment-variables"
      >
        <div className="mb-3 grid gap-2">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="h-9 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
            placeholder="KEY"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
            placeholder="value"
          />
          <label className="flex items-center gap-2 text-[12px] text-[#475569]">
            <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
            Secret
          </label>
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate({ key, value, isSecret })}
            className="rounded-lg bg-[#0f172a] px-3 py-2 text-[12px] font-semibold text-white"
          >
            환경변수 추가
          </button>
        </div>
        <ul className="space-y-2">
          {vars.map((v) => (
            <li
              key={v.variableId}
              className="flex items-center justify-between gap-2 rounded-xl border border-[#e2e8f0] px-3 py-2"
            >
              <div>
                <p className="text-[13px] font-semibold text-[#0f172a]">
                  {v.key} {v.isSecret ? '🔒' : ''}
                </p>
                <p className="text-[11px] text-[#94a3b8]">{v.valuePreview}</p>
              </div>
              <button
                type="button"
                className="text-[11px] font-semibold text-[#b91c1c]"
                onClick={() => deleteMutation.mutate(v.variableId)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="변경 이력" description="GET /environment-variables/history">
        <ul className="space-y-2">
          {history.map((h) => (
            <li key={h.historyId} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-[12px] text-[#475569]">
              {h.action} · {h.key} · {h.createdAt}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
