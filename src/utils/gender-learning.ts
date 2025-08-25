import { ErrorManager } from '@/lib/error-manager';

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

/**
 * Retrieves learned gender preferences from localStorage.
 * @returns A map of first names to their gender counts.
 */
export function getLearnedGenderPreferences(): LearnedGenderPreferences {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const stored = localStorage.getItem(LEARNED_GENDER_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    ErrorManager.logError(e, { context: 'getLearnedGenderPreferences', message: 'Failed to parse learned gender preferences from localStorage.' });
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
  const preferences = getLearnedGenderPreferences();
  const normalizedFirstName = firstName.toLowerCase();

  if (!preferences[normalizedFirstName]) {
    preferences[normalizedFirstName] = { male: 0, female: 0, not_specified: 0 };
  }
  preferences[normalizedFirstName][gender]++;

  try {
    localStorage.setItem(LEARNED_GENDER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    ErrorManager.logError(e, { context: 'updateLearnedGenderPreference', message: 'Failed to save learned gender preferences to localStorage.' });
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
    ErrorManager.logError(e, { context: 'clearLearnedGenderPreferences', message: 'Failed to clear learned gender preferences from localStorage.' });
  }
}

/**
 * Suggests a gender based on learned preferences or a hardcoded list.
 * @param firstName The first name to suggest gender for.
 * @returns The suggested gender ('male', 'female', or 'not_specified').
 */
export const suggestGenderFromName = (firstName: string): 'male' | 'female' | 'not_specified' => {
  const lowerFirstName = firstName.toLowerCase();
  const preferences = getLearnedGenderPreferences();

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

  // 2. Fallback to hardcoded list if no strong learned preference
  // A very basic, limited set of rules for common Persian names
  // This is NOT comprehensive and will be inaccurate for many names.
  // For a more robust solution without AI, a large local database of names would be needed.
  const hardcodedMaleNames = ['علی', 'محمد', 'رضا', 'حسین', 'امیر', 'حسن', 'مهدی', 'جواد', 'سعید', 'محمود', 'احمد', 'مصطفی', 'مجید', 'ناصر', 'بهنام', 'فرهاد', 'کاوه', 'کوروش', 'داریوش', 'آرش', 'بابک', 'پویا', 'کیوان', 'مانی', 'نادر', 'هومن', 'یوسف'];
  const hardcodedFemaleNames = ['فاطمه', 'زهرا', 'مریم', 'سارا', 'نازنین', 'زینب', 'آزاده', 'پریسا', 'ژاله', 'شیرین', 'لیلا', 'مهسا', 'نسترن', 'هدیه', 'یاسمن', 'آرزو', 'بهار', 'پگاه', 'ترانه', 'ثمین', 'خاطره', 'دلارام', 'رعنا', 'رویا', 'سحر', 'شبنم', 'غزل', 'فرناز', 'کیمیا', 'گلناز', 'لاله', 'مرجان', 'نوشین', 'ویدا'];

  if (hardcodedMaleNames.includes(lowerFirstName)) {
    return 'male';
  }
  if (hardcodedFemaleNames.includes(lowerFirstName)) {
    return 'female';
  }

  return 'not_specified';
};