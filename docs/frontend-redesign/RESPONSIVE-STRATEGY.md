# RESPONSIVE-STRATEGY.md

> Living notes. Last updated: 2026-09-08

## Principle

"Responsive" is not shrinking desktop. It is task adaptation per breakpoint (master prompt §33).

## Breakpoints

| Tier | Width | Strategy |
|---|---|---|
| Mobile | < 640 | Core tasks only. Drawer nav, single column, detail-first, sheets for edits, sticky primary action |
| Large mobile | 640-767 | Two-column forms allowed |
| Tablet | 768-1023 | Compact sidebar/drawer, adaptable tables, 2-col grids |
| Laptop | 1024-1279 | Persistent sidebar, multi-column |
| Desktop | 1280-1535 | Dense multi-column, full tables |
| Wide | 1536+ | Max content width ~1600px with comfortable gutters |

## App shell

- Sidebar: fixed 256px on lg+; off-canvas drawer below lg (existing behavior preserved).
- Desktop collapsed/rail mode (icon-only, tooltips) - new.
- Header: compact (56px), sticky; breadcrumbs truncate; search entry always visible (icon on mobile, Cmd+K on desktop).
- Mobile: header shows menu button + context title + bell + avatar.

## Data tables (the hard problem)

Per workflow, choose ONE of:
1. **Priority columns + horizontal scroll** for dense operational tables (finance, attendance).
2. **Row detail drawer** (tap row -> Sheet with full record) for mobile.
3. **Compact stacked cards** only when the record is fundamentally card-shaped (notices, grievances).

Never render 12 columns as unreadable mini-cards. Preserve data integrity.

## Forms

- Single-column on mobile; 2-column logical groups on md+.
- Sticky action bar (Save/Cancel) at bottom on mobile within safe-area padding.
- Field grouping via FormSection cards; no giant single forms.

## Dashboards

- KPI row: 1 col mobile -> 2 tablet -> 4 desktop (prioritized, not all 4 on mobile).
- Chart panels stack; operational queues go full width on mobile.

## Tablets

- Two-pane layouts (list + detail) collapse to single pane with a back affordance.

## Safe areas

- Sticky mobile controls use `env(safe-area-inset-bottom)` padding.
- Use `min-h-[100dvh]` for full-screen surfaces; never `h-screen` for shell-critical heights.