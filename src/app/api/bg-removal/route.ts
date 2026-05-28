import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/inference";
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
  const file = form.get("image");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "image file required" }, { status: 400 });
  }

  try {
    const blob = await removeBackground(file);
    return new NextResponse(blob, {
      headers: { "Content-Type": blob.type || "image/png" },
    });
  } catch (e) {
    const msg = describeError(e);
    console.error("[/api/bg-removal]", msg, e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
