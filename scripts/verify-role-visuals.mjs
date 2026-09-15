/**
 * Role visual QA - signs in as each headline role through the REAL /auth/login
 * endpoint and captures screenshots of the surfaces a client demo will visit.
 *
 * Output: frontend/.qa/screenshots/role-demo/*.png (gitignored)
 *
 * Login is deliberately slow (BCRYPT_SALT_ROUNDS=15, ~7s) and rate limited
 * (5/min), so the script paces itself.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:3000";
const API = "http://localhost:5000/api/v1";
// fileURLToPath decodes %20 etc.; .pathname alone does not, which creates a
// stray literal "Next%20Level..." directory outside the project on Windows.
const OUT = fileURLToPath(new URL("../.qa/screenshots/role-demo/", import.meta.url));

mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROLES = [
  {
    key: "super-admin",
    label: "Super Administrator",
    email: "arcraain@gmail.com",
    stops: [
      { path: "/", name: "01-dashboard" },
      { path: "/users", name: "02-user-management" },
      { path: "/audit-log", name: "03-audit-trail" },
      { path: "/students", name: "04-student-directory" },
    ],
  },
  {
    key: "domain-admin",
    label: "Domain Administrator",
    email: "faculty.admin@college.edu",
    stops: [
      { path: "/", name: "05-dashboard" },
      { path: "/students", name: "06-student-directory" },
      { path: "/admissions", name: "07-admissions" },
    ],
  },
  {
    key: "faculty",
    label: "Faculty Member",
    email: "j.sterling@college.edu",
    stops: [
      { path: "/", name: "08-dashboard" },
      { path: "/attendance", name: "09-attendance" },
      { path: "/exams", name: "10-exams-grades" },
    ],
  },
  {
    key: "student",
    label: "Student",
    email: "demo.student@erp.demo",
    stops: [
      { path: "/", name: "11-dashboard" },
      { path: "/timetable", name: "12-timetable" },
      { path: "/fees", name: "13-fees" },
    ],
  },
  {
    key: "staff",
    label: "Staff Doctor",
    email: "priya.v@college.edu",
    stops: [
      { path: "/", name: "14-dashboard" },
      { path: "/opd", name: "15-opd" },
      { path: "/laboratory", name: "16-laboratory" },
    ],
  },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const summary = [];

for (const role of ROLES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
  });

  console.log(`\n=== ${role.label} (${role.email}) ===`);

  // Real login through the UI so the flow matches what the client will see.
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));

  await page.locator("#login-role").selectOption(role.key);
  await page.locator("#login-email").fill(role.email);
  await page.locator("#login-password").fill("Demo@123");
  await page.getByRole("button", { name: /Sign in to EDU-ERP/i }).click();

  // ~7s bcrypt + redirect; wait for the dashboard shell to appear.
  try {
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 });
    await page.waitForSelector("aside", { timeout: 20000 });
    console.log("login ok ->", page.url());
  } catch {
    const errText = await page.locator("body").innerText().catch(() => "");
    console.log("LOGIN FAILED:", errText.slice(0, 200));
    summary.push({ role: role.label, ok: false, note: "login failed" });
    await context.close();
    continue;
  }

  for (const stop of role.stops) {
    await page.goto(`${BASE}${stop.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3500); // let queries resolve
    await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
    await page.screenshot({ path: `${OUT}${stop.name}.png`, fullPage: false });
    console.log(`  captured ${stop.name}.png`);
  }

  // Mobile pass on the dashboard for the responsive story.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
  await page.screenshot({ path: `${OUT}${role.key}-mobile-dashboard.png` });
  console.log(`  captured ${role.key}-mobile-dashboard.png`);

  const unexpected = consoleErrors.filter((e) => !/401|403|500|502|Failed to load resource/i.test(e));
  summary.push({ role: role.label, ok: true, stops: role.stops.length + 1, unexpectedErrors: unexpected.length });
  if (unexpected.length) console.log("  unexpected console errors:", unexpected.slice(0, 3));

  await context.close();
  await sleep(13000); // stay under the 5 logins/min limiter
}

await browser.close();

console.log("\n=== SUMMARY ===");
for (const s of summary) console.log(`${s.ok ? "OK  " : "FAIL"} ${s.role} - ${s.stops ?? 0} shots, ${s.unexpectedErrors ?? "-"} unexpected console errors`);
console.log(`\nScreenshots in: ${OUT}`);
