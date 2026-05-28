import { NextResponse } from "next/server";
import { imageToMesh } from "@/lib/inference";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
// 3D generation is slow on free ZeroGPU — give it room.
export const maxDuration = 300;

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
    const meshUrl = await imageToMesh(file);
    return NextResponse.json({ meshUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Inference failed" },
      { status: 500 },
    );
  }
}
