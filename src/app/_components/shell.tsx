import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "./logout-button";

interface ShellProps {
  /** Number prefix shown above the title, e.g. "03". */
  index: string;
  title: string;
  /** Short description rendered below the title. */
  description: string;
  /** Optional model id shown in monospaced caption. */
  model?: string;
  children: ReactNode;
}

export default function Shell({
  index,
  title,
  description,
  model,
  children,
}: ShellProps) {
  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-4xl items-start justify-between px-8 pt-10">
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Index
        </Link>
        <LogoutButton />
      </header>

      <section className="mx-auto max-w-4xl px-8 pt-20 pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
          {index} · {model ?? ""}
        </p>
        <h1 className="font-display mt-5 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-6 max-w-[58ch] text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          {description}
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-8 pb-24">{children}</section>
    </main>
  );
}
