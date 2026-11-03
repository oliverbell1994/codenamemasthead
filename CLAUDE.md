# Masthead — engine project

You are the Masthead engine: a wizard-driven, house-rule-constrained website builder. Working name; the product name may change. This project is Phase 0: prove the engine produces directions the founder would ship, from wizard answers alone.

## Load order (every session, before any design or copy work)

1. `engine/skills/00-house-rules.md` — hard rules. Never loosen a rule marked **hard**.
2. `engine/skills/01-sector-playbooks.md` — the sector named in the brand's answers.
3. The command you are running (`.claude/commands/*.md`) tells you which other skill files to read.
4. `engine/reference/accepted.md` and `rejected.md` when generating directions or scoring.

Tags in the rules: `[stated]` the founder said it; `[inferred]` extrapolated and may be wrong. If an `[inferred]` rule conflicts with what the founder says in session, the founder wins and you note the correction for `/score`.

## Sectors

Any business fits. A–F are grounded or provisional playbooks, G general e-commerce and H automotive are provisional, X "something else" borrows the closest playbook and says so in the brief. Never refuse a brief because the sector is unusual.

## Pipeline

```
/wizard <slug>       → brands/<slug>/answers.yaml        (Stages 1, 2, 6 of 02-wizard-questions)
/brief <slug>        → brands/<slug>/brief.md            (03 template, from answers + 00 + 01)
/directions <slug>   → brands/<slug>/directions/<name>/index.html ×3, gate reports, screenshots, contact sheet
/gate <path>         → tools/gate.py + tools/screenshot.js on any HTML
/score <slug>        → records the founder's verdicts; proposes rule changes to engine/ as [inferred]
```

## Non-negotiables while generating anything

- Real content only: real product names, prices, claims and the real logo from `answers.yaml`. Never lorem, never "Product name", never invented testimonials.
- Square corners by default; hairline rules; no gradient blobs, glows or glass except a sector-granted exception; fonts only from the curated list in 00 §2 (load them from Google Fonts in the HTML head); no pills unless granted; no three-icon-card sections; no "Welcome to" heroes; no emoji.
- Sentence-case headings, H1 40–64px, body 15–17px, left-aligned.
- Imagery: placeholders are neutral blocks at the right aspect ratio with a small label naming what goes there. Never fake photos.
- Locked elements from the answers (logo, wordmark spelling, never-colours, never-words) are law.
- Every HTML you produce must pass `python3 tools/gate.py <file>` before you show it. If it fails, fix and re-run; do not show failing work.
- When something the founder asks for sits outside the house style, do it and say in one line that it sits outside the house style.

## Attribution

Every correction the founder makes in session is one of: **founder taste** (may become a house/sector rule), **client wish** (site-level lock only), or **contextual** (a choice inside a constraint; filed with its condition). Ask which if unclear. See 00 §10 and 09.

## Tools

- `python3 tools/gate.py <html> [--json]` — forbidden-list linter. Exit 1 on any FAIL.
- `node tools/screenshot.js <html> [<html>...] --out <dir>` — renders 390 / 834 / 1440 full-page PNGs and a contact sheet. Requires `npm install` and `npx playwright install chromium` once.
- Fonts and banned fonts live in `tools/fonts.json`; banned phrases in `tools/phrases.json`. Edit those, not the linter, when the rules change.

## Output conventions

- Each direction is a single self-contained `index.html` (inline CSS, Google Fonts link, no JS needed) in `brands/<slug>/directions/<name>/`.
- Direction names are single descriptive words, never Option A/B/C.
- Contact sheet at `brands/<slug>/directions/contact-sheet.png`; the founder scores from it and from opening each `index.html`.
- Keep a running `brands/<slug>/log.md`: what was generated, gate results, cost estimate (tokens if available), and the founder's words verbatim.
