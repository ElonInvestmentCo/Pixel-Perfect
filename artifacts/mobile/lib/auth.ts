import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Alert, Platform } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";
import { AUTH_BASE_URL } from "@/constants/apiUrls";

// Auth calls always go to the production domain (https://www.payvora.org).
// AUTH_BASE_URL is never affected by any local-API toggle.
const API_URL = AUTH_BASE_URL;

/**
 * Sign In with Apple — follows Apple's official authentication guide.
 *
 * Nonce flow (required by Apple to prevent identity-token replay attacks):
 *   1. Generate a cryptographically random raw nonce (UUID v4 via expo-crypto).
 *   2. SHA-256-hash it; pass the hash to signInAsync so Apple embeds it in
 *      the identity token's `nonce` claim.
 *   3. Send the raw nonce to the backend alongside the identity token.
 *   4. Backend re-hashes the raw nonce and compares it to the token's claim.
 *
 * Reference: https://developer.apple.com/documentation/signinwithapple/
 *            authenticating-users-with-sign-in-with-apple
 */
export async function signInWithApple(): Promise<{ token: string; user: SessionUser } | null> {
  if (Platform.OS !== "ios") {
    Alert.alert("Not Available", "Apple Sign-In is only available on iOS.");
    return null;
  }

  let available = false;
  try {
    available = await AppleAuthentication.isAvailableAsync();
  } catch {
    available = false;
  }

  if (!available) {
    Alert.alert("Not Available", "Apple Sign-In is not available on this device.");
    return null;
  }

  try {
    // Step 1 — generate raw nonce
    const rawNonce = Crypto.randomUUID();

    // Step 2 — SHA-256 hash (Apple receives the hash, not the raw value)
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    // Step 3 — request credential; nonce is embedded in the identity token
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const { identityToken, fullName } = credential;
    if (!identityToken) throw new Error("No identity token received from Apple");

    // Step 4 — send raw nonce + token to backend for server-side nonce verification
    const res = await fetch(`${API_URL}/api/auth/apple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityToken,
        nonce: rawNonce,
        fullName: fullName
          ? { givenName: fullName.givenName, familyName: fullName.familyName }
          : undefined,
      }),
    });

    const data = await res.json() as { token?: string; user?: SessionUser; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Apple sign-in failed");
    return { token: data.token!, user: data.user! };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === "ERR_REQUEST_CANCELED") return null;
    throw new Error(err?.message ?? "Apple sign-in failed");
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: SessionUser }> {
  const res = await fetch(`${API_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as { token?: string; user?: SessionUser; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Sign in failed. Please try again.");
  return { token: data.token!, user: data.user! };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  name: string,
): Promise<{ token: string; user: SessionUser }> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json() as { token?: string; user?: SessionUser; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Sign up failed. Please try again.");
  return { token: data.token!, user: data.user! };
}
