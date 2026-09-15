# COMPONENT-MAP.md - Existing vs Target

> Living notes. Last updated: 2026-09-08

## Existing shared components

| Component | Location | Verdict | Action |
|---|---|---|---|
| `DashboardLayout` | components/dashboard | Keep structure | Tokenize, tighten, sticky header |
| `Sidebar` | components/dashboard | Good IA, hardcoded colors | Tokenize, add collapsed/rail mode, single nav config source |
| `Navbar` | components/dashboard | Breadcrumbs naive | Label-map breadcrumbs, add global search entry, tokenize |
| `CommandPalette` | components/dashboard | Functional | Role-filter, recents, shared nav config, focus restore, tokenize |
| `QuickActions` / `ActivityFeed` / `ShortcutsHelp` / `DemoModeBanner` / `ToastListener` | components/dashboard | Keep | Tokenize, verify reduced-motion |
| `AuthGuard` | components/dashboard | Keep | Verify role gating + redirect UX |
| `DataTable` | components/ui | Core primitive | Major upgrade: sorting, selection, bulk bar, server-ready pagination, loading/empty/error states, density, responsive priority columns, tokenize |
| `Skeleton` | components/ui | Good shape | Tokenize; add PageHeader/Table/Chart variants (some exist) |
| `ToastContainer` | components/ui | Keep | Tokenize |
| `Can` | components/ui | Keep as-is | RBAC surface - do not alter semantics |
| `ProfileDetailPage` | components/ui | Check usage | Align to Entity Detail archetype |
| `ReceiptPDF` | components/receipt | Keep | jsPDF contract preserved; only presentation wrapper touches |
| auth components | components/auth | Redesign | Login/auth screens into brand system (no Firebase change) |

## Target primitives to build (Phase 2)

Under `src/components/ui/` (keep `Can.tsx`, `Skeleton.tsx`, `ToastContainer.tsx` names so existing imports survive):

Button, IconButton, LinkButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Badge, StatusBadge (semantic map), Avatar, Tooltip, Popover, DropdownMenu, Dialog, Sheet (drawer), Tabs, Accordion, Breadcrumb, PageHeader, SectionHeader, EmptyState, ErrorState, Spinner, Alert, Card, StatCard, Pagination, FilterBar, SearchField, ConfirmDialog, KeyValueGrid, InfoList, FormSection, ChartCard, Timeline, Kbd.

Rules:
- Build on existing stack only (no shadcn/radix install unless justified later).
- Preserve export names of existing components (`DataTable`, `Skeleton`, `ToastContainer`, `Can`) to avoid breaking ~80 pages at once.
- Accessibility (focus trap, labels, aria) built into primitives, not patched per page.

## Nav config single source

New `src/config/navigation.ts`: typed `NavSection[]` shared by Sidebar AND CommandPalette (currently duplicated - sidebar has its own list, palette has its own). Role arrays live here once.