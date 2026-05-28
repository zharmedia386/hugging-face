"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, ErrorNote, FieldLabel, Input } from "../_components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Login failed");
      router.replace(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-5">
      <label className="block">
        <FieldLabel>Email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <FieldLabel>Password</FieldLabel>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••••••"
        />
      </label>

      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in →"}
        </Button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col">
      <div className="grid-bg pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8 py-16">
        <div className="mb-12 flex items-baseline gap-2">
          <span className="size-2 rounded-full bg-[var(--color-accent)]" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            hf/playground
          </span>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
          Restricted
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.5rem,6vw,4rem)] leading-[1] tracking-[-0.02em]">
          Sign in to <em className="italic text-[var(--color-accent)]">continue.</em>
        </h1>
        <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          Single‑account studio. One key opens the door.
        </p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
