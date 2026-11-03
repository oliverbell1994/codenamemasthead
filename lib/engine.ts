// Loads the engine's rule files from ./engine so prompts always carry the current house rules.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SK = path.join(ROOT, "engine", "skills");
const REF = path.join(ROOT, "engine", "reference");

function read(p: string): string {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}

export function houseRules(): string { return read(path.join(SK, "00-house-rules.md")); }
export function wizardQuestions(): string { return read(path.join(SK, "02-wizard-questions.md")); }
export function briefTemplate(): string { return read(path.join(SK, "03-brand-brief-template.md")); }
export function threeDirections(): string { return read(path.join(SK, "04-three-directions.md")); }
export function accepted(): string { return read(path.join(REF, "accepted.md")); }
export function rejected(): string { return read(path.join(REF, "rejected.md")); }

/** The playbook section for one sector letter, or the whole file if not found. */
export function sectorPlaybook(sector: string): string {
  const all = read(path.join(SK, "01-sector-playbooks.md"));
  if (!sector) return all;
  const re = new RegExp(`## ${sector}\\.[\\s\\S]*?(?=\\n## [A-F]\\.|\\n---|$)`);
  const m = all.match(re);
  return m ? m[0] : all;
}

export function fontsJson(): string { return read(path.join(ROOT, "tools", "fonts.json")); }
