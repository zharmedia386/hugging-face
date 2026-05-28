"use client";

import { useState } from "react";
import Shell from "../_components/shell";
import { Button, ErrorNote, FieldLabel, Input, OutputBlock } from "../_components/ui";

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
    <Shell
      index="02"
      title="Image generation."
      description="FLUX.1 via a free ZeroGPU Space. The first call can take 30 to 60 seconds while the queue warms."
    >
      <label className="block">
        <FieldLabel>Prompt</FieldLabel>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cyberpunk fox riding a skateboard, golden hour…"
        />
      </label>

      <div className="mt-5">
        <Button onClick={submit} disabled={loading || !prompt.trim()}>
          {loading ? "Painting…" : "Generate →"}
        </Button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {imgUrl && (
        <OutputBlock>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt="generated"
            className="w-full rounded-sm"
          />
        </OutputBlock>
      )}
    </Shell>
  );
}
