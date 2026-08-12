# Localhost Global

First version of the Localhost Global / Localhost China website.

Localhost Global is positioned as a quiet luxury local-host travel network for thoughtful international travelers. The first market is China, with Shanxi presented as the flagship destination.

## Pages

- `/` — premium homepage
- `/about` — Localhost philosophy and global network thesis
- `/how-it-works` — inquiry, review, route shaping, and host matching flow
- `/trust` — host screening, boundaries, privacy, and quality control
- `/china` — Localhost China market page
- `/journeys` — China journey index and future chapter overview
- `/travelers` — traveler product page
- `/hosts` — host recruitment page
- `/host-credits` — reciprocal host credit explanation
- `/inquiry` — private route inquiry page
- `/china/local-hosts` — local host support detail page
- `/china/private-routes` — private route design detail page
- `/china/seamless-logistics` — China logistics support detail page
- `/china/real-access` — real access and context detail page
- `/china/shanxi` — flagship Shanxi destination page
- `/china/shaolin` — Shaolin / Dengfeng cultural route
- `/china/huizhou` — Huizhou / Huangshan cultural route
- `/china/shanghai` — Shanghai first-stop route

## Development

```bash
pnpm install
pnpm dev
```

Optional environment variable:

- `LOCALHOST_CONTACT_EMAIL` — public fallback email when no private delivery inbox is configured
- `LOCALHOST_RESPONSE_WINDOW` — response expectation shown in the inquiry and trust flow
- `RESEND_API_KEY` — server-only key for direct inquiry delivery when configured
- `RESEND_FROM_EMAIL` — verified server-side sender used with Resend
- `RESEND_TO_EMAIL` — optional private delivery inbox for direct inquiry email
  and the mailto fallback when configured; otherwise it falls back to
  `LOCALHOST_CONTACT_EMAIL`
- `POSTHOG_API_KEY` — optional server-side key for anonymous session-level funnel event persistence
- `POSTHOG_HOST` — optional PostHog host, defaulting to `https://app.posthog.com`

The app also loads Vercel Web Analytics and sends the privacy-safe funnel
events as custom events. Vercel handles the event transport without a
project-specific API key; custom event reporting is subject to the project's
Vercel Analytics plan. PostHog remains available when session-level correlation
is needed.

Conversion hardening targets are tracked in three stages:

- P0, 7 days: required inquiry fields appear within 1.5 mobile screens,
  direct delivery stays above 95%, mailto fallback stays below 5%, no inquiry
  is duplicated or silently lost, and 90% of valid inquiries receive a reply
  within two working days.
- P1, 14 days: the four active China routes are comparable in the Routes first
  viewport, 80% of first-time international visitors can select a first route
  within 45 seconds, and Future China Chapters remain visibly secondary.
- P2, 30 days: three inspectable trust-process outputs are live, the first 100
  valid sessions establish a funnel baseline, critical accessibility issues are
  zero, primary controls are at least 44px, mobile LCP is below 2.5s, CLS is
  below 0.1, and INP is below 200ms.

The inquiry action adds a warm-instance rate guard, duplicate fingerprinting,
one transient delivery retry, a non-personal inquiry reference, and structured
Vercel logs for delivery success, fallback, duplicate, rate-limit, honeypot, and
timing outcomes. These guards do not require a paid database; production
reporting should still reconcile the logs against inbox receipts because
serverless memory is not durable across all instances. Funnel events include
route selection, inquiry start, submit attempt, direct delivery, mailto
fallback, duplicate, rate-limit outcomes, and native LCP/CLS/INP measurements
when supported by the browser.

When Resend is not configured, the inquiry flow prepares a structured `mailto:`
fallback. Private keys must remain server-only; do not use `NEXT_PUBLIC_` for
`RESEND_API_KEY`.

For production direct email, configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`RESEND_TO_EMAIL`, and `LOCALHOST_CONTACT_EMAIL` in the Vercel project
environment. The private delivery inbox is used only when direct delivery or
the exceptional mailto fallback needs a real destination. For durable
funnel reporting, also configure `POSTHOG_API_KEY` and `POSTHOG_HOST`. Events
use a session-scoped anonymous identifier and never include email, names, or
inquiry content. The app keeps the mailto path as a transparent fallback when
direct delivery is not available.

The operational formulas and response workflow are recorded in
`docs/conversion-operations.md`. The two-working-day response target is an
operational goal, not an automatic product guarantee; the inquiry reference
allows the receiving team to audit it against the inbox.

The current no-cost production setup uses Resend's `onboarding@resend.dev`
sender, which is limited to the connected account inbox. A verified custom
domain can replace it later without changing the inquiry flow.

## Validation

```bash
pnpm lint
pnpm build
pnpm smoke
pnpm a11y
```

Run `pnpm smoke` against the local server, or set `SITE_URL` to check a
deployed URL. It verifies the core routes, key conversion copy, route page
markers, and the privacy-safe analytics endpoint. `pnpm a11y` uses the local
Chrome binary for a mobile axe and keyboard smoke check plus homepage LCP/CLS
measurement; set `CHROME_PATH` when Chrome is installed elsewhere.
