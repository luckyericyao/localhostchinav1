# Conversion Operations

This document defines the first measurement and response workflow for Localhost China. It records targets and formulas without inventing performance results.

## Inquiry delivery

Every valid inquiry receives an `LH-YYYY-MM-DD-XXXXXXXX` reference. The reference is included in the direct email subject and body, and in the structured delivery log. The server records one of these outcomes:

- `inquiry_delivery_success` — the configured Resend provider accepted the message.
- `inquiry_delivery_fallback` — direct delivery was unavailable, so the browser received a prepared `mailto:` link.
- `inquiry_error` — the client could not receive a submission result; the user sees a retry message and no delivery is claimed.
- `inquiry_duplicate` — the same normalized inquiry was already accepted during the duplicate window.
- `inquiry_rate_limited` — the warm-instance abuse guard rejected the request after the hourly threshold.

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

## Funnel baseline

Use the anonymous session ID with the following events. Never add names, email addresses, notes, passport details, or message bodies to analytics.

- Homepage to route view: distinct sessions with `route_view` on a route page divided by eligible homepage sessions.
- Route view to inquiry start: sessions with `inquiry_start` after a route view divided by route-view sessions.
- Inquiry start to successful submit: sessions with `inquiry_delivery_success` or `inquiry_delivery_fallback` divided by inquiry-start sessions.
- Route selection source: `route_select` is emitted from homepage featured routes, the China route list, and the Routes comparison selector.
- Inquiry CTA source: `request_route` is emitted from the traveler-facing route, trust, how-it-works, and inquiry entry points with a source label.
- Four active route comparison: `Shanxi`, `Shaolin`, `Huizhou`, and `Shanghai` are the active route set; future chapters are excluded from the comparison denominator.

Record the first 100 valid sessions before changing the target or the event definition. Report the targets from the brief as targets, not as current performance:

- Homepage to route view: at least 25%.
- Route view to inquiry start: at least 15%.
- Inquiry start to successful submit: at least 40%.

## Accessibility and performance review

The app includes a skip link, a single `main-content` target on every page, 44px primary controls, and anonymous `LCP`, `CLS`, and `INP` events when the browser supports the native PerformanceObserver entries. Run the production smoke check and a keyboard/browser audit on each release. Do not mark WCAG 2.2 AA or the mobile performance targets as met until a real audit records zero critical axe issues, complete keyboard traversal, and measured LCP, CLS, and INP values.
