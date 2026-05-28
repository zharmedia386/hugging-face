"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)] disabled:opacity-40"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
