# 08 · Gates

Verification runs as a separate pass with no authority to edit. Failures go back to the build agent with evidence attached. Only green runs publish; only green runs bill. The owner's standing rule is the origin of all of this: test before pushing, including a test order, and check images on every device. `[stated]` Small changes do not need the full suite; big changes do. `[stated]`

## Tiers

| Tier | When | Gates |
|---|---|---|
| **Quick** | Copy, colour, spacing, image swap, single-component edits | Build · lint · forbidden-list scan · contrast · screenshot diff of the touched region at three viewports · protected-region check |
| **Full** | New page, template change, navigation change, anything in commerce, any change to a locked region | Everything in Quick plus: type-check · visual regression on every page at three viewports · link check · Lighthouse ×4 ≥ 90 · HTML-without-JS check · schema validation · title/never-list check · crawl diff · scripted test order · email render test |
| **Launch** | First publish, domain move, backend change | Everything in Full plus: DNS and HTTPS on both hosts · redirects from old URLs · consent blocks scripts until accepted · Search Console verified and sitemap accepted · analytics events fire on a test session · noindex on hidden regions · password screen off only when the owner says |

## Design gate (runs in every tier)

Fails on: border-radius > 6px on non-inputs; CSS gradients or backdrop-filter outside a sector-granted exception; fonts not on the curated list; box-shadow blur > 8px; hero without media; three-icon-card pattern; H1 > 72px; centred body text > 2 lines; emoji in markup; banned phrases; purple-blue hue pairs; pills where not granted; contrast below AA; locked-element violation (logo altered, wordmark misspelt, never-colour or never-word present).

## Sameness gate (runs on new builds and new directions)

Compares layout fingerprint, palette and type against every previous build on the platform and, strictly, against any site the owner named in Stage 2 Q14. Fails if too close. Threshold tuned in 09.

## Commerce gate (Full and Launch)

A scripted test order end to end on the staging backend: add to basket, checkout with the test gateway, payment captured, order appears in admin on the correct list, dispatch label created in sandbox, order marked dispatched only after label, tracking attached, the three customer emails rendered and sent to a test inbox, refund on cancel. Any step failing fails the gate.

## Evidence

Every gate run stores: screenshots at 390 / 834 / 1440px, Lighthouse JSON, crawl diff, test-order log, and the forbidden-list scan. The owner can open any run. Failed runs are shown to the owner as "we caught this before you did", never hidden.

## Billing rule

A change is billable only when its gate tier passes. A change that fails is free, is retried by the engine up to a limit, and if still failing is reported with the evidence and a plain explanation. The owner never pays for a loop.
