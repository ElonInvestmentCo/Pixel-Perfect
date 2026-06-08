/**
 * ssrf.ts — Server-Side Request Forgery (SSRF) guard.
 *
 * Security rationale
 * ──────────────────
 * SSRF occurs when server code fetches a URL supplied (directly or indirectly)
 * by a user.  An attacker supplies an internal URL such as:
 *   http://169.254.169.254/latest/meta-data/   (AWS instance metadata)
 *   http://localhost:5432/                      (internal database port)
 *   http://10.0.0.1/admin                      (internal network service)
 *
 * This module provides a validation function that MUST be called before any
 * server-side HTTP request whose URL is derived from user input.
 *
 * Approach
 * ────────
 * Allowlist — only approved hostnames are permitted (safest default).
 * The list is populated from ALLOWED_FETCH_HOSTS in the environment.
 * IP ranges reserved for private / link-local / loopback use are blocked
 * by pattern before the allowlist check.
 *
 * Usage
 * ─────
 *   import { assertSafeFetchUrl } from "../lib/ssrf";
 *
 *   assertSafeFetchUrl(userProvidedUrl); // throws SsrfError if unsafe
 *   const res = await fetch(userProvidedUrl);
 */

const BLOCKED_PATTERNS: RegExp[] = [
  // Loopback
  /^127\./,
  /^::1$/,
  /^localhost$/i,

  // RFC 1918 private ranges
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,

  // Link-local (AWS/GCP/Azure metadata)
  /^169\.254\./,
  /^fe80:/i,

  // Multicast
  /^224\./,
  /^ff0[0-9a-f]:/i,

  // Unspecified
  /^0\.0\.0\.0$/,
];

export class SsrfError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

/**
 * Validates that a URL is safe to fetch server-side.
 *
 * @throws {SsrfError} if the URL is unsafe, malformed, or uses a
 *                     non-HTTP/HTTPS scheme.
 */
export function assertSafeFetchUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new SsrfError(`Invalid URL: "${raw}"`);
  }

  // Only allow HTTP / HTTPS — block file://, ftp://, gopher://, etc.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsrfError(
      `Unsafe URL scheme "${parsed.protocol}" — only http: and https: are allowed`,
    );
  }

  const host = parsed.hostname.toLowerCase();

  // Block known private / loopback / link-local patterns.
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(host)) {
      throw new SsrfError(
        `SSRF: URL hostname "${host}" resolves to a blocked address range`,
      );
    }
  }

  // Block non-standard ports that may reach internal services.
  const port = parsed.port ? Number(parsed.port) : null;
  if (port !== null && port !== 80 && port !== 443) {
    throw new SsrfError(
      `SSRF: non-standard port "${port}" is not allowed — only 80 and 443 are permitted`,
    );
  }

  return parsed;
}
