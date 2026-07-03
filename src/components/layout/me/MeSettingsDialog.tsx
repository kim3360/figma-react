import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MeSettingsShell from '@/components/layout/me/MeSettingsShell';
import type { MeSettingsSectionId } from '@/components/layout/me/meSettingsNav';

type MeSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: MeSettingsSectionId;
};

function MeSettingsDialog({ open, onOpenChange, initialSection }: MeSettingsDialogProps) {
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
        aria-label={t('common.settings')}
        className="relative z-10 h-[min(720px,calc(100vh-1.5rem))] w-full max-w-[960px]"
      >
        <MeSettingsShell
          variant="dialog"
          initialSection={initialSection}
          onClose={handleClose}
          className="h-full"
        />
      </div>
    </div>
  );
}

export default MeSettingsDialog;
