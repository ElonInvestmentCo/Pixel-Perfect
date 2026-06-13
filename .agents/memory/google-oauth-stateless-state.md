---
name: Google OAuth stateless state token
description: Why in-memory OAuth state fails on Railway and how to fix it with a signed HMAC token.
---

## The problem
The original `/api/auth/google/init` stored OAuth state in a `Map<string, OAuthState>` in process memory. On Railway, the container that handles `/init` may be different from (or restarted before) the container that handles `/callback` — so the state is gone and the callback returns "Session expired."

## The fix
Replace the Map with a self-contained signed state token:

```
state = base64url(JSON({returnUrl, expiresAt, nonce})) + "." + HMAC-SHA256-hex(payload, JWT_SECRET)
```

On callback, recompute the HMAC and compare with `timingSafeEqual`. Decode the payload, check expiry. No server-side storage needed.

**Why:** Signed tokens are stateless and work across any number of replicas or restarts, as long as all instances share the same `JWT_SECRET` (which they do via Railway env vars).

**How to apply:** Any time a multi-step web flow (OAuth, email verification, password reset) uses a server-side Map/store for short-lived tokens on a horizontally scaled or ephemeral host, switch to signed tokens instead.
