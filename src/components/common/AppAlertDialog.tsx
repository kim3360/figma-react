import { useCallback, useEffect } from 'react';

type AppAlertDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onOpenChange: (open: boolean) => void;
};

function AppAlertDialog({
  open,
  title = '알림',
  message,
  confirmLabel = '확인',
  onOpenChange,
}: AppAlertDialogProps) {
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') handleClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-[#0f172a]/30 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-alert-title"
        aria-describedby="app-alert-message"
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
      >
        <div className="px-6 pb-4 pt-6">
          <h2
            id="app-alert-title"
            className="text-[18px] font-semibold tracking-tight text-[#0f172a]"
          >
            {title}
          </h2>
          <p
            id="app-alert-message"
            className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[#64748b]"
          >
            {message}
          </p>
        </div>

        <div className="px-6 pb-5">
          <button
            type="button"
            onClick={handleClose}
            className="flex w-full items-center justify-center rounded-xl bg-[#0f172a] py-3 text-[14px] font-semibold text-white transition hover:bg-[#1e293b]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppAlertDialog;
