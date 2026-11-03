# 02 · Wizard questions

Every question exists because its absence caused a rebuild on a real site. Each entry: the question, why it is asked, the default the engine proposes (so the owner edits rather than invents), and the correction it came from.

Rules for the wizard UI: propose a default for anything the sector implies; never ask what a previous answer already settled; show taste by rendering, not by adjectives; keep the whole Brand stage under ten minutes.

---

## Stage 1 · Start (five questions, two minutes)

1. **What do you sell, and to whom?** Free text, one line. → Seeds everything.
2. **Which sector is closest?** Pick one of A–H from 01, or X "something else" with a description, with a one-line description each. → Sets palette logic, density, exceptions and the forbidden list. Source: every sector decision above was made differently per site.
3. **Where do you sell, and in which currencies?** Countries, currency per region. Default: owner's country only. → Regions, delivery, tax, hreflang. Source: Buyuk's /eu /us /ca shops; Peptidarium's per-country language copies.
4. **New site, or replacing one that already ranks?** If replacing: the URL. → Triggers URL preservation and the 301 map. Source: "existing URLs must never be replaced".
5. **What must this site achieve in six months?** Orders / enquiries / rankings / all three, plus a number if they have one. → Decides whether SEO structure leads or the store leads. Source: Peptidarium brief ("SEO is the main point and should drive everything").

## Stage 2 · Brand (free; ends in three rendered directions)

6. **Upload your logo. Can we redraw it, or is it locked?** Default: locked. → A locked logo is never touched, suggested on, or recoloured. Source: Peptome logo is on packaging and must never change; Buyuk's old circle-B logo was replaceable.
7. **How exactly is your name written?** Capitals, spacing, any mark. → Wordmark spelling is enforced in copy, titles and schema. Source: "BuyUK Peptides", capital UK, no space.
8. **Three sites you admire. Three you can't stand.** URLs plus one word each. → The engine reads them for density, type and palette, not to copy. Source: Buyuk's benchmark was BPL; Card Castle's benchmark was Mesh and Buyuk; the founder judges by reference.
9. **Colours that must appear. Colours that must never appear.** → Hard constraints in the brief. Source: Peptome "no gold or copper"; Card Castle "keep navy and gold".
10. **Words that must never appear on the site, or in page titles.** Separate fields. → Copy and title constraints enforced by a gate. Source: Retatrutide must not appear in the GLP-3 page title.
11. **Light or dark?** The engine proposes from the sector and explains why; the owner can override. → Source: "peptide businesses should not be dark themed"; Card Castle rejected the white version.
12. **Photography, renders, or illustration? Do you have imagery now, or should we place holders for a shoot?** Default: photography/renders, placeholders now. → Source: drawn vials rejected; Peptome placeholders accepted ahead of real shoot.
13. **Tone: three words it should sound like, three it must never sound like.** → Voice section of the brief.
14. **Anything that must look nothing like another site you own?** URL. → Strict sameness gate against that site. Source: Peptidarium must differ completely from Buyuk and BPL; Solvane from Mesh.

**Output**: an art-direction brief (03) and three rendered homepage directions (04). The owner picks one. Picking is the decision; the engine cannot leave the chosen direction afterwards.

## Stage 3 · Structure & SEO

15. **List your products or services, grouped as a customer would group them.** CSV upload or a list. → Catalogue and navigation.
16. **Which products are commercial priorities, in order?** → Homepage and category ordering, internal linking weight. Source: Regent's GLP-1-first priority list.
17. **Which search terms bring buyers, and who ranks for them now?** The engine runs keyword research and shows clusters; the owner confirms or edits. → Page map with one intent per page. Source: Buyuk's "buy peptides uk" target and named rival.
18. **Any product that must be named one way on the page and another in search?** Trade name vs compound name; what may appear in the title vs the body; what it should still be found for. → Source: GLP-3 / Retatrutide / "reta" rule.
19. **Existing URLs to preserve or redirect.** Crawl offered automatically if replacing a site. → 301 map.
20. **Which regions or languages should get their own copy, and should they be indexed yet?** Default: not indexed until the owner says. → Source: international shops hidden from search to protect the UK site's rankings.
21. **Who writes, or approves, content?** A name for the byline or a team name. → Source: "BuyUK Peptides Scientific Team".
22. **Topics the site must never cover.** → Source: no reconstitution/dosing content.

## Stage 4 · Commerce

23. **Backend: Shopify, Medusa, or simple (single product, Stripe-native)?** The storefront is ours either way. Default by sector: Medusa for multi-product and regulated; Shopify if they already run it; simple for one product. → Source: Peptome moved from Shopify + Lovable to Medusa; the founder wants to offer Shopify, Medusa and customisation as options.
24. **Payment gateways.** Pick from the list for their region and sector (card, bank transfer, crypto). Ours is pre-wired. → Source: Niftipay (card + crypto) and Wallid (instant bank) on Buyuk; some sectors cannot use mainstream processors.
25. **Shipping zones, services and prices. Free threshold?** Defaults proposed from region (UK: Royal Mail Tracked 24, next-day). → Source: Buyuk TOLP24; Peptidarium "UK one option only, next-day, free".
26. **Tax status.** VAT registered or not. → Source: Peptome not VAT registered.
27. **How do you dispatch, and when should an order be marked dispatched?** Click & Drop / courier API / manual. Default: marked dispatched only when the label prints, with tracking attached. → Source: Buyuk rule.
28. **Which emails should a customer receive?** Default: payment received, dispatched, one basket reminder. Nothing else. → Source: "no order-received email, finds it pointless".
29. **Should order numbers reveal volume?** Default: no (randomised). → Source: Peptome.
30. **Unpaid orders: cancel automatically or keep as abandoned?** Default: keep, never auto-cancel. → Source: "never do this, makes no sense".
31. **Do products carry compliance documents (certificates, batch data)? Any category exempt?** → Source: COA per product/batch; consumables exempt.
32. **Affiliates or referrals?** Commission shape (flat / tiered on lifetime earnings), customer discount, approval (manual / auto), payout method, a separate customer Refer & Earn? → Source: Buyuk partners (manual approval, lifetime %), Buyuk Refer & Earn (auto-approve, no caps, 90-day credit), Peptome tiers (15/20/25% on lifetime commission, never reset).
33. **Stock tracking?** Default: off unless they say they run low. → Source: "thousands of units, no stock tracking needed".
34. **Loyalty, stock alerts, subscriptions?** Default: all off. → Source: loyalty parked, stock alerts declined, subscribe & save dropped.

## Stage 5 · Connect

35. **Registrar access, or the DNS records we should set. Email records to leave untouched.** → Source: SPF/DKIM left intact during Buyuk's Cloudflare move.
36. **Which jurisdictions for privacy, terms, returns and consent?** Default from Stage 1. → UK GDPR / UAE PDPL variants.
37. **Sending domain and provider for transactional email.** Default: Resend on a subdomain. → Source: Buyuk, Peptome.
38. **Analytics and pixels.** Google account for GA4 and Search Console; Meta, Snap, Google Ads, TikTok pixels as needed. → Source: all four used across Buyuk and Peptome.
39. **Chat button?** WhatsApp Business number. → Source: Buyuk.
40. **Pre-launch password?** Default: yes until real imagery and data are in. → Source: Peptome.

## Stage 6 · Protect (asked once, enforced forever)

41. **Which parts must never change without your explicit unlock?** Default once a site is converting: hero, product page, checkout. → Source: Buyuk hero frozen "scared of ruining conversions".
42. **Who approves designs, and who handles dispatch?** Names and emails. → Review flow and admin roles. Source: founder's team rejected the drawn vials; a named person runs dispatch.
43. **What should we never do?** Free text, one line each. → Stored as hard rules on the site. Source: every "never" in the reference library began as one of these.

---

## What the wizard never asks

- "What style do you like?" — it shows three directions instead.
- "What colours do you like?" — it derives from logo and sector, and asks only for musts and nevers.
- Anything the sector already settles (density, light/dark default, imagery type).
- Anything a previous answer settled.
