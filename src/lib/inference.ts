/**
 * Inference router. Dispatches a request to the right backend (Space,
 * HF Inference API, or local server) based on the model's configured strategy.
 */

import { InferenceClient } from "@huggingface/inference";
import { Client as GradioClient } from "@gradio/client";
import { type Category, pickModel } from "./models";

const HF_TOKEN = process.env.HF_TOKEN;

const hf = new InferenceClient(HF_TOKEN);

// ---------- text ----------

export async function generateText(prompt: string): Promise<string> {
  const model = pickModel("text");

  if (model.strategy === "inference") {
    const res = await hf.chatCompletion({
      model: model.id,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  if (model.strategy === "local") {
    // Ollama default endpoint.
    const r = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({ model: model.id, prompt, stream: false }),
    });
    if (!r.ok) throw new Error(`Ollama error: ${r.status}`);
    const j = (await r.json()) as { response: string };
    return j.response;
  }

  throw new Error(`Unsupported strategy for text: ${model.strategy}`);
}

// ---------- image ----------

export async function generateImage(prompt: string): Promise<Blob> {
  const model = pickModel("image");

  if (model.strategy === "space") {
    const client = await GradioClient.connect(model.id, {
      token: HF_TOKEN as `hf_${string}` | undefined,
    });
    const result = await client.predict(model.endpoint ?? "/infer", {
      prompt,
      seed: 0,
      randomize_seed: true,
      width: 1024,
      height: 1024,
      num_inference_steps: 4,
    });
    // Gradio returns image as { url } or a FileData wrapper.
    const data = (result.data as unknown[])[0] as { url?: string; path?: string };
    const url = data.url ?? data.path;
    if (!url) throw new Error("Space returned no image url");
    const r = await fetch(url);
    return await r.blob();
  }

  if (model.strategy === "inference") {
    return await hf.textToImage(
      { model: model.id, inputs: prompt },
      { outputType: "blob" },
    );
  }

  throw new Error(`Unsupported strategy for image: ${model.strategy}`);
}

// ---------- stt ----------

export async function transcribe(audio: Blob): Promise<string> {
  const model = pickModel("stt");

  if (model.strategy === "inference") {
    // SDK supports both legacy `{ data }` and new `{ inputs }`. The legacy
    // form sends as data URL which some providers refuse ("Unsupported data
    // URL"); `inputs` sends raw bytes.
    const res = await hf.automaticSpeechRecognition({
      model: model.id,
      inputs: audio,
    });
    return res.text;
  }

  throw new Error(`Unsupported strategy for stt: ${model.strategy}`);
}

// ---------- tts ----------

/**
 * Kokoro-TTS Space returns audio as the first value of `data`, usually a
 * FileData object `{ url, path, ... }`. We download it to a Blob.
 */
export async function synthesizeSpeech(
  text: string,
  voice = "af_heart",
): Promise<Blob> {
  const model = pickModel("tts");

  if (model.strategy === "inference") {
    // Voice arg is ignored — mms-tts-eng has no voice selector.
    void voice;
    return await hf.textToSpeech({ model: model.id, inputs: text });
  }

  if (model.strategy === "space") {
    const client = await GradioClient.connect(model.id, {
      token: HF_TOKEN as `hf_${string}` | undefined,
    });
    // Remsky/Kokoro-TTS-Zero shape: { text, voice_names: string[], speed: number }
    const result = await client.predict(model.endpoint ?? "/generate_speech_from_ui", {
      text,
      voice_names: [voice],
      speed: 1.0,
    });
    const first = (result.data as unknown[])[0] as
      | { url?: string; path?: string }
      | string;
    const url = typeof first === "string" ? first : (first.url ?? first.path);
    if (!url) throw new Error("TTS Space returned no audio url");
    const r = await fetch(url);
    return await r.blob();
  }

  throw new Error(`Unsupported strategy for tts: ${model.strategy}`);
}

// ---------- bg removal ----------

export async function removeBackground(image: Blob): Promise<Blob> {
  const model = pickModel("bg-removal");
  if (model.strategy !== "space") {
    throw new Error(`Unsupported strategy for bg-removal: ${model.strategy}`);
  }
  const client = await GradioClient.connect(model.id, {
    token: HF_TOKEN as `hf_${string}` | undefined,
  });
  const result = await client.predict(model.endpoint ?? "/image", [image]);
  // BRIA RMBG-2.0 /image returns two outputs: [0]=preview component,
  // [1]=downloadable .png file. We want the transparent PNG (index 1).
  const data = result.data as unknown[];
  const target =
    (data[1] as { url?: string; path?: string } | string | undefined) ??
    (data[0] as { url?: string; path?: string } | string);
  const url =
    typeof target === "string" ? target : (target?.url ?? target?.path);
  if (!url) throw new Error("RMBG Space returned no image url");
  const r = await fetch(url);
  return await r.blob();
}

// ---------- image → 3d ----------

/**
 * Returns a URL pointing to the generated .glb mesh hosted by the Space.
 * We don't download it (could be large) — the client fetches directly.
 */
export async function imageToMesh(image: Blob): Promise<string> {
  const model = pickModel("image-to-3d");
  if (model.strategy !== "space") {
    throw new Error(`Unsupported strategy for image-to-3d: ${model.strategy}`);
  }
  const client = await GradioClient.connect(model.id, {
    token: HF_TOKEN as `hf_${string}` | undefined,
  });
  // Wuvin/Unique3D /generate3dv2 params:
  //   preview_img, input_processing (bg removal), seed, render_video,
  //   do_refine, expansion_weight, init_type
  const result = await client.predict(model.endpoint ?? "/generate3dv2", {
    preview_img: image,
    input_processing: true,
    seed: 0,
    render_video: false,
    do_refine: true,
    expansion_weight: 0.1,
    init_type: "std",
  });
  const data = result.data as unknown[];
  // Returns: [Mesh Model, Preview]. Index 0 is the .glb FileData.
  const first = data[0] as { url?: string; path?: string } | string;
  const url = typeof first === "string" ? first : (first.url ?? first.path);
  if (!url) throw new Error("3D Space returned no mesh url");
  return url;
}

// ---------- dispatcher ----------

export async function runCategory(category: Category, input: unknown) {
  switch (category) {
    case "text":
      return generateText(input as string);
    case "image":
      return generateImage(input as string);
    case "stt":
      return transcribe(input as Blob);
    case "tts":
      return synthesizeSpeech(input as string);
    case "bg-removal":
      return removeBackground(input as Blob);
    case "image-to-3d":
      return imageToMesh(input as Blob);
  }
}
