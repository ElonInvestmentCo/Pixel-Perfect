/**
 * utilities.ts — Mobile API client for Reloadly utility payment routes.
 */

import { getDataBaseUrl } from "@/constants/apiUrls";

async function utFetch<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
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

export type BillerType =
  | "ELECTRICITY_BILL_PAYMENT"
  | "WATER_BILL_PAYMENT"
  | "TV_BILL_PAYMENT"
  | "INTERNET_BILL_PAYMENT"
  | "EDUCATION_BILL_PAYMENT"
  | "GOVERNMENT_BILL_PAYMENT"
  | "TRANSPORT_BILL_PAYMENT"
  | "OTHER";

export interface UtilityBiller {
  id:               number;
  name:             string;
  countryISOCode:   string;
  type:             BillerType;
  serviceType:      "PREPAID" | "POSTPAID";
  denominationType: "FIXED" | "RANGE";
  minAmount:        number | null;
  maxAmount:        number | null;
  fixedAmounts:     number[];
  logoUrls:         string[];
}

export interface UtilityPayResult {
  transactionId:           number;
  status:                  string;
  operatorTransactionId:   string | null;
  billerName:              string;
  subscriberAccountNumber: string;
  amount:                  number;
  currencyCode:            string;
  transactionDate:         string;
  balanceInfo:             { oldBalance: number; newBalance: number; currencyCode: string };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getBillers(
  countryCode: string,
  type?: BillerType,
): Promise<UtilityBiller[]> {
  const params = new URLSearchParams({ countryCode });
  if (type) params.set("type", type);
  return utFetch<UtilityBiller[]>(`/utilities/billers?${params}`);
}

export async function payBill(
  token: string,
  params: {
    billerId:               number;
    amount:                 number;
    subscriberAccountNumber: string;
  },
): Promise<UtilityPayResult> {
  return utFetch<UtilityPayResult>("/utilities/pay", token, {
    method: "POST",
    body:   JSON.stringify(params),
  });
}
