import { Check, Circle, Loader2, X } from 'lucide-react';
import { mockPipelineRun, type PipelineRun, type PipelineStep, type PipelineStepStatus } from '@/mocks/project/pipeline';
import { cn } from '@/lib/utils';

function StepStatusIcon({ status }: { status: PipelineStepStatus }) {
  if (status === 'success') {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
        <Check className="size-4" strokeWidth={2.5} />
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-[#ede9fe] text-[#7c3aed]">
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626]">
        <X className="size-4" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#e2e8f0] bg-white text-[#cbd5e1]">
      <Circle className="size-3" />
    </span>
  );
}

function PipelineStepCard({
  step,
  isLast,
  previousStatus,
}: {
  step: PipelineStep;
  isLast: boolean;
  previousStatus?: PipelineStepStatus;
}) {
  const connectorActive = previousStatus === 'success' || step.status === 'success';

  return (
    <div className="relative flex min-w-[140px] flex-1 flex-col items-center">
      {!isLast ? (
        <div
          className={cn(
            'absolute left-[calc(50%+14px)] top-3.5 h-0.5 w-[calc(100%-28px)]',
            connectorActive ? 'bg-[#86efac]' : 'bg-[#e2e8f0]',
          )}
          aria-hidden
        />
      ) : null}
      <StepStatusIcon status={step.status} />
      <p className="mt-2 text-center text-[13px] font-semibold text-[#0f172a]">{step.label}</p>
      <p className="mt-0.5 text-center text-[11px] text-[#64748b]">{step.description}</p>
      {step.duration ? (
        <p className="mt-1 text-[10px] font-medium text-[#94a3b8]">{step.duration}</p>
      ) : step.status === 'running' ? (
        <p className="mt-1 text-[10px] font-medium text-[#7c3aed]">진행 중…</p>
      ) : null}
    </div>
  );
}

type ProjectPipelinePanelProps = {
  className?: string;
  /** 에이전트 페이지에서 채팅 수락으로 제어할 때 전달 */
  run?: PipelineRun;
  isRunning?: boolean;
};

function ProjectPipelinePanel({ className, run: controlledRun, isRunning: controlledIsRunning }: ProjectPipelinePanelProps) {
  const run = controlledRun ?? mockPipelineRun;
  const isRunning = controlledIsRunning ?? run.status === 'running';
  const runNumber = run.id.replace('run-', '');

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col bg-white', className)}>
      <div className="shrink-0 border-b border-[#e2e8f0] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0f172a]">배포 파이프라인</h2>
            <p className="mt-1 text-[12px] text-[#64748b]">
              Run #{runNumber} · {run.branch} branch · {run.triggeredAt}
            </p>
          </div>
          {isRunning ? (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#ede9fe] px-4 text-[12px] font-semibold text-[#7c3aed]">
              <Loader2 className="size-3.5 animate-spin" />
              배포 진행 중
            </span>
          ) : run.status === 'success' ? (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#dcfce7] px-4 text-[12px] font-semibold text-[#16a34a]">
              <Check className="size-3.5" />
              배포 완료
            </span>
          ) : (
            <span className="text-[12px] text-[#94a3b8]">채팅에서 배포를 수락하면 실행됩니다</span>
          )}
        </div>
      </div>

      <div className="shrink-0 border-b border-[#f1f5f9] bg-[#fafafa] px-5 py-6">
        <div className="flex items-start gap-2">
          {run.steps.map((step, index) => (
            <PipelineStepCard
              key={step.id}
              step={step}
              isLast={index === run.steps.length - 1}
              previousStatus={index > 0 ? run.steps[index - 1]?.status : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-[#f1f5f9] px-5 py-2">
          <p className="text-[12px] font-semibold text-[#334155]">실행 로그</p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-[#f8fafc] p-4">
          <pre className="font-mono text-[12px] leading-relaxed text-[#475569]">
            {run.logs.length === 0 ? (
              <span className="text-[#94a3b8]">
                배포 제안 메시지에서 수락을 누르면 단계별 로그가 표시됩니다.
              </span>
            ) : (
              run.logs.map((line, index) => <div key={`${line}-${index}`}>{line}</div>)
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default ProjectPipelinePanel;
