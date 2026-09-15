import type { UserRole } from "@/store/useAuthStore";

/**
 * DEMO ACCOUNTS
 * ---------------------------------------------------------------------------
 * Single source of truth for every seeded demo account, shared by:
 *   - the login screen's "Demo credentials" panel
 *   - the in-app demo role switcher
 *   - the standalone /demo cheat sheet
 *
 * IMPORTANT: the backend `auth.service` rejects a login when the selected role
 * does not match the account's stored role. `role` below is therefore part of
 * the credential, not a hint. Everything the UI does with a demo account must
 * send this exact role.
 *
 * These accounts are created by `backend/src/app/seed/index.ts`, which runs on
 * every backend start and resets the database first.
 */

export type DemoAccess = "read-only" | "full";

export interface DemoAccount {
  /** Stable key for React lists and "reveal password" state. */
  key: string;
  /** The role that MUST be selected at login. */
  role: NonNullable<UserRole>;
  /** Human label for that role. */
  roleLabel: string;
  /** Short persona blurb, for the presenter. */
  persona: string;
  email: string;
  password: string;
  /** `read-only` accounts are blocked from writes by the backend demoGuard. */
  access: DemoAccess;
  /** What is worth showing a client while signed in as this account. */
  highlights: string[];
}

/**
 * The five headline roles. These are what a client demo walks through, in
 * order, so both admin tiers plus the three operational roles are covered.
 */
export const PRIMARY_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: "super-admin",
    role: "super-admin",
    roleLabel: "Super Administrator",
    persona: "Full institutional access across every module",
    email: "arcraain@gmail.com",
    password: "Demo@123",
    access: "full",
    highlights: [
      "Institution-wide dashboard: enrollment, finance, attendance, alerts",
      "User Management — the only role that can create and delete users",
      "Audit Trail and system-wide Reports",
      "Every domain module is visible in the sidebar",
    ],
  },
  {
    key: "domain-admin",
    role: "domain-admin",
    roleLabel: "Domain Administrator",
    persona: "Faculty-scoped administrator",
    email: "faculty.admin@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: [
      "Academics: semesters, courses, departments, curriculum, syllabus",
      "Student onboarding, admissions, enrollment and transcripts",
      "Read access to Audit Log and Reports",
      "Scoped admin dashboard, distinct from the super admin view",
    ],
  },
  {
    key: "faculty",
    role: "faculty",
    roleLabel: "Faculty Member",
    persona: "Teaching and academic delivery",
    email: "j.sterling@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: [
      "Faculty dashboard: classes, attendance tasks, grading queue",
      "Mark attendance and publish grades",
      "Exams & Grades, Assessments, Study Materials",
      "Read the student directory (no create/delete rights)",
    ],
  },
  {
    key: "student",
    role: "student",
    roleLabel: "Student",
    persona: "View-only student portal",
    email: "demo.student@erp.demo",
    password: "Demo@123",
    access: "read-only",
    highlights: [
      "Student dashboard: schedule, attendance, fees, results, deadlines",
      "Own profile, timetable, results and fee ledger",
      "Submit leave requests and grievances",
      "Write actions are blocked — this is the safe, view-only account",
    ],
  },
  {
    key: "staff",
    role: "staff",
    roleLabel: "Staff (Doctor)",
    persona: "Clinical operations",
    email: "priya.v@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: [
      "Clinical dashboard and clinical & counseling workspace",
      "OPD, IPD, Laboratory and Pharmacy desks",
      "Health Center records and patient encounters",
      "Note how the sidebar differs from the faculty view",
    ],
  },
];

/** Secondary accounts, useful for showing that scoping is real. */
export const EXTRA_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: "super-admin-legacy",
    role: "super-admin",
    roleLabel: "Super Administrator",
    persona: "Second super admin (reporting persona)",
    email: "super.admin@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Identical access to the primary super admin", "Useful for side-by-side comparison"],
  },
  {
    key: "finance-admin",
    role: "domain-admin",
    roleLabel: "Domain Administrator",
    persona: "Finance administrator",
    email: "finance.admin@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Fees & ledger, receipts, payroll, expenses, budget", "Finance-heavy reporting views"],
  },
  {
    key: "medical-admin",
    role: "domain-admin",
    roleLabel: "Domain Administrator",
    persona: "Medical administrator",
    email: "medical.admin@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Clinical modules and health center administration", "Staff roster management"],
  },
  {
    key: "staff-admin",
    role: "domain-admin",
    roleLabel: "Domain Administrator",
    persona: "Staff administrator",
    email: "staff.admin@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Staff directory, shifts, rosters", "Campus operations and facilities"],
  },
  {
    key: "student-full",
    role: "student",
    roleLabel: "Student",
    persona: "Student with write access",
    email: "marcus.c@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Student portal that can submit forms and requests", "Use when the view-only account is too limiting"],
  },
  {
    key: "staff-nurse",
    role: "staff",
    roleLabel: "Staff (Nurse)",
    persona: "Nursing station",
    email: "anita.n@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Ward and IPD workflows", "Health center patient records"],
  },
  {
    key: "staff-librarian",
    role: "staff",
    roleLabel: "Staff (Librarian)",
    persona: "Library desk",
    email: "sarita.y@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Library catalogue, issue and return", "Study materials"],
  },
  {
    key: "staff-warden",
    role: "staff",
    roleLabel: "Staff (Warden)",
    persona: "Hostel warden",
    email: "manoj.s@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Dorms, rooms and occupancy", "Mess and hostel operations"],
  },
  {
    key: "staff-guard",
    role: "staff",
    roleLabel: "Staff (Security Guard)",
    persona: "Security desk",
    email: "dinesh.k@college.edu",
    password: "Demo@123",
    access: "full",
    highlights: ["Security desk and visitor logs", "Incident reporting"],
  },
];

export const ALL_DEMO_ACCOUNTS: DemoAccount[] = [
  ...PRIMARY_DEMO_ACCOUNTS,
  ...EXTRA_DEMO_ACCOUNTS,
];

/**
 * Whether demo-account UI may render.
 * ---------------------------------------------------------------------------
 * Exposing credentials in a shipped build is a leak, so this defaults to
 * "development only" and requires an explicit opt-in for production builds:
 *
 *   NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true
 *
 * `NEXT_PUBLIC_*` values are inlined at build time, so when the flag is absent
 * a production bundle omits this UI entirely rather than hiding it with CSS.
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
