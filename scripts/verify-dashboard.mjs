import { chromium } from "playwright-core";
const BASE = "http://localhost:3000";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
const token = `${b64({ alg: "none" })}.${b64({ sub: "qa", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
function session(role) {
  return { state: { user: { id: "QA", name: "QA User", email: "qa@erp.demo", role }, token, isAuthenticated: true }, version: 0 };
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = [];

for (const [label, role] of [["super-admin", "super-admin"], ["student", "student"], ["faculty", "faculty"], ["staff", "staff"]]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !/401|500/.test(m.text())) errors.push(m.text().slice(0, 150)); });
  await page.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session(role));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
  const h1 = await page.locator("h1").first().textContent().catch(() => null);
  const statCards = await page.locator("text=Total Students,Faculty Members,Courses,Hostel Occupancy,CGPA,Attendance").count().catch(() => 0);
  const gradientBanner = await page.locator("div[class*='from-[#2563EB]']").count().catch(() => 0);
  out.push({ check: `${role} dashboard renders`, actual: (h1 || "").trim(), pass: !!h1 });
  out.push({ check: `${role} has no gradient banner`, actual: gradientBanner, pass: gradientBanner === 0 });
  out.push({ check: `${role} no unexpected console errors`, actual: errors, pass: errors.length === 0 });
  await page.screenshot({ path: `.qa/screenshots/14-dashboard-${role}.png` });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
process.exit(out.some((o) => !o.pass) ? 1 : 0);