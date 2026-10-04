"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCompanyStore } from "@/store/useCompanyStore";
import {
  ShoppingBag,
  DollarSign,
  Users,
  GraduationCap,
  Truck,
  Stethoscope,
  Home,
  Building2,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Sparkles,
  Building,
  Shield,
  Activity,
  CheckCircle2,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SuiteCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  badge?: string;
  metrics: { label: string; value: string; alert?: boolean }[];
  sublinks: { label: string; href: string }[];
  requiredModule?: string;
}

const SUITES: SuiteCard[] = [
  {
    id: "procurement",
    title: "Procurement & Sourcing",
    description: "Purchase requisitions, sealed RFQs, vendor tenders, and automated 3-way matching.",
    icon: ShoppingBag,
    href: "/procurement",
    badge: "14 Pending POs",
    metrics: [
      { label: "Active Requisitions", value: "28" },
      { label: "Pending Approvals", value: "৳48,200", alert: true },
    ],
    sublinks: [
      { label: "Requisitions", href: "/procurement" },
      { label: "Purchase Orders", href: "/procurement" },
      { label: "Store Inventory", href: "/procurement" },
    ],
  },
  {
    id: "accounting",
    title: "Finance & Accounting",
    description: "Double-entry FOAPAL ledger, student bursar accounts, subledgers, and multi-entity consolidation.",
    icon: DollarSign,
    href: "/accounting/chart-of-accounts",
    metrics: [
      { label: "Unbalanced Vouchers", value: "0" },
      { label: "Fee Realization", value: "92.4%" },
    ],
    sublinks: [
      { label: "Chart of Accounts", href: "/accounting/chart-of-accounts" },
      { label: "Journal Entries", href: "/accounting/journals" },
      { label: "Trial Balance", href: "/accounting/reports" },
      { label: "Student Fees", href: "/fees" },
    ],
  },
  {
    id: "hr",
    title: "HR & Faculty Affairs",
    description: "Faculty tenure dossiers, clinical XYZ compensation, multi-company payroll, and staff rosters.",
    icon: Users,
    href: "/faculties",
    metrics: [
      { label: "Active Employees", value: "642" },
      { label: "Tenure Reviews", value: "8 Pending" },
    ],
    sublinks: [
      { label: "Faculty Directory", href: "/faculties" },
      { label: "Staff Roster", href: "/staff" },
      { label: "Payroll Run", href: "/payroll" },
      { label: "Leave Requests", href: "/leave" },
    ],
  },
  {
    id: "academics",
    title: "Academics, CoE & Classroom++",
    description: "Curriculum mapping, CoE examination vaults, Socratic stream, and virtual patient simulator.",
    icon: GraduationCap,
    href: "/lms",
    badge: "Session Spring 2026",
    metrics: [
      { label: "Active Terms", value: "8 Semesters" },
      { label: "Socratic Ingestions", value: "Active" },
    ],
    sublinks: [
      { label: "Classroom++ Hub", href: "/lms" },
      { label: "Course Catalog", href: "/courses" },
      { label: "Exams & CoE", href: "/exams" },
      { label: "Transcripts", href: "/transcripts" },
    ],
  },
  {
    id: "scm",
    title: "Supply Chain & Fleet",
    description: "Multi-tier central warehouses, batch/expiry FEFO tracking, and campus motor pool dispatch.",
    icon: Truck,
    href: "/transport",
    metrics: [
      { label: "Low Stock SKUs", value: "6 Critical", alert: true },
      { label: "Fleet in Transit", value: "12 Vehicles" },
    ],
    sublinks: [
      { label: "Central Store", href: "/procurement" },
      { label: "Campus Transport", href: "/transport" },
      { label: "Vehicle Fleet", href: "/transport" },
    ],
  },
  {
    id: "clinical",
    title: "Clinical & Hospital",
    description: "OPD token queues, IPD beds & ICU census, diagnostic lab LIS, telemedicine, and blood bank.",
    icon: Stethoscope,
    href: "/opd",
    requiredModule: "clinical",
    metrics: [
      { label: "ICU Occupancy", value: "88.4%" },
      { label: "Blood Units", value: "112 Stored" },
    ],
    sublinks: [
      { label: "OPD Clinics", href: "/opd" },
      { label: "IPD Wards", href: "/ipd" },
      { label: "Laboratory", href: "/laboratory" },
      { label: "Blood Bank", href: "/blood-bank" },
      { label: "Telemedicine", href: "/telemedicine" },
    ],
  },
  {
    id: "hostels",
    title: "Campus Life, Hostels & IoT",
    description: "HostelPro room allotment, mess dining, smart turnstiles, and IoT telemetry monitors.",
    icon: Home,
    href: "/rooms",
    metrics: [
      { label: "Bed Occupancy", value: "94.2%" },
      { label: "Curfew Delays", value: "4 Today", alert: true },
    ],
    sublinks: [
      { label: "Dorms & Rooms", href: "/rooms" },
      { label: "Mess & Meals", href: "/mess" },
      { label: "Security Turnstiles", href: "/security" },
      { label: "IoT Sensors", href: "/iot" },
    ],
  },
  {
    id: "governance",
    title: "Central Governance & Compliance",
    description: "NAAC/NMC accreditation compliance, board minutes, disciplinary inquiry, and audit logs.",
    icon: Building2,
    href: "/accreditation",
    metrics: [
      { label: "Accreditation", value: "NAAC A+" },
      { label: "Audit ATR Items", value: "100% Cleared" },
    ],
    sublinks: [
      { label: "Accreditation", href: "/accreditation" },
      { label: "Disciplinary", href: "/disciplinary" },
      { label: "Audit Trail", href: "/audit" },
      { label: "Reports Desk", href: "/reports" },
    ],
  },
];

export default function SwitchboardPage() {
  const { activeCompany, companies, isConsolidated, setActiveCompany, setConsolidatedView } = useCompanyStore();
  const [search, setSearch] = useState("");

  const filteredSuites = SUITES.filter((suite) => {
    if (suite.requiredModule && activeCompany?.enabledModules) {
      if (!activeCompany.enabledModules.includes(suite.requiredModule)) return false;
    }
    if (search.trim()) {
      return (
        suite.title.toLowerCase().includes(search.toLowerCase()) ||
        suite.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Executive Command Header */}
      <div className="bg-surface-navy rounded-2xl p-6 sm:p-7 text-on-primary border border-surface-navy-secondary shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-gold uppercase tracking-widest font-bold">
                Chapter 12 • Executive Switchboard & Launchpad Hub
              </span>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-on-navy tracking-tight">
              Enterprise Multi-Company Switchboard
            </h1>
            <p className="text-xs sm:text-sm text-text-on-navy-muted leading-relaxed">
              Consolidated operational cockpit managing universities, teaching hospitals, central supply chain entities, and hostel foundations across the conglomerate.
            </p>
          </div>

          {/* Active Company Selector */}
          <div className="bg-surface-navy-secondary/90 p-3.5 rounded-xl border border-white/10 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs text-text-on-navy-muted">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Active Institutional Entity:</span>
              {isConsolidated ? (
                <span className="text-gold font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-gold/15">CONSOLIDATED</span>
              ) : (
                <span className="text-emerald-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/15">ISOLATED</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={isConsolidated ? "ALL" : activeCompany?.id || ""}
                onChange={(e) => {
                  if (e.target.value === "ALL") {
                    setConsolidatedView();
                  } else {
                    const match = companies.find((c) => c.id === e.target.value);
                    if (match) setActiveCompany(match);
                  }
                }}
                className="bg-surface-navy text-text-on-navy text-xs font-medium rounded-lg px-3 py-2 border border-white/15 focus:border-gold focus:outline-none cursor-pointer w-64"
              >
                <option value="ALL">🏢 Consolidated Group View (All Entities)</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search functional workspaces (e.g. Accounting, CoE)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border rounded-xl focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Active Context:</span>
          <strong className="text-text font-ui">
            {isConsolidated ? "All Entities (Holding Group)" : activeCompany?.name}
          </strong>
        </div>
      </div>

      {/* Grid of 8 Functional Suite Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredSuites.map((suite) => {
          const Icon = suite.icon;
          return (
            <Card
              key={suite.id}
              pad="md"
              hoverable
              className="flex flex-col justify-between border-border transition-all duration-300 hover:border-gold group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gold-soft text-gold flex items-center justify-center border border-gold/20 group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>
                  {suite.badge && (
                    <Badge tone="warning" className="text-[10px]">
                      {suite.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-text font-display group-hover:text-gold transition-colors">
                    {suite.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                    {suite.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                  {suite.metrics.map((m, idx) => (
                    <div key={idx} className="p-2 bg-background rounded-lg border border-border/40">
                      <span className="text-[10px] text-text-subtle block truncate">{m.label}</span>
                      <span className={`text-xs font-bold tabular-nums font-mono ${m.alert ? "text-warning" : "text-text"}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sublinks & Launch Action */}
              <div className="mt-4 pt-3 border-t border-border space-y-2.5">
                <div className="flex flex-wrap gap-1">
                  {suite.sublinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      href={sub.href}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-surface-muted text-text-muted hover:text-primary hover:bg-primary-soft transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>

                <Link
                  href={suite.href}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-xl bg-surface-muted hover:bg-gold hover:text-white transition-colors text-text"
                >
                  <span>Launch Workspace</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
