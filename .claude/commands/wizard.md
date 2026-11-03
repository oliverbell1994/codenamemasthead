Run the Masthead wizard for a brand and write its answers file.

Argument: a brand slug (lowercase, hyphens), e.g. `/wizard northlab-peptides`. $ARGUMENTS

## Before asking anything

Read `engine/skills/02-wizard-questions.md` (Stages 1, 2 and 6 only; Stages 3–5 are not part of Phase 0) and `engine/skills/01-sector-playbooks.md`. Create `brands/<slug>/` if missing. If `brands/<slug>/answers.yaml` exists, load it and only ask what is empty.

## How to ask

- Ask one stage at a time, all of that stage's questions in a single message, numbered as in 02. Keep each question to one line. Do not explain why you are asking; the founder knows.
- After Stage 1, before Stage 2, state the sector you have chosen and the three defaults it sets (light/dark, density, imagery mode) in one line each, so the founder can override by replying.
- Propose a default for anything the sector implies (Q11 light/dark, Q12 imagery mode, Q41 protected regions). Accept "default" or "d" as an answer.
- Never ask "what style do you like". Never ask anything a previous answer settled. Never ask about colours beyond musts and nevers.
- If the founder says this is a blind test, note `blind_test: true` and do not ask Stage 6 (use defaults).

## What to write

`brands/<slug>/answers.yaml` following `brands/answers.template.yaml` exactly, with every field present (empty string if unanswered, never omitted). Add at the top:

```yaml
meta:
  slug: <slug>
  created: <ISO date>
  wizard_version: 0.2
  blind_test: <true|false>
  attribution: founder   # who answered: founder | client | mixed
```

For the catalogue, capture at least six products with real names and prices in the brand's currency, grouped as the founder groups them. For references (Q8), store the URLs and the one-word reasons; do not fetch them now.

## When done

Print the answers file path and a five-line summary: sector, light/dark, density, imagery mode, locked elements. Then say: "Next: `/brief <slug>`."
