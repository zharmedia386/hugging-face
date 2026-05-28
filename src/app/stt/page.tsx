"use client";

import { useState } from "react";
import Link from "next/link";

export default function SttPage() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const fd = new FormData();
      fd.append("audio", file);
      const r = await fetch("/api/stt", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "request failed");
      setOutput(j.text);
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
      <h1 className="mt-4 text-3xl font-bold">Speech → Text</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Upload .mp3 / .wav / .m4a — Whisper transcribes it.
      </p>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-6 block w-full text-sm"
      />

      <button
        onClick={submit}
        disabled={loading || !file}
        className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Transcribing…" : "Transcribe"}
      </button>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {output && (
        <pre className="mt-6 whitespace-pre-wrap rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          {output}
        </pre>
      )}
    </main>
  );
}
