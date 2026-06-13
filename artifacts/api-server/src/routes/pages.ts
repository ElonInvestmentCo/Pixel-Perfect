/**
 * pages.ts — Public HTML pages served by the PayVora API server.
 *
 * Routes:
 *   GET /          → Landing page
 *   GET /privacy   → Privacy Policy (satisfies Google OAuth app verification)
 *   GET /terms     → Terms of Service
 *
 * These are served before the API routes and SPA fallback so they always
 * take precedence. A custom CSP is applied per response to allow inline
 * styles and Google Fonts, overriding the API-focused Helmet CSP.
 */

import { Router, type Request, type Response } from "express";
import path from "path";
import fs from "fs";

const router = Router();

// ── Logo asset — served from mobile assets directory ─────────────────────────
// GET /logo.png → serves icon.png (official splash screen / brand logo)
// Falls back to logo.png if icon is missing.
const LOGO_ICON = path.resolve(process.cwd(), "artifacts/mobile/assets/images/icon.png");
const LOGO_FALLBACK = path.resolve(process.cwd(), "artifacts/mobile/assets/images/logo.png");
const LOGO_PATH = fs.existsSync(LOGO_ICON) ? LOGO_ICON : LOGO_FALLBACK;

const PRODUCTION_URL = "https://www.payvora.org";

// ── App store URLs — update these once the app is approved and live ───────────
// App Store: replace id000000000 with the real numeric Apple App ID
// Google Play: replace com.payvora.app with the real package name if different
const APP_STORE_URL   = "https://apps.apple.com/app/payvora/id000000000";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.payvora.app";

router.get("/logo.png", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(LOGO_PATH);
});

// ── Google Search Console ownership verification ──────────────────────────────
// Set GOOGLE_SITE_VERIFICATION=<token> in Replit Secrets.
// Supports both the HTML-tag method (meta tag in <head>) and the
// HTML-file method (GET /google<token>.html returns the required file).

const GSV_TOKEN = process.env.GOOGLE_SITE_VERIFICATION ?? "";

// HTML file method: GET /google<token>.html
router.get(/^\/google[a-zA-Z0-9_-]+\.html$/, (req: Request, res: Response) => {
  const file = req.path.slice(1).replace(".html", ""); // e.g. "google<token>"
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`google-site-verification: ${file}.html`);
});

// ── CSP for HTML pages (looser than API CSP — allows fonts + inline styles) ──

function setPageCsp(res: Response): void {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
}

// ── Shared HTML shell ─────────────────────────────────────────────────────────

function shell(title: string, description: string, body: string, canonicalPath = "/"): string {
  const canonicalUrl = `${PRODUCTION_URL}${canonicalPath}`;
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${description}" />
  <title>${title} — PayVora</title>${GSV_TOKEN ? `\n  <meta name="google-site-verification" content="${GSV_TOKEN}" />` : ""}
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
  <link rel="apple-touch-icon" href="/icon-512.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title} — PayVora" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${PRODUCTION_URL}/logo.png" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="1024" />
  <meta property="og:site_name" content="PayVora" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:image" content="${PRODUCTION_URL}/logo.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --lime:    #C8FF00;
      --bg:      #FFFFFF;
      --surface: #F5F5F5;
      --card:    #EFEFEF;
      --border:  #E0E0E0;
      --text:    #0A0A0A;
      --muted:   #666666;
      --radius:  14px;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    a { color: #3A7D00; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Nav ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }
    .nav-brand img {
      height: 160px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .nav-brand:hover { opacity: 0.85; text-decoration: none; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 28px;
      list-style: none;
    }
    .nav-links a {
      font-size: 14px;
      font-weight: 500;
      color: var(--muted);
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text); text-decoration: none; }
    .nav-cta {
      background: var(--lime);
      color: #000 !important;
      font-weight: 600 !important;
      padding: 9px 20px;
      border-radius: 100px;
      font-size: 14px !important;
    }
    .nav-cta:hover { opacity: 0.9; text-decoration: none !important; }

    /* ── Layout ── */
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ── Footer ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 0;
      margin-top: 80px;
    }
    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .footer-logo {
      display: flex;
      align-items: center;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    .footer-brand img {
      height: 56px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .footer-brand:hover { opacity: 0.85; text-decoration: none; }
    .footer-links {
      display: flex;
      gap: 24px;
      list-style: none;
      flex-wrap: wrap;
    }
    .footer-links a {
      font-size: 13px;
      color: var(--muted);
      transition: color 0.2s;
    }
    .footer-links a:hover { color: var(--text); text-decoration: none; }
    .footer-copy {
      font-size: 13px;
      color: var(--muted);
      width: 100%;
      margin-top: 16px;
    }

    /* ── Hamburger button ── */
    .nav-hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      padding: 8px;
      background: none;
      border: none;
      outline: none;
      flex-shrink: 0;
    }
    .nav-hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text);
      border-radius: 2px;
      transition: transform 0.25s ease, opacity 0.2s ease;
    }
    .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile slide-down menu ── */
    .mobile-menu {
      display: none;
      position: fixed;
      top: 100px;
      left: 0;
      right: 0;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 8px 24px 24px;
      z-index: 98;
      flex-direction: column;
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu a {
      padding: 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--text);
      border-bottom: 1px solid var(--border);
      text-decoration: none;
      transition: color 0.15s;
    }
    .mobile-menu a:last-child { border-bottom: none; }
    .mobile-menu a:hover { color: var(--muted); text-decoration: none; }
    .mobile-menu .mob-cta {
      margin-top: 12px;
      text-align: center;
      background: var(--lime);
      color: #000 !important;
      font-weight: 700 !important;
      border-radius: 100px;
      padding: 14px !important;
      border-bottom: none !important;
    }

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .nav-hamburger { display: flex; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a class="nav-brand" href="${PRODUCTION_URL}"><img src="/brand-logo.png" alt="PayVora" /></a>
      <ul class="nav-links">
        <li><a href="${PRODUCTION_URL}">Home</a></li>
        <li><a href="${PRODUCTION_URL}/privacy">Privacy Policy</a></li>
        <li><a href="${PRODUCTION_URL}/terms">Terms of Service</a></li>
        <li><a class="nav-cta" href="#download">Download</a></li>
      </ul>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Mobile navigation">
    <a href="${PRODUCTION_URL}">Home</a>
    <a href="${PRODUCTION_URL}/privacy">Privacy Policy</a>
    <a href="${PRODUCTION_URL}/terms">Terms of Service</a>
    <a class="mob-cta" href="#download" id="mob-download">Download</a>
  </div>

  <script>
    (function () {
      var btn = document.getElementById('nav-hamburger');
      var menu = document.getElementById('mobile-menu');
      var mobDl = document.getElementById('mob-download');
      function close() {
        btn.classList.remove('open');
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
      btn.addEventListener('click', function () {
        var isOpen = menu.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    })();
  </script>

  ${body}

  <footer>
    <div class="footer-inner">
      <a class="footer-brand" href="${PRODUCTION_URL}"><img src="/logo.png" alt="PayVora" /></a>
      <ul class="footer-links">
        <li><a href="${PRODUCTION_URL}">Home</a></li>
        <li><a href="${PRODUCTION_URL}/privacy">Privacy Policy</a></li>
        <li><a href="${PRODUCTION_URL}/terms">Terms of Service</a></li>
        <li><a href="mailto:support@payvora.app">Contact</a></li>
      </ul>
      <div class="footer-copy">
        &copy; ${new Date().getFullYear()} PayVora Technologies Ltd. All rights reserved.
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// ── Landing page ──────────────────────────────────────────────────────────────

const landingBody = /* html */ `
<style>
  /* ── Hero — two-column cover layout ── */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 80px 0 60px;
    position: relative;
    overflow: hidden;
    background: #FFFFFF;
  }

  /* Layered subtle light texture */
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 140% 90% at 75% 55%, rgba(200,255,0,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 70% 70%  at 15% 20%, rgba(240,240,240,0.80) 0%, transparent 50%),
      radial-gradient(ellipse 55% 55%  at 85% 85%, rgba(235,235,235,0.70) 0%, transparent 50%),
      radial-gradient(ellipse 100% 60% at 50% 0%,  rgba(245,245,245,0.50) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* Subtle grain layer */
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.035;
    pointer-events: none;
    z-index: 0;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
    position: relative;
    z-index: 1;
    width: 100%;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 45% 55%;
    gap: 0;
    align-items: center;
    min-height: calc(100vh - 72px);
  }

  /* ── Hero Left ── */
  .hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 40px;
    padding-top: 20px;
  }

  .hero-logo-wrap {
    margin-bottom: 28px;
  }
  .hero-logo-wrap img {
    height: 120px;
    width: auto;
    display: block;
  }

  .hero-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #C8FF00;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 18px;
  }
  .hero-eyebrow-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #C8FF00;
    display: inline-block;
    box-shadow: 0 0 8px rgba(200,255,0,0.8);
  }

  .hero-title {
    font-size: clamp(44px, 4.8vw, 68px);
    font-weight: 900;
    line-height: 1.0;
    letter-spacing: -2.5px;
    margin-bottom: 20px;
    color: #0A0A0A;
  }
  .hero-title .accent { color: #7AAD00; }

  .hero-sub {
    font-size: 16px;
    color: #777;
    max-width: 400px;
    line-height: 1.75;
    margin-bottom: 36px;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 44px;
  }
  .hero-badge-link {
    display: inline-block;
    transition: opacity 0.2s, transform 0.2s;
  }
  .hero-badge-link:hover { opacity: 0.85; transform: translateY(-2px); text-decoration: none; }
  .hero-badge-link img { height: 54px; width: auto; display: block; }

  .hero-stats {
    display: flex;
    gap: 28px;
  }
  .hero-stat-val {
    font-size: 24px;
    font-weight: 900;
    color: #0A0A0A;
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .hero-stat-label {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .hero-stat-divider {
    width: 1px;
    height: 32px;
    background: #D8D8D8;
    align-self: center;
  }

  /* ── Hero Right ── */
  .hero-right {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    height: 100%;
  }

  .hero-phone {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
  }
  .hero-phone::before {
    content: '';
    position: absolute;
    inset: -80px;
    background: radial-gradient(ellipse at 50% 50%, rgba(200,255,0,0.10) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-phone img {
    max-width: 340px;
    width: 80%;
    height: auto;
    border-radius: 44px;
    position: relative;
    z-index: 1;
    box-shadow:
      0 0 0 1px rgba(200,255,0,0.12),
      0 80px 140px rgba(0,0,0,0.95),
      0 0 100px rgba(200,255,0,0.07);
    transform: perspective(1400px) rotateY(-6deg) rotateX(2deg);
    transition: transform 0.4s ease;
  }
  .hero-phone img:hover {
    transform: perspective(1400px) rotateY(-2deg) rotateX(1deg);
  }

  /* Feature tag list — bottom-right of hero (mirroring the Cover's feature list) */
  .hero-feature-list {
    width: 100%;
    padding: 0 8px;
  }
  .hero-feature-item {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    font-size: clamp(16px, 1.6vw, 20px);
    font-weight: 800;
    letter-spacing: -0.5px;
    color: rgba(0,0,0,0.25);
    transition: color 0.2s;
    cursor: default;
  }
  .hero-feature-item:last-child { border-bottom: none; }
  .hero-feature-item:hover { color: rgba(0,0,0,0.55); }
  .hero-feature-item .accent { color: #7AAD00; }
  .hero-feature-num {
    font-size: 11px;
    font-weight: 600;
    color: #BBBBBB;
    min-width: 24px;
    font-variant-numeric: tabular-nums;
  }

  /* Screens badge pill (like "100+ Screens" in Cover) */
  .hero-screens-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(200,255,0,0.1);
    border: 1px solid rgba(200,255,0,0.25);
    border-radius: 100px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 700;
    color: #C8FF00;
    margin-bottom: 24px;
    align-self: flex-start;
  }

  /* ── Features section ── */
  .section {
    padding: 96px 0;
    max-width: 1200px;
    margin: 0 auto;
    padding-left: 48px;
    padding-right: 48px;
  }
  .section-label {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    color: #C8FF00;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 900;
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .section-subtitle {
    font-size: 16px;
    color: #666;
    max-width: 480px;
    line-height: 1.75;
    margin-bottom: 48px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1px;
    background: #E4E4E4;
    border: 1px solid #E4E4E4;
    border-radius: 20px;
    overflow: hidden;
  }
  .feature-card {
    background: #FFFFFF;
    padding: 32px 28px;
    transition: background 0.2s;
  }
  .feature-card:hover { background: #FAFAFA; }
  .feature-icon {
    width: 44px;
    height: 44px;
    background: rgba(122,173,0,0.10);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 18px;
    border: 1px solid rgba(122,173,0,0.20);
  }
  .feature-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
  .feature-desc { font-size: 13px; color: #666; line-height: 1.65; }

  /* ── Stats ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #E4E4E4;
    border: 1px solid #E4E4E4;
    border-radius: 20px;
    overflow: hidden;
    margin-top: 2px;
  }
  .stat {
    background: #FFFFFF;
    padding: 36px 28px;
  }
  .stat-value {
    font-size: 38px;
    font-weight: 900;
    color: #7AAD00;
    letter-spacing: -1.5px;
    line-height: 1;
    margin-bottom: 8px;
  }
  .stat-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── CTA ── */
  .cta-section {
    padding: 0 48px 96px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .cta-card {
    background: linear-gradient(135deg, #F7F7F7 0%, #F0F0F0 100%);
    border: 1px solid #E0E0E0;
    border-radius: 24px;
    padding: 72px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-card::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 300px;
    background: radial-gradient(ellipse, rgba(200,255,0,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-card::after {
    content: '';
    position: absolute;
    bottom: -60px;
    right: -60px;
    width: 240px;
    height: 240px;
    background: radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-card h2 {
    font-size: clamp(28px, 4vw, 46px);
    font-weight: 900;
    letter-spacing: -1.5px;
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }
  .cta-card p {
    font-size: 16px;
    color: #666;
    margin-bottom: 36px;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
    position: relative;
    z-index: 1;
  }
  .store-badges {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  .store-badge-link {
    display: inline-block;
    transition: opacity 0.2s, transform 0.2s;
  }
  .store-badge-link:hover { opacity: 0.85; transform: translateY(-2px); text-decoration: none; }
  .store-badge-link img { height: 52px; width: auto; display: block; }

  @media (max-width: 960px) {
    .hero-grid {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .hero-container { padding: 0 24px; }
    .hero-left {
      padding-right: 0;
      align-items: center;
      text-align: center;
      padding-top: 32px;
      padding-bottom: 32px;
    }
    .hero-logo-wrap img { margin: 0 auto; }
    .hero-eyebrow { justify-content: center; }
    .hero-sub { margin-left: auto; margin-right: auto; }
    .hero-actions { justify-content: center; }
    .hero-stats { justify-content: center; }
    .hero-right { align-items: center; padding-bottom: 48px; }
    .hero-screens-badge { align-self: center; }
    .hero-phone img { transform: none; max-width: 280px; }
    .hero-feature-list { text-align: left; max-width: 400px; }
    .section { padding: 64px 24px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .cta-section { padding: 0 24px 64px; }
    .cta-card { padding: 48px 24px; }
  }

  @media (max-width: 540px) {
    .hero-title { letter-spacing: -1.5px; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .features-grid { grid-template-columns: 1fr; }
  }
</style>

<main>
  <!-- ── Hero ── -->
  <section class="hero">
    <div class="hero-container">
      <div class="hero-grid">

        <!-- Left column: brand + headline + CTA + stats -->
        <div class="hero-left">
          <div class="hero-logo-wrap">
            <img src="/brand-logo.png" alt="PayVora" />
          </div>
          <div class="hero-eyebrow">
            <span class="hero-eyebrow-dot"></span>
            Digital Wallet
          </div>
          <h1 class="hero-title">
            Digital Wallet<br /><span class="accent">Finance App</span>
          </h1>
          <p class="hero-sub">Send money instantly, top up airtime, pay bills, and manage virtual cards — all from one beautifully designed app.</p>
          <div class="hero-actions" id="download">
            <a class="hero-badge-link" href="${APP_STORE_URL}" target="_blank" rel="noopener noreferrer">
              <img src="/app-store-badge.svg" alt="Download on the App Store" />
            </a>
            <a class="hero-badge-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">
              <img src="/google-play-badge.svg" alt="Get it on Google Play" />
            </a>
          </div>
          <div class="hero-stats">
            <div>
              <div class="hero-stat-val">1M+</div>
              <div class="hero-stat-label">Active Users</div>
            </div>
            <div class="hero-stat-divider"></div>
            <div>
              <div class="hero-stat-val">$2B+</div>
              <div class="hero-stat-label">Processed</div>
            </div>
            <div class="hero-stat-divider"></div>
            <div>
              <div class="hero-stat-val">150+</div>
              <div class="hero-stat-label">Countries</div>
            </div>
          </div>
        </div>

        <!-- Right column: pill badge + phone + feature list -->
        <div class="hero-right">
          <div class="hero-screens-badge">
            &#10024; 100+ App Screens
          </div>
          <div class="hero-phone">
            <img src="/app-screenshot.png" alt="PayVora app interface" />
          </div>
          <div class="hero-feature-list">
            <div class="hero-feature-item">
              <span class="hero-feature-num">01</span>
              UX Scenarios
            </div>
            <div class="hero-feature-item">
              <span class="hero-feature-num">02</span>
              <span class="accent">Global</span>&nbsp;Style Guide
            </div>
            <div class="hero-feature-item">
              <span class="hero-feature-num">03</span>
              <span class="accent">Well</span>&nbsp;Organized
            </div>
            <div class="hero-feature-item">
              <span class="hero-feature-num">04</span>
              150+ Components
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ── Features ── -->
  <section class="section">
    <div class="section-label">Features</div>
    <h2 class="section-title">Everything you need,<br />nothing you don't</h2>
    <p class="section-subtitle">PayVora brings together all the financial tools you use daily into a single, fast, secure app.</p>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">Instant Transfers</div>
        <div class="feature-desc">Send money to anyone instantly. No delays, no hidden fees — funds arrive in seconds.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <div class="feature-title">Airtime & Data Top-Up</div>
        <div class="feature-desc">Top up airtime and data for any network, anywhere in the world, directly from the app.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💳</div>
        <div class="feature-title">Virtual Cards</div>
        <div class="feature-desc">Create virtual debit cards for secure online shopping. Freeze, unfreeze, or delete instantly.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-title">Portfolio Growth</div>
        <div class="feature-desc">Track your financial growth with beautiful insights, charts, and spending analytics.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <div class="feature-title">Bank-Grade Security</div>
        <div class="feature-desc">Face ID, biometric authentication, and end-to-end encryption keep your money safe.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎁</div>
        <div class="feature-title">Gift Cards & Crypto</div>
        <div class="feature-desc">Buy and redeem gift cards, and manage crypto holdings — all within one app.</div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat"><div class="stat-value">1M+</div><div class="stat-label">Active Users</div></div>
      <div class="stat"><div class="stat-value">$2B+</div><div class="stat-label">Processed Monthly</div></div>
      <div class="stat"><div class="stat-value">150+</div><div class="stat-label">Countries</div></div>
      <div class="stat"><div class="stat-value">99.9%</div><div class="stat-label">Uptime SLA</div></div>
    </div>
  </section>

  <!-- ── CTA ── -->
  <section class="cta-section">
    <div class="cta-card">
      <h2>Ready to take control<br />of your finances?</h2>
      <p>Download PayVora today and join over a million people managing their money the modern way.</p>
      <div class="store-badges">
        <a class="store-badge-link" href="${APP_STORE_URL}" target="_blank" rel="noopener noreferrer">
          <img src="/app-store-badge.svg" alt="Download on the App Store" />
        </a>
        <a class="store-badge-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">
          <img src="/google-play-badge.svg" alt="Get it on Google Play" />
        </a>
      </div>
    </div>
  </section>
</main>
`;

// ── Privacy Policy ────────────────────────────────────────────────────────────

const privacyBody = /* html */ `
<style>
  .legal-hero {
    padding: 64px 0 48px;
    border-bottom: 1px solid #E0E0E0;
    margin-bottom: 56px;
  }
  .legal-hero .badge {
    display: inline-block;
    background: rgba(200,255,0,0.1);
    border: 1px solid rgba(200,255,0,0.2);
    border-radius: 100px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #C8FF00;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 20px;
  }
  .legal-hero h1 {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 900;
    letter-spacing: -1.5px;
    margin-bottom: 12px;
  }
  .legal-meta { font-size: 14px; color: #888; }
  .legal-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 48px;
    align-items: start;
    padding-bottom: 80px;
  }
  .legal-toc {
    position: sticky;
    top: 80px;
  }
  .legal-toc-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #888;
    margin-bottom: 12px;
  }
  .legal-toc ul { list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .legal-toc a {
    font-size: 13px;
    color: #888;
    display: block;
    padding: 5px 0;
    border-left: 2px solid #E0E0E0;
    padding-left: 12px;
    transition: color 0.2s, border-color 0.2s;
  }
  .legal-toc a:hover { color: #5A8A00; border-color: #5A8A00; text-decoration: none; }
  .legal-content h2 {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-top: 48px;
    margin-bottom: 16px;
    padding-top: 48px;
    border-top: 1px solid #E0E0E0;
    scroll-margin-top: 80px;
  }
  .legal-content h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
  .legal-content h3 { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 10px; color: #5A8A00; }
  .legal-content p { font-size: 15px; color: #444444; line-height: 1.75; margin-bottom: 14px; }
  .legal-content ul, .legal-content ol { padding-left: 20px; margin-bottom: 14px; }
  .legal-content li { font-size: 15px; color: #444444; line-height: 1.75; margin-bottom: 6px; }
  .legal-content strong { color: #0A0A0A; font-weight: 600; }
  .legal-content a { color: #3A7D00; }
  .highlight-box {
    background: rgba(200,255,0,0.05);
    border: 1px solid rgba(200,255,0,0.15);
    border-radius: 12px;
    padding: 20px 24px;
    margin: 24px 0;
  }
  .highlight-box p { margin-bottom: 0; }
  @media (max-width: 768px) {
    .legal-layout { grid-template-columns: 1fr; }
    .legal-toc { display: none; }
  }
</style>

<main>
  <div class="container">
    <div class="legal-hero">
      <div class="badge">Legal</div>
      <h1>Privacy Policy</h1>
      <div class="legal-meta">Last updated: June 12, 2026 &nbsp;·&nbsp; Effective: June 12, 2026</div>
    </div>

    <div class="legal-layout">
      <aside class="legal-toc">
        <div class="legal-toc-title">On this page</div>
        <ul>
          <li><a href="#overview">Overview</a></li>
          <li><a href="#information-collected">Information We Collect</a></li>
          <li><a href="#how-we-use">How We Use Your Information</a></li>
          <li><a href="#google-oauth">Google Sign-In</a></li>
          <li><a href="#third-party">Third-Party Services</a></li>
          <li><a href="#data-sharing">Data Sharing</a></li>
          <li><a href="#data-retention">Data Retention</a></li>
          <li><a href="#security">Security</a></li>
          <li><a href="#your-rights">Your Rights</a></li>
          <li><a href="#children">Children's Privacy</a></li>
          <li><a href="#changes">Changes to This Policy</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
      </aside>

      <div class="legal-content">
        <h2 id="overview">1. Overview</h2>
        <p>PayVora Technologies Ltd ("PayVora", "we", "our", or "us") operates the PayVora mobile application and related services (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Service.</p>
        <p>By using PayVora, you agree to the collection and use of information in accordance with this policy. If you do not agree with any part of this policy, please do not use our Service.</p>

        <div class="highlight-box">
          <p><strong>Summary:</strong> We collect only the information necessary to provide you with financial services. We do not sell your personal data. Your financial data is encrypted and stored securely.</p>
        </div>

        <h2 id="information-collected">2. Information We Collect</h2>

        <h3>2.1 Information You Provide Directly</h3>
        <ul>
          <li><strong>Account information:</strong> Full name, email address, and password when you create an account.</li>
          <li><strong>Identity verification:</strong> Government-issued ID documents and selfie photographs required for KYC (Know Your Customer) compliance.</li>
          <li><strong>Financial information:</strong> Wallet balances, transaction history, recipient details for transfers.</li>
          <li><strong>Phone number:</strong> Required for airtime top-ups and account verification.</li>
          <li><strong>Communications:</strong> Messages or support requests you send to us.</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Device information:</strong> Device model, operating system version, unique device identifiers, and mobile network information.</li>
          <li><strong>Usage data:</strong> Features accessed, screens viewed, tap interactions, and session duration.</li>
          <li><strong>Log data:</strong> IP address, browser type, referring pages, and timestamps of service access.</li>
          <li><strong>Push notification token:</strong> Used to send you transaction alerts and account notifications.</li>
        </ul>

        <h3>2.3 Information from Third-Party Services</h3>
        <ul>
          <li><strong>Google Sign-In:</strong> If you choose to sign in with Google, we receive your name, email address, and Google account ID. See <a href="#google-oauth">Section 4</a> for details.</li>
          <li><strong>Apple Sign-In:</strong> If you sign in with Apple, we receive your name and email address (or a private relay email if you choose to hide your email).</li>
        </ul>

        <h2 id="how-we-use">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and manage your PayVora account</li>
          <li>Process financial transactions, transfers, and top-ups</li>
          <li>Verify your identity for regulatory compliance (KYC/AML)</li>
          <li>Send transaction confirmations and account activity alerts</li>
          <li>Detect and prevent fraud, unauthorized access, and illegal activities</li>
          <li>Provide customer support and respond to your inquiries</li>
          <li>Improve, personalise, and optimize our Service</li>
          <li>Comply with legal obligations and regulatory requirements</li>
          <li>Send product updates, security alerts, and administrative messages</li>
        </ul>
        <p>We will never use your information to send unsolicited marketing communications without your explicit consent.</p>

        <h2 id="google-oauth">4. Google Sign-In</h2>
        <p>PayVora offers the option to sign in using your Google account through Google OAuth 2.0. When you choose to sign in with Google:</p>
        <ul>
          <li>We request access only to your <strong>basic profile information</strong>: your name, email address, and Google account ID.</li>
          <li>We do <strong>not</strong> request access to your Google Drive, Gmail, contacts, calendar, or any other Google services.</li>
          <li>Google's authentication flow is handled entirely by Google's servers. Your Google password is never shared with or stored by PayVora.</li>
          <li>The information received from Google is used exclusively to create or authenticate your PayVora account.</li>
          <li>You may revoke PayVora's access to your Google account at any time via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account Permissions</a>.</li>
        </ul>

        <div class="highlight-box">
          <p>PayVora's use and transfer of information received from Google APIs adheres to the <strong><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a></strong>, including the Limited Use requirements.</p>
        </div>

        <h2 id="third-party">5. Third-Party Services</h2>
        <p>Our Service integrates with the following third-party providers. Each has its own privacy policy governing data use:</p>
        <ul>
          <li><strong>Google LLC</strong> — Authentication (Google Sign-In). <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
          <li><strong>Apple Inc.</strong> — Authentication (Sign in with Apple). <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple Privacy Policy</a></li>
          <li><strong>Reloadly</strong> — Airtime and data top-up processing. Your phone number and purchase amount are shared with Reloadly to fulfil top-up transactions.</li>
          <li><strong>Expo / React Native</strong> — Mobile application platform. Crash reports and performance metrics may be collected.</li>
        </ul>

        <h2 id="data-sharing">6. Data Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
        <ul>
          <li><strong>Service providers:</strong> With trusted third-party vendors who help us operate our Service (e.g., cloud hosting, push notifications), bound by confidentiality agreements.</li>
          <li><strong>Legal requirements:</strong> If required by law, court order, or governmental authority.</li>
          <li><strong>Fraud prevention:</strong> To protect PayVora, our users, or the public from fraud, abuse, or illegal activity.</li>
          <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to you.</li>
          <li><strong>With your consent:</strong> For any other purpose with your explicit prior consent.</li>
        </ul>

        <h2 id="data-retention">7. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as needed to provide our services. We will also retain and use your information as necessary to:</p>
        <ul>
          <li>Comply with legal obligations (financial records are typically retained for 7 years)</li>
          <li>Resolve disputes and enforce our agreements</li>
          <li>Prevent fraud and maintain security</li>
        </ul>
        <p>When you delete your account, we will remove your personal data within 30 days, except where retention is required by law.</p>

        <h2 id="security">8. Security</h2>
        <p>We take the security of your financial data seriously and implement industry-standard safeguards including:</p>
        <ul>
          <li>End-to-end encryption for all data in transit (TLS 1.3)</li>
          <li>AES-256 encryption for sensitive data at rest</li>
          <li>Biometric authentication (Face ID, fingerprint) support</li>
          <li>Secure PIN protection</li>
          <li>Regular security audits and penetration testing</li>
          <li>Bcrypt password hashing with per-user salts</li>
        </ul>
        <p>No method of electronic transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>

        <h2 id="your-rights">9. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
          <li><strong>Portability:</strong> Request a machine-readable copy of your data.</li>
          <li><strong>Restriction:</strong> Request that we restrict processing of your data.</li>
          <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
          <li><strong>Withdrawal of consent:</strong> Withdraw consent where processing is based on consent.</li>
        </ul>
        <p>To exercise any of these rights, please contact us at <a href="mailto:privacy@payvora.app">privacy@payvora.app</a>.</p>

        <h2 id="children">10. Children's Privacy</h2>
        <p>Our Service is not directed to children under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will take steps to delete such information.</p>

        <h2 id="changes">11. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will provide in-app notification. Your continued use of the Service after changes constitutes acceptance of the updated policy.</p>

        <h2 id="contact">12. Contact Us</h2>
        <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:privacy@payvora.app">privacy@payvora.app</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@payvora.app">support@payvora.app</a></li>
          <li><strong>Company:</strong> PayVora Technologies Ltd</li>
        </ul>
        <p>We will respond to all legitimate privacy requests within 30 days.</p>
      </div>
    </div>
  </div>
</main>
`;

// ── Terms of Service ──────────────────────────────────────────────────────────

const termsBody = /* html */ `
<style>
  .legal-hero {
    padding: 64px 0 48px;
    border-bottom: 1px solid #E0E0E0;
    margin-bottom: 56px;
  }
  .legal-hero .badge {
    display: inline-block;
    background: rgba(200,255,0,0.1);
    border: 1px solid rgba(200,255,0,0.2);
    border-radius: 100px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #C8FF00;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 20px;
  }
  .legal-hero h1 {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 900;
    letter-spacing: -1.5px;
    margin-bottom: 12px;
  }
  .legal-meta { font-size: 14px; color: #888; }
  .legal-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 48px;
    align-items: start;
    padding-bottom: 80px;
  }
  .legal-toc {
    position: sticky;
    top: 80px;
  }
  .legal-toc-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #888;
    margin-bottom: 12px;
  }
  .legal-toc ul { list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .legal-toc a {
    font-size: 13px;
    color: #888;
    display: block;
    padding: 5px 0;
    border-left: 2px solid #E0E0E0;
    padding-left: 12px;
    transition: color 0.2s, border-color 0.2s;
  }
  .legal-toc a:hover { color: #5A8A00; border-color: #5A8A00; text-decoration: none; }
  .legal-content h2 {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-top: 48px;
    margin-bottom: 16px;
    padding-top: 48px;
    border-top: 1px solid #E0E0E0;
    scroll-margin-top: 80px;
  }
  .legal-content h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
  .legal-content h3 { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 10px; color: #5A8A00; }
  .legal-content p { font-size: 15px; color: #444444; line-height: 1.75; margin-bottom: 14px; }
  .legal-content ul, .legal-content ol { padding-left: 20px; margin-bottom: 14px; }
  .legal-content li { font-size: 15px; color: #444444; line-height: 1.75; margin-bottom: 6px; }
  .legal-content strong { color: #0A0A0A; font-weight: 600; }
  .legal-content a { color: #3A7D00; }
  .highlight-box {
    background: rgba(200,255,0,0.05);
    border: 1px solid rgba(200,255,0,0.15);
    border-radius: 12px;
    padding: 20px 24px;
    margin: 24px 0;
  }
  .highlight-box p { margin-bottom: 0; }
  @media (max-width: 768px) {
    .legal-layout { grid-template-columns: 1fr; }
    .legal-toc { display: none; }
  }
</style>

<main>
  <div class="container">
    <div class="legal-hero">
      <div class="badge">Legal</div>
      <h1>Terms of Service</h1>
      <div class="legal-meta">Last updated: June 12, 2026 &nbsp;·&nbsp; Effective: June 12, 2026</div>
    </div>

    <div class="legal-layout">
      <aside class="legal-toc">
        <div class="legal-toc-title">On this page</div>
        <ul>
          <li><a href="#agreement">Agreement</a></li>
          <li><a href="#service">Description of Service</a></li>
          <li><a href="#eligibility">Eligibility</a></li>
          <li><a href="#account">Account Registration</a></li>
          <li><a href="#financial">Financial Services</a></li>
          <li><a href="#obligations">User Obligations</a></li>
          <li><a href="#prohibited">Prohibited Activities</a></li>
          <li><a href="#intellectual">Intellectual Property</a></li>
          <li><a href="#liability">Limitation of Liability</a></li>
          <li><a href="#indemnification">Indemnification</a></li>
          <li><a href="#termination">Termination</a></li>
          <li><a href="#governing">Governing Law</a></li>
          <li><a href="#changes">Changes to Terms</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </aside>

      <div class="legal-content">
        <h2 id="agreement">1. Agreement to Terms</h2>
        <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and PayVora Technologies Ltd ("PayVora", "we", "our", or "us") governing your use of the PayVora mobile application and associated services (collectively, the "Service").</p>
        <p>By downloading, installing, or using PayVora, you confirm that you have read, understood, and agree to be bound by these Terms and our <a href="https://www.payvora.org/privacy">Privacy Policy</a>. If you do not agree to these Terms, you must not use the Service.</p>

        <div class="highlight-box">
          <p><strong>Please read these Terms carefully.</strong> They contain important information about your rights and obligations, including limitations on our liability and dispute resolution procedures.</p>
        </div>

        <h2 id="service">2. Description of Service</h2>
        <p>PayVora is a financial technology application that provides the following services:</p>
        <ul>
          <li><strong>Wallet management:</strong> Maintain a digital wallet for holding and managing funds</li>
          <li><strong>Money transfers:</strong> Send and receive money to other PayVora users</li>
          <li><strong>Airtime & data top-ups:</strong> Purchase mobile airtime and data bundles for supported networks</li>
          <li><strong>Virtual card issuance:</strong> Create and manage virtual debit cards for online transactions</li>
          <li><strong>Bill payments:</strong> Pay utility bills and other services</li>
          <li><strong>Gift card services:</strong> Purchase and redeem digital gift cards</li>
          <li><strong>Cryptocurrency services:</strong> View and manage cryptocurrency holdings (where available)</li>
        </ul>
        <p>The availability of specific features may vary by region and is subject to change at our discretion.</p>

        <h2 id="eligibility">3. Eligibility</h2>
        <p>To use PayVora you must:</p>
        <ul>
          <li>Be at least 18 years of age</li>
          <li>Have the legal capacity to enter into a binding contract</li>
          <li>Not be prohibited from using financial services under applicable law</li>
          <li>Not be located in a jurisdiction where use of the Service is prohibited</li>
          <li>Provide accurate and complete identity verification information when required</li>
        </ul>

        <h2 id="account">4. Account Registration and Security</h2>
        <h3>4.1 Account Creation</h3>
        <p>You may create an account using your email address and password, or through Google Sign-In or Apple Sign-In. You are responsible for providing accurate, current, and complete information during registration and for keeping your account information updated.</p>

        <h3>4.2 Account Security</h3>
        <p>You are solely responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your login credentials and PIN</li>
          <li>All activities that occur under your account</li>
          <li>Immediately notifying PayVora of any unauthorized account access</li>
          <li>Ensuring you log out after each session on shared devices</li>
        </ul>
        <p>PayVora will never ask for your password or PIN via email, phone, or chat. Do not share these with anyone.</p>

        <h3>4.3 Identity Verification</h3>
        <p>We are required by law to verify the identity of our users (KYC). You agree to provide accurate identity documents and information when requested. Failure to complete verification may restrict your access to certain features.</p>

        <h2 id="financial">5. Financial Services and Transactions</h2>
        <h3>5.1 Transaction Limits</h3>
        <p>Transaction limits may apply based on your account verification level, jurisdiction, and other factors. These limits are subject to change and will be communicated within the app.</p>

        <h3>5.2 Fees</h3>
        <p>Some transactions may incur fees. All applicable fees will be clearly displayed before you confirm any transaction. Fees are non-refundable once a transaction is completed.</p>

        <h3>5.3 Transaction Finality</h3>
        <p>Completed financial transactions (transfers, top-ups, purchases) are generally final and may not be reversed. If you believe a transaction was made in error or without your authorization, contact us immediately at <a href="mailto:support@payvora.app">support@payvora.app</a>.</p>

        <h3>5.4 Airtime and Data Services</h3>
        <p>Airtime and data top-up services are fulfilled by third-party providers. Delivery times may vary. PayVora is not responsible for delays caused by mobile network operators or third-party providers.</p>

        <h2 id="obligations">6. User Obligations</h2>
        <p>By using the Service, you agree to:</p>
        <ul>
          <li>Use the Service only for lawful purposes and in compliance with all applicable laws</li>
          <li>Provide accurate and truthful information at all times</li>
          <li>Not share your account with any other person</li>
          <li>Keep your contact information and financial details current</li>
          <li>Immediately report any suspicious activity, security breach, or unauthorized transaction</li>
          <li>Comply with all applicable financial regulations and tax obligations</li>
        </ul>

        <h2 id="prohibited">7. Prohibited Activities</h2>
        <p>You must not use PayVora to:</p>
        <ul>
          <li>Conduct or facilitate money laundering, terrorist financing, or other illegal financial activities</li>
          <li>Engage in fraud, deception, or misrepresentation</li>
          <li>Send funds derived from illegal activities</li>
          <li>Circumvent applicable laws, regulations, or sanctions</li>
          <li>Interfere with or disrupt the Service's infrastructure</li>
          <li>Attempt unauthorized access to any accounts, systems, or networks</li>
          <li>Reverse engineer, decompile, or create derivative works of the app</li>
          <li>Use automated bots or scrapers to access the Service</li>
          <li>Violate any applicable export control or sanctions laws</li>
        </ul>
        <p>Violation of these prohibitions may result in immediate account termination and may be reported to relevant authorities.</p>

        <h2 id="intellectual">8. Intellectual Property</h2>
        <p>All content, features, functionality, and design elements of PayVora — including but not limited to text, graphics, logos, icons, images, audio clips, and software — are the exclusive property of PayVora Technologies Ltd and are protected by intellectual property laws.</p>
        <p>We grant you a limited, non-exclusive, non-transferable, revocable licence to use the Service for personal, non-commercial purposes in accordance with these Terms. This licence does not include the right to reproduce, modify, distribute, or commercially exploit any part of the Service.</p>

        <h2 id="liability">9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law:</p>
        <ul>
          <li>PayVora provides the Service "as is" and "as available" without warranties of any kind, express or implied.</li>
          <li>We do not warrant that the Service will be uninterrupted, error-free, or free of viruses.</li>
          <li>PayVora shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</li>
          <li>Our total liability to you for any claim arising from these Terms or your use of the Service shall not exceed the amount you paid to PayVora in the 12 months preceding the claim.</li>
        </ul>
        <p>Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.</p>

        <h2 id="indemnification">10. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless PayVora Technologies Ltd, its officers, directors, employees, and agents from any claims, liabilities, damages, costs, and expenses (including reasonable legal fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) any false or misleading information you provide.</p>

        <h2 id="termination">11. Termination</h2>
        <h3>11.1 By You</h3>
        <p>You may terminate your account at any time by contacting us at <a href="mailto:support@payvora.app">support@payvora.app</a>. Upon termination, your right to use the Service will immediately cease.</p>

        <h3>11.2 By PayVora</h3>
        <p>We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms, engaged in fraudulent activity, or for any other legitimate business reason.</p>
        <p>Upon termination, any outstanding transactions will be settled, and remaining funds will be returned to you in accordance with applicable regulations.</p>

        <h2 id="governing">12. Governing Law and Dispute Resolution</h2>
        <p>These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation.</p>
        <p>If a dispute cannot be resolved through negotiation, you agree to submit to binding arbitration before a recognised arbitration body. You waive any right to participate in class action lawsuits against PayVora.</p>

        <h2 id="changes">13. Changes to These Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes via in-app notification or email at least 14 days before the changes take effect. Your continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</p>

        <h2 id="contact">14. Contact Us</h2>
        <p>If you have questions about these Terms of Service, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@payvora.app">legal@payvora.app</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@payvora.app">support@payvora.app</a></li>
          <li><strong>Company:</strong> PayVora Technologies Ltd</li>
        </ul>
      </div>
    </div>
  </div>
</main>
`;

// ── Route handlers ────────────────────────────────────────────────────────────

router.get("/", (_req: Request, res: Response) => {
  setPageCsp(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(shell("Home", "PayVora — Next-generation mobile finance. Send money, top up airtime, manage virtual cards and more.", landingBody, "/"));
});

router.get("/privacy", (_req: Request, res: Response) => {
  setPageCsp(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(shell("Privacy Policy", "PayVora Privacy Policy — How we collect, use, and protect your personal information.", privacyBody, "/privacy"));
});

router.get("/terms", (_req: Request, res: Response) => {
  setPageCsp(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(shell("Terms of Service", "PayVora Terms of Service — The rules and guidelines governing your use of PayVora.", termsBody, "/terms"));
});

export default router;
