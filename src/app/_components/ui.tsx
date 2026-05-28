"use client";

import type { ButtonHTMLAttributes, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "block w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface-2)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldBase} min-h-[140px] resize-y leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
      {children}
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:brightness-110"
      : "border border-[var(--color-line)] text-[var(--color-ink-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]";
  return (
    <button
      {...rest}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 font-mono text-[12px] uppercase tracking-[0.14em] transition-all disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-md border border-[var(--color-danger-soft)] bg-[oklch(0.22_0.05_25)] px-3.5 py-3 text-sm text-[var(--color-danger)]">
      {children}
    </p>
  );
}

export function OutputBlock({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-faint)]">
        Output
      </p>
      {children}
    </div>
  );
}
