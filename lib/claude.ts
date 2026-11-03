import Anthropic from "@anthropic-ai/sdk";

export function client(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key.");
  return new Anthropic({ apiKey: key });
}

/** Model ids available to this key, newest first, with a sensible default for each job. */
export async function listModels(): Promise<{ id: string; name: string }[]> {
  const c = client();
  const out: { id: string; name: string }[] = [];
  for await (const m of c.models.list({ limit: 100 })) out.push({ id: m.id, name: m.display_name });
  return out;
}

export function pickDefault(models: { id: string }[], prefer: string[]): string {
  for (const p of prefer) { const hit = models.find((m) => m.id.includes(p)); if (hit) return hit.id; }
  return models[0]?.id || "";
}

export const PREFER_CONVERSE = ["sonnet-5", "sonnet-4-5", "sonnet", "haiku-5", "haiku"];
export const PREFER_BUILD = ["opus-5", "opus-4", "opus", "sonnet-5", "sonnet"];
