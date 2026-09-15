# AGENT-TOOLS.md - Skills & QA tooling

> Living notes. Last updated: 2026-09-08

## Installed skills (community, via `npx skills add`, user-approved 2026-09-08)

| Skill | Source | Status | Use |
|---|---|---|---|
| `design-taste-frontend` | Leonxlnx/taste-skill | Installed to `.agents/skills/` | Design character: anti-generic rules, consistency locks, pre-flight checklist (dials set per master prompt: 5.5/4/7) |
| `web-design-guidelines` | vercel-labs/agent-skills | Installed to `.agents/skills/` | `file:line` compliance audit; fetch latest rules from vercel-labs/web-interface-guidelines before each review |

## Substitutions (master prompt §108 fallback policy)

| Requested | Actual | Reason |
|---|---|---|
| `vercel-labs/find-skills` skill | `npx skills find <query>` CLI | The find-skills repo does not exist / requires auth; the CLI performs the same discovery. Not installed. |
| Playwright MCP | Playwright CLI via terminal | No MCP runtime in this environment; Chrome is installed, Playwright drives a real browser for screenshots/console/navigation QA. |
| Chrome DevTools MCP | Playwright CLI + `page.on('console'/'requestfailed')` | Same capability, different driver. |
| Context7 MCP | Official docs via `web_search`/`read_url` | No MCP runtime; official documentation consulted as needed. |
| GitHub MCP | Not used | Push/pull out of scope per operator (two separate repos, local work only). |

## Design references

- `VoltAgent/awesome-design-md` clone: skipped for now (out of scope of current phase); design direction synthesized from master prompt + taste-skill instead. Can be added in a later phase if needed for specific archetypes.

## Browser QA setup (in use)

- `playwright-core` devDependency (added) driving the system Chrome via `channel: 'chrome'` - no browser download needed.
- Scripts in `frontend/scripts/`:
  - `browser-qa.mjs` - baseline screenshots + console/failed-request capture across 10 views.
  - `verify-tokens.mjs` - light token application + shell render checks.
  - `verify-shell.mjs` - breadcrumbs, role-filtered palette, collapsed rail + flyouts, student role isolation.
  - `verify-dashboard.mjs` - dashboard renders per role, no gradient banners, no console errors (12 checks).
  - `diag-overlay.mjs` / `diag-sidebar.mjs` - one-off diagnostics.
- Screenshots land in `.qa/screenshots/` (gitignored). Dev-server overlay portals are removed in scripts (Next dev overlay can intercept pointer events).
- Notes: auth pages render standalone; dashboard routes are probed with an injected session (AuthGuard only checks token presence/expiry; API calls then fall back to mocks - exactly the redesigned surface).
- Optional later: `@axe-core/playwright` for automated a11y on representative routes.

## Commands cheat sheet

```bash
cd frontend
npm run dev        # dev server
npm run lint       # eslint
npm test           # jest
npm run build      # production build (quality gate)
npx skills find "accessibility testing"   # skill discovery
```