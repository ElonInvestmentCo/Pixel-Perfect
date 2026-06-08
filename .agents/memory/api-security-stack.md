---
name: API server security stack
description: Middleware order, env validation, CVE overrides, and security module structure for the Express backend.
---

## Middleware order in app.ts (must not change)
1. `requestId` — CSPRNG UUID before ANY logging
2. `pinoHttp` — structured logging using req.id
3. `applySecurityMiddleware` — Helmet + CORS + body size limits (inside security.ts)
4. Global rate limiter (skip health check)
5. `sanitizeRequest` — prototype pollution strip after body parsing
6. Routes (`/api`)
7. `notFound` handler
8. `errorHandler` (4-arg — must be last)

## Key decisions
- `app.set('trust proxy', 1)` — trust exactly 1 proxy hop for X-Forwarded-For; more allows IP spoofing.
- CORS allowlist: dev allows localhost + `*.exp.direct` (Expo tunnel); prod requires `ALLOWED_ORIGINS` env var.
- `credentials: false` in CORS — mobile app uses JWT headers, no cookies.
- Error handler: never sends stack traces to client in prod; always logs full error server-side via pino.
- Env validated at startup via Zod in `src/lib/env.ts` — process exits immediately on misconfiguration.
- SSRF guard in `src/lib/ssrf.ts` — call `assertSafeFetchUrl()` before any server-side fetch of user-supplied URLs.

## CVE overrides in pnpm-workspace.yaml
```yaml
overrides:
  qs: ">=6.15.2"         # GHSA-q8mj-m7cp-5q26
  postcss: ">=8.5.10"    # GHSA-qx2v-qp2m-jg93
  uuid: ">=11.1.1"       # GHSA-w5hq-g745-h8pq
```
Run `pnpm audit` after any `pnpm install` to verify no new CVEs.

## Auth rate limiter
`authLimiter` in `src/middlewares/rate-limit.ts` — apply to POST /auth/login, /auth/register, /auth/otp, /auth/reset.
Default: 10 req / 15 min per IP (tunable via `RATE_LIMIT_AUTH_MAX` env var).
