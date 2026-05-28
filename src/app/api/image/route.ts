import { NextResponse } from "next/server";
import { generateImage } from "@/lib/inference";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
// Image gen can take 30-60s on free ZeroGPU queue.
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

  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const blob = await generateImage(prompt);
    return new NextResponse(blob, {
      headers: { "Content-Type": blob.type || "image/png" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Inference failed" },
      { status: 500 },
    );
  }
}
