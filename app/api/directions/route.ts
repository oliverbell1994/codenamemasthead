import { NextResponse } from "next/server";
import { client, structured, generateText } from "@/lib/claude";
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
    const { data: planned, usage } = await structured<{ palette: Palette; directions: DirectionSpec[] }>(c, {
      model, system: planSystem(brief), messages: [{ role: "user", content: "Plan the three directions and the palette now." }], tool: PLAN_TOOL, maxTokens: 2500,
      validate: (d) => { const x = d as { palette?: Palette; directions?: DirectionSpec[] }; return !!x && !!x.palette && Array.isArray(x.directions) && x.directions.length === 3 && x.directions.every((s) => s && s.name && s.type && s.type.headings && s.type.body); },
      example: JSON.stringify({ palette: { paper: "#ffffff", ink: "#14202e", panel: "#eef2f7", signature: "#1f3a63", rule: "rgba(20,32,46,.14)" }, directions: [
        { name: "Ledger", why: "Dense catalogue with search and category bar, the shape shops in this sector convert on.", axes: { density: "catalogue", hero: "split", panels: "tinted" }, type: { headings: "Hanken Grotesk", body: "Instrument Sans" } },
        { name: "Atlas", why: "...", axes: { density: "editorial", hero: "product-first", panels: "rules-only" }, type: { headings: "Host Grotesk", body: "Public Sans" } },
        { name: "Lumen", why: "...", axes: { density: "catalogue", hero: "full-bleed", panels: "bordered" }, type: { headings: "Schibsted Grotesk", body: "Albert Sans" } },
      ] }),
    });
    const { palette, directions: specs } = planned;
    if (!specs || specs.length !== 3) return NextResponse.json({ error: "The plan did not contain three directions. Try again or pick another build model." }, { status: 502 });

    // 2. Build three in parallel, gate, one fix pass each if needed
    const build = async (spec: DirectionSpec): Promise<Direction> => {
      const system = buildSystem(brief, spec, palette, specs);
      const ask = `Build the "${spec.name}" homepage now. HTML only.`;
      const first = await generateText(c, { model, system, messages: [{ role: "user", content: ask }], maxTokens: 12000 });
      let html = stripFences(first.text);
      let report = gate(html); let attempts = 1;
      if (!report.pass) {
        const fix = await generateText(c, { model, system, messages: [
          { role: "user", content: ask },
          { role: "assistant", content: html },
          { role: "user", content: fixPrompt(report.fails) },
        ], maxTokens: 12000 });
        html = stripFences(fix.text);
        report = gate(html); attempts = 2;
      }
      return { ...spec, html, gate: report, attempts };
    };
    const directions = await Promise.all(specs.map(build));
    return NextResponse.json({ palette, directions, usage });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
