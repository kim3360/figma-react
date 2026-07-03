import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Code,
  MessageSquare,
  Pencil,
  RefreshCw,
  RotateCcw,
  Share2,
} from 'lucide-react';
import {
  deleteConversation,
  getConversationMessageList,
  useProjectConversationListQuery,
} from '@/api/chat';
import type { GetProjectDetailResType, GithubRepository } from '@/types/projects.type';
import {
  AGENT_CHAT_QUERY_KEY,
  consumePendingHomeAgentPrompt,
  formatProjectDisplayName,
  readSessionMessages,
} from '@/components/layout/project/agentChat.utils';
import {
  deriveAgentPreviewPhase,
  deriveAgentPreviewUrl,
} from '@/components/layout/project/agentPreview.utils';
import AgentChatListPanel from '@/components/layout/project/AgentChatListPanel';
import AgentConversationPanel from '@/components/layout/project/AgentConversationPanel';
import AgentSitePreviewPanel from '@/components/layout/project/AgentSitePreviewPanel';
import GithubRepositoryPicker from '@/components/layout/project/GithubRepositoryPicker';
import ProjectCodeExplorerPanel from '@/components/layout/project/ProjectCodeExplorerPanel';
import ProjectPipelinePanel from '@/components/layout/project/ProjectPipelinePanel';
import { createIdlePipelineRun, runPipelineSequence } from '@/lib/projectPipelineRunner';
import type { PipelineRun } from '@/mocks/project/pipeline';
import { useHorizontalPanelResize } from '@/hooks/useHorizontalPanelResize';
import { cn } from '@/lib/utils';

const AGENT_CHAT_PANEL_MIN_WIDTH = 280;
const AGENT_CHAT_PANEL_MAX_WIDTH = 640;
const AGENT_CHAT_PANEL_DEFAULT_WIDTH = 380;

type AgentSidebarTab = 'list' | 'conversation';
type RightPanelView = 'preview' | 'code' | 'pipeline';

type ProjectAgentPageProps = {
  projectId: number;
  project: GetProjectDetailResType;
};

function ProjectAgentPage({ projectId, project }: ProjectAgentPageProps) {
  const [homePrompt] = useState(() => consumePendingHomeAgentPrompt());
  const [sidebarTab, setSidebarTab] = useState<AgentSidebarTab>('conversation');
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isNewConversation, setIsNewConversation] = useState(() => homePrompt !== null);
  const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);
  const [connectedRepo, setConnectedRepo] = useState<GithubRepository | null>(null);
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('preview');
  const [previewRevision, setPreviewRevision] = useState(0);
  const [pipelineRun, setPipelineRun] = useState<PipelineRun>(() => createIdlePipelineRun());
  const pipelineAbortRef = useRef<AbortController | null>(null);

  const { width: chatPanelWidth, handleResizeStart: handleChatPanelResizeStart } =
    useHorizontalPanelResize({
      defaultWidth: AGENT_CHAT_PANEL_DEFAULT_WIDTH,
      minWidth: AGENT_CHAT_PANEL_MIN_WIDTH,
      maxWidth: AGENT_CHAT_PANEL_MAX_WIDTH,
    });

  const queryClient = useQueryClient();

  const isPipelineRunning = pipelineRun.status === 'running';

  const handleDeployPipelineStart = useCallback(async () => {
    pipelineAbortRef.current?.abort();
    const controller = new AbortController();
    pipelineAbortRef.current = controller;
    setRightPanelView('pipeline');

    try {
      await runPipelineSequence(setPipelineRun, { signal: controller.signal });
    } finally {
      if (pipelineAbortRef.current === controller) {
        pipelineAbortRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      pipelineAbortRef.current?.abort();
    };
  }, []);

  const { data: conversations = [], isLoading: isConversationsLoading } =
    useProjectConversationListQuery(AGENT_CHAT_QUERY_KEY, projectId);

  const activeConversations = useMemo(
    () =>
      [...conversations]
        .filter((conversation) => !conversation.deleted)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [conversations],
  );

  const previewPhase = useMemo(() => {
    void previewRevision;

    if (isNewConversation || activeConversationId === null) {
      return deriveAgentPreviewPhase([]);
    }

    return deriveAgentPreviewPhase(readSessionMessages(activeConversationId));
  }, [activeConversationId, isNewConversation, previewRevision]);

  const previewUrl = useMemo(() => {
    void previewRevision;

    if (isNewConversation || activeConversationId === null) {
      return deriveAgentPreviewUrl([]);
    }

    return deriveAgentPreviewUrl(readSessionMessages(activeConversationId));
  }, [activeConversationId, isNewConversation, previewRevision]);

  const handleConversationActivity = (conversationId: number) => {
    if (conversationId === activeConversationId) {
      setPreviewRevision((revision) => revision + 1);
    }
  };

  const invalidateConversationQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: ['project-conversation-list', AGENT_CHAT_QUERY_KEY, projectId],
    });
    void queryClient.invalidateQueries({
      queryKey: ['trash-conversation-list', AGENT_CHAT_QUERY_KEY],
    });
  };

  const deleteConversationMutation = useMutation({
    mutationFn: deleteConversation,
    onMutate: (conversationId) => {
      setDeletingConversationId(conversationId);
    },
    onSuccess: (_, conversationId) => {
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setIsNewConversation(false);
        if (sidebarTab === 'conversation') {
          setSidebarTab('list');
        }
      }
      invalidateConversationQueries();
    },
    onSettled: () => {
      setDeletingConversationId(null);
    },
  });

  const handleDeleteChat = (conversationId: number) => {
    if (deletingConversationId !== null) return;
    deleteConversationMutation.mutate(conversationId);
  };

  const tabButtonClass = (isActive: boolean) =>
    `flex flex-1 items-center justify-center gap-1 border-b-2 px-1.5 py-2.5 text-[11px] font-semibold transition ${
      isActive
        ? 'border-[#7c3aed] text-[#7c3aed]'
        : 'border-transparent text-[#94a3b8] hover:text-[#64748b]'
    }`;

  return (
    <div className="flex h-[calc(100vh)] min-h-0 w-full overflow-hidden bg-[#f4f5f7]">
      <section
        className="relative flex shrink-0 flex-col border-r border-[#e2e8f0] bg-white"
        style={{ width: chatPanelWidth }}
      >
        <header className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-3">
          <h1 className="text-[14px] font-bold text-[#0f172a]">SYS.AI Agent</h1>
          <button type="button" className="text-[12px] font-medium text-[#7c3aed] hover:underline">
            도움말 보기
          </button>
        </header>

        <div
          role="tablist"
          aria-label="에이전트 사이드바"
          className="flex border-b border-[#f1f5f9] px-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={sidebarTab === 'list'}
            onClick={() => setSidebarTab('list')}
            className={tabButtonClass(sidebarTab === 'list')}
          >
            <MessageSquare className="size-3.5 shrink-0" />
            채팅 목록
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sidebarTab === 'conversation'}
            onClick={() => setSidebarTab('conversation')}
            className={tabButtonClass(sidebarTab === 'conversation')}
          >
            대화
          </button>
        </div>

        {sidebarTab === 'list' ? (
          <AgentChatListPanel
            conversations={activeConversations}
            isLoading={isConversationsLoading}
            deletingConversationId={deletingConversationId}
            activeConversationId={activeConversationId}
            onSelectChat={(conversationId) => {
              setIsNewConversation(false);
              setActiveConversationId(conversationId);
              setSidebarTab('conversation');
              setPreviewRevision((revision) => revision + 1);
              void queryClient.prefetchQuery({
                queryKey: ['conversation-message-list', AGENT_CHAT_QUERY_KEY, conversationId],
                queryFn: () => getConversationMessageList(conversationId),
              });
            }}
            onDeleteChat={handleDeleteChat}
            onNewChat={() => {
              setIsNewConversation(true);
              setActiveConversationId(null);
              setSidebarTab('conversation');
            }}
          />
        ) : (
          <AgentConversationPanel
            key={String(activeConversationId ?? 'new')}
            projectId={projectId}
            projectName={formatProjectDisplayName(project.name, project.projectId)}
            conversationId={activeConversationId}
            isNewConversation={isNewConversation}
            initialPrompt={isNewConversation ? homePrompt : null}
            onConversationCreated={(conversationId) => {
              setActiveConversationId(conversationId);
              setIsNewConversation(false);
              setPreviewRevision((revision) => revision + 1);
            }}
            onConversationActivity={handleConversationActivity}
            onDeployPipelineStart={handleDeployPipelineStart}
          />
        )}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="채팅 패널 너비 조절"
          onPointerDown={handleChatPanelResizeStart}
          className={cn(
            'absolute -right-1 top-0 z-20 h-full w-2 touch-none',
            'cursor-col-resize bg-transparent',
            'hover:bg-[#7c3aed]/15 active:bg-[#7c3aed]/25',
          )}
        />
      </section>

      <section className="flex min-w-0 flex-1 flex-col bg-[#ececee]">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] bg-white px-4 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link
              to="/project/$slug"
              params={{ slug: String(projectId) }}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f8fafc]"
              aria-label="프로젝트 상세로"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <div className="flex min-w-0 items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-1">
              <button type="button" className="rounded p-1.5 text-[#94a3b8] hover:bg-white">
                <ChevronLeft className="size-3.5" />
              </button>
              <button type="button" className="rounded p-1.5 text-[#94a3b8] hover:bg-white">
                <ChevronRight className="size-3.5" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-[#94a3b8] hover:bg-white"
                aria-label="새로고침"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRightPanelView((view) => (view === 'code' ? 'preview' : 'code'))}
                aria-label="코드 보기"
                aria-pressed={rightPanelView === 'code'}
                className={cn(
                  'rounded p-1.5 transition',
                  rightPanelView === 'code'
                    ? 'bg-white text-[#0f172a] shadow-sm ring-1 ring-[#e2e8f0]'
                    : 'text-[#94a3b8] hover:bg-white',
                )}
              >
                <Code className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5">
              <span className="truncate text-[12px] text-[#64748b]">
                {connectedRepo
                  ? `/${connectedRepo.fullName}`
                  : previewPhase === 'ready'
                    ? previewUrl
                    : '/'}
              </span>
            </div>
            <span className="hidden shrink-0 rounded-full bg-[#ede9fe] px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed] sm:inline">
              preview branch
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GithubRepositoryPicker onSelect={(repository) => setConnectedRepo(repository)} />
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[12px] font-semibold text-[#334155]"
            >
              <Share2 className="size-3.5" />
              Share
            </button>
            <button
              type="button"
              onClick={() =>
                setRightPanelView((view) => (view === 'pipeline' ? 'preview' : 'pipeline'))
              }
              aria-pressed={rightPanelView === 'pipeline'}
              className={cn(
                'inline-flex h-8 items-center rounded-lg px-3 text-[12px] font-semibold transition',
                rightPanelView === 'pipeline'
                  ? 'bg-[#1e293b] text-white ring-2 ring-[#0f172a]/20 ring-offset-1'
                  : 'bg-[#0f172a] text-white hover:bg-[#1e293b]',
              )}
            >
              게시
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-3 text-[12px] font-semibold text-[#334155]"
            >
              <Pencil className="size-3.5" />
              편집
            </button>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b]"
              aria-label="새로고침"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </header>

        {rightPanelView === 'code' ? (
          <ProjectCodeExplorerPanel />
        ) : rightPanelView === 'pipeline' ? (
          <ProjectPipelinePanel run={pipelineRun} isRunning={isPipelineRunning} />
        ) : (
          <AgentSitePreviewPanel phase={previewPhase} previewUrl={previewUrl} />
        )}
      </section>
    </div>
  );
}

export default ProjectAgentPage;
