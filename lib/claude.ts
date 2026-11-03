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

/**
 * Get a structured answer from the model. Tries a forced tool call first; if the model
 * does not support forced tool_choice, retries with auto and a strong instruction, and
 * finally falls back to parsing a JSON object out of the text.
 */
export async function structured<T>(c: Anthropic, args: { model: string; system: string; messages: Msg[]; tool: ToolDef; maxTokens?: number }): Promise<{ data: T; usage: unknown }> {
  const base = { model: args.model, max_tokens: args.maxTokens ?? 1500, messages: args.messages, tools: [args.tool as never] };
  let res;
  try {
    res = await c.messages.create({ ...base, system: args.system, tool_choice: { type: "tool", name: args.tool.name } });
  } catch (e) {
    const msg = (e as Error).message || "";
    if (!/tool_choice/i.test(msg)) throw e;
    res = await c.messages.create({
      ...base,
      system: args.system + `\n\nIMPORTANT: respond by calling the tool "${args.tool.name}" exactly once with the required fields. If you cannot call tools, respond with a single JSON object matching the tool's input schema and nothing else.`,
      tool_choice: { type: "auto" },
    });
  }
  const block = res.content.find((b) => b.type === "tool_use");
  if (block && block.type === "tool_use") return { data: block.input as T, usage: res.usage };
  const text = res.content.filter((b) => b.type === "text").map((b) => (b.type === "text" ? b.text : "")).join("");
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return { data: JSON.parse(m[0]) as T, usage: res.usage }; } catch { /* fall through */ } }
  throw new Error("The model did not return a structured answer. Try a different model in the header.");
}
