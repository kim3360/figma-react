import { ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import profileFallback from '@/assets/icons/profile.svg';
import {
  meSettingsHelpItem,
  meSettingsNavGroups,
  type MeSettingsSectionId,
} from '@/components/layout/me/meSettingsNav';
import { cn } from '@/lib/utils';

type MeSettingsSidebarProps = {
  activeSection: MeSettingsSectionId;
  onSectionChange: (section: MeSettingsSectionId) => void;
  displayName: string;
  avatarUrl: string | null;
  onHelpClick?: () => void;
};

function formatDisplayName(username: string) {
  return username
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function MeSettingsSidebar({
  activeSection,
  onSectionChange,
  displayName,
  avatarUrl,
  onHelpClick,
}: MeSettingsSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profileImageSrc = avatarUrl?.trim() || profileFallback;
  const HelpIcon = meSettingsHelpItem.icon;

  const handleHelpClick = () => {
    if (onHelpClick) {
      onHelpClick();
      return;
    }

    void navigate({ to: '/help' });
  };

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-[#e2e8f0] bg-[#fafafa] lg:w-[248px]">
      <div className="border-b border-[#e2e8f0] px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-[#f1f5f9]"
        >
          <img src={profileImageSrc} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-[#0f172a]">{displayName}</p>
            <p className="truncate text-[12px] text-[#64748b]">{t('me.profileType')}</p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-[#94a3b8]" aria-hidden />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {meSettingsNavGroups.map((group) => (
          <div key={group.groupKey} className="mb-4 last:mb-0">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              {t(`me.nav.groups.${group.groupKey}`)}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ id, icon: Icon }) => {
                const isActive = activeSection === id;

                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onSectionChange(id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition',
                        isActive
                          ? 'border border-[#0f172a] bg-white text-[#0f172a] shadow-sm'
                          : 'border border-transparent text-[#475569] hover:bg-[#f1f5f9]',
                      )}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{t(`me.nav.items.${id}`)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#e2e8f0] px-2 py-3">
        <button
          type="button"
          onClick={handleHelpClick}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium text-[#475569] transition hover:bg-[#f1f5f9]"
        >
          <HelpIcon className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1">{t('me.help')}</span>
          <ChevronRight className="size-3.5 shrink-0 text-[#94a3b8]" aria-hidden />
        </button>
      </div>
    </aside>
  );
}

export { formatDisplayName };
export default MeSettingsSidebar;
