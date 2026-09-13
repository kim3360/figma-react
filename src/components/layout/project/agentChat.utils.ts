import type { ConversationMessage } from '@/types/chat.type';

let localMessageId = -1;

type CreateLocalMessageOptions = {
  tokenCount?: number;
  taskId?: string | null;
};

export function createLocalMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
  options: CreateLocalMessageOptions = {},
): ConversationMessage {
  const messageId = localMessageId;
  localMessageId -= 1;
  const tokenCount = options.tokenCount ?? (role === 'assistant' ? 96 : 0);

  return {
    messageId,
    conversationId,
    role,
    content,
    tokenCount,
    createdAt: new Date().toISOString(),
    taskId: options.taskId ?? null,
    // 서버가 붙이는 값이다. 화면이 만든 임시 메시지에는 종류가 없고, 없으면
    // 지금까지와 똑같은 평범한 줄로 그려진다
    kind: null,
  };
}

export const AGENT_CHAT_QUERY_KEY = 'project-agent';

const sessionMessagesByConversation = new Map<number, ConversationMessage[]>();
const taskIdByConversation = new Map<number, string>();

export function readSessionMessages(conversationId: number): ConversationMessage[] {
  return sessionMessagesByConversation.get(conversationId) ?? [];
}

export function writeSessionMessages(conversationId: number, messages: ConversationMessage[]) {
  sessionMessagesByConversation.set(conversationId, messages);
}

export function rememberConversationTaskId(conversationId: number, taskId: string) {
  const trimmed = taskId.trim();
  if (!trimmed) return;
  taskIdByConversation.set(conversationId, trimmed);
}

export function readConversationTaskId(conversationId: number | null) {
  if (conversationId == null) return null;
  return taskIdByConversation.get(conversationId) ?? null;
}

/** 서버 메시지에 세션의 승인 버튼 상태·아직 저장 안 된 로컬 메시지를 합친다. */
export function mergeConversationMessages(
  serverMessages: ConversationMessage[],
  sessionMessages: ConversationMessage[],
): ConversationMessage[] {
  const usedSessionIds = new Set<number>();

  const takeSessionMatch = (message: ConversationMessage) => {
    const byId = sessionMessages.find(
      (sessionMessage) => sessionMessage.messageId === message.messageId,
    );
    if (byId) {
      usedSessionIds.add(byId.messageId);
      return byId;
    }

    const byContent = sessionMessages.find(
      (sessionMessage) =>
        !usedSessionIds.has(sessionMessage.messageId) &&
        sessionMessage.role === message.role &&
        sessionMessage.content === message.content,
    );
    if (byContent) {
      usedSessionIds.add(byContent.messageId);
      return byContent;
    }

    return null;
  };

  const mergedServer = serverMessages.map((message) => {
    const sessionMessage = takeSessionMatch(message);
    if (!sessionMessage) return message;

    return {
      ...message,
      taskId: sessionMessage.taskId || message.taskId,
    };
  });

  const localOnly = sessionMessages.filter((message) => !usedSessionIds.has(message.messageId));

  // 승인 UI는 여기서 만들지 않는다 — 무엇이 승인 대기인지는 서버(태스크의 pendingApprovalId
  // → 승인 상세)만 알고 있다. 예전에는 본문에 '승인 후 실행'과 '[숫자]'가 있으면 버튼을 붙였는데,
  // 모델이 그 문장을 지어내면 존재하지 않는 승인 버튼이 그대로 떴다.
  return [...mergedServer, ...localOnly];
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
