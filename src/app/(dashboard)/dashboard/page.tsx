"use client";

import React, { useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  Home,
  CreditCard,
  DollarSign,
  Stethoscope,
  Calendar,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Shield,
  Activity,
  UserCheck,
  BellRing,
  Plus,
  CalendarClock,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { KPIStatCard } from "@/components/dashboard/KPIStatCard";
import { NoticeStrip } from "@/components/dashboard/NoticeStrip";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { AgendaCard } from "@/components/dashboard/AgendaCard";
import { ProgramPerformanceCard } from "@/components/dashboard/ProgramPerformanceCard";
import { ClinicalOperationsCard } from "@/components/dashboard/ClinicalOperationsCard";
import { showToast } from "@/components/dashboard/ToastFeedback";

const DashboardCharts = dynamic(() => import("@/components/dashboard/DashboardCharts"), {
  loading: () => <div className="h-64 bg-surface-muted rounded-2xl animate-pulse" />,
  ssr: false,
});

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
}

interface Action {
  label: string;
  href: string;
  icon: React.ElementType;
}

function QuickActionsGrid({ actions, className = "" }: { actions: Action[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2.5 ${className}`}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => showToast(`Opening ${action.label}...`, "info")}
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all duration-200 group cursor-pointer text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-gold/[0.06] text-gold flex items-center justify-center shrink-0 group-hover:bg-gold/[0.12] transition-colors">
              <Icon size={15} aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold text-text group-hover:text-gold transition-colors font-ui">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScheduleCard({ title, slots }: { title: string; slots: { time: string; course: string; room: string; type?: string }[] }) {
  return (
    <Card pad="md" className="rounded-2xl">
      <h3 className="text-sm font-bold text-text mb-3 font-ui">{title}</h3>
      <div className="space-y-2">
        {slots.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-muted/60 border border-border">
            <span className="w-16 text-[10px] font-mono font-medium text-text-muted tabular-nums shrink-0 font-ui">{slot.time}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-text truncate font-ui">{slot.course}</span>
              <span className="block text-[10px] text-text-muted truncate font-body">
                {slot.room}
                {slot.type ? ` · ${slot.type}` : ""}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RoleHeader({ title, description, context }: { title: string; description: string; context?: React.ReactNode }) {
  const userName = useAuthStore((s) => s.user?.name || "User");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mb-6">
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/[0.06] border border-gold/10 text-[10px] font-bold uppercase tracking-[0.15em] text-gold font-ui">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          LIVE CAMPUS PULSE · {new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-3xl sm:text-4xl font-bold text-text tracking-tight font-display"
      >
        {greeting}, {userName.split(" ")[0]}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-sm text-text-muted mt-2 font-body"
      >
        Here is the pulse of your campus today.
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap gap-2.5 mt-5"
      >
        <button
          onClick={() => showToast("Opening timetable view...", "info")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover transition-all duration-200 cursor-pointer font-ui"
        >
          <CalendarClock size={14} aria-hidden="true" />
          View timetable
        </button>
        <button
          onClick={() => showToast("Create new action triggered", "success")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-text text-xs font-semibold hover:border-gold/30 hover:bg-gold/[0.03] transition-all duration-200 cursor-pointer font-ui"
        >
          <Plus size={14} aria-hidden="true" />
          Create new
        </button>
      </motion.div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: dashboardRes } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });
  const metrics = (dashboardRes?.metrics || []) as { label: string; value: number }[];
  const findMetric = (label: string) => metrics.find((m) => m.label === label)?.value;

  const totalStudents = findMetric("Total Students") ?? 0;
  const totalFaculty = findMetric("Faculty Members") ?? findMetric("Total Faculty") ?? 0;
  const totalCourses = findMetric("Courses") ?? 0;
  const totalRooms = findMetric("Total Rooms") ?? 0;
  const occupiedRooms = findMetric("Occupied Rooms") ?? 0;

  const isSuperAdmin = roleIs("super-admin");
  const isDomainAdmin = roleIs("domain-admin");
  const isFaculty = roleIs("faculty");
  const isStudent = roleIs("student");
  const isStaff = roleIs("staff");

  const domainType = user?.domainAdminType;
  const staffSubRole = user?.staffSubRole;

  const userName = user?.name || "User";

  // ---- Super Admin Dashboard ----
  if (isSuperAdmin) {
    return (
      <div ref={containerRef}>
        <RoleHeader
          title="Institution Overview"
          description="System-wide health, enrollment, occupancy and operational signals."
          context={<StatusBadge status="operational" />}
        />

        {/* Daily Briefing */}
        <div className="mb-6">
          <NoticeStrip userName={userName.split(" ")[0]} />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <KPIStatCard
            label="Enrolled Students"
            value={totalStudents.toLocaleString()}
            icon={<Users size={18} />}
            trend={8.4}
            trendLabel="vs. last semester"
            sparkline={[{ value: 3800 }, { value: 3950 }, { value: 4050 }, { value: 4120 }, { value: 4200 }, { value: 4286 }]}
            delay={0}
          />
          <KPIStatCard
            label="Today's Attendance"
            value="92.8%"
            icon={<UserCheck size={18} />}
            trend={2.1}
            trendLabel="above target"
            sparkline={[{ value: 90 }, { value: 91 }, { value: 91.5 }, { value: 92 }, { value: 92.5 }, { value: 92.8 }]}
            delay={0.05}
          />
          <KPIStatCard
            label="Clinical Occupancy"
            value="74%"
            icon={<Stethoscope size={18} />}
            trend={-4.6}
            trendLabel="healthy capacity"
            sparkline={[{ value: 82 }, { value: 80 }, { value: 78 }, { value: 76 }, { value: 75 }, { value: 74 }]}
            delay={0.1}
          />
          <KPIStatCard
            label="Collections MTD"
            value="৳8.42 Cr"
            icon={<DollarSign size={18} />}
            trend={12.7}
            trendLabel="vs. last month"
            sparkline={[{ value: 6.2 }, { value: 6.8 }, { value: 7.1 }, { value: 7.6 }, { value: 8.0 }, { value: 8.42 }]}
            delay={0.15}
          />
        </div>

        {/* Chart + Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          <div className="lg:col-span-3">
            <AttendanceChart />
          </div>
          <div className="lg:col-span-2">
            <AgendaCard />
          </div>
        </div>

        {/* Program Performance + Clinical */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ProgramPerformanceCard />
          <ClinicalOperationsCard />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card pad="md" className="rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text font-ui">Quick Actions</h3>
            </div>
            <QuickActionsGrid
              actions={[
                { label: "Register Student", href: "/students/register", icon: Users },
                { label: "User Management", href: "/users", icon: Shield },
                { label: "Audit Trail", href: "/audit", icon: FileText },
                { label: "Settings", href: "/settings", icon: Activity },
              ]}
            />
          </Card>
        </motion.div>
      </div>
    );
  }

  // ---- Domain Admin ----
  if (isDomainAdmin) {
    const domainTitle =
      domainType === "faculty-admin" ? "Faculty Administration"
      : domainType === "finance-admin" ? "Finance Administration"
      : domainType === "medical-admin" ? "Medical Administration"
      : domainType === "staff-admin" ? "Staff Administration"
      : "Domain Administration";

    const domainStats: Stat[] = domainType === "finance-admin" ? [
      { label: "Total Revenue", value: "৳28.5L", icon: DollarSign },
      { label: "Pending Fees", value: "৳4.5L", icon: CreditCard },
      { label: "Monthly Payroll", value: "৳12.8L", icon: FileText },
      { label: "Expenses", value: "৳8.2L", icon: TrendingUp },
    ] : domainType === "medical-admin" ? [
      { label: "OPD Visits Today", value: "47", icon: Stethoscope },
      { label: "IPD Patients", value: "23", icon: Home },
      { label: "Lab Tests Pending", value: "12", icon: ClipboardList },
      { label: "Prescriptions", value: "34", icon: FileText },
    ] : domainType === "staff-admin" ? [
      { label: "Active Staff", value: "156", icon: Users },
      { label: "Leave Requests", value: "8", icon: Calendar },
      { label: "Incidents Open", value: "3", icon: AlertTriangle },
      { label: "Shifts Today", value: "4", icon: Clock },
    ] : [
      { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users },
      { label: "Faculty Members", value: totalFaculty.toLocaleString(), icon: GraduationCap },
      { label: "Courses", value: totalCourses.toLocaleString(), icon: BookOpen },
      { label: "Total Rooms", value: totalRooms.toLocaleString(), icon: Home },
    ];

    return (
      <div ref={containerRef}>
        <RoleHeader title={domainTitle} description="Overview of your domain operations." />
        <div className="mb-6">
          <NoticeStrip userName={userName.split(" ")[0]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {domainStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <KPIStatCard key={stat.label} label={stat.label} value={stat.value} icon={<Icon size={18} />} delay={i * 0.05} />
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <AttendanceChart />
          <AgendaCard />
        </div>
      </div>
    );
  }

  // ---- Faculty ----
  if (isFaculty) {
    return (
      <div ref={containerRef}>
        <RoleHeader title="Faculty Workspace" description="Your courses, students and academic activities." />
        <div className="mb-6">
          <NoticeStrip userName={userName.split(" ")[0]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <KPIStatCard label="My Courses" value="6" icon={<BookOpen size={18} />} delay={0} />
          <KPIStatCard label="Total Students" value="180" icon={<Users size={18} />} delay={0.05} />
          <KPIStatCard label="Attendance Today" value="92%" icon={<UserCheck size={18} />} delay={0.1} />
          <KPIStatCard label="Pending Grades" value="12" icon={<ClipboardList size={18} />} delay={0.15} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ScheduleCard
            title="Today's Schedule"
            slots={[
              { time: "09:00 - 10:00", course: "Anatomy - I", room: "Lecture Hall A", type: "Lecture" },
              { time: "11:00 - 12:00", course: "Anatomy Lab", room: "Lab 201", type: "Practical" },
              { time: "14:00 - 15:00", course: "Anatomy - I", room: "Lecture Hall A", type: "Tutorial" },
            ]}
          />
          <AgendaCard />
        </div>
      </div>
    );
  }

  // ---- Student ----
  if (isStudent) {
    return (
      <div ref={containerRef}>
        <RoleHeader title={`Welcome back, ${userName}`} description="Your academic overview at a glance." />
        <div className="mb-6">
          <NoticeStrip userName={userName.split(" ")[0]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <KPIStatCard label="CGPA" value="8.5" icon={<TrendingUp size={18} />} delay={0} />
          <KPIStatCard label="Attendance" value="88%" icon={<UserCheck size={18} />} delay={0.05} />
          <KPIStatCard label="Pending Fees" value="৳12,500" icon={<CreditCard size={18} />} delay={0.1} />
          <KPIStatCard label="Library Books" value="3" icon={<BookOpen size={18} />} delay={0.15} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ScheduleCard
            title="Today's Schedule"
            slots={[
              { time: "09:00 - 10:00", course: "Anatomy - I", room: "Lecture Hall A" },
              { time: "11:00 - 12:00", course: "Physiology - I", room: "Lecture Hall B" },
              { time: "14:00 - 15:00", course: "Biochemistry - I", room: "Lab 101" },
            ]}
          />
          <ProgramPerformanceCard />
        </div>
      </div>
    );
  }

  // ---- Staff ----
  if (isStaff) {
    const staffTitle =
      staffSubRole === "doctor" ? "Doctor Workspace"
      : staffSubRole === "nurse" ? "Nurse Workspace"
      : staffSubRole === "guard" ? "Security Workspace"
      : staffSubRole === "warden" ? "Warden Workspace"
      : staffSubRole === "librarian" ? "Library Workspace"
      : "Staff Workspace";

    const staffStats: Stat[] = (staffSubRole === "doctor" || staffSubRole === "nurse") ? [
      { label: "Patients Today", value: "24", icon: Stethoscope },
      { label: "Appointments", value: "18", icon: Calendar },
      { label: "Lab Reports", value: "7", icon: ClipboardList },
      { label: "Prescriptions", value: "15", icon: FileText },
    ] : staffSubRole === "guard" ? [
      { label: "Gate Entries", value: "42", icon: Shield },
      { label: "Visitors", value: "12", icon: Users },
      { label: "Patrols Done", value: "3", icon: Activity },
      { label: "Incidents", value: "1", icon: AlertTriangle },
    ] : staffSubRole === "warden" ? [
      { label: "Rooms Occupied", value: "184", icon: Home },
      { label: "Room Requests", value: "5", icon: Calendar },
      { label: "Maintenance", value: "3", icon: AlertTriangle },
      { label: "Check-outs Today", value: "2", icon: Users },
    ] : [
      { label: "Tasks Today", value: "8", icon: ClipboardList },
      { label: "Leave Balance", value: "12", icon: Calendar },
      { label: "Shift", value: "Day", icon: Clock },
      { label: "Notifications", value: "3", icon: BellRing },
    ];

    return (
      <div ref={containerRef}>
        <RoleHeader title={staffTitle} description="Your daily tasks and activities." />
        <div className="mb-6">
          <NoticeStrip userName={userName.split(" ")[0]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {staffStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <KPIStatCard key={stat.label} label={stat.label} value={stat.value} icon={<Icon size={18} />} delay={i * 0.05} />
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <AttendanceChart />
          <AgendaCard />
        </div>
      </div>
    );
  }

  // ---- Default fallback ----
  return (
    <div ref={containerRef}>
      <RoleHeader
        title={`Welcome back, ${userName}`}
        description="Select a module from the sidebar to get started."
      />
    </div>
  );
}
