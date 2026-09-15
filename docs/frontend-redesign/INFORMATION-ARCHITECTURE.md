# INFORMATION-ARCHITECTURE.md - Navigation & Page Archetypes

> Living notes. Last updated: 2026-09-08

## Domain groups (sidebar)

Existing groups are kept and tightened. **Permission semantics unchanged** - only presentation is touched.

| Group | Modules | Notes |
|---|---|---|
| Overview | Dashboard, My Profile, Notifications | Always first |
| Academics | Semesters, Faculty Directory, Course Catalog, Departments, Attendance, Exams & Grades, Timetable, Academic Calendar, Academics Desk, Transcripts, Curriculum, Syllabus, Research, Accreditation | 14 items - too many flat; group into Academic (Semesters/Calendar/Timetable), Catalog (Courses/Curriculum/Syllabus), Records (Attendance/Exams/Transcripts), Research & QA (Research/Accreditation) |
| Students | Student Directory, Onboarding, Admissions, Enrollment, Scholarships, Leave | |
| Clinical | Health Center, Clinical & Counseling, OPD, IPD, Laboratory, Pharmacy, Logbook, Skill Lab | |
| Finance | Fees & Ledger, Receipts, Payroll, Expenses, Budget | |
| Campus Life | Dorms & Rooms, Mess & Meals, Transport, Library, Study Materials, Security Desk, Grievances, Maintenance Desk, Notices, Alumni, Parent Portal | 11 items - sub-group: Facilities (Rooms/Mess/Transport), Library (Library/Study Materials), Operations (Security/Incidents), Community (Notices/Alumni/Parents/Grievances) |
| Administration | User Management, Audit Trail, Activity Log, Reports, Settings | Role-gated |

Rules:
- Expandable groups with auto-expand on active child (already exists - preserve).
- Collapsed/rail state with icon tooltips (new, desktop only).
- Role-aware filtering stays client-side via the same `roles` arrays.
- Group ordering fixed; item ranking = frequency of use.

## Page archetypes (master prompt §21)

| Archetype | Route set | Shared structure |
|---|---|---|
| A. Directory | students, faculties, alumni, staff, parents, users, courses, departments, semesters, library | PageHeader > summary strip > search + filters > view controls > DataTable > pagination > details drawer |
| B. Operational Table | attendance, fees, receipts, payroll, expenses, budget, enrollment, transport, rooms, mess, scholarships, admissions, leave, security, grievances, incidents, study-materials, logbook, accreditation, research, skill-lab, activity-log, audit, notifications, notices | PageHeader > filters > dense table > bulk actions |
| C. Form / Workflow | */new pages, students/register, settings, grievances/new, security/new, transport/new | PageHeader > FormSection blocks > sticky action bar |
| D. Analytics | reports, budget, exams (charts), page.tsx dashboard | PageHeader > filter bar > KPI strip > charts > drill-down table |
| E. Entity Detail | */[id] pages (students/[id], faculties/[id], courses/[id], health-center/[id], ipd/[id], opd/[id], laboratory/[id], pharmacy/[id], logbook/[id], mess/[id], rooms/[id], security/[id], transport/[id], incidents/[id], grievances/[id]) | Identity header > status + primary actions > tabbed sections > related records |
| F. Calendar / Schedule | timetable, academic-calendar, academics | Header > period switcher > grid/schedule view |
| G. Communication | chat, notifications, activity-feed | Thread/feed layout, compose surface |

## Role dashboard variants

Preserve the existing role branching (super-admin, domain-admin x4, faculty, student, staff x subroles) but rebuild each variant from shared primitives: PageHeader, StatCard grid (max 4, prioritized), alert strip (only when data exists), operational queue (live query), chart panel, quick actions.

Dashboard priority per role (master prompt §20):
- Super Admin: institution KPIs, financial state, enrollment, attendance, system activity, alerts, approvals.
- Faculty: today's classes, attendance tasks, grading queue, announcements.
- Student: schedule, attendance, fees, results, deadlines, leave status, notices.
- Staff: role-specific daily ops (doctor/nurse/guard/warden/other).

No data a user cannot see. Fallback numbers removed or clearly labeled as sample.

## Command palette

- Static index derived from the SAME nav config as the sidebar (single source, role-filtered).
- Add: recents (localStorage), grouped navigation, keyboard hints, empty/error states.
- Global record search stays wired to `api.globalSearch` - do not fabricate new endpoints.