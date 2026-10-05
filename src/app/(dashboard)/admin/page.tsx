"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Building2,
  Receipt,
  Layers,
  Settings,
  Activity,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Server,
  Lock,
  ChevronRight,
  Sparkles,
  Bed,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/components/dashboard/ToastFeedback";

interface MetricCard {
  title: string;
  value: string;
  subValue: string;
  icon: React.ElementType;
  trend: string;
  positive: boolean;
}

const METRICS: MetricCard[] = [
  {
    title: "Enrolled Students",
    value: "2,845",
    subValue: "Across 6 Academic Years",
    icon: Users,
    trend: "+8.4% this session",
    positive: true,
  },
  {
    title: "Faculty & Clinicians",
    value: "312",
    subValue: "18 Clinical & Pre-Clinical Depts",
    icon: Building2,
    trend: "100% Verified Credentials",
    positive: true,
  },
  {
    title: "GAAP Total Reserves",
    value: "৳ 48.6M",
    subValue: "BDT Institutional Holdings",
    icon: Receipt,
    trend: "+12.1% YoY Collections",
    positive: true,
  },
  {
    title: "Hostel Occupancy",
    value: "94.8%",
    subValue: "1,142 / 1,205 Beds Allocated",
    icon: Bed,
    trend: "63 Dorm Rooms Pending Inspection",
    positive: false,
  },
];

const ADMIN_MODULES = [
  {
    title: "Executive Switchboard",
    description: "Real-time dispatch console for campus wardens, superintendents & deans.",
    href: "/switchboard",
    icon: Layers,
    badge: "Operational",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    title: "User Management & RBAC",
    description: "Assign security clearances, grant roles, and monitor authentication sessions.",
    href: "/users",
    icon: Users,
    badge: "15 Roles Active",
    badgeColor: "bg-gold/10 text-gold border-gold/20",
  },
  {
    title: "Institutional Audit Trail",
    description: "Cryptographically verifiable ledger of administrative state changes and mutations.",
    href: "/audit",
    icon: FileText,
    badge: "GAAP Compliant",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    title: "Chart of Accounts & Ledger",
    description: "Manage GAAP 4-digit chart of accounts, vouchers, balance sheets, and journal batches.",
    href: "/accounting/chart-of-accounts",
    icon: Receipt,
    badge: "Double-Entry",
    badgeColor: "bg-gold/10 text-gold border-gold/20",
  },
  {
    title: "System Configuration",
    description: "Manage semester calendar cutoffs, hostel curfew triggers, and fee schedule rates.",
    href: "/settings",
    icon: Settings,
    badge: "v2.4.0 Engine",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    title: "IoT & Campus Telemetry",
    description: "Monitor biometric turnstiles, dormitory smart power meters, and cold-chain vaccine units.",
    href: "/iot",
    icon: Server,
    badge: "Live Telemetry",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
];

const RECENT_AUDIT_LOGS = [
  {
    id: "AUD-9821",
    action: "Updated Fee Schedule for MBBS Year 4",
    user: "Super Admin (Principal Office)",
    time: "8 mins ago",
    status: "Committed",
    level: "success",
  },
  {
    id: "AUD-9820",
    action: "Dispatched Night Curfew Roll Call to Hostel 3",
    user: "Chief Warden",
    time: "24 mins ago",
    status: "Verified",
    level: "success",
  },
  {
    id: "AUD-9819",
    action: "Posted Double-Entry Journal Entry JRN-2026-00412",
    user: "Bursar Finance Team",
    time: "1 hour ago",
    status: "Audited",
    level: "success",
  },
  {
    id: "AUD-9818",
    action: "Role Clearance Escalation: Staff -> Domain Admin",
    user: "Super Admin",
    time: "3 hours ago",
    status: "Cryptographically Signed",
    level: "warning",
  },
];

export default function AdminConsolePage() {
  const { user } = useAuthStore();
  const [purgingCache, setPurgingCache] = useState(false);

  const handleSystemCachePurge = () => {
    setPurgingCache(true);
    setTimeout(() => {
      setPurgingCache(false);
      showToast({
        title: "System Cache Flushed",
        description: "Institutional schema, permissions map, and telemetry cache refreshed successfully.",
        variant: "success",
      });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-2xl bg-surface-navy border border-gold/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono font-medium">
              <ShieldCheck size={14} className="text-gold" />
              <span>SUPER ADMIN CLEARANCE LEVEL ALPHA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-text-on-navy tracking-tight">
              Executive Administration Mission Control
            </h1>
            <p className="text-sm text-text-on-navy/70 font-ui leading-relaxed">
              Consolidated governance for Hostel Pro Enterprise ERP. Oversee double-entry ledgers,
              campus access security, academic registers, and real-time student telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSystemCachePurge}
              disabled={purgingCache}
              className="px-4 py-2.5 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 text-xs font-semibold font-ui transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Activity size={14} className={purgingCache ? "animate-spin" : ""} />
              <span>{purgingCache ? "Purging Telemetry..." : "Flush ERP Cache"}</span>
            </button>
            <Link
              href="/switchboard"
              className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-on-gold text-xs font-semibold font-ui transition-all duration-200 shadow-md shadow-gold/20 flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Open Switchboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Institutional Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="rounded-2xl bg-surface border border-border p-5 shadow-xs hover:border-gold/30 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-subtle font-ui">{metric.title}</span>
                <div className="p-2 rounded-xl bg-surface-muted text-gold group-hover:bg-gold/10 transition-colors">
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-text font-serif tracking-tight">{metric.value}</p>
                <p className="text-xs text-text-subtle font-ui mt-0.5">{metric.subValue}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-medium font-ui">
                <TrendingUp
                  size={13}
                  className={metric.positive ? "text-emerald-500" : "text-amber-500"}
                />
                <span className={metric.positive ? "text-emerald-600" : "text-amber-600"}>
                  {metric.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Governance Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-text">Core Governance Desks</h2>
            <p className="text-xs text-text-subtle font-ui">
              Direct access into institutional operations, fiscal controls, and infrastructure
            </p>
          </div>
          <Link
            href="/switchboard"
            className="text-xs font-semibold text-gold hover:text-gold-hover font-ui flex items-center gap-1 group"
          >
            <span>View All Desks</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADMIN_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group rounded-2xl bg-surface border border-border p-5 shadow-xs hover:border-gold/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-surface-muted group-hover:bg-gold/10 text-gold transition-colors">
                      <Icon size={20} />
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${mod.badgeColor}`}
                    >
                      {mod.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-text group-hover:text-gold transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-text-muted font-ui mt-1 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-text-subtle group-hover:text-gold transition-colors">
                  <span>Enter Module</span>
                  <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Telemetry & Recent Audited Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Telemetry Health */}
        <div className="rounded-2xl bg-surface border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-text">Hostel Pro Engine Health</h3>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
          </div>

          <div className="space-y-3 font-ui text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted/50 border border-border">
              <span className="text-text-muted">GAAP Double-Entry Ledger</span>
              <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Balanced
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted/50 border border-border">
              <span className="text-text-muted">Biometric Turnstile Latency</span>
              <span className="font-mono text-text font-semibold">18ms</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted/50 border border-border">
              <span className="text-text-muted">Role Dispatcher (RBAC)</span>
              <span className="font-mono text-gold font-semibold">Strict (L5 Guard)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted/50 border border-border">
              <span className="text-text-muted">Active Session Tokens</span>
              <span className="font-mono text-text font-semibold">419 users</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-navy text-text-on-navy text-xs space-y-2 border border-gold/20">
            <div className="flex items-center gap-2 text-gold font-semibold">
              <Lock size={14} />
              <span>Cryptographic Immutability</span>
            </div>
            <p className="text-[11px] text-text-on-navy/70 leading-relaxed">
              Every financial voucher and grade moderation is logged with SHA-256 state hashes in the
              institutional immutable audit trail.
            </p>
          </div>
        </div>

        {/* Recent Audit Trail Feed */}
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-serif text-text">Recent Institutional Mutations</h3>
              <p className="text-xs text-text-subtle font-ui">Immutable administrative transaction log</p>
            </div>
            <Link
              href="/audit"
              className="text-xs font-semibold text-gold hover:text-gold-hover font-ui flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {RECENT_AUDIT_LOGS.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-text-subtle font-semibold px-1.5 py-0.5 rounded bg-surface-muted border border-border">
                      {item.id}
                    </span>
                    <p className="text-xs font-semibold text-text font-ui">{item.action}</p>
                  </div>
                  <p className="text-[11px] text-text-subtle font-ui">
                    Initiated by <span className="font-medium text-text-muted">{item.user}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {item.status}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-text-subtle font-ui mt-1">
                    <Clock size={10} />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
