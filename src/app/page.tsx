import Link from "next/link";
import { MODELS, type Category } from "@/lib/models";
import LogoutButton from "./_components/logout-button";

export default function Home() {
  const tier = process.env.NODE_ENV === "production" ? "prod" : "local";
  // image-to-3d hidden from the index until we self-host. The free ZeroGPU
  // quota on every viable Space (Unique3D, TripoSR, Hunyuan3D, TRELLIS) is
  // too small for a usable demo, and the alternatives hide their Gradio API
  // behind ZeroGPU signed-URL auth. Route + page still exist at /image-to-3d
  // for direct testing once the L20 host is wired up.
  const HIDDEN: Category[] = ["image-to-3d"];

  const entries = (Object.entries(MODELS) as Array<
    [Category, (typeof MODELS)[Category]]
  >)
    .filter(([slug]) => !HIDDEN.includes(slug))
    .map(([slug, cfg], i) => ({
    slug,
    index: String(i + 1).padStart(2, "0"),
    label: cfg.label,
    description: cfg.description,
    model: cfg[tier].id,
    strategy: cfg[tier].strategy,
  }));

  return (
    <main className="relative flex-1">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

      <header className="relative mx-auto flex max-w-6xl items-start justify-between px-8 pt-10">
        <Link href="/" className="flex items-baseline gap-2 text-[15px]">
          <span className="size-2 rounded-full bg-[var(--color-accent)]" />
          <span className="font-mono text-[var(--color-ink-muted)]">
            hf/playground
          </span>
        </Link>
        <LogoutButton />
      </header>

      <section className="relative mx-auto max-w-6xl px-8 pt-24 pb-16">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
          Open‑model studio · tier {tier}
        </p>
        <h1 className="font-display mt-6 text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.02em]">
          Six free models,
          <br />
          <em className="italic text-[var(--color-accent)]">one quiet room.</em>
        </h1>
        <p className="mt-8 max-w-[58ch] text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
          Text, image, speech, audio, background removal, 3D. Each runs on
          a free Hugging Face endpoint or Space. No paid keys, no model
          juggling, no ceremony.
        </p>
      </section>

      <section className="relative mx-auto max-w-6xl px-8 pb-32">
        <div className="mb-6 flex items-baseline justify-between border-b border-[var(--color-line)] pb-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
            Index
          </h2>
          <span className="font-mono text-xs text-[var(--color-ink-faint)]">
            {entries.length.toString().padStart(2, "0")} surfaces
          </span>
        </div>

        <ul>
          {entries.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/${e.slug}`}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-6 border-b border-[var(--color-line)] py-6 transition-colors hover:border-[var(--color-line-strong)]"
              >
                <span className="font-mono text-sm text-[var(--color-ink-faint)] tabular-nums">
                  {e.index}
                </span>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl tracking-tight">
                      {e.label}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                      / {e.strategy}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate font-mono text-xs text-[var(--color-ink-muted)]">
                    {e.model}
                  </p>
                </div>

                <span
                  aria-hidden
                  className="font-mono text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-accent)]"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="relative mx-auto max-w-6xl px-8 pb-12">
        <div className="grid gap-8 border-t border-[var(--color-line)] pt-6 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
              Rate limit
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              10 requests per minute, per IP. Friendly default for a public
              demo.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
              Auth
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Single account, env‑driven. HMAC session cookie, 7 days.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
              Compute
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              ZeroGPU Spaces + HF Inference. Free, queued, surprisingly
              capable.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
