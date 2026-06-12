/**
 * airtime.ts — Mobile API client for Reloadly airtime & data routes.
 *
 * Uses getDataBaseUrl() which respects the EXPO_PUBLIC_LOCAL_API toggle.
 * Auth routes are never called here — this file is data-only.
 */

import { getDataBaseUrl } from "@/constants/apiUrls";

async function airtimeFetch<T>(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${getDataBaseUrl()}/api${path}`, {
    ...options,
    headers,
  });

  const data = await res.json() as T & { error?: string };

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }

  return data;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AirtimeOperator {
  operatorId:           number;
  name:                 string;
  bundle:               boolean;
  data:                 boolean;
  denominationType:     "RANGE" | "FIXED";
  supportsLocalAmounts: boolean;
  senderCurrencyCode:   string;
  destinationCurrencyCode: string;
  minAmount:            number | null;
  maxAmount:            number | null;
  localMinAmount:       number | null;
  localMaxAmount:       number | null;
  fixedAmounts:         number[];
  suggestedAmounts:     number[];
  suggestedAmountsMap:  Record<string, number>;
  logoUrls:             string[];
  country:              { isoName: string; name: string };
}

export interface AirtimeBundle {
  id:               number;
  description:      string;
  price:            number;
  localPrice:       number;
  currencyCode:     string;
  localCurrencyCode: string;
  validityInDays:   number | null;
}

export interface TopupResult {
  transactionId:     number;
  status:            string;
  operatorName:      string;
  recipientPhone:    string;
  deliveredAmount:   number;
  deliveredCurrency: string;
  requestedAmount:   number;
  requestedCurrency: string;
  discount:          number;
  transactionDate:   string;
  balance:           number;
}

// ── API functions ─────────────────────────────────────────────────────────────

/** Thrown when Reloadly cannot auto-detect the operator for the given number. */
export class OperatorDetectError extends Error {
  readonly code = "COULD_NOT_AUTO_DETECT" as const;
  constructor(message: string) {
    super(message);
    this.name = "OperatorDetectError";
  }
}

export async function detectAirtimeOperator(
  phone: string,
  countryCode: string,
): Promise<AirtimeOperator> {
  const params = new URLSearchParams({ phone, countryCode });

  const res = await fetch(`${getDataBaseUrl()}/api/airtime/detect?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json() as AirtimeOperator & { error?: string; code?: string };

  if (!res.ok) {
    if (res.status === 422 && data.code === "COULD_NOT_AUTO_DETECT") {
      throw new OperatorDetectError(data.error ?? "Could not detect operator.");
    }
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }

  return data;
}

export async function getOperatorsByCountry(
  countryCode: string,
): Promise<AirtimeOperator[]> {
  return airtimeFetch<AirtimeOperator[]>(`/airtime/operators?countryCode=${countryCode}`);
}

export async function getDataBundles(operatorId: number): Promise<AirtimeBundle[]> {
  return airtimeFetch<AirtimeBundle[]>(`/airtime/bundles/${operatorId}`);
}

export async function purchaseTopup(
  token: string,
  params: {
    operatorId:  number;
    amount:      number;
    phone:       string;
    countryCode: string;
    useLocalAmount?: boolean;
  },
): Promise<TopupResult> {
  return airtimeFetch<TopupResult>("/airtime/topup", token, {
    method: "POST",
    body:   JSON.stringify(params),
  });
}
