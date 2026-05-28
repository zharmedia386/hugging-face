import Link from "next/link";
import { MODELS } from "@/lib/models";
import LogoutButton from "./_components/logout-button";

export default function Home() {
  const tier = process.env.NODE_ENV === "production" ? "prod" : "local";
  const categories = Object.entries(MODELS) as Array<
    [keyof typeof MODELS, (typeof MODELS)[keyof typeof MODELS]]
  >;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">HF Playground</h1>
          <p className="mt-3 text-zinc-500">
            Free Hugging Face models, one site. Current tier:{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              {tier}
            </span>
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {categories.map(([slug, cfg]) => (
          <Link
            key={slug}
            href={`/${slug}`}
            className="rounded-lg border border-zinc-200 p-5 transition hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-200"
          >
            <h2 className="text-lg font-semibold">{cfg.label}</h2>
            <p className="mt-1 text-sm text-zinc-500">{cfg.description}</p>
            <p className="mt-3 font-mono text-xs text-zinc-400">
              {cfg[tier].id}
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-16 text-xs text-zinc-400">
        Rate limit: 10 req/min per IP. Set <code>HF_TOKEN</code> for higher
        quota.
      </footer>
    </main>
  );
}
