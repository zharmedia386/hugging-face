"use client";

import { useState } from "react";
import Shell from "../_components/shell";
import { Button, ErrorNote, FieldLabel, OutputBlock } from "../_components/ui";

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
    <Shell
      index="06"
      title="Image → 3D."
      description="TripoSR turns a single image into a .glb mesh. Slow on the free queue — one to three minutes."
    >
      <label className="block">
        <FieldLabel>Source image</FieldLabel>
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
          {loading ? "Sculpting…" : "Generate mesh →"}
        </Button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {meshUrl && (
        <OutputBlock>
          <div className="space-y-4">
            <a
              href={meshUrl}
              download
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
            >
              <span aria-hidden>↓</span> Download .glb
            </a>
            <model-viewer
              src={meshUrl}
              alt="Generated 3D mesh"
              camera-controls
              auto-rotate
              style={{
                width: "100%",
                height: "520px",
                background: "oklch(0.12 0.008 60)",
                borderRadius: "0.375rem",
              }}
            />
            <script
              type="module"
              src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
              async
            />
          </div>
        </OutputBlock>
      )}
    </Shell>
  );
}
