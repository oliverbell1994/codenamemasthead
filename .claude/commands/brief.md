Write the art-direction brief for a brand from its wizard answers.

Argument: brand slug. $ARGUMENTS

## Read first

`brands/<slug>/answers.yaml`, `engine/skills/00-house-rules.md`, the matching sector in `engine/skills/01-sector-playbooks.md`, `engine/skills/03-brand-brief-template.md`, and `engine/reference/rejected.md` (so you know what has already failed in this sector).

## Rules for the brief

- Fill every field of the template. "TBD" is forbidden. Derive, do not invent: each value traces to an answer, a sector default, or the logo.
- Palette: derive the signature colour from the logo file if one is given (sample its dominant non-neutral colour), otherwise from the sector playbook. Paper and ink per 00 §5. Write hex values.
- Type: choose a pairing from the curated list in 00 §2 that the sector playbook names as proven, unless Q14 names a sister site using that pairing, in which case choose a different curated pairing and say why.
- Locked elements: copy the founder's words verbatim into section 2. If the logo is locked, the brief says "logo: locked" and nothing else about it.
- Section 8 (page architecture): list the homepage sections in order with one line each, drawn from the sector playbook's accepted content flow. Name the forbidden patterns explicitly.
- Where an answer conflicts with the sector (admires a dark site in a light sector), note the conflict in section 1 and plan for one of the three directions to honour the reference within the rules.
- Section 10 stays "not yet chosen".

## Output

Write `brands/<slug>/brief.md`. Then print a plain-English summary of no more than eight lines: positioning, sector, light/dark, type pairing, signature colour, density, imagery mode, the locked elements. End with: "Next: `/directions <slug>`."

Do not generate any HTML in this command.
