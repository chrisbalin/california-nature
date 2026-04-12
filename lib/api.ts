/**
 * Shared fetch helpers with retry logic for rate-limited APIs.
 */

/** Fetch with automatic retry on 429/5xx, with exponential backoff */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    // Retry on rate limit (429) or server errors (5xx)
    if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return res; // Return the failed response if we're out of retries
  }

  // Should never reach here, but TypeScript needs it
  return fetch(url, options);
}

/** SWR fetcher with error handling — returns null instead of throwing on failure */
export const resilientFetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};
