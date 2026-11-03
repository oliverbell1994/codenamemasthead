# Masthead engine — house rules, version 0.2

This folder is the first artefact of the engine: the rules an agent loads before it designs or builds a site. Nothing here is a prompt in the "make it premium" sense. Each file is a constraint set, with the source of each constraint recorded, so the engine behaves the way the founder's own builds behaved after a year of corrections.

Working name "Masthead" is a placeholder.

## How an agent uses this folder

1. Before any design work, load `skills/00-house-rules.md` and the relevant sector file from `skills/01-sector-playbooks.md`. These are law, not suggestions.
2. The Brand wizard asks the questions in `skills/02-wizard-questions.md` (Start, Brand, Protect stages) and writes a brief using `skills/03-brand-brief-template.md`.
3. Three directions are generated using `skills/04-three-directions.md`. The owner picks one. The other two are discarded, never blended.
4. The build reads the chosen brief plus `05-commerce-defaults.md`, `06-seo-defaults.md`, `07-protected-regions.md`.
5. Every build and every edit runs `skills/08-gates.md`. Only green runs publish; only green runs bill.
6. Every rejection and correction is folded back in via `skills/09-eval-protocol.md`, and the reference library in `reference/` grows.

## Status of each file

| File | Status | Source of its rules |
|---|---|---|
| 00-house-rules | Draft from six builds | Founder's accepted and rejected decisions, Sept–Nov 2026 |
| 01-sector-playbooks | Draft, three sectors grounded, three provisional | Buyuk, BPL, Peptidarium brief, Regent (peptides); Peptome (beauty); Mesh/Solvane (crypto/AI); collectibles provisional (Card Castle was client-directed); wellness and clinics provisional |
| 02-wizard-questions | Draft | Every question maps to a correction that happened mid-build |
| 03-brand-brief-template | Draft | Structure of the briefs that preceded accepted builds |
| 04-three-directions | Draft | Peptome and Buyuk direction rounds |
| 05-commerce-defaults | Draft | Buyuk and Peptome back-office decisions |
| 06-seo-defaults | Draft | Buyuk, Peptidarium, international shops |
| 07-protected-regions | Draft | Buyuk hero / checkout rule |
| 08-gates | Draft | Founder's standing test-before-push rule plus standard tooling |
| 09-eval-protocol | Draft | How corrections become rules |
| reference/accepted.md, rejected.md | Seeded | Direct from the builds |

## What to correct first

The founder should read `00-house-rules.md` and `01-sector-playbooks.md` and strike anything that is a guess rather than a rule. Lines marked `[inferred]` are the engine's extrapolation from a single decision and are the most likely to be wrong. Lines marked `[stated]` were said directly.

v0.2 (3 Nov 2026): sector C rebuilt after the founder clarified Card Castle: the client locked only the blue background and the logo; the richer treatment was the founder's contextual answer to a locked dark ground; he dislikes the blue. Added house rule §10 "whose taste is this" (client locks, founder taste, contextual decisions) and step 0 of the eval protocol.
