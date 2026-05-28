/**
 * Normalize anything thrown into a useful string. The HF SDK and Gradio
 * client both sometimes throw non-Error values (strings, plain objects,
 * Response-like wrappers), which our route handlers had been collapsing to
 * a useless "Inference failed".
 */
export function describeError(e: unknown): string {
  if (e instanceof Error) {
    return e.message || e.name || "Error";
  }
  if (typeof e === "string") return e;
  if (typeof e === "object" && e !== null) {
    const obj = e as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  return String(e);
}
