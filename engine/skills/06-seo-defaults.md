# 06 · SEO defaults

Search is part of the output, not a plugin. These rules apply to every site; Stage 3 answers refine them.

## Rendering — hard

- Server-rendered, static-first. Real HTML on first byte for every page, including product and category pages. A gate fetches each page without JavaScript and fails if the H1 and body text are absent.
- Core Web Vitals and Lighthouse ≥ 90 on performance, accessibility, best practices and SEO are gates.
- Images served in modern formats at correct dimensions, with alt text written from the product data, never "image".

## Structure — before build

- Keyword research through the API (Semrush or DataForSEO) using the Stage 3 terms; clusters shown to the owner; one target intent per page.
- Page map agreed before the build: URL scheme, title and description per page (unique by construction), H1 per page (exactly one), schema types per page (Organization, Product with offers, Article, FAQ, BreadcrumbList).
- No orphan pages; every page reachable within three clicks of the homepage; category pages carry real copy, not just a grid.
- A 301 map from any replaced site, generated from a crawl and confirmed by the owner. **Existing URLs are never replaced, only added to or redirected.** `[stated]`

## Naming constraints

- A product may be sold under a trade name with the compound or generic name in body text only, excluded from the page title. The page must still be found for the common search abbreviation. Enforced by a title gate. `[stated]` (GLP-3 / Retatrutide / "reta")
- Words on the Stage 2 never-list are checked in titles, descriptions, headings and body separately.

## Launch

- Sitemaps generated and self-updating; robots rules; canonicals; Open Graph image per page generated from the design system; hreflang for every regional or language copy.
- Search Console verified and the sitemap submitted as part of the launch checklist; GA4 or a privacy-first analytics tool with conversion events.
- **Index control**: regional copies and any page the owner wants hidden are `noindex` and excluded from sitemaps until the owner says otherwise. Default for new regional shops: hidden. `[stated]` No country banner or cross-linking that could leak the main site's authority until approved. `[stated]`

## Protecting what works

- SEO changes are routed around protected regions (07). A title, description or schema change can never alter a hero, product page layout or checkout. `[stated]` "SEO changes are fine when they don't alter the buying experience."
- Every change is diffed against the previous crawl: titles, canonicals, status codes, internal link counts. Regressions fail the gate.

## Growth (paid module)

- Content engine: monthly plan for clusters the site does not yet rank for; drafts with internal links; fact-check; named approver; publish to the CMS; team byline where preferred. `[stated]`
- Programmatic page sets for catalogues (product, variant, comparison, location) generated from data. Monthly report: rankings, clicks, orders, what the engine did.
- Targets Google first, then Bing and the AI answer engines (server rendering is what makes the latter work). `[stated]` Backlinks: the engine suggests targets and drafts outreach; it never buys links. `[stated]`

- Never writes anything on the Stage 3 never-list; in sector A, nothing on reconstitution, dosing, mixing or human use. `[stated]`
