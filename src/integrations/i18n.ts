import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Load translations
import translationEN from '../../public/locales/en/translation.json';
import translationFA from '../../public/locales/fa/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fa: {
    translation: translationFA,
  },
};

// Get stored language or default to 'fa'
const storedLng = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
const initialLng = storedLng || 'fa'; // Prioritize stored, then 'fa'

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    lng: initialLng, // Explicitly set the initial language
    fallbackLng: 'fa', // Default language if detection fails, set to Persian
    debug: false, // Set to true for debugging
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'], // Order of language detection, prioritize localStorage
      caches: ['localStorage'], // Cache user language in localStorage
    },
  });

export default i18n;