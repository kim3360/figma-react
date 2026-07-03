import { useCallback, useEffect, useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FolderPlus, X } from 'lucide-react';
import { postProjectCreate } from '@/api/projects';
import { cn } from '@/lib/utils';

type ProjectCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ProjectCreateDialog({ open, onOpenChange }: ProjectCreateDialogProps) {
  const titleFieldId = useId();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length >= 2 && !isSubmitting;

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await postProjectCreate({
        name: trimmedName,
        startMode: 'blank',
        templateType: null,
        draftMode: 'fast',
      });

      await queryClient.invalidateQueries({ queryKey: ['project-list'] });
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '프로젝트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setName('');
    setErrorMessage(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-create-title"
        className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#475569] disabled:opacity-50"
        >
          <X className="size-[18px]" strokeWidth={1.75} aria-hidden />
        </button>

        <div className="border-b border-[#f1f5f9] bg-[#fafafa] px-6 pb-5 pt-8 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white text-[22px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[#e5e7eb]">
            <FolderPlus className="size-5 text-[#7c3aed]" strokeWidth={1.75} aria-hidden />
          </span>
          <h2
            id="project-create-title"
            className="mt-4 text-[22px] font-semibold tracking-tight text-[#0f172a]"
          >
            새 프로젝트 만들기
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748b]">
            프로젝트 이름을 정하면 에이전트에서 바로 작업을 시작할 수 있어요.
          </p>
        </div>

        <form
          className="px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <label htmlFor={titleFieldId} className="sr-only">
              프로젝트 제목
            </label>
            <input
              id={titleFieldId}
              type="text"
              value={name}
              maxLength={50}
              autoFocus
              placeholder="예: 우리 카페 랜딩, 개발자 포트폴리오"
              disabled={isSubmitting}
              onChange={(event) => setName(event.target.value)}
              className="block w-full rounded-2xl bg-transparent px-5 py-4 text-[15px] leading-relaxed text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus-visible:ring-2 focus-visible:ring-[#0f172a]/10 disabled:opacity-60"
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
            <p className="text-[12px] text-[#94a3b8]">
              {trimmedName.length < 2 ? '2자 이상 입력해 주세요.' : '이 이름으로 프로젝트가 생성됩니다.'}
            </p>
            <span className="shrink-0 text-[12px] tabular-nums text-[#cbd5e1]">{name.length}/50</span>
          </div>

          {errorMessage ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-11 flex-1 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] text-[14px] font-medium text-[#475569] transition hover:bg-[#f1f5f9] disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'h-11 flex-1 rounded-xl text-[14px] font-semibold transition',
                canSubmit
                  ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                  : 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]',
              )}
            >
              {isSubmitting ? '생성 중…' : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectCreateDialog;
