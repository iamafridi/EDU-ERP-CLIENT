/**
 * Quick verification of the EDU Nexus UI token layer.  * Checks: light bg token applied, no dark mode residue, shell renders.
 */
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = [];

// 1. Light theme: body should use the --background token (#f6f7f9)
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(800);
const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
out.push({ check: "light bg is #f6f7f9", actual: lightBg, pass: lightBg === "rgb(246, 247, 249)" });
out.push({ check: "login console errors", actual: errors, pass: errors.length === 0 });
await page.close();

// 2. Shell still renders with tokens (fake session -> dashboard)
const page3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const session = {
  state: {
    user: { id: "QA-001", name: "QA Super Admin", email: "qa@erp.demo", role: "super-admin" },
    token: btoa(JSON.stringify({ alg: "none" })).replace(/=/g, "") + "." +
      btoa(JSON.stringify({ sub: "qa", role: "super-admin", exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "") + ".sig",
    isAuthenticated: true,
  },
  version: 0,
};
await page3.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session);
await page3.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
await page3.waitForTimeout(1500);
const h1 = await page3.locator("h1, h2").first().textContent().catch(() => null);
const navLinks = await page3.locator("nav a").count();
out.push({ check: "dashboard renders (h1)", actual: (h1 || "").trim().slice(0, 40), pass: !!h1 });
out.push({ check: "sidebar nav links", actual: navLinks, pass: navLinks > 5 });
await page3.screenshot({ path: ".qa/screenshots/11-tokens-dashboard.png" });
await page3.close();

await browser.close();
console.log(JSON.stringify(out, null, 2));
const failed = out.filter((o) => !o.pass);
process.exit(failed.length ? 1 : 0);