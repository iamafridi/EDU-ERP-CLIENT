/**
 * Verifies the five-account client demo end to end.
 *
 *  1. API login matrix - each showcase account signs in with the right role, name and isDemo flag
 *  2. View-only enforcement - a write attempt with a demo token is rejected (403)
 *  3. Wrong-role rejection - role is part of the credential
 *  4. /demo guide renders the five accounts with screen inventories
 *  5. Login demo panel shows exactly 5 accounts (no "show all" expander)
 *  6. Header switcher lists exactly 5 accounts and really switches
 *
 * Login is deliberately slow (BCRYPT_SALT_ROUNDS=15, ~7s) and rate limited
 * (5/min) - the script paces itself.
 */
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const API = "http://localhost:5000/api/v1";
const PASSWORD = "Demo@123";

// Mirrors src/config/demoAccounts.ts (the showcase five).
const ACCOUNTS = [
  { email: "super.admin@college.edu", role: "super-admin", name: "System Administrator" },
  { email: "faculty.admin@college.edu", role: "domain-admin", name: "Rajesh Khanna" },
  { email: "finance.admin@college.edu", role: "domain-admin", name: "Meera Desai" },
  { email: "j.sterling@college.edu", role: "faculty", name: "James Sterling" },
  { email: "demo.student@erp.demo", role: "student", name: "Demo Student" },
];

const results = [];
const record = (check, actual, pass) => results.push({ check, actual, pass });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

/* ------------------------------------------------------- 1. login matrix */
console.log("=== API login matrix ===");
for (const acct of ACCOUNTS) {
  try {
    const { status, body } = await tryLogin(acct.email, acct.role);
    const profile = body?.data?.profile;
    const ok =
      status === 200 &&
      profile?.role === acct.role &&
      profile?.name === acct.name &&
      profile?.isDemo === true;
    record(
      `login ${acct.role} <${acct.email}> (isDemo, name)`,
      `${status} role=${profile?.role ?? "-"} name=${profile?.name ?? "-"} isDemo=${profile?.isDemo}`,
      ok,
    );
  } catch (err) {
    record(`login ${acct.role} <${acct.email}>`, `error: ${err.message}`, false);
  }
  await sleep(13000);
}

/* --------------------------------------------- 2. view-only enforcement */
console.log("=== view-only enforcement ===");
try {
  const { body } = await tryLogin("demo.student@erp.demo", "student");
  const token = body?.data?.token;
  if (!token) {
    record("write attempt blocked for demo account", "no token", false);
  } else {
    // /grievances/submit is a real POST route any role can reach; the demoGuard
    // sits on the module router, so it fires before validation/controller.
    const write = await fetch(`${API}/grievances/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "demo write attempt" }),
    });
    const writeBody = await write.json().catch(() => ({}));
    record(
      "write attempt blocked for demo account (403)",
      `${write.status} ${writeBody?.message ?? ""}`.slice(0, 90),
      write.status === 403 && /view-only/i.test(writeBody?.message ?? ""),
    );
  }
} catch (err) {
  record("write attempt blocked for demo account", `error: ${err.message}`, false);
}

/* ------------------------------------------------- 3. wrong-role rejection */
console.log("=== wrong-role rejection ===");
try {
  const { status, body } = await tryLogin("super.admin@college.edu", "student");
  record(
    "wrong role is rejected (super-admin email as student)",
    `${status} ${body?.message ?? ""}`.slice(0, 80),
    status === 401 || status === 403,
  );
} catch (err) {
  record("wrong role is rejected", `error: ${err.message}`, false);
}

/* ------------------------------------------------------------ 4, 5, 6 UI */
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

// --- 4. /demo guide -------------------------------------------------------
console.log("=== /demo guide ===");
await page.goto(`${BASE}/demo`, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1200);
await dismissOverlay();

const demoText = await page.locator("body").innerText();
record(
  "/demo lists exactly the five showcase emails",
  ACCOUNTS.filter((a) => demoText.includes(a.email)).length + "/5",
  ACCOUNTS.every((a) => demoText.includes(a.email)),
);
record(
  "/demo does not advertise hidden accounts",
  /priya\.v|anita\.n|sarita\.y|manoj\.s|dinesh\.k|marcus\.c|arcraain/.test(demoText) ? "leaked" : "hidden",
  !/priya\.v|anita\.n|sarita\.y|manoj\.s|dinesh\.k|marcus\.c|arcraain/.test(demoText),
);
record("/demo shows screen inventory", /Screen lists below|Super Administrator/i.test(demoText) && /User Management/.test(demoText), /User Management/.test(demoText));
record("/demo flags view-only", /view-only/i.test(demoText), /view-only/i.test(demoText));
record("/demo shows walkthrough", /Suggested walkthrough/.test(demoText), /Suggested walkthrough/.test(demoText));

// --- 5. login demo dropdown ----------------------------------------------
console.log("=== login demo dropdown ===");
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1000);
await dismissOverlay();

const bodyText = await page.locator("body").innerText();
record(
  "login page hides non-showcase accounts while collapsed",
  /priya\.v|anita\.n|marcus\.c|arcraain/.test(bodyText) ? "leaked" : "hidden",
  !/priya\.v|anita\.n|marcus\.c|arcraain/.test(bodyText),
);

const demoTrigger = page.getByRole("button", { name: /Demo accounts \(\d+\)/i });
record(
  "login page shows the demo accounts dropdown",
  `${await demoTrigger.count()}`,
  (await demoTrigger.count()) === 1,
);

await demoTrigger.click();
await page.waitForTimeout(600);

const dropdown = page.locator("[role='dialog'][aria-label='Demo accounts']");
const useButtons = dropdown.locator("button").filter({ hasText: /@/ });
const panelCount = await useButtons.count();
record("dropdown lists exactly 5 accounts", `${panelCount}`, panelCount === 5);

const dropdownText = await page.locator("body").innerText();
record(
  "dropdown has no 'show all' expander",
  /Show all \d+ demo accounts/.test(dropdownText) ? "expander present" : "none",
  !/Show all \d+ demo accounts/.test(dropdownText),
);
record(
  "dropdown hides non-showcase accounts",
  /priya\.v|anita\.n|marcus\.c|arcraain/.test(dropdownText) ? "leaked" : "hidden",
  !/priya\.v|anita\.n|marcus\.c|arcraain/.test(dropdownText),
);

// First row = Super Administrator: fills the form and closes the dropdown.
await useButtons.first().click();
await page.waitForTimeout(400);
const filledEmail = await page.locator("#login-email").inputValue();
const filledRole = await page.locator("#login-role").inputValue();
record(
  "clicking an account fills email + role",
  `email=${filledEmail} role=${filledRole}`,
  filledEmail === "super.admin@college.edu" && filledRole === "super-admin",
);
record(
  "dropdown closes after picking an account",
  `${await dropdown.count()}`,
  (await dropdown.count()) === 0,
);

// --- 6. header switcher --------------------------------------------------
console.log("=== header role switcher ===");
// Fresh context keeps this independent of the login-page state above; the wait
// also lets the login rate-limit window reset before the switcher logs in.
await sleep(62000);

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
  const panel = switchPage.locator("[role='dialog'][aria-label='Demo role switcher']");
  const panelText = await panel.innerText().catch(() => "");
  record("switcher panel opens", panelText.replace(/\s+/g, " ").slice(0, 40), /Switch demo role/.test(panelText));

  const accountButtons = panel.locator("button").filter({ hasText: /@/ });
  record("switcher lists exactly 5 accounts", `${await accountButtons.count()}`, (await accountButtons.count()) === 5);

  const hiddenInSwitcher = await panel.innerText();
  record(
    "switcher hides non-showcase accounts",
    /priya\.v|anita\.n|marcus\.c|arcraain/.test(hiddenInSwitcher) ? "leaked" : "hidden",
    !/priya\.v|anita\.n|marcus\.c|arcraain/.test(hiddenInSwitcher),
  );

  const target = panel.locator("button").filter({ hasText: "faculty.admin@college.edu" }).first();
  if ((await target.count()) > 0) {
    await target.click();
    // ~7s bcrypt login; allow generous headroom.
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
