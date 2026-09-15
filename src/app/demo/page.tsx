"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  DEMO_ACCOUNTS_ENABLED,
  SHOWCASE_ACCOUNTS,
  type DemoAccount,
} from "@/config/demoAccounts";
import { NAV_SECTIONS, filterSectionsByRole } from "@/config/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  GraduationCap,
  Copy,
  Check,
  ShieldAlert,
  RefreshCw,
  KeyRound,
  Eye,
} from "lucide-react";

/** Presentation order for role groups. */
const ROLE_ORDER = [
  "Super Administrator",
  "Domain Administrator",
  "Faculty Member",
  "Student",
];

/** A tight script for a live client walkthrough. */
const DEMO_FLOW: { step: string; detail: string }[] = [
  { step: "Start at login", detail: "Expand \"Demo credentials\" and click \"Use this account\"." },
  { step: "Super Administrator", detail: "The full institution: all modules, User Management, Audit Trail." },
  { step: "Domain Administrator (faculty)", detail: "Same system, academic-operations powers: onboarding, approvals." },
  { step: "Domain Administrator (finance)", detail: "The money desk: fees ledger, receipts, payroll, budget." },
  { step: "Faculty Member", detail: "Teaching workflow: attendance, grading queue, study materials." },
  { step: "Student", detail: "Personal portal: schedule, fees, results - and the view-only banner." },
  { step: "Switch live", detail: "Use the Demo button in the header to jump between roles instantly." },
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

function AccountCard({
  acct,
  sections,
}: {
  acct: DemoAccount;
  sections: ReturnType<typeof filterSectionsByRole>;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card pad="sm" className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">{acct.roleLabel}</p>
          <p className="text-[11px] text-text-subtle">{acct.persona}</p>
        </div>
        <Badge tone="warning">
          <span className="inline-flex items-center gap-1">
            <Eye size={10} aria-hidden="true" /> View-Only
          </span>
        </Badge>
      </div>

      <dl className="text-xs space-y-1 bg-surface-muted border border-border rounded-md px-2.5 py-2">
        <div className="flex items-center gap-2">
          <dt className="text-text-subtle w-16 shrink-0">Email</dt>
          <dd className="text-text font-medium truncate flex-1">{acct.email}</dd>
          <CopyButton value={acct.email} label="email" />
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-text-subtle w-16 shrink-0">Password</dt>
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
          <dt className="text-text-subtle w-16 shrink-0">Role</dt>
          <dd className="text-text flex-1">
            <span className="font-mono text-[11px]">{acct.role}</span>
            <span className="text-text-subtle text-[10px]"> (must match at login)</span>
          </dd>
        </div>
      </dl>

      {/* Full screen inventory for this role, straight from the nav config. */}
      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
              {section.label}
              <span className="text-text-subtle font-normal"> ({section.items.length})</span>
            </p>
            <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">
              {section.items.map((i) => i.label).join(" \u00b7 ")}
            </p>
          </div>
        ))}
      </div>

      <ul className="space-y-1 border-t border-border pt-2">
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
    accounts: SHOWCASE_ACCOUNTS.filter((a) => a.roleLabel === roleLabel),
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
              <h1 className="text-base font-semibold tracking-tight text-text">EDU-ERP Demo Guide</h1>
              <p className="text-[11px] text-text-muted">
                Five showcase roles, every screen allocated to each, all data seeded
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={DEMO_ACCOUNTS_ENABLED ? "success" : "danger"} dot>
              {DEMO_ACCOUNTS_ENABLED ? "Demo UI enabled" : "Demo UI disabled"}
            </Badge>
            <Link href="/login" className="text-xs font-medium text-primary hover:text-primary-hover">
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
                Demo accounts are switched off in this build. Set{" "}
                <code className="font-mono">NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true</code> before
                building (or run in development mode) to enable the login panel and the header
                switcher.
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
              account. Use the role shown on each card.
            </p>
          </Card>
          <Card pad="sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Eye size={14} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-text">100% view-only demo</h2>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Every showcase account is browse-only: the backend blocks all create, edit and delete
              requests, so nothing the client clicks can change seeded data. Attempting a write
              shows a clear &quot;view-only&quot; message.
            </p>
          </Card>
          <Card pad="sm">
            <div className="flex items-center gap-2 mb-1.5">
              <RefreshCw size={14} className="text-primary" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-text">Always pristine data</h2>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              The backend re-seeds a complete, realistic institution on every start - fees, receipts,
              payroll, OPD/IPD, lab tests, prescriptions, rooms, mess, transport, library and more.
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
                    <span className="block text-[11px] text-text-muted leading-relaxed">{item.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* Accounts with full screen allocation */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-text">
            Demo accounts
            <span className="text-text-subtle font-normal"> ({SHOWCASE_ACCOUNTS.length})</span>
            <span className="text-text-subtle text-[11px] font-normal ml-2">
              screen lists below are exactly what each role sees in the sidebar
            </span>
          </h2>

          {groups.map((group) => (
            <div key={group.roleLabel} className="space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {group.roleLabel}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {group.accounts.map((acct) => (
                  <AccountCard
                    key={acct.key}
                    acct={acct}
                    sections={filterSectionsByRole(NAV_SECTIONS, acct.role)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-[11px] text-text-subtle leading-relaxed">
            Generated live from <code className="font-mono">src/config/demoAccounts.ts</code> and{" "}
            <code className="font-mono">src/config/navigation.ts</code>, the same sources the login
            panel, header switcher and sidebar use - the guide cannot drift from the product. Seeded
            by <code className="font-mono">backend/src/app/seed/index.ts</code>.
          </p>
        </div>
      </footer>
    </div>
  );
}
