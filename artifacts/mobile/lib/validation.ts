// ─── Shared auth validation ───────────────────────────────────────────────────
// Single source of truth for all auth screen validation rules.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function isValidName(v: string): boolean {
  return v.trim().length >= 2;
}

export function isStrongPassword(v: string): boolean {
  return v.length >= 8;
}

export function validateEmail(v: string): string {
  if (!v.trim()) return "Email is required";
  if (!isValidEmail(v)) return "Enter a valid email address";
  return "";
}

export function validateSignInPassword(v: string): string {
  if (!v) return "Password is required";
  return "";
}

export function validateName(v: string): string {
  return isValidName(v) ? "" : "Full name must be at least 2 characters";
}

export function validateSignUpPassword(v: string): string {
  return isStrongPassword(v) ? "" : "Password must be at least 8 characters";
}
