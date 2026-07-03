import { RotateCcw } from 'lucide-react';
import type { ConversationResponse } from '@/types/chat.type';
import {
  formatConversationDateLabel,
  formatConversationPreview,
  formatUntitledLabel,
} from '@/components/layout/project/agentChat.utils';

type AgentTrashListPanelProps = {
  conversations: ConversationResponse[];
  isLoading: boolean;
  restoringConversationId: number | null;
  onRestore: (conversationId: number) => void;
};

const skeletonItems = Array.from({ length: 5 }, (_, index) => `trash-list-skeleton-${index}`);

function AgentTrashListPanel({
  conversations,
  isLoading,
  restoringConversationId,
  onRestore,
}: AgentTrashListPanelProps) {
  const isEmpty = !isLoading && conversations.length === 0;

  return (
    <div role="tabpanel" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
      {isLoading ? (
        <ul className="flex flex-col gap-1">
          {skeletonItems.map((key) => (
            <li key={key} className="rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[#e2e8f0]" />
                <div className="h-7 w-14 animate-pulse rounded bg-[#f1f5f9]" />
              </div>
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
            </li>
          ))}
        </ul>
      ) : isEmpty ? (
        <p className="px-1 py-6 text-center text-[12px] text-[#94a3b8]">
          휴지통에 있는 대화가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {conversations.map((conversation) => {
            const isRestoring = restoringConversationId === conversation.conversationId;

            return (
              <li
                key={conversation.conversationId}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-[#f8fafc]"
              >
                <div className="min-w-0 flex-1 px-1 py-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-[#0f172a]">
                      {formatUntitledLabel(conversation.conversationId)}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#94a3b8]">
                      {formatConversationDateLabel(
                        conversation.deletedAt || conversation.updatedAt,
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[#64748b]">
                    {formatConversationPreview(conversation.deletedAt || conversation.updatedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={() => onRestore(conversation.conversationId)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#475569] transition hover:border-[#c4b5fd] hover:text-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw className="size-3" />
                  {isRestoring ? '복구 중' : '복구'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AgentTrashListPanel;
