import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Lock, LockOpen, Plus, Unlink } from 'lucide-react';
import githubIcon from '@/assets/icons/github.svg';
import { useGithubRepositoryListQuery } from '@/api/projects';
import {
  parseAlreadyConnectedRepository,
  parseRepositoryApiErrorMessage,
  toSuggestedGithubRepositoryName,
} from '@/components/layout/project/githubRepository.utils';
import type { RepositoryMode } from '@/types/common.enum';
import {
  postProjectRepositoryCreateFormSchema,
  type GithubRepository,
  type PostProjectRepositoryCreateFormType,
} from '@/types/projects.type';
import { cn } from '@/lib/utils';

type GithubRepositoryPickerProps = {
  defaultRepositoryName?: string;
  connectedRepositoryFullName?: string | null;
  isConnected?: boolean;
  isSubmitting?: boolean;
  onSelect?: (repository: GithubRepository) => Promise<void>;
  onCreate?: (params: PostProjectRepositoryCreateFormType) => Promise<void>;
  onDisconnect?: () => Promise<void>;
};

const skeletonItems = Array.from({ length: 4 }, (_, index) => `github-repo-skeleton-${index}`);

function GithubRepositoryPicker({
  defaultRepositoryName,
  connectedRepositoryFullName,
  isConnected = false,
  isSubmitting = false,
  onSelect,
  onCreate,
  onDisconnect,
}: GithubRepositoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<RepositoryMode>('existing');
  const [createForm, setCreateForm] = useState<PostProjectRepositoryCreateFormType>({
    repositoryName: '',
    repositoryVisibility: 'PRIVATE',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedConnectedFullName, setDetectedConnectedFullName] = useState<string | null>(null);

  const nameFieldId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: repositories = [], isLoading } = useGithubRepositoryListQuery('github-picker', {
    enabled: open,
  });
  const trimmedName = createForm.repositoryName.trim();
  const createFormResult = postProjectRepositoryCreateFormSchema.safeParse({
    repositoryName: trimmedName,
    repositoryVisibility: createForm.repositoryVisibility,
  });
  const connectedFullName =
    connectedRepositoryFullName?.trim() || detectedConnectedFullName || null;
  const isBound = isConnected || Boolean(connectedFullName);
  const canCreate = createFormResult.success && !isSubmitting;
  const repositoryNameHint =
    trimmedName.length === 0 || createFormResult.success
      ? '영문, 숫자, 하이픈(-), 밑줄(_), 점(.)만 사용할 수 있습니다.'
      : (createFormResult.error.issues[0]?.message ??
        '영문, 숫자, 하이픈(-), 밑줄(_), 점(.)만 사용할 수 있습니다.');

  const ensureDisconnected = useCallback(async () => {
    if (!isBound) return;
    await onDisconnect?.();
    setDetectedConnectedFullName(null);
  }, [isBound, onDisconnect]);

  const retryAfterAlreadyConnected = useCallback(
    async (error: unknown, retry: () => Promise<void>) => {
      const alreadyConnectedRepo = parseAlreadyConnectedRepository(error);
      if (!alreadyConnectedRepo || !onDisconnect) {
        setErrorMessage(parseRepositoryApiErrorMessage(error));
        return false;
      }

      setDetectedConnectedFullName(alreadyConnectedRepo);

      try {
        await onDisconnect();
        setDetectedConnectedFullName(null);
        await retry();
        return true;
      } catch (retryError) {
        setErrorMessage(parseRepositoryApiErrorMessage(retryError));
        return false;
      }
    },
    [onDisconnect],
  );

  const handleToggleOpen = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }

    const suggestedName = toSuggestedGithubRepositoryName(defaultRepositoryName ?? '');
    setErrorMessage(null);
    setCreateForm({
      repositoryName: suggestedName,
      repositoryVisibility: 'PRIVATE',
    });
    setOpen(true);
  }, [defaultRepositoryName, open]);

  const handleDisconnect = useCallback(async () => {
    if (isSubmitting) return;
    setErrorMessage(null);

    try {
      await onDisconnect?.();
      setDetectedConnectedFullName(null);
    } catch (error) {
      setErrorMessage(parseRepositoryApiErrorMessage(error));
    }
  }, [isSubmitting, onDisconnect]);

  const handleSelect = useCallback(
    async (repository: GithubRepository) => {
      if (isSubmitting) return;
      setErrorMessage(null);

      try {
        if (isBound && connectedFullName !== repository.fullName) {
          await ensureDisconnected();
        }
        await onSelect?.(repository);
        setOpen(false);
      } catch (error) {
        const retried = await retryAfterAlreadyConnected(error, async () => {
          await onSelect?.(repository);
        });
        if (retried) setOpen(false);
      }
    },
    [
      connectedFullName,
      ensureDisconnected,
      isBound,
      isSubmitting,
      onSelect,
      retryAfterAlreadyConnected,
    ],
  );

  const handleCreate = useCallback(async () => {
    const parsedCreateForm = postProjectRepositoryCreateFormSchema.safeParse({
      repositoryName: trimmedName,
      repositoryVisibility: createForm.repositoryVisibility,
    });
    if (!parsedCreateForm.success || isSubmitting) return;

    setErrorMessage(null);

    const createRepository = async () => {
      await onCreate?.(parsedCreateForm.data);
    };

    try {
      await ensureDisconnected();
      await createRepository();
      setOpen(false);
    } catch (error) {
      const retried = await retryAfterAlreadyConnected(error, createRepository);
      if (retried) setOpen(false);
    }
  }, [
    createForm.repositoryVisibility,
    ensureDisconnected,
    isSubmitting,
    onCreate,
    retryAfterAlreadyConnected,
    trimmedName,
  ]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (isSubmitting) return;
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (isSubmitting) return;
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, isSubmitting]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggleOpen}
        disabled={isSubmitting}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={connectedFullName ?? 'GitHub 저장소'}
        className={cn(
          'flex size-8 items-center justify-center rounded-lg border bg-white transition',
          open
            ? 'border-[#0f172a] ring-2 ring-[#0f172a]/10'
            : 'border-[#e2e8f0] hover:bg-[#f8fafc]',
          isSubmitting && 'cursor-not-allowed opacity-60',
        )}
      >
        <img src={githubIcon} alt="" className="size-4" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="GitHub 저장소"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
        >
          <div className="border-b border-[#f1f5f9] px-3 py-2.5">
            <p className="text-[13px] font-semibold text-[#0f172a]">GitHub 저장소</p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">
              기존 저장소를 연결하거나 새로 만들 수 있습니다
            </p>
            {isBound ? (
              <div className="mt-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-2">
                <p className="text-[11px] text-[#64748b]">현재 연결됨</p>
                <p className="truncate text-[12px] font-semibold text-[#0f172a]">
                  {connectedFullName ?? 'GitHub 저장소'}
                </p>
                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  새로 만들거나 다른 저장소를 고르면 기존 연결만 해제됩니다. GitHub 저장소는
                  삭제되지 않습니다.
                </p>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleDisconnect()}
                  className="mt-2 inline-flex h-7 items-center gap-1 rounded-md border border-[#e2e8f0] bg-white px-2 text-[11px] font-semibold text-[#334155] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Unlink className="size-3" aria-hidden />
                  {isSubmitting ? '해제 중…' : '연결 해제'}
                </button>
              </div>
            ) : null}
            {errorMessage ? (
              <p
                className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
            <div
              role="tablist"
              aria-label="저장소 연결 방식"
              className="mt-2.5 grid grid-cols-2 gap-1 rounded-lg bg-[#f1f5f9] p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'existing'}
                onClick={() => setTab('existing')}
                className={cn(
                  'rounded-md px-2 py-1.5 text-[12px] font-semibold transition',
                  tab === 'existing'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:text-[#0f172a]',
                )}
              >
                기존 저장소
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'create'}
                onClick={() => setTab('create')}
                className={cn(
                  'inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-semibold transition',
                  tab === 'create'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#64748b] hover:text-[#0f172a]',
                )}
              >
                <Plus className="size-3" aria-hidden />
                새로 만들기
              </button>
            </div>
          </div>

          {tab === 'existing' ? (
            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {isLoading ? (
                <ul>
                  {skeletonItems.map((key) => (
                    <li key={key} className="rounded-lg px-3 py-2.5">
                      <div className="h-4 w-40 animate-pulse rounded bg-[#e2e8f0]" />
                      <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#f1f5f9]" />
                    </li>
                  ))}
                </ul>
              ) : repositories.length === 0 ? (
                <p className="px-3 py-6 text-center text-[12px] text-[#94a3b8]">
                  연결할 저장소가 없습니다. 새로 만들기를 이용해 주세요.
                </p>
              ) : (
                <ul>
                  {repositories.map((repo) => {
                    const isSelected = connectedFullName === repo.fullName;
                    const isPrivate = repo.visibility === 'PRIVATE';

                    return (
                      <li key={repo.fullName}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={isSubmitting}
                          onClick={() => void handleSelect(repo)}
                          className={cn(
                            'w-full rounded-lg px-3 py-2.5 text-left transition',
                            isSelected ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fafc]',
                            isSubmitting && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-[13px] font-semibold text-[#0f172a]">
                              {repo.fullName}
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-[#64748b]">
                              {isPrivate ? (
                                <Lock className="size-3" aria-hidden />
                              ) : (
                                <LockOpen className="size-3" aria-hidden />
                              )}
                              {isPrivate ? 'Private' : 'Public'}
                            </span>
                          </div>
                          {repo.description ? (
                            <p className="mt-1 line-clamp-2 text-[11px] text-[#64748b]">
                              {repo.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[10px] text-[#94a3b8]">
                            기본 브랜치 · {repo.defaultBranch}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <form
              className="p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreate();
              }}
            >
              <label htmlFor={nameFieldId} className="text-[12px] font-semibold text-[#334155]">
                저장소 이름
              </label>
              <input
                id={nameFieldId}
                type="text"
                value={createForm.repositoryName}
                maxLength={100}
                autoFocus
                disabled={isSubmitting}
                placeholder="예: my-landing-repo"
                onChange={(event) => {
                  setCreateForm((prev) => ({ ...prev, repositoryName: event.target.value }));
                  setErrorMessage(null);
                }}
                className="mt-1.5 block w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[13px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus-visible:border-[#0f172a] focus-visible:ring-2 focus-visible:ring-[#0f172a]/10 disabled:opacity-60"
              />
              <p className="mt-1.5 text-[11px] text-[#94a3b8]">{repositoryNameHint}</p>

              <p className="mt-3 text-[12px] font-semibold text-[#334155]">공개 범위</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setCreateForm((prev) => ({ ...prev, repositoryVisibility: 'PRIVATE' }))
                  }
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[12px] font-semibold transition',
                    createForm.repositoryVisibility === 'PRIVATE'
                      ? 'border-[#0f172a] bg-[#0f172a] text-white'
                      : 'border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]',
                  )}
                >
                  <Lock className="size-3" aria-hidden />
                  Private
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setCreateForm((prev) => ({ ...prev, repositoryVisibility: 'PUBLIC' }))
                  }
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[12px] font-semibold transition',
                    createForm.repositoryVisibility === 'PUBLIC'
                      ? 'border-[#0f172a] bg-[#0f172a] text-white'
                      : 'border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]',
                  )}
                >
                  <LockOpen className="size-3" aria-hidden />
                  Public
                </button>
              </div>

              {isBound ? (
                <p className="mt-3 text-[11px] leading-relaxed text-[#64748b]">
                  만들면{' '}
                  <span className="font-semibold text-[#0f172a]">
                    {connectedFullName ?? '기존 저장소'}
                  </span>{' '}
                  연결이 해제되고 새 저장소가 연결됩니다.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canCreate}
                className={cn(
                  'mt-3 flex h-9 w-full items-center justify-center rounded-lg text-[13px] font-semibold transition',
                  canCreate
                    ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                    : 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]',
                )}
              >
                {isSubmitting ? '처리 중…' : isBound ? '연결 해제 후 만들기' : '저장소 만들기'}
              </button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default GithubRepositoryPicker;
