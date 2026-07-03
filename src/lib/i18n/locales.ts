export const APP_LOCALES = ['ko', 'en', 'ja'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const LOCALE_STORAGE_KEY = 'dvely.locale';

export const DEFAULT_LOCALE: AppLocale = 'ko';

export function isAppLocale(value: string): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

export const localeLabels: Record<AppLocale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};
