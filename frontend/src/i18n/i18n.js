// i18n/i18n.js
// Configures react-i18next with English and Amharic resources.
// Language choice is persisted in localStorage via LanguageDetector.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import am from './locales/am.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'am'],
    interpolation: { escapeValue: false }, // React already escapes values
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
