Record the founder's verdicts on a brand's directions and turn them into rules.

Argument: brand slug. $ARGUMENTS

## Read first

`brands/<slug>/directions/plan.md`, `engine/skills/09-eval-protocol.md`, `engine/reference/accepted.md`, `engine/reference/rejected.md`.

## Collect

If the founder has not already given verdicts in this message, ask for them in one message: for each direction by name, **ship** (would publish with at most one tidy-up), **close** (right idea, name the fault), or **no** (name the fault). Ask for a few words on each. Ask one more thing only: for each fault named, is it **founder taste**, a **client wish**, or **contextual** (true only in this situation)? Default to founder taste if they do not say.

## Record

1. Append to `brands/<slug>/scores.md`: date, direction name, verdict, the founder's words verbatim, attribution.
2. For every **close** or **no** with founder-taste attribution: append a row to `engine/reference/rejected.md` (site = the brand, rejected = the thing, words = verbatim, rule produced = the rule you propose).
3. For every **ship**: append a line to `engine/reference/accepted.md` under the sector with the direction's axes.
4. Update the scoring block in `brands/<slug>/log.md`: directions shipped out of three; whether the pass condition in 09 §2 is met for this sector.

## Propose rules, do not silently write them

For each founder-taste fault, propose the smallest rule change that would have prevented it: the file (00 or 01), the section, the exact line to add or change, tagged `[inferred]` unless the founder stated it as a general rule in which case `[stated]`. Show all proposals as a numbered list and ask "Apply which?" Apply only those confirmed. Client wishes and contextual faults are recorded but produce no engine rule; say so.

## Next step

If two of three shipped: say so, and say the sector needs one more brief to pass (09 §2 requires two consecutive). If fewer: say which direction was closest and offer `/directions <slug> --regen <name>` with the one axis you would change.
