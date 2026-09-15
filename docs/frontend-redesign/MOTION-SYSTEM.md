# MOTION-SYSTEM.md

> Living notes. Last updated: 2026-09-08

## Character (master prompt §30-32, dials: MOTION 4/10)

Motion explains state change, preserves context, provides feedback, directs attention. Nothing bounces. No long page fades. No stagger on 100 table rows.

## Durations

| Type | Range |
|---|---|
| Micro interaction (hover/press/check) | 100-180ms |
| Standard UI transition | 180-280ms |
| Drawer/dialog/sheet | 220-360ms |
| Shell choreography (palette, dashboard entrance) | 350-650ms |

## Libraries

- **Framer Motion**: component transitions, drawers, popovers, route-adjacent UI, list changes, small state transitions. Existing usage patterns preserved.
- **GSAP**: reserved for shell entrance sequences and dashboard choreography only (existing dashboard entrance). Not for ordinary button hovers.
- Animate only `transform` and `opacity`. No `top/left/width/height`.

## Reduced motion (non-negotiable)

- Every motion component consumes `useReducedMotion()` and collapses to static/instant.
- CSS animations gated behind `@media (prefers-reduced-motion: no-preference)`.
- GSAP timelines short-circuit when reduced.

## Micro-interaction inventory

- Button press: `scale-[0.98]` + shadow flatten (120ms).
- Row hover: background tint + border hairline only.
- Sidebar expand: height 0->auto (200ms easeInOut, existing - keep).
- Toast entry/exit: slide+fade (220ms), stack-aware.
- Status update: subtle check-in animation only on the changed element.
- Command palette: 150ms scale/fade open (existing - keep), choreographed results stagger <= 4 items, none if reduced.

## Anti-patterns (banned)

- Springy overshoot on everything; `whileTap` scale on giant surfaces; page-level fade/slide on every route change; parallax; scroll-jacked sections; infinite loops on non-status elements.