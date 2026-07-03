import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import githubIcon from '@/assets/icons/github.svg';
import { mockGithubRepositories } from '@/mocks/github/githubRepositories';
import type { GithubRepository } from '@/types/projects.type';

type GithubRepositoryPickerProps = {
  onSelect?: (repository: GithubRepository) => void;
};

function GithubRepositoryPicker({ onSelect }: GithubRepositoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedFullName, setSelectedFullName] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (repository: GithubRepository) => {
      setSelectedFullName(repository.fullName);
      onSelect?.(repository);
      setOpen(false);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={selectedFullName ?? 'GitHub 저장소'}
        className={`flex size-8 items-center justify-center rounded-lg border bg-white transition ${
          open ? 'border-[#0f172a] ring-2 ring-[#0f172a]/10' : 'border-[#e2e8f0] hover:bg-[#f8fafc]'
        }`}
      >
        <img src={githubIcon} alt="" className="size-4" aria-hidden />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
        >
          <div className="border-b border-[#f1f5f9] px-3 py-2.5">
            <p className="text-[13px] font-semibold text-[#0f172a]">GitHub 저장소</p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">연결할 저장소를 선택하세요</p>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-1.5">
            <ul>
              {mockGithubRepositories.map((repo) => {
                const isSelected = selectedFullName === repo.fullName;
                const isPrivate = repo.visibility === 'PRIVATE';

                return (
                  <li key={repo.fullName}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(repo)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                        isSelected ? 'bg-[#eff6ff]' : 'hover:bg-[#f8fafc]'
                      }`}
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
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GithubRepositoryPicker;
