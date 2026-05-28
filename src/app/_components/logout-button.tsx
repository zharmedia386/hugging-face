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
      className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
