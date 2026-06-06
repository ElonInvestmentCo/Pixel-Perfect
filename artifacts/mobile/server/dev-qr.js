/**
 * Dev QR page server.
 *
 * Serves the landing-page.html template on port 18115 so the Replit preview
 * pane shows a proper, scannable QR code for Expo Go, instead of the raw
 * Metro web bundle (which has CORS issues in the iframe).
 *
 * Uses the same template as the production serve.js so the page looks good.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const TEMPLATE_PATH = path.resolve(__dirname, "templates", "landing-page.html");

function getAppName() {
  try {
    const appJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "app.json"), "utf-8"),
    );
    return appJson.expo?.name || "QPay";
  } catch {
    return "QPay";
  }
}

const expoDomain =
  process.env.REPLIT_EXPO_DEV_DOMAIN || process.env.REPLIT_DEV_DOMAIN || "";

const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const appName = getAppName();

const html = template
  .replace(/APP_NAME_PLACEHOLDER/g, appName)
  .replace(/BASE_URL_PLACEHOLDER/g, `https://${expoDomain}`)
  .replace(/EXPS_URL_PLACEHOLDER/g, expoDomain);

const port = parseInt(process.env.PORT || "18115", 10);

const server = http.createServer((req, res) => {
  if (req.url === "/status" || req.url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-cache",
  });
  res.end(html);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`QPay dev QR page → http://localhost:${port}`);
  console.log(`Expo Go URL: exps://${expoDomain}`);
});
