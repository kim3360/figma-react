import { useEffect, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import type { AgentTaskEvent } from '@/types/agent.type';
import {
  findAgentTypeIcon,
  findStepProgress,
  formatElapsed,
  isFailureEvent,
  selectVisibleEvents,
} from '@/components/layout/project/agentTaskEvent.utils';

/**
 * 지금 어디까지 왔는지.
 *
 * 서버가 단계마다 이벤트를 남긴다. 문장은 서버가 사용자 말로 적어 보내므로 그대로 쓴다
 * — 화면이 다시 서술하면 서버 문구와 두 벌이 되고, 종류가 늘 때마다 양쪽을 고쳐야 한다.
 *
 * 여기서 답해야 하는 물음은 둘이다. **"얼마나 남았나"** 와 **"멈춘 건가 오류인가"**.
 * 앞은 단계 막대가, 뒤는 마지막 줄의 표시가 답한다 — 도는 중이면 맥박이 뛰고 몇 초째인지
 * 세며, 실패면 그 줄이 빨갛게 선다.
 */

/** 이만큼 지나야 경과를 보여준다. 1초부터 세면 정상 속도의 작업에도 초시계가 붙는다 */
const QUIET_SECONDS_BEFORE_ELAPSED = 10;

/**
 * 이 줄이 뜬 뒤로 얼마나 조용했는지.
 *
 * 서버가 적어 보낸 `createdAt` 이 아니라 **화면에 뜬 시각**부터 센다. 서버 시각에는
 * 오프셋이 없어(formatEventTime 참고) 브라우저 시계와 빼면 시차만큼 엉뚱한 값이 나온다.
 * 여기서 필요한 것은 절대 시각이 아니라 "멈춘 건가" 에 답할 숫자라서 그걸로 충분하다.
 *
 * 새 이벤트가 오면 호출부가 `key` 를 바꿔 이 조각을 다시 마운트한다 — 그래서 여기에는
 * 초기화가 없다. effect 안에서 상태를 되돌리면 이벤트가 올 때마다 렌더가 한 번씩 더 돈다.
 */
function ElapsedSinceMount() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (seconds < QUIET_SECONDS_BEFORE_ELAPSED) return null;

  return <span className="ml-1.5 text-[11px] text-[#94a3b8]">{formatElapsed(seconds)}</span>;
}

/** 이벤트에 붙은 시각. 서버가 오프셋 없이 보내므로 벽시계 그대로 읽는다 */
function formatEventTime(createdAt: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(createdAt);
  return match ? `${match[1]}:${match[2]}` : '';
}

type AgentTaskTimelineProps = {
  events: AgentTaskEvent[];
};

function AgentTaskTimeline({ events }: AgentTaskTimelineProps) {
  const visibleEvents = selectVisibleEvents(events);
  const lastEvent = visibleEvents.at(-1) ?? null;
  const hasFailed = lastEvent != null && isFailureEvent(lastEvent);
  const step = findStepProgress(events);

  if (visibleEvents.length === 0) return null;

  return (
    <div className="mb-2">
      {/*
        단계 막대. 칸을 단계 수만큼 쪼갠다 — 채운 비율 하나보다 "2단계 중 1단계"가 훨씬
        빨리 읽히고, 서버가 단계 수를 바꿔도 계산이 어긋나지 않는다.
      */}
      {step ? (
        <div className="mb-2 flex items-center gap-2">
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={step.total}
            aria-valuenow={step.index}
            aria-label="작업 단계"
            className="flex h-1 flex-1 gap-1"
          >
            {Array.from({ length: step.total }, (_, position) => {
              const stepNumber = position + 1;
              const isDone = stepNumber < step.index;
              const isCurrent = stepNumber === step.index;

              return (
                <span
                  key={stepNumber}
                  className={`h-1 flex-1 rounded-full ${
                    isDone
                      ? 'bg-[#7c3aed]'
                      : isCurrent
                        ? hasFailed
                          ? 'bg-[#dc2626]'
                          : 'animate-pulse bg-[#a78bfa]'
                        : 'bg-[#e2e8f0]'
                  }`}
                />
              );
            })}
          </div>
          <span className="shrink-0 text-[11px] font-medium text-[#94a3b8]">
            {step.index}/{step.total} 단계
          </span>
        </div>
      ) : null}

      <ol className="flex flex-col gap-1">
        {visibleEvents.map((event) => {
          const isLast = event.eventId === lastEvent?.eventId;
          const isFailure = isFailureEvent(event);
          const AgentIcon = findAgentTypeIcon(event.agentType);

          return (
            <li
              key={event.eventId}
              className={`flex gap-2 text-[12px] leading-relaxed ${
                isFailure ? 'text-[#dc2626]' : isLast ? 'text-[#334155]' : 'text-[#64748b]'
              }`}
            >
              <span className="shrink-0 font-mono text-[11px] text-[#cbd5e1]">
                {formatEventTime(event.createdAt)}
              </span>
              {/*
                단계 아이콘. 모르는 종류면 점으로 떨어진다 — 줄 시작이 늘 같은 폭이라야
                문장이 들쭉날쭉하지 않는다
              */}
              <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center">
                {isFailure ? (
                  <CircleAlert className="size-3.5" />
                ) : AgentIcon ? (
                  <AgentIcon className="size-3.5 text-[#a78bfa]" />
                ) : (
                  <span className="size-1 rounded-full bg-[#cbd5e1]" />
                )}
              </span>
              <span className="min-w-0 break-all">
                {event.message}
                {/*
                  마지막 줄에만 붙는 표시가 "지금 이걸 하고 있다"를 말한다. 몇 분 걸리는
                  단계에서 이게 없으면 같은 화면이 멈춘 것과 구분되지 않는다
                */}
                {isLast && !hasFailed ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-block size-1.5 animate-pulse rounded-full bg-[#7c3aed] align-middle"
                    />
                    <ElapsedSinceMount key={event.eventId} />
                  </>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default AgentTaskTimeline;
