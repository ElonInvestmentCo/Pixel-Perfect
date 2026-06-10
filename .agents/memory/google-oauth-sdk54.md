---
name: Google OAuth in Expo SDK 54 / expo-auth-session v7
description: auth.expo.io proxy fully removed; server-side OAuth required for Expo Go native.
---

## Rule
`expo-auth-session` v7 (Expo SDK 54) **completely removed** `useProxy` and `projectNameForProxy`
from `makeRedirectUri`. The parameters are silently ignored — the function always returns
`exp://…` regardless. The `auth.expo.io` proxy service no longer works via this API.

**Why:** Expo deprecated the proxy in SDK 49 and removed it entirely in v7. Google rejects
`exp://` as an invalid redirect URI for web OAuth clients.

## How to apply
For any Expo Go native Google Sign-In in SDK 54, use server-side OAuth:

1. **Backend** — add `GET /api/auth/google/init?returnUrl=exp://…` and
   `GET /api/auth/google/callback` to Express. The callback exchanges the Google auth code
   for an access token, creates/updates the user, generates a JWT, then redirects to `returnUrl`
   with `?token=JWT&id=…&email=…&name=…` appended.

2. **Frontend** — `WebBrowser.openAuthSessionAsync(initUrl, returnUrl)` where
   `returnUrl = Linking.createURL('oauth-callback')`. expo-web-browser intercepts the
   browser's redirect to the `exp://` return URL and resolves the promise.

3. **API URL for native** — `http://localhost:3000` doesn't work on a physical device.
   Set `EXPO_PUBLIC_BACKEND_URL` to the Replit dev HTTPS URL (port 5000 domain) so native
   devices can reach the backend. Fallback: strip `.expo.` from the Expo Metro URL
   (`exp://xxx.expo.janeway.replit.dev` → `https://xxx.janeway.replit.dev`).

4. **Google Cloud Console** — register:
   - `https://{REPLIT_DEV_DOMAIN}/api/auth/google/callback`  (dev)
   - `https://mayaaujau.replit.app/api/auth/google/callback`  (prod)

5. **Required secrets**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (both needed for code exchange).

6. **Web flow** — `useAuthRequest` still works fine on web; keep both code paths in the hook.
