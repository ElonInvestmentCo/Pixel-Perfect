/**
 * apiUrls.ts — Single source of truth for backend URL resolution.
 *
 * Production backend: https://www.payvora.org (Railway)
 * All builds use EXPO_PUBLIC_BACKEND_URL which is baked in at build time
 * via eas.json env configuration.
 *
 * Web (browser): uses window.location.origin so same-origin requests
 * work when the web build is served from the same Express server.
 */
import { Platform } from "react-native";

const PRODUCTION_URL = "https://www.payvora.org";

const BACKEND_URL: string =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || PRODUCTION_URL;

/**
 * The API backend URL — used for all auth routes.
 * Google OAuth init/callback, Apple Sign-In, email/password auth, JWT issuance.
 * Always resolves to the production domain on native builds.
 */
export const AUTH_BASE_URL: string =
  Platform.OS === "web"
    ? (typeof window !== "undefined" ? window.location.origin : PRODUCTION_URL)
    : BACKEND_URL;

/**
 * Base URL for non-auth data API calls (airtime, gift cards, notifications, etc.).
 */
export function getDataBaseUrl(): string {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin : PRODUCTION_URL;
  }
  return BACKEND_URL;
}
