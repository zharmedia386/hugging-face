/**
 * IP-based rate limit. In-memory sliding window — good enough for a single
 * Vercel region / single-node demo. Swap for Upstash Redis when you need
 * multi-region or persistence.
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX = 10; // requests per window per IP

export function checkRateLimit(ip: string): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const b = store.get(ip);

  if (!b || b.resetAt < now) {
    const fresh = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, fresh);
    return { ok: true, remaining: MAX - 1, resetAt: fresh.resetAt };
  }

  if (b.count >= MAX) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }

  b.count += 1;
  return { ok: true, remaining: MAX - b.count, resetAt: b.resetAt };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
