/**
 * apiUrls.ts — Single source of truth for backend URL resolution.
 *
 * ┌──────────────────┬────────────────────────────────────────────────────────┐
 * │ AUTH_BASE_URL    │ Always Railway. NEVER toggled. Used only for           │
 * │                  │ /api/auth/* (sign-in, sign-up, Apple, Google OAuth,    │
 * │                  │ token exchange, JWT issuance).                         │
 * ├──────────────────┼────────────────────────────────────────────────────────┤
 * │ getDataBaseUrl() │ Railway by default. When EXPO_PUBLIC_LOCAL_API=true,  │
 * │                  │ returns the local API server. Use for all non-auth     │
 * │                  │ routes: airtime, notifications, transfers, cards, etc. │
 * └──────────────────┴────────────────────────────────────────────────────────┘
 *
 * RULE: /api/auth/* is always Railway, regardless of any toggle state.
 */
import { Platform } from "react-native";

const RAILWAY_URL = "https://pixel-perfect-production-812e.up.railway.app";

/**
 * The Railway backend — permanent auth authority.
 * Google OAuth init/callback, Apple Sign-In, email/password auth, JWT issuance.
 * This value is hardcoded to Railway and must never be changed by any toggle.
 */
export const AUTH_BASE_URL: string =
  Platform.OS === "web"
    ? (typeof window !== "undefined" ? window.location.origin : "")
    : RAILWAY_URL;

/**
 * Base URL for non-auth data API calls.
 *
 * Toggle: set EXPO_PUBLIC_LOCAL_API=true (Replit env var, development only)
 * to point data routes at the local API server for faster iteration.
 * Unset (default) → all data calls go to Railway, exactly as before.
 *
 * Safe routes: airtime, notifications, transfers, cards, dashboard, QR, crypto.
 * Auth routes (/api/auth/*) must NEVER use this — always use AUTH_BASE_URL.
 */
export function getDataBaseUrl(): string {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }

  if (process.env.EXPO_PUBLIC_LOCAL_API === "true") {
    return process.env.EXPO_PUBLIC_LOCAL_API_URL ?? "http://localhost:3000";
  }

  return process.env.EXPO_PUBLIC_BACKEND_URL ?? RAILWAY_URL;
}
