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

type ToolDef = { name: string; description: string; input_schema: Record<string, unknown> };
type Msg = { role: "user" | "assistant"; content: string };

function textOf(res: Anthropic.Message): string {
  return res.content.filter((b) => b.type === "text").map((b) => (b.type === "text" ? b.text : "")).join("");
}
function parseJsonLoose(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const i = body.indexOf("{"); const j = body.lastIndexOf("}");
  if (i < 0 || j <= i) return null;
  try { return JSON.parse(body.slice(i, j + 1)); } catch { return null; }
}

/**
 * Get a structured answer from the model.
 * 1. Forced tool call. 2. If the model rejects forced tool_choice: auto tool choice with a strong instruction.
 * 3. If the result fails validation: one JSON-only request with an example of the shape.
 * Throws with a snippet of what the model said if all three fail.
 */
export async function structured<T>(c: Anthropic, args: {
  model: string; system: string; messages: Msg[]; tool: ToolDef; maxTokens?: number;
  validate?: (d: unknown) => boolean; example?: string;
}): Promise<{ data: T; usage: unknown }> {
  const ok = args.validate ?? (() => true);
  const base = { model: args.model, max_tokens: args.maxTokens ?? 1500, messages: args.messages };
  let res: Anthropic.Message | null = null;
  let lastText = "";
  try {
    res = await c.messages.create({ ...base, system: args.system, tools: [args.tool as never], tool_choice: { type: "tool", name: args.tool.name } });
  } catch (e) {
    const msg = (e as Error).message || "";
    if (!/tool_choice/i.test(msg)) throw e;
    res = await c.messages.create({
      ...base, tools: [args.tool as never], tool_choice: { type: "auto" },
      system: args.system + `\n\nIMPORTANT: respond by calling the tool "${args.tool.name}" exactly once with every required field. Do not answer in prose.`,
    });
  }
  const block = res.content.find((b) => b.type === "tool_use");
  if (block && block.type === "tool_use" && ok(block.input)) return { data: block.input as T, usage: res.usage };
  lastText = textOf(res);
  const loose = parseJsonLoose(lastText);
  if (loose && ok(loose)) return { data: loose as T, usage: res.usage };

  // JSON-only retry with an example of the shape
  const schema = JSON.stringify(args.tool.input_schema);
  const res2 = await c.messages.create({
    ...base,
    system: args.system + `\n\nRespond with ONE JSON object only, no prose, no markdown fences. It must match this JSON schema: ${schema}${args.example ? `\nExample of the shape: ${args.example}` : ""}`,
  });
  lastText = textOf(res2);
  const loose2 = parseJsonLoose(lastText);
  if (loose2 && ok(loose2)) return { data: loose2 as T, usage: res2.usage };
  throw new Error(`The model did not return the expected structure. It said: "${lastText.slice(0, 240).replace(/\s+/g, " ")}". Try another build model in the header.`);
}
