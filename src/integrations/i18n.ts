import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Load translations
import translationEN from '../locales/en/translation.json';
import translationFA from '../locales/fa/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fa: {
    translation: translationFA,
  },
};

// Initialize i18n
const initPromise = i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    lng: 'fa', // Explicitly set the initial language to Persian
    fallbackLng: 'fa', // Fallback to Persian if a detected language is not available
    debug: false, // Set to true for debugging
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'], // Order of language detection, prioritize localStorage
      caches: ['localStorage'], // Cache user language in localStorage
    },
  });

// Dispatch event when i18n is initialized
initPromise.then(() => {
  const event = new CustomEvent('i18nInitialized', { 
    detail: { i18n } 
  });
  document.dispatchEvent(event);
});

export default i18n;