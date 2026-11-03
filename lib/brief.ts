// The brief: every answer the wizard collects, in one editable object.
// Field ids are the dot-paths the conversation route patches, and the brief panel edits.

export type Ref = { url: string; why: string };
export type Product = { name: string; variant: string; price: string };

export type Brief = {
  meta: { slug: string; created: string; blind_test: boolean; attribution: "founder" | "client" | "mixed" };
  start: { sells: string; sector: "" | "A" | "B" | "C" | "D" | "E" | "F"; regions: string; replacing_site: string; goal_6_months: string };
  defaults: { light_or_dark: string; density: string; imagery_mode: string };
  brand: {
    name: string; wordmark_exact: string; logo_file: string; logo_locked: boolean;
    references_admire: Ref[]; references_dislike: Ref[];
    colours_must: string[]; colours_never: string[]; words_never_site: string[]; words_never_titles: string[];
    imagery_now: boolean; tone_like: string[]; tone_never: string[]; must_differ_from: string[];
  };
  catalogue: { currency: string; delivery_promise: string; trust_facts: string[]; products: Product[] };
  protect: { locked_regions: string[]; approver: string; dispatcher: string; password_until_real_imagery: boolean; never_do: string[] };
};

export const SECTORS: Record<string, { title: string; note: string; light: string; density: string; imagery: string }> = {
  A: { title: "Research supplies / peptides", note: "Light, clinical, dense shop. Certificates, purity, dispatch named.", light: "light", density: "high", imagery: "renders" },
  B: { title: "Beauty / skincare, single product", note: "Monochrome, photography-led, ingredient as the claim.", light: "light", density: "medium", imagery: "photography" },
  C: { title: "Collectibles / trading cards", note: "Product authority, near-black ink, no corporate blue.", light: "light", density: "medium-high", imagery: "photography" },
  D: { title: "Crypto / AI products", note: "Clean, tier-1, few strong sections, no neon.", light: "dark", density: "low", imagery: "screenshots" },
  E: { title: "Wellness / supplements, multi-product", note: "Calm, credible, warm neutrals.", light: "light", density: "medium", imagery: "photography" },
  F: { title: "Clinics and service businesses", note: "Calm authority, real premises and people.", light: "light", density: "low", imagery: "photography" },
};

export function emptyBrief(): Brief {
  return {
    meta: { slug: "", created: "", blind_test: false, attribution: "founder" },
    start: { sells: "", sector: "", regions: "United Kingdom, GBP", replacing_site: "", goal_6_months: "" },
    defaults: { light_or_dark: "default", density: "default", imagery_mode: "default" },
    brand: {
      name: "", wordmark_exact: "", logo_file: "", logo_locked: true,
      references_admire: [], references_dislike: [],
      colours_must: [], colours_never: [], words_never_site: [], words_never_titles: [],
      imagery_now: false, tone_like: [], tone_never: [], must_differ_from: [],
    },
    catalogue: { currency: "GBP", delivery_promise: "", trust_facts: [], products: [] },
    protect: { locked_regions: ["hero", "product page", "checkout"], approver: "", dispatcher: "", password_until_real_imagery: true, never_do: [] },
  };
}

// Field catalogue: label, stage, type, and whether it must be filled before directions can be generated.
export type FieldType = "text" | "textarea" | "sector" | "bool" | "tags" | "refs" | "products" | "choice";
export type FieldDef = { path: string; label: string; stage: "Start" | "Brand" | "Catalogue" | "Protect"; type: FieldType; required?: boolean; help?: string; options?: string[] };

export const FIELDS: FieldDef[] = [
  { path: "start.sells", label: "What you sell, and to whom", stage: "Start", type: "textarea", required: true },
  { path: "start.sector", label: "Sector", stage: "Start", type: "sector", required: true },
  { path: "start.regions", label: "Regions and currencies", stage: "Start", type: "text", required: true },
  { path: "start.replacing_site", label: "Replacing a site that ranks? (URL)", stage: "Start", type: "text" },
  { path: "start.goal_6_months", label: "Six-month goal", stage: "Start", type: "textarea", required: true },
  { path: "defaults.light_or_dark", label: "Light or dark", stage: "Start", type: "choice", options: ["default", "light", "dark"] },
  { path: "defaults.density", label: "Density", stage: "Start", type: "choice", options: ["default", "low", "medium", "high"] },
  { path: "defaults.imagery_mode", label: "Imagery", stage: "Start", type: "choice", options: ["default", "photography", "renders", "screenshots", "illustration"] },
  { path: "brand.name", label: "Brand name", stage: "Brand", type: "text", required: true },
  { path: "brand.wordmark_exact", label: "Wordmark, exactly as written", stage: "Brand", type: "text", required: true },
  { path: "brand.logo_file", label: "Logo file or link", stage: "Brand", type: "text" },
  { path: "brand.logo_locked", label: "Logo locked (never redrawn)", stage: "Brand", type: "bool" },
  { path: "brand.references_admire", label: "Sites you admire", stage: "Brand", type: "refs", required: true },
  { path: "brand.references_dislike", label: "Sites you can't stand", stage: "Brand", type: "refs" },
  { path: "brand.colours_must", label: "Colours that must appear", stage: "Brand", type: "tags" },
  { path: "brand.colours_never", label: "Colours that must never appear", stage: "Brand", type: "tags" },
  { path: "brand.words_never_site", label: "Words never on the site", stage: "Brand", type: "tags" },
  { path: "brand.words_never_titles", label: "Words never in page titles", stage: "Brand", type: "tags" },
  { path: "brand.imagery_now", label: "Imagery available now", stage: "Brand", type: "bool" },
  { path: "brand.tone_like", label: "Tone: sounds like", stage: "Brand", type: "tags" },
  { path: "brand.tone_never", label: "Tone: never sounds like", stage: "Brand", type: "tags" },
  { path: "brand.must_differ_from", label: "Must look nothing like (your own sites)", stage: "Brand", type: "tags" },
  { path: "catalogue.delivery_promise", label: "Delivery promise", stage: "Catalogue", type: "text", required: true },
  { path: "catalogue.trust_facts", label: "Trust facts", stage: "Catalogue", type: "tags", required: true },
  { path: "catalogue.products", label: "Products and prices", stage: "Catalogue", type: "products", required: true },
  { path: "protect.locked_regions", label: "Locked regions once converting", stage: "Protect", type: "tags" },
  { path: "protect.approver", label: "Approves designs", stage: "Protect", type: "text" },
  { path: "protect.dispatcher", label: "Handles dispatch", stage: "Protect", type: "text" },
  { path: "protect.password_until_real_imagery", label: "Password until real imagery", stage: "Protect", type: "bool" },
  { path: "protect.never_do", label: "Never do", stage: "Protect", type: "tags" },
];

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
export function setPath<T extends object>(obj: T, path: string, value: unknown): T {
  const copy = structuredClone(obj) as T;
  const keys = path.split(".");
  let cur = copy as unknown as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof cur[keys[i]] !== "object" || cur[keys[i]] === null) cur[keys[i]] = {};
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return copy;
}
export function applyPatch(brief: Brief, patch: Record<string, unknown>): Brief {
  let b = brief;
  for (const [k, v] of Object.entries(patch || {})) {
    if (!FIELDS.some((f) => f.path === k) && !k.startsWith("meta.")) continue;
    b = setPath(b, k, v);
  }
  if (b.brand.name && !b.meta.slug) b = setPath(b, "meta.slug", slugify(b.brand.name));
  if (b.brand.name && !b.brand.wordmark_exact) b = setPath(b, "brand.wordmark_exact", b.brand.name);
  return b;
}
export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function isFilled(brief: Brief, f: FieldDef): boolean {
  const v = getPath(brief, f.path);
  if (f.type === "refs") return Array.isArray(v) && (v as Ref[]).some((r) => r.url?.trim());
  if (f.type === "products") return Array.isArray(v) && (v as Product[]).filter((p) => p.name?.trim() && p.price?.trim()).length >= 3;
  if (f.type === "tags") return Array.isArray(v) && v.length > 0;
  if (f.type === "bool") return true;
  if (f.type === "choice") return true;
  return typeof v === "string" && v.trim().length > 0;
}
export function missingRequired(brief: Brief): FieldDef[] {
  return FIELDS.filter((f) => f.required && !isFilled(brief, f));
}
export function progress(brief: Brief): number {
  const req = FIELDS.filter((f) => f.required);
  return req.filter((f) => isFilled(brief, f)).length / req.length;
}

// answers.yaml, identical in shape to brands/answers.template.yaml so the Claude Code pipeline can read it.
const yq = (v: unknown) => '"' + String(v ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const ylist = (arr: string[], ind: string) => (!arr || !arr.length ? " []\n" : "\n" + arr.map((v) => `${ind}- ${yq(v)}`).join("\n") + "\n");
export function toYaml(b: Brief): string {
  const d = SECTORS[b.start.sector] || SECTORS.A;
  const regions = b.start.regions.split(/[;\n]/).map((x) => x.trim()).filter(Boolean).map((x) => { const m = x.match(/^(.*?),\s*([A-Z]{3})$/); return m ? [m[1], m[2]] : [x, ""]; });
  const refs = (arr: Ref[]) => arr.filter((r) => r.url?.trim()).map((r) => `    - { url: ${yq(r.url)}, why: ${yq(r.why)} }`).join("\n") || "    []";
  const prods = b.catalogue.products.filter((p) => p.name?.trim()).map((p) => `        - { name: ${yq(p.name)}, variant: ${yq(p.variant)}, price: ${yq(p.price)} }`).join("\n") || "        []";
  return `# Masthead answers — studio v0.3
meta:
  slug: ${yq(b.meta.slug)}
  created: ${yq(b.meta.created)}
  wizard_version: 0.3
  blind_test: ${b.meta.blind_test}
  attribution: ${b.meta.attribution}

start:
  sells: ${yq(b.start.sells)}
  sector: ${yq(b.start.sector)}
  regions:
${regions.map((r) => `    - { country: ${yq(r[0])}, currency: ${yq(r[1])} }`).join("\n") || "    []"}
  replacing_site: ${yq(b.start.replacing_site)}
  goal_6_months: ${yq(b.start.goal_6_months)}

brand:
  name: ${yq(b.brand.name)}
  wordmark_exact: ${yq(b.brand.wordmark_exact)}
  logo_file: ${yq(b.brand.logo_file)}
  logo_locked: ${b.brand.logo_locked}
  references_admire:
${refs(b.brand.references_admire)}
  references_dislike:
${refs(b.brand.references_dislike)}
  colours_must:${ylist(b.brand.colours_must, "    ")}  colours_never:${ylist(b.brand.colours_never, "    ")}  words_never_site:${ylist(b.brand.words_never_site, "    ")}  words_never_titles:${ylist(b.brand.words_never_titles, "    ")}  light_or_dark: ${yq(b.defaults.light_or_dark)}   # sector default: ${d.light}
  imagery_mode: ${yq(b.defaults.imagery_mode)}   # sector default: ${d.imagery}
  density: ${yq(b.defaults.density)}   # sector default: ${d.density}
  imagery_now: ${b.brand.imagery_now}
  tone_like:${ylist(b.brand.tone_like, "    ")}  tone_never:${ylist(b.brand.tone_never, "    ")}  must_differ_from:${ylist(b.brand.must_differ_from, "    ")}
catalogue:
  currency: ${yq(b.catalogue.currency)}
  delivery_promise: ${yq(b.catalogue.delivery_promise)}
  trust_facts:${ylist(b.catalogue.trust_facts, "    ")}  groups:
    - name: "Catalogue"
      products:
${prods}

protect:
  locked_regions:${ylist(b.protect.locked_regions, "    ")}  approver: ${yq(b.protect.approver)}
  dispatcher: ${yq(b.protect.dispatcher)}
  password_until_real_imagery: ${b.protect.password_until_real_imagery}
  never_do:${ylist(b.protect.never_do, "    ")}`;
}
