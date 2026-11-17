import "server-only";
import { headers } from "next/headers";

// Penghitung di memori untuk satu instance server. Ganti dengan Redis bila multi-instance.
const buckets = new Map<string, { count: number; resetAt: number }>();

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;

export function isRateLimited(key: string, limit: number) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < Date.now()) return false;
  return bucket.count >= limit;
}

export function recordAttempt(key: string, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    bucket.count += 1;
  }
}

export function clearAttempts(key: string) {
  buckets.delete(key);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
