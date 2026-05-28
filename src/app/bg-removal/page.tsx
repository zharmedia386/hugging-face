"use client";

import { useState } from "react";
import Shell from "../_components/shell";
import { Button, ErrorNote, FieldLabel, OutputBlock } from "../_components/ui";

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
    <Shell
      index="05"
      title="Background removal."
      description="RMBG isolates the subject and returns a transparent PNG."
    >
      <label className="block">
        <FieldLabel>Image</FieldLabel>
        <div className="rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-6">
          <input
            type="file"
            accept="image/*"
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
          {loading ? "Removing…" : "Strip background →"}
        </Button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {resultUrl && (
        <OutputBlock>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="bg removed"
            className="w-full rounded-sm bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23262422%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23262422%22/></svg>')]"
          />
        </OutputBlock>
      )}
    </Shell>
  );
}
