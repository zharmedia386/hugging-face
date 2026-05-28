"use client";

import { useState } from "react";
import Shell from "../_components/shell";
import {
  Button,
  ErrorNote,
  FieldLabel,
  OutputBlock,
  Textarea,
} from "../_components/ui";

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
    <Shell
      index="01"
      title="Text generation."
      description="An open instruction-tuned LLM. Ask it anything, get a single block of prose back."
    >
      <label className="block">
        <FieldLabel>Prompt</FieldLabel>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What should the machine think about?"
        />
      </label>

      <div className="mt-5">
        <Button onClick={submit} disabled={loading || !prompt.trim()}>
          {loading ? "Generating…" : "Generate →"}
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
