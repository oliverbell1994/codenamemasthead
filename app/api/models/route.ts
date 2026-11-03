import { NextResponse } from "next/server";
import { listModels, pickDefault, PREFER_CONVERSE, PREFER_BUILD } from "@/lib/claude";

export const runtime = "nodejs";

export async function GET() {
  try {
    const models = await listModels();
    return NextResponse.json({
      models,
      defaults: {
        converse: process.env.MASTHEAD_MODEL_CONVERSE || pickDefault(models, PREFER_CONVERSE),
        build: process.env.MASTHEAD_MODEL_BUILD || pickDefault(models, PREFER_BUILD),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
