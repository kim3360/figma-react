import { DEFAULT_LOCALE, isAppLocale, LOCALE_STORAGE_KEY, type AppLocale } from '@/lib/i18n/locales';

export function detectLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isAppLocale(stored)) return stored;

  const browserLanguage = navigator.language.split('-')[0]?.toLowerCase();
  if (browserLanguage && isAppLocale(browserLanguage)) return browserLanguage;

  return DEFAULT_LOCALE;
}

export function readStoredLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isAppLocale(stored) ? stored : null;
}

export function writeStoredLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function applyDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale;
}
