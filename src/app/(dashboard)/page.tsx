"use client";

import React, { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Users, GraduationCap, BookOpen, Home, BellRing, UserCheck,
  CreditCard, DollarSign, Stethoscope, Calendar, ClipboardList,
  AlertTriangle, TrendingUp, Clock, FileText, Shield, Activity
} from "lucide-react";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
import Link from "next/link";

const DashboardCharts = dynamic(() => import("@/components/dashboard/DashboardCharts"), {
  loading: () => <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />,
  ssr: false,
});

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { roleIs, can } = usePermission();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: dashboardRes } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });
  const metrics = (dashboardRes?.metrics || []) as { label: string; value: number }[];
  const findMetric = (label: string) => metrics.find((m) => m.label === label)?.value;

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".dashboard-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

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

  // Super Admin Dashboard
  if (isSuperAdmin) {
    return (
      <div ref={containerRef} className="space-y-8 font-sans">
        <div className="dashboard-card bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] p-6 rounded-xl text-white">
          <h2 className="text-xl font-bold">Super Admin Dashboard</h2>
          <p className="text-sm text-blue-100 mt-1">Complete system overview and management control.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Faculty Members", value: totalFaculty.toString(), icon: GraduationCap, color: "bg-emerald-50 text-emerald-600" },
            { label: "Courses", value: totalCourses.toString(), icon: BookOpen, color: "bg-amber-50 text-amber-600" },
            { label: "Hostel Occupancy", value: `${Math.round((occupiedRooms / totalRooms) * 100)}%`, icon: Home, color: "bg-purple-50 text-purple-600" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> System Health
            </h3>
            <div className="space-y-3">
              {[
                { label: "Backend API", status: "Operational", color: "text-emerald-600" },
                { label: "Database", status: "Operational", color: "text-emerald-600" },
                { label: "RabbitMQ", status: "Operational", color: "text-emerald-600" },
                { label: "Redis Cache", status: "Operational", color: "text-emerald-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Users size={14} className="text-blue-500" /> User Distribution
            </h3>
            <div className="space-y-3">
              {[
                { label: "Students", count: 1240, pct: "78%" },
                { label: "Faculty", count: 84, pct: "5%" },
                { label: "Staff", count: 156, pct: "10%" },
                { label: "Admins", count: 12, pct: "1%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-mono font-semibold text-slate-800">{item.count} <span className="text-slate-400">({item.pct})</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Shield size={14} className="text-amber-500" /> Security Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border-l-2 border-amber-500 rounded text-xs">
                <span className="font-semibold text-slate-700 block">3 Failed Login Attempts</span>
                <span className="text-slate-400">Last hour — review audit log</span>
              </div>
              <div className="p-3 bg-blue-50 border-l-2 border-blue-500 rounded text-xs">
                <span className="font-semibold text-slate-700 block">Demo Mode Active</span>
                <span className="text-slate-400">Write operations restricted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card bg-white border border-[#e1e2ed] rounded-xl shadow-sm p-6">
          <DashboardCharts />
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Register Student", href: "/students/register", icon: Users, color: "bg-blue-50 text-blue-600" },
              { label: "User Management", href: "/users", icon: Shield, color: "bg-purple-50 text-purple-600" },
              { label: "Audit Trail", href: "/audit", icon: FileText, color: "bg-amber-50 text-amber-600" },
              { label: "Settings", href: "/settings", icon: Activity, color: "bg-slate-50 text-slate-600" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}
                  className="p-4 bg-slate-50 hover:bg-[#2563EB]/5 border border-slate-200 hover:border-[#2563EB]/30 rounded-lg flex items-center gap-3 group transition-all">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#2563EB]">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Domain Admin Dashboard
  if (isDomainAdmin) {
    const domainTitle = domainType === "faculty-admin" ? "Faculty Admin"
      : domainType === "finance-admin" ? "Finance Admin"
      : domainType === "medical-admin" ? "Medical Admin"
      : domainType === "staff-admin" ? "Staff Admin"
      : "Domain Admin";

    const domainStats = domainType === "finance-admin" ? [
      { label: "Total Revenue", value: "₹28.5L", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
      { label: "Pending Fees", value: "₹4.5L", icon: CreditCard, color: "bg-amber-50 text-amber-600" },
      { label: "Monthly Payroll", value: "₹12.8L", icon: FileText, color: "bg-blue-50 text-blue-600" },
      { label: "Expenses", value: "₹8.2L", icon: TrendingUp, color: "bg-red-50 text-red-600" },
    ] : domainType === "medical-admin" ? [
      { label: "OPD Visits Today", value: "47", icon: Stethoscope, color: "bg-blue-50 text-blue-600" },
      { label: "IPD Patients", value: "23", icon: Home, color: "bg-purple-50 text-purple-600" },
      { label: "Lab Tests Pending", value: "12", icon: ClipboardList, color: "bg-amber-50 text-amber-600" },
      { label: "Prescriptions", value: "34", icon: FileText, color: "bg-emerald-50 text-emerald-600" },
    ] : domainType === "staff-admin" ? [
      { label: "Active Staff", value: "156", icon: Users, color: "bg-blue-50 text-blue-600" },
      { label: "Leave Requests", value: "8", icon: Calendar, color: "bg-amber-50 text-amber-600" },
      { label: "Incidents Open", value: "3", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
      { label: "Shifts Today", value: "4", icon: Clock, color: "bg-emerald-50 text-emerald-600" },
    ] : [
      { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "bg-blue-50 text-blue-600" },
      { label: "Faculty", value: totalFaculty.toString(), icon: GraduationCap, color: "bg-emerald-50 text-emerald-600" },
      { label: "Courses", value: totalCourses.toString(), icon: BookOpen, color: "bg-amber-50 text-amber-600" },
      { label: "Departments", value: "12", icon: Home, color: "bg-purple-50 text-purple-600" },
    ];

    const domainActions = domainType === "finance-admin" ? [
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
      <div ref={containerRef} className="space-y-8 font-sans">
        <div className="dashboard-card bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] p-6 rounded-xl text-white">
          <h2 className="text-xl font-bold">{domainTitle} Dashboard</h2>
          <p className="text-sm text-blue-100 mt-1">Overview of your domain operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {domainStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-card bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {domainActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}
                  className="p-4 bg-slate-50 hover:bg-[#2563EB]/5 border border-slate-200 hover:border-[#2563EB]/30 rounded-lg flex items-center gap-3 group transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#2563EB]">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="dashboard-card bg-white border border-[#e1e2ed] rounded-xl shadow-sm p-6">
          <DashboardCharts />
        </div>
      </div>
    );
  }

  // Faculty Dashboard
  if (isFaculty) {
    return (
      <div ref={containerRef} className="space-y-8 font-sans">
        <div className="dashboard-card bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-xl text-white">
          <h2 className="text-xl font-bold">Faculty Dashboard</h2>
          <p className="text-sm text-emerald-100 mt-1">Your courses, students, and academic activities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "My Courses", value: "6", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
            { label: "Total Students", value: "180", icon: Users, color: "bg-emerald-50 text-emerald-600" },
            { label: "Attendance Today", value: "92%", icon: UserCheck, color: "bg-amber-50 text-amber-600" },
            { label: "Pending Grades", value: "12", icon: ClipboardList, color: "bg-purple-50 text-purple-600" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Today&apos;s Schedule</h3>
            <div className="space-y-3">
              {[
                { time: "09:00 - 10:00", course: "Anatomy - I", room: "Lecture Hall A", type: "Lecture" },
                { time: "11:00 - 12:00", course: "Anatomy Lab", room: "Lab 201", type: "Practical" },
                { time: "14:00 - 15:00", course: "Anatomy - I", room: "Lecture Hall A", type: "Tutorial" },
              ].map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-16 text-[10px] font-mono font-semibold text-slate-500">{slot.time}</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700">{slot.course}</p>
                    <p className="text-[10px] text-slate-400">{slot.room} · {slot.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Mark Attendance", href: "/attendance", icon: UserCheck },
                { label: "Enter Grades", href: "/exams", icon: ClipboardList },
                { label: "My Courses", href: "/courses", icon: BookOpen },
                { label: "Timetable", href: "/timetable", icon: Calendar },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg flex items-center gap-2 group transition-all">
                    <Icon size={16} className="text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  if (isStudent) {
    return (
      <div ref={containerRef} className="space-y-8 font-sans">
        <div className="dashboard-card bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
          <h2 className="text-xl font-bold">Student Dashboard</h2>
          <p className="text-sm text-purple-100 mt-1">Welcome back, {user?.name || "Student"}! Here&apos;s your academic overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "CGPA", value: "8.5", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
            { label: "Attendance", value: "88%", icon: UserCheck, color: "bg-blue-50 text-blue-600" },
            { label: "Pending Fees", value: "₹12,500", icon: CreditCard, color: "bg-amber-50 text-amber-600" },
            { label: "Library Books", value: "3", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Today&apos;s Schedule</h3>
            <div className="space-y-3">
              {[
                { time: "09:00 - 10:00", course: "Anatomy - I", room: "Lecture Hall A" },
                { time: "11:00 - 12:00", course: "Physiology - I", room: "Lecture Hall B" },
                { time: "14:00 - 15:00", course: "Biochemistry - I", room: "Lab 101" },
              ].map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-16 text-[10px] font-mono font-semibold text-slate-500">{slot.time}</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-700">{slot.course}</p>
                    <p className="text-[10px] text-slate-400">{slot.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "My Grades", href: "/exams", icon: ClipboardList },
                { label: "Fee Payment", href: "/fees", icon: CreditCard },
                { label: "Leave Request", href: "/leave", icon: Calendar },
                { label: "Grievance", href: "/grievances", icon: AlertTriangle },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}
                    className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg flex items-center gap-2 group transition-all">
                    <Icon size={16} className="text-slate-400 group-hover:text-purple-600" />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-purple-700">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Staff Dashboard
  if (isStaff) {
    const staffTitle = staffSubRole === "doctor" ? "Doctor Dashboard"
      : staffSubRole === "nurse" ? "Nurse Dashboard"
      : staffSubRole === "guard" ? "Security Dashboard"
      : staffSubRole === "warden" ? "Warden Dashboard"
      : staffSubRole === "librarian" ? "Librarian Dashboard"
      : "Staff Dashboard";

    return (
      <div ref={containerRef} className="space-y-8 font-sans">
        <div className="dashboard-card bg-gradient-to-r from-amber-600 to-amber-700 p-6 rounded-xl text-white">
          <h2 className="text-xl font-bold">{staffTitle}</h2>
          <p className="text-sm text-amber-100 mt-1">Your daily tasks and activities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(staffSubRole === "doctor" || staffSubRole === "nurse" ? [
            { label: "Patients Today", value: "24", icon: Stethoscope, color: "bg-blue-50 text-blue-600" },
            { label: "Appointments", value: "18", icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
            { label: "Lab Reports", value: "7", icon: ClipboardList, color: "bg-amber-50 text-amber-600" },
            { label: "Prescriptions", value: "15", icon: FileText, color: "bg-purple-50 text-purple-600" },
          ] : staffSubRole === "guard" ? [
            { label: "Gate Entries", value: "42", icon: Shield, color: "bg-blue-50 text-blue-600" },
            { label: "Visitors", value: "12", icon: Users, color: "bg-emerald-50 text-emerald-600" },
            { label: "Patrols Done", value: "3", icon: Activity, color: "bg-amber-50 text-amber-600" },
            { label: "Incidents", value: "1", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
          ] : staffSubRole === "warden" ? [
            { label: "Rooms Occupied", value: "184", icon: Home, color: "bg-blue-50 text-blue-600" },
            { label: "Room Requests", value: "5", icon: Calendar, color: "bg-amber-50 text-amber-600" },
            { label: "Maintenance", value: "3", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
            { label: "Check-outs Today", value: "2", icon: Users, color: "bg-emerald-50 text-emerald-600" },
          ] : [
            { label: "Tasks Today", value: "8", icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
            { label: "Leave Balance", value: "12", icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
            { label: "Shift", value: "Day", icon: Clock, color: "bg-amber-50 text-amber-600" },
            { label: "Notifications", value: "3", icon: BellRing, color: "bg-purple-50 text-purple-600" },
          ]).map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="dashboard-card bg-white border border-[#e1e2ed] p-5 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1 font-mono">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-card bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(staffSubRole === "doctor" || staffSubRole === "nurse" ? [
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
            ]).map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}
                  className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg flex items-center gap-2 group transition-all">
                  <Icon size={16} className="text-slate-400 group-hover:text-amber-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-amber-700">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default Dashboard (fallback)
  return (
    <div ref={containerRef} className="space-y-8 font-sans">
      <div className="dashboard-card bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Welcome back, {user?.name || "User"}!
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          HostelPro Medical ERP Dashboard. Select a module from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
