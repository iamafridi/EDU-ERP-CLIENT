# ACCESSIBILITY.md - WCAG 2.2 AA target

> Living notes. Last updated: 2026-09-08

## Baseline

- Skip-to-content link exists (preserve).
- `useReducedMotion` hook exists and is used in DashboardLayout/Skeleton (preserve, extend to all motion).
- `*:focus-visible` outline exists globally (restyle to `--focus-ring` token, keep visible).
- CommandPalette has manual Tab trap + ESC + arrow nav (extend: focus restore to trigger, role filtering, aria-activedescendant optional).

## Rules for the redesign

1. **Semantic HTML first** - native `<button>`, `<a>`, `<label>`, `<table>`, `<nav>`, `<main>`; ARIA only where native semantics are insufficient.
2. **Focus**: one visible focus treatment (`--focus-ring`, 2px offset). Never `outline: none` globally.
3. **Labels**: every input has a visible `<label>` (no placeholder-as-label); required marked; errors associated via `aria-describedby`.
4. **Dialog/Sheet**: focus trap, ESC, `aria-modal`, `aria-label`, return focus to trigger on close. Built into the Dialog/Sheet primitives.
5. **Icon-only controls**: accessible name + tooltip; 44px min hit area on mobile.
6. **Status**: never color-only. StatusBadge ships icon/label + color.
7. **Contrast**: body text >= 4.5:1, large text >= 3:1, checked against the light token palette.
8. **Reduced motion**: all animation gated behind `useReducedMotion()` or `@media (prefers-reduced-motion: reduce)`; motion collapses to instant/static.
9. **Touch targets**: interactive rows/buttons >= 40px; table row actions reachable via keyboard.
10. **Tables**: `<th scope>` semantics, sortable headers expose `aria-sort`, selection rows have labels.
11. **Charts**: KPI values rendered as text near charts; tooltips not the only data access.
12. **Landmarks**: `header`, `nav`, `main`, `aside` used correctly; skip link targets `#main-content`.

## Verification tooling

- Manual keyboard pass per redesigned surface.
- `@axe-core/playwright` optional addition if Playwright suite is adopted (decide after shell phase).
- Lighthouse accessibility run on representative routes at final QA.

## Known pre-existing gaps to fix during migration

- Navbar bell/logout buttons: add `aria-label` (currently rely on visible glyph + title only).
- `role="dialog"` surfaces other than CommandPalette: audit on first use.
- Breadcrumb `aria-current="page"` exists; keep.
- Sidebar section toggle buttons: add `aria-expanded`.