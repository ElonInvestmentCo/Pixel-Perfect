---
name: Reloadly API response format
description: Reloadly sandbox credentials confirmed. toArray() helper handles both plain-array and paginated list responses. Bundles empty in sandbox.
---

## Rule
Use a `toArray()` helper in `lib/reloadly.ts` that handles both shapes:
```typescript
function toArray<T>(raw: T[] | { content?: T[] }): T[] {
  if (Array.isArray(raw)) return raw;
  return (raw as { content?: T[] }).content ?? [];
}
```

**Why:** Reloadly list endpoints return plain JSON arrays (not Spring `{ content: [...] }` pagination). Without toArray(), list calls return `[]` every time.

**How to apply:** Every list-returning Reloadly function should call `toArray(rawResponse)`.

## Credentials — SANDBOX
- `RELOADLY_CLIENT_ID` and `RELOADLY_CLIENT_SECRET` stored as Replit secrets are **SANDBOX** credentials.
- Production audience (`topups.reloadly.com`) returns `INVALID_CREDENTIALS` with these keys.
- `RELOADLY_SANDBOX=true` is set as a Replit shared env var — must also be set in Railway env vars for production deployment.
- Sandbox starting balance: $1,000 USD. Topups deduct from this balance (no real money).

## Sandbox behaviour vs production
- Countries: 159 returned ✅ (same as production)
- Operators for NG: 13 returned ✅ (same as production)
- Auto-detect: returns `COULD_NOT_AUTO_DETECT` 422 for most numbers — triggers manual operator picker on mobile ✅
- Bundles: returns `[]` for all operators in sandbox — mobile shows "No data bundles available" ✅
- Topup POST: executes and returns `SUCCESSFUL` with transactionId, no real money charged ✅

## Confirmed working end-to-end (sandbox, June 2026)
- OAuth token: 824-char Bearer, 86400s lifetime
- `GET /countries` → 159 countries
- `GET /operators/countries/NG` → 13 operators (Airtel 342, MTN 341, Glo 344, etc.)
- `POST /topups` op=342, $1.00 → transactionId 173477, status SUCCESSFUL, delivered 1206 NGN

## Railway deployment note
When deploying to Railway, add `RELOADLY_SANDBOX=true` to Railway environment variables.
To switch to production credentials later: get production client_id/secret from Reloadly dashboard → update secrets → set `RELOADLY_SANDBOX=false` (or delete the var).
