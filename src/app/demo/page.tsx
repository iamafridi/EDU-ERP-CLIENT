"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEMO_ACCOUNTS_ENABLED,
  SHOWCASE_ACCOUNTS,
  type DemoAccount,
} from "@/config/demoAccounts";
import { NAV_SECTIONS, filterSectionsByRole } from "@/config/navigation";
import { useAuthStore, type UserProfile } from "@/store/useAuthStore";
import {
  GraduationCap,
  Copy,
  Check,
  ShieldAlert,
  RefreshCw,
  KeyRound,
  Eye,
  ArrowRight,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

/** Presentation order for role groups. */
const ROLE_ORDER = [
  "Super Administrator",
  "Domain Administrator",
  "Faculty Member",
  "Student",
];

/** Guided walkthrough script for institutional evaluators. */
const DEMO_FLOW: { step: string; detail: string }[] = [
  {
    step: "1. Super Administrator",
    detail: "Complete campus authority: all academic, residential, transport, clinical, and finance suites, plus User Management and Immutable Audit Trail.",
  },
  {
    step: "2. Domain Admin (Academics)",
    detail: "Curriculum planning, semester scheduling, room conflict detection, faculty allocations, and student onboarding approvals.",
  },
  {
    step: "3. Domain Admin (Finance)",
    detail: "The institutional treasury: automated student fee demand batches, double-entry GAAP ledger, voucher approvals, and staff payroll slips.",
  },
  {
    step: "4. Faculty Member",
    detail: "Classroom instruction: live lecture timetables, biometric student attendance marking, grading queues, and study syllabus distribution.",
  },
  {
    step: "5. Student / Resident",
    detail: "Personal campus cockpit: lecture schedules, hostel bed allocation, cafeteria mess card, bus transit passes, and digital out-pass requests.",
  },
  {
    step: "6. Instant Role Switching",
    detail: "Use the live demo launcher or the role switcher in the dashboard header to jump between personas in 1 click.",
  },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}

function AccountCard({
  acct,
  sections,
  onLaunch,
}: {
  acct: DemoAccount;
  sections: ReturnType<typeof filterSectionsByRole>;
  onLaunch: (acct: DemoAccount) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0C0D18]/90 backdrop-blur-xl p-6 flex flex-col justify-between space-y-5 hover:border-violet-500/40 transition-all shadow-xl group">
      <div className="space-y-4">
        {/* Header with Role Badge and View-Only Chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors font-ui truncate">
              {acct.roleLabel}
            </h4>
            <p className="text-xs text-white/50 leading-relaxed font-body mt-0.5">
              {acct.persona}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase font-ui shrink-0">
            <Eye size={11} aria-hidden="true" />
            <span>View-Only</span>
          </span>
        </div>

        {/* Credential Box */}
        <div className="text-xs space-y-2 bg-white/[0.03] border border-white/10 rounded-2xl p-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white/40 w-16 shrink-0 font-ui text-[11px]">Email</span>
            <span className="text-white/90 font-medium truncate flex-1">{acct.email}</span>
            <CopyButton value={acct.email} label="email" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 w-16 shrink-0 font-ui text-[11px]">Password</span>
            <span className={`text-white/90 flex-1 ${showPassword ? "" : "tracking-widest"}`}>
              {showPassword ? acct.password : "••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="px-2 py-0.5 rounded text-[10px] font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            <CopyButton value={acct.password} label="password" />
          </div>
          <div className="flex items-center gap-2 border-t border-white/5 pt-1.5">
            <span className="text-white/40 w-16 shrink-0 font-ui text-[11px]">Scope</span>
            <span className="text-violet-300 font-bold text-[11px] truncate flex-1">
              {acct.role} {acct.key.includes("admin") && acct.key !== "super-admin" ? `(${acct.key})` : ""}
            </span>
          </div>
        </div>

        {/* Screen Inventory */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40 font-ui block">
            Accessible Screen Inventory ({sections.reduce((acc, s) => acc + s.items.length, 0)} total)
          </span>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section.label} className="text-xs">
                <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wide font-ui">
                  {section.label} ({section.items.length}):
                </span>{" "}
                <span className="text-white/60 leading-relaxed">
                  {section.items.map((i) => i.label).join(" • ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5 border-t border-white/10 pt-3">
          {acct.highlights.map((h, idx) => (
            <li key={idx} className="text-xs text-white/70 flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1-Click Instant Launch Button */}
      <div className="pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => onLaunch(acct)}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs font-ui flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/30 border border-violet-400/40 cursor-pointer"
        >
          <Zap size={14} className="text-amber-300" />
          <span>Launch Live Demo as {acct.roleLabel}</span>
          <ArrowRight size={13} className="text-white/80" />
        </button>
      </div>
    </div>
  );
}

export default function DemoGuidePage() {
  const router = useRouter();
  const { login: loginUser } = useAuthStore();

  const handleInstantLaunch = (acct: DemoAccount) => {
    const domainType =
      acct.key === "faculty-admin"
        ? "faculty-admin"
        : acct.key === "finance-admin"
        ? "finance-admin"
        : undefined;

    const fallbackProfile: UserProfile = {
      id: acct.key,
      name: acct.roleLabel,
      email: acct.email,
      role: acct.role,
      isDemo: true,
      domainAdminType: domainType,
    };
    loginUser(fallbackProfile, "mock-demo-session-token");
    router.push("/dashboard");
  };

  const groups = ROLE_ORDER.map((roleLabel) => ({
    roleLabel,
    accounts: SHOWCASE_ACCOUNTS.filter((a) => a.roleLabel === roleLabel),
  })).filter((g) => g.accounts.length > 0);

  return (
    <div className="min-h-screen bg-[#090A10] text-white selection:bg-[#624FDA]/40 selection:text-white pb-24">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0C0D18]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#624FDA] to-[#8C7BE8] text-white flex items-center justify-center shadow-lg shadow-violet-900/40 border border-white/20 shrink-0 font-ui font-black text-sm"
            >
              HP
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-ui">
                  Hostel Pro-ERP Demo Personas &amp; Architecture
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40 font-ui">
                  Interactive Showcase
                </span>
              </div>
              <p className="text-xs text-white/50 font-body">
                Five pre-configured showcase roles with dedicated screen allocations and view-only guardrails.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all font-ui flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Core Principles Bento */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-5 rounded-3xl border border-white/10 bg-[#0C0D18]/90 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={16} className="text-violet-400" aria-hidden="true" />
              <h2 className="text-sm font-bold text-white font-ui">Strict Role Enforced</h2>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-body">
              The platform enforces granular domain boundaries. Wardens only manage dormitories and gate passes; Finance Accountants only manage fee collections and payroll.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0C0D18]/90 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-amber-400" aria-hidden="true" />
              <h2 className="text-sm font-bold text-white font-ui">100% View-Only Protection</h2>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-body">
              All demo sessions are shielded by an immutable read-only guardrail. Evaluators can explore live records without altering seeded institutional records.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-white/10 bg-[#0C0D18]/90 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={16} className="text-emerald-400" aria-hidden="true" />
              <h2 className="text-sm font-bold text-white font-ui">Seeded Institutional Data</h2>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-body">
              Includes pre-populated dormitories, timetables, bus routes, fee receipts, library catalog records, campus clinic appointments, and balance sheets.
            </p>
          </div>
        </div>

        {/* Suggested Walkthrough */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white font-ui flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              <span>Recommended Guided Walkthrough</span>
            </h2>
            <span className="text-xs text-white/40 font-ui">6-Step Evaluation Flow</span>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-[#0C0D18]/90 backdrop-blur-xl">
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_FLOW.map((item, i) => (
                <li key={item.step} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-bold flex items-center justify-center font-ui">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white font-ui mb-1">{item.step}</span>
                    <span className="block text-xs text-white/60 leading-relaxed font-body">{item.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Showcase Personas with 1-Click Launch */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-ui">
                Institutional Personas ({SHOWCASE_ACCOUNTS.length})
              </h2>
              <p className="text-xs text-white/50">
                Click &quot;Launch Live Demo&quot; on any card below to instantly access the dashboard with that persona&apos;s permissions.
              </p>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.roleLabel} className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-violet-400 font-ui">
                {group.roleLabel}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {group.accounts.map((acct) => (
                  <AccountCard
                    key={acct.key}
                    acct={acct}
                    sections={filterSectionsByRole(NAV_SECTIONS, acct.role)}
                    onLaunch={handleInstantLaunch}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 mt-16 pt-8 text-center text-xs text-white/40">
        <p>
          Hostel Pro-ERP • Institutional Operating System for Residential Campuses, Colleges, &amp; Universities
        </p>
      </footer>
    </div>
  );
}
