import { chromium } from "playwright-core";
const BASE = "http://localhost:3000";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
const token = `${b64({ alg: "none" })}.${b64({ sub: "qa", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
const session = {
  state: { user: { id: "QA", name: "QA Super Admin", email: "qa@erp.demo", role: "super-admin" }, token, isAuthenticated: true },
  version: 0,
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => console.log("CONSOLE:", m.type(), m.text().slice(0, 300)));
page.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 400)));
await page.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session);
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(2500);
const overlay = await page.locator("nextjs-portal").textContent().catch(() => null);
console.log("OVERLAY TEXT:", (overlay || "").replace(/\s+/g, " ").slice(0, 600));
const overlayBtn = await page.locator("nextjs-portal button").count();
console.log("overlay buttons:", overlayBtn);
await browser.close();