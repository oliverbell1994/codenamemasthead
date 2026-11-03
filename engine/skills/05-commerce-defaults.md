# 05 · Commerce and back-office defaults

The storefront is always ours (static-first, server-rendered). The commerce backend is the owner's choice; the defaults below apply whichever backend sits behind it. Every default is a decision a real shop owner made; the wizard proposes it and the owner edits.

## Backend options (Stage 4, Q23)

| Option | When | What we own | What they own |
|---|---|---|---|
| **Medusa** (self-hosted, Postgres + Redis on managed infra) | Multi-product, regulated or semi-regulated sectors, owners who want full control, anyone who has had trouble with a half-hosted Shopify checkout `[stated]` | Storefront, admin layout, dispatch, emails, affiliates, abandoned baskets | Data, accounts, gateways |
| **Shopify** (headless via Storefront API) | Owners already on Shopify with inventory, apps or POS they keep | Storefront and the admin extensions we add | Shopify admin, checkout, apps |
| **Simple** (Stripe-native, no catalogue backend) | One product, one price, one country | Everything | Stripe account |

The Peptome lesson: a Lovable front end with a Shopify checkout behind it caused "too many issues" and was replaced by Medusa. `[stated]` A customer choosing Shopify gets the full headless integration, not a half-hosted one.

## Admin

- Orders list shows only orders with captured payment, plus dispatched and cancelled. `[stated]`
- Unpaid / authorised orders live on an **Abandoned baskets** page until the customer completes; they are **never auto-cancelled**. `[stated]`
- Cancelling an order refunds the customer in the same action. `[stated]`
- Admin layout follows one proven structure across sites (Buyuk's) with sector-specific sections removed when they do not apply. `[stated]`
- Roles: owner, approver (designs), dispatcher. Names from Stage 6.
- Optional: push notifications for new orders; a cross-store orders view for owners with several sites. `[stated]` (planned orders app)

## Payments

- Gateways offered by region and sector. The owner can run two. `[stated]` Buyuk: card + crypto (Niftipay) and instant bank (Wallid); manual bank transfer dropped once an instant option existed.
- Our pre-wired integration earns a small per-order fee; a customer's own gateway earns nothing and that is fine.
- No postcode autofill at checkout unless asked. `[stated]`
- Customer-facing order numbers are randomised, not sequential, by default. `[stated]`

## Dispatch

- UK default: Royal Mail Click & Drop, Tracked 24 without signature (code TOLP24), pay-as-you-go account. `[stated]`
- An order is marked dispatched, with tracking attached, **only when the label is printed**, never before. `[stated]`
- Click & Drop's own customer notifications are switched off so only the brand's dispatch email goes out. `[stated]`
- Regional delivery for international shops: flat rate per region, priced from the carrier's small-packet rates. `[stated]`

## Customer email (transactional)

- Exactly three by default: **payment received**, **dispatched / on its way** (with tracking), **one reminder** for an unfinished basket or unpaid order. `[stated]`
- No "order received" email. `[stated]` No separate payment reminder. `[stated]`
- Sent from the brand's own subdomain via the email API; replies go to the one mailbox the team monitors. `[stated]`
- WhatsApp basket reminders as an option where the sector and platform rules allow; the owner accepts the policy risk explicitly. `[stated]`

## Abandoned baskets

- Reminder once, by email, after a set delay; optional WhatsApp.
- Baskets stay visible in admin until completed. No expiry by default.

## Affiliates and referrals

Two separate account types with separate dashboards, never merged. `[stated]`

- **Partners / affiliates** (B2B, creators, large pages): manual approval; custom code and link; percentage of every order from referrals for life; the code also gives the customer a discount; manual monthly payouts tracked in the portal; portal lives inside the shop at `/partners` or `/affiliate` until a subdomain is connected. `[stated]` Tiered variant: commission rate rises with lifetime commission earned (e.g. 15% → 20% at £150 → 25% at £450) and never resets. `[stated]`
- **Refer & Earn** (customer to customer): join with an email only, no prior order; auto-approve; referrer earns credit on every friend order with no cap; credit added within 48 hours; friend's discount applies on every order; credit codes valid 90 days; milestone bonuses tied to friends' spend, not head count. `[stated]`
- The platform provides the mechanism; disclosure compliance of posts is the affiliate's responsibility and the portal does not coach it. `[stated]`
- Approved partners may be sent a free product; address captured at sign-up. `[stated]`
- Pages built for these programmes are not linked publicly until the owner approves. `[stated]`

## Compliance documents

- Per-product documents (certificates of analysis, batch data) with a document per batch; categories can be exempt (consumables). `[stated]`
- Ads landing pages (`/lp/...`) that show no products, for sectors where ad review requires it. `[stated]`

## Things that are off unless asked

Loyalty programme, stock alerts, stock-level tracking, subscriptions, discount-code pages visible to visitors. `[stated]` (each was declined or parked on a real site)
