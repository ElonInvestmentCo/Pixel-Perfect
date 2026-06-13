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

const router = Router();

// ── Logo asset — served from mobile assets directory ─────────────────────────
// GET /logo.png and GET /favicon.ico both serve icon.png (the canonical brand logo).
const LOGO_PATH = path.resolve(process.cwd(), "artifacts/mobile/assets/images/icon.png");

router.get("/logo.png", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(LOGO_PATH);
});

router.get("/favicon.ico", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(LOGO_PATH);
});

// ── Google Search Console ownership verification ──────────────────────────────
// Set GOOGLE_SITE_VERIFICATION=<token> in Railway env vars.
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

function shell(title: string, description: string, body: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${description}" />
  <title>${title} — PayVora</title>${GSV_TOKEN ? `\n  <meta name="google-site-verification" content="${GSV_TOKEN}" />` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --lime:    #C8FF00;
      --bg:      #0A0A0A;
      --surface: #141414;
      --card:    #1C1C1C;
      --border:  #2A2A2A;
      --text:    #FFFFFF;
      --muted:   #888888;
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

    a { color: var(--lime); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Nav ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10,10,10,0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .nav-logo img {
      height: 36px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .nav-logo span { color: var(--lime); }
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
    .footer-logo img {
      height: 28px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .footer-logo span { color: var(--lime); }
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

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <div class="nav-logo"><img src="/logo.png" alt="PayVora" /></div>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a class="nav-cta" href="#download">Download</a></li>
      </ul>
    </div>
  </nav>

  ${body}

  <footer>
    <div class="footer-inner">
      <div class="footer-logo"><img src="/logo.png" alt="PayVora" /></div>
      <ul class="footer-links">
        <li><a href="/">Home</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
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
  .hero {
    padding: 96px 0 80px;
    text-align: center;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(200,255,0,0.1);
    border: 1px solid rgba(200,255,0,0.25);
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    color: #C8FF00;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 28px;
  }
  .hero h1 {
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 20px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  .hero h1 .accent { color: #C8FF00; }
  .hero p {
    font-size: clamp(16px, 2vw, 20px);
    color: #888;
    max-width: 520px;
    margin: 0 auto 40px;
    line-height: 1.7;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 64px;
  }
  .btn-primary {
    background: #C8FF00;
    color: #000;
    font-weight: 700;
    font-size: 16px;
    padding: 14px 32px;
    border-radius: 100px;
    display: inline-block;
    transition: opacity 0.2s, transform 0.2s;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); text-decoration: none; }
  .btn-secondary {
    background: transparent;
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    padding: 14px 32px;
    border-radius: 100px;
    border: 1px solid #2A2A2A;
    display: inline-block;
    transition: border-color 0.2s, transform 0.2s;
  }
  .btn-secondary:hover { border-color: #555; transform: translateY(-1px); text-decoration: none; }

  /* ── Phone mockup ── */
  .phone-mockup {
    width: 280px;
    height: 580px;
    background: linear-gradient(145deg, #1C1C1C, #111);
    border-radius: 48px;
    border: 2px solid #2A2A2A;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  }
  .phone-mockup::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 28px;
    background: #0A0A0A;
    border-radius: 20px;
  }
  .phone-screen {
    width: 248px;
    height: 540px;
    background: linear-gradient(180deg, #111 0%, #0D0D0D 100%);
    border-radius: 38px;
    overflow: hidden;
    padding: 52px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .phone-balance-card {
    background: linear-gradient(135deg, #1A2600, #0D1500);
    border: 1px solid rgba(200,255,0,0.2);
    border-radius: 20px;
    padding: 18px;
  }
  .phone-balance-label { font-size: 10px; color: #666; margin-bottom: 4px; }
  .phone-balance-amount { font-size: 26px; font-weight: 800; color: #C8FF00; letter-spacing: -1px; }
  .phone-balance-sub { font-size: 9px; color: #555; margin-top: 2px; }
  .phone-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .phone-action {
    background: #1C1C1C;
    border-radius: 12px;
    padding: 10px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .phone-action-icon { font-size: 18px; }
  .phone-action-label { font-size: 8px; color: #666; }
  .phone-tx-list { display: flex; flex-direction: column; gap: 8px; }
  .phone-tx {
    background: #1C1C1C;
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .phone-tx-name { font-size: 10px; font-weight: 600; }
  .phone-tx-date { font-size: 8px; color: #555; }
  .phone-tx-amount { font-size: 11px; font-weight: 700; }
  .positive { color: #C8FF00; }
  .negative { color: #fff; }

  /* ── Features ── */
  .section { padding: 80px 0; }
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
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .section-subtitle {
    font-size: 17px;
    color: #888;
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 48px;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .feature-card {
    background: #141414;
    border: 1px solid #2A2A2A;
    border-radius: var(--radius);
    padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover { border-color: rgba(200,255,0,0.3); transform: translateY(-2px); }
  .feature-icon {
    width: 44px;
    height: 44px;
    background: rgba(200,255,0,0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 16px;
  }
  .feature-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: #888; line-height: 1.6; }

  /* ── Stats ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1px;
    background: #2A2A2A;
    border: 1px solid #2A2A2A;
    border-radius: var(--radius);
    overflow: hidden;
    margin-top: 64px;
  }
  .stat {
    background: #141414;
    padding: 32px 28px;
  }
  .stat-value {
    font-size: 36px;
    font-weight: 900;
    color: #C8FF00;
    letter-spacing: -1px;
    line-height: 1;
    margin-bottom: 6px;
  }
  .stat-label { font-size: 13px; color: #888; }

  /* ── CTA ── */
  .cta-section {
    padding: 80px 0;
    text-align: center;
  }
  .cta-card {
    background: linear-gradient(135deg, #1A1A1A 0%, #111 100%);
    border: 1px solid #2A2A2A;
    border-radius: 24px;
    padding: 64px 40px;
    position: relative;
    overflow: hidden;
  }
  .cta-card::before {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%);
  }
  .cta-card h2 {
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 900;
    letter-spacing: -1px;
    margin-bottom: 16px;
  }
  .cta-card p { font-size: 16px; color: #888; margin-bottom: 32px; max-width: 480px; margin-left: auto; margin-right: auto; }
  .store-badges {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .store-badge {
    background: #1C1C1C;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 12px 22px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    transition: border-color 0.2s;
  }
  .store-badge:hover { border-color: #C8FF00; text-decoration: none; }
  .store-badge-icon { font-size: 22px; }

  @media (max-width: 768px) {
    .hero { padding: 64px 0 48px; }
    .phone-mockup { width: 240px; height: 480px; }
    .phone-screen { width: 210px; height: 445px; }
  }
</style>

<main>
  <!-- ── Hero ── -->
  <section class="hero">
    <div class="container">
      <div class="hero-badge">&#10024; Next-gen finance</div>
      <h1>Banking that moves<br />at the speed of <span class="accent">life</span></h1>
      <p>Send money instantly, top up airtime, pay bills, and manage virtual cards — all from one beautifully designed app.</p>
      <div class="hero-actions" id="download">
        <a class="btn-primary" href="#">Download for iOS</a>
        <a class="btn-secondary" href="#">Download for Android</a>
      </div>

      <!-- Phone mockup -->
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-balance-card">
            <div class="phone-balance-label">Total Balance</div>
            <div class="phone-balance-amount">$12,450.00</div>
            <div class="phone-balance-sub">+2.4% this month</div>
          </div>
          <div class="phone-actions">
            <div class="phone-action"><div class="phone-action-icon">↑</div><div class="phone-action-label">Send</div></div>
            <div class="phone-action"><div class="phone-action-icon">↓</div><div class="phone-action-label">Receive</div></div>
            <div class="phone-action"><div class="phone-action-icon">📱</div><div class="phone-action-label">Top Up</div></div>
            <div class="phone-action"><div class="phone-action-icon">💳</div><div class="phone-action-label">Cards</div></div>
          </div>
          <div class="phone-tx-list">
            <div class="phone-tx">
              <div><div class="phone-tx-name">Alex Johnson</div><div class="phone-tx-date">Today, 9:41 AM</div></div>
              <div class="phone-tx-amount positive">+$250.00</div>
            </div>
            <div class="phone-tx">
              <div><div class="phone-tx-name">Netflix</div><div class="phone-tx-date">Yesterday</div></div>
              <div class="phone-tx-amount negative">-$15.99</div>
            </div>
            <div class="phone-tx">
              <div><div class="phone-tx-name">MTN Airtime</div><div class="phone-tx-date">Dec 10</div></div>
              <div class="phone-tx-amount negative">-$5.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Features ── -->
  <section class="section">
    <div class="container">
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
        <div class="stat"><div class="stat-value">1M+</div><div class="stat-label">Active users</div></div>
        <div class="stat"><div class="stat-value">$2B+</div><div class="stat-label">Processed monthly</div></div>
        <div class="stat"><div class="stat-value">150+</div><div class="stat-label">Countries supported</div></div>
        <div class="stat"><div class="stat-value">99.9%</div><div class="stat-label">Uptime SLA</div></div>
      </div>
    </div>
  </section>

  <!-- ── CTA ── -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-card">
        <h2>Ready to take control<br />of your finances?</h2>
        <p>Download PayVora today and join over a million people managing their money the modern way.</p>
        <div class="store-badges">
          <a class="store-badge" href="#">
            <span class="store-badge-icon">🍎</span>
            <div><div style="font-size:10px;color:#888;font-weight:500;">Download on the</div>App Store</div>
          </a>
          <a class="store-badge" href="#">
            <span class="store-badge-icon">▶</span>
            <div><div style="font-size:10px;color:#888;font-weight:500;">Get it on</div>Google Play</div>
          </a>
        </div>
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
    border-bottom: 1px solid #2A2A2A;
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
    border-left: 2px solid #2A2A2A;
    padding-left: 12px;
    transition: color 0.2s, border-color 0.2s;
  }
  .legal-toc a:hover { color: #C8FF00; border-color: #C8FF00; text-decoration: none; }
  .legal-content h2 {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-top: 48px;
    margin-bottom: 16px;
    padding-top: 48px;
    border-top: 1px solid #2A2A2A;
    scroll-margin-top: 80px;
  }
  .legal-content h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
  .legal-content h3 { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 10px; color: #C8FF00; }
  .legal-content p { font-size: 15px; color: #CCCCCC; line-height: 1.75; margin-bottom: 14px; }
  .legal-content ul, .legal-content ol { padding-left: 20px; margin-bottom: 14px; }
  .legal-content li { font-size: 15px; color: #CCCCCC; line-height: 1.75; margin-bottom: 6px; }
  .legal-content strong { color: #fff; font-weight: 600; }
  .legal-content a { color: #C8FF00; }
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
    border-bottom: 1px solid #2A2A2A;
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
    border-left: 2px solid #2A2A2A;
    padding-left: 12px;
    transition: color 0.2s, border-color 0.2s;
  }
  .legal-toc a:hover { color: #C8FF00; border-color: #C8FF00; text-decoration: none; }
  .legal-content h2 {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-top: 48px;
    margin-bottom: 16px;
    padding-top: 48px;
    border-top: 1px solid #2A2A2A;
    scroll-margin-top: 80px;
  }
  .legal-content h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
  .legal-content h3 { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 10px; color: #C8FF00; }
  .legal-content p { font-size: 15px; color: #CCCCCC; line-height: 1.75; margin-bottom: 14px; }
  .legal-content ul, .legal-content ol { padding-left: 20px; margin-bottom: 14px; }
  .legal-content li { font-size: 15px; color: #CCCCCC; line-height: 1.75; margin-bottom: 6px; }
  .legal-content strong { color: #fff; font-weight: 600; }
  .legal-content a { color: #C8FF00; }
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
        <p>By downloading, installing, or using PayVora, you confirm that you have read, understood, and agree to be bound by these Terms and our <a href="/privacy">Privacy Policy</a>. If you do not agree to these Terms, you must not use the Service.</p>

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
  res.send(shell("Home", "PayVora — Next-generation mobile finance. Send money, top up airtime, manage virtual cards and more.", landingBody));
});

router.get("/privacy", (_req: Request, res: Response) => {
  setPageCsp(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(shell("Privacy Policy", "PayVora Privacy Policy — How we collect, use, and protect your personal information.", privacyBody));
});

router.get("/terms", (_req: Request, res: Response) => {
  setPageCsp(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(shell("Terms of Service", "PayVora Terms of Service — The rules and guidelines governing your use of PayVora.", termsBody));
});

export default router;
