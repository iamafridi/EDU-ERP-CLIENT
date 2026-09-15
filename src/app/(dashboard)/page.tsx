"use client";

import React, { useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Users, GraduationCap, BookOpen, Home, BellRing, UserCheck,
  CreditCard, DollarSign, Stethoscope, Calendar, ClipboardList,
  AlertTriangle, TrendingUp, Clock, FileText, Shield, Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Feedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const DashboardCharts = dynamic(() => import("@/components/dashboard/DashboardCharts"), {
  loading: () => <div className="h-64 bg-surface-muted rounded-lg animate-pulse" />,
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

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={<Icon size={18} aria-hidden="true" />} />
        );
      })}
    </div>
  );
}

function QuickActionsGrid({ actions, className = "" }: { actions: Action[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2.5 ${className}`}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2.5 px-3 py-3 rounded-md border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-colors group"
          >
            <span className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Icon size={15} aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-text group-hover:text-primary">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ScheduleCard({ title, slots }: { title: string; slots: { time: string; course: string; room: string; type?: string }[] }) {
  return (
    <Card pad="md">
      <h3 className="text-sm font-semibold text-text mb-3">{title}</h3>
      <div className="space-y-2">
        {slots.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-md bg-surface-muted/60 border border-border">
            <span className="w-16 text-[10px] font-mono font-medium text-text-muted tabular-nums shrink-0">{slot.time}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-text truncate">{slot.course}</span>
              <span className="block text-[10px] text-text-muted truncate">
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
  return (
    <Card pad="none" className="overflow-hidden">
      <div className="border-b border-border bg-surface-muted/50 px-5 py-4">
        <PageHeader
          title={title}
          description={description}
          eyebrow="Dashboard"
          actions={context}
        />
      </div>
    </Card>
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

  const totalStudents = findMetric("Total Students") ?? 1240;
  const totalFaculty = findMetric("Total Faculty") ?? 84;
  const totalCourses = findMetric("Total Courses") ?? 32;
  const totalRooms = findMetric("Total Rooms") ?? 200;
  const occupiedRooms = findMetric("Occupied Rooms") ?? 184;

  const isSuperAdmin = roleIs("super-admin");
  const isDomainAdmin = roleIs("domain-admin");
  const isFaculty = roleIs("faculty");
  const isStudent = roleIs("student");
  const isStaff = roleIs("staff");

  const domainType = user?.domainAdminType;
  const staffSubRole = user?.staffSubRole;

  const userName = user?.name || "User";
  const stagger = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, duration: 0.3 } },
  };

  const containerProps = reduced
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: stagger,
      };

  // ---- Super Admin ----
  if (isSuperAdmin) {
    return (
      <div ref={containerRef} {...containerProps}>
        <RoleHeader
          title="Institution Overview"
          description="System-wide health, enrollment, occupancy and operational signals."
          context={<StatusBadge status="operational" />}
        />
        <motion.div variants={{ show: { y: 0, opacity: 1 } }} className="mt-4 space-y-6">
          <StatGrid
            stats={[
              { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users },
              { label: "Faculty Members", value: totalFaculty.toString(), icon: GraduationCap },
              { label: "Courses", value: totalCourses.toString(), icon: BookOpen },
              { label: "Hostel Occupancy", value: `${Math.round((occupiedRooms / totalRooms) * 100)}%`, icon: Home },
            ]}
          />

          {/* Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card pad="md">
              <h3 className="text-xs font-semibold text-text mb-3 flex items-center gap-2">
                <Activity size={14} className="text-success" aria-hidden="true" /> System Health
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Backend API", status: "Operational" },
                  { label: "Database", status: "Operational" },
                  { label: "RabbitMQ", status: "Operational" },
                  { label: "Redis Cache", status: "Operational" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{item.label}</span>
                    <StatusBadge status={item.status.toLowerCase()} />
                  </div>
                ))}
              </div>
            </Card>

            <Card pad="md">
              <h3 className="text-xs font-semibold text-text mb-3 flex items-center gap-2">
                <Users size={14} className="text-primary" aria-hidden="true" /> User Distribution
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Students", count: 1240, pct: "78%" },
                  { label: "Faculty", count: 84, pct: "5%" },
                  { label: "Staff", count: 156, pct: "10%" },
                  { label: "Admins", count: 12, pct: "1%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{item.label}</span>
                    <span className="font-mono font-medium text-text tabular-nums">
                      {item.count} <span className="text-text-subtle">({item.pct})</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card pad="md">
              <h3 className="text-xs font-semibold text-text mb-3 flex items-center gap-2">
                <Shield size={14} className="text-warning" aria-hidden="true" /> Security Alerts
              </h3>
              <div className="space-y-2.5">
                <Alert tone="warning" title="3 failed login attempts">
                  Last hour - review the audit log.
                </Alert>
                <Alert tone="info" title="Demo mode active">
                  Write operations are restricted.
                </Alert>
              </div>
            </Card>
          </div>

          <Card pad="lg">
            <DashboardCharts />
          </Card>

          <Card pad="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text">Quick Actions</h3>
              <Badge tone="neutral">Admin</Badge>
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
      { label: "Total Revenue", value: "₹28.5L", icon: DollarSign },
      { label: "Pending Fees", value: "₹4.5L", icon: CreditCard },
      { label: "Monthly Payroll", value: "₹12.8L", icon: FileText },
      { label: "Expenses", value: "₹8.2L", icon: TrendingUp },
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
      { label: "Faculty", value: totalFaculty.toString(), icon: GraduationCap },
      { label: "Courses", value: totalCourses.toString(), icon: BookOpen },
      { label: "Departments", value: "12", icon: Home },
    ];

    const domainActions: Action[] = domainType === "finance-admin" ? [
      { label: "Fee Collection", href: "/fees", icon: CreditCard },
      { label: "Payroll", href: "/payroll", icon: DollarSign },
      { label: "Expenses", href: "/expenses", icon: TrendingUp },
      { label: "Reports", href: "/reports", icon: FileText },
    ] : domainType === "medical-admin" ? [
      { label: "OPD", href: "/opd", icon: Stethoscope },
      { label: "IPD", href: "/ipd", icon: Home },
      { label: "Laboratory", href: "/laboratory", icon: ClipboardList },
      { label: "Pharmacy", href: "/pharmacy", icon: Activity },
    ] : domainType === "staff-admin" ? [
      { label: "Staff Directory", href: "/staff", icon: Users },
      { label: "Leave", href: "/leave", icon: Calendar },
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
      { label: "Security", href: "/security", icon: Shield },
    ] : [
      { label: "Students", href: "/students", icon: Users },
      { label: "Courses", href: "/courses", icon: BookOpen },
      { label: "Attendance", href: "/attendance", icon: UserCheck },
      { label: "Exams", href: "/exams", icon: ClipboardList },
    ];

    return (
      <div ref={containerRef} {...containerProps}>
        <RoleHeader title={domainTitle} description="Overview of your domain operations." />
        <motion.div variants={{ show: { y: 0, opacity: 1 } }} className="mt-4 space-y-6">
          <StatGrid stats={domainStats} />
          <Card pad="md">
            <h3 className="text-sm font-semibold text-text mb-3">Quick Actions</h3>
            <QuickActionsGrid actions={domainActions} />
          </Card>
          <Card pad="lg">
            <DashboardCharts />
          </Card>
        </motion.div>
      </div>
    );
  }

  // ---- Faculty ----
  if (isFaculty) {
    return (
      <div ref={containerRef} {...containerProps}>
        <RoleHeader title="Faculty Workspace" description="Your courses, students and academic activities." />
        <motion.div variants={{ show: { y: 0, opacity: 1 } }} className="mt-4 space-y-6">
          <StatGrid
            stats={[
              { label: "My Courses", value: "6", icon: BookOpen },
              { label: "Total Students", value: "180", icon: Users },
              { label: "Attendance Today", value: "92%", icon: UserCheck },
              { label: "Pending Grades", value: "12", icon: ClipboardList },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ScheduleCard
              title="Today's Schedule"
              slots={[
                { time: "09:00 - 10:00", course: "Anatomy - I", room: "Lecture Hall A", type: "Lecture" },
                { time: "11:00 - 12:00", course: "Anatomy Lab", room: "Lab 201", type: "Practical" },
                { time: "14:00 - 15:00", course: "Anatomy - I", room: "Lecture Hall A", type: "Tutorial" },
              ]}
            />
            <Card pad="md">
              <h3 className="text-sm font-semibold text-text mb-3">Quick Actions</h3>
              <QuickActionsGrid
                actions={[
                  { label: "Mark Attendance", href: "/attendance", icon: UserCheck },
                  { label: "Enter Grades", href: "/exams", icon: ClipboardList },
                  { label: "My Courses", href: "/courses", icon: BookOpen },
                  { label: "Timetable", href: "/timetable", icon: Calendar },
                ]}
              />
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- Student ----
  if (isStudent) {
    return (
      <div ref={containerRef} {...containerProps}>
        <RoleHeader title={`Welcome back, ${userName}`} description="Your academic overview at a glance." />
        <motion.div variants={{ show: { y: 0, opacity: 1 } }} className="mt-4 space-y-6">
          <StatGrid
            stats={[
              { label: "CGPA", value: "8.5", icon: TrendingUp },
              { label: "Attendance", value: "88%", icon: UserCheck },
              { label: "Pending Fees", value: "₹12,500", icon: CreditCard },
              { label: "Library Books", value: "3", icon: BookOpen },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ScheduleCard
              title="Today's Schedule"
              slots={[
                { time: "09:00 - 10:00", course: "Anatomy - I", room: "Lecture Hall A" },
                { time: "11:00 - 12:00", course: "Physiology - I", room: "Lecture Hall B" },
                { time: "14:00 - 15:00", course: "Biochemistry - I", room: "Lab 101" },
              ]}
            />
            <Card pad="md">
              <h3 className="text-sm font-semibold text-text mb-3">Quick Actions</h3>
              <QuickActionsGrid
                actions={[
                  { label: "My Grades", href: "/exams", icon: ClipboardList },
                  { label: "Fee Payment", href: "/fees", icon: CreditCard },
                  { label: "Leave Request", href: "/leave", icon: Calendar },
                  { label: "Grievance", href: "/grievances", icon: AlertTriangle },
                ]}
              />
            </Card>
          </div>
        </motion.div>
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

    const staffActions: Action[] = (staffSubRole === "doctor" || staffSubRole === "nurse") ? [
      { label: "Health Center", href: "/health-center", icon: Stethoscope },
      { label: "OPD", href: "/opd", icon: Activity },
      { label: "IPD", href: "/ipd", icon: Home },
      { label: "Laboratory", href: "/laboratory", icon: ClipboardList },
    ] : staffSubRole === "guard" ? [
      { label: "Security", href: "/security", icon: Shield },
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
      { label: "Gate Entry", href: "/security/new?type=gate", icon: Users },
      { label: "Patrol Log", href: "/security/new?type=patrol", icon: Activity },
    ] : staffSubRole === "warden" ? [
      { label: "Rooms", href: "/rooms", icon: Home },
      { label: "Mess", href: "/mess", icon: Activity },
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
      { label: "Grievances", href: "/grievances", icon: AlertTriangle },
    ] : [
      { label: "Attendance", href: "/attendance", icon: UserCheck },
      { label: "Leave", href: "/leave", icon: Calendar },
      { label: "Library", href: "/library", icon: BookOpen },
      { label: "Payroll", href: "/payroll", icon: DollarSign },
    ];

    return (
      <div ref={containerRef} {...containerProps}>
        <RoleHeader title={staffTitle} description="Your daily tasks and activities." />
        <motion.div variants={{ show: { y: 0, opacity: 1 } }} className="mt-4 space-y-6">
          <StatGrid stats={staffStats} />
          <Card pad="md">
            <h3 className="text-sm font-semibold text-text mb-3">Quick Actions</h3>
            <QuickActionsGrid actions={staffActions} />
          </Card>
        </motion.div>
      </div>
    );
  }

  // ---- Default fallback ----
  return (
    <div ref={containerRef} {...containerProps}>
      <RoleHeader
        title={`Welcome back, ${userName}`}
        description="Select a module from the sidebar to get started."
      />
    </div>
  );
}