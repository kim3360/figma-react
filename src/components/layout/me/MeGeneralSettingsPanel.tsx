import { useState, type ChangeEvent } from 'react';
import { ChevronDown, Moon, Sun, SunMoon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MeSettingsToggle from '@/components/layout/me/MeSettingsToggle';
import { changeAppLanguage, getCurrentAppLanguage } from '@/lib/i18n/changeAppLanguage';
import { APP_LOCALES } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'auto';

const themeOptions: { value: ThemeOption; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'auto', icon: SunMoon },
];

function MeGeneralSettingsPanel() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<ThemeOption>('light');
  const [productUpdates, setProductUpdates] = useState(true);
  const [pendingTaskEmail, setPendingTaskEmail] = useState(true);
  const [marketingAds, setMarketingAds] = useState(true);

  const currentLanguage = getCurrentAppLanguage();

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void changeAppLanguage(event.target.value);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="me-settings-language" className="text-[13px] font-medium text-[#334155]">
            {t('me.general.language')}
          </label>
          <div className="relative">
            <select
              id="me-settings-language"
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#e2e8f0] bg-white py-0 pl-3.5 pr-10 text-[14px] text-[#0f172a] outline-none transition focus:border-[#e2e8f0] focus:ring-0"
            >
              {APP_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {t(`me.general.languages.${locale}`)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] font-medium text-[#334155]">{t('me.general.theme')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themeOptions.map(({ value, icon: Icon }) => {
              const isSelected = theme === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border bg-white px-4 py-4 transition',
                    isSelected
                      ? 'border-[#0f172a] ring-1 ring-[#0f172a]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1]',
                  )}
                >
                  <Icon className="size-5 text-[#64748b]" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium text-[#334155]">
                    {t(`me.general.themes.${value}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px bg-[#e2e8f0]" role="separator" />

      <section className="flex flex-col gap-4">
        <h3 className="text-[15px] font-semibold text-[#0f172a]">
          {t('me.general.communications')}
        </h3>

        <div className="flex flex-col divide-y divide-[#f1f5f9]">
          <div className="flex items-start justify-between gap-4 py-4 first:pt-0">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[#0f172a]">
                {t('me.general.productUpdates.title')}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                {t('me.general.productUpdates.description')}
              </p>
            </div>
            <MeSettingsToggle
              label={t('me.general.productUpdates.toggleLabel')}
              checked={productUpdates}
              onChange={setProductUpdates}
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[#0f172a]">
                {t('me.general.pendingTaskEmail.title')}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                {t('me.general.pendingTaskEmail.description')}
              </p>
            </div>
            <MeSettingsToggle
              label={t('me.general.pendingTaskEmail.toggleLabel')}
              checked={pendingTaskEmail}
              onChange={setPendingTaskEmail}
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-4 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[#0f172a]">
                {t('me.general.marketingAds.title')}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                {t('me.general.marketingAds.description')}
              </p>
            </div>
            <MeSettingsToggle
              label={t('me.general.marketingAds.toggleLabel')}
              checked={marketingAds}
              onChange={setMarketingAds}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default MeGeneralSettingsPanel;
