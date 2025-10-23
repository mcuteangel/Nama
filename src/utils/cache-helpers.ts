import i18n from "@/integrations/i18n";

const CACHE_EXPIRATION_TIME = 10 * 60 * 1000; // Increase to 10 minutes from 5 minutes

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
 * Invalidates all cache entries related to contacts for a specific user.
 * @param userId The user ID to invalidate caches for.
 */
export function invalidateAllContactCaches(userId: string) {
  const keysToInvalidate: string[] = [];

  // Get all keys from localStorage that match contact-related patterns
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(`contacts_list_${userId}_`)) {
      keysToInvalidate.push(key);
    }
  }

  // Also invalidate other related caches
  keysToInvalidate.push(`statistics_dashboard_${userId}`);

  // Remove all identified cache entries
  keysToInvalidate.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log(`Invalidated ${keysToInvalidate.length} cache entries for user ${userId}`);
}
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<{ data: T | null; error: string | null }>,
): Promise<{ data: T | null; error: string | null; fromCache: boolean }> {
  // 1. Try to get fresh cached data first
  const freshCachedData = getCachedData<T>(cacheKey);
  if (freshCachedData) {
    return { data: freshCachedData, error: null, fromCache: true };
  }

  let initialData: T | null = null;

  // 2. If no fresh cache, check for stale cache to potentially return as initial data
  const staleCachedDataString = localStorage.getItem(cacheKey);
  if (staleCachedDataString) {
    try {
      const staleEntry: CacheEntry<T> = JSON.parse(staleCachedDataString);
      initialData = staleEntry.data; // Use stale data as initial if available
    } catch (e) {
      // Corrupted stale cache, will proceed to fetch
    }
  }

  try {
    // 3. Perform the actual fetch
    const { data, error } = await fetchFunction();

    if (error) {
      throw new Error(error);
    }

    // 4. Cache the new data
    if (data !== null) {
      setCachedData(cacheKey, data);
    }

    return { data, error: null, fromCache: false };
  } catch (err: unknown) {
    // 5. Handle errors: return stale data if available, otherwise null
    console.error(`Error fetching data for ${cacheKey}:`, err);
    return { 
      data: initialData, 
      error: err instanceof Error ? err.message : i18n.t('errors.unknown_error'), 
      fromCache: false 
    };
  }
}