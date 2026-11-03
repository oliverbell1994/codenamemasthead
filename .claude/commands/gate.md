Run the Masthead design gate on one or more HTML files.

Arguments: one or more paths to HTML files, optionally `--screens` to also render screenshots. $ARGUMENTS

1. For each file run `python3 tools/gate.py <file>` and show the report.
2. If `--screens` is given, run `node tools/screenshot.js <files> --out <dir of first file>/screens/` and give the contact sheet path.
3. Summarise: which files pass, which fail, and for each FAIL the one-line fix. Do not fix anything in this command unless asked.

Reminder: a FAIL is a rule in `engine/skills/00-house-rules.md` §9. A WARN is a judgement call the founder may grant for this site; say which rule it relates to.
