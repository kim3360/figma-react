import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTrashConversationRestore, useTrashConversationListQuery } from '@/api/chat';
import AgentTrashListPanel from '@/components/layout/project/AgentTrashListPanel';

const TRASH_PAGE_QUERY_KEY = 'trash-page';

function TrashPage() {
  const [restoringConversationId, setRestoringConversationId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: trashConversations = [], isLoading: isTrashLoading } =
    useTrashConversationListQuery(TRASH_PAGE_QUERY_KEY);

  const sortedTrashConversations = useMemo(
    () =>
      [...trashConversations].sort(
        (a, b) =>
          new Date(b.deletedAt || b.updatedAt).getTime() -
          new Date(a.deletedAt || a.updatedAt).getTime(),
      ),
    [trashConversations],
  );

  const invalidateConversationQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ['trash-conversation-list'] });
    void queryClient.invalidateQueries({ queryKey: ['project-conversation-list'] });
  };

  const restoreConversationMutation = useMutation({
    mutationFn: postTrashConversationRestore,
    onMutate: (conversationId) => {
      setRestoringConversationId(conversationId);
    },
    onSuccess: () => {
      invalidateConversationQueries();
    },
    onSettled: () => {
      setRestoringConversationId(null);
    },
  });

  const handleRestoreChat = (conversationId: number) => {
    if (restoringConversationId !== null) return;
    restoreConversationMutation.mutate(conversationId);
  };

  return (
    <div className="min-h-full bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-[960px] flex-col gap-4">
        <header>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">휴지통</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">
            삭제한 에이전트 대화를 확인하고 복구할 수 있습니다.
          </p>
        </header>

        <section className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
          <AgentTrashListPanel
            conversations={sortedTrashConversations}
            isLoading={isTrashLoading}
            restoringConversationId={restoringConversationId}
            onRestore={handleRestoreChat}
          />
        </section>
      </div>
    </div>
  );
}

export default TrashPage;
