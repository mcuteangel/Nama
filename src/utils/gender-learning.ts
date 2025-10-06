import { ErrorManager } from '@/lib/error-manager';
import { t } from 'i18next';

const LEARNED_GENDER_PREFERENCES_KEY = 'learned_gender_preferences';
const LEARNED_GENDER_THRESHOLD = 3; // Number of times a gender must be suggested/accepted to be considered a 'strong' preference

interface GenderCounts {
  male: number;
  female: number;
  not_specified: number;
}

type LearnedGenderPreferences = {
  [firstName: string]: GenderCounts;
};

interface PersianNamesData {
  male: string[];
  female: string[];
}

// کش برای داده‌های نام‌های فارسی
let persianNamesCache: PersianNamesData | null = null;
const LEARNED_NAMES_KEY = 'learned_persian_names';

/**
 * دریافت نام‌های جدید یادگرفته شده از localStorage
 */
function getLearnedPersianNames(errorMessage = t('errors.failed_parse_learned_names')): PersianNamesData {
  if (typeof window === 'undefined') {
    return { male: [], female: [] };
  }
  try {
    const stored = localStorage.getItem(LEARNED_NAMES_KEY);
    return stored ? JSON.parse(stored) : { male: [], female: [] };
  } catch (e) {
    ErrorManager.logError(e, { 
      context: 'getLearnedPersianNames', 
      message: errorMessage
    });
    return { male: [], female: [] };
  }
}

/**
 * ذخیره نام جدید یادگرفته شده در localStorage
 */
export function saveLearnedPersianName(firstName: string, gender: 'male' | 'female'): void {
  if (typeof window === 'undefined') {
    return;
  }

  const learnedNames = getLearnedPersianNames();
  const normalizedName = firstName.toLowerCase();

  // بررسی duplicate
  if (learnedNames[gender].includes(normalizedName)) {
    return; // قبلاً اضافه شده
  }

  learnedNames[gender].push(normalizedName);

  try {
    localStorage.setItem(LEARNED_NAMES_KEY, JSON.stringify(learnedNames));
  } catch (e) {
    ErrorManager.logError(e, { 
      context: 'saveLearnedPersianName', 
      message: t('errors.failed_save_learned_name') 
    });
  }
}

/**
 * بارگذاری داده‌های نام‌های فارسی از فایل JSON و ترکیب با نام‌های جدید یادگرفته شده
 */
async function loadPersianNames(errorMessage = t('errors.failed_load_persian_names')): Promise<PersianNamesData> {
  // اگر قبلاً کش شده، برگردون
  if (persianNamesCache) {
    return persianNamesCache;
  }

  let baseNames: PersianNamesData = { male: [], female: [] };
  const learnedNames = getLearnedPersianNames();

  try {
    // بارگذاری نام‌های پایه از فایل
    if (typeof window !== 'undefined') {
      const response = await fetch('/data/persian-names.json');
      if (!response.ok) {
        throw new Error(
          t('errors.failed_load_persian_names_with_status', { status: response.status })
        );
      }
      baseNames = await response.json();
    } else {
      // در محیط Node.js از import استفاده کن
      const namesModule = await import('../data/persian-names.json');
      baseNames = namesModule.default;
    }
  } catch (error) {
    ErrorManager.logError(error, { context: 'loadPersianNames', message: errorMessage });

    // اگر فایل بارگذاری نشد، از لیست پیش‌فرض استفاده کن (fallback)
    baseNames = {
      male: ['علی', 'محمد', 'رضا', 'حسین', 'امیر'],
      female: ['فاطمه', 'زهرا', 'مریم', 'سارا', 'نازنین']
    };
  }

  // ترکیب نام‌های پایه با نام‌های جدید یادگرفته شده
  persianNamesCache = {
    male: [...new Set([...baseNames.male, ...learnedNames.male])],
    female: [...new Set([...baseNames.female, ...learnedNames.female])]
  };

  return persianNamesCache;
}

/**
 * Retrieves learned gender preferences from localStorage.
 * @param errorMessage Optional custom error message for i18n support
 * @returns A map of first names to their gender counts.
 */
export function getLearnedGenderPreferences(errorMessage = t('errors.failed_parse_gender_preferences')): LearnedGenderPreferences {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const stored = localStorage.getItem(LEARNED_GENDER_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    ErrorManager.logError(e, { context: 'getLearnedGenderPreferences', message: errorMessage });
    return {};
  }
}

/**
 * Updates the learned gender preference for a given first name and gender.
 * @param firstName The first name to update.
 * @param gender The gender that was suggested/accepted.
 */
export function updateLearnedGenderPreference(firstName: string, gender: 'male' | 'female' | 'not_specified') {
  if (typeof window === 'undefined') {
    return;
  }
  const preferences = getLearnedGenderPreferences(t('errors.failed_parse_gender_preferences'));
  const normalizedFirstName = firstName.toLowerCase();

  if (!preferences[normalizedFirstName]) {
    preferences[normalizedFirstName] = { male: 0, female: 0, not_specified: 0 };
  }
  preferences[normalizedFirstName][gender]++;

  try {
    localStorage.setItem(LEARNED_GENDER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    ErrorManager.logError(e, { 
      context: 'updateLearnedGenderPreference', 
      message: t('errors.failed_save_gender_preferences') 
    });
  }
}

/**
 * Clears all learned gender preferences from localStorage.
 */
export function clearLearnedGenderPreferences() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(LEARNED_GENDER_PREFERENCES_KEY);
  } catch (e) {
    ErrorManager.logError(e, { 
      context: 'clearLearnedGenderPreferences', 
      message: t('errors.failed_clear_gender_preferences') 
    });
  }
}

/**
 * Suggests a gender based on learned preferences or a loaded list of Persian names.
 * @param firstName The first name to suggest gender for.
 * @returns The suggested gender ('male', 'female', or 'not_specified').
 */
export const suggestGenderFromName = async (firstName: string): Promise<'male' | 'female' | 'not_specified'> => {
  const lowerFirstName = firstName.toLowerCase();
  const preferences = getLearnedGenderPreferences(t('errors.failed_parse_gender_preferences'));

  // 1. Check learned preferences first
  const learnedCounts = preferences[lowerFirstName];
  if (learnedCounts) {
    if (learnedCounts.male >= LEARNED_GENDER_THRESHOLD && learnedCounts.male > learnedCounts.female) {
      return 'male';
    }
    if (learnedCounts.female >= LEARNED_GENDER_THRESHOLD && learnedCounts.female > learnedCounts.male) {
      return 'female';
    }
  }

  // 2. Check against loaded Persian names data
  try {
    const namesData = await loadPersianNames();

    if (namesData.male.includes(lowerFirstName)) {
      return 'male';
    }
    if (namesData.female.includes(lowerFirstName)) {
      return 'female';
    }
  } catch (error) {
    ErrorManager.logError(error, { 
      context: 'suggestGenderFromName', 
      message: t('errors.failed_load_persian_names_suggestion') 
    });
  }

  return 'not_specified';
};

/**
 * دریافت آمار نام‌های جدید یادگرفته شده
 */
export function getLearnedPersianNamesStats(): { male: number; female: number; total: number } {
  const learnedNames = getLearnedPersianNames();
  const maleCount = learnedNames.male.length;
  const femaleCount = learnedNames.female.length;

  return {
    male: maleCount,
    female: femaleCount,
    total: maleCount + femaleCount
  };
}

/**
 * پاک کردن نام‌های جدید یادگرفته شده
 */
export function clearLearnedPersianNames(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(LEARNED_NAMES_KEY);
  } catch (e) {
    ErrorManager.logError(e, { 
      context: 'clearLearnedPersianNames', 
      message: t('errors.failed_clear_learned_names') 
    });
  }
}
