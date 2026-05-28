"use client";

import { useState } from "react";
import Link from "next/link";

export default function BgRemovalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch("/api/bg-removal", { method: "POST", body: fd });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "request failed" }));
        throw new Error(j.error ?? "request failed");
      }
      const blob = await r.blob();
      setResultUrl(URL.createObjectURL(blob));
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
      <h1 className="mt-4 text-3xl font-bold">Background Removal</h1>
      <p className="mt-2 text-sm text-zinc-500">RMBG strips background to PNG.</p>

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
        {loading ? "Removing…" : "Remove background"}
      </button>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {resultUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resultUrl}
          alt="bg removed"
          className="mt-6 w-full rounded-md border border-zinc-200 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23eee%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23eee%22/></svg>')] dark:border-zinc-800"
        />
      )}
    </main>
  );
}
