import type { ConversationMessage } from '@/types/chat.type';

export const AGENT_CHAT_QUERY_KEY = 'project-agent';

const sessionMessagesByConversation = new Map<number, ConversationMessage[]>();

export function readSessionMessages(conversationId: number): ConversationMessage[] {
  return sessionMessagesByConversation.get(conversationId) ?? [];
}

export function writeSessionMessages(conversationId: number, messages: ConversationMessage[]) {
  sessionMessagesByConversation.set(conversationId, messages);
}

/** 새 대화 생성 전 임시 ID(0)에 쌓인 메시지를 실제 conversationId로 옮긴다. */
export function migrateSessionMessages(fromConversationId: number, toConversationId: number) {
  const messages = readSessionMessages(fromConversationId);
  if (messages.length === 0) return;

  writeSessionMessages(
    toConversationId,
    messages.map((message) => ({ ...message, conversationId: toConversationId })),
  );
  sessionMessagesByConversation.delete(fromConversationId);
}

const PENDING_HOME_AGENT_PROMPT_KEY = 'dvely:pending-home-agent-prompt';
const HOME_CHAT_PROJECT_IDS_KEY = 'dvely:home-chat-project-ids';

function readHomeChatProjectIds(): Set<number> {
  try {
    const raw = sessionStorage.getItem(HOME_CHAT_PROJECT_IDS_KEY);
    if (!raw) return new Set();

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();

    return new Set(
      parsed.filter((id): id is number => typeof id === 'number' && Number.isFinite(id)),
    );
  } catch {
    return new Set();
  }
}

function writeHomeChatProjectIds(ids: Set<number>) {
  sessionStorage.setItem(HOME_CHAT_PROJECT_IDS_KEY, JSON.stringify([...ids]));
}

/** 홈에서 프로젝트를 연결하고 채팅을 보낸 프로젝트 — 목록 클릭 시 상세로 이동 */
export function markHomeChatProject(projectId: number) {
  const ids = readHomeChatProjectIds();
  ids.add(projectId);
  writeHomeChatProjectIds(ids);
}

export function isHomeChatProject(projectId: number): boolean {
  return readHomeChatProjectIds().has(projectId);
}

export function setPendingHomeAgentPrompt(prompt: string) {
  sessionStorage.setItem(PENDING_HOME_AGENT_PROMPT_KEY, prompt.trim());
}

export function consumePendingHomeAgentPrompt(): string | null {
  const value = sessionStorage.getItem(PENDING_HOME_AGENT_PROMPT_KEY);
  if (value) {
    sessionStorage.removeItem(PENDING_HOME_AGENT_PROMPT_KEY);
  }
  return value;
}

const sentHomeAgentPrompts = new Set<string>();

export function shouldSendHomeAgentPromptOnce(prompt: string): boolean {
  const normalized = prompt.trim();
  if (!normalized || sentHomeAgentPrompts.has(normalized)) return false;
  sentHomeAgentPrompts.add(normalized);
  return true;
}

export function clearHomeAgentPromptSendGuard(prompt: string) {
  sentHomeAgentPrompts.delete(prompt.trim());
}

/** 대화·프로젝트 등 제목 필드가 없을 때 표시 */
export function formatUntitledLabel(id: number): string {
  return `제목없음 · ${id}`;
}

export function formatProjectDisplayName(name: string, projectId: number): string {
  const trimmed = name.trim();
  return trimmed ? trimmed : formatUntitledLabel(projectId);
}

export function formatConversationDateLabel(iso: string): string {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return '오늘';
  if (isYesterday) return '어제';

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function formatConversationPreview(iso: string): string {
  if (!iso) return '대화';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '대화';

  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
