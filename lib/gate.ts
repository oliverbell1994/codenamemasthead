// TypeScript port of tools/gate.py — the forbidden-list linter (engine/skills/00-house-rules.md §9).
// Kept in step with the Python version by hand; both read tools/fonts.json and tools/phrases.json.
import fs from "node:fs";
import path from "node:path";

export type Finding = { rule: string; msg: string };
export type GateReport = { pass: boolean; fails: Finding[]; warns: Finding[] };

type Fonts = { curated_free: string[]; curated_commercial: string[]; serif_granted_only: string[]; mono_data_only: string[]; generic_allowed: string[]; banned_as_default: string[] };
type Phrases = { banned: string[]; warn: string[] };

const TOOLS = path.join(process.cwd(), "tools");
function loadJson<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(file, "utf8")) as T; } catch { return fallback; }
}
const FONTS = loadJson<Fonts>(path.join(TOOLS, "fonts.json"), { curated_free: [], curated_commercial: [], serif_granted_only: [], mono_data_only: [], generic_allowed: [], banned_as_default: [] });
const PHRASES = loadJson<Phrases>(path.join(TOOLS, "phrases.json"), { banned: [], warn: [] });

const norm = (s: string) => s.trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, " ").toLowerCase();
const ALLOWED = new Set([...FONTS.curated_free, ...FONTS.curated_commercial, ...FONTS.serif_granted_only, ...FONTS.mono_data_only, ...FONTS.generic_allowed].map(norm));
const SERIF = new Set(FONTS.serif_granted_only.map(norm));
const BANNED = new Set(FONTS.banned_as_default.map(norm));
const GENERIC = new Set(FONTS.generic_allowed.map(norm));
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

function px(v: string): number | null {
  const m = v.trim().match(/^(-?[\d.]+)(px|rem|em|%|vw|vh)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]); const u = m[2] || "px";
  if (u === "px") return n; if (u === "rem" || u === "em") return n * 16; return null;
}
function hsl(hex: string): [number, number, number] | null {
  let h = hex.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); const l = (max + min) / 2; let hh = 0, s = 0;
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    hh = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; }
  return [hh, s, l];
}
function visibleText(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
}

export function gate(html: string): GateReport {
  const fails: Finding[] = [], warns: Finding[] = [];
  const fail = (rule: string, msg: string) => fails.push({ rule, msg });
  const warn = (rule: string, msg: string) => warns.push({ rule, msg });

  let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  css += "\n" + [...html.matchAll(/style="([^"]*)"/gi)].map((m) => m[1]).join("\n");
  const lines = css.split("\n");

  for (const ln of lines) {
    if (!/allow: (radius|pill)/.test(ln)) {
      for (const m of ln.matchAll(/border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)/g)) {
        for (const v of m[1].split(/\s+/)) {
          if (v === "50%" || v === "100%" || v.includes("9999") || v.includes("999px") || v.endsWith("vmax")) { fail("pill", `pill/circle radius '${v}' — pills are not granted (00 §3)`); break; }
          const p = px(v); if (p !== null && p > 6) { fail("radius", `border-radius ${v} > 6px (00 §3)`); break; }
          if (p !== null && p > 4) warn("radius", `border-radius ${v}: only inputs/buttons may use 2–6px (00 §3)`);
        }
      }
    }
    if (/(linear|radial|conic)-gradient/.test(ln) && !ln.includes("allow: gradient")) fail("gradient", `CSS gradient without a sector grant: ${ln.trim().slice(0, 80)}`);
    if (ln.includes("backdrop-filter") && !ln.includes("allow: glass")) fail("glass", `backdrop-filter without a sector grant: ${ln.trim().slice(0, 80)}`);
    if (!ln.includes("allow: shadow")) {
      for (const m of ln.matchAll(/box-shadow\s*:\s*([^;}]+)/g)) for (const sh of m[1].split(",")) {
        const toks = sh.trim().split(/\s+/).filter((t) => /^-?[\d.]+(px|rem|em)?$/.test(t));
        if (toks.length >= 3) { const b = px(toks[2]); if (b !== null && b > 8) fail("shadow", `box-shadow blur ${toks[2]} > 8px (00 §3)`); }
      }
    }
    if (/filter\s*:\s*[^;}]*blur\(/.test(ln) && !ln.includes("drop-shadow")) warn("glow", "filter: blur() — check it is not a glow/orb (00 §3)");
  }

  const fams = new Set<string>();
  for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)/g)) for (const f of m[1].replace("!important", "").split(",")) { const n = norm(f); if (n && !n.startsWith("var(")) fams.add(n); }
  for (const m of html.matchAll(/family=([^&"']+)/g)) for (const f of m[1].split("|")) fams.add(norm(f.split(":")[0].replace(/\+/g, " ")));
  for (const f of [...fams].sort()) {
    if (BANNED.has(f)) fail("font", `'${f}' is on the banned-as-default list (00 §2)`);
    else if (SERIF.has(f)) warn("font", `'${f}' is a serif: allowed only where the sector grants it, weight ≥ 500 (00 §2)`);
    else if (!ALLOWED.has(f)) warn("font", `'${f}' is not on the curated list (tools/fonts.json)`);
  }
  if ([...fams].filter((f) => !GENERIC.has(f)).length > 2) warn("font", "more than two font families in use (00 §2)");

  for (const m of css.matchAll(/h1[^{]*\{([^}]*)\}/g)) {
    const fs1 = m[1].match(/font-size\s*:\s*([^;]+)/);
    if (fs1) { const p = px(fs1[1].trim().split(/\s+/)[0]); if (p && p > 72) fail("h1-size", `h1 font-size ${fs1[1].trim()} > 72px (00 §2)`); if (p && p < 36) warn("h1-size", `h1 font-size ${fs1[1].trim()} < 36px; brief range is 40–64px`); }
    const cl = m[1].match(/font-size\s*:\s*clamp\([^,]+,[^,]+,\s*([^)]+)\)/); if (cl) { const p = px(cl[1]); if (p && p > 72) fail("h1-size", `h1 clamp max ${cl[1].trim()} > 72px (00 §2)`); }
  }
  for (const m of css.matchAll(/(h1|h2)[^{]*\{[^}]*text-transform\s*:\s*uppercase/g)) fail("caps", `uppercase ${m[1]} heading — sentence case only (00 §2)`);
  for (const m of css.matchAll(/(p|body|\.lead|\.sub)[^{]*\{[^}]*text-align\s*:\s*center/g)) warn("centred", `centred paragraph rule on '${m[0].slice(0, 40).replace(/\n/g, " ")}' (00 §4)`);

  const hexes = new Set([...css.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map((m) => m[0]));
  const purple = [...hexes].filter((h) => { const t = hsl(h); return t && t[0] >= 250 && t[0] <= 290 && t[1] > 0.35 && t[2] > 0.25 && t[2] < 0.8; });
  if (purple.length) fail("purple", `purple-blue hues in palette (${purple.slice(0, 4).join(", ")}) — 'AI purple' is banned (00 §5)`);
  if (hexes.has("#000000") || /(?:color|background(?:-color)?)\s*:\s*#000\b/.test(css)) warn("ink", "pure black #000 used — ink should be a near-black (00 §5)");

  const text = visibleText(html); const low = text.toLowerCase();
  for (const ph of PHRASES.banned) if (new RegExp(`\\b${ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(low)) fail("phrase", `banned phrase '${ph}' in copy (00 §7)`);
  for (const ph of PHRASES.warn) if (new RegExp(`\\b${ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(low)) warn("phrase", `'${ph}' in copy — replace with a specific claim (00 §7)`);
  if (text.includes("!")) warn("exclaim", "exclamation mark in copy (00 §7)");
  if (EMOJI.test(html)) fail("emoji", "emoji in page (00 §7)");
  if (/lorem ipsum|product name|your company|\[placeholder text\]/.test(low)) fail("content", "lorem/placeholder copy — real content only");
  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s === 0) fail("h1", "no h1 found"); else if (h1s > 1) fail("h1", "more than one h1 (06)");

  const media = (html.match(/<(img|video|picture|svg)\b|class="[^"]*\bph\b|data-slot=/gi) || []).length;
  if (media === 0) fail("hero", "no media (img/video/placeholder) anywhere on the page — the hero must carry an image or product (00 §4)");
  else { const bi = html.toLowerCase().indexOf("<body"); const body = bi >= 0 ? html.slice(bi) : html; const head = body.slice(0, Math.floor(body.length * 0.45));
    if (!/<(img|video|picture|svg)\b|class="[^"]*\bph\b|data-slot=/i.test(head)) warn("hero", "no media in the first half of the body — check the hero carries an image or product (00 §4)"); }
  for (const m of html.matchAll(/<(section|div)[^>]*>[\s\S]*?<\/\1>/gi)) { const b = m[0]; if ((b.match(/<svg/g) || []).length === 3 && (b.match(/<h3/g) || []).length === 3 && b.length < 6000) { warn("icon-cards", "a block with exactly three svg+h3 items — the three-icon-card pattern is banned (00 §4)"); break; } }
  if (!html.includes("viewport")) fail("viewport", "missing meta viewport");

  return { pass: fails.length === 0, fails, warns };
}
