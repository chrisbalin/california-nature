/**
 * Format a number with commas: 12400 → "12,400"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Format a tide height in meters: 1.743 → "1.7m"
 */
export function formatTideHeight(meters: string | number): string {
  const n = typeof meters === "string" ? parseFloat(meters) : meters;
  return `${n.toFixed(1)}m`;
}

/**
 * Format a time string like "2026-04-10 03:42" → "3:42a"
 */
export function formatTideTime(timeStr: string): string {
  const [, timePart] = timeStr.split(" ");
  if (!timePart) return timeStr;
  const [hourStr, minStr] = timePart.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "p" : "a";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minStr}${suffix}`;
}

/**
 * Format CFS flow: 12400 → "12,400 cfs"
 */
export function formatFlow(cfs: number): string {
  return `${formatNumber(Math.round(cfs))} cfs`;
}

/**
 * Relative time: "2026-04-09 14:30" → "9h ago"
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Format temperature in Fahrenheit: 58.2 → "58°F"
 */
export function formatTemp(f: number): string {
  return `${Math.round(f)}°F`;
}

/**
 * Title case: "orange bush monkeyflower" → "Orange Bush Monkeyflower"
 */
export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Celsius to Fahrenheit
 */
export function cToF(c: number): number {
  return c * 9 / 5 + 32;
}

/**
 * Clean up eBird location strings.
 * "Ballona Creek--Lincoln Blvd. to 90 Fwy" → "Ballona Creek"
 * "5005 McConnell Avenue Bike Path Entrance" → "McConnell Avenue"
 * "13563–13569 Kiefer Blvd, Sloughhouse US-CA ..." → "Sloughhouse"
 */
export function cleanLocation(loc: string): string {
  // Split on -- (eBird hotspot separator) and take first part
  let cleaned = loc.split("--")[0].trim();

  // Remove GPS coordinates and state codes
  cleaned = cleaned.replace(/\s+US-CA\s+[\d.,-\s]+$/, "").trim();
  cleaned = cleaned.replace(/\s+[\d.-]+,\s*-?[\d.-]+\s*$/, "").trim();
  cleaned = cleaned.replace(/\s+US-CA\s*$/, "").trim();

  // If it starts with a street number (digits), try to extract the place name
  if (/^\d+[–\-]?\d*\s/.test(cleaned)) {
    // "5005 McConnell Avenue Bike Path Entrance" → drop the number
    cleaned = cleaned.replace(/^\d+[–\-]?\d*\s+/, "");
    // If there's a comma, take the part after it (city name)
    if (cleaned.includes(",")) {
      const parts = cleaned.split(",").map((p) => p.trim());
      cleaned = parts[parts.length - 1] || parts[0];
    }
  }

  // "Kiefer Blvd, Sloughhouse" → "Sloughhouse"
  if (/\b(Blvd|Ave|St|Rd|Dr|Ln|Way|Ct|Hwy|Fwy)\b/i.test(cleaned) && cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim());
    cleaned = parts[parts.length - 1] || parts[0];
  }

  return cleaned;
}
