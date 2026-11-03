# 09 · Eval protocol — how the engine learns taste

"Training" here is not model training. It is the loop by which the founder's yes and no become rules, and rules become gates. Three instruments, in order of cost.

## 1. The pairwise set (ten minutes per sector)

For each sector, twelve pairs of real homepages (not ours; found on the web), chosen to differ on one axis each: density, hero construction, type, panel system, colour usage, imagery treatment. The founder picks one of each pair and may add up to three words.

- Output: a preference per axis per sector, new lines for 00/01 where a preference is strong, and the pairs stored in `reference/pairs/<sector>.md` with the choice and the words. Repeat quarterly or when a sector is added.

## 2. The blind test (the real test of whether the engine is good)

1. The founder answers the wizard for a brand that does not exist yet (a fictional supplier in sector A, a fictional single-product beauty brand in B, or the real wellness brand in E).
2. The engine writes the brief (03) and generates three directions (04) with **no chat and no founder in the loop**.
3. The founder scores each direction: **ship** (would publish with at most one tidy-up), **close** (right idea, specific fault), **no** (with the fault named).
4. Pass: two of three directions score **ship** on two consecutive briefs in the sector. Cost: a few hundred dollars per sector.
5. Every **close** and **no** is written to `reference/rejected.md` with the founder's words, and the rule or playbook line that would have prevented it is added, tagged `[stated]`.


## 3. Live corrections (continuous)

During real builds, every instruction beginning "never", "always", "don't", "keep" or "must" is captured verbatim with site and date, and filed as a site-level rule or, if it recurs across sites, as a house rule.

Already captured: "no rounded curves or edges", "peptide businesses should not be dark themed", "never change the logo", "no gold or copper", "never auto-cancel unpaid orders", "hero must stay as it is".

## How a correction becomes a rule

0. Attributed as **founder taste**, **client wish** or **constraint**; only founder taste can become a house or sector rule (Card Castle's look was a client wish). `[stated]`
1. Captured verbatim with source.
2. Classified: site-specific (stays with the site) or general (house or sector).
3. If general and stated once: added as `[inferred]` with the source, so a later reviewer can confirm.
4. If stated twice, or confirmed by the founder on review: `[stated]`, and if machine-checkable, added to the relevant gate.
5. Reviewed monthly: inferred rules that have not been contradicted in two builds are promoted; inferred rules that were contradicted are removed with a note.

## Scoring the engine over time

- **Direction hit rate** (blind-test directions scored ship): target ≥ 66% per sector. **Edits to accept** (chat edits from chosen direction to "really like it"): target ≤ 5; Peptome A2 took one round.
- **Gate failures per build** should fall as rules are added. **Sameness** between builds in a sector stays above threshold. **Cost per build** is measured; the founder's $30+ is the baseline to beat.

## What the founder is asked

Round one (this week): read 00 and 01, strike what is wrong, confirm `[inferred]` lines that are right. Round two: twelve pairs each for sectors A and B, ten minutes each. Round three: answer the wizard for one fictional brand and score three directions, repeated until two of three ship. After that, nothing scheduled.
