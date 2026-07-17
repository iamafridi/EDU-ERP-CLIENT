"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Home,
  ChevronLeft,
  ChevronDown,
  GraduationCap,
  Building2,
  AlertOctagon,
  Wrench,
  Shield,
  CreditCard,
  Calendar,
  Stethoscope,
  ClipboardList,
  Bus,
  MessageSquare,
  Bell,
  DollarSign,
  Library,
  UserCheck,
  Heart,
  Megaphone,
  UsersRound,
  FileText,
  User,
  Receipt,
  Bed,
  Beaker,
  Pill,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface NavSection {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

// ——— Original flat nav items (commented out for reference) ———
// const mainNavItems: NavItem[] = [
//   { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/profile", label: "My Profile", icon: User, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/students", label: "Student Directory", icon: Users, roles: ["super-admin", "domain-admin", "faculty", "staff"] },
//   { href: "/students/register", label: "Student Onboarding", icon: UserPlus, roles: ["super-admin", "domain-admin"] },
//   { href: "/semesters", label: "Semesters", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/faculties", label: "Faculty Directory", icon: GraduationCap, roles: ["super-admin", "domain-admin", "faculty"] },
//   { href: "/courses", label: "Course Catalog", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/departments", label: "Departments", icon: Building2, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/rooms", label: "Dorms & Rooms", icon: Home, roles: ["super-admin", "domain-admin", "staff", "student"] },
//   { href: "/attendance", label: "Attendance", icon: UserCheck, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/exams", label: "Exams & Grades", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/fees", label: "Fees & Ledger", icon: CreditCard, roles: ["super-admin", "domain-admin", "staff", "student"] },
//   { href: "/receipts", label: "Receipts", icon: Receipt, roles: ["super-admin", "domain-admin", "staff", "student"] },
//   { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/expenses", label: "Expenses", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/budget", label: "Budget", icon: Wallet, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/library", label: "Library", icon: Library, roles: ["super-admin", "domain-admin", "staff", "student", "faculty"] },
//   { href: "/mess", label: "Mess & Meals", icon: Calendar, roles: ["super-admin", "domain-admin", "staff", "student"] },
//   { href: "/transport", label: "Transport", icon: Bus, roles: ["super-admin", "domain-admin", "student", "faculty", "staff"] },
//   { href: "/admissions", label: "Admissions", icon: UserPlus, roles: ["super-admin", "domain-admin", "student"] },
//   { href: "/security", label: "Security Desk", icon: Shield, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/grievances", label: "Grievances", icon: AlertOctagon, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/incidents", label: "Maintenance Desk", icon: Wrench, roles: ["super-admin", "domain-admin", "staff", "faculty", "student"] },
//   { href: "/health-center", label: "Health Center", icon: Heart, roles: ["super-admin", "domain-admin", "staff", "student"] },
//   { href: "/clinical", label: "Clinical & Counseling", icon: Stethoscope, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/academics", label: "Academics Desk", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/transcripts", label: "Transcripts", icon: FileText, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/curriculum", label: "Curriculum", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/syllabus", label: "Syllabus", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/enrollment", label: "Enrollment", icon: UserPlus, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/study-materials", label: "Study Materials", icon: FileText, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/academic-calendar", label: "Academic Calendar", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/leave", label: "Leave Management", icon: UserCheck, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/notices", label: "Notices", icon: Megaphone, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/alumni", label: "Alumni", icon: UsersRound, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/chat", label: "Messaging", icon: MessageSquare, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/parents", label: "Parent Portal", icon: User, roles: ["super-admin", "domain-admin"] },
//   { href: "/notifications", label: "Notifications", icon: Bell, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/timetable", label: "Timetable", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/scholarships", label: "Scholarships", icon: GraduationCap, roles: ["super-admin", "domain-admin", "staff", "student"] },
//   { href: "/accreditation", label: "Accreditation", icon: Shield, roles: ["super-admin", "domain-admin"] },
//   { href: "/research", label: "Research", icon: Beaker, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/skill-lab", label: "Skill Lab", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student"] },
//   { href: "/logbook", label: "Logbook", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
//   { href: "/opd", label: "OPD", icon: Stethoscope, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/ipd", label: "IPD", icon: Bed, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/laboratory", label: "Laboratory", icon: Beaker, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/pharmacy", label: "Pharmacy", icon: Pill, roles: ["super-admin", "domain-admin", "staff"] },
//   { href: "/staff", label: "Staff Profile", icon: User, roles: ["staff"] },
// ];
// ——— End original flat nav items ———

const ALL_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/profile", label: "My Profile", icon: User, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
    ],
  },
  {
    label: "Academics",
    icon: BookOpen,
    items: [
      { href: "/semesters", label: "Semesters", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/faculties", label: "Faculty Directory", icon: GraduationCap, roles: ["super-admin", "domain-admin", "faculty"] },
      { href: "/courses", label: "Course Catalog", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/departments", label: "Departments", icon: Building2, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/attendance", label: "Attendance", icon: UserCheck, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/exams", label: "Exams & Grades", icon: ClipboardList, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/timetable", label: "Timetable", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/academic-calendar", label: "Academic Calendar", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/academics", label: "Academics Desk", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/transcripts", label: "Transcripts", icon: FileText, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/curriculum", label: "Curriculum", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/syllabus", label: "Syllabus", icon: BookOpen, roles: ["super-admin", "domain-admin", "faculty", "student"] },
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
      { href: "/opd", label: "OPD", icon: Stethoscope, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/ipd", label: "IPD", icon: Bed, roles: ["super-admin", "domain-admin", "staff"] },
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
      { href: "/receipts", label: "Receipts", icon: Receipt, roles: ["super-admin", "domain-admin", "staff", "student"] },
      { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/expenses", label: "Expenses", icon: DollarSign, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/budget", label: "Budget", icon: Wallet, roles: ["super-admin", "domain-admin", "staff"] },
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
      { href: "/study-materials", label: "Study Materials", icon: FileText, roles: ["super-admin", "domain-admin", "faculty", "student"] },
      { href: "/security", label: "Security Desk", icon: Shield, roles: ["super-admin", "domain-admin", "staff"] },
      { href: "/grievances", label: "Grievances", icon: AlertOctagon, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/incidents", label: "Maintenance Desk", icon: Wrench, roles: ["super-admin", "domain-admin", "staff", "faculty", "student"] },
      { href: "/notices", label: "Notices", icon: Megaphone, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/alumni", label: "Alumni", icon: UsersRound, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
      { href: "/parents", label: "Parent Portal", icon: User, roles: ["super-admin", "domain-admin"] },
    ],
  },
];

const adminNavItems: NavItem[] = [
  { href: "/users", label: "User Management", icon: Users, roles: ["super-admin", "domain-admin"] },
  { href: "/audit", label: "Audit Trail", icon: Shield, roles: ["super-admin", "domain-admin"] },
  { href: "/activity-log", label: "Activity Log", icon: Bell, roles: ["super-admin", "domain-admin"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["super-admin", "domain-admin", "staff"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
];

function NavItemLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick: () => void }) {
  const isActive = pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link key={item.href} href={item.href} onClick={onClick} className="block relative group">
      <motion.div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative z-10 ${
          isActive ? "text-white" : "hover:text-white hover:bg-slate-800/50"
        }`}
        whileTap={{ scale: 0.98 }}
      >
        <Icon size={18} className={isActive ? "text-[#2563EB]" : "text-slate-400"} />

        <span className="truncate font-sans">
          {item.label}
        </span>

        {isActive && (
          <motion.div
            layoutId={`sidebar-accent-${item.href}`}
            className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#2563EB] rounded-r"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>

      {isActive && (
        <motion.div
          layoutId={`sidebar-bg-${item.href}`}
          className="absolute inset-0 bg-[#2563EB]/10 rounded-lg -z-0"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

function SectionGroup({
  section,
  pathname,
  onClick,
  userRole,
}: {
  section: NavSection;
  pathname: string;
  onClick: () => void;
  userRole?: UserRole;
}) {
  const filtered = section.items.filter(
    (item) => userRole && item.roles.includes(userRole),
  );

  if (filtered.length === 0) return null;

  const hasActiveChild = filtered.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)),
  );

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // Auto-expand if child becomes active
  React.useEffect(() => {
    if (hasActiveChild && !isOpen) setIsOpen(true);
  }, [hasActiveChild]);

  const Icon = section.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-slate-500" />
          <span>{section.label}</span>
          <span className="text-[9px] font-normal text-slate-600 ml-0.5">{filtered.length}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden space-y-0.5"
      >
        {filtered.map((item) => (
          <NavItemLink key={item.href} item={item} pathname={pathname} onClick={onClick} />
        ))}
      </motion.div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useLayoutStore();
  const user = useAuthStore((s) => s.user);

  const [isAdminOpen, setAdminOpen] = useState(true);

  const userRole = user?.role;

  const filteredAdmin = adminNavItems.filter(
    (item) => userRole && item.roles.includes(userRole),
  );

  const adminHasVisible = filteredAdmin.length > 0;

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center h-16 border-b border-slate-800 overflow-hidden px-4">
        <div className="flex items-center gap-3 min-w-max">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shrink-0">
            E
          </div>
          <span className="font-semibold text-white tracking-wide text-sm font-sans whitespace-nowrap">
            EDU-ERP
          </span>
        </div>
        <motion.button
          onClick={() => setMobileMenuOpen(false)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <ChevronLeft size={16} />
        </motion.button>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden px-2">
        <div className="space-y-0.5">
          {ALL_SECTIONS.map((section) => (
            <SectionGroup
              key={section.label}
              section={section}
              pathname={pathname}
              onClick={handleNavClick}
              userRole={userRole}
            />
          ))}
        </div>

        {adminHasVisible && (
          <>
            <div className="px-3 py-1.5 mt-2">
              <button
                onClick={() => setAdminOpen(!isAdminOpen)}
                className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-500" />
                  <span>Administration</span>
                </div>
                <motion.div
                  animate={{ rotate: isAdminOpen ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>
            </div>

            <motion.div
              initial={false}
              animate={{ height: isAdminOpen ? "auto" : 0, opacity: isAdminOpen ? 1 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden space-y-0.5"
            >
              {filteredAdmin.map((item) => (
                <NavItemLink key={item.href} item={item} pathname={pathname} onClick={handleNavClick} />
              ))}
            </motion.div>
          </>
        )}
      </nav>
    </>
  );

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="fixed left-0 top-0 flex flex-col h-screen w-64 bg-[#0F172A] text-slate-400 border-r border-slate-800 select-none z-40"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
