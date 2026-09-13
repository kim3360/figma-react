import { useMemo, useState } from 'react';
import type { TaskClarification } from '@/types/agent.type';
import { OTHER_CHOICE } from '@/components/layout/project/agentClarification.utils';

/**
 * 에이전트가 빌드 전에 스펙을 되물을 때 답하는 자리.
 *
 * 자유 입력으로도 답할 수는 있다 — 아래 채팅창에 적으면 그대로 이 태스크의 답으로 간다.
 * 그런데 "백엔드를 어떤 스택으로 만들까요" 같은 질문에 사람이 적어 넣으면, 서버가 아는
 * 이름과 조금씩 어긋난다. 고르게 하면 그 어긋남이 없다.
 *
 * 답은 결국 **사람이 읽는 문자열 하나**로 보낸다. 서버가 그 문장을 다시 LLM 에 넣어
 * 계획을 세우므로, 값(`node`)이 아니라 이름(`Node/Express (JS)`)을 보내야 한다.
 */

type AgentClarificationFormProps = {
  clarification: TaskClarification;
  isSubmitting: boolean;
  onSubmit: (value: string) => void;
  /** 답하지 않고 이 작업을 접는다. 이 길이 없으면 답할 때까지 빠져나갈 수 없다 */
  onCancel: () => void;
};

function AgentClarificationForm({
  clarification,
  isSubmitting,
  onSubmit,
  onCancel,
}: AgentClarificationFormProps) {
  const isMulti = clarification.inputType === 'MULTI_SELECT';
  const allowOther = clarification.allowOther === true;

  const [selected, setSelected] = useState<string[]>(() => {
    /*
      권장안을 미리 골라 둔다. 대체로 그대로 보내면 되는 답이라 한 번 덜 누른다.

      여러 개를 고르는 질문이면 권장도 여럿일 수 있어 전부 고른다. 하나만 고르는
      질문에서는 서버가 하나만 표시하지만, 그렇다고 믿지 않고 첫 번째만 쓴다 —
      둘이 오면 라디오가 조용히 어긋나기 때문이다.
    */
    const recommended = clarification.options.filter((option) => option.recommended === true);
    if (recommended.length === 0) return [];
    const picked =
      clarification.inputType === 'MULTI_SELECT' ? recommended : recommended.slice(0, 1);
    return picked.map((option) => option.value);
  });
  const [otherText, setOtherText] = useState('');

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (!isMulti) return [value];
      return prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value];
    });
  };

  /*
    보낼 문장을 만든다.

    값이 아니라 **이름**을 잇는다. 서버는 이 문장을 그대로 다시 읽어 계획을 세우므로
    `node` 보다 `Node/Express (JS)` 가 훨씬 덜 헷갈린다.

    고른 순서가 아니라 선택지 순서로 잇는다 — 사용자가 누른 순서는 의미가 없는데,
    그대로 두면 같은 답이 매번 다른 문장이 된다.
  */
  const composedValue = useMemo(() => {
    const labels = clarification.options
      .filter((option) => selected.includes(option.value))
      .map((option) => option.label.trim())
      .filter(Boolean);

    const other = selected.includes(OTHER_CHOICE) ? otherText.trim() : '';
    return [...labels, other].filter(Boolean).join(', ');
  }, [clarification.options, selected, otherText]);

  const isOtherChosen = selected.includes(OTHER_CHOICE);
  const canSubmit = composedValue.length > 0 && !isSubmitting;

  return (
    <div className="mb-2 rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-3">
      <p className="text-[13px] font-semibold leading-relaxed text-[#5b21b6]">
        {clarification.question}
      </p>
      <p className="mt-1 text-[11px] text-[#a78bfa]">
        {isMulti ? '해당하는 것을 모두 고르세요.' : '하나를 고르세요.'} 답하면 하던 작업을 이어서
        진행합니다.
      </p>

      <div className="mt-2.5 flex flex-col gap-1.5">
        {clarification.options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[13px] text-[#334155] ring-1 ring-[#ede9fe] hover:ring-[#ddd6fe]"
          >
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name="agent-clarification"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              disabled={isSubmitting}
              className="size-3.5 accent-[#7c3aed]"
            />
            <span className="min-w-0 flex-1">{option.label}</span>
            {option.recommended === true ? (
              <span className="shrink-0 rounded-full bg-[#ede9fe] px-2 py-0.5 text-[10px] font-semibold text-[#6d28d9]">
                권장
              </span>
            ) : null}
          </label>
        ))}

        {allowOther ? (
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-[13px] text-[#334155] ring-1 ring-[#ede9fe] hover:ring-[#ddd6fe]">
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name="agent-clarification"
              checked={isOtherChosen}
              onChange={() => toggle(OTHER_CHOICE)}
              disabled={isSubmitting}
              className="size-3.5 accent-[#7c3aed]"
            />
            <span>기타 — 직접 적기</span>
          </label>
        ) : null}
      </div>

      {isOtherChosen ? (
        <input
          value={otherText}
          onChange={(event) => setOtherText(event.target.value)}
          disabled={isSubmitting}
          placeholder="원하는 것을 적어 주세요"
          className="mt-2 h-9 w-full rounded-lg border border-[#e9d5ff] bg-white px-2.5 text-[13px] text-[#334155] outline-none placeholder:text-[#c4b5fd] focus:border-[#c4b5fd]"
        />
      ) : null}

      {/*
        답하지 않고 접는 길도 같이 둔다. 이게 없으면 질문이 뜬 순간부터 답할 때까지
        빠져나갈 수 없고, 그건 사용자가 마음을 바꿀 수 없다는 뜻이다.
      */}
      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSubmit(composedValue)}
          disabled={!canSubmit}
          className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#7c3aed] px-4 text-[13px] font-semibold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '보내는 중' : '이대로 진행'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer text-[12px] font-medium text-[#a78bfa] underline underline-offset-2 hover:text-[#7c3aed] disabled:cursor-not-allowed"
        >
          작업 취소
        </button>
      </div>
    </div>
  );
}

export default AgentClarificationForm;
