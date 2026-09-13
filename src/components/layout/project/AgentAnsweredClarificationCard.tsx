import { Check } from 'lucide-react';
import type { AnsweredClarification } from '@/types/agent.type';
import { splitAnsweredChoice } from '@/components/layout/project/agentClarification.utils';

/**
 * 되묻기에 답한 뒤 남는 기록. **읽기 전용이다.**
 *
 * 답하는 폼은 답한 순간 사라진다 — 서버가 `clarification` 을 null 로 만들어 이중 제출을
 * 막기 때문이다. 그 자체는 옳은 동작이라 되살리지 않는다. 대신 서버가 답한 시점의
 * 스냅샷(`answeredClarification`)을 따로 남기고, 이 카드가 그것을 보여준다.
 *
 * 답 문장 자체는 이미 사용자 말풍선으로 대화에 남아 있다. 이 카드가 더해 주는 것은
 * **무엇을 물었고 무엇 중에서 골랐는지** 다 — 고르지 않은 선택지까지 같이 보여야
 * "왜 저걸로 만들었지"에 답이 된다. 그래서 고른 것만이 아니라 전부 그린다.
 *
 * 색을 답하는 폼(보라)과 다르게 잡는다. 같은 색이면 아직 눌러야 할 것처럼 읽힌다.
 */

type AgentAnsweredClarificationCardProps = {
  answered: AnsweredClarification;
};

function AgentAnsweredClarificationCard({ answered }: AgentAnsweredClarificationCardProps) {
  const { chosen, extras } = splitAnsweredChoice(answered);
  const chosenValues = new Set(chosen.map((option) => option.value));
  const options = answered.options ?? [];

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-3">
      <p className="text-[12px] font-semibold text-[#475569]">이렇게 정했습니다</p>
      <p className="mt-1 text-[13px] leading-relaxed text-[#0f172a]">{answered.question}</p>

      <ul className="mt-2.5 flex flex-col gap-1">
        {options.map((option) => {
          const isChosen = chosenValues.has(option.value);

          return (
            <li
              key={option.value}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] ${
                isChosen
                  ? 'bg-white font-semibold text-[#0f172a] ring-1 ring-[#cbd5e1]'
                  : 'text-[#94a3b8]'
              }`}
            >
              {/*
                고른 것에만 표시를 둔다. 나머지 자리에도 같은 크기의 빈 칸을 두어야
                줄이 어긋나지 않는다
              */}
              <span className="flex size-3.5 shrink-0 items-center justify-center">
                {isChosen ? <Check className="size-3.5 text-[#0f172a]" /> : null}
              </span>
              <span className="min-w-0 flex-1 break-words">{option.label}</span>
            </li>
          );
        })}

        {/*
          "기타 — 직접 적기" 로 적어 넣은 답. 선택지에 없던 것이라 위 목록에는 자리가
          없는데, 그게 실제로 고른 것이면 안 보여주면 카드가 거짓말을 한다
        */}
        {extras.map((extra) => (
          <li
            key={extra}
            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[13px] font-semibold text-[#0f172a] ring-1 ring-[#cbd5e1]"
          >
            <span className="flex size-3.5 shrink-0 items-center justify-center">
              <Check className="size-3.5 text-[#0f172a]" />
            </span>
            <span className="min-w-0 flex-1 break-words">{extra}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AgentAnsweredClarificationCard;
