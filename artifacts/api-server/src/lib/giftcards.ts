/**
 * giftcards.ts — Reloadly Gift Cards API client with automatic token caching.
 *
 * Environment:
 *   RELOADLY_SANDBOX=true  → sandbox  (giftcards-sandbox.reloadly.com)
 *   RELOADLY_SANDBOX=false → live     (giftcards.reloadly.com)
 *
 * Token is separate from the Airtime token — different audience.
 */

import { env } from "./env";

const AUTH_URL = "https://auth.reloadly.com/oauth/token";

function getBase(): string {
  return env.RELOADLY_SANDBOX
    ? "https://giftcards-sandbox.reloadly.com"
    : "https://giftcards.reloadly.com";
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
    throw new Error(`Reloadly gift-cards auth failed (${res.status}): ${body}`);
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

async function gcFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const base  = getBase();

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/com.reloadly.giftcards-v1+json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    const err = Object.assign(
      new Error(`Reloadly gift-cards ${res.status}: ${body}`),
      { status: res.status, body },
    );
    throw err;
  }

  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GCBrand {
  brandId:   number;
  brandName: string;
}

export interface GCCategory {
  id:   number;
  name: string;
}

export interface GCProduct {
  productId:                   number;
  productName:                 string;
  global:                      boolean;
  supportsPreOrder:            boolean;
  senderCurrencyCode:          string;
  senderCurrencySymbol:        string;
  denominationType:            "FIXED" | "RANGE";
  recipientCurrencyCode:       string;
  recipientCurrencySymbol:     string;
  minRecipientDenomination:    number | null;
  maxRecipientDenomination:    number | null;
  minSenderDenomination:       number | null;
  maxSenderDenomination:       number | null;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations:    number[];
  logoUrls:                    string[];
  brand:                       GCBrand | null;
  category:                    GCCategory | null;
  country:                     { isoName: string; name: string; flagUrl: string | null } | null;
}

export interface GCPin {
  serialNumber: string | null;
  pinCode:      string | null;
  info1:        string | null;
  info2:        string | null;
  info3:        string | null;
  expiryDate:   string | null;
}

export interface GCOrderResult {
  transactionId:     number;
  status:            string;
  product:           { productId: number; productName: string; countryCode: string; quantity: number; unitPrice: number; totalPrice: number; currencyCode: string };
  smses:             Array<{ to: string; message: string }>;
  pins:              GCPin[];
  currencyCode:      string;
  amount:            number;
  discount:          number;
  discountCurrencyCode: string;
  fee:               number;
  recipientEmail:    string | null;
  customIdentifier:  string;
  transactionDate:   string;
  preOrdered:        boolean;
  balanceInfo:       { oldBalance: number; newBalance: number; currencyCode: string; updatedAt: string };
}

export interface GCProductsPage {
  content:          GCProduct[];
  first:            boolean;
  last:             boolean;
  totalPages:       number;
  totalElements:    number;
  numberOfElements: number;
  size:             number;
  number:           number;
}

// ── API methods ───────────────────────────────────────────────────────────────

export async function getGCProducts(params: {
  countryCode?: string;
  page?:        number;
  size?:        number;
  includeRange?: boolean;
}): Promise<GCProductsPage> {
  const q = new URLSearchParams();
  if (params.countryCode) q.set("countryCode", params.countryCode);
  q.set("page",          String(params.page  ?? 1));
  q.set("size",          String(params.size  ?? 20));
  q.set("includeRange",  String(params.includeRange ?? true));

  return gcFetch<GCProductsPage>(`/products?${q}`);
}

export async function getGCProduct(productId: number): Promise<GCProduct> {
  return gcFetch<GCProduct>(`/products/${productId}`);
}

export async function placeGCOrder(params: {
  productId:        number;
  quantity:         number;
  unitPrice:        number;
  customIdentifier: string;
  senderName:       string;
  recipientEmail:   string;
}): Promise<GCOrderResult> {
  return gcFetch<GCOrderResult>("/orders", {
    method: "POST",
    body:   JSON.stringify(params),
  });
}
