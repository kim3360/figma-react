import { useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationsPanel from '@/components/layout/notifications/NotificationsPanel';

type NotificationsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/35"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-dialog-title"
        className="relative z-10 flex h-[min(720px,calc(100vh-1.5rem))] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#f1f5f9] px-5 py-4 sm:px-6">
          <h2 id="notifications-dialog-title" className="text-[22px] font-bold text-[#0f172a]">
            {t('notifications.title')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#475569]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <NotificationsPanel />
      </div>
    </div>
  );
}

export default NotificationsDialog;
