import { chromium } from "playwright-core";
const BASE = "http://localhost:3000";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
const token = `${b64({ alg: "none" })}.${b64({ sub: "qa", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
const session = {
  state: { user: { id: "QA", name: "QA Super Admin", email: "qa@erp.demo", role: "super-admin" }, token, isAuthenticated: true },
  version: 0,
};

const ROUTES = [
  "/students", "/faculties", "/users", "/departments", "/semesters",
  "/attendance", "/admissions", "/alumni", "/accreditation", "/courses",
  "/grades", "/exams", "/rooms", "/mess", "/library", "/leave",
  "/research", "/parents", "/payroll", "/skill-lab", "/scholarships", "/transport",
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = [];

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/401|500|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200));
  });
  try {
    await page.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session);
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1800);
    await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
    const h1 = await page.locator("h1").first().textContent().catch(() => null);
    const tableCount = await page.locator("table").count();
    const hasToolbar = await page.locator("table").first().locator("xpath=ancestor::div[1]").evaluate(() => true).catch(() => false);
    out.push({ route, h1: (h1 || "").trim().slice(0, 40), tables: tableCount, pageErrors: errors.slice(0, 3), pass: errors.length === 0 && !!h1 });
  } catch (e) {
    out.push({ route, pass: false, error: String(e).slice(0, 150) });
  }
  await page.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
process.exit(out.some((o) => !o.pass) ? 1 : 0);