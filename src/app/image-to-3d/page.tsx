"use client";

import { useState } from "react";
import Link from "next/link";

export default function ImageTo3dPage() {
  const [file, setFile] = useState<File | null>(null);
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setMeshUrl(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch("/api/image-to-3d", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "request failed");
      setMeshUrl(j.meshUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← back
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Image → 3D</h1>
      <p className="mt-2 text-sm text-zinc-500">
        TripoSR converts single image to .glb mesh. Slow on free ZeroGPU (1–3 min).
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-6 block w-full text-sm"
      />

      <button
        onClick={submit}
        disabled={loading || !file}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Generating mesh…" : "Generate 3D"}
      </button>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {meshUrl && (
        <div className="mt-6 space-y-3">
          <a
            href={meshUrl}
            download
            className="inline-block rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            ⬇ Download .glb
          </a>
          {/* model-viewer is a web-component; load via CDN for quick preview. */}
          <model-viewer
            src={meshUrl}
            alt="Generated 3D mesh"
            camera-controls
            auto-rotate
            style={{
              width: "100%",
              height: "480px",
              background: "#0a0a0a",
              borderRadius: "0.5rem",
            }}
          />
          <script
            type="module"
            src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
            async
          />
        </div>
      )}
    </main>
  );
}
