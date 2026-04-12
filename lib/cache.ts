/**
 * Simple in-memory cache for API route responses.
 * Prevents hammering external APIs during development
 * where ISR/edge caching isn't active.
 * Does NOT cache empty/failed results — only successful data.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
  isEmpty?: (data: T) => boolean
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expires > now) {
    return existing.data;
  }

  const data = await fn();

  // Only cache if the data looks valid (not empty/failed)
  if (!isEmpty || !isEmpty(data)) {
    store.set(key, { data, expires: now + ttlSeconds * 1000 });
  }

  return data;
}
