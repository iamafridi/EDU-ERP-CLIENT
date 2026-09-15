/**
 * Verifies the redesigned app shell:  * - breadcrumbs, role-filtered command palette, collapsed rail
 */
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";

function fakeJwt() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64");
  return `${b64({ alg: "none" })}.${b64({ sub: "qa", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
}

async function dismissOverlay(page) {
  // Remove any stale Next.js dev overlay portal that can block pointer events.
  try {
    await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
  } catch {}
}

function session(role) {
  return {
    state: {
      user: { id: "QA-001", name: "QA Super Admin", email: "qa@erp.demo", role },
      token: fakeJwt(),
      isAuthenticated: true,
    },
    version: 0,
  };
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 150)); });

await page.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session("super-admin"));
await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);
await dismissOverlay(page);

// 1. Breadcrumb
const crumb = await page.locator("header nav[aria-label='Breadcrumb']").textContent().catch(() => null);
out.push({ check: "breadcrumb shows Overview / Dashboard", actual: (crumb || "").trim(), pass: /Overview/.test(crumb || "") && /Dashboard/.test(crumb || "") });

// 2. Sidebar expanded: sections + active state
const sidebarLinks = await page.locator("aside nav a").count();
out.push({ check: "sidebar link count (expanded)", actual: sidebarLinks, pass: sidebarLinks > 10 });

// 3. Command palette via Ctrl+K: role-filtered (super-admin sees Administration)
await page.keyboard.press("Control+k");
await page.waitForTimeout(500);
const paletteText = await page.locator("[role='dialog'][aria-label*='Command palette']").textContent().catch(() => null);
out.push({ check: "palette opens via Ctrl+K", actual: !!(paletteText || "").includes("Navigate"), pass: /Navigate/.test(paletteText || "") });
// type to filter: Administration surface is only reachable via search (progressive disclosure)
await page.keyboard.type("administ");
await page.waitForTimeout(500);
const adminFiltered = await page.locator("[role='dialog']").textContent().catch(() => "");
out.push({ check: "palette finds User Management for super-admin", actual: /User Management/.test(adminFiltered), pass: /User Management/.test(adminFiltered) });
await page.keyboard.press("Control+a");
await page.keyboard.type("fees");
await page.waitForTimeout(600);
const filteredText = await page.locator("[role='dialog']").textContent().catch(() => null);
out.push({ check: "palette filters to Fees", actual: /Fees/.test(filteredText || ""), pass: /Fees/.test(filteredText || "") && !/Attendance/.test(filteredText || "") });
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// 5. Collapse sidebar -> rail + flyout
await page.locator("button", { hasText: "Collapse" }).click();
await page.waitForTimeout(400);
const asideWidth = await page.locator("aside").first().evaluate((el) => el.getBoundingClientRect().width);
out.push({ check: "sidebar collapses to rail (~64px)", actual: asideWidth, pass: asideWidth < 100 && asideWidth > 40 });
// open a flyout (Administration section icon button)
const railButtons = await page.locator("aside button[aria-label$='menu']").count();
out.push({ check: "rail shows section flyout buttons", actual: railButtons, pass: railButtons >= 5 });
await page.locator("aside button[aria-label$='menu']").last().click();
await page.waitForTimeout(300);
const flyout = await page.locator("aside >> text=User Management").count().catch(() => 0);
out.push({ check: "flyout lists section items", actual: flyout, pass: flyout >= 1 });
await page.screenshot({ path: ".qa/screenshots/12-shell-collapsed-flyout.png" });
await page.keyboard.press("Escape");

// 6. Student role: Administration must NOT appear in sidebar or palette
await page.close();
const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page2.addInitScript((s) => sessionStorage.setItem("hostelpro-auth-store", JSON.stringify(s)), session("student"));
await page2.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
await page2.waitForTimeout(1200);
await dismissOverlay(page2);
const studentSidebar = await page2.locator("aside").textContent().catch(() => "");
out.push({ check: "student sidebar hides Administration group", actual: /Administration/.test(studentSidebar), pass: !/Administration/.test(studentSidebar) });
out.push({ check: "student sidebar still shows Settings", actual: /Settings/.test(studentSidebar), pass: /Settings/.test(studentSidebar) });
await page2.keyboard.press("Control+k");
await page2.waitForTimeout(400);
await page2.keyboard.type("administ");
await page2.waitForTimeout(500);
const studentPalette = await page2.locator("[role='dialog']").textContent().catch(() => "");
out.push({ check: "student palette hides Administration", actual: /Administration/.test(studentPalette), pass: !/Administration/.test(studentPalette) });
await page2.screenshot({ path: ".qa/screenshots/13-shell-student-dashboard.png" });
await page2.close();

const apiErrors = consoleErrors.filter((e) => !/401|500/.test(e));
out.push({ check: "no unexpected console errors", actual: apiErrors.slice(0, 3), pass: apiErrors.length === 0 });

await browser.close();
console.log(JSON.stringify(out, null, 2));
process.exit(out.some((o) => !o.pass) ? 1 : 0);