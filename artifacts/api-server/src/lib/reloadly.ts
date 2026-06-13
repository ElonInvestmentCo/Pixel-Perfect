/**
 * reloadly.ts — Reloadly Airtime API client with automatic token caching.
 *
 * Tokens are cached in-process for their full lifetime minus a 5-minute safety
 * buffer. A single shared token promise means concurrent requests don't race to
 * refresh; the first awaiter fetches and stores, subsequent ones reuse.
 *
 * Environment:
 *   RELOADLY_SANDBOX=true  → sandbox  (topups-sandbox.reloadly.com) — no real money
 *   RELOADLY_SANDBOX=false → live     (topups.reloadly.com)
 */

import { env } from "./env";

const AUTH_URL = "https://auth.reloadly.com/oauth/token";

function getBase(): string {
  return env.RELOADLY_SANDBOX
    ? "https://topups-sandbox.reloadly.com"
    : "https://topups.reloadly.com";
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
    throw new Error(`Reloadly auth failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };

  _tokenCache = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

async function getToken(): Promise<string> {
  if (_tokenCache && _tokenCache.expiresAt > Date.now()) {
    return _tokenCache.value;
  }

  if (!_tokenPromise) {
    _tokenPromise = fetchFreshToken().finally(() => {
      _tokenPromise = null;
    });
  }

  return _tokenPromise;
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────

async function reloadlyFetch<T>(
  path:    string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const base  = getBase();

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/com.reloadly.topups-v1+json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    const err = Object.assign(
      new Error(`Reloadly ${res.status}: ${body}`),
      { status: res.status, body },
    );
    throw err;
  }

  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReloadlyCountry {
  isoName:        string;
  name:           string;
  currencyCode:   string;
  currencyName:   string;
  currencySymbol: string;
  flag:           string;
  callingCodes:   string[];
}

export interface ReloadlyOperator {
  operatorId:              number;
  name:                    string;
  bundle:                  boolean;
  data:                    boolean;
  pinBased:                boolean;
  supportsLocalAmounts:    boolean;
  denominationType:        "RANGE" | "FIXED";
  senderCurrencyCode:      string;
  senderCurrencySymbol:    string;
  destinationCurrencyCode:   string;
  destinationCurrencySymbol: string;
  minAmount:               number | null;
  maxAmount:               number | null;
  localMinAmount:          number | null;
  localMaxAmount:          number | null;
  country:                 { isoName: string; name: string };
  fx:                      { rate: number; currencyCode: string };
  logoUrls:                string[];
  fixedAmounts:            number[];
  fixedAmountsDescriptions: Record<string, string>;
  localFixedAmounts:       number[];
  localFixedAmountsDescriptions: Record<string, string>;
  suggestedAmounts:        number[];
  suggestedAmountsMap:     Record<string, number>;
}

export interface ReloadlyDataBundle {
  id:               number;
  description:      string;
  price:            number;
  localPrice:       number;
  currencyCode:     string;
  localCurrencyCode: string;
  validityInDays:   number | null;
}

export interface ReloadlyTopupRequest {
  operatorId:       number;
  amount:           number;
  useLocalAmount:   boolean;
  customIdentifier: string;
  recipientPhone:   { countryCode: string; number: string };
  senderPhone:      { countryCode: string; number: string };
}

export interface ReloadlyTopupResponse {
  transactionId:              number;
  status:                     string;
  operatorTransactionId:      string | null;
  customIdentifier:           string;
  recipientPhone:             string;
  countryCode:                string;
  operatorId:                 number;
  operatorName:               string;
  discount:                   number;
  discountCurrencyCode:       string;
  requestedAmount:            number;
  requestedAmountCurrencyCode: string;
  deliveredAmount:            number;
  deliveredAmountCurrencyCode: string;
  transactionDate:            string;
  balanceInfo: {
    oldBalance:   number;
    newBalance:   number;
    currencyCode: string;
    currencyName: string;
    updatedAt:    string;
  };
}

// ── Paginated wrapper ─────────────────────────────────────────────────────────

interface Paginated<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}

// ── API methods ───────────────────────────────────────────────────────────────

export async function getCountries(): Promise<ReloadlyCountry[]> {
  const res = await reloadlyFetch<Paginated<ReloadlyCountry>>(
    "/countries?page=1&size=250",
  );
  return res.content ?? [];
}

export async function getOperatorsByCountry(
  countryCode: string,
): Promise<ReloadlyOperator[]> {
  const res = await reloadlyFetch<Paginated<ReloadlyOperator>>(
    `/operators/countries/${countryCode.toUpperCase()}` +
    `?page=1&size=200&includePin=false&includeData=true` +
    `&includeBundles=true&suggestedAmountsMap=true&suggestedAmounts=true`,
  );
  return res.content ?? [];
}

export async function detectOperator(
  phone:       string,
  countryCode: string,
): Promise<ReloadlyOperator> {
  const encoded = encodeURIComponent(phone);
  return reloadlyFetch<ReloadlyOperator>(
    `/operators/auto-detect/phone/${encoded}` +
    `/country-codes/${countryCode.toUpperCase()}` +
    `?suggestedAmountsMap=true&suggestedAmounts=true` +
    `&includeData=true&includeBundles=true`,
  );
}

export async function getDataBundles(
  operatorId: number,
): Promise<ReloadlyDataBundle[]> {
  const res = await reloadlyFetch<Paginated<ReloadlyDataBundle>>(
    `/operators/${operatorId}/bundles?page=1&size=100`,
  );
  return res.content ?? [];
}

export async function executeTopup(
  payload: ReloadlyTopupRequest,
): Promise<ReloadlyTopupResponse> {
  return reloadlyFetch<ReloadlyTopupResponse>("/topups", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}
