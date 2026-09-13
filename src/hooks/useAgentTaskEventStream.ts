import { useEffect, useRef, useState } from 'react';
import { getAgentTaskEventList, openAgentTaskEventStream } from '@/api/agent';
import type { AgentTaskEvent } from '@/types/agent.type';

/**
 * 에이전트 실행 이벤트를 실시간으로 받아 온다.
 *
 * 태스크 상태만으로는 "작업 중" 이상을 말할 수 없다. 서버는 단계마다 이벤트를 남기고
 * 그걸 SSE 로 흘려주므로, 빌드가 몇 분 걸리는 동안 무엇이 지나갔는지 보여줄 수 있다.
 *
 * 끊겨도 잃지 않는다 — 마지막으로 받은 eventId 를 afterEventId 로 넘겨 이어받는다.
 * 서버 쿼리가 그 값 **초과**라 중복도 유실도 없다.
 *
 * 스트림이 계속 실패하면 목록 폴링으로 내려앉는다. 진행 표시는 없어도 되는 정보라
 * 여기서 오류를 사용자에게 띄우지 않는다 — 조용히 덜 실시간이 될 뿐이다.
 */

/** 서버가 스트림을 닫는 상태. 나머지는 살아 있거나 사람 결정을 기다리는 중이다 */
const STREAM_TERMINAL_STATUSES = new Set(['DONE', 'CANCELLED']);

/** 끊겼을 때 다시 붙기까지. 서버가 5분 타임아웃으로 닫는 경우가 정상이라 급하지 않다 */
const RECONNECT_DELAY_MS = 2000;
/** 이만큼 연달아 실패하면 스트림을 포기하고 목록 폴링으로 간다 */
const MAX_STREAM_FAILURES = 3;
/** 폴백 폴링 간격. 스트림만큼 촘촘할 이유가 없다 */
const FALLBACK_POLL_MS = 5000;

type UseAgentTaskEventStreamOptions = {
  /** 끌 수 있게 둔다 — 태스크가 없거나 화면이 볼 필요가 없을 때 */
  enabled?: boolean;
};

function useAgentTaskEventStream(
  taskId: string | null,
  { enabled = true }: UseAgentTaskEventStreamOptions = {},
) {
  /*
    어느 태스크의 것인지를 이벤트와 함께 담는다.

    태스크가 바뀔 때 effect 안에서 목록을 비우면 렌더가 한 번 더 돌고, 그 사이 한 프레임
    동안 **앞 태스크의 진행이 새 태스크의 것처럼 보인다.** 짝으로 들고 있으면 그 순간이
    아예 없다 — 태스크가 다르면 렌더 시점에 빈 목록으로 읽힌다.
  */
  const [stream, setStream] = useState<{
    taskId: string | null;
    events: AgentTaskEvent[];
    isFallback: boolean;
  }>({ taskId: null, events: [], isFallback: false });

  const isCurrent = stream.taskId === taskId && taskId != null;
  const events = isCurrent ? stream.events : [];
  const isFallback = isCurrent ? stream.isFallback : false;

  // 렌더한 최대 eventId. 재연결 시 이 값 뒤부터 이어받는다
  const lastEventIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !taskId) return;

    lastEventIdRef.current = 0;
    const controller = new AbortController();
    let cancelled = false;
    let failures = 0;

    /** 같은 이벤트가 두 번 들어와도 한 번만 남긴다 — 재연결 경계에서 겹칠 여지를 막는다 */
    const appendEvent = (event: AgentTaskEvent) => {
      if (event.eventId > lastEventIdRef.current) {
        lastEventIdRef.current = event.eventId;
      }
      setStream((prev) => {
        // 태스크가 바뀌었으면 앞선 목록을 잇지 않고 새로 시작한다
        if (prev.taskId !== taskId) {
          return { taskId, events: [event], isFallback: false };
        }
        if (prev.events.some((item) => item.eventId === event.eventId)) return prev;
        return { ...prev, events: [...prev.events, event] };
      });
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        controller.signal.addEventListener(
          'abort',
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });

    /**
     * 스트림이 안 되는 환경일 수 있다(프록시가 SSE 를 끊거나 ReadableStream 이 없거나).
     * 그때도 이벤트는 목록 엔드포인트로 가져올 수 있다 — 덜 실시간일 뿐 같은 데이터다.
     */
    const runFallbackPolling = async () => {
      setStream((prev) =>
        prev.taskId === taskId
          ? { ...prev, isFallback: true }
          : { taskId, events: [], isFallback: true },
      );

      while (!cancelled && !controller.signal.aborted) {
        try {
          const list = await getAgentTaskEventList(taskId, lastEventIdRef.current);
          list.forEach(appendEvent);

          if (list.some((event) => STREAM_TERMINAL_STATUSES.has(event.status))) return;
        } catch {
          // 진행 표시는 없어도 되는 정보다. 실패를 사용자에게 띄우지 않고 다음 주기를 기다린다
        }

        await wait(FALLBACK_POLL_MS);
      }
    };

    const run = async () => {
      while (!cancelled && !controller.signal.aborted) {
        let sawTerminal = false;

        try {
          await openAgentTaskEventStream(taskId, {
            afterEventId: lastEventIdRef.current,
            signal: controller.signal,
            onEvent: (event) => {
              appendEvent(event);
              if (STREAM_TERMINAL_STATUSES.has(event.status)) sawTerminal = true;
            },
          });
          failures = 0;
        } catch (error) {
          if (controller.signal.aborted) return;
          if (error instanceof DOMException && error.name === 'AbortError') return;

          failures += 1;
          if (failures >= MAX_STREAM_FAILURES) {
            await runFallbackPolling();
            return;
          }
        }

        /*
          DONE·CANCELLED 만 확정 종료다. FAILED 는 닫지 않는다 — 빌드 실패는 수정안을
          승인하면 같은 taskId 로 되살아나고, 그 이벤트가 같은 스트림으로 이어져 온다.
          재시도 없이 방치되면 서버가 5분 타임아웃으로 닫고, 그건 오류가 아니라 정상 종료다.
        */
        if (sawTerminal) return;

        await wait(RECONNECT_DELAY_MS);
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [taskId, enabled]);

  return { events, isFallback };
}

export { useAgentTaskEventStream, STREAM_TERMINAL_STATUSES };
