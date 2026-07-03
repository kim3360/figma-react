import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useUserInfoQuery } from '@/api/user';
import MeSettingsContentPanel from '@/components/layout/me/MeSettingsContentPanel';
import MeSettingsSidebar, { formatDisplayName } from '@/components/layout/me/MeSettingsSidebar';
import type { MeSettingsSectionId } from '@/components/layout/me/meSettingsNav';
import { cn } from '@/lib/utils';

type MeSettingsShellProps = {
  initialSection?: MeSettingsSectionId;
  onClose?: () => void;
  className?: string;
  variant?: 'dialog' | 'page';
};

function MeSettingsShell({
  initialSection = 'general',
  onClose,
  className,
  variant = 'page',
}: MeSettingsShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<MeSettingsSectionId>(initialSection);

  const { data: userResponse } = useUserInfoQuery('me-settings');
  const username = userResponse?.data?.username?.trim() || 'user';
  const displayName = formatDisplayName(username);
  const avatarUrl = userResponse?.data?.avatarUrl ?? null;

  const handleHelpClick = () => {
    void navigate({ to: '/help' });
    onClose?.();
  };

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-col overflow-hidden bg-white lg:flex-row',
        variant === 'dialog' && 'h-full max-h-[min(720px,calc(100vh-2rem))] rounded-2xl shadow-xl',
        variant === 'page' &&
          'min-h-[calc(100vh-56px)] rounded-2xl border border-[#e2e8f0] shadow-sm',
        className,
      )}
    >
      <MeSettingsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        displayName={displayName}
        avatarUrl={avatarUrl}
        onHelpClick={handleHelpClick}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {onClose ? (
          <div className="flex shrink-0 justify-end border-b border-[#f1f5f9] px-4 py-3 lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:border-b-0">
            <button
              type="button"
              onClick={onClose}
              aria-label={t('me.closeSettings')}
              className="rounded-lg p-1.5 text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#475569]"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-8 lg:pt-8">
          <MeSettingsContentPanel activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}

export default MeSettingsShell;
