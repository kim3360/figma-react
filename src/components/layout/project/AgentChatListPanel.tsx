import { Plus, Trash2 } from 'lucide-react';
import type { ConversationResponse } from '@/types/chat.type';
import {
  formatConversationDateLabel,
  formatConversationPreview,
  formatUntitledLabel,
} from '@/components/layout/project/agentChat.utils';

type AgentChatListPanelProps = {
  conversations: ConversationResponse[];
  isLoading: boolean;
  deletingConversationId: number | null;
  activeConversationId: number | null;
  onSelectChat: (conversationId: number) => void;
  onDeleteChat: (conversationId: number) => void;
  onNewChat: () => void;
};

const skeletonItems = Array.from({ length: 5 }, (_, index) => `chat-list-skeleton-${index}`);

function AgentChatListPanel({
  conversations,
  isLoading,
  deletingConversationId,
  activeConversationId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: AgentChatListPanelProps) {
  const isEmpty = !isLoading && conversations.length === 0;

  return (
    <div role="tabpanel" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
      <button
        type="button"
        onClick={onNewChat}
        className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#c4b5fd] bg-[#faf5ff] px-3 py-2 text-[12px] font-semibold text-[#7c3aed] transition hover:bg-[#f3e8ff]"
      >
        <Plus className="size-3.5" />새 대화
      </button>

      {isLoading ? (
        <ul className="flex flex-col gap-1">
          {skeletonItems.map((key) => (
            <li key={key} className="rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="h-3 w-8 animate-pulse rounded bg-[#f1f5f9]" />
              </div>
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
            </li>
          ))}
        </ul>
      ) : isEmpty ? (
        <p className="px-1 py-6 text-center text-[12px] text-[#94a3b8]">아직 대화가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {conversations.map((conversation) => {
            const isActive = conversation.conversationId === activeConversationId;
            const isDeleting = deletingConversationId === conversation.conversationId;

            return (
              <li
                key={conversation.conversationId}
                className={`flex items-stretch gap-0.5 rounded-lg transition ${
                  isActive ? 'bg-[#ede9fe] ring-1 ring-[#c4b5fd]' : 'hover:bg-[#f8fafc]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectChat(conversation.conversationId)}
                  className="flex min-w-0 flex-1 flex-col px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 truncate text-[13px] font-semibold text-[#0f172a]">
                      {formatUntitledLabel(conversation.conversationId)}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#94a3b8]">
                      {formatConversationDateLabel(conversation.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[#64748b]">
                    {formatConversationPreview(conversation.updatedAt)}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => onDeleteChat(conversation.conversationId)}
                  aria-label="대화 삭제"
                  className="flex shrink-0 items-center justify-center self-center rounded-lg px-2 py-2 text-[#94a3b8] transition hover:bg-white hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AgentChatListPanel;
