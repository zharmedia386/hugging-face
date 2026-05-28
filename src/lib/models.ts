/**
 * Model registry.
 *
 * Each category maps to a `prod` and `local` model + the preferred execution
 * strategy. The router (see `inference.ts`) picks based on NODE_ENV.
 *
 * Strategy values:
 *  - "space"     → call a HuggingFace Space via @gradio/client (free, ZeroGPU when available)
 *  - "inference" → call HF Inference API via @huggingface/inference (free tier, rate-limited)
 *  - "local"     → call a locally-running server (e.g. Ollama on 11434) — dev only
 *
 * Env overrides:
 *   Each field can be overridden without code change. Format:
 *     HF_MODEL_<CATEGORY>_<TIER>_<FIELD>
 *
 *   CATEGORY: TEXT | IMAGE | STT | TTS | BG_REMOVAL | IMAGE_TO_3D
 *   TIER:     PROD | LOCAL
 *   FIELD:    ID | STRATEGY | ENDPOINT
 *
 *   Examples:
 *     HF_MODEL_TEXT_LOCAL_ID=llama3.2:3b
 *     HF_MODEL_IMAGE_PROD_ID=black-forest-labs/FLUX.1-dev
 *     HF_MODEL_TTS_PROD_STRATEGY=inference
 */

export type Category =
  | "text"
  | "image"
  | "stt"
  | "tts"
  | "bg-removal"
  | "image-to-3d";

export type Tier = "prod" | "local";

export type Strategy = "space" | "inference" | "local";

export interface ModelConfig {
  /** HF model id OR Space id (owner/space) depending on strategy. */
  id: string;
  strategy: Strategy;
  /** Optional Gradio endpoint name when strategy="space". */
  endpoint?: string;
}

export interface CategoryConfig {
  label: string;
  description: string;
  prod: ModelConfig;
  local: ModelConfig;
}

/** Built-in defaults. Override via env (see top of file). */
const DEFAULTS: Record<Category, CategoryConfig> = {
  text: {
    label: "Text Generation",
    description: "Chat / completion via open LLM",
    prod: {
      // Apache 2.0, ungated, served on HF Inference Providers free tier.
      // Llama-3.3-70B was the original pick but Meta gating + PRO requirement
      // made it 401 for fresh accounts.
      id: "Qwen/Qwen2.5-7B-Instruct",
      strategy: "inference",
    },
    local: {
      id: "qwen2.5:1.5b",
      strategy: "local",
    },
  },
  image: {
    label: "Image Generation",
    description: "Text → image",
    prod: {
      // FLUX.1-schnell via HF Inference (not the Space — Space is ZeroGPU and
      // cold-starts past Cloudflare's 100s edge timeout).
      id: "black-forest-labs/FLUX.1-schnell",
      strategy: "inference",
    },
    local: {
      id: "stabilityai/sd-turbo",
      strategy: "inference",
    },
  },
  stt: {
    label: "Speech → Text",
    description: "Audio transcription via Whisper",
    prod: { id: "openai/whisper-large-v3", strategy: "inference" },
    local: { id: "openai/whisper-tiny", strategy: "inference" },
  },
  tts: {
    label: "Text → Speech",
    description: "Voice synthesis via Kokoro",
    prod: {
      // Kokoro-82M via a Space that exposes a public Gradio API.
      // Original hexgrad/Kokoro-TTS hides /gradio_api/info; this fork doesn't.
      // mms-tts-eng (HF Inference) was tried first but errored
      // "No Inference Provider available" — many TTS models are no longer
      // routed by HF's serverless Inference in 2026.
      id: "Remsky/Kokoro-TTS-Zero",
      strategy: "space",
      endpoint: "/generate_speech_from_ui",
    },
    local: {
      id: "Remsky/Kokoro-TTS-Zero",
      strategy: "space",
      endpoint: "/generate_speech_from_ui",
    },
  },
  "bg-removal": {
    label: "Background Removal",
    description: "Strip image background with RMBG",
    prod: {
      // BRIA RMBG-2.0 Space — confirmed endpoint via /gradio_api/info is
      // `/image`, NOT `/predict` (our earlier guess).
      id: "briaai/BRIA-RMBG-2.0",
      strategy: "space",
      endpoint: "/image",
    },
    local: {
      id: "briaai/BRIA-RMBG-2.0",
      strategy: "space",
      endpoint: "/image",
    },
  },
  "image-to-3d": {
    label: "Image → 3D",
    description: "Single image to .glb mesh (Unique3D)",
    prod: {
      // Unique3D Space exposes /generate3dv2 publicly.
      // TripoSR was the original pick but its Gradio API is hidden behind
      // ZeroGPU auth — /gradio_api/info returns empty endpoints.
      id: "Wuvin/Unique3D",
      strategy: "space",
      endpoint: "/generate3dv2",
    },
    local: {
      id: "Wuvin/Unique3D",
      strategy: "space",
      endpoint: "/generate3dv2",
    },
  },
};

// ---------- env override resolver ----------

const VALID_STRATEGIES: Strategy[] = ["space", "inference", "local"];

/** Convert "image-to-3d" → "IMAGE_TO_3D" for env var lookup. */
function envKey(cat: Category): string {
  return cat.toUpperCase().replace(/-/g, "_");
}

function applyEnvOverrides(
  cat: Category,
  tier: Tier,
  base: ModelConfig,
): ModelConfig {
  const prefix = `HF_MODEL_${envKey(cat)}_${tier.toUpperCase()}`;

  const id = process.env[`${prefix}_ID`] ?? base.id;

  const stratRaw = process.env[`${prefix}_STRATEGY`];
  const strategy =
    stratRaw && (VALID_STRATEGIES as string[]).includes(stratRaw)
      ? (stratRaw as Strategy)
      : base.strategy;

  const endpoint = process.env[`${prefix}_ENDPOINT`] ?? base.endpoint;

  return { id, strategy, endpoint };
}

/**
 * Resolve a category to its active config, applying env overrides for both
 * tiers. Memoized per process — env doesn't change at runtime.
 */
const cache = new Map<Category, CategoryConfig>();

export function getCategory(cat: Category): CategoryConfig {
  const cached = cache.get(cat);
  if (cached) return cached;

  const base = DEFAULTS[cat];
  const resolved: CategoryConfig = {
    label: base.label,
    description: base.description,
    prod: applyEnvOverrides(cat, "prod", base.prod),
    local: applyEnvOverrides(cat, "local", base.local),
  };
  cache.set(cat, resolved);
  return resolved;
}

/**
 * Full resolved registry (env overrides applied). Use this everywhere.
 * Defined as a Proxy so iteration / Object.entries works lazily.
 */
export const MODELS: Record<Category, CategoryConfig> = Object.fromEntries(
  (Object.keys(DEFAULTS) as Category[]).map((c) => [c, getCategory(c)]),
) as Record<Category, CategoryConfig>;

export function pickModel(category: Category): ModelConfig {
  const tier: Tier =
    process.env.NODE_ENV === "production" ? "prod" : "local";
  return getCategory(category)[tier];
}
