Generate three homepage directions for a brand, gate them, screenshot them, and present them.

Argument: brand slug, optionally followed by `--regen <name>` to regenerate one direction with one axis changed. $ARGUMENTS

## Read first

`brands/<slug>/brief.md` (law), `engine/skills/00-house-rules.md`, the sector in `01-sector-playbooks.md`, `engine/skills/04-three-directions.md`, `engine/reference/accepted.md`, `engine/reference/rejected.md`, `tools/fonts.json`.

If `brief.md` does not exist, stop and say to run `/brief <slug>` first.

## Plan the three directions before writing any HTML

Choose three axes from 04 §"What varies" and write a short plan to `brands/<slug>/directions/plan.md`: for each direction, a one-word name, which axis values it takes, and one sentence on why it suits the sector. In shop sectors one direction must be the dense catalogue one. The three must differ on at least two axes from each other. Everything in "What must be identical" stays identical.

## Build each direction

For each direction, write `brands/<slug>/directions/<name>/index.html`: a complete, self-contained homepage.

- Inline CSS in a `<style>` block; Google Fonts `<link>` for the brief's two families only; no JavaScript required (a tiny script for a mobile nav toggle is allowed).
- Real content from `answers.yaml`: the real name, wordmark spelling, products, prices, delivery promise, trust facts. Six to eight products in the grid. The real logo if a file path was given (`<img>` to it); otherwise the wordmark set in the heading face.
- Placeholders: `<div class="ph" data-slot="hero product render, 4:5">` style neutral blocks with the correct aspect ratio and a small label of what goes there. Never a fake photo, never a stock image.
- Follow the brief's section order for the homepage. Include header with navigation, hero, the sections, footer with the legal links the sector needs.
- Responsive: works at 390, 834 and 1440 without horizontal scroll. Images and placeholders sized with aspect-ratio.
- Every rule in 00 §2–§9 applies. Use the brief's hex values and type sizes. Square corners. Hairline rules. Sentence case.
- Copy is specific: real claims from the answers, no banned phrases, no exclamation marks, no emoji.

## Gate, then fix, then screenshot

For each direction run `python3 tools/gate.py brands/<slug>/directions/<name>/index.html`. Fix every FAIL and re-run until clean; treat WARN items as things to fix unless the brief grants them. Do not present a direction that fails.

Then run `node tools/screenshot.js brands/<slug>/directions/*/index.html --out brands/<slug>/directions/` to produce the PNGs and `contact-sheet.png`.

## Present

Print, for each direction: its name, one sentence on what it leans into (no adjectives like premium, clean, modern), and the path to its `index.html`. Then the path to the contact sheet. Then exactly this line: "Score with `/score <slug>` — ship / close / no, with a few words each."

Append to `brands/<slug>/log.md`: date, direction names, axes, gate results, and any rule you found yourself wanting to break (that is useful data).

## `--regen <name>`

Regenerate only that direction, changing exactly one axis, keeping its name with a version suffix (`ledger-2`). Re-gate, re-screenshot, re-present.
