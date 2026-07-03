import { todoDeployJob, todoDeployLogPayload } from '@/mocks/project/todoDeployLog';
import type { GithubActionsLogStep } from '@/types/githubActionsLog.type';
import type { PipelineRun, PipelineStep, PipelineStepStatus } from '@/mocks/project/pipeline';

const PLAYBACK_SPEED = 0.4;
const MIN_STEP_MS = 400;
const MIN_LINE_MS = 12;

/** UI에 표시하는 4단계 파이프라인 (GitHub Actions 세부 스텝과 분리) */
export const PIPELINE_DISPLAY_STEPS: Omit<PipelineStep, 'status' | 'duration'>[] = [
  { id: 'install', label: '의존성 설치', description: 'npm install' },
  { id: 'build', label: '빌드', description: 'vite build' },
  { id: 'preview', label: '프리뷰 배포', description: 'GitHub Pages 준비' },
  { id: 'publish', label: '프로덕션 게시', description: 'gh-pages 배포' },
];

type DisplayGroupId = (typeof PIPELINE_DISPLAY_STEPS)[number]['id'];

function getDisplayGroupForGithubStep(stepName: string): DisplayGroupId {
  if (stepName === 'Build') return 'build';
  if (stepName === 'Deploy to gh-pages' || stepName.startsWith('Post')) return 'publish';
  if (stepName === 'Copy index.html to 404.html' || stepName === 'Preserve custom domain') {
    return 'preview';
  }
  return 'install';
}

function formatGroupDuration(steps: GithubActionsLogStep[]): string {
  const totalMs = steps.reduce(
    (sum, step) =>
      sum + (new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()),
    0,
  );
  const seconds = Math.max(Math.round(totalMs / 1000), 1);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function stepDurationMs(step: GithubActionsLogStep): number {
  const actual = new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime();
  return Math.max(actual * PLAYBACK_SPEED, MIN_STEP_MS);
}

function updateStepStatus(
  steps: PipelineStep[],
  stepId: string,
  status: PipelineStepStatus,
  duration?: string,
): PipelineStep[] {
  return steps.map((step) =>
    step.id === stepId ? { ...step, status, duration: duration ?? step.duration } : step,
  );
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeoutId = window.setTimeout(() => resolve(), ms);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function buildIdleSteps(): PipelineStep[] {
  return PIPELINE_DISPLAY_STEPS.map((step) => ({
    ...step,
    status: 'pending' as const,
  }));
}

function groupGithubStepsByDisplay(): Map<DisplayGroupId, GithubActionsLogStep[]> {
  const groups = new Map<DisplayGroupId, GithubActionsLogStep[]>();

  for (const step of PIPELINE_DISPLAY_STEPS) {
    groups.set(step.id, []);
  }

  for (const step of todoDeployJob.steps) {
    const groupId = getDisplayGroupForGithubStep(step.name);
    groups.get(groupId)?.push(step);
  }

  return groups;
}

export function createIdlePipelineRun(): PipelineRun {
  const { meta } = todoDeployLogPayload;

  return {
    id: `run-${meta.runId}`,
    branch: meta.branch,
    triggeredAt: '대기 중',
    status: 'idle',
    workflow: meta.workflow,
    repository: meta.repository,
    trigger: meta.trigger,
    steps: buildIdleSteps(),
    logs: [],
  };
}

export async function runPipelineSequence(
  setRun: (updater: (prev: PipelineRun) => PipelineRun) => void,
  options?: { signal?: AbortSignal },
): Promise<'success' | 'aborted'> {
  const signal = options?.signal;
  const { meta } = todoDeployLogPayload;
  const groupedSteps = groupGithubStepsByDisplay();

  setRun(() => ({
    id: `run-${meta.runId}`,
    branch: meta.branch,
    triggeredAt: meta.duration,
    status: 'running',
    workflow: meta.workflow,
    repository: meta.repository,
    trigger: meta.trigger,
    steps: buildIdleSteps(),
    logs: [],
  }));

  try {
    let activeGroupId: DisplayGroupId | null = null;

    for (const step of todoDeployJob.steps) {
      if (signal?.aborted) return 'aborted';

      const groupId = getDisplayGroupForGithubStep(step.name);

      if (groupId !== activeGroupId) {
        if (activeGroupId !== null) {
          const completedGroupId = activeGroupId;
          const completedGroupSteps = groupedSteps.get(completedGroupId) ?? [];
          setRun((prev) => ({
            ...prev,
            steps: updateStepStatus(
              prev.steps,
              completedGroupId,
              'success',
              formatGroupDuration(completedGroupSteps),
            ),
          }));
        }

        activeGroupId = groupId;
        setRun((prev) => ({
          ...prev,
          status: 'running',
          steps: updateStepStatus(prev.steps, groupId, 'running'),
        }));
      }

      const durationMs = stepDurationMs(step);
      const lineDelay = Math.max(durationMs / Math.max(step.lines.length, 1), MIN_LINE_MS);

      for (const line of step.lines) {
        if (signal?.aborted) return 'aborted';

        setRun((prev) => ({
          ...prev,
          logs: [...prev.logs, line.message],
        }));

        await delay(lineDelay, signal);
      }
    }

    if (activeGroupId !== null) {
      const completedGroupSteps = groupedSteps.get(activeGroupId) ?? [];
      setRun((prev) => ({
        ...prev,
        status: 'success',
        steps: updateStepStatus(
          prev.steps,
          activeGroupId,
          'success',
          formatGroupDuration(completedGroupSteps),
        ),
      }));
    } else {
      setRun((prev) => ({ ...prev, status: 'success' }));
    }

    return 'success';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'aborted';
    }
    throw error;
  }
}
