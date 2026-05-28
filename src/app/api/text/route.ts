import { NextResponse } from "next/server";
import { generateText } from "@/lib/inference";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rl.resetAt },
      { status: 429 },
    );
  }

  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const text = await generateText(prompt);
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Inference failed" },
      { status: 500 },
    );
  }
}
