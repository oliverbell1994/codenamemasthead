import { NextResponse } from "next/server";
import { client } from "@/lib/claude";
import { converseSystem } from "@/lib/prompts";
import { applyPatch, missingRequired, type Brief } from "@/lib/brief";

export const runtime = "nodejs";
export const maxDuration = 60;

type Msg = { role: "user" | "assistant"; content: string };

const RESPOND_TOOL = {
  name: "respond",
  description: "Reply to the owner and patch the brief.",
  input_schema: {
    type: "object" as const,
    properties: {
      say: { type: "string" },
      patch: { type: "object", additionalProperties: true },
      suggestions: { type: "array", items: { type: "string" }, maxItems: 4 },
      asking: { type: "string" },
      complete: { type: "boolean" },
    },
    required: ["say", "patch", "suggestions", "asking", "complete"],
  },
};

export async function POST(req: Request) {
  try {
    const { brief, messages, model } = (await req.json()) as { brief: Brief; messages: Msg[]; model: string };
    if (!model) return NextResponse.json({ error: "No model selected." }, { status: 400 });
    const c = client();
    const history: Msg[] = (messages || []).slice(-24);
    if (!history.length || history[history.length - 1].role !== "user") history.push({ role: "user", content: "(The owner has opened the studio. Ask the first unanswered question.)" });

    const res = await c.messages.create({
      model,
      max_tokens: 1200,
      system: converseSystem(brief),
      messages: history,
      tools: [RESPOND_TOOL],
      tool_choice: { type: "tool", name: "respond" },
    });
    const block = res.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") return NextResponse.json({ error: "No structured reply from the model." }, { status: 502 });
    const out = block.input as { say: string; patch: Record<string, unknown>; suggestions: string[]; asking: string; complete: boolean };
    const next = applyPatch(brief, out.patch || {});
    const complete = missingRequired(next).length === 0;
    return NextResponse.json({
      say: out.say, patch: out.patch || {}, suggestions: out.suggestions || [], asking: out.asking || "", complete,
      brief: next,
      usage: res.usage,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
