/**
 * giftcards.ts — Mobile API client for Reloadly gift card routes.
 */

import { getDataBaseUrl } from "@/constants/apiUrls";

async function gcFetch<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${getDataBaseUrl()}/api${path}`, { ...options, headers });
  const data = await res.json() as T & { error?: string };

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GCProduct {
  productId:                   number;
  productName:                 string;
  senderCurrencyCode:          string;
  recipientCurrencyCode:       string;
  denominationType:            "FIXED" | "RANGE";
  minSenderDenomination:       number | null;
  maxSenderDenomination:       number | null;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations:    number[];
  logoUrls:                    string[];
  brand:                       { brandId: number; brandName: string } | null;
  category:                    { id: number; name: string } | null;
  country:                     { isoName: string; name: string } | null;
}

export interface GCProductsPage {
  content:       GCProduct[];
  totalElements: number;
  totalPages:    number;
  last:          boolean;
  first:         boolean;
  size:          number;
  number:        number;
}

export interface GCPin {
  serialNumber: string | null;
  pinCode:      string | null;
  info1:        string | null;
  expiryDate:   string | null;
}

export interface GCOrderResult {
  transactionId:    number;
  status:           string;
  pins:             GCPin[];
  smses:            Array<{ to: string; message: string }>;
  amount:           number;
  currencyCode:     string;
  fee:              number;
  discount:         number;
  recipientEmail:   string | null;
  customIdentifier: string;
  transactionDate:  string;
  balanceInfo:      { oldBalance: number; newBalance: number; currencyCode: string };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getGCProducts(
  countryCode: string,
  page = 1,
  size = 20,
): Promise<GCProductsPage> {
  return gcFetch<GCProductsPage>(
    `/gift-cards/products?countryCode=${countryCode}&page=${page}&size=${size}`,
  );
}

export async function placeGCOrder(
  token: string,
  params: {
    productId:      number;
    unitPrice:      number;
    recipientEmail: string;
    senderName?:    string;
  },
): Promise<GCOrderResult> {
  return gcFetch<GCOrderResult>("/gift-cards/order", token, {
    method: "POST",
    body:   JSON.stringify(params),
  });
}
