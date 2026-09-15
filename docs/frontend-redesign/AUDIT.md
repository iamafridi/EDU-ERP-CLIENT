# AUDIT.md - Frontend Redesign Baseline

> Living notes. Last updated: 2026-09-08

## Baseline (Phase 0, before any redesign work)

| Check | Result | Notes |
|---|---|---|
| `git status` | clean on `main` | Working tree clean at start |
| `npm run lint` | **835 problems (727 errors, 108 warnings)** | Pre-existing. Dominated by `@typescript-eslint/no-explicit-any` |
| `npm test` | 4/4 pass | Was 4/4 failing: jsdom lacks `window.matchMedia`. Fixed by polyfilling it in `tests/setup.ts` and wiring `setupFilesAfterEnv` in `jest.config.js` (test-infra fix only, no product code touched) |
| `npm run build` | passes | All 83 routes compile with Next 16.2.9 |

Lint debt is concentrated in a small set of large files. Top offenders:

| File | Lines | Notes |
|---|---|---|
| `src/services/api.ts` | 4,263 | Giant API + inline `MOCK_*` datasets. **Contract file - do not rewrite** |
| `src/app/(dashboard)/exams/page.tsx` | 964 | Single-page monolith |
| `src/app/(dashboard)/transport/page.tsx` | 743 | Single-page monolith |
| `src/app/(dashboard)/attendance/page.tsx` | 727 | Single-page monolith |
| `src/app/(dashboard)/reports/page.tsx` | 642 | Single-page monolith |
| `src/app/(dashboard)/alumni/page.tsx` | 636 | Single-page monolith |
| `src/app/(dashboard)/fees/page.tsx` | 630 | Single-page monolith |
| `src/app/(dashboard)/page.tsx` | 547 | Role-branched dashboard with hardcoded mock numbers |

## Current state summary

- **Stack**: Next.js 16.2.9 App Router (webpack), React 19.2.4, TS 5, Tailwind CSS 4, Zustand 5, TanStack Query 5, Firebase 11, RHF + Zod 4, Recharts, Framer Motion, GSAP, jsPDF, Lucide, XLSX, Socket.io, Jest + Testing Library. All preserved.
- **Routes**: 83 pages (81 under `(dashboard)` + `/login` + root dashboard).
- **Shared component surface is tiny**: 17 components across `auth/`, `dashboard/`, `receipt/`, `ui/`. Pages inline nearly all their UI, which is why 50 modules look like 50 hand-made pages.
- **Shell exists and is decent**: `DashboardLayout`, `Sidebar` (role-aware, grouped IA, mobile drawer), `Navbar` (breadcrumbs, bell, user menu, logout), `CommandPalette` (Cmd+K, global search + static index), `ActivityFeed`, `QuickActions`, toasts, skip-link, `useReducedMotion`. These are the foundation to rebuild on, not throw away.

## Top problems

### UX
1. **Hardcoded fallback data** everywhere (dashboard shows 1,240 students etc. when the API is absent) - reads as a demo, not a system.
2. **Role-branched dashboards are static mock lists** - no live queues, alerts, or deadlines beyond hardcoded arrays.
3. **No designed empty states** - tables say "No records match your filters." uniformly.
4. **No error state pattern** - pages mostly ignore API failures or show nothing.
5. **Navbar breadcrumbs are pathname-derived** (`student-onboarding` becomes `Student-onboarding`) instead of a real label map.

### Visual
6. **Hardcoded hexes scattered everywhere**: `#2563EB`, `#e1e2ed`, `#0F172A`, `#faf8ff`, `slate-*` mixed with custom Material-ish tokens in `globals.css`. Two token systems fighting.
7. **Gradient title banners** on every dashboard (`from-[#2563EB] to-[#1d4ed8]`, purple, amber, emerald variants) - generic "AI dashboard" signature.
8. **4 identical KPI cards + 1 chart** repeated on every dashboard variant.
9. Inconsistent radii (4/8/12/24 vs `rounded-xl` everywhere), shadows on every card.

### Consistency
10. `DataTable` is the only shared table but lacks sorting, selection, bulk actions, server pagination, loading/error states; paginates client-side at 8 rows hardcoded.
11. Form components don't exist as primitives - every page hand-rolls inputs with different classes.
12. Status colors are per-page (blue/emerald/amber/purple assignments vary by module).

### Navigation
13. `CommandPalette` shows all 45 nav entries to every role regardless of permission - leaks the full route surface.
14. Sidebar IA groups exist but are inconsistent: `Campus Life` includes Notices/Alumni/Parents, `Academics` has 14 items (needs secondary grouping).

### Mobile
15. Tables rely on horizontal scroll only; no row-detail pattern, no priority columns.
16. Sidebar drawer exists but no collapsed/rail state on desktop; no bottom action bar; sticky elements unmanaged.

### Accessibility
17. Icon-only buttons lack `aria-label` in several spots (Navbar bell/logout have title only; logout has title but not aria-label).
18. Focus management: CommandPalette traps Tab manually but no focus restore to trigger; dialogs elsewhere unmanaged.
19. Color-only status cues (red badge = danger) without icon/label companions in places.
20. No automated a11y testing configured.

## Do NOT touch (contract surface)

- `src/services/api.ts` (API methods + mocks; response shapes come from the backend)
- `src/lib/firebase.ts`, auth store shape, permission map semantics (`usePermission`, `Can`)
- Query keys used by pages (`dashboard-stats`, `global-search`, etc.)
- Socket event names, receipt/PDF fields (jsPDF behavior preserved)
- Route slugs and page-level data contracts

## Redesign scope

Visual/presentation work lives in: `src/app/**`, `src/components/**`, `src/hooks/**` (only where visual), `src/app/globals.css`, new shared UI primitives, `docs/frontend-redesign/**`.