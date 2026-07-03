import type { ConversationMessage } from '@/types/chat.type';

export type AgentPreviewPhase = 'empty' | 'building' | 'ready';

export const AGENT_TODO_PREVIEW_URL = 'https://dldnsgkr.github.io/my-todo-app/';
export const AGENT_PORTFOLIO_PREVIEW_URL = 'https://dldnsgkr.github.io/portfolio_fix';
export const AGENT_PORTFOLIO_FIX_PREVIEW_URL = 'https://dldnsgkr.github.io/portfolio_fix';

/** 신규 생성: 앱 생성 완료 / 기존 레포 수정: 감사 섹션 추가 완료 */
export const AGENT_PREVIEW_READY_MARKERS = [
  '투두 앱 생성을 완료',
  '감사 섹션 추가를 완료',
] as const;

function hasPreviewReadyMessage(messages: ConversationMessage[]): boolean {
  return messages.some(
    (message) =>
      message.role === 'assistant' &&
      AGENT_PREVIEW_READY_MARKERS.some((marker) => message.content.includes(marker)),
  );
}

function isTodoAppConversation(messages: ConversationMessage[]): boolean {
  return messages.some(
    (message) =>
      (message.role === 'user' && /투두/.test(message.content)) ||
      (message.role === 'assistant' && message.content.includes('투두 앱 생성을 완료')) ||
      message.content.includes('my-todo-app'),
  );
}

function isPortfolioEditConversation(messages: ConversationMessage[]): boolean {
  return messages.some(
    (message) =>
      (message.role === 'user' &&
        /포트폴리오/i.test(message.content) &&
        /(감사|섹션)/.test(message.content)) ||
      (message.role === 'assistant' && message.content.includes('감사 섹션 추가를 완료')),
  );
}

export function deriveAgentPreviewUrl(messages: ConversationMessage[]): string {
  if (messages.some((message) => message.content.includes('portfolio_fix'))) {
    return AGENT_PORTFOLIO_FIX_PREVIEW_URL;
  }

  if (isPortfolioEditConversation(messages)) {
    return AGENT_PORTFOLIO_PREVIEW_URL;
  }

  if (isTodoAppConversation(messages)) {
    return AGENT_TODO_PREVIEW_URL;
  }

  return AGENT_TODO_PREVIEW_URL;
}

/** 코드·수정 완료 안내 메시지가 오면 배포 URL 프리뷰를 표시한다. */
export function deriveAgentPreviewPhase(messages: ConversationMessage[]): AgentPreviewPhase {
  if (hasPreviewReadyMessage(messages)) return 'ready';

  const hasUserMessage = messages.some((message) => message.role === 'user');
  if (hasUserMessage) return 'building';

  return 'empty';
}
