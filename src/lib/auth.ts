/**
 * Single-account email/password auth.
 *
 * Credentials live in env (AUTH_EMAIL / AUTH_PASSWORD). Sessions are
 * HMAC-signed cookies — no DB. Uses Web Crypto so it works in both
 * Node (route handlers) and Edge (middleware) runtimes.
 */

const COOKIE_NAME = "hf_session";
// 7 days
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_COOKIE = COOKIE_NAME;

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "AUTH_SECRET must be set in env (>=16 chars). Generate: `openssl rand -hex 32`",
    );
  }
  return s;
}

function getExpectedEmail(): string {
  const e = process.env.AUTH_EMAIL;
  if (!e) throw new Error("AUTH_EMAIL must be set in env");
  return e;
}

function getExpectedPassword(): string {
  const p = process.env.AUTH_PASSWORD;
  if (!p) throw new Error("AUTH_PASSWORD must be set in env");
  return p;
}

// ---------- base64url ----------

function b64uEncode(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64uDecode(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

// ---------- HMAC ----------

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return b64uEncode(sig);
}

/** Constant-time string compare. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ---------- session token ----------

export interface SessionPayload {
  email: string;
  exp: number; // unix ms
}

export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MAX_AGE_MS,
  };
  const body = b64uEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = await hmac(body);
  if (!timingSafeEqual(sig, expectedSig)) return null;

  try {
    const json = new TextDecoder().decode(b64uDecode(body));
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- credential check ----------

export function validateCredentials(email: string, password: string): boolean {
  // Constant-time compare both fields to avoid leaking which one was wrong.
  const okEmail = timingSafeEqual(email, getExpectedEmail());
  const okPwd = timingSafeEqual(password, getExpectedPassword());
  return okEmail && okPwd;
}

// ---------- cookie helpers ----------

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  };
}
