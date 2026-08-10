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

- `LOCALHOST_CONTACT_EMAIL` — email address used for prepared inquiry mailto fallback
- `LOCALHOST_RESPONSE_WINDOW` — response expectation shown in the inquiry and trust flow
- `RESEND_API_KEY` — server-only key for direct inquiry delivery when configured
- `RESEND_FROM_EMAIL` — verified server-side sender used with Resend

When Resend is not configured, the inquiry flow prepares a structured `mailto:`
fallback. Private keys must remain server-only; do not use `NEXT_PUBLIC_` for
`RESEND_API_KEY`.

## Validation

```bash
pnpm lint
pnpm build
```
