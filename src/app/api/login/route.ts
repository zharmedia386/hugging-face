import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  validateCredentials,
} from "@/lib/auth";

// Auth uses Web Crypto — runs in Edge too, but keep Node for consistency.
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  if (!validateCredentials(email, password)) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }

  const token = await createSessionToken(email);
  const res = NextResponse.json({ ok: true });
  const opts = sessionCookieOptions();
  res.cookies.set(opts.name, token, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return res;
}
