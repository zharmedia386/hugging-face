"use client";

import { useState } from "react";
import Link from "next/link";

const VOICES = [
  { id: "af_heart", label: "Heart (female)" },
  { id: "af_bella", label: "Bella (female)" },
  { id: "am_adam", label: "Adam (male)" },
  { id: "am_michael", label: "Michael (male)" },
];

export default function TtsPage() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "request failed" }));
        throw new Error(j.error ?? "request failed");
      }
      const blob = await r.blob();
      setAudioUrl(URL.createObjectURL(blob));
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
      <h1 className="mt-4 text-3xl font-bold">Text → Speech</h1>
      <p className="mt-2 text-sm text-zinc-500">Kokoro-82M voice synth.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to speak…"
        className="mt-6 h-32 w-full rounded-md border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-200"
      />

      <select
        value={voice}
        onChange={(e) => setVoice(e.target.value)}
        className="mt-3 rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        {VOICES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>

      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="ml-3 mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Synthesizing…" : "Speak"}
      </button>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="mt-6 w-full"
          autoPlay
        />
      )}
    </main>
  );
}
