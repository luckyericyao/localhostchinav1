# Localhost Global

First version of the Localhost Global / Localhost China website.

Localhost Global is positioned as a quiet luxury local-host travel network for thoughtful international travelers. The first market is China, with Shanxi presented as the flagship destination.

## Pages

- `/` — discovery-first China opening and editorial chapters, with Shanxi first
- `/about` — Localhost philosophy and global network thesis
- `/how-it-works` — inquiry, review, route shaping, and host matching flow
- `/trust` — host screening, boundaries, privacy, and quality control
- `/china` — regional introduction to four cultural perspectives, with credited photographs
- `/journeys` — practical comparison of the four active routes, with future chapters secondary
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
- `LOCALHOST_OPERATOR_NAME` / `LOCALHOST_OPERATOR_BIO` — approved public profile overrides; the default contact is Eric Yao with no invented biography
- `LOCALHOST_REVIEW_OWNER` — internal reviewer alias, default `eric-yao`
- `LOCALHOST_REVIEW_HOLIDAYS` — China-local holiday dates excluded from reply deadlines
- `LOCALHOST_REVIEW_LEDGER` — optional restricted local metadata-ledger path; default `.local/inquiry-reviews.jsonl`
- `RESEND_API_KEY` — server-only key for direct inquiry delivery when configured
- `RESEND_FROM_EMAIL` — verified server-side sender used with Resend
- `RESEND_TO_EMAIL` — optional private delivery inbox for direct inquiry email;
  otherwise it falls back to `LOCALHOST_CONTACT_EMAIL`. It is never used as the
  public mailto destination.
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
an idempotent transient delivery retry, a non-personal inquiry reference, and
structured Vercel logs with the accepted provider message ID for delivery
success, fallback, duplicate, rate-limit, honeypot, and timing outcomes. These
guards do not require a paid database; production
reporting should still reconcile the logs against inbox receipts because
serverless memory is not durable across all instances. Funnel events include
route selection, inquiry start, submit attempt, client errors, direct delivery,
mailto fallback, duplicate, rate-limit outcomes, and native LCP/CLS/INP measurements
when supported by the browser.

When Resend is not configured, the inquiry flow prepares a structured `mailto:`
fallback. Private keys must remain server-only; do not use `NEXT_PUBLIC_` for
`RESEND_API_KEY`.

For production direct email, configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`RESEND_TO_EMAIL`, and `LOCALHOST_CONTACT_EMAIL` in the Vercel project
environment. The private delivery inbox is used only for direct delivery;
manual email recovery uses the approved public contact address. For durable
funnel reporting, also configure `POSTHOG_API_KEY` and `POSTHOG_HOST`. Events
use a session-scoped anonymous identifier and never include email, names, or
inquiry content. The app keeps the mailto path as a transparent fallback when
direct delivery is not available.

The operational formulas and response workflow are recorded in
`docs/conversion-operations.md`. The two-working-day response target is an
operational goal, not an automatic product guarantee; the inquiry reference
allows the receiving team to audit it against the inbox.

Resend's `onboarding@resend.dev` sender is limited to the connected account
inbox. Verify the actual production sender and receiving inbox before claiming
direct delivery. The owner-approved public fallback is
`yaohaohui2014@hotmail.com`; a prepared draft is not a sent inquiry.

`pnpm inquiry:reviews` imports structured operational log exports into a private
append-only local ledger. It distinguishes provider acceptance, direct and
manual inbox receipt, and substantive replies, and supports historical reports
with `--as-of`. It does not retain traveler content or sync with production.
See `docs/conversion-operations.md` for commands and limits.

The four route galleries use 12 independently licensed photographs of named
places, with visible source/author/license attribution. See
`public/images/routes/CREDITS.md`. These are not Localhost scouting or client
records. Hero images and the current four-route hierarchy remain unchanged.

The homepage's full-width Shaolin, Huizhou, and Shanghai scenes also use
attributed local photographs. Their source and preparation records are in
`public/images/chapters/CREDITS.md`; they are not Localhost fieldwork evidence.

The homepage opens with the centered Temple of Heaven and a single exploration
action. Chapter pages introduce places and an example rhythm before practical
fit and contact. A local check of inquiry recovery and follow-through is not
proof of production delivery or a human reply.

## Validation

```bash
pnpm lint
pnpm build
pnpm smoke
pnpm a11y
pnpm discovery:check
pnpm editorial:check
pnpm inquiry:check
pnpm inquiry:delivery
pnpm inquiry:operations
pnpm routes:test
pnpm inquiry:recovery
pnpm inquiry:content
pnpm inquiry:pending
pnpm funnel:test
pnpm funnel:check
```

Run `pnpm smoke` against the local server, or set `SITE_URL` to check a
deployed URL. It verifies the core routes, key conversion copy, route page
markers, retired editorial-direction copy, and the privacy-safe analytics
endpoint. For a read-only production check, run
`SITE_URL=https://localhostglobal.vercel.app SMOKE_READ_ONLY=1 pnpm smoke`;
this checks rendered pages without posting synthetic analytics events.
`pnpm a11y` uses the local
Chrome binary for a mobile axe and keyboard smoke check plus homepage LCP/CLS
measurement; set `CHROME_PATH` when Chrome is installed elsewhere.
`SITE_URL=http://127.0.0.1:3118 pnpm mobile:load` tests the homepage and four
active routes against an isolated production build. It runs three cold-browser
navigations per page at 390 x 844, DPR 3, 4x CPU slowdown, and 1.6 Mbit/s down
with 150 ms added latency. It checks decoded hero images, median LCP below
2.5 seconds, and CLS below 0.1 on each run. These lab results are not field
Core Web Vitals or an INP measurement.
`SITE_URL=http://127.0.0.1:3118 pnpm discovery:check` checks the discovery opening
across nine responsive viewport sizes, full-width chapter framing, cover-aware
image resolution, keyboard and native no-JavaScript navigation, reduced
motion, loaded images, four chapter-to-inquiry handoffs, and axe on mobile and
desktop. It accepts local URLs only, blocks external requests and submissions,
and writes screenshots/results under `.codex-audit/discovery-pass-YYYY-MM-DD/`
using the China-local date, with the tested URL and timestamp in its JSON report.
Set `DISCOVERY_CHECK_RUN` to a short lowercase run name to preserve an earlier
same-day screenshot set. `pnpm editorial:check` checks the distinct China and
Routes page roles, readable comparisons without JavaScript, and the four
chapter-to-chapter-to-inquiry paths on mobile and desktop. It uses the same
local `SITE_URL` and writes evidence under `.codex-audit/editorial-pass-YYYY-MM-DD/`.
Generated audit artifacts stay local and are excluded from Git, lint, and
TypeScript inputs. Use a separate production-build snapshot without local
environment files when testing alongside a running development server.
Homepage image sources and usage terms are in `public/images/chapters/CREDITS.md`;
route-detail gallery sources remain separate.
`pnpm inquiry:recovery` intercepts all form submissions and simulates provider
acceptance, duplicate submissions, and unsent email recovery, including long
drafts and unavailable clipboard access. It never sends an inquiry to the
backend or email provider.
`pnpm inquiry:content` checks shared text boundaries, retained originals,
inline field errors, and role-specific payloads with every submission intercepted.
`pnpm inquiry:pending` holds intercepted responses to check that identity, role,
and route details cannot change in flight. It verifies accurate receipt summaries,
retained drafts and retry after rejection or network loss, without sending email.

The short-review submit action precedes optional details in visual and keyboard
order. Expanded details have an adjacent submit action at their end in the same
form. Both share validation and pending state. `pnpm inquiry:check` verifies the
1.5-screen short intake, keyboard sequence, future-route labels, and expanded
form accessibility. It also checks that the form cannot submit before its
handler is ready and that direct email is available without JavaScript.
`pnpm inquiry:content` tests the end-of-details submission
with a synthetic response, not a real email.

Funnel records use a versioned JSON format with a server timestamp and explicit
client/server origin. Only known page, route, source, and performance dimensions
are retained. Query strings and fragments are stripped from automatic Web
Analytics URLs. Names, email, notes, and arbitrary source labels are excluded.
The browser referrer policy sends only the site origin, not inquiry URL parameters.

For a bounded production export, use the existing authenticated Vercel CLI:

```bash
vercel logs --project localhostglobal --environment production --since 1h --limit 1000 --query localhost_metric --json | pnpm funnel:report
```

The report consumes JSON Lines on stdin, accepts direct structured records or
Vercel records with a JSON `message`, and outputs aggregate counts only. It
deduplicates repeated exports, excludes marked smoke traffic and future routes,
and treats prepared email separately from provider acceptance. It does not
establish human validity, inbox receipt, or a complete historical baseline.
Review log retention and export coverage before using it to judge the first
100 valid sessions. No new service, storage destination, or paid plan is enabled.
