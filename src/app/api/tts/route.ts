import { NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/inference";
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

  const { text, voice } = (await req.json()) as {
    text?: string;
    voice?: string;
  };
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  try {
    const blob = await synthesizeSpeech(text, voice);
    return new NextResponse(blob, {
      headers: { "Content-Type": blob.type || "audio/wav" },
    });
  } catch (e) {
    const msg = describeError(e);
    console.error("[/api/tts]", msg, e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
