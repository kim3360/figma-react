import { Code, Globe, MessageSquare, Rocket, Server, Settings } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AgentTaskEvent } from '@/types/agent.type';

/**
 * 진행 이벤트를 읽는 규칙.
 *
 * **type 으로 분기하지 않는다.** 서버가 종류를 계속 늘리기로 했으므로, 모르는 type 이
 * 와도 화면은 그것을 그냥 한 줄로 그리고 지나가야 한다. 대신 서버가 같이 보내주는
 * `status` 와 `stepIndex`/`stepTotal` 로 판단한다 — 이 둘은 종류가 늘어도 뜻이 안 바뀐다.
 */

/**
 * 단계 아이콘. 아는 것만 붙인다.
 *
 * 모르는 값에 라벨을 붙여 `RUNTIME_SETUP` 같은 원시 대문자를 그대로 내보내면 사용자에게는
 * 뜻이 없다. 아이콘이 없으면 그냥 점으로 떨어지고, 그래도 줄은 읽힌다 — 문장 자체는
 * 서버가 사용자 말로 적어 보내기 때문이다.
 */
const AGENT_TYPE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  CHAT: MessageSquare,
  CODE: Code,
  DEPLOY: Rocket,
  DOMAIN_BIND: Globe,
  INFRA_OPERATE: Server,
  RUNTIME_SETUP: Settings,
};

/** 이 이벤트가 실패를 말하는가. type 이 아니라 status 로 본다 */
function isFailureEvent(event: AgentTaskEvent): boolean {
  return event.status === 'FAILED';
}

function findAgentTypeIcon(agentType: string | null) {
  if (!agentType) return null;
  return AGENT_TYPE_ICON[agentType] ?? null;
}

/**
 * 계획의 어디쯤인지.
 *
 * 스텝 이벤트에만 `stepIndex`/`stepTotal` 이 실리므로 **가장 마지막에 실려 온 값**을 쓴다.
 * 그 뒤에 온 생명주기 이벤트(COMPLETED 등)는 셋 다 null 이라 진행 표시를 지우면 안 된다
 * — 다 끝나가는 순간에 막대가 사라지면 오히려 되돌아간 것처럼 보인다.
 */
function findStepProgress(events: AgentTaskEvent[]): { index: number; total: number } | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const { stepIndex, stepTotal } = events[i];
    if (stepIndex != null && stepTotal != null && stepTotal > 0 && stepIndex > 0) {
      return { index: Math.min(stepIndex, stepTotal), total: stepTotal };
    }
  }
  return null;
}

/** 화면에 그릴 이벤트. 문장이 없는 것은 사용자에게 보여줄 게 없다 */
function selectVisibleEvents(events: AgentTaskEvent[]): AgentTaskEvent[] {
  return events.filter((event) => Boolean(event.message?.trim()));
}

/** 초 단위 경과를 사람 말로. 분을 넘기면 분부터 읽는 편이 빠르다 */
function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}초째`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}분째` : `${minutes}분 ${rest}초째`;
}

export { findAgentTypeIcon, findStepProgress, formatElapsed, isFailureEvent, selectVisibleEvents };
