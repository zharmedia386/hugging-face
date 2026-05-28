"use client";

import { useState } from "react";
import Link from "next/link";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setImgUrl(null);
    try {
      const r = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "request failed" }));
        throw new Error(j.error ?? "request failed");
      }
      const blob = await r.blob();
      setImgUrl(URL.createObjectURL(blob));
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
      <h1 className="mt-4 text-3xl font-bold">Image Generation</h1>
      <p className="mt-2 text-sm text-zinc-500">
        First call may take 30–60s — ZeroGPU queue.
      </p>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A cyberpunk fox riding a skateboard…"
        className="mt-6 w-full rounded-md border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-200"
      />

      <button
        onClick={submit}
        disabled={loading || !prompt.trim()}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Generating…" : "Generate"}
      </button>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {imgUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt="generated"
          className="mt-6 w-full rounded-md border border-zinc-200 dark:border-zinc-800"
        />
      )}
    </main>
  );
}
