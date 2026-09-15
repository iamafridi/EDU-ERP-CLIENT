# DESIGN-SYSTEM.md - EDU Nexus UI

> Internal design system name: **EDU Nexus UI**. Concept: "Institutional clarity, clinical trust, operational speed."
> Visual signature: **Institutional Grid + Clinical Signal** - structured grid, calm surfaces, strong hierarchy, compact operational typography, clean blue/teal signal color, restrained status bands, thin borders, high-quality data visualization.
> Living notes. Last updated: 2026-09-08

## Design read (taste-skill 0.B)

Reading this as: an **enterprise medical-education ERP** for daily operational staff, with a **calm, structured, data-dense institutional** language, leaning toward a **custom Tailwind token system** (no new component library; existing stack preserved) with **Inter typography** and **restrained motion**.

### Dials (master prompt §4.2)

| Dial | Value | Meaning |
|---|---|---|
| VARIANCE | 5.5 / 10 | Enough layout distinction to feel designed; no artsy chaos |
| MOTION | 4 / 10 | Motion supports comprehension, never entertains |
| DENSITY | 7 / 10 | Data-heavy views stay efficient |

## Color tokens (Tailwind 4 `@theme` + CSS vars)

Single source of truth in `src/app/globals.css`. Semantic, not raw palettes. **No arbitrary hexes in components.**

### Neutrals (cool ink, not slate-generic)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#f6f7f9` | `#0b0f17` | Page canvas |
| `--surface` | `#ffffff` | `#121826` | Cards/panels |
| `--surface-raised` | `#ffffff` | `#1a2233` | Popovers/dialogs |
| `--surface-muted` | `#eef1f5` | `#0f1520` | Table headers, subtle fills |
| `--border` | `#e2e6ec` | `#232c3d` | Default hairlines |
| `--border-strong` | `#c9d0da` | `#33405c` | Stronger separators, inputs |

### Text

| Token | Light | Dark |
|---|---|---|
| `--text` | `#141a26` | `#e6eaf2` |
| `--text-muted` | `#5b6472` | `#9aa5b8` |
| `--text-subtle` | `#8a93a3` | `#6b7689` |

### Accent - clinical blue (single operational accent)

| Token | Light | Dark |
|---|---|---|
| `--primary` | `#1a5fd0` | `#5b9bf0` |
| `--primary-hover` | `#154db0` | `#7aacf3` |
| `--primary-soft` | `#e8f0fd` | `#182c4d` |
| `--on-primary` | `#ffffff` | `#0b1524` |

### Status semantics (consistent across the whole product)

| Token | Base (light) | Soft (light) | Base (dark) | Soft (dark) | Used for |
|---|---|---|---|---|---|
| `--success` | `#0e8a5f` | `#e4f5ee` | `#3ecf96` | `#0e2b21` | Paid, present, active, approved, operational |
| `--warning` | `#b45309` | `#fdf1e3` | `#f5b757` | `#33220a` | Pending, late, maintenance, partial |
| `--danger` | `#c62828` | `#fdeaea` | `#ef6a6a` | `#3a1216` | Rejected, overdue, critical, absent, errors |
| `--info` | `#0e7490` | `#e0f4f9` | `#3fc1d9` | `#0b2833` | In progress, scheduled, neutral info |
| `--focus-ring` | `#1a5fd0` | - | `#5b9bf0` | - | All keyboard focus |

Rules:
- Status is never communicated by color alone (icon or label accompanies color).
- One accent for the whole product. Status colors are reserved for semantics, never decoration.
- Dark mode uses elevated dark surfaces (never pure `#000`), readable borders, controlled saturation.

## Typography

- **UI sans**: Inter (already loaded via `next/font`, `--font-inter`). Suitable for dense enterprise UI; keep.
- **Mono**: JetBrains Mono (`--font-mono`) for technical identifiers; **tabular numerals** (`font-variant-numeric: tabular-nums`) for money, counts, and statistics.

### Type scale

| Step | Class | Use |
|---|---|---|
| Display | `text-2xl font-semibold tracking-tight` | Major dashboard heading (keep modest - ERP, not marketing) |
| Page title | `text-xl font-semibold tracking-tight` | Page headers |
| Section title | `text-sm font-semibold` | Card/section headers |
| Body | `text-sm` | Default content |
| Compact | `text-[13px]` | Tables, dense lists |
| Metadata | `text-xs` | Secondary info |
| Label | `text-xs font-medium` | Form labels |
| Caption | `text-[11px]` | Captions, breadcrumb tails |

Rules: sentence case everywhere; restrained weight variation (no 10 weights); no uppercase micro-labels except sidebar section headers (that is their role, max 1 per group).

## Spacing - 4px base

`4 8 12 16 20 24 32 40 48 64` -> Tailwind `p-1 p-2 p-3 p-4 p-5 p-6 p-8 p-10 p-12 p-16`. Dense tables may use 8-10px row heights while keeping 44px touch targets on interactive rows.

## Radius

| Token | Value | Used for |
|---|---|---|
| `--radius-sm` | 6px | Inputs, buttons, chips |
| `--radius-md` | 10px | Cards, dropdowns, small surfaces |
| `--radius-lg` | 14px | Large cards, sheets |
| `--radius-xl` | 18px | Dialogs, command palette |

Tables and full-page panels use 0-6px radius (they are structure, not floating cards). One scale, everywhere.

## Shadows / elevation

Borders and surface contrast first. Shadows only for real elevation:

| Token | Value | Used for |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.05)` | Lifted cards on hover |
| `--shadow-md` | `0 4px 12px -2px rgb(15 23 42 / 0.08)` | Dropdowns, popovers |
| `--shadow-lg` | `0 12px 32px -8px rgb(15 23 42 / 0.16)` | Dialogs, command palette, drawers |

No shadows on every card. No pure-black shadows.

## Z-index scale (documented, enforced - no `z-[999999]`)

| Layer | Value |
|---|---|
| base | auto |
| sticky | 10 |
| dropdown | 30 |
| popover | 40 |
| drawer | 50 |
| modal | 60 |
| toast | 70 |
| command-palette | 80 |

## Glass usage (10% restraint)

`backdrop-blur` allowed ONLY for: command palette surface, mobile nav overlay, contextual popovers, sticky utility bars. Never on every card. Solid fallback under `prefers-reduced-transparency`.

## Dark mode (removed by product decision)

- The app is **light-only**. A class-based dark mode existed briefly and was removed at the operator's request.
- Tokens are still defined once on `:root`; components must keep using token utilities (`bg-surface`, `text-text-muted`, ...), never raw hexes, so a theme can be reintroduced later without touching components.
- Default: respect `prefers-color-scheme`; manual toggle in header user menu.
- Light-only. Verify hierarchy on all surfaces in the single light theme.

## Tokens in Tailwind 4

Implemented in `globals.css` via `@theme` mapping CSS vars to Tailwind utilities (e.g. `--color-primary: var(--primary)`), so components use `bg-primary`, `text-muted`, `border-border`, etc. No arbitrary values in components.