import { NextResponse } from "next/server";
import { transcribe } from "@/lib/inference";
import { describeError } from "@/lib/error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rl.resetAt },
      { status: 429 },
    );
  }

  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "audio file required" }, { status: 400 });
  }

  try {
    const text = await transcribe(file);
    return NextResponse.json({ text });
  } catch (e) {
    const msg = describeError(e);
    console.error("[/api/stt]", msg, e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
