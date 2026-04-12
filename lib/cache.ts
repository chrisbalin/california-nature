/**
 * Simple in-memory cache for API route responses.
 * Prevents hammering external APIs during development
 * where ISR/edge caching isn't active.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expires > now) {
    return existing.data;
  }

  const data = await fn();
  store.set(key, { data, expires: now + ttlSeconds * 1000 });
  return data;
}
