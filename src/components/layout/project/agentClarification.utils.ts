import type {
  AnsweredClarification,
  ClarificationOption,
  TaskClarification,
} from '@/types/agent.type';

/** 이 둘만 컨트롤로 그린다. 서버가 새 형태를 더하면 자유 입력으로 떨어진다 */
const SELECT_INPUT_TYPES = ['SINGLE_SELECT', 'MULTI_SELECT'];

/** 선택지를 두고도 직접 적고 싶을 때 고르는 값. 서버 값과 겹치지 않게 둔다 */
const OTHER_CHOICE = '__other__';

/**
 * 이 되묻기를 골라서 답할 수 있는지.
 *
 * 선택지가 실제로 있어야 한다 — inputType 이 SELECT 라도 options 가 비어 오면 고를 게
 * 없으므로 자유 입력이 맞다. 모르는 inputType 도 마찬가지로 자유 입력으로 떨어진다.
 */
function canRenderAsChoices(clarification: TaskClarification | null): boolean {
  if (!clarification) return false;
  return SELECT_INPUT_TYPES.includes(clarification.inputType) && clarification.options.length > 0;
}

/**
 * 답이 끝난 되묻기를 "무엇 중에서 골랐는지" 로 보여줄 수 있는지.
 *
 * 질문과 선택지가 둘 다 있어야 한다. 저장소 이름처럼 자유 입력으로 물은 되묻기는
 * `answer` 만 오는데, 그건 이미 사용자 말풍선으로 대화에 남아 있어 카드로 한 번 더
 * 그리면 같은 문장이 두 번 보인다 — 카드가 더해 주는 정보가 있을 때만 그린다.
 */
function canRenderAnsweredChoices(answered: AnsweredClarification | null): boolean {
  if (!answered) return false;
  return Boolean(answered.question?.trim()) && (answered.options?.length ?? 0) > 0;
}

/**
 * 보낸 답을 선택지에 다시 맞춰 본다.
 *
 * 답은 label 을 `", "` 로 이은 문자열 하나다(AgentClarificationForm 이 그렇게 만든다).
 * 그래서 쉼표로 자르지 않고 **구분자째로 찾는다** — label 안에 쉼표가 들어 있어도
 * 경계가 어긋나지 않는다.
 *
 * 어느 선택지와도 안 맞은 조각은 `extras` 로 돌려준다. "기타 — 직접 적기" 로 적어 넣은
 * 답이 그쪽이고, 그것도 보여줘야 무엇을 정했는지가 완결된다.
 */
function splitAnsweredChoice(answered: AnsweredClarification): {
  chosen: ClarificationOption[];
  extras: string[];
} {
  const answer = answered.answer?.trim() ?? '';
  const options = answered.options ?? [];
  if (!answer) return { chosen: [], extras: [] };

  const padded = `, ${answer}, `;
  const chosen = options.filter((option) => {
    const label = option.label.trim();
    return label !== '' && padded.includes(`, ${label}, `);
  });

  // 맞은 것을 덜어내고 남은 조각이 곧 직접 적은 답이다
  let rest = padded;
  for (const option of chosen) {
    rest = rest.replace(`, ${option.label.trim()}, `, ', ');
  }
  const extras = rest
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return { chosen, extras };
}

export { canRenderAsChoices, canRenderAnsweredChoices, splitAnsweredChoice, OTHER_CHOICE };
