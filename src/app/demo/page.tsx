"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  DEMO_ACCOUNTS_ENABLED,
  ALL_DEMO_ACCOUNTS,
  type DemoAccount,
} from "@/config/demoAccounts";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  GraduationCap,
  Copy,
  Check,
  ShieldAlert,
  RefreshCw,
  KeyRound,
  ListOrdered,
} from "lucide-react";

/** Presentation order for the role groups. */
const ROLE_ORDER = [
  "Super Administrator",
  "Domain Administrator",
  "Faculty Member",
  "Student",
  "Staff (Doctor)",
  "Staff (Nurse)",
  "Staff (Librarian)",
  "Staff (Warden)",
  "Staff (Security Guard)",
];

/** A tight script for a live client walkthrough. */
const DEMO_FLOW: { step: string; detail: string }[] = [
  { step: "Start at login", detail: "Show the institutional sign-in and the role selector." },
  { step: "Super Administrator", detail: "Widest dashboard, User Management, Audit Trail, Reports." },
  { step: "Domain Administrator", detail: "Same system, visibly narrower sidebar and scoped dashboard." },
  { step: "Faculty Member", detail: "Mark attendance, open the grading queue, publish grades." },
  { step: "Student", detail: "Own schedule, results, fees and deadlines. Note the view-only banner." },
  { step: "Staff (Doctor)", detail: "Clinical desks: OPD, IPD, Laboratory, Pharmacy." },
  { step: "Switch live", detail: "Use the Demo button in the header to jump between roles in one click." },
  { step: "Close on", detail: "Reports, then Ctrl+K to show navigation across 80+ screens." },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable - ignore
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text transition-colors cursor-pointer"
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

function AccountCard({ acct }: { acct: DemoAccount }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card pad="sm" className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">{acct.roleLabel}</p>
          <p className="text-[11px] text-text-subtle">{acct.persona}</p>
        </div>
        <Badge tone={acct.access === "read-only" ? "warning" : "success"}>
          {acct.access === "read-only" ? "View-Only" : "Full Access"}
        </Badge>
      </div>

      <dl className="text-xs space-y-1 bg-surface-muted border border-border rounded-md px-2.5 py-2">
        <div className="flex items-center gap-2">
          <dt className="text-text-subtle w-14 shrink-0">Email</dt>
          <dd className="text-text font-medium truncate flex-1">{acct.email}</dd>
          <CopyButton value={acct.email} label="email" />
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-text-subtle w-14 shrink-0">Password</dt>
          <dd className={`text-text font-mono flex-1 ${showPassword ? "" : "tracking-widest"}`}>
            {showPassword ? acct.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
          </dd>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium text-primary hover:text-primary-hover cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          <CopyButton value={acct.password} label="password" />
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-text-subtle w-14 shrink-0">Role</dt>
          <dd className="text-text flex-1">
            <span className="font-mono text-[11px]">{acct.role}</span>
            <span className="text-text-subtle text-[10px]"> (select at login)</span>
          </dd>
        </div>
      </dl>

      <ul className="space-y-1">
        {acct.highlights.map((h) => (
          <li key={h} className="text-[11px] text-text-muted flex gap-1.5">
            <span className="text-primary shrink-0" aria-hidden="true">
              &bull;
            </span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function DemoGuidePage() {
  const groups = ROLE_ORDER.map((roleLabel) => ({
    roleLabel,
    accounts: ALL_DEMO_ACCOUNTS.filter((a) => a.roleLabel === roleLabel),
  })).filter((g) => g.accounts.length > 0);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <GraduationCap size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-text">
                EDU-ERP Demo Guide
              </h1>
              <p className="text-[11px] text-text-muted">
                Account list and walkthrough order for client presentations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={DEMO_ACCOUNTS_ENABLED ? "success" : "danger"} dot>
              {DEMO_ACCOUNTS_ENABLED ? "Demo UI enabled" : "Demo UI disabled"}
            </Badge>
            <Link
              href="/login"
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {!DEMO_ACCOUNTS_ENABLED && (
          <Card pad="sm" className="border-danger/40 bg-danger-soft">
            <p className="text-xs text-danger flex gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                This page is rendered but demo accounts are switched off in this build. Set{" "}
                <code className="font-mono">NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true</code> before
                building, or run in development mode, to enable the login panel and the in-app
                role switcher.
              </span>
            </p>
          </Card>
        )}

        {/* How it works */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card pad="sm">
            <div className="flex items-center gap-2 mb-1.5">
              <KeyRound size={14} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-text">Role is part of the credential</h2>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              The backend rejects a sign-in when the role picked in the dropdown does not match the
              account. Use the role in each card below.
            </p>
          </Card>
          <Card pad="sm">
            <div className="flex items-center gap-2 mb-1.5">
              <RefreshCw size={14} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-text">Reseeded on every backend start</h2>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              The seed runs on startup and clears the database first, so a restart gives a clean,
              predictable dataset. Anything created during rehearsal is wiped on restart.
            </p>
          </Card>
          <Card pad="sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ListOrdered size={14} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-text">View-only accounts</h2>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Accounts marked <span className="font-medium">View-Only</span> are blocked from create,
              edit and delete by the backend, with an amber banner in the app. Use them when you do
              not want data touched.
            </p>
          </Card>
        </div>

        {/* Suggested flow */}
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">Suggested walkthrough</h2>
          <Card pad="sm">
            <ol className="grid gap-3 sm:grid-cols-2">
              {DEMO_FLOW.map((item, i) => (
                <li key={item.step} className="flex gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary-soft text-primary text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-text">{item.step}</span>
                    <span className="block text-[11px] text-text-muted leading-relaxed">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* Accounts */}
        <section className="space-y-5">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-text">
              Demo accounts
              <span className="text-text-subtle font-normal"> ({ALL_DEMO_ACCOUNTS.length})</span>
            </h2>
            <p className="text-[11px] text-text-subtle">
              Every account uses the password <code className="font-mono">Demo@123</code> unless
              noted otherwise.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.roleLabel} className="space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {group.roleLabel}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.accounts.map((acct) => (
                  <AccountCard key={acct.key} acct={acct} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <footer className="border-t border-border pt-4 pb-8">
          <p className="text-[11px] text-text-subtle leading-relaxed">
            Generated from <code className="font-mono">src/config/demoAccounts.ts</code>, which is
            also the source for the login demo panel and the header switcher. Keep those three in
            step by editing that one file. Seeded by{" "}
            <code className="font-mono">backend/src/app/seed/index.ts</code>.
          </p>
        </footer>
      </main>
    </div>
  );
}
