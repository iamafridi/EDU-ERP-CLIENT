import type { UserRole } from "@/store/useAuthStore";

/**
 * CLIENT DEMO ACCOUNTS
 * ---------------------------------------------------------------------------
 * The five accounts shown to clients, in presentation order. These are the ONLY
 * demo accounts the UI advertises - the login panel, the header switcher and
 * the /demo guide all render from this single file.
 *
 * Every account here is created by `backend/src/app/seed/index.ts` with
 * `isDemo: true`, so the backend demoGuard blocks ALL write requests: the demo
 * is browse-only by design and no client action can mutate seeded data.
 *
 * The backend also seeds other operational accounts (nurse, librarian, warden,
 * guard, additional students) which remain writable for development, but they
 * are intentionally NOT listed here.
 *
 * IMPORTANT: the backend rejects a login when the selected role does not match
 * the account's stored role, so `role` is part of the credential.
 */

export type DemoAccess = "read-only" | "full";

export interface DemoAccount {
  /** Stable key for React lists. */
  key: string;
  /** The role that MUST be selected at login. */
  role: NonNullable<UserRole>;
  /** Human label for that role. */
  roleLabel: string;
  /** Short persona blurb for the presenter. */
  persona: string;
  email: string;
  password: string;
  /** All showcase accounts are view-only (backend demoGuard blocks writes). */
  access: DemoAccess;
  /** What is worth showing a client while signed in as this account. */
  highlights: string[];
}

export const SHOWCASE_ACCOUNTS: DemoAccount[] = [
  {
    key: "super-admin",
    role: "super-admin",
    roleLabel: "Super Administrator",
    persona: "Complete institution-wide access - every module, every screen",
    email: "super.admin@college.edu",
    password: "Demo@123",
    access: "read-only",
    highlights: [
      "Every module: Academics, Students, Clinical, Finance, Campus, Administration",
      "User Management - the only role that can create and delete users",
      "Audit Trail, Activity Log and institution-wide Reports",
      "Clinical desks: OPD, IPD, Laboratory, Pharmacy, Health Center",
      "Finance suite: Fees & Ledger, Receipts, Payroll, Expenses, Budget",
    ],
  },
  {
    key: "faculty-admin",
    role: "domain-admin",
    roleLabel: "Domain Administrator",
    persona: "Academic operations - manages programs, students and approvals",
    email: "faculty.admin@college.edu",
    password: "Demo@123",
    access: "read-only",
    highlights: [
      "Academic management: semesters, courses, departments, curriculum, syllabus",
      "Student onboarding, admissions with merit lists, enrollment",
      "Approve scholarships and leave requests",
      "Accreditation and research oversight",
      "Scoped powers: reads Audit Trail and Reports, cannot create or delete users",
    ],
  },
  {
    key: "finance-admin",
    role: "domain-admin",
    roleLabel: "Domain Administrator",
    persona: "Finance office - the money desk for the institution",
    email: "finance.admin@college.edu",
    password: "Demo@123",
    access: "read-only",
    highlights: [
      "Fees & Ledger with student balances and overdue tracking",
      "Receipts history and printable receipts",
      "Payroll runs, Expenses and Budget planning",
      "Finance reporting views with export",
      "Same admin navigation, finance-focused story",
    ],
  },
  {
    key: "faculty",
    role: "faculty",
    roleLabel: "Faculty Member",
    persona: "Teaching workflow - classes, attendance and grading",
    email: "j.sterling@college.edu",
    password: "Demo@123",
    access: "read-only",
    highlights: [
      "Faculty dashboard: today's classes, attendance tasks, grading queue",
      "Mark attendance and publish grades (Exams & Grades, Assessments)",
      "Timetable, academic calendar and course catalog",
      "Upload study materials, manage the clinical logbook",
      "Read the student directory - no create or delete rights",
    ],
  },
  {
    key: "student",
    role: "student",
    roleLabel: "Student",
    persona: "The student portal experience - personal, calm, view-only",
    email: "demo.student@erp.demo",
    password: "Demo@123",
    access: "read-only",
    highlights: [
      "Personal dashboard: schedule, attendance, fees, results, deadlines",
      "Timetable, transcripts and own fee ledger with receipts",
      "Mess menu, library catalogue, transport routes, notices",
      "Leave requests and grievances views",
      "View-only: every write action is blocked by design",
    ],
  },
];

/** Alias kept for consumers; the showcase list IS the full UI list now. */
export const ALL_DEMO_ACCOUNTS: DemoAccount[] = SHOWCASE_ACCOUNTS;

/** Backward-compatible alias used by the login panel and the header switcher. */
export const PRIMARY_DEMO_ACCOUNTS: DemoAccount[] = SHOWCASE_ACCOUNTS;

/**
 * Whether demo-account UI may render.
 * ---------------------------------------------------------------------------
 * Exposing credentials in a shipped build is a leak, so this defaults to
 * "development only" and requires an explicit opt-in for production builds:
 *
 *   NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true
 */
export const DEMO_ACCOUNTS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS === "true" ||
  process.env.NODE_ENV !== "production";

/** Group accounts by login role, for presentation-friendly rendering. */
export const DEMO_ACCOUNTS_BY_ROLE = ALL_DEMO_ACCOUNTS.reduce<
  Record<string, DemoAccount[]>
>((acc, account) => {
  const group = (acc[account.roleLabel] ||= []);
  group.push(account);
  return acc;
}, {});
