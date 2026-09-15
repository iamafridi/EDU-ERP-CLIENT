import { chromium } from "playwright-core";
const BASE = "http://localhost:3000";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
const token = `${b64({ alg: "none" })}.${b64({ sub: "qa", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
function session(role) {
  return { state: { user: { id: "QA", name: "QA Student", email: "qa@erp.demo", role }, token, isAuthenticated: true }, version: 0 };
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session("student"));
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
const asideCount = await page.locator("aside").count();
const asideText = await page.locator("aside").textContent().catch(() => "");
const layoutStore = await page.evaluate(() => localStorage.getItem("hostelpro-layout-store"));
const railState = await page.evaluate(() => {
  const el = document.querySelector("aside");
  return el ? getComputedStyle(el).width : null;
});
const allButtons = await page.locator("aside button").allTextContents().catch(() => []);
console.log(JSON.stringify({ asideCount, asideText: (asideText || "").replace(/\s+/g, " ").slice(0, 400), layoutStore, railState, buttons: allButtons.slice(0, 12) }, null, 2));
await browser.close();