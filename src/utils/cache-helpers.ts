import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

/**
 * Retrieves cached data from local storage if it's still fresh.
 * If the cache is stale, it will be removed.
 * @param cacheKey The key under which the data is stored in local storage.
 * @returns The cached data if fresh, otherwise null.
 */
export function getCachedData<T>(cacheKey: string): T | null {
  const cachedDataString = localStorage.getItem(cacheKey);
  if (cachedDataString) {
    try {
      const cachedEntry: CacheEntry<T> = JSON.parse(cachedDataString);
      const now = Date.now();
      if ((now - cachedEntry.timestamp) < CACHE_EXPIRATION_TIME) {
        return cachedEntry.data;
      } else {
        // Cache is stale, remove it
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.error(`Failed to parse cached data for ${cacheKey}:`, e);
      localStorage.removeItem(cacheKey); // Clear corrupted cache
    }
  }
  return null;
}

/**
 * Stores data in local storage with a timestamp.
 * @param cacheKey The key under which to store the data.
 * @param data The data to be cached.
 */
export function setCachedData<T>(cacheKey: string, data: T) {
  localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
}

/**
 * Invalidates (removes) a specific cache entry from local storage.
 * @param cacheKey The key of the cache entry to invalidate.
 */
export function invalidateCache(cacheKey: string) {
  localStorage.removeItem(cacheKey);
}

/**
 * Fetches data, attempting to retrieve it from cache first.
 * If fresh cache is available, it returns immediately.
 * Otherwise, it fetches from the provided function, caches the result, and shows toasts.
 * @param cacheKey The key for caching this specific data.
 * @param fetchFunction The asynchronous function to call to fetch the data from the source.
 * @param options Configuration options for toasts and messages.
 * @returns A promise that resolves with the fetched data or null on error.
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<{ data: T | null; error: string | null }>,
  options?: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    showLoadingToast?: boolean;
  }
): Promise<{ data: T | null; error: string | null }> {
  const { loadingMessage, successMessage, errorMessage, showLoadingToast = true } = options || {};

  // 1. Try to get fresh cached data first
  const freshCachedData = getCachedData<T>(cacheKey);
  if (freshCachedData) {
    return { data: freshCachedData, error: null };
  }

  let toastId: string | number | undefined;
  let initialData: T | null = null;

  // 2. If no fresh cache, check for stale cache to potentially display while fetching
  const staleCachedDataString = localStorage.getItem(cacheKey);
  if (staleCachedDataString) {
    try {
      const staleEntry: CacheEntry<T> = JSON.parse(staleCachedDataString);
      initialData = staleEntry.data; // Use stale data as initial if available
    } catch (e) {
      // Corrupted stale cache, will proceed to fetch
    }
  }

  // 3. Show loading toast if no fresh data was immediately available
  if (showLoadingToast) {
    toastId = showLoading(loadingMessage || "در حال بارگذاری...");
  }

  try {
    // 4. Perform the actual fetch
    const { data, error } = await fetchFunction();

    if (error) {
      throw new Error(error);
    }

    // 5. Cache the new data
    if (data !== null) {
      setCachedData(cacheKey, data);
    }

    // 6. Dismiss loading toast and show success toast
    if (toastId) dismissToast(toastId);
    if (successMessage) showSuccess(successMessage);

    return { data, error: null };
  } catch (err: any) {
    // 7. Handle errors: dismiss toast, show error toast, and return stale data if available
    console.error(`Error fetching data for ${cacheKey}:`, err);
    if (toastId) dismissToast(toastId);
    showError(errorMessage || `خطا در بارگذاری: ${err.message || "خطای ناشناخته"}`);
    return { data: initialData, error: err.message || "Unknown error" }; // Return stale data on error if available
  }
}