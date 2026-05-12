import {
  LayoutDashboard,
  User,
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  Building2,
  UserCheck,
  ClipboardList,
  FileText,
  Beaker,
  Shield,
  Users,
  UserPlus,
  Heart,
  Stethoscope,
  Bed,
  Pill,
  Home,
  Bus,
  Library,
  Megaphone,
  UsersRound,
  ShieldCheck,
  CreditCard,
  Receipt,
  DollarSign,
  Wallet,
  Wrench,
  AlertOctagon,
  Settings,
  Video,
  Scale,
  Layers,
  Lock,
  MessageSquare,
  Cpu,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/store/useAuthStore";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export interface NavSection {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

/** Single source of truth for sidebar + command palette navigation. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/admin", label: "Executive Console", icon: ShieldCheck, roles: ["super-admin", "domain-admin"] },
      { href: "/switchboard", label: "Executive Switchboard", icon: Layers, roles: ["super-admin", "domain-admin"] },
      // Redundant with Navbar User Menu (profile is accessible directly from top-right avatar)
      // { href: "/profile", label: "My Profile", icon: User, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      // Redundant with Navbar Notification Bell & Activity Feed drawer
      // { href: "/notifications", label: "Notifications", icon: Bell, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
    ],
  },
  {
    label: "Academics",
    icon: BookOpen,
    items: [
      { href: "/advising", label: "Advising Desk", icon: Layers, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/semesters", label: "Semesters", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/faculties", label: "Faculty Directory", icon: GraduationCap, roles: ["super-admin", "domain-admin", "faculty"] },
      { href: "/courses", label: "Course Catalog", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/departments", label: "Departments", icon: Building2, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/attendance", label: "Attendance", icon: UserCheck, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/exams", label: "Exams & Grades", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/timetable", label: "Timetable", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/academic-calendar", label: "Academic Calendar", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      // Redundant with Course Catalog and Timetable
      // { href: "/academics", label: "Academics Desk", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/transcripts", label: "Transcripts", icon: FileText, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/curriculum", label: "Curriculum", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/syllabus", label: "Syllabus", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/lms", label: "Classroom++ & LMS", icon: Layers, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      // Redundant with Exams & Grades and Timetable
      // { href: "/routines", label: "Exam Routines", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/research", label: "Research", icon: Beaker, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/accreditation", label: "Accreditation", icon: Shield, roles: ["super-admin", "domain-admin"] },
    ],
  },
  {
    label: "Students",
    icon: Users,
    items: [
      { href: "/students", label: "Student Directory", icon: Users, roles: ["super-admin", "domain-admin", "faculty", "staff"] },
      { href: "/students/register", label: "Student Onboarding", icon: UserPlus, roles: ["super-admin", "domain-admin"] },
      { href: "/admissions", label: "Admissions", icon: UserPlus, roles: ["super-admin", "domain-admin", "student"] },
      { href: "/enrollment", label: "Enrollment", icon: UserPlus, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/digital-locker", label: "Digital Locker", icon: Lock, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/disciplinary", label: "Disciplinary", icon: AlertOctagon, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/scholarships", label: "Scholarships", icon: GraduationCap, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/leave", label: "Leave Management", icon: UserCheck, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
    ],
  },
  {
    label: "Clinical",
    icon: Stethoscope,
    items: [
      { href: "/health-center", label: "Health Center", icon: Heart, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/clinical", label: "Clinical & Counseling", icon: Stethoscope, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/telemedicine", label: "Telemedicine", icon: Video, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/opd", label: "OPD", icon: Stethoscope, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/ipd", label: "IPD", icon: Bed, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/blood-bank", label: "Blood Bank", icon: Heart, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/laboratory", label: "Laboratory", icon: Beaker, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/pharmacy", label: "Pharmacy", icon: Pill, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/logbook", label: "Logbook", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/skill-lab", label: "Skill Lab", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student"] },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    items: [
      { href: "/fees", label: "Fees & Ledger", icon: CreditCard, roles: ["super-admin", "domain-admin", "staff", "student"] },
      // Redundant with Fees & Ledger (Receipts are integrated into fee collection vouchers)
      // { href: "/receipts", label: "Receipts", icon: Receipt, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/daily-wages", label: "Daily Workers & Wages", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/construction", label: "Construction & Projects", icon: Building2, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/expenses", label: "Expenses", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/budget", label: "Budget", icon: Wallet, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/development", label: "Capital Development", icon: Building2, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/accounting/chart-of-accounts", label: "Chart of Accounts", icon: BookOpen, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/accounting/journals", label: "Journal Entries", icon: FileText, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/accounting/reports", label: "Trial Balance", icon: Scale, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/accounting/subledgers", label: "Subledgers", icon: Users, roles: ["super-admin", "domain-admin", "staff"] },
    ],
  },
  {
    label: "Campus Life",
    icon: Home,
    items: [
      { href: "/rooms", label: "Dorms & Rooms", icon: Home, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/mess", label: "Mess & Meals", icon: Calendar, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/transport", label: "Transport", icon: Bus, roles: ["super-admin", "domain-admin", "student", "faculty", "staff"] },
      { href: "/library", label: "Library", icon: Library, roles: ["super-admin", "domain-admin", "staff", "student", "faculty"] },
      // Redundant with Classroom++ & LMS and Library catalog
      // { href: "/study-materials", label: "Study Materials", icon: FileText, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/requisitions", label: "Requisition Desk", icon: FileCheck, roles: ["super-admin", "domain-admin", "staff", "faculty"] },
      { href: "/procurement", label: "Procurement & Store", icon: Building2, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/security", label: "Security Desk", icon: Shield, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/iot", label: "IoT Telemetry", icon: Cpu, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/grievances", label: "Grievances", icon: AlertOctagon, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/incidents", label: "Maintenance Desk", icon: Wrench, roles: ["super-admin", "domain-admin", "staff", "faculty", "student"] },
      { href: "/feedback", label: "Course Feedback", icon: FileCheck, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/career", label: "Career & Placement", icon: GraduationCap, roles: ["super-admin", "domain-admin", "student"] },
      { href: "/notices", label: "Notices", icon: Megaphone, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/alumni", label: "Alumni", icon: UsersRound, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      // Redundant with Student Directory and Onboarding
      // { href: "/parents", label: "Parent Portal", icon: User, roles: ["super-admin", "domain-admin"] },
    ],
  },
  {
    label: "Administration",
    icon: ShieldCheck,
    items: [
      { href: "/users", label: "User Management", icon: Users, roles: ["super-admin", "domain-admin"] },
      { href: "/audit", label: "Audit Trail", icon: Shield, roles: ["super-admin", "domain-admin"] },
      // Redundant with Navbar Activity Feed drawer and Audit Trail
      // { href: "/activity-log", label: "Activity Log", icon: Bell, roles: ["super-admin", "domain-admin"] },
      { href: "/reports", label: "Reports", icon: FileText, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/chat", label: "Campus Messaging", icon: MessageSquare, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
    ],
  },
];

/**
 * Footer navigation rendered below the groups (e.g. Settings). Kept separate
 * from Administration so non-admin roles never see an "Administration" group.
 * Roles arrays are identical to the previous flat config - permissions unchanged.
 */
export const FOOTER_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
];

export function filterSectionsByRole(sections: NavSection[], role?: UserRole | null): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => role && item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

/** Human-readable labels for routes (exact + dynamic patterns with [id]). */
export const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/login": "Sign In",
  "/switchboard": "Executive Switchboard",
  "/profile": "My Profile",
  "/students": "Student Directory",
  "/students/[id]": "Student Profile",
  "/students/register": "Student Onboarding",
  "/admissions": "Admissions",
  "/enrollment": "Enrollment",
  "/scholarships": "Scholarships",
  "/leave": "Leave Management",
  "/faculties": "Faculty Directory",
  "/faculties/[id]": "Faculty Profile",
  "/courses": "Course Catalog",
  "/courses/[id]": "Course Details",
  "/departments": "Departments",
  "/semesters": "Semesters",
  "/attendance": "Attendance",
  "/exams": "Exams & Grades",
  "/grades": "Grades",
  "/timetable": "Timetable",
  "/academic-calendar": "Academic Calendar",
  "/academics": "Academics Desk",
  "/transcripts": "Transcripts",
  "/curriculum": "Curriculum",
  "/syllabus": "Syllabus",
  "/research": "Research",
  "/accreditation": "Accreditation",
  "/health-center": "Health Center",
  "/health-center/[id]": "Health Record",
  "/health-center/new": "New Health Record",
  "/clinical": "Clinical & Counseling",
  "/opd": "OPD",
  "/opd/[id]": "OPD Record",
  "/opd/new": "New OPD Entry",
  "/ipd": "IPD",
  "/ipd/[id]": "IPD Record",
  "/ipd/new": "New IPD Admission",
  "/laboratory": "Laboratory",
  "/laboratory/[id]": "Lab Report",
  "/laboratory/new": "New Lab Test",
  "/pharmacy": "Pharmacy",
  "/pharmacy/[id]": "Pharmacy Record",
  "/pharmacy/new": "New Pharmacy Entry",
  "/logbook": "Logbook",
  "/logbook/[id]": "Logbook Entry",
  "/logbook/new": "New Logbook Entry",
  "/skill-lab": "Skill Lab",
  "/fees": "Fees & Ledger",
  "/receipts": "Receipts",
  "/payroll": "Payroll",
  "/daily-wages": "Daily Workers & Wages",
  "/construction": "Construction & Capital Projects",
  "/expenses": "Expenses",
  "/budget": "Budget",
  "/rooms": "Dorms & Rooms",
  "/rooms/[id]": "Room Details",
  "/rooms/new": "New Room",
  "/mess": "Mess & Meals",
  "/mess/[id]": "Mess Record",
  "/mess/new": "New Mess Entry",
  "/transport": "Transport",
  "/transport/[id]": "Transport Record",
  "/transport/new": "New Transport Entry",
  "/library": "Library",
  "/study-materials": "Study Materials",
  "/security": "Security Desk",
  "/security/[id]": "Security Record",
  "/security/new": "New Security Entry",
  "/grievances": "Grievances",
  "/grievances/[id]": "Grievance Details",
  "/grievances/new": "Submit Grievance",
  "/incidents": "Maintenance Desk",
  "/incidents/[id]": "Incident Details",
  "/incidents/new": "Report Incident",
  "/notices": "Notices",
  "/alumni": "Alumni",
  "/parents": "Parent Portal",
  "/chat": "Messaging",
  "/notifications": "Notifications",
  "/users": "User Management",
  "/audit": "Audit Trail",
  "/activity-log": "Activity Log",
  "/reports": "Reports",
  "/settings": "Settings",
  "/accounting/chart-of-accounts": "Chart of Accounts",
  "/accounting/journals": "Journal Entries",
  "/accounting/reports": "Trial Balance",
  "/accounting/subledgers": "Subledgers",
  "/telemedicine": "Telemedicine",
  "/blood-bank": "Blood Bank",
  "/digital-locker": "Digital Locker",
  "/disciplinary": "Disciplinary Records",
  "/lms": "Learning Management",
  "/routines": "Exam Routines",
  "/advising": "Advising Desk",
  "/requisitions": "Requisition Desk",
  "/development": "Capital Development",
  "/procurement": "Procurement & Store",
  "/iot": "IoT Telemetry",
  "/feedback": "Course Evaluation & Feedback",
  "/career": "Career & Placement",
  "/staff": "Staff Directory",
  "/admin": "Executive Console",
  "/admin/users": "User Management",
  "/admin/audit": "Audit & Compliance",
  "/admin/settings": "System Configuration",
};

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === "/" || pathname === "/dashboard") {
    return [{ label: "Dashboard", href: "/dashboard", isCurrent: true }];
  }

  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard", isCurrent: false }
  ];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;
    const isCurrent = i === segments.length - 1;

    let label = PAGE_LABELS[currentPath];
    if (!label) {
      const dynamic = currentPath.replace(/\/[^/]+$/, "/[id]");
      label = PAGE_LABELS[dynamic];
    }
    if (!label) {
      label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    }

    if (currentPath === "/dashboard") continue;

    items.push({
      label,
      href: currentPath,
      isCurrent,
    });
  }

  return items;
}

export function getRouteMeta(pathname: string): { sectionLabel: string | null; pageLabel: string } {
  const sectionFor = (p: string): string | null => {
    for (const section of NAV_SECTIONS) {
      if (section.items.some((item) => item.href === p)) return section.label;
    }
    return null;
  };
  if (PAGE_LABELS[pathname]) {
    return { sectionLabel: sectionFor(pathname), pageLabel: PAGE_LABELS[pathname] };
  }
  // Dynamic routes: /students/abc -> /students/[id]
  const dynamic = pathname.replace(/\/[^/]+$/, "/[id]");
  if (PAGE_LABELS[dynamic]) {
    const base = dynamic.replace(/\/\[id\]$/, "");
    return { sectionLabel: sectionFor(base), pageLabel: PAGE_LABELS[dynamic] };
  }
  const last = pathname.split("/").filter(Boolean).pop() || "";
  const label = last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  return { sectionLabel: null, pageLabel: label };
}