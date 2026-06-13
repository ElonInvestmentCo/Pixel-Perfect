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
// App Store: replace id000000000 with your real numeric Apple App ID after App Store Connect approval
// Google Play: matches app.json android.package exactly
const APP_STORE_URL   = "https://apps.apple.com/app/payvora/id000000000";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.payvora.mobile";

router.get("/logo.png", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(LOGO_PATH);
});

// ── Google Search Console ownership verification ──────────────────────────────
// Set GOOGLE_SITE_VERIFICATION env var to enable.
const GSV_TOKEN = process.env.GOOGLE_SITE_VERIFICATION ?? "";

// HTML file method: GET /google<token>.html
router.get(/^\/google[a-zA-Z0-9_-]+\.html$/, (req: Request, res: Response) => {
  const file = req.path.slice(1).replace(".html", "");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`google-site-verification: ${file}.html`);
});

// ── SEO: sitemap.xml ──────────────────────────────────────────────────────────
router.get("/sitemap.xml", (_req: Request, res: Response) => {
  const today = new Date().toISOString().split("T")[0];
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${PRODUCTION_URL}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${PRODUCTION_URL}/privacy</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${PRODUCTION_URL}/terms</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
</urlset>`);
});

// ── SEO: robots.txt ───────────────────────────────────────────────────────────
router.get("/robots.txt", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(`User-agent: *\nAllow: /\nAllow: /privacy\nAllow: /terms\nDisallow: /api/\nDisallow: /.well-known/\n\nSitemap: ${PRODUCTION_URL}/sitemap.xml\n`);
});

// ── Universal Links: Apple App Site Association ───────────────────────────────
// iOS reads this file to verify the domain for Universal Links.
// Must be served as application/json WITHOUT any redirect from HTTP→HTTPS.
// Apple fetches this with a CDN — no auth, no cookies needed.
// Replace TEAMID with your 10-char Apple Developer Team ID once known.
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID ?? "TEAMID";
const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID ?? "com.payvora.mobile";

router.get("/.well-known/apple-app-site-association", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [`${APPLE_TEAM_ID}.${APPLE_BUNDLE_ID}`],
          components: [
            { "/": "/oauth-callback*", comment: "OAuth deep-link" },
            { "/": "/invite/*",        comment: "Referral invite" },
            { "/": "/transfer/*",      comment: "Payment request" },
            { "/": "/topup/*",         comment: "Top-up link" },
            { "/": "/*",               comment: "All paths" },
          ],
        },
      ],
    },
    webcredentials: {
      apps: [`${APPLE_TEAM_ID}.${APPLE_BUNDLE_ID}`],
    },
  });
});

// ── Android App Links: Digital Asset Links ────────────────────────────────────
// Android verifies this file to enable App Links (autoVerify intent filters).
// Replace SHA256 fingerprint with output of:
//   keytool -printcert -jarfile your-release.apk
// Or from EAS: eas credentials (then copy the SHA-256 fingerprint)
const ANDROID_SHA256 = process.env.ANDROID_SHA256_CERT ?? "REPLACE_WITH_RELEASE_SHA256_FINGERPRINT";
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE ?? "com.payvora.mobile";

router.get("/.well-known/assetlinks.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: [ANDROID_SHA256],
      },
    },
  ]);
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
  <!-- Smart App Banners — shown on iOS Safari and Android Chrome -->
  <meta name="apple-itunes-app" content="app-id=000000000, app-argument=${canonicalUrl}" />
  <meta name="google-play-app" content="app-id=com.payvora.mobile" />
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
  /* ────────────────────────────────────────────────────────────────────────────
     ANNOUNCEMENT BANNER
  ──────────────────────────────────────────────────────────────────────────── */
  .ann-banner {
    background: #0A0A0A;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    padding: 12px 48px;
    position: relative;
    line-height: 1.4;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .ann-banner a {
    color: #C8FF00;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }
  .ann-banner a:hover { text-decoration: underline; }
  .ann-dismiss {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 4px 8px;
    transition: color 0.15s;
  }
  .ann-dismiss:hover { color: #fff; }

  /* ────────────────────────────────────────────────────────────────────────────
     HERO
  ──────────────────────────────────────────────────────────────────────────── */
  .hero {
    padding: 80px 0 60px;
    border-bottom: 1px solid #E5E5E5;
    background: #fff;
  }
  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  /* ── Left ── */
  .hero-left { display: flex; flex-direction: column; }

  .hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #E0E0E0;
    border-radius: 100px;
    padding: 6px 14px 6px 8px;
    font-size: 12px;
    font-weight: 600;
    color: #444;
    margin-bottom: 32px;
    width: fit-content;
    background: #FAFAFA;
  }
  .hero-pill-dot {
    width: 20px;
    height: 20px;
    background: #C8FF00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  .hero-title {
    font-size: clamp(44px, 5.5vw, 72px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.0;
    color: #0A0A0A;
    margin-bottom: 24px;
    text-wrap: balance;
  }
  .hero-title em {
    font-style: normal;
    color: transparent;
    -webkit-text-stroke: 2px #0A0A0A;
  }

  .hero-sub {
    font-size: 17px;
    color: #6B7280;
    line-height: 1.7;
    max-width: 440px;
    margin-bottom: 40px;
  }

  .hero-badges {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  .hero-badge-link {
    display: inline-block;
    transition: opacity 0.2s, transform 0.15s;
  }
  .hero-badge-link:hover { opacity: 0.8; transform: translateY(-1px); text-decoration: none; }
  .hero-badge-link img { height: 44px; width: auto; display: block; }

  .hero-social-proof {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hero-stars { color: #F59E0B; font-size: 15px; letter-spacing: 1px; }
  .hero-proof-text { font-size: 13px; color: #9CA3AF; }
  .hero-proof-text strong { color: #374151; font-weight: 600; }

  /* ── Right ── */
  .hero-right {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* ── PayVora Card Scene ── */
  .pv-scene {
    position: relative;
    width: 460px;
    height: 500px;
    flex-shrink: 0;
  }

  /* Ambient glow */
  .pv-glow {
    position: absolute;
    width: 420px;
    height: 420px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(ellipse at 45% 55%,
      rgba(91,69,255,0.22) 0%,
      rgba(91,69,255,0.08) 40%,
      transparent 68%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* Network SVG */
  .pv-network {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
  .pv-net-a {
    stroke-dasharray: 10 8;
    animation: pv-dash-a 3.6s linear infinite;
  }
  .pv-net-b {
    stroke-dasharray: 7 12;
    animation: pv-dash-b 5.2s linear infinite;
  }
  .pv-net-c {
    stroke-dasharray: 5 14;
    animation: pv-dash-c 4.4s linear infinite;
  }
  .pv-node-pulse {
    animation: pv-node-pop 2.8s ease-in-out infinite;
  }
  .pv-node-pulse2 {
    animation: pv-node-pop 3.5s ease-in-out infinite 0.9s;
  }
  .pv-node-lime {
    animation: pv-node-pop 4s ease-in-out infinite 1.6s;
  }

  /* Virtual Card */
  .pv-card {
    position: absolute;
    left: 60px;
    top: 145px;
    width: 340px;
    height: 210px;
    border-radius: 20px;
    background: linear-gradient(140deg,
      #080d1a 0%,
      #0f1535 28%,
      #1d1260 55%,
      #5B45FF 100%);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.10),
      0 48px 96px rgba(91,69,255,0.40),
      0 24px 48px rgba(0,0,0,0.50),
      inset 0 1px 0 rgba(255,255,255,0.14),
      inset 0 -1px 0 rgba(0,0,0,0.30);
    overflow: hidden;
    animation: pv-card-float 6s ease-in-out infinite;
    transform: perspective(1100px) rotateX(7deg) rotateY(-13deg);
    transform-origin: center center;
    z-index: 10;
  }

  /* Reflection sweep */
  .pv-card::before {
    content: '';
    position: absolute;
    top: -60%;
    left: -80%;
    width: 55%;
    height: 220%;
    background: linear-gradient(
      108deg,
      transparent 38%,
      rgba(255,255,255,0.07) 48%,
      rgba(255,255,255,0.11) 52%,
      transparent 62%
    );
    animation: pv-reflect 5s ease-in-out infinite;
    pointer-events: none;
    z-index: 20;
  }

  /* Inner mesh grid */
  .pv-card-mesh {
    position: absolute;
    inset: 0;
    opacity: 0.055;
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,1) 30px, rgba(255,255,255,1) 31px),
      repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,1) 30px, rgba(255,255,255,1) 31px);
    pointer-events: none;
  }

  /* Inner radial overlay */
  .pv-card-radial {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 85% -5%, rgba(91,69,255,0.55) 0%, transparent 50%),
      radial-gradient(ellipse at -5% 110%, rgba(5,8,20,0.7) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Lime accent bar */
  .pv-accent-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #E7F31D 0%, rgba(231,243,29,0.35) 80%, transparent 100%);
    border-radius: 20px 20px 0 0;
  }

  /* EMV Chip */
  .pv-emv-chip {
    position: absolute;
    top: 40px;
    left: 28px;
    width: 40px;
    height: 30px;
    border-radius: 6px;
    background: linear-gradient(135deg,
      #c9a227 0%,
      #f0d060 30%,
      #c9a227 55%,
      #e8c84a 75%,
      #b8901a 100%);
    box-shadow:
      0 2px 6px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.35);
  }
  .pv-emv-chip::before {
    content: '';
    position: absolute;
    top: 9px; left: 0; right: 0;
    height: 1px;
    background: rgba(100,70,0,0.25);
  }
  .pv-emv-chip::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 13px;
    width: 1px;
    background: rgba(100,70,0,0.2);
  }

  /* Contactless / NFC symbol */
  .pv-nfc {
    position: absolute;
    top: 42px;
    right: 26px;
    opacity: 0.55;
  }

  /* Card logo */
  .pv-card-logo {
    position: absolute;
    top: 38px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.88);
    text-shadow:
      0 0 24px rgba(91,69,255,0.9),
      0 0 8px rgba(91,69,255,0.6),
      0 2px 4px rgba(0,0,0,0.5);
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* Card number */
  .pv-cardnum {
    position: absolute;
    bottom: 68px;
    left: 28px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.82);
    font-family: 'SF Mono','Courier New',monospace;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  }

  /* Card details row */
  .pv-card-row {
    position: absolute;
    bottom: 26px;
    left: 28px;
    right: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .pv-card-group { display: flex; flex-direction: column; gap: 2px; }
  .pv-card-dlabel {
    font-size: 7.5px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.38);
    font-weight: 600;
  }
  .pv-card-dval {
    font-size: 11.5px;
    font-weight: 700;
    color: rgba(255,255,255,0.88);
    letter-spacing: 0.04em;
  }
  .pv-card-dval-lime { color: #E7F31D; }

  /* Floating indicator chips */
  .pv-indicator {
    position: absolute;
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    padding: 10px 14px;
    box-shadow:
      0 8px 28px rgba(0,0,0,0.10),
      0 2px 6px rgba(0,0,0,0.06);
    white-space: nowrap;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pv-ind-icon {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .pv-ind-label { font-size: 10.5px; color: #9CA3AF; font-weight: 500; line-height: 1; margin-bottom: 2px; }
  .pv-ind-val   { font-size: 13.5px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.3px; line-height: 1; }
  .pv-ind-val-green { color: #059669; }

  .pv-ind-balance {
    top: 24px; right: 8px;
    animation: pv-float-a 5.2s ease-in-out infinite;
  }
  .pv-ind-secure {
    bottom: 50px; left: 0px;
    animation: pv-float-b 5.8s ease-in-out infinite;
  }
  .pv-ind-airtime {
    top: 110px; left: -4px;
    animation: pv-float-c 4.9s ease-in-out infinite 0.4s;
  }
  .pv-ind-gift {
    bottom: 108px; right: 4px;
    animation: pv-float-a 6.1s ease-in-out infinite 1.1s;
  }

  /* Transaction particles */
  .pv-pt {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 5;
  }

  /* ── Keyframes ── */
  @keyframes pv-card-float {
    0%,100% { transform: perspective(1100px) rotateX(7deg) rotateY(-13deg) translateY(0px); }
    50%      { transform: perspective(1100px) rotateX(9deg) rotateY(-9deg)  translateY(-13px); }
  }
  @keyframes pv-reflect {
    0%        { left: -80%;  opacity: 0; }
    8%        { opacity: 1; }
    55%       { left: 130%;  opacity: 1; }
    56%,100%  { left: 130%;  opacity: 0; }
  }
  @keyframes pv-float-a {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-9px); }
  }
  @keyframes pv-float-b {
    0%,100% { transform: translateY(0px) translateX(0px); }
    50%     { transform: translateY(8px) translateX(3px); }
  }
  @keyframes pv-float-c {
    0%,100% { transform: translateY(0px) translateX(0px); }
    50%     { transform: translateY(-7px) translateX(-3px); }
  }
  @keyframes pv-dash-a {
    to { stroke-dashoffset: -72; }
  }
  @keyframes pv-dash-b {
    to { stroke-dashoffset: -76; }
  }
  @keyframes pv-dash-c {
    to { stroke-dashoffset: 76; }
  }
  @keyframes pv-node-pop {
    0%,100% { opacity: 0.45; r: 3; }
    50%     { opacity: 0.9;  r: 4.5; }
  }
  @keyframes pv-pt-a {
    0%,100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.55; }
    50%     { transform: translateY(-22px) translateX(11px) scale(0.7); opacity: 0.15; }
  }
  @keyframes pv-pt-b {
    0%,100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
    50%     { transform: translateY(18px) translateX(-14px) scale(1.3); opacity: 0.1; }
  }
  @keyframes pv-pt-c {
    0%,100% { transform: translateY(0) scale(1); opacity: 0.5; }
    33%     { transform: translateY(-12px) scale(0.8); opacity: 0.2; }
    66%     { transform: translateY(8px) scale(1.1); opacity: 0.35; }
  }

  /* ────────────────────────────────────────────────────────────────────────────
     TRUST STRIP
  ──────────────────────────────────────────────────────────────────────────── */
  .trust-strip {
    border-bottom: 1px solid #E5E5E5;
    padding: 32px 48px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .trust-label {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 24px;
  }
  .trust-logos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  }
  .trust-logo {
    font-size: 15px;
    font-weight: 700;
    color: #C4C4C4;
    letter-spacing: -0.02em;
    transition: color 0.2s;
  }
  .trust-logo:hover { color: #9CA3AF; }

  /* ────────────────────────────────────────────────────────────────────────────
     FEATURES
  ──────────────────────────────────────────────────────────────────────────── */
  .section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 96px 48px;
  }
  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 48px;
    flex-wrap: wrap;
  }
  .section-kicker {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9CA3AF;
    margin-bottom: 10px;
  }
  .section-title {
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.1;
    color: #0A0A0A;
    text-wrap: balance;
  }
  .section-desc {
    font-size: 15px;
    color: #6B7280;
    line-height: 1.7;
    max-width: 320px;
    align-self: flex-end;
  }

  /* Border-grid feature cards */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid #E5E5E5;
    border-radius: 20px;
    overflow: hidden;
  }
  .feature-card {
    padding: 36px 32px;
    border-right: 1px solid #E5E5E5;
    border-bottom: 1px solid #E5E5E5;
    background: #fff;
    transition: background 0.15s;
    position: relative;
  }
  .feature-card:hover { background: #FAFAFA; }
  .feature-card:nth-child(3n) { border-right: none; }
  .feature-card:nth-child(n+4) { border-bottom: none; }

  .feature-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid #E5E5E5;
    background: #F9F9F9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 20px;
  }
  .feature-title {
    font-size: 15px;
    font-weight: 700;
    color: #0A0A0A;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }
  .feature-desc { font-size: 13px; color: #6B7280; line-height: 1.65; }

  /* ────────────────────────────────────────────────────────────────────────────
     STATS BAND
  ──────────────────────────────────────────────────────────────────────────── */
  .stats-band {
    border-top: 1px solid #E5E5E5;
    border-bottom: 1px solid #E5E5E5;
    background: #FAFAFA;
  }
  .stats-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    divide-x: 1px solid #E5E5E5;
  }
  .stat-item {
    padding: 48px 32px;
    border-right: 1px solid #E5E5E5;
    text-align: left;
  }
  .stat-item:last-child { border-right: none; }
  .stat-value {
    font-size: 42px;
    font-weight: 900;
    letter-spacing: -0.04em;
    color: #0A0A0A;
    line-height: 1;
    margin-bottom: 8px;
  }
  .stat-value span { color: #C8FF00; }
  .stat-label { font-size: 13px; color: #9CA3AF; font-weight: 500; }

  /* ────────────────────────────────────────────────────────────────────────────
     HOW IT WORKS
  ──────────────────────────────────────────────────────────────────────────── */
  .how-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 96px 48px;
  }
  .how-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #E5E5E5;
    border: 1px solid #E5E5E5;
    border-radius: 20px;
    overflow: hidden;
    margin-top: 48px;
  }
  .how-step {
    background: #fff;
    padding: 40px 32px;
    transition: background 0.15s;
  }
  .how-step:hover { background: #FAFAFA; }
  .step-num {
    width: 36px;
    height: 36px;
    background: #0A0A0A;
    color: #C8FF00;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 20px;
  }
  .step-title { font-size: 17px; font-weight: 800; color: #0A0A0A; margin-bottom: 10px; letter-spacing: -0.03em; }
  .step-desc { font-size: 13px; color: #6B7280; line-height: 1.65; }

  /* ────────────────────────────────────────────────────────────────────────────
     CTA SECTION — dark
  ──────────────────────────────────────────────────────────────────────────── */
  .cta-outer {
    padding: 0 48px 96px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .cta-card {
    background: #0A0A0A;
    border-radius: 24px;
    padding: 80px 64px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 48px;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .cta-card::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(200,255,0,0.08) 0%, transparent 65%);
    pointer-events: none;
  }
  .cta-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #C8FF00;
    margin-bottom: 16px;
  }
  .cta-title {
    font-size: clamp(28px, 3.5vw, 44px);
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 16px;
    text-wrap: balance;
  }
  .cta-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.5);
    line-height: 1.65;
    max-width: 420px;
  }
  .cta-badges {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .cta-badge-link {
    display: inline-block;
    transition: opacity 0.2s, transform 0.15s;
  }
  .cta-badge-link:hover { opacity: 0.8; transform: translateY(-1px); text-decoration: none; }
  .cta-badge-link img { height: 44px; width: auto; display: block; }

  /* ────────────────────────────────────────────────────────────────────────────
     RESPONSIVE
  ──────────────────────────────────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .float-card-1, .float-card-2 { display: none; }
    .stats-inner { grid-template-columns: repeat(2, 1fr); }
    .stat-item:nth-child(2) { border-right: none; }
    .stat-item:nth-child(3) { border-right: 1px solid #E5E5E5; }
    .stat-item:nth-child(3), .stat-item:nth-child(4) { border-top: 1px solid #E5E5E5; }
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .feature-card:nth-child(3n) { border-right: 1px solid #E5E5E5; }
    .feature-card:nth-child(2n) { border-right: none; }
    .feature-card:nth-child(n+4) { border-bottom: 1px solid #E5E5E5; }
    .feature-card:nth-child(n+5) { border-bottom: none; }
    .how-grid { grid-template-columns: 1fr; }
    .cta-card { grid-template-columns: 1fr; gap: 32px; padding: 56px 40px; }
    .cta-badges { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
  }

  @media (max-width: 768px) {
    .hero { padding: 56px 0 48px; }
    .hero-container, .section, .how-section, .cta-outer, .trust-strip { padding-left: 24px; padding-right: 24px; }
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .hero-right { order: -1; }
    .pv-scene { width: 100%; max-width: 320px; height: 380px; }
    .pv-card { left: 20px; top: 100px; width: 280px; height: 174px; }
    .pv-card-logo { font-size: 11px; }
    .pv-cardnum { font-size: 12px; bottom: 52px; left: 20px; }
    .pv-card-row { left: 20px; right: 20px; bottom: 20px; }
    .pv-ind-balance { top: 16px; right: 0; }
    .pv-ind-secure  { bottom: 30px; left: 0; }
    .pv-ind-airtime { display: none; }
    .pv-ind-gift    { display: none; }
    .features-grid { grid-template-columns: 1fr; border-radius: 16px; }
    .feature-card:nth-child(n) { border-right: none; border-bottom: 1px solid #E5E5E5; }
    .feature-card:last-child { border-bottom: none; }
    .stats-inner { grid-template-columns: 1fr 1fr; padding: 0 24px; }
    .stat-item { padding: 32px 20px; }
    .cta-card { padding: 40px 28px; border-radius: 20px; }
  }

  @media (max-width: 480px) {
    .hero-title { letter-spacing: -0.03em; }
    .stats-inner { grid-template-columns: 1fr 1fr; }
    .stat-value { font-size: 32px; }
    .section-header { flex-direction: column; align-items: flex-start; }
    .section-desc { max-width: 100%; }
  }
</style>

<!-- ── Announcement Banner ── -->
<div class="ann-banner" id="ann-banner">
  <span>🚀 PayVora is now live in 150+ countries — send money to anyone, anywhere.</span>
  <a href="#download">Download free →</a>
  <button class="ann-dismiss" id="ann-dismiss" aria-label="Dismiss">&#x2715;</button>
</div>
<script>
  (function() {
    var btn = document.getElementById('ann-dismiss');
    var bar = document.getElementById('ann-banner');
    if (btn && bar) {
      btn.addEventListener('click', function() {
        bar.style.display = 'none';
      });
    }
  })();
</script>

<main>
  <!-- ── Hero ── -->
  <section class="hero">
    <div class="hero-container">
      <div class="hero-grid">

        <!-- Left -->
        <div class="hero-left">
          <div class="hero-pill">
            <span class="hero-pill-dot">✦</span>
            The all-in-one money app
          </div>

          <h1 class="hero-title">Your money,<br /><em>everywhere</em>.</h1>

          <p class="hero-sub">Send money instantly, top up airtime, buy gift cards, pay bills, and manage crypto — all in one beautifully designed app.</p>

          <div class="hero-badges" id="download">
            <a class="hero-badge-link" href="${APP_STORE_URL}" target="_blank" rel="noopener noreferrer">
              <img src="/app-store-badge.svg" alt="Download on the App Store" />
            </a>
            <a class="hero-badge-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">
              <img src="/google-play-badge.svg" alt="Get it on Google Play" />
            </a>
          </div>

          <div class="hero-social-proof">
            <span class="hero-stars">★★★★★</span>
            <span class="hero-proof-text"><strong>50,000+</strong> five-star reviews</span>
          </div>
        </div>

        <!-- Right: PayVora Card Scene -->
        <div class="hero-right">
          <div class="pv-scene">

            <!-- Ambient glow -->
            <div class="pv-glow"></div>

            <!-- Global payment network lines -->
            <svg class="pv-network" viewBox="0 0 460 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <!-- Primary flow line: left to right across card -->
              <path class="pv-net-a" d="M0,110 C60,90 100,140 160,130 S260,80 320,120 S400,160 460,140"
                stroke="rgba(91,69,255,0.18)" stroke-width="1.5" fill="none"/>
              <!-- Secondary flow: lower arc -->
              <path class="pv-net-b" d="M0,340 C80,310 140,370 220,350 S340,300 420,330 S460,340 460,340"
                stroke="rgba(91,69,255,0.11)" stroke-width="1.2" fill="none"/>
              <!-- Lime accent trace -->
              <path class="pv-net-c" d="M30,430 C100,410 180,460 260,440 S370,400 460,430"
                stroke="rgba(231,243,29,0.15)" stroke-width="1" fill="none"/>
              <!-- Diagonal cross-link -->
              <path d="M80,80 L200,420" stroke="rgba(91,69,255,0.07)" stroke-width="1" stroke-dasharray="4 12"/>
              <path d="M380,60 L240,460" stroke="rgba(91,69,255,0.06)" stroke-width="1" stroke-dasharray="4 14"/>
              <!-- Network nodes -->
              <circle class="pv-node-pulse"  cx="160" cy="130" r="3.5" fill="rgba(91,69,255,0.65)"/>
              <circle class="pv-node-pulse2" cx="320" cy="120" r="4"   fill="rgba(91,69,255,0.75)"/>
              <circle class="pv-node-pulse"  cx="80"  cy="340" r="3"   fill="rgba(91,69,255,0.50)"/>
              <circle class="pv-node-pulse2" cx="220" cy="350" r="3.5" fill="rgba(91,69,255,0.60)"/>
              <circle class="pv-node-lime"   cx="420" cy="330" r="3"   fill="rgba(231,243,29,0.70)"/>
              <circle class="pv-node-lime"   cx="260" cy="440" r="2.5" fill="rgba(231,243,29,0.55)"/>
              <circle class="pv-node-pulse"  cx="30"  cy="430" r="2.5" fill="rgba(91,69,255,0.40)"/>
            </svg>

            <!-- ── Virtual Card ── -->
            <div class="pv-card">
              <!-- Lime top accent -->
              <div class="pv-accent-bar"></div>
              <!-- Subtle mesh -->
              <div class="pv-card-mesh"></div>
              <!-- Inner glow overlay -->
              <div class="pv-card-radial"></div>

              <!-- EMV chip -->
              <div class="pv-emv-chip"></div>

              <!-- Embossed logo -->
              <div class="pv-card-logo">PayVora</div>

              <!-- Contactless symbol -->
              <div class="pv-nfc">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 2.5 C17 6 17 16 11 19.5" stroke="rgba(255,255,255,0.65)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                  <path d="M11 6.5 C15 9 15 13 11 15.5"   stroke="rgba(255,255,255,0.65)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                  <path d="M11 10.5 C12.6 11.2 12.6 10.8 11 11.5" stroke="rgba(255,255,255,0.65)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                </svg>
              </div>

              <!-- Card number -->
              <div class="pv-cardnum">•••• &nbsp;•••• &nbsp;•••• &nbsp;8291</div>

              <!-- Details row -->
              <div class="pv-card-row">
                <div class="pv-card-group">
                  <div class="pv-card-dlabel">Card Holder</div>
                  <div class="pv-card-dval">ALEX JOHNSON</div>
                </div>
                <div class="pv-card-group">
                  <div class="pv-card-dlabel">Expires</div>
                  <div class="pv-card-dval">12 / 28</div>
                </div>
                <div class="pv-card-group">
                  <div class="pv-card-dlabel">Type</div>
                  <div class="pv-card-dval pv-card-dval-lime">Virtual</div>
                </div>
              </div>
            </div>

            <!-- ── Floating indicators ── -->

            <!-- Balance -->
            <div class="pv-indicator pv-ind-balance">
              <div class="pv-ind-icon" style="background:#EEECFF;">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="4" width="13" height="9" rx="2" stroke="#5B45FF" stroke-width="1.5"/><path d="M5 4V3a2.5 2.5 0 0 1 5 0v1" stroke="#5B45FF" stroke-width="1.5"/><circle cx="7.5" cy="8.5" r="1.5" fill="#5B45FF"/></svg>
              </div>
              <div>
                <div class="pv-ind-label">Total Balance</div>
                <div class="pv-ind-val">$12,480.00</div>
              </div>
            </div>

            <!-- Secure payment -->
            <div class="pv-indicator pv-ind-secure">
              <div class="pv-ind-icon" style="background:#ECFDF5;">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5 L13 3.5v4c0 3.5-2.5 5.8-5.5 6-3-0.2-5.5-2.5-5.5-6v-4z" stroke="#059669" stroke-width="1.5" fill="none"/><path d="M5 7.5l2 2 3-3" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="pv-ind-label">Payment Status</div>
                <div class="pv-ind-val pv-ind-val-green">✓ Secured</div>
              </div>
            </div>

            <!-- Airtime -->
            <div class="pv-indicator pv-ind-airtime">
              <div class="pv-ind-icon" style="background:#FFF7ED;">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="3" y="2" width="9" height="11" rx="2" stroke="#EA580C" stroke-width="1.5"/><circle cx="7.5" cy="10" r="1" fill="#EA580C"/><path d="M5 5h5M5 7h3" stroke="#EA580C" stroke-width="1.2" stroke-linecap="round"/></svg>
              </div>
              <div>
                <div class="pv-ind-label">Airtime Sent</div>
                <div class="pv-ind-val">$5.00</div>
              </div>
            </div>

            <!-- Gift card -->
            <div class="pv-indicator pv-ind-gift">
              <div class="pv-ind-icon" style="background:#FFF0F8;">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="6" width="13" height="8" rx="1.5" stroke="#DB2777" stroke-width="1.5"/><path d="M1 9h13" stroke="#DB2777" stroke-width="1.2"/><path d="M7.5 6V14" stroke="#DB2777" stroke-width="1.2"/><path d="M5 6c0-1.5 2.5-2.5 2.5 0" stroke="#DB2777" stroke-width="1.2" fill="none"/><path d="M10 6c0-1.5-2.5-2.5-2.5 0" stroke="#DB2777" stroke-width="1.2" fill="none"/></svg>
              </div>
              <div>
                <div class="pv-ind-label">Gift Card</div>
                <div class="pv-ind-val">Redeemed</div>
              </div>
            </div>

            <!-- Transaction particles -->
            <div class="pv-pt" style="width:7px;height:7px;background:#5B45FF;top:55px;left:200px;animation:pv-pt-a 3.8s ease-in-out infinite;"></div>
            <div class="pv-pt" style="width:4px;height:4px;background:#E7F31D;top:160px;right:36px;animation:pv-pt-b 4.5s ease-in-out infinite 0.6s;"></div>
            <div class="pv-pt" style="width:9px;height:9px;background:#5B45FF;opacity:0.28;bottom:130px;left:52px;animation:pv-pt-a 5.2s ease-in-out infinite 1.3s;"></div>
            <div class="pv-pt" style="width:5px;height:5px;background:#E7F31D;opacity:0.45;bottom:210px;right:48px;animation:pv-pt-b 4.0s ease-in-out infinite 0.4s;"></div>
            <div class="pv-pt" style="width:3px;height:3px;background:#fff;opacity:0.4;top:300px;left:28px;animation:pv-pt-c 5.6s ease-in-out infinite 2.1s;"></div>
            <div class="pv-pt" style="width:6px;height:6px;background:#5B45FF;opacity:0.30;top:420px;right:74px;animation:pv-pt-a 3.4s ease-in-out infinite 1.8s;"></div>
            <div class="pv-pt" style="width:4px;height:4px;background:#E7F31D;opacity:0.35;top:70px;right:120px;animation:pv-pt-c 4.8s ease-in-out infinite 0.9s;"></div>

          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ── Trust Strip ── -->
  <div class="trust-strip">
    <div class="trust-label">Trusted by users in 150+ countries</div>
    <div class="trust-logos">
      <span class="trust-logo">Africa</span>
      <span class="trust-logo">Europe</span>
      <span class="trust-logo">North America</span>
      <span class="trust-logo">Asia Pacific</span>
      <span class="trust-logo">Middle East</span>
      <span class="trust-logo">Latin America</span>
    </div>
  </div>

  <!-- ── Features ── -->
  <section class="section">
    <div class="section-header">
      <div>
        <div class="section-kicker">Features</div>
        <h2 class="section-title">Everything you need,<br />nothing you don't.</h2>
      </div>
      <p class="section-desc">PayVora brings together all the financial tools you use daily into one fast, secure, and delightful app.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon-wrap">⚡</div>
        <div class="feature-title">Instant Transfers</div>
        <div class="feature-desc">Send money to anyone, anywhere in the world. No delays, no hidden fees — funds arrive in seconds.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">📱</div>
        <div class="feature-title">Airtime & Data Top-Up</div>
        <div class="feature-desc">Top up airtime and data for any network in 150+ countries, directly from your phone.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">💳</div>
        <div class="feature-title">Virtual Cards</div>
        <div class="feature-desc">Instantly create virtual debit cards for secure online shopping. Freeze or delete anytime.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">🎁</div>
        <div class="feature-title">Gift Cards</div>
        <div class="feature-desc">Buy and send gift cards from hundreds of brands worldwide in seconds, with instant delivery.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">₿</div>
        <div class="feature-title">Crypto</div>
        <div class="feature-desc">Buy, sell, and hold crypto alongside your regular currency. One wallet for everything.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">🔒</div>
        <div class="feature-title">Bank-Grade Security</div>
        <div class="feature-desc">Face ID, biometric authentication, and end-to-end encryption keep every transaction safe.</div>
      </div>
    </div>
  </section>

  <!-- ── Stats Band ── -->
  <div class="stats-band">
    <div class="stats-inner">
      <div class="stat-item">
        <div class="stat-value">1M<span>+</span></div>
        <div class="stat-label">Active users worldwide</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">$2B<span>+</span></div>
        <div class="stat-label">Processed every month</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">150<span>+</span></div>
        <div class="stat-label">Countries supported</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">99.9<span>%</span></div>
        <div class="stat-label">Uptime SLA</div>
      </div>
    </div>
  </div>

  <!-- ── How It Works ── -->
  <section class="how-section">
    <div class="section-kicker">How it works</div>
    <h2 class="section-title">Up and running in 60 seconds.</h2>
    <div class="how-grid">
      <div class="how-step">
        <div class="step-num">1</div>
        <div class="step-title">Download the app</div>
        <div class="step-desc">Available on iOS and Android. Free to download, no credit card required to get started.</div>
      </div>
      <div class="how-step">
        <div class="step-num">2</div>
        <div class="step-title">Create your account</div>
        <div class="step-desc">Sign up with your email or continue with Apple or Google. Verify your identity in minutes.</div>
      </div>
      <div class="how-step">
        <div class="step-num">3</div>
        <div class="step-title">Start sending money</div>
        <div class="step-desc">Add funds and instantly send money, buy airtime, gift cards, or invest in crypto — worldwide.</div>
      </div>
    </div>
  </section>

  <!-- ── CTA ── -->
  <section class="cta-outer" id="download-cta">
    <div class="cta-card">
      <div>
        <div class="cta-eyebrow">Get started today</div>
        <h2 class="cta-title">Your money deserves<br />a better home.</h2>
        <p class="cta-sub">Join over a million people who manage their money smarter with PayVora. Free to download.</p>
      </div>
      <div class="cta-badges">
        <a class="cta-badge-link" href="${APP_STORE_URL}" target="_blank" rel="noopener noreferrer">
          <img src="/app-store-badge.svg" alt="Download on the App Store" />
        </a>
        <a class="cta-badge-link" href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener noreferrer">
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
