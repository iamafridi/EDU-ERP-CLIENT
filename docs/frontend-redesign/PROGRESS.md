# PROGRESS.md - Frontend Redesign Log

> Living notes. Last updated: 2026-09-08

## Current state

- Stack verified and preserved: Next 16.2.9, React 19.2.4, TS 5, Tailwind 4, Zustand 5, TanStack Query 5, Firebase 11, RHF + Zod 4, Recharts, Framer Motion, GSAP, jsPDF, Lucide, XLSX, Socket.io, Jest+RTL.
- 83 routes; 17 shared components; 81 pages carry inline UI (monoliths up to 964 lines).
- Baseline: lint 835 problems (pre-existing), tests 4/4 pass (matchMedia polyfill added to test setup), build passes.
- Skills installed: design-taste-frontend, web-design-guidelines.

## Top problems (ranked)

1. No design tokens - hardcoded hexes across every page (two token systems fighting).
2. No shared page primitives (PageHeader, Button, Input, Badge, Dialog) - pages hand-roll everything.
3. DataTable lacks sorting/selection/loading/error/responsive patterns.
4. Dashboard = gradient banners + 4 equal KPI cards + hardcoded mock numbers per role.
5. CommandPalette leaks full route surface to all roles; nav config duplicated in 2 places.
6. No dark mode; no consistent empty/error/loading states; mobile tables are scroll-only.
7. Icon-only controls missing accessible names in spots.

## Design direction

**EDU Nexus UI**: "Institutional Grid + Clinical Signal". Calm cool-ink neutrals, single clinical-blue accent, semantic status colors, Inter + tabular numerals, 4px spacing, disciplined radii (6/10/14/18), borders-first elevation, motion 4/10, light-only (dark mode removed by product decision).

## Chosen archetypes

A Directory, B Operational Table, C Form/Workflow, D Analytics, E Entity Detail, F Calendar, G Communication, H Dashboard, X Auth. Full mapping in PAGE-INVENTORY.md.

## Shared components to build

Button, IconButton, Input/Select/Textarea, Badge/StatusBadge, Avatar, Tooltip, Popover, DropdownMenu, Dialog/Sheet, Tabs, Breadcrumb, PageHeader, SectionHeader, EmptyState, ErrorState, Alert, Card, StatCard, Pagination, FilterBar, SearchField, ConfirmDialog, KeyValueGrid, FormSection, ChartCard, Timeline; upgrade DataTable; unified nav config.

## Implementation order

```
Phase 0  Baseline (done): lint/test/build recorded, tests fixed, skills installed, docs created
Phase 1  Tokens: globals.css rewrite (semantic tokens + dark mode + focus ring + z-index)
Phase 2  Primitives: Button, Input, Badge, Card, PageHeader, Empty/Error states, etc.
Phase 3  App shell: DashboardLayout/Sidebar/Navbar/CommandPalette on tokens + nav config + collapsed mode
Phase 4  Dashboard: role variants rebuilt from primitives, live data, no mock fallbacks
Phase 5  Directory archetype: students page as reference, then migrate A-routes
Phase 6  Table/Form/Detail archetypes: migrate B/C/E routes
Phase 7  Analytics, Calendar, Communication archetypes
Phase 8  Auth screens
Phase 9  Responsive + mobile pass (tables, drawers, safe areas)
Phase 10 Accessibility pass (keyboard, focus, aria, reduced motion)
Phase 11 Motion polish + performance (build, bundle checks)
Phase 12 Final QA: lint/test/build, browser matrix, web-design-guidelines audit, report
```

## Log

- **2026-09-08 (session 1)**:
  - Phase 0: baseline recorded (lint 835 pre-existing, build passes), test infra fixed (matchMedia polyfill + jest setupFilesAfterEnv), skills installed (design-taste-frontend, web-design-guidelines), 11 living docs created.
  - Phase 1 (tokens): `globals.css` rewritten with EDU Nexus UI semantic tokens (light + dark), `@custom-variant dark`, focus ring, radius/shadow tokens, reduced-motion guard. `layout.tsx` gained a no-FOUC theme init script.
  - Phase 2 (primitives): 26 components added under `src/components/ui/` - Button/IconButton, Badge/StatusBadge (semantic status map), Card/StatCard, Avatar, EmptyState/ErrorState/Spinner/Alert, PageHeader/SectionHeader/Breadcrumb, FormField/Input/Textarea/Select, Tabs, Dialog/Sheet/ConfirmDialog, Pagination, Tooltip, KeyValueGrid/InfoList/FormSection. All tokenized, accessible, tsc + lint clean.
  - Phase 3 (shell): `src/config/navigation.ts` single-source nav config (7 groups + footer Settings; role arrays identical to legacy config - permissions unchanged). Sidebar rebuilt (tokens, collapsed rail 64px + flyouts, aria-expanded, auto-expand, persisted collapse). Navbar rebuilt (real breadcrumb labels from route meta map, Cmd+K search entry, theme toggle, accessible notification/logout buttons). CommandPalette rebuilt (role-filtered from nav config, recents in localStorage, focus restore, progressive disclosure). DashboardLayout tokenized + palette custom event.
  - Phase 4 (dashboard): `(dashboard)/page.tsx` rebuilt from primitives - role variants preserved (super-admin, domain-admin x4, faculty, student, staff x subroles), gradient banners removed, StatCard grids + alert/signal cards + charts + quick actions, reduced-motion aware stagger. GSAP dashboard entrance replaced by framer-motion stagger (motion system: GSAP reserved for shell choreography).
  - Phase 5 (auth): `/login` rebuilt - institutional grid canvas, tokenized card, FormField/Input/Select/Button primitives, typed error handling, demo credentials accordion preserved. Firebase/axios behavior unchanged.
  - QA: `scripts/browser-qa.mjs` (10-page baseline screenshots), `scripts/verify-tokens.mjs`, `scripts/verify-shell.mjs` (13 checks), `scripts/verify-dashboard.mjs` (12 checks) all green. 15 baseline/after screenshots in `.qa/screenshots/` (gitignored). Build passes; jest 4/4; new code tsc + eslint clean.
- **2026-09-08 (dark mode removal)**:
  - Dark mode removed at operator's request: deleted `useTheme` hook, no-FOUC theme init script in `layout.tsx`, navbar Sun/Moon toggle, `.dark` token block + `@custom-variant dark` + `html.dark` color-scheme rule in `globals.css`, and stray `dark:` variants in login/error/loading/not-found. QA scripts updated (theme-toggle checks dropped). Docs updated. Gates: tsc clean, lint clean on touched files, jest 4/4, production build passes.

## Log (continued)

- **2026-09-08 (session 2)**:
  - DataTable fully rewritten (backward compatible): column sorting (aria-sort), row selection + bulk actions bar, loading skeleton, designed empty states (no data vs no filter matches), error+retry, density modes, clamped pagination, saved filters/columns preserved, tokenized. All 22 consuming pages verified rendering in browser (scripts/verify-datatable-pages.mjs).
  - Directory archetype migrated: students (reference), faculties, departments, semesters, parents. Hand-rolled modals replaced with Dialog/ConfirmDialog primitives; browser confirm() replaced with destructive-action ConfirmDialog; success banners onto Alert; page headers onto PageHeader; avatar/badge chips from primitives. All mutations/query keys unchanged.
  - Quality gates: tsc clean, eslint on all migrated files clean, jest 4/4, production build passes. Project lint count reduced 835 -> 800 (new code contributes zero errors; remaining debt is pre-existing monolith pages).

- **2026-09-15 (session 3) — multi-role demo tooling**:
  - Demo accounts consolidated into `src/config/demoAccounts.ts`: single source of truth for 14 accounts across `super-admin` / `domain-admin` / `faculty` / `student` / `staff`, each with role, access level (`read-only` vs `full`), persona and per-role demo highlights. Gated by `NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS` — on by default in development, explicit opt-in for a production build so a shipped bundle never carries credentials.
  - Login screen: the "Demo credentials" panel now lists every role with copy buttons and one-click fill (`Use this account` sets email + password + role, because the backend treats the selected role as part of the credential). The legacy single-account panel is retained, commented out, in place.
  - New `DemoRoleSwitcher` in the navbar: one-click switching between demo accounts for live presentations. It signs in through the real `/auth/login` endpoint (nothing mocked); `loginUser` already clears cached queries on a role change, so no data leaks between accounts.
  - New standalone `/demo` guide page (unauthenticated): every account grouped by role with copy buttons, how-it-works notes, and an 8-step suggested walkthrough.
  - `scripts/verify-demo-accounts.mjs`: 27 checks — 14-account login matrix (paced around the 5/min login limiter), role-mismatch rejection, `/demo` content, login-panel behaviour, live role switching. All green.
- **Backend fixes required for the demo (pre-existing bugs; all additive, nothing deleted)**:
  - `MissingSchemaError: "DomainAdmin"`: `User.profileRef` uses `refPath: 'profileType'`, so the stored value must be a registered mongoose MODEL NAME. Admins store `DomainAdmin` and staff store `Staff`, but those schemas were only registered as `Admin` / `Employee` — so **every** admin-tier login returned HTTP 500. Fixed by registering alias models that explicitly reuse the real collections; the third `model()` argument is required, otherwise mongoose derives empty `domainadmins` / `staffs` collections.
  - `auth.validation.ts`: the login role enum was missing `domain-admin` and `staff`, so those logins failed with 400 before reaching the service. Both added; legacy values untouched.
  - `auth.service.ts`: staff (`Employee`) profiles keep `firstName`/`lastName` at the top level rather than under `name`, so staff displayed as their email prefix (`priya.v`). Added an additive fallback to those fields; staff now resolve to real names.
  - Seed: added `arcraain@gmail.com` as a genuine `super-admin` (`SA-000`), and fixed `super.admin@college.edu`, which was advertised as "Super Admin" but created as `domain-admin`. Domain-admin entries now carry an explicit per-entry `role`.
- **Demo limitations to know before presenting**:
  - The login response does not return `domainAdminType` / `staffSubRole`, so all four domain-admin accounts render the same scoped navigation. Distinguishing them needs an API change (out of scope).
  - `BCRYPT_SALT_ROUNDS=15` makes every login take ~7s. Deliberately strong, but worth knowing live — and the reason switching roles in the navbar pauses briefly.
  - The backend seed clears and re-seeds the database on every start while `NODE_ENV=development`.

- **2026-09-15 (session 3, visual QA) — first full-data role walkthrough**:
  - `scripts/verify-role-visuals.mjs` signs in as each of the 5 headline roles through the real login UI (form fill + submit, not token injection) and captures 21 screenshots: 16 desktop pages (dashboards, user management, audit trail, student directory, admissions, attendance, exams, timetable, fees, OPD, laboratory) + 5 mobile dashboards, into `.qa/screenshots/role-demo/` (gitignored).
  - Result: all 5 roles logged in and navigated with **zero unexpected console errors** and real seeded data loading - the strongest end-to-end signal before the client demo. Note for future runs: the output path must go through `fileURLToPath`; a raw `URL.pathname` keeps `%20` encoded and writes a stray directory outside the project on Windows.

- **2026-09-15 (session 3, showcase lineup) — client demo finalized**:
  - Lineup cut to exactly 5 showcase accounts (super.admin, faculty.admin, finance.admin, j.sterling, demo.student) rendered by the login panel, header switcher and /demo guide from the single demoAccounts.ts source; the other 9 seeded accounts stay in the database but are never advertised in the UI. arcraain@gmail.com remains a functional seed account, off the client lineup.
  - All 5 showcase accounts are now created with isDemo:true in the seed (student was already; the other four newly flagged), so the backend demoGuard blocks every write - the demo is browse-only by design. Non-showcase accounts remain writable for development.
  - /demo guide rebuilt as the client-facing walkthrough: per-account credential card plus the FULL screen inventory for that role, generated live from NAV_SECTIONS so it can never drift from the sidebar. Verification adds checks that the hidden accounts do not leak into any demo surface.
  - Verification: 22/22 green (login matrix incl. isDemo flags + resolved names, 403 view-only enforcement via /grievances/submit, wrong-role 401, /demo content + leak checks, login panel = exactly 5 with no expander, switcher = exactly 5 and really switches, zero unexpected console errors). Production build passes with /demo.

## Remaining phases (next sessions)

- Phase 6: DataTable upgrade (sorting, selection, bulk bar, density, loading/error/empty, responsive priority columns) + migrate Directory archetype (students, faculties, users, alumni...).
- Phase 7: Form/Detail archetypes (*/new, */[id] pages) using Dialog/Sheet/FormSection primitives.
- Phase 8: Analytics/Calendar/Communication archetypes (reports, timetable, chat).
- Phase 9: remaining ~70 module pages by archetype (PAGE-INVENTORY.md status column).
- Phase 10: responsive pass (tables on mobile, safe areas), accessibility pass (axe/Playwright), motion polish, performance.
- Phase 11: final QA - lint/test/build, browser matrix, web-design-guidelines audit, final report.