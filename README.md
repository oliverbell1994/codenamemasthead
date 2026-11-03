# Masthead

Working name. A wizard-driven, house-rule-constrained website engine for businesses that sell. Two ways to run it live in this repo:

- **The studio** (`npm run dev`): a web app. A conversation that asks one thing at a time, a brief you can edit directly at any point, and a preview where three homepage directions are built, gated and shown for you to choose from.
- **The Claude Code pipeline** (`claude` in this folder, then `/wizard`, `/brief`, `/directions`, `/gate`, `/score`): the same engine driven from the terminal, used for evals and for turning your verdicts into rules.

Both read the same rules in `engine/` and the same linter lists in `tools/`.

## Run the studio

```bash
git clone https://github.com/oliverbell1994/codenamemasthead.git masthead && cd masthead
npm install
cp .env.example .env.local        # then put your Anthropic API key in it
npm run dev                       # http://localhost:3000
```

Requirements: Node 20+ and an Anthropic API key (console.anthropic.com). The header lets you pick the model for the conversation and the model for building; defaults are chosen from what your key can see. Everything you type is kept in your browser; nothing is stored on a server yet.

Cost: the conversation is cheap (fractions of a cent a turn). A set of three directions is a planning call plus three full page builds, each with one fix pass if the gate rejects it: roughly a few dollars on an Opus-class model, less on Sonnet.

## How the studio works

1. **Conversation** (left). The engine asks the wizard questions from `engine/skills/02-wizard-questions.md` one at a time, in order, skipping what the brief already has. It proposes the sector default as the first chip. Thin answers get one follow-up.
2. **Brief** (middle). Every answer as an editable field, grouped by stage. Edit anything; the next question takes the change into account. Required fields are marked. YAML export matches `brands/answers.template.yaml`, so the Claude Code pipeline can read it.
3. **Directions** (right). Once the required fields are filled, the engine plans three directions (`engine/skills/04-three-directions.md`), builds each as a complete HTML page under the house rules, runs the gate (`lib/gate.ts`, a port of `tools/gate.py`), sends failures back for one fix pass, and shows the result with the gate report. Pick one. The other two are discarded, never blended.

Next build: chat-driven refinement of the chosen direction with the gate on every edit, protected regions, and saving projects server-side.

## The Claude Code pipeline

```bash
npx playwright install chromium      # once, for tools/screenshot.js
claude                               # then /wizard <slug>
```

| Command | Does | Writes |
|---|---|---|
| `/wizard <slug>` | asks Stages 1, 2 and 6 in the terminal | `brands/<slug>/answers.yaml` |
| `/brief <slug>` | writes the art-direction brief | `brands/<slug>/brief.md` |
| `/directions <slug>` | three directions, gated, screenshotted | `brands/<slug>/directions/…`, `contact-sheet.png` |
| `/gate <html…>` | the forbidden-list linter (and `--screens`) | report |
| `/score <slug>` | records verdicts, proposes rule changes | `brands/<slug>/scores.md`, `engine/reference/*` |

## Where the rules live

`engine/skills/00-house-rules.md` and `01-sector-playbooks.md` are the taste. `engine/reference/` is what was accepted and rejected. `tools/fonts.json` and `tools/phrases.json` feed both linters. Change those files, not the prompts, when a rule changes.

## Layout

```
app/            Next.js app: page.tsx (studio), api/converse, api/directions, api/models
components/     Conversation, BriefPanel, Preview
lib/            brief.ts (schema, yaml), engine.ts (rule loader), prompts.ts, gate.ts, claude.ts
engine/         the rules and reference library
tools/          gate.py, screenshot.js, fonts.json, phrases.json, samples
brands/         one folder per brand for the Claude Code pipeline
wizard/         the earlier static one-question-per-screen wizard (kept for reference)
.claude/        Claude Code commands
```
