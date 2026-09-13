import type { ConversationMessage } from '@/types/chat.type';

/**
 * 서버가 남긴 줄을 종류별로 어떻게 보여줄지.
 *
 * 지금까지 어시스턴트 줄은 전부 같은 색이었다. 그래서 "배포가 실패했습니다" 와 "모든
 * 승인이 완료되어 작업을 시작합니다" 가 같은 무게로 읽혔다 — 실패를 찾으려면 대화를
 * 전부 읽어야 했다.
 *
 * **본문으로 종류를 짐작하지 않는다.** 서버가 `kind` 로 알려준다(BE #310). 문구로
 * 추론하면 서버가 한 글자 다듬을 때 조용히 어긋나고, 모델이 비슷한 문장을 지어내면
 * 없는 의미가 붙는다 — 이 파일이 있는 이유가 그것이다.
 */

/** 줄의 무게. 아는 종류만 여기 있고, 나머지는 전부 기본으로 떨어진다 */
type MessageTone = 'default' | 'muted' | 'failed';

/**
 * 종류별 무게.
 *
 * 여기 없는 값은 `default` 다 — 새 종류가 생겨도 화면은 평범한 줄로 그리고 지나간다.
 * 그래서 이 표에 빠진 것이 버그가 되지 않는다.
 */
const MESSAGE_KIND_TONE: Record<string, MessageTone> = {
  /** 실제 답. 대화에서 가장 무거운 줄이라 기본을 준다 */
  AGENT_RESULT: 'default',
  /** 무엇을 승인할지 말하는 줄. 바로 아래 카드가 따라오므로 기본을 준다 */
  APPROVAL_REQUESTED: 'default',
  /** 되묻는 질문 자체. 사용자가 읽고 답해야 하는 것이라 기본을 준다 */
  INPUT_REQUIRED: 'default',
  /** "작업을 시작합니다" 같은 진행 안내. 결과를 가리지 않게 흐리게 둔다 */
  TASK_PROGRESS: 'muted',
  /** 답한 내용. 카드가 같은 것을 더 자세히 보여주므로 흐리게 둔다 */
  CLARIFICATION_ANSWER: 'muted',
  /** 접힌 작업. 지나간 일이라 흐리게 둔다 */
  TASK_CANCELLED: 'muted',
  /** 끝내 실패한 작업. 이것만 눈에 띄어야 한다 */
  TASK_FAILED: 'failed',
};

/** 되묻기에 답한 것을 서버가 대화에 남긴 줄 */
const CLARIFICATION_ANSWER_KIND = 'CLARIFICATION_ANSWER';

function toMessageTone(kind: string | null | undefined): MessageTone {
  if (!kind) return 'default';
  return MESSAGE_KIND_TONE[kind] ?? 'default';
}

/**
 * "이렇게 정했습니다" 카드가 대신 말해 주는 줄을 찾는다.
 *
 * 카드와 이 줄은 같은 답을 말한다. 카드가 떠 있는 동안에는 카드가 훨씬 많은 것을
 * 보여주므로(질문과 고르지 않은 선택지까지) 줄을 접어 둔다. 카드는 태스크가 살아
 * 있는 동안만이고 새로고침하면 사라지므로, **영구 기록은 이 줄 쪽이다** — 그래서
 * 지우는 게 아니라 카드가 있을 때만 감춘다.
 *
 * **`taskId` 로 정확히 짝지운다.** 처음에는 서버가 메시지에 taskId 를 안 실어 줘서
 * "마지막 CLARIFICATION_ANSWER 하나" 로 골랐는데, 그건 카드의 짝이 늘 가장 최근
 * 답변이라는 가정에 기댄 것이었다. 이제 컬럼이 생겨(BE #315) 가정 없이 맞출 수 있다.
 *
 * 짝을 못 찾으면 아무것도 감추지 않는다. 카드와 줄이 같이 보일 뿐이라 잃는 것이
 * 없다 — 엉뚱한 줄을 감춰 기록이 사라지는 쪽이 훨씬 나쁘다. taskId 가 없던 시절에
 * 쌓인 줄이 그 경우다.
 */
function findCardCoveredMessageId(
  messages: ConversationMessage[],
  cardTaskId: string | null,
): number | null {
  if (!cardTaskId) return null;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.kind === CLARIFICATION_ANSWER_KIND && message.taskId === cardTaskId) {
      return message.messageId;
    }
  }
  return null;
}

export { findCardCoveredMessageId, toMessageTone, type MessageTone };
