# Masthead engine — Phase 0

Working name. A wizard-driven, house-rule-constrained site engine, run inside Claude Code. Phase 0 proves one thing: from wizard answers alone, the engine produces three homepage directions the founder would ship.

## Setup (once, on your Mac)

```bash
git clone <your repo url> masthead && cd masthead
npm install && npx playwright install chromium     # for tools/screenshot.js
python3 tools/gate.py tools/samples/slop.html       # should print 16 FAILs
python3 tools/gate.py tools/samples/clean.html      # should PASS
claude                                              # open Claude Code in this folder
```

Python 3 (standard library only) and Node 18+ are the only requirements.

## The pipeline

| Command | Does | Writes |
|---|---|---|
| `/wizard <slug>` | asks Stages 1, 2 and 6 of the wizard | `brands/<slug>/answers.yaml` |
| `/brief <slug>` | writes the art-direction brief from the answers and the rules | `brands/<slug>/brief.md` |
| `/directions <slug>` | three homepage directions, gated, screenshotted | `brands/<slug>/directions/<name>/index.html`, `contact-sheet.png` |
| `/gate <html…>` | the forbidden-list linter (and `--screens`) | report |
| `/score <slug>` | records your verdicts and proposes rule changes | `brands/<slug>/scores.md`, `engine/reference/*`, proposals for `engine/skills/*` |

Slugs are lowercase with hyphens. Everything for a brand lives under `brands/<slug>/`.

## The first blind test

1. `/wizard northlab` (or any fictional UK peptide shop; say "this is a blind test").
2. `/brief northlab` — read the summary; correct anything wrong by replying, then re-run.
3. `/directions northlab` — wait; open `brands/northlab/directions/contact-sheet.png` and each `index.html`.
4. `/score northlab` — ship / close / no, with a few words each. Say whether each fault is your taste, a client's wish, or contextual.
5. Repeat with a second fictional brief in the same sector. Two of three shipping on two consecutive briefs passes the sector.

## Where the rules live

`engine/skills/00-house-rules.md` and `01-sector-playbooks.md` are the taste. `engine/reference/` is the memory of what was accepted and rejected. `tools/fonts.json` and `tools/phrases.json` feed the linter. Change those files, not the commands, when a rule changes; `/score` proposes the changes for you.

## What is deliberately not here yet

The customer-facing app, billing, hosting, the commerce backend, Stages 3–5 of the wizard, the full build. Phase 0 is directions only. The base storefront template comes after the first sector passes.
