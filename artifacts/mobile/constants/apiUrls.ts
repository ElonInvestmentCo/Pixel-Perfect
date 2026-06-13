/**
 * apiUrls.ts — Single source of truth for backend URL resolution.
 *
 * Both AUTH_BASE_URL and getDataBaseUrl() resolve to the Replit-hosted
 * API server via EXPO_PUBLIC_BACKEND_URL. For web, window.location.origin
 * is used so relative paths work with the same-origin Express server.
 */
import { Platform } from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";

/**
 * The API backend URL — used for all auth routes.
 * Google OAuth init/callback, Apple Sign-In, email/password auth, JWT issuance.
 */
export const AUTH_BASE_URL: string =
  Platform.OS === "web"
    ? (typeof window !== "undefined" ? window.location.origin : "")
    : BACKEND_URL;

/**
 * Base URL for non-auth data API calls (airtime, notifications, etc.).
 */
export function getDataBaseUrl(): string {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }

  return BACKEND_URL;
}
