# QA-CHECKLIST.md

> Living notes. Last updated: 2026-09-08

## Per-surface browser QA loop (master prompt §56)

After every substantial slice:

1. Run app (`npm run dev`), open browser.
2. Navigate affected pages at desktop, tablet, mobile.
3. Inspect light theme (app is light-only; dark mode removed).
4. Inspect loading (skeleton), empty, error states.
5. Keyboard walk: Tab order, focus visibility, ESC, dialog traps.
6. Console errors + failed network requests.
7. Reduced motion emulation.
8. Fix -> repeat.

## Viewport matrix (master prompt §57)

390x844, 430x932, 768x1024, 1024x768, 1280x800, 1440x900, 1728x1117.

## Critical flows (master prompt §58)

- Auth: login, invalid login, logout, protected route redirect.
- Navigation: expand group, open module, collapse, Cmd+K, search route, navigate.
- Students: open directory, search/filter, open record, tab navigation.
- Academics: attendance filter, table inspect, safe interaction.
- Finance: fees filter/search, open ledger/receipt surface.
- Forms: open form, trigger validation, fill, cancel safely.

No destructive production actions.

## Quality gates (master prompt §97)

```bash
npm run lint    # no NEW errors vs baseline (835 baseline problems recorded in AUDIT.md)
npm test        # all pass
npm run build   # passes
```

## Visual regression

If feasible after shell phase: screenshot baselines for login, admin dashboard, student dashboard, directory, table page, form, detail page, analytics, mobile shell, command palette. Normalize dynamic content before comparing.

## Accessibility pass

Keyboard-only traversal, focus order, focus traps, contrast (axe/Lighthouse), role/name/value, landmarks, form labels, aria-expanded/current, reduced motion.

## Anti-generic check (taste-skill §14 highlights)

Zero em-dashes in new UI copy. One accent color. One radius system. No gradient text titles. No 4-equal-cards-without-hierarchy. No decorative dots without semantic meaning. No uppercase eyebrows outside sidebar groups. Motion justified or removed.