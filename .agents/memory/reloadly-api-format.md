---
name: Reloadly API response format
description: Reloadly topups production API returns plain arrays for most list endpoints, not paginated objects. Bundles endpoint returns 404 for many operators.
---

## Rule
Use a `toArray()` helper in `lib/reloadly.ts` that handles both shapes:
```typescript
function toArray<T>(raw: T[] | { content?: T[] }): T[] {
  if (Array.isArray(raw)) return raw;
  return (raw as { content?: T[] }).content ?? [];
}
```

**Why:** The Reloadly production API (`topups.reloadly.com`) returns plain JSON arrays for `/countries` and `/operators/countries/{code}`, NOT the Spring `{ content: [...] }` pagination wrapper. Treating it as paginated returns `[]` every time.

**How to apply:** Every list-returning Reloadly function should call `toArray(rawResponse)` rather than assuming either format.

## Credentials
- `RELOADLY_CLIENT_ID` and `RELOADLY_CLIENT_SECRET` are **production** credentials, stored as Replit secrets.
- `RELOADLY_SANDBOX` must NOT be set (defaults to false = production mode). Setting it to `true` causes `CREDENTIAL_VS_ENVIRONMENT_MISMATCH` because the credentials are production, not sandbox.

## Bundles endpoint
- `/operators/{id}/bundles` returns 404 for most Nigerian operators in the production API.
- The airtime route already handles 404 → returns `[]` gracefully.
- The mobile screen shows "No data bundles available" when bundles is empty — acceptable UX.

## Confirmed working (production)
- `GET /operators/countries/NG` → 13 operators (Airtel, MTN, Glo, T2 Mobile variants)
- `GET /operators/auto-detect/phone/{phone}/country-codes/{code}` → operator or 422 COULD_NOT_AUTO_DETECT
- `POST /topups` → executes real topup (charges real money in production mode)
