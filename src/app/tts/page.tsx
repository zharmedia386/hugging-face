"use client";

import { useState } from "react";
import Shell from "../_components/shell";
import { Button, ErrorNote, FieldLabel, OutputBlock, Textarea } from "../_components/ui";

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
    <Shell
      index="04"
      title={`Text → speech.`}
      description="Kokoro-82M reads what you write. Pick a voice, hit play."
    >
      <label className="block">
        <FieldLabel>Script</FieldLabel>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What should I say?"
        />
      </label>

      <div className="mt-5">
        <FieldLabel>Voice</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVoice(v.id)}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                voice === v.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                  : "border-[var(--color-line)] text-[var(--color-ink-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={submit} disabled={loading || !text.trim()}>
          {loading ? "Synthesizing…" : "Speak →"}
        </Button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {audioUrl && (
        <OutputBlock>
          <audio controls src={audioUrl} autoPlay className="w-full" />
        </OutputBlock>
      )}
    </Shell>
  );
}
