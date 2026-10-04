# Conversion Operations

This document defines the first measurement and response workflow for Localhost China. It records targets and formulas without inventing performance results.

## Inquiry delivery

Every valid inquiry receives an `LH-YYYY-MM-DD-XXXXXXXX` reference. The reference is included in the direct email subject and body, and in the structured delivery log. The server records one of these outcomes:

Name, email, role, and one sentence of intent are required before submission.
Route timing, comfort, food, transport, and host-fit details remain optional so
the first contact stays light while the reply can still address a real person.

Traveler-authored text is never silently cut to fit delivery. Shared client and
server validation accepts names up to 120 characters, email addresses up to 254,
first notes up to 1,200, and each optional detail up to 800. Additional fields
are limited to 32 distinct labels, each up to 80 characters. Oversized or
ambiguous content is rejected before delivery; the browser retains the original
text, displays a field-level error, and focuses the relevant control. A folded
optional section opens when its field needs attention. Only whitespace trimming
and email casing are normalized. Role changes retain cached text in memory but
submit only the selected role's fields and shared reply preferences.

While a submission is in flight, intake controls are disabled and the form is
marked busy. A returned receipt uses the server's normalized submission summary,
not the live draft values. Once the response arrives, editing resumes; rejection
or network loss retains the complete draft for retry without claiming receipt.
An intentional edit after a receipt clears that receipt and starts a new draft.
Run `pnpm run inquiry:pending` to test these transitions with delayed, intercepted
responses. These fixtures do not prove real email delivery.

- `inquiry_delivery_success` — the configured Resend provider accepted the message.
- `inquiry_delivery_fallback` — direct delivery was unavailable, so the browser received a prepared `mailto:` link.
- `inquiry_error` — the client could not receive a submission result; the user sees a retry message and no delivery is claimed.
- `inquiry_duplicate` — the same normalized inquiry was already accepted during the duplicate window.
- `inquiry_rate_limited` — the warm-instance abuse guard rejected the request after the hourly threshold.

Manual recovery does not confirm receipt of the original request: a provider
timeout can have an uncertain outcome. Its email draft is explicitly unsent.
The visitor chooses whether to open the
prepared email or copy its full subject and body; the site does not launch an
email client automatically or claim that a prepared draft was delivered. Long
inquiries remain available in a read-only preview independently of mail-client
URL handling. If clipboard access is unavailable, the preview opens with its
text selected. This draft contains the normalized inquiry fields, not internal
response instructions, and is not persisted in browser storage or analytics.
Run `pnpm run inquiry:recovery` against a local or deployed server to exercise
these states with every submission intercepted before it reaches the backend.

Direct delivery rate is calculated as:

```text
inquiry_delivery_success /
(inquiry_delivery_success + inquiry_delivery_fallback)
```

The fallback rate is calculated from the same denominator. These rates must be reviewed against the Resend activity log and the receiving inbox because serverless memory is only a warm-instance guard, not a durable database.

Every direct Resend request also carries an idempotency key derived from the
inquiry reference. Provider retries therefore reuse the same request identity
for 24 hours instead of creating a second notification. The accepted provider
message ID is written to the structured server log without recording traveler
email or inquiry content.

## Response SLA

The inquiry email carries the configured `LOCALHOST_RESPONSE_WINDOW` value and its inquiry reference. The response operator records the received timestamp and the first substantive reply timestamp in the inbox or CRM. The two-working-day rate is:

```text
valid inquiries with a substantive reply within two working days /
valid inquiries received in the review period
```

The product does not claim this target is met until the team has reviewed a real sample. The default expectation is `within two working days`.

The internal notification carries a first-response standard. The reviewer
should acknowledge one specific detail, offer one concrete next direction with
a reason, ask no more than three next questions, state what remains
unconfirmed, and share only the minimum necessary detail. This keeps the first
reply personal and useful without pretending that route scope or host
availability is already confirmed.

For each valid inquiry, the operator keeps a private review row: inquiry
reference, provider message reference, received time, assigned reviewer, first
substantive reply time, and next action. Keep personal notes in the existing
restricted inbox, not the analytics export. Provider acceptance, actual inbox
receipt, and a human response are separate checks. Do not publish a delivery
or response percentage until its denominator and review period are recorded.

The short-review submit action appears before optional details in both DOM and
visual order. Expanded details have a second action at their end in the same
form, using the same validation and pending state; there is no second intake or
automatic submission. Keyboard users can move from the final optional field
to the adjacent action without returning several screens upward.

Deployment blockers must not become invented public claims. The current
operator identity, public-contact DNS, sender-domain verification, actual
inbox receipt, and response SLA require separately verified operational
evidence. This release does not change those credentials or establish those
results, enable a paid service, or replace warm-instance guards with durable
cross-instance storage.

## Funnel baseline

Use the anonymous session ID with the following events. Never add names, email addresses, notes, passport details, or message bodies to analytics.

- Homepage to route view: distinct sessions with `route_view` after a `page_view` on `/`, divided by distinct eligible sessions with `page_view` on `/`.
- Route view to inquiry start: sessions with `inquiry_start` after a route view divided by route-view sessions.
- Inquiry start to direct acceptance: sessions with `inquiry_delivery_success` after `inquiry_start`, divided by inquiry-start sessions. This confirms provider acceptance; it does not prove inbox delivery.
- Manual email recovery: sessions with `inquiry_delivery_fallback` are reported separately. A prepared `mailto:` is not a sent inquiry and must not enter the successful-submission numerator.
- Route selection source: `route_select` is emitted from homepage featured routes, the China route list, and the Routes comparison selector.
- Inquiry CTA source: `request_route` is emitted from the traveler-facing route, trust, how-it-works, and inquiry entry points with a source label.
- Four active route comparison: `Shanxi`, `Shaolin`, `Huizhou`, and `Shanghai` are the active route set; future chapters are excluded from the comparison denominator.

Shared header and footer inquiry links retain the current page path. On an
active route page they also preselect that route in the intake, including after
client-side navigation. Other pages open a general traveler review without
inventing a route. Only the path is included, not URL queries or fragments.
Run `pnpm run funnel:test` and `pnpm run funnel:check` to verify these handoffs
on desktop and mobile without submitting a real inquiry.

Record the first 100 valid sessions before changing the target or the event definition. Report the targets from the brief as targets, not as current performance:

The browser emits `page_view` on each navigation and uses the same opaque
session ID for route selection, inquiry start, and submission. The server
validates this ID and includes it in delivery events so the accepted inquiry
can be joined to the preceding funnel steps. Names, email addresses, and notes
remain outside analytics. Sessions with missing IDs are reported separately;
do not group them as one visitor or include them in session conversion rates.

Without `POSTHOG_API_KEY`, these events are recorded in operational logs only.
An HTTP 200 from `/api/analytics` does not prove durable analytics storage.
Export and retain the relevant anonymous log period or configure the existing
analytics destination before claiming a measured 100-session baseline.

Each event now emits a single versioned `localhost_metric` JSON record with a
server timestamp and an explicit `client` or `server` origin. Browser requests
cannot set that origin or supply a delivery reference. Finite page, route,
source, and performance dimensions are applied before the browser data layer,
Web Analytics, server logging, and the existing analytics destination. The
automatic Web Analytics URL filter removes query strings and fragments and
drops unknown paths. Inquiry source-page parameters are also excluded from
operational logs. The shared browser referrer policy is `strict-origin`, so
inquiry URL parameters are not copied into analytics request headers either.

`pnpm funnel:report` reads a production JSON Lines export from stdin. It reports
the first 100 observed sessions with a known page view, chronological funnel
steps, unique server acceptance/recovery references, and data-quality gaps.
It accepts direct metric records or the Vercel CLI `message` envelope. Repeated
exports are deduplicated; source `smoke`, future routes, legacy unstructured
messages, and browser-claimed delivery outcomes do not count toward conversion.
Missing opaque session IDs remain unjoined rather than becoming one visitor.
No personal data or session/reference identifiers are copied into the report.

An empty denominator is reported as `null`, not a measured zero conversion
rate. Fewer than 100 observed sessions is `insufficient_sample`; even 100
requires traffic review before calling the sessions valid. Request log arrival
order, query limits, and retention can omit or reorder steps. A bounded export
does not provide ongoing storage or recover expired records. Retain exports
privately and use the platform's current retention limits when planning the
baseline; do not claim that this reporting command establishes persistence.

Provider acceptance and recovery events originate in the server action. The
public browser analytics endpoint rejects these event names; use the server
outcomes for the delivery numerator, rather than client-reported `inquiry_sent`.

- Homepage to route view: at least 25%.
- Route view to inquiry start: at least 15%.
- Inquiry start to successful submit: at least 40%.

## Accessibility and performance review

The app includes a skip link, a single `main-content` target on every page, 44px primary controls, and anonymous `LCP`, `CLS`, and `INP` events when the browser supports the native PerformanceObserver entries. Run the production smoke check and a keyboard/browser audit on each release. Do not mark WCAG 2.2 AA or the mobile performance targets as met until a real audit records zero critical axe issues, complete keyboard traversal, and measured LCP, CLS, and INP values.
