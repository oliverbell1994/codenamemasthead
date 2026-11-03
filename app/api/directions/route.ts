import { NextResponse } from "next/server";
import { client } from "@/lib/claude";
import { planSystem, buildSystem, fixPrompt, type DirectionSpec, type Palette } from "@/lib/prompts";
import { gate, type GateReport } from "@/lib/gate";
import { missingRequired, type Brief } from "@/lib/brief";

export const runtime = "nodejs";
export const maxDuration = 300;

const PLAN_TOOL = {
  name: "plan",
  description: "Three direction specs and a palette.",
  input_schema: {
    type: "object" as const,
    properties: {
      palette: { type: "object", properties: { paper: { type: "string" }, ink: { type: "string" }, panel: { type: "string" }, signature: { type: "string" }, rule: { type: "string" } }, required: ["paper", "ink", "panel", "signature", "rule"] },
      directions: {
        type: "array", minItems: 3, maxItems: 3,
        items: { type: "object", properties: {
          name: { type: "string" }, why: { type: "string" },
          axes: { type: "object", additionalProperties: { type: "string" } },
          type: { type: "object", properties: { headings: { type: "string" }, body: { type: "string" } }, required: ["headings", "body"] },
        }, required: ["name", "why", "axes", "type"] },
      },
    },
    required: ["palette", "directions"],
  },
};

function stripFences(s: string): string {
  const m = s.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const body = m ? m[1] : s;
  const i = body.indexOf("<!doctype"); const j = body.toLowerCase().indexOf("<!doctype");
  const k = i >= 0 ? i : j;
  return (k >= 0 ? body.slice(k) : body).trim();
}

export type Direction = { name: string; why: string; axes: Record<string, string>; type: { headings: string; body: string }; html: string; gate: GateReport; attempts: number };

export async function POST(req: Request) {
  try {
    const { brief, model } = (await req.json()) as { brief: Brief; model: string };
    if (!model) return NextResponse.json({ error: "No build model selected." }, { status: 400 });
    const missing = missingRequired(brief);
    if (missing.length) return NextResponse.json({ error: `Brief incomplete: ${missing.map((m) => m.label).join(", ")}` }, { status: 400 });
    const c = client();

    // 1. Plan
    const plan = await c.messages.create({
      model, max_tokens: 1500, system: planSystem(brief),
      messages: [{ role: "user", content: "Plan the three directions and the palette now." }],
      tools: [PLAN_TOOL], tool_choice: { type: "tool", name: "plan" },
    });
    const pb = plan.content.find((b) => b.type === "tool_use");
    if (!pb || pb.type !== "tool_use") return NextResponse.json({ error: "No plan from the model." }, { status: 502 });
    const { palette, directions: specs } = pb.input as { palette: Palette; directions: DirectionSpec[] };

    // 2. Build three in parallel, gate, one fix pass each if needed
    const build = async (spec: DirectionSpec): Promise<Direction> => {
      const system = buildSystem(brief, spec, palette, specs);
      const first = await c.messages.create({ model, max_tokens: 16000, system, messages: [{ role: "user", content: `Build the "${spec.name}" homepage now. HTML only.` }] });
      let html = stripFences(first.content.filter((b) => b.type === "text").map((b) => (b.type === "text" ? b.text : "")).join(""));
      let report = gate(html); let attempts = 1;
      if (!report.pass) {
        const fix = await c.messages.create({ model, max_tokens: 16000, system, messages: [
          { role: "user", content: `Build the "${spec.name}" homepage now. HTML only.` },
          { role: "assistant", content: html },
          { role: "user", content: fixPrompt(report.fails) },
        ] });
        html = stripFences(fix.content.filter((b) => b.type === "text").map((b) => (b.type === "text" ? b.text : "")).join(""));
        report = gate(html); attempts = 2;
      }
      return { ...spec, html, gate: report, attempts };
    };
    const directions = await Promise.all(specs.map(build));
    return NextResponse.json({ palette, directions, usage: plan.usage });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
