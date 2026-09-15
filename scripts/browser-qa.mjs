/**
 * Browser QA script (Playwright core + system Chrome).
 * Captures console errors, failed requests, DOM facts and screenshots
 * for the routes we are redesigning. Run: node scripts/browser-qa.mjs
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = ".qa/screenshots";
mkdirSync(OUT, { recursive: true });

// Craft a fake JWT that passes AuthGuard's isTokenExpired (exp in the future).
function fakeJwt(role) {
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64");
  const header = b64({ alg: "none", typ: "JWT" });
  const payload = b64({ sub: "qa", role, exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${header}.${payload}.fakesig`;
}

function sessionState(role) {
  return {
    state: {
      user: {
        id: "QA-001",
        name: role === "super-admin" ? "QA Super Admin" : "QA Student",
        email: "qa@erp.demo",
        role,
      },
      token: fakeJwt(role),
      isAuthenticated: true,
    },
    version: 0,
  };
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

const results = [];

async function probe(label, url, opts = {}) {
  const { viewport = { width: 1440, height: 900 }, injectSession = null, waitFor = "networkidle", skipScreenshot = false } = opts;
  const page = await browser.newPage({ viewport });
  const errors = [];
  const failed = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 300)));
  page.on("requestfailed", (r) => failed.push(`${r.method()} ${r.url().slice(0, 120)} -> ${r.failure()?.errorText}`));

  if (injectSession) {
    await page.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), sessionState(injectSession));
  }

  let status = "ok";
  try {
    const resp = await page.goto(url, { waitUntil: waitFor, timeout: 45000 });
    await page.waitForTimeout(1200);
    if (!skipScreenshot) {
      await page.screenshot({ path: `${OUT}/${label}.png` });
    }
    const title = await page.title();
    const h1 = await page.locator("h1, h2").first().textContent().catch(() => null);
    results.push({ label, url, http: resp?.status(), title, h1: (h1 || "").trim().slice(0, 60), consoleErrors: errors.slice(0, 6), failedReqs: failed.slice(0, 6) });
  } catch (e) {
    results.push({ label, url, error: String(e).slice(0, 200), consoleErrors: errors.slice(0, 6), failedReqs: failed.slice(0, 6) });
  }
  await page.close();
}

await probe("01-login-desktop", `${BASE}/login`);
await probe("02-login-mobile", `${BASE}/login`, { viewport: { width: 390, height: 844 } });
await probe("03-dashboard-superadmin", `${BASE}/`, { injectSession: "super-admin" });
await probe("04-dashboard-student", `${BASE}/`, { injectSession: "student" });
await probe("05-dashboard-mobile", `${BASE}/`, { injectSession: "super-admin", viewport: { width: 390, height: 844 } });
await probe("06-students", `${BASE}/students`, { injectSession: "super-admin" });
await probe("07-students-mobile", `${BASE}/students`, { injectSession: "super-admin", viewport: { width: 390, height: 844 } });
await probe("08-attendance", `${BASE}/attendance`, { injectSession: "super-admin" });
await probe("09-fees", `${BASE}/fees`, { injectSession: "super-admin" });
await probe("10-command-palette-open", `${BASE}/`, { injectSession: "super-admin" });

await browser.close();
console.log(JSON.stringify(results, null, 2));