---
name: Auth system architecture
description: How JWT auth is structured across API server, DB, and mobile app.
---

# PayVora Auth System Architecture

## DB (lib/db/src/schema/users.ts)
- `usersTable`: id (uuid), email (unique), name, provider ('google'|'apple'|'password'), providerId, avatarUrl, createdAt, updatedAt
- For `provider='password'`: `providerId` stores the bcrypt hash (12 rounds)
- For `provider='google'`: `providerId` stores the Google user ID
- For `provider='apple'`: `providerId` stores the Apple `sub` claim

## API Server (artifacts/api-server/src/routes/auth.ts)
- `POST /api/auth/google` — accepts `{ accessToken }`, fetches Google userinfo endpoint, upserts user, returns JWT
- `POST /api/auth/apple` — accepts `{ identityToken, fullName? }`, decodes Apple JWT claims (base64url, no sig verification), upserts user, returns JWT
- `POST /api/auth/signup` — accepts `{ email, password, name }`, bcrypt hash, insert user, returns JWT
- `POST /api/auth/signin` — accepts `{ email, password }`, bcrypt compare, returns JWT
- JWT signed with `env.JWT_SECRET`, expiry 7d, payload `{ userId, email, name }`
- All routes protected by `authLimiter` (10 req/15min)

## Mobile (artifacts/mobile/)
- `contexts/AuthContext.tsx` — session state (`{ token, user }`) persisted in `expo-secure-store` keys `auth_token` / `auth_user`; provides `saveSession`, `clearSession`, `isRestoring`
- `hooks/useGoogleSignIn.ts` — React hook wrapping `Google.useAuthRequest` from `expo-auth-session/providers/google`; reads `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, gracefully alerts if not configured
- `lib/auth.ts` — `signInWithApple()` (iOS only, uses `expo-apple-authentication`), `signInWithEmailPassword(email, password)` (POST /api/auth/signin)
- Root `_layout.tsx` wraps tree with `<AuthProvider>`, calls `setBaseUrl(EXPO_PUBLIC_API_URL)` and `setAuthTokenGetter(() => SecureStore.getItemAsync('auth_token'))` on mount

## Env Vars
- `JWT_SECRET` — shared, required, 96-hex-char random
- `EXPO_PUBLIC_API_URL` — shared, `http://localhost:3000` in dev
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — user must set from Google Cloud Console for Google Sign-In to work

## Why
Apple Sign-In only works on native iOS; the code shows a graceful Alert on other platforms. Google OAuth shows an Alert if the client ID isn't configured.
