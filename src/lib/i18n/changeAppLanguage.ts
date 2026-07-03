import i18n from '@/lib/i18n';
import { applyDocumentLocale, writeStoredLocale } from '@/lib/i18n/detectLocale';
import { isAppLocale, type AppLocale } from '@/lib/i18n/locales';

export async function changeAppLanguage(locale: string) {
  if (!isAppLocale(locale)) return;

  await i18n.changeLanguage(locale);
  writeStoredLocale(locale);
  applyDocumentLocale(locale);
}

export function getCurrentAppLanguage(): AppLocale {
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  if (resolved && isAppLocale(resolved)) return resolved;

  const base = resolved?.split('-')[0];
  if (base && isAppLocale(base)) return base;

  return 'ko';
}
