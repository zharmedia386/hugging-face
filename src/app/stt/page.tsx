"use client";

import { useState } from "react";
import Shell from "../_components/shell";
import { Button, ErrorNote, FieldLabel, OutputBlock } from "../_components/ui";

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
    <Shell
      index="03"
      title="Speech → text."
      description="Whisper transcribes an audio clip to text. MP3, WAV, M4A all welcome."
    >
      <label className="block">
        <FieldLabel>Audio file</FieldLabel>
        <div className="rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-6">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[var(--color-ink-muted)] file:mr-4 file:rounded-sm file:border-0 file:bg-[var(--color-surface-2)] file:px-3 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-wider file:text-[var(--color-ink)] hover:file:bg-[var(--color-line)]"
          />
          {file && (
            <p className="mt-3 font-mono text-xs text-[var(--color-ink-faint)]">
              {file.name} · {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
      </label>

      <div className="mt-5">
        <Button onClick={submit} disabled={loading || !file}>
          {loading ? "Listening…" : "Transcribe →"}
        </Button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {output && (
        <OutputBlock>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-[var(--color-ink)]">
            {output}
          </pre>
        </OutputBlock>
      )}
    </Shell>
  );
}
