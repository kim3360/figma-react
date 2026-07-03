import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import { applyDocumentLocale, detectLocale } from '@/lib/i18n/detectLocale';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';

const initialLocale = detectLocale();

void i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLocale(initialLocale);

export default i18n;
