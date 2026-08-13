import { useState } from 'react';
import {
  useCancelTaskMutation,
  usePreviewLogsQuery,
  usePreviewSessionsQuery,
  useProjectTasksQuery,
  useStopPreviewMutation,
  useSubmitDecisionMutation,
  useTaskEventsQuery,
} from '@/api/agentPreview';
import { SectionCard } from '@/components/layout/project/ProjectSectionCard';

export default function ProjectAgentPreviewPanel({ projectId }: { projectId: number }) {
  const [prompt, setPrompt] = useState('히어로 문구를 더 짧게 바꿔줘');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task_deploy_1');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>('preview_sess_12');

  const { data: tasks = [] } = useProjectTasksQuery('detail', projectId);
  const { data: events = [] } = useTaskEventsQuery('detail', selectedTaskId);
  const { data: sessions = [] } = usePreviewSessionsQuery('detail', projectId);
  const { data: logs } = usePreviewLogsQuery('detail', selectedSessionId);
  const submitMutation = useSubmitDecisionMutation(projectId);
  const cancelMutation = useCancelTaskMutation();
  const stopMutation = useStopPreviewMutation(projectId);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Agent Tasks" description="POST /agent/decision · GET /agent/tasks/{id}">
          <div className="mb-3 flex gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-[#e2e8f0] px-3 text-[13px]"
            />
            <button
              type="button"
              disabled={submitMutation.isPending}
              onClick={() => submitMutation.mutate(prompt)}
              className="rounded-lg bg-[#7c3aed] px-3 text-[12px] font-semibold text-white"
            >
              요청 제출
            </button>
          </div>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.taskId} className="rounded-xl border border-[#e2e8f0] px-3 py-2.5">
                <button type="button" className="w-full text-left" onClick={() => setSelectedTaskId(t.taskId)}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#0f172a]">{t.summary ?? t.taskId}</p>
                    <span className="text-[11px] font-semibold text-[#64748b]">{t.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">{t.taskId}</p>
                </button>
                {t.status === 'QUEUED' || t.status === 'RUNNING' || t.status === 'WAITING_INPUT' ? (
                  <button
                    type="button"
                    className="mt-1 text-[11px] font-semibold text-[#b91c1c]"
                    onClick={() => cancelMutation.mutate(t.taskId)}
                  >
                    취소
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Task Events" description="GET /agent/tasks/{id}/events">
          {selectedTaskId == null ? (
            <p className="text-[13px] text-[#94a3b8]">태스크를 선택하세요.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.eventId} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-[12px] text-[#475569]">
                  <span className="font-semibold text-[#7c3aed]">{e.type}</span> · {e.message}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Preview Sessions" description="GET/DELETE preview-sessions">
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.sessionId} className="rounded-xl border border-[#e2e8f0] px-3 py-2.5">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setSelectedSessionId(s.sessionId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#0f172a]">{s.sessionId}</p>
                    <span className="text-[11px] font-semibold text-[#64748b]">{s.status}</span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-[#94a3b8]">{s.previewUrl ?? '-'}</p>
                </button>
                {s.status === 'READY' || s.status === 'STARTING' ? (
                  <button
                    type="button"
                    className="mt-1 text-[11px] font-semibold text-[#b91c1c]"
                    onClick={() => stopMutation.mutate(s.sessionId)}
                  >
                    세션 종료
                  </button>
                ) : null}
              </li>
            ))}
            {sessions.length === 0 ? (
              <p className="text-[13px] text-[#94a3b8]">프리뷰 세션이 없습니다.</p>
            ) : null}
          </ul>
        </SectionCard>

        <SectionCard title="Preview Logs" description="GET /preview-sessions/{id}/logs">
          {selectedSessionId == null ? (
            <p className="text-[13px] text-[#94a3b8]">세션을 선택하세요.</p>
          ) : (
            <pre className="max-h-[240px] overflow-auto rounded-xl bg-[#0f172a] p-3 text-[12px] text-[#e2e8f0]">
              {(logs?.lines ?? []).join('\n')}
            </pre>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
