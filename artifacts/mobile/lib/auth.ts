import * as AppleAuthentication from "expo-apple-authentication";
import { Alert, Platform } from "react-native";

import type { SessionUser } from "@/contexts/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

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
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken, fullName } = credential;
    if (!identityToken) throw new Error("No identity token received from Apple");

    const res = await fetch(`${API_URL}/api/auth/apple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityToken,
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
