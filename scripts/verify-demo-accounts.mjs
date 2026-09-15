/**
 * Verifies the role-demo feature end to end.
 *
 *  1. API login matrix - every demo account signs in and returns the expected role
 *  2. Negative check - a mismatched role is rejected (proves role is part of the credential)
 *  3. /demo guide page renders every account
 *  4. Login demo panel lists roles and fills the form
 *  5. Header role switcher really switches the signed-in account
 */
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const API = "http://localhost:5000/api/v1";

// Mirrors src/config/demoAccounts.ts
const ACCOUNTS = [
  { email: "arcraain@gmail.com", role: "super-admin", access: "full", name: "Primary Administrator" },
  { email: "faculty.admin@college.edu", role: "domain-admin", access: "full", name: "Rajesh Khanna" },
  { email: "finance.admin@college.edu", role: "domain-admin", access: "full", name: "Meera Desai" },
  { email: "medical.admin@college.edu", role: "domain-admin", access: "full", name: "Arun Patel" },
  { email: "staff.admin@college.edu", role: "domain-admin", access: "full", name: "Sunita Sharma" },
  { email: "super.admin@college.edu", role: "super-admin", access: "full", name: "System Administrator" },
  { email: "j.sterling@college.edu", role: "faculty", access: "full", name: "James Sterling" },
  { email: "demo.student@erp.demo", role: "student", access: "read-only", name: "Demo Student" },
  { email: "marcus.c@college.edu", role: "student", access: "full", name: "Marcus Chen" },
  { email: "priya.v@college.edu", role: "staff", access: "full", name: "Priya Verma" },
  { email: "anita.n@college.edu", role: "staff", access: "full", name: "Anita Nair" },
  { email: "sarita.y@college.edu", role: "staff", access: "full", name: "Sarita Yadav" },
  { email: "manoj.s@college.edu", role: "staff", access: "full", name: "Manoj Singh" },
  { email: "dinesh.k@college.edu", role: "staff", access: "full", name: "Dinesh Kumar" },
];

const PASSWORD = "Demo@123";
const results = [];
const record = (check, actual, pass) => results.push({ check, actual, pass });

function fakeJwt() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
  return `${b64({ alg: "none" })}.${b64({ sub: "qa", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
}

function session(role, name = "QA Super Admin", email = "qa@erp.demo") {
  return {
    state: { user: { id: "QA-001", name, email, role }, token: fakeJwt(), isAuthenticated: true },
    version: 0,
  };
}

/* ------------------------------------------------------------------ 1 + 2 */
// The login route is rate limited to 5 requests/minute, so space the attempts
// out and back off whenever a 429 comes back.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryLogin(email, role) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: PASSWORD, role }),
    });
    if (res.status !== 429) {
      const body = await res.json().catch(() => ({}));
      return { status: res.status, body };
    }
    await sleep(16000);
  }
  return { status: 429, body: {} };
}

console.log("=== API login matrix ===");
for (const acct of ACCOUNTS) {
  let ok = false;
  let actual = "";
  try {
    const { status, body } = await tryLogin(acct.email, acct.role);
    const profile = body?.data?.profile;
    const nameOk = profile?.name === acct.name;
    ok = status === 200 && profile?.role === acct.role && nameOk;
    actual = `${status} role=${profile?.role ?? "-"} name=${profile?.name ?? "-"}${nameOk ? "" : ` (expected ${acct.name})`} isDemo=${profile?.isDemo} msg=${body?.message ?? ""}`.slice(0, 130);
  } catch (err) {
    actual = `error: ${err.message}`;
  }
  record(`login ${acct.role} <${acct.email}>`, actual, ok);
  await sleep(13000);
}

// Negative: correct email, wrong role must be rejected.
try {
  const { status, body } = await tryLogin("arcraain@gmail.com", "student");
  record(
    "wrong role is rejected (super-admin email as student)",
    `${status} ${body?.message ?? ""}`.slice(0, 80),
    status === 401 || status === 403,
  );
} catch (err) {
  record("wrong role is rejected", `error: ${err.message}`, false);
}

/* --------------------------------------------------------------- 3, 4, 5 */
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
});

const dismissOverlay = async () => {
  try {
    await page.evaluate(() =>
      document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()),
    );
  } catch {}
};

// --- 3. /demo guide -------------------------------------------------------
console.log("=== /demo guide ===");
await page.goto(`${BASE}/demo`, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1200);
await dismissOverlay();

const demoText = await page.locator("body").innerText();
const missing = ACCOUNTS.filter((a) => !demoText.includes(a.email));
record("/demo lists every demo account", `${ACCOUNTS.length - missing.length}/${ACCOUNTS.length}`, missing.length === 0);
if (missing.length) record("/demo missing emails", missing.map((m) => m.email).join(", "), false);
record("/demo shows title", /EDU-ERP Demo Guide/.test(demoText), /EDU-ERP Demo Guide/.test(demoText));
record("/demo shows enabled badge", /Demo UI enabled/.test(demoText), /Demo UI enabled/.test(demoText));
record("/demo shows walkthrough", /Suggested walkthrough/.test(demoText), /Suggested walkthrough/.test(demoText));

// --- 4. Login demo panel -------------------------------------------------
console.log("=== login demo panel ===");
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1000);
await dismissOverlay();

await page.getByRole("button", { name: /Demo credentials/i }).click();
await page.waitForTimeout(600);

const useButtons = page.getByRole("button", { name: /Use this account/i });
const primaryCount = await useButtons.count();
record("login panel shows 5 headline roles", `${primaryCount}`, primaryCount === 5);

const loginPanelText = await page.locator("body").innerText();
record("login panel offers to show all accounts", /Show all 14 demo accounts/.test(loginPanelText), /Show all 14 demo accounts/.test(loginPanelText));

// Click "Use this account" for the super admin (first card) and confirm the form is filled.
await useButtons.first().click();
await page.waitForTimeout(400);
const filledEmail = await page.locator("#login-email").inputValue();
const filledRole = await page.locator("#login-role").inputValue();
record(
  "clicking an account fills email + role",
  `email=${filledEmail} role=${filledRole}`,
  filledEmail === "arcraain@gmail.com" && filledRole === "super-admin",
);

// Expand to all accounts.
await page.getByRole("button", { name: /Show all 14 demo accounts/i }).click();
await page.waitForTimeout(400);
record("show all reveals 14 accounts", `${await useButtons.count()}`, (await useButtons.count()) === 14);

// --- 5. Header switcher --------------------------------------------------
console.log("=== header role switcher ===");
// The switcher signs in through the same rate-limited endpoint (5/min) that the
// matrix above just exercised, so let that window reset before testing it.
await sleep(62000);

// A fresh context + injected session keeps this section independent of the
// login-page state exercised above.
const switchContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const switchPage = await switchContext.newPage();
switchPage.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
});
await switchPage.addInitScript(
  (s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)),
  session("super-admin"),
);
await switchPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
await switchPage.waitForTimeout(3000);
await switchPage
  .evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()))
  .catch(() => {});

const switcher = switchPage.locator("button[title='Demo role switcher']");
const switcherCount = await switcher.count();
record("header shows the demo switcher", `${switcherCount}`, switcherCount === 1);

if (switcherCount === 1) {
  await switcher.click();
  await switchPage.waitForTimeout(600);
  const panelText = await switchPage
    .locator("[role='dialog'][aria-label='Demo role switcher']")
    .innerText()
    .catch(() => "");
  record("switcher panel opens", panelText.replace(/\s+/g, " ").slice(0, 40), /Switch demo role/.test(panelText));

  // Switch to the domain admin (a headline account) and confirm the signed-in user changes.
  const target = switchPage
    .locator("[role='dialog'][aria-label='Demo role switcher'] button")
    .filter({ hasText: "faculty.admin@college.edu" })
    .first();
  if ((await target.count()) > 0) {
    await target.click();
    // Login is deliberately slow here (BCRYPT_SALT_ROUNDS=15 => ~7s per login),
    // so allow generous headroom before asserting the switch completed.
    await switchPage.waitForTimeout(22000);
    await switchPage
      .evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()))
      .catch(() => {});
    const headerText = await switchPage.locator("header").innerText().catch(() => "");
    record(
      "switching signs in as the domain admin",
      headerText.replace(/\s+/g, " ").slice(0, 80),
      /Rajesh Khanna/.test(headerText),
    );
  } else {
    record("switcher lists the domain admin", "not found", false);
  }
}
await switchContext.close();

// --- console noise --------------------------------------------------------
const unexpected = consoleErrors.filter((e) => !/401|403|500|502|Failed to load resource/i.test(e));
record("no unexpected console errors", `${unexpected.length}`, unexpected.length === 0);
if (unexpected.length) console.log("console errors:", unexpected);

await browser.close();

/* ------------------------------------------------------------- reporting */
const failed = results.filter((r) => !r.pass);
console.log("\n=== RESULTS ===");
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.check}  [${r.actual}]`);
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
