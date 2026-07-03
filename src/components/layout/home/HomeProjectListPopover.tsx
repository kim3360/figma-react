import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { fetchGitHubAppInstallUrl } from '@/api/auth';
import { useProjectListQuery } from '@/api/projects';
import {
  GITHUB_APP_INSTALL_POPUP_NAME,
  GITHUB_APP_INSTALL_SUCCESS_MESSAGE,
  GITHUB_OAUTH_POPUP_FEATURES,
} from '@/constants/githubOAuth';
import { formatProjectDisplayName } from '@/components/layout/project/agentChat.utils';
import type { DeployStatus } from '@/types/common.enum';
import { cn } from '@/lib/utils';

type ProjectListItem = {
  projectId: number;
  name: string;
  deployStatus: DeployStatus;
  currentUrl: string | null;
  updatedAtRelativeText: string;
};

const DEPLOY_STATUS_LABEL: Record<DeployStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: '배포 중',
  PREVIEW_READY: '미리보기',
  LIVE: 'Live',
  FAILED: '실패',
};

type HomeProjectListPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  onSelect?: (project: ProjectListItem) => void;
  selectedProjectId?: number | null;
  panelAlign?: 'left' | 'right';
};

function ProjectListSkeleton() {
  return (
    <ul className="space-y-2 p-1">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="animate-pulse rounded-lg bg-[#f1f5f9] px-3 py-3">
          <div className="h-3.5 w-2/3 rounded bg-[#e2e8f0]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#e2e8f0]" />
        </li>
      ))}
    </ul>
  );
}

function HomeProjectListPopover({
  open,
  onOpenChange,
  trigger,
  onSelect,
  selectedProjectId = null,
  panelAlign = 'left',
}: HomeProjectListPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProjectListQuery('home-project-picker', { enabled: open });

  const errorMessage = error instanceof Error ? error.message : '';

  const [isInstallLoading, setIsInstallLoading] = useState(false);

  const handleSelect = (project: ProjectListItem) => {
    onSelect?.(project);
    onOpenChange(false);
  };

  const handleAppInstallMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GITHUB_APP_INSTALL_SUCCESS_MESSAGE) return;
      void refetch();
    },
    [refetch],
  );

  useEffect(() => {
    window.addEventListener('message', handleAppInstallMessage);
    return () => window.removeEventListener('message', handleAppInstallMessage);
  }, [handleAppInstallMessage]);

  const handleGrantPermission = async () => {
    setIsInstallLoading(true);
    try {
      const result = await fetchGitHubAppInstallUrl();
      if (!result?.data?.url) return;

      const popup = window.open(result.data.url, GITHUB_APP_INSTALL_POPUP_NAME, GITHUB_OAUTH_POPUP_FEATURES);
      if (!popup) throw new Error('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.');
    } finally {
      setIsInstallLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={containerRef} className="relative">
      {trigger}

      {open ? (
        <div
          role="listbox"
          className={cn(
            'absolute top-[calc(100%+8px)] z-999 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]',
            panelAlign === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div className="border-b border-[#f1f5f9] px-3 py-2.5">
            <p className="text-[13px] font-semibold text-[#0f172a]">프로젝트</p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">연결할 프로젝트를 선택하세요</p>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-1.5">
            {isLoading ? <ProjectListSkeleton /> : null}

            {!isLoading && isError ? (
              <p className="px-4 py-6 text-center text-[13px] text-[#64748b]">
                프로젝트 목록을 불러오지 못했습니다.
                {errorMessage ? (
                  <span className="mt-1 block text-[12px] text-[#94a3b8]">{errorMessage}</span>
                ) : null}
              </p>
            ) : null}

            {!isLoading && !isError && projects.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-[#64748b]">
                표시할 프로젝트가 없습니다.
              </p>
            ) : null}

            {!isLoading && !isError && projects.length > 0 ? (
              <ul>
                {projects.map((project) => {
                  const isSelected = selectedProjectId === project.projectId;
                  const displayName = formatProjectDisplayName(project.name, project.projectId);
                  const subtitle = project.currentUrl?.trim() || '배포되지 않음';

                  return (
                    <li key={project.projectId}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(project)}
                        className={cn(
                          'w-full rounded-lg px-3 py-2.5 text-left transition',
                          isSelected ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fafc]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[13px] font-semibold text-[#0f172a]">
                            {displayName}
                          </p>
                          <span className="inline-flex shrink-0 rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium text-[#64748b]">
                            {DEPLOY_STATUS_LABEL[project.deployStatus]}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] text-[#64748b]">{subtitle}</p>
                        <p className="mt-1 text-[10px] text-[#94a3b8]">
                          마지막 수정 · {project.updatedAtRelativeText}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {open && !isLoading ? (
              <div className="mt-2 border-t border-[#f1f5f9] pt-2">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="block w-full py-1.5 text-center text-[12px] font-medium text-[#7c3aed] hover:underline"
                >
                  다시 불러오기
                </button>
                <button
                  type="button"
                  onClick={() => void handleGrantPermission()}
                  disabled={isInstallLoading}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] py-2 text-[12px] font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50"
                >
                  <ExternalLink size={12} />
                  {isInstallLoading ? '로딩 중...' : 'GitHub 저장소 권한 설정'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default HomeProjectListPopover;
