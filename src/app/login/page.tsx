"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, UserRole, roleLabels } from "@/store/useAuthStore";
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
  KeyRound,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { auth, sendPasswordResetEmail } from "@/lib/firebase";
import {
  DEMO_ACCOUNTS_ENABLED,
  PRIMARY_DEMO_ACCOUNTS,
  ALL_DEMO_ACCOUNTS,
  type DemoAccount,
} from "@/config/demoAccounts";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Form";
import { Alert } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import axios from "axios";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "super-admin", label: roleLabels["super-admin"] },
  { value: "domain-admin", label: roleLabels["domain-admin"] },
  { value: "faculty", label: roleLabels.faculty },
  { value: "student", label: roleLabels.student },
  { value: "staff", label: roleLabels.staff },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Legacy single-account demo panel. Superseded by the multi-role panel below,
// which is driven by src/config/demoAccounts.ts. Kept for reference.
// const DEMO_ACCOUNT = {
//   role: "Student",
//   displayRole: "Student",
//   email: "demo.student@erp.demo",
//   password: "Demo@123",
//   badge: "View-Only",
// };

export default function LoginPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  // Read the ?error= query param once at mount (client only).
  const [errorMsg, setErrorMsg] = useState(() => {
    if (typeof window === "undefined") return "";
    const error = new URLSearchParams(window.location.search).get("error");
    return error ? decodeURIComponent(error) : "";
  });
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showDemoPass, setShowDemoPass] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showAllDemo, setShowAllDemo] = useState(false);

  /* Demo accounts dropdown (sits directly under the sign-in button). */
  const [demoOpen, setDemoOpen] = useState(false);
  const demoWrapRef = useRef<HTMLDivElement | null>(null);

  const demoAccountsToShow = showAllDemo ? ALL_DEMO_ACCOUNTS : PRIMARY_DEMO_ACCOUNTS;

  /** Fills the sign-in form with a demo account (role included - it is part of the credential). */
  const applyDemoAccount = useCallback((acct: DemoAccount) => {
    setEmail(acct.email);
    setPassword(acct.password);
    setRole(acct.role);
    setErrorMsg("");
    setDemoOpen(false);
  }, []);

  // Close the demo dropdown on Escape.
  useEffect(() => {
    if (!demoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDemoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demoOpen]);



  const copyToClipboard = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard unavailable - ignore
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in all credentials fields.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
      const data = res.data.data;
      loginUser(data.profile, data.token);
      router.push("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message as string | undefined;
        if (status === 404) {
          setErrorMsg("User not found. Contact your system administrator.");
        } else if (status === 401) {
          setErrorMsg(message || "Invalid email or password.");
        } else if (status === 403) {
          setErrorMsg(message || "Account access denied.");
        } else {
          setErrorMsg(message || err.message || "Authentication failed. Please verify credentials.");
        }
      } else {
        setErrorMsg("Authentication failed. Please verify credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Enter your email address first.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setErrorMsg("Unable to send reset email. Please contact your system administrator.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-background px-4 py-8 relative">
      {/* Subtle institutional grid - static, non-decorative noise */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-surface-raised border border-border rounded-xl shadow-md p-6 sm:p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-11 h-11 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3">
              <GraduationCap size={22} aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-text">EDU-ERP</h1>
            <p className="text-xs text-text-muted mt-1">Medical College Administrative Portal</p>
            <Badge tone="primary" className="mt-3" dot>
              Institutional Access
            </Badge>
          </div>

          {errorMsg && (
            <Alert tone="danger" className="mb-5">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={13} aria-hidden="true" />
                {errorMsg}
              </span>
            </Alert>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <FormField label="Portal Access Role" htmlFor="login-role">
              <Select
                id="login-role"
                value={role || "student"}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value ?? ""}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <AnimatePresence mode="wait">
              {!showReset ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <FormField label="Academic Email" htmlFor="login-email">
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </FormField>

                  <FormField label="Password" htmlFor="login-password">
                    <div className="relative">
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <KeyRound size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" aria-hidden="true" />
                    </div>
                  </FormField>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReset(true);
                        setErrorMsg("");
                      }}
                      className="text-[11px] text-primary hover:text-primary-hover font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in to EDU-ERP"}
                  </Button>

                  {/* Demo accounts dropdown - one click fills the form (role is
                      part of the credential). Only rendered when the demo flag
                      is on; see src/config/demoAccounts.ts. */}
                  {DEMO_ACCOUNTS_ENABLED && (
                    <div ref={demoWrapRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setDemoOpen((o) => !o)}
                        aria-expanded={demoOpen}
                        aria-haspopup="dialog"
                        className="w-full flex items-center justify-center gap-1.5 h-10 rounded-md border border-border bg-surface-muted/60 text-xs font-medium text-text-muted hover:text-text hover:border-border-strong transition-colors cursor-pointer"
                      >
                        <Users size={14} aria-hidden="true" />
                        Demo accounts ({ALL_DEMO_ACCOUNTS.length})
                        <motion.span animate={{ rotate: demoOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                          <ChevronDown size={13} aria-hidden="true" />
                        </motion.span>
                      </button>

                      {demoOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setDemoOpen(false)}
                            aria-hidden="true"
                          />
                          <div
                            role="dialog"
                            aria-label="Demo accounts"
                            className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-lg bg-surface-raised border border-border shadow-lg overflow-hidden"
                          >
                            <div className="px-3 py-2 border-b border-border">
                              <p className="text-[11px] font-semibold text-text">Sign in as a demo role</p>
                              <p className="text-[10px] text-text-subtle">
                                Click an account to fill the form - then press Sign in.
                              </p>
                            </div>
                            <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
                              {ALL_DEMO_ACCOUNTS.map((acct, idx) => (
                                <div
                                  key={acct.key}
                                  className="flex items-center gap-1 rounded-md hover:bg-surface-muted transition-colors"
                                >
                                  <button
                                    type="button"
                                    onClick={() => applyDemoAccount(acct)}
                                    className="flex-1 min-w-0 text-left px-2.5 py-2 cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span className="text-[11px] font-semibold text-text truncate">
                                        {acct.roleLabel}
                                      </span>
                                      <Badge tone={acct.access === "read-only" ? "warning" : "success"}>
                                        {acct.access === "read-only" ? "View-Only" : "Full"}
                                      </Badge>
                                    </span>
                                    <span className="block text-[10px] text-text-subtle truncate">
                                      {acct.persona}
                                    </span>
                                    <span className="block text-[11px] text-text-muted truncate">
                                      {acct.email}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(acct.email, idx)}
                                    title="Copy email"
                                    aria-label={`Copy email for ${acct.roleLabel}`}
                                    className="p-1.5 mr-1 rounded-md hover:bg-surface text-text-muted hover:text-text transition-colors cursor-pointer shrink-0"
                                  >
                                    {copiedIdx === idx ? (
                                      <Check size={13} className="text-success" />
                                    ) : (
                                      <Copy size={13} />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 border-t border-border flex items-center justify-between gap-2">
                              <span className="text-[10px] text-text-subtle font-mono">
                                Password: Demo@123
                              </span>
                              <a
                                href="/demo"
                                className="text-[10px] text-primary hover:text-primary-hover font-medium"
                              >
                                Full demo guide
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(false);
                      setResetSent(false);
                      setErrorMsg("");
                    }}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text cursor-pointer"
                  >
                    <ArrowLeft size={13} aria-hidden="true" />
                    Back to sign in
                  </button>

                  {resetSent ? (
                    <div className="text-center py-4 space-y-2">
                      <CheckCircle2 size={34} className="mx-auto text-success" aria-hidden="true" />
                      <p className="text-sm font-semibold text-text">Reset email sent</p>
                      <p className="text-xs text-text-muted">Check your inbox for password reset instructions.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReset(false);
                          setResetSent(false);
                        }}
                        className="text-xs text-primary font-medium hover:text-primary-hover cursor-pointer"
                      >
                        Return to sign in
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-text-muted">
                        Enter your email and we&apos;ll send you a password reset link.
                      </p>
                      <FormField label="Academic Email" htmlFor="reset-email">
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="your@college.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                        />
                      </FormField>
                      <Button type="button" size="lg" className="w-full" loading={isLoading} onClick={handleResetPassword}>
                        {isLoading ? "Sending..." : "Send reset link"}
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* LEGACY bottom accordion demo panel - superseded by the "Demo accounts"
              dropdown under the sign-in button. Kept disabled (not deleted) for
              reference; see src/config/demoAccounts.ts for the gate and list. */}
          {false &&
            DEMO_ACCOUNTS_ENABLED && (
          <div className="mt-6 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              aria-expanded={showDemo}
              className="w-full flex items-center justify-between text-xs font-semibold text-text-muted hover:text-text transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-warning" aria-hidden="true" />
                Demo credentials
                <Badge tone="warning" className="ml-1">Testing only</Badge>
              </span>
              <motion.span animate={{ rotate: showDemo ? 180 : 0 }} transition={{ duration: 0.18 }}>
                <ChevronDown size={14} aria-hidden="true" />
              </motion.span>
            </button>
            <AnimatePresence>
              {showDemo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {/* ------------------------------------------------------------------
                      Legacy single-account demo row. Retained for reference; the
                      multi-role list that replaces it follows immediately below.
                      ------------------------------------------------------------------
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between bg-surface-muted border border-border rounded-md px-3 py-2 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Badge tone="success">{DEMO_ACCOUNT.displayRole}</Badge>
                        <div className="min-w-0 flex-1">
                          <div className="text-text font-medium truncate">{DEMO_ACCOUNT.email}</div>
                          <div className="text-text-muted font-mono flex items-center gap-1">
                            <span className="text-[10px]">Pass:</span>
                            <span className={showDemoPass ? "" : "tracking-widest"}>
                              {showDemoPass ? DEMO_ACCOUNT.password : "••••••••"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(DEMO_ACCOUNT.email, 0)}
                          title="Copy email"
                          aria-label="Copy demo email"
                          className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text transition-colors cursor-pointer"
                        >
                          {copiedIdx === 0 ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(DEMO_ACCOUNT.password, 1)}
                          title="Copy password"
                          aria-label="Copy demo password"
                          className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text transition-colors cursor-pointer"
                        >
                          {copiedIdx === 1 ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDemoPass(!showDemoPass)}
                        className="flex items-center gap-1 text-[10px] text-text-subtle hover:text-text transition-colors cursor-pointer"
                      >
                        {showDemoPass ? <EyeOff size={12} aria-hidden="true" /> : <Eye size={12} aria-hidden="true" />}
                        {showDemoPass ? "Hide" : "Show"} password
                      </button>
                      <span className="text-[10px] text-text-subtle">Select &quot;Student&quot; role from the dropdown</span>
                    </div>
                  </div>
                  */}

                  <div className="pt-3 space-y-2">
                    <p className="text-[10px] text-text-subtle leading-relaxed">
                      Pick an account to fill the form automatically. Each account only works with the
                      role shown on it.
                    </p>

                    {demoAccountsToShow.map((acct, idx) => (
                      <div
                        key={acct.key}
                        className="bg-surface-muted border border-border rounded-md px-3 py-2 text-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Badge tone={acct.access === "read-only" ? "warning" : "success"}>
                            {acct.access === "read-only" ? "View-Only" : "Full"}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <div className="text-text font-medium truncate">{acct.roleLabel}</div>
                            <div className="text-text-subtle text-[10px] truncate">{acct.persona}</div>
                            <div className="text-text-muted truncate mt-0.5">{acct.email}</div>
                            <div className="text-text-muted font-mono flex items-center gap-1">
                              <span className="text-[10px]">Pass:</span>
                              <span className={showDemoPass ? "" : "tracking-widest"}>
                                {showDemoPass ? acct.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                          <button
                            type="button"
                            onClick={() => applyDemoAccount(acct)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-soft text-primary px-2 py-1.5 text-[11px] font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          >
                            <LogIn size={12} aria-hidden="true" />
                            Use this account
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acct.email, idx * 2)}
                            title="Copy email"
                            aria-label={`Copy email for ${acct.roleLabel}`}
                            className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text transition-colors cursor-pointer"
                          >
                            {copiedIdx === idx * 2 ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acct.password, idx * 2 + 1)}
                            title="Copy password"
                            aria-label={`Copy password for ${acct.roleLabel}`}
                            className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text transition-colors cursor-pointer"
                          >
                            {copiedIdx === idx * 2 + 1 ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    ))}

                    {ALL_DEMO_ACCOUNTS.length > PRIMARY_DEMO_ACCOUNTS.length && (
                      <button
                        type="button"
                        onClick={() => setShowAllDemo(!showAllDemo)}
                        className="w-full text-center text-[10px] text-primary hover:text-primary-hover font-medium py-1 cursor-pointer"
                      >
                        {showAllDemo
                          ? "Show fewer accounts"
                          : `Show all ${ALL_DEMO_ACCOUNTS.length} demo accounts`}
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDemoPass(!showDemoPass)}
                        className="flex items-center gap-1 text-[10px] text-text-subtle hover:text-text transition-colors cursor-pointer"
                      >
                        {showDemoPass ? <EyeOff size={12} aria-hidden="true" /> : <Eye size={12} aria-hidden="true" />}
                        {showDemoPass ? "Hide" : "Show"} all passwords
                      </button>
                      <a href="/demo" className="text-[10px] text-primary hover:text-primary-hover font-medium">
                        Full demo guide
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}
        </div>

        <p className="text-center text-[10px] text-text-subtle mt-4 flex items-center justify-center gap-1">
          <Mail size={10} aria-hidden="true" />
          For support contact your system administrator
        </p>
      </motion.div>
    </div>
  );
}