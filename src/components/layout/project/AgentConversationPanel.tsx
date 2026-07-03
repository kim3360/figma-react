import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, SendHorizontal, X } from 'lucide-react';
import { postConversationMessageCreate, postProjectConversationCreate } from '@/api/chat';
import type { ConversationMessage } from '@/types/chat.type';
import {
  AGENT_CHAT_QUERY_KEY,
  clearHomeAgentPromptSendGuard,
  migrateSessionMessages,
  readSessionMessages,
  shouldSendHomeAgentPromptOnce,
  writeSessionMessages,
} from '@/components/layout/project/agentChat.utils';
import {
  createLocalMessage,
  getMessageReviewStatus,
  hasPendingMessageReview,
  isDeployApprovalMessage,
  isMockAssistantReplyPending,
  MOCK_NEW_PORTFOLIO_USER_PROMPT,
  MOCK_REPO_EDIT_USER_PROMPT,
  resolveMockScriptReview,
  scheduleMockAssistantReply,
  setMessageReviewStatus,
  setMockAssistantReplyListener,
  type MessageReviewStatus,
} from '@/mocks/chat/agentChatMocks';

const suggestedPrompts = [
  {
    label: '포트폴리오 만들기',
    prompt: MOCK_NEW_PORTFOLIO_USER_PROMPT,
  },
  {
    label: '기존 레포 수정',
    prompt: MOCK_REPO_EDIT_USER_PROMPT,
  },
] as const;

type AgentConversationPanelProps = {
  projectId: number;
  projectName: string;
  conversationId: number | null;
  isNewConversation: boolean;
  initialPrompt?: string | null;
  onConversationCreated: (conversationId: number) => void;
  onConversationActivity?: (conversationId: number) => void;
  /** 배포 제안(약 2~3분) 수락 시 파이프라인 실행 */
  onDeployPipelineStart?: () => Promise<void>;
};

function AgentConversationPanel({
  projectId,
  projectName,
  conversationId,
  isNewConversation,
  initialPrompt,
  onConversationCreated,
  onConversationActivity,
  onDeployPipelineStart,
}: AgentConversationPanelProps) {
  const [input, setInput] = useState('');
  const [displayMessages, setDisplayMessages] = useState<ConversationMessage[]>([]);
  const [isAssistantReplying, setIsAssistantReplying] = useState(false);
  const [reviewRevision, setReviewRevision] = useState(0);

  const queryClient = useQueryClient();
  const activeConversationIdRef = useRef(conversationId);
  const isMountedRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousConversationIdRef = useRef(conversationId);
  const onConversationActivityRef = useRef(onConversationActivity);

  activeConversationIdRef.current = conversationId;
  onConversationActivityRef.current = onConversationActivity;

  const notifyConversationActivity = (targetConversationId: number) => {
    onConversationActivityRef.current?.(targetConversationId);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (isNewConversation || conversationId === null) {
        const created = await postProjectConversationCreate(projectId);
        await postConversationMessageCreate(created.conversationId, { content });
        return created.conversationId;
      }

      await postConversationMessageCreate(conversationId, { content });
      return conversationId;
    },
    onMutate: (content) => {
      const draftConversationId = conversationId ?? 0;
      const userMessage = createLocalMessage(draftConversationId, 'user', content);
      setDisplayMessages((prev) => {
        const next = [...prev, userMessage];
        writeSessionMessages(draftConversationId, next);
        return next;
      });
      setInput('');
      return { content, userMessage, draftConversationId };
    },
    onSuccess: (targetConversationId, content, context) => {
      if (context?.userMessage && context.draftConversationId !== targetConversationId) {
        migrateSessionMessages(context.draftConversationId, targetConversationId);
      }

      const sessionMessages = readSessionMessages(targetConversationId);
      setDisplayMessages(sessionMessages);

      if (isNewConversation || conversationId === null) {
        onConversationCreated(targetConversationId);
      }

      void queryClient.invalidateQueries({
        queryKey: ['project-conversation-list', AGENT_CHAT_QUERY_KEY, projectId],
      });

      if (!context?.userMessage) return;

      setIsAssistantReplying(true);
      scheduleMockAssistantReply({
        conversationId: targetConversationId,
        userMessageId: context.userMessage.messageId,
        content,
      });
      notifyConversationActivity(targetConversationId);
    },
    onError: (_error, content, context) => {
      setInput(content);
      if (context?.userMessage) {
        setDisplayMessages((prev) =>
          prev.filter((message) => message.messageId !== context.userMessage.messageId),
        );
      }
      setIsAssistantReplying(false);
    },
  });

  const isSending = sendMessageMutation.isPending;
  const hasPendingReview = useMemo(
    () => hasPendingMessageReview(displayMessages),
    [displayMessages, reviewRevision],
  );
  const isInputLocked = isSending || isAssistantReplying || hasPendingReview;
  const showWelcome =
    isNewConversation && !isSending && !isAssistantReplying && displayMessages.length === 0;

  const handleSend = () => {
    const content = input.trim();
    if (!content || isInputLocked) return;

    sendMessageMutation.mutate(content);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReviewDecision = async (
    messageId: number,
    status: Exclude<MessageReviewStatus, 'pending'>,
  ) => {
    setMessageReviewStatus(messageId, status);
    setReviewRevision((revision) => revision + 1);

    if (conversationId === null || status !== 'accepted') return;

    const shouldRunDeployPipeline =
      isDeployApprovalMessage(messageId) && onDeployPipelineStart !== undefined;

    if (shouldRunDeployPipeline) {
      setIsAssistantReplying(true);
    }

    try {
      await resolveMockScriptReview(conversationId, messageId, status, {
        runDeployPipeline: shouldRunDeployPipeline ? onDeployPipelineStart : undefined,
      });
    } finally {
      setIsAssistantReplying(isMockAssistantReplyPending(conversationId));
    }
  };

  const syncConversationView = (targetConversationId: number | null) => {
    if (targetConversationId !== null) {
      setDisplayMessages(readSessionMessages(targetConversationId));
      setIsAssistantReplying(isMockAssistantReplyPending(targetConversationId));
    } else {
      setDisplayMessages([]);
      setIsAssistantReplying(false);
    }
    setInput('');
  };

  const scrollToLatestMessage = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    isMountedRef.current = true;

    setMockAssistantReplyListener((targetConversationId, messages) => {
      if (!isMountedRef.current) return;
      if (activeConversationIdRef.current !== targetConversationId) return;

      setDisplayMessages(messages);
      setIsAssistantReplying(isMockAssistantReplyPending(targetConversationId));
      setReviewRevision((revision) => revision + 1);
      notifyConversationActivity(targetConversationId);
    });

    return () => {
      isMountedRef.current = false;
      setMockAssistantReplyListener(null);
    };
  }, []);

  useEffect(() => {
    syncConversationView(conversationId);
  }, [conversationId, isNewConversation]);

  useEffect(() => {
    const content = initialPrompt?.trim();
    if (!content || !shouldSendHomeAgentPromptOnce(content)) return;

    sendMessageMutation.mutate(content, {
      onError: () => clearHomeAgentPromptSendGuard(content),
    });
  }, [initialPrompt]);

  useEffect(() => {
    const isConversationSwitch = previousConversationIdRef.current !== conversationId;
    previousConversationIdRef.current = conversationId;

    const frameId = window.requestAnimationFrame(() => {
      scrollToLatestMessage(isConversationSwitch ? 'instant' : 'smooth');
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [conversationId, displayMessages, isAssistantReplying, reviewRevision]);

  return (
    <>
      <div role="tabpanel" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {showWelcome ? (
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-3 text-[13px] leading-relaxed text-[#475569]">
              안녕하세요! <span className="font-semibold text-[#0f172a]">{projectName}</span>{' '}
              워크스페이스입니다. 메시지를 입력하면 대화가 시작됩니다.
            </div>
          ) : null}
          {displayMessages.map((message) => (
            <MessageBubble
              key={message.messageId}
              message={message}
              reviewStatus={
                message.role === 'assistant' ? getMessageReviewStatus(message.messageId) : null
              }
              onReviewDecision={handleReviewDecision}
            />
          ))}
          {isAssistantReplying ? (
            <div className="px-3.5 py-3 text-[13px] text-[#94a3b8]">
              SYS.AI Agent가 답변을 작성 중입니다...
            </div>
          ) : null}
          <div ref={messagesEndRef} aria-hidden="true" className="h-px shrink-0" />
        </div>
      </div>

      <footer className="border-t border-[#f1f5f9] p-3">
        {hasPendingReview ? (
          <p className="mb-2 px-1 text-[11px] text-[#94a3b8]">
            에이전트 제안을 수락하거나 거절한 뒤 다음 메시지를 보낼 수 있습니다.
          </p>
        ) : null}
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestedPrompts.map(({ label, prompt }) => (
            <button
              key={label}
              type="button"
              disabled={isInputLocked}
              onClick={() => setInput(prompt)}
              className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#475569] transition hover:border-[#c4b5fd] hover:text-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 focus-within:border-[#a5b4fc] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6366f1]/15">
          <textarea
            rows={2}
            value={input}
            disabled={isInputLocked}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasPendingReview ? '제안 검토 후 메시지를 보낼 수 있습니다' : '메시지를 입력하세요'
            }
            className="min-h-[40px] flex-1 resize-none bg-transparent text-[13px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] disabled:opacity-60"
          />
          <button
            type="button"
            disabled={!input.trim() || isInputLocked}
            onClick={handleSend}
            className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#7c3aed] text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="전송"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </footer>
    </>
  );
}

type MessageBubbleProps = {
  message: ConversationMessage;
  reviewStatus: MessageReviewStatus | null;
  onReviewDecision: (messageId: number, status: Exclude<MessageReviewStatus, 'pending'>) => void;
};

const MESSAGE_URL_REGEX = /(https?:\/\/[^\s]+)/g;

function normalizeMessageUrl(url: string) {
  return url.replace(/[.,;:!?)]+$/, '');
}

function linkifyMessageContent(content: string, linkClassName: string) {
  return content.split(MESSAGE_URL_REGEX).map((part, index) => {
    if (!part.startsWith('http://') && !part.startsWith('https://')) {
      return part;
    }

    const href = normalizeMessageUrl(part);

    return (
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {part}
      </a>
    );
  });
}

function MessageBubble({ message, reviewStatus, onReviewDecision }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const linkClassName = isUser
    ? 'underline underline-offset-2 hover:text-[#5b21b6]'
    : 'text-[#7c3aed] underline underline-offset-2 hover:text-[#6d28d9]';

  return (
    <div className={isUser ? 'ml-6' : undefined}>
      <div
        className={`text-[13px] leading-relaxed ${
          isUser
            ? 'rounded-xl border border-[#c4b5fd] bg-[#ede9fe] px-3.5 py-3 text-[#4c1d95]'
            : isAssistant
              ? `px-3.5 py-3 text-[#475569] ${
                  reviewStatus === 'rejected' ? 'opacity-60 line-through' : ''
                }`
              : 'rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-3 text-[#64748b]'
        }`}
      >
        <p className="whitespace-pre-wrap">
          {linkifyMessageContent(message.content, linkClassName)}
        </p>
      </div>

      {isAssistant && reviewStatus === 'pending' ? (
        <div className="mt-2 flex items-center gap-2 px-3.5">
          <button
            type="button"
            onClick={() => onReviewDecision(message.messageId, 'rejected')}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-[#e2e8f0] bg-white px-2.5 text-[11px] font-semibold text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#334155]"
          >
            <X className="size-3" />
            거절
          </button>
          <button
            type="button"
            onClick={() => onReviewDecision(message.messageId, 'accepted')}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[#0f172a] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1e293b]"
          >
            <Check className="size-3" />
            수락
          </button>
        </div>
      ) : null}

      {isAssistant && reviewStatus === 'accepted' ? (
        <div className="mt-1.5 flex items-center gap-1 px-3.5 text-[11px] font-medium text-[#16a34a]">
          <Check className="size-3" />
          수락됨
        </div>
      ) : null}

      {isAssistant && reviewStatus === 'rejected' ? (
        <div className="mt-1.5 flex items-center gap-1 px-3.5 text-[11px] font-medium text-[#94a3b8]">
          <X className="size-3" />
          거절됨
        </div>
      ) : null}
    </div>
  );
}

export default AgentConversationPanel;
