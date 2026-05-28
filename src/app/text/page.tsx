"use client";

import { useState } from "react";
import Link from "next/link";

export default function TextPage() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const r = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
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
      <h1 className="mt-4 text-3xl font-bold">Text Generation</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask anything…"
        className="mt-6 h-32 w-full rounded-md border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-200"
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

      {output && (
        <pre className="mt-6 whitespace-pre-wrap rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          {output}
        </pre>
      )}
    </main>
  );
}
