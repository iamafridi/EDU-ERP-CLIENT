# PAGE-INVENTORY.md - 83 routes, archetypes, status

> Status: `todo` = not migrated, `partial` = shell-level only, `done` = full archetype.
> Archetypes: A Directory, B Operational Table, C Form/Workflow, D Analytics, E Entity Detail, F Calendar, G Communication, H Dashboard, X Auth.

| Route | Module | Archetype | Density | Primary actions | Problems | Status |
|---|---|---|---|---|---|---|
| /login | Auth | X | low | Sign in (Firebase) | Generic marketing look | todo |
| / | Dashboard | H | high | Role navigation, quick actions | Gradient banners, mock numbers, 4-equal-cards | todo |
| /profile | Account | E | med | View/edit own profile | - | todo |
| /students | Students | A | high | Search/filter, open, register | Table pattern varies | todo |
| /students/[id] | Students | E | med | Tabs (academic/finance/activity) | - | todo |
| /students/register | Students | C | med | Multi-section onboarding | - | todo |
| /admissions | Students | B | med | Filter, status update | - | todo |
| /enrollment | Students | B | med | Enroll, filter | - | todo |
| /scholarships | Students | B | med | Apply, approve | - | todo |
| /leave | Students/Staff | B | med | Request, approve | - | todo |
| /faculties | Academics | A | high | Search/filter, open | - | todo |
| /faculties/[id] | Academics | E | med | Tabs, courses taught | - | todo |
| /courses | Academics | A | med | Search, open | - | todo |
| /courses/[id] | Academics | E | med | Outcomes, assessments | - | todo |
| /departments | Academics | A | med | List, open | - | todo |
| /semesters | Academics | A | med | Manage semesters | - | todo |
| /attendance | Academics | B | high | Mark, filter by course/date | 727-line monolith | todo |
| /exams | Academics | B/D | high | Grades entry, charts | 964-line monolith | todo |
| /grades | Academics | B | high | Grade publishing | Duplicates exams surface | todo |
| /timetable | Academics | F | high | Period grid, filter | - | todo |
| /academic-calendar | Academics | F | med | Event list/calendar | - | todo |
| /academics | Academics | F | med | Desk hub | - | todo |
| /transcripts | Academics | B | med | Request, view | - | todo |
| /curriculum | Academics | B | med | Map outcomes | - | todo |
| /syllabus | Academics | B | med | Manage syllabus | - | todo |
| /research | Academics | B | med | CRUD research | - | todo |
| /accreditation | Academics | B | med | Evidence, status | - | todo |
| /health-center | Clinical | B | high | Visits, triage status | - | todo |
| /health-center/[id] | Clinical | E | med | Record detail | - | todo |
| /health-center/new | Clinical | C | med | New visit | - | todo |
| /clinical | Clinical | B | med | Counseling appointments | - | todo |
| /opd | Clinical | B | high | Queue, register | - | todo |
| /opd/[id] / /opd/new | Clinical | E/C | med | - | - | todo |
| /ipd | Clinical | B | high | Wards, admissions | - | todo |
| /ipd/[id] / /ipd/new | Clinical | E/C | med | - | - | todo |
| /laboratory | Clinical | B | high | Tests, results | - | todo |
| /laboratory/[id] / /laboratory/new | Clinical | E/C | med | - | - | todo |
| /pharmacy | Clinical | B | high | Dispense, stock | - | todo |
| /pharmacy/[id] / /pharmacy/new | Clinical | E/C | med | - | - | todo |
| /logbook | Clinical | B | med | Rotations, entries | - | todo |
| /logbook/[id] / /logbook/new | Clinical | E/C | med | - | - | todo |
| /skill-lab | Clinical | B | med | Skill signoffs | - | todo |
| /fees | Finance | B/D | high | Collect, ledger view | 630-line monolith, currency formatting | todo |
| /receipts | Finance | B | high | Issue, PDF download | PDF contract preserved | todo |
| /payroll | Finance | B | high | Run payroll, status | - | todo |
| /expenses | Finance | B | med | Create, approve | - | todo |
| /budget | Finance | B/D | med | Allocate, track | - | todo |
| /rooms | Campus | B | high | Allocate, occupancy | - | todo |
| /rooms/[id] / /rooms/new | Campus | E/C | med | - | - | todo |
| /mess | Campus | B | med | Menus, meal plans, feedback | - | todo |
| /mess/[id] / /mess/new | Campus | E/C | med | - | - | todo |
| /transport | Campus | B | high | Vehicles, routes, fees | 743-line monolith | todo |
| /transport/[id] / /transport/new | Campus | E/C | med | - | - | todo |
| /library | Campus | A/B | high | Catalog, issue/return | - | todo |
| /study-materials | Campus | B | med | Upload, browse | - | todo |
| /security | Campus | B | high | Gate entries, visitors | - | todo |
| /security/[id] / /security/new | Campus | E/C | med | - | - | todo |
| /grievances | Campus | B | med | Submit, track, resolve | - | todo |
| /grievances/[id] / /grievances/new | Campus | E/C | med | - | - | todo |
| /incidents | Campus | B | med | Report, assign, resolve | - | todo |
| /incidents/[id] / /incidents/new | Campus | E/C | med | - | - | todo |
| /notices | Campus | B | med | Publish, pin | - | todo |
| /alumni | Campus | A | med | Directory, outreach | 636-line monolith | todo |
| /parents | Campus | A | med | Parent records | - | todo |
| /chat | Communication | G | med | Conversations, socket | - | todo |
| /notifications | Communication | B | med | Read/mark, filter | - | todo |
| /users | Administration | A | med | Manage users, roles | - | todo |
| /audit | Administration | B | high | Filterable trail | - | todo |
| /activity-log | Administration | B | med | System events | - | todo |
| /reports | Administration | D | high | Generate, export, preview | 642-line monolith | todo |
| /settings | Administration | C | med | Grouped settings | - | todo |

## Cross-cutting problems (all routes)

1. Hardcoded hexes (`#2563EB`, `#e1e2ed`, `slate-*`) instead of tokens.
2. No shared PageHeader - titles/actions re-created per page.
3. Tables: inconsistent pagination, no sorting/selection, no loading skeleton usage, generic empty state.
4. Forms: hand-rolled inputs, inconsistent validation styling.
5. Status chips: per-page color choices.
6. Mobile: horizontal scroll only, no detail-sheet pattern.