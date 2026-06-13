/**
 * utilities.ts — Reloadly Utility Payment API client with automatic token caching.
 *
 * Environment:
 *   RELOADLY_SANDBOX=true  → sandbox  (utilities-sandbox.reloadly.com)
 *   RELOADLY_SANDBOX=false → live     (utilities.reloadly.com)
 *
 * Token is separate from Airtime and Gift Cards — different audience.
 */

import { env } from "./env";

const AUTH_URL = "https://auth.reloadly.com/oauth/token";

function getBase(): string {
  return env.RELOADLY_SANDBOX
    ? "https://utilities-sandbox.reloadly.com"
    : "https://utilities.reloadly.com";
}

// ── Token cache ───────────────────────────────────────────────────────────────

interface CachedToken {
  value:     string;
  expiresAt: number;
}

let _tokenCache:   CachedToken | null    = null;
let _tokenPromise: Promise<string> | null = null;

async function fetchFreshToken(): Promise<string> {
  const base = getBase();
  const res = await fetch(AUTH_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      client_id:     env.RELOADLY_CLIENT_ID,
      client_secret: env.RELOADLY_CLIENT_SECRET,
      grant_type:    "client_credentials",
      audience:      base,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Reloadly utilities auth failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  _tokenCache = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
  return data.access_token;
}

async function getToken(): Promise<string> {
  if (_tokenCache && _tokenCache.expiresAt > Date.now()) return _tokenCache.value;
  if (!_tokenPromise) {
    _tokenPromise = fetchFreshToken().finally(() => { _tokenPromise = null; });
  }
  return _tokenPromise;
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function utFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const base  = getBase();

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/com.reloadly.utilities-v1+json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    const err = Object.assign(
      new Error(`Reloadly utilities ${res.status}: ${body}`),
      { status: res.status, body },
    );
    throw err;
  }

  return res.json() as Promise<T>;
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
  localMinAmount:   number | null;
  localMaxAmount:   number | null;
  fixedAmounts:     number[];
  logoUrls:         string[];
}

export interface UtilityPayResult {
  transactionId:         number;
  status:                string;
  operatorTransactionId: string | null;
  customIdentifier:      string;
  billerId:              number;
  billerName:            string;
  subscriberAccountNumber: string;
  amount:                number;
  currencyCode:          string;
  discount:              number;
  discountCurrencyCode:  string;
  fee:                   number;
  transactionDate:       string;
  balanceInfo: {
    oldBalance:   number;
    newBalance:   number;
    currencyCode: string;
    updatedAt:    string;
  };
}

interface BillersPage {
  content:          UtilityBiller[];
  totalElements:    number;
  totalPages:       number;
  last:             boolean;
  first:            boolean;
  numberOfElements: number;
  size:             number;
  number:           number;
}

// ── API methods ───────────────────────────────────────────────────────────────

export async function getBillers(params: {
  countryCode?: string;
  type?:        BillerType;
  page?:        number;
  size?:        number;
}): Promise<UtilityBiller[]> {
  const q = new URLSearchParams();
  if (params.countryCode) q.set("countryISOCode", params.countryCode);
  if (params.type)        q.set("type", params.type);
  q.set("page", String(params.page ?? 1));
  q.set("size", String(params.size ?? 50));

  const raw = await utFetch<BillersPage | UtilityBiller[]>(`/billers?${q}`);
  if (Array.isArray(raw)) return raw;
  return (raw as BillersPage).content ?? [];
}

export async function payUtilityBill(params: {
  billerId:               number;
  amount:                 number;
  subscriberAccountNumber: string;
  customIdentifier:       string;
  useLocalAmount?:        boolean;
}): Promise<UtilityPayResult> {
  return utFetch<UtilityPayResult>("/pay", {
    method: "POST",
    body:   JSON.stringify({
      billerId:               params.billerId,
      amount:                 params.amount,
      subscriberAccountNumber: params.subscriberAccountNumber,
      customIdentifier:       params.customIdentifier,
      useLocalAmount:         params.useLocalAmount ?? false,
    }),
  });
}
