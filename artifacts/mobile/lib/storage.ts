/**
 * storage.ts — Cross-platform key-value storage.
 *
 * expo-secure-store only works on native (iOS/Android). On web it throws
 * "setValueWith is not a function". This module wraps both so callers
 * don't need Platform checks.
 *
 *   Native → expo-secure-store  (encrypted keychain/keystore)
 *   Web    → localStorage       (best available in a browser context)
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore — storage unavailable (e.g. private browsing with full quota)
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
