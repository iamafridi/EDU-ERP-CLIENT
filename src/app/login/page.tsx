"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, UserRole, roleLabels, type UserProfile } from "@/store/useAuthStore";
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogIn,
  Users,
  Sparkles,
  BedDouble,
  Receipt,
  Activity,
  ShieldCheck,
  UserPlus,
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
import { GeometricLogo } from "@/components/landing/LandingHeader";
import { createDemoSessionToken } from "@/lib/mockJwt";
import axios from "axios";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "super-admin", label: roleLabels["super-admin"] },
  { value: "domain-admin", label: roleLabels["domain-admin"] },
  { value: "faculty", label: roleLabels.faculty },
  { value: "student", label: roleLabels.student },
  { value: "staff", label: roleLabels.staff },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);

  // Tab: "signin" | "signup"
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(() => {
    if (typeof window === "undefined") return "";
    const error = new URLSearchParams(window.location.search).get("error");
    return error ? decodeURIComponent(error) : "";
  });

  // Password reset state
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Demo accounts dropdown state
  const [demoOpen, setDemoOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const demoWrapRef = useRef<HTMLDivElement | null>(null);

  // Sign up / Request access state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regDepartment, setRegDepartment] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("faculty");
  const [regId, setRegId] = useState("");
  const [regSubmitted, setRegSubmitted] = useState(false);

  /** Fills the sign-in form with a demo account */
  const applyDemoAccount = useCallback((acct: DemoAccount) => {
    setEmail(acct.email);
    setPassword(acct.password);
    setRole(acct.role);
    setErrorMsg("");
    setDemoOpen(false);
  }, []);

  /** Instant 1-click launch into the dashboard as a demo persona */
  const instantDemoLogin = useCallback((acct: DemoAccount) => {
    setIsLoading(true);
    setErrorMsg("");
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
    loginUser(
      fallbackProfile,
      createDemoSessionToken(acct.role, acct.email)
    );
    router.push("/dashboard");
  }, [loginUser, router]);

  // Close demo dropdown on Escape
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
      // clipboard unavailable
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
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const isNetworkError = !err.response || err.code === "ERR_NETWORK";
        const status = err.response?.status;
        const message = err.response?.data?.message as string | undefined;

        // Check if credentials match any showcase institutional demo persona
        const matchingDemo = ALL_DEMO_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase()
        );

        // If credentials match a demo persona and backend is offline, unseeded (404), or returned error:
        if (matchingDemo && (password === matchingDemo.password || password === "Demo@123")) {
          const domainType =
            matchingDemo.key === "faculty-admin"
              ? "faculty-admin"
              : matchingDemo.key === "finance-admin"
              ? "finance-admin"
              : matchingDemo.key === "medical-admin"
              ? "medical-admin"
              : matchingDemo.key === "staff-admin"
              ? "staff-admin"
              : undefined;

          const staffRole =
            matchingDemo.role === "staff"
              ? (matchingDemo.key as any)
              : undefined;

          const fallbackProfile: UserProfile = {
            id: matchingDemo.key,
            name: matchingDemo.roleLabel,
            email: matchingDemo.email,
            role: matchingDemo.role,
            isDemo: true,
            domainAdminType: domainType,
            staffSubRole: staffRole,
          };
          loginUser(
            fallbackProfile,
            createDemoSessionToken(matchingDemo.role, matchingDemo.email)
          );
          router.push("/dashboard");
          return;
        }

        if (status === 404) {
          setErrorMsg("User not found. Use one of the Quick Demo Personas below to test the platform.");
        } else if (status === 401) {
          setErrorMsg(message || "Invalid email or password.");
        } else if (status === 403) {
          setErrorMsg(message || "Account access denied.");
        } else {
          setErrorMsg(
            message ||
              (isNetworkError
                ? "Backend server is unreachable. Please select a Demo Account from the quick-switch bar below to test the platform."
                : err.message)
          );
        }
      } else {
        setErrorMsg("Authentication failed. Please verify credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regInstitution) {
      setErrorMsg("Please provide your name, institutional email, and college name.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRegSubmitted(true);
    }, 700);
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
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#FCFBF9] px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-[#F1EFFF] blur-3xl rounded-full" />
      </div>

      {/* Main Split Authentication Shell */}
      <div className="w-full max-w-5xl rounded-3xl border border-[#E9EAF3] bg-white shadow-2xl shadow-[#151D32]/8 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* ─── Left Column: Calm Luxury Showcase Panel ─── */}
        <div className="lg:col-span-5 bg-[#151D32] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-20">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#624FDA] blur-3xl" />
          </div>

          <div>
            {/* Top Brand Link with geometric HP mark */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-9 h-9 rounded-xl bg-[#624FDA] flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="text-white font-black text-sm tracking-tight font-ui">HP</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[14px] font-extrabold text-white tracking-wide font-ui">
                  HOSTEL PRO-ERP
                </span>
                <span className="text-[9px] text-white/50 uppercase tracking-[0.14em] font-ui mt-0.5">
                  Unified Campus Operating System
                </span>
              </div>
            </Link>

            <div className="space-y-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C39A5A] text-[10px] font-extrabold uppercase tracking-widest font-ui">
                <ShieldCheck size={12} />
                Cluster Status: Operational
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal font-display leading-tight text-white">
                Run your campus with <span className="italic text-[#8C7BE8]">clarity</span>.
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-body">
                Access student lifecycle registries, hostel dorm allocations, GPS bus dispatch,
                double-entry finance, automated class timetables, and campus clinics from one secure terminal.
              </p>
            </div>

            {/* 3 Live Mini Telemetry Cards */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8C7BE8]/20 text-[#8C7BE8] flex items-center justify-center">
                    <BedDouble size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-ui">Teaching Hospital Beds</div>
                    <div className="text-[10px] text-white/50">354 of 400 active • 88.5%</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#5E9B7D] bg-[#5E9B7D]/20 px-2 py-0.5 rounded-full font-ui">
                  Live
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5E9B7D]/20 text-[#5E9B7D] flex items-center justify-center">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-ui">General Ledger Balance</div>
                    <div className="text-[10px] text-white/50">99.98% GAAP Reconciled</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#5E9B7D] bg-[#5E9B7D]/20 px-2 py-0.5 rounded-full font-ui">
                  Zero Errors
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C39A5A]/20 text-[#C39A5A] flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-ui">Daily Outpatient Census</div>
                    <div className="text-[10px] text-white/50">1,420+ medicos &amp; patients</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#C39A5A] bg-[#C39A5A]/20 px-2 py-0.5 rounded-full font-ui">
                  Nominal
                </span>
              </div>
            </div>
          </div>

          {/* Footer of Left Column */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
            <span>NMC &amp; NAAC Certified</span>
            <span>TLS 1.3 Encrypted</span>
          </div>
        </div>

        {/* ─── Right Column: Tabbed Form (Sign In / Register) ─── */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Navigation Links & Tab Switcher */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E9EAF3] mb-6">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FCFBF9] border border-[#E9EAF3]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("signin");
                    setErrorMsg("");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-ui flex items-center gap-1.5 ${
                    authTab === "signin"
                      ? "bg-white text-[#151D32] shadow-xs border border-[#E9EAF3]"
                      : "text-[#7D8799] hover:text-[#151D32]"
                  }`}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("signup");
                    setErrorMsg("");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-ui flex items-center gap-1.5 ${
                    authTab === "signup"
                      ? "bg-white text-[#151D32] shadow-xs border border-[#E9EAF3]"
                      : "text-[#7D8799] hover:text-[#151D32]"
                  }`}
                >
                  <UserPlus size={13} />
                  <span>Request Access</span>
                </button>
              </div>

              <Link
                href="/"
                className="text-xs font-bold text-[#7D8799] hover:text-[#624FDA] flex items-center gap-1 font-ui"
              >
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <Alert tone="danger" className="mb-5">
                <span className="flex items-center gap-1.5 text-xs">
                  <ShieldAlert size={14} className="shrink-0" />
                  {errorMsg}
                </span>
              </Alert>
            )}

            {/* ─── TAB 1: SIGN IN ─── */}
            {authTab === "signin" && !showReset && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Quick Persona Fast-Bar */}
                <div className="p-3.5 rounded-2xl bg-[#FCFBF9] border border-[#E9EAF3]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7D8799] font-ui">
                      Quick Demo Personas:
                    </span>
                    <span className="text-[10px] text-[#624FDA] font-bold">1-Click Auto-Fill or Instant Launch</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_DEMO_ACCOUNTS.map((acct) => (
                      <div
                        key={acct.key}
                        className="inline-flex items-center rounded-lg border border-[#E9EAF3] bg-white overflow-hidden shadow-2xs hover:border-[#624FDA]/40 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => applyDemoAccount(acct)}
                          title={`Fill form with ${acct.roleLabel}`}
                          className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer font-ui flex items-center gap-1.5 ${
                            email === acct.email && role === acct.role
                              ? "bg-[#624FDA] text-white"
                              : "text-[#151D32] hover:bg-[#FCFBF9]"
                          }`}
                        >
                          <span>{acct.roleLabel}</span>
                          {email === acct.email && role === acct.role && (
                            <Check size={11} className="text-white" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => instantDemoLogin(acct)}
                          title={`Instant Launch into Dashboard as ${acct.roleLabel}`}
                          className="px-2 py-1 text-[10px] font-bold bg-[#F1EFFF] text-[#624FDA] hover:bg-[#624FDA] hover:text-white transition-colors cursor-pointer border-l border-[#E9EAF3] flex items-center gap-0.5"
                        >
                          <span>⚡</span>
                          <span className="hidden sm:inline">Launch</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <FormField label="Portal Role" htmlFor="login-role">
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
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D8799] hover:text-[#151D32] cursor-pointer p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </FormField>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#7D8799] font-mono">
                      Demo Pass: <span className="font-bold text-[#151D32]">Demo@123</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReset(true)}
                      className="text-[11px] text-[#624FDA] hover:underline font-semibold cursor-pointer font-ui"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-[#624FDA] hover:bg-[#523ec2] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#624FDA]/20 font-ui flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                  >
                    {isLoading ? "Signing in..." : "Sign in to Hostel Pro-ERP"}
                  </button>

                  {/* Demo Accounts Full Selector Dropdown */}
                  {DEMO_ACCOUNTS_ENABLED && (
                    <div ref={demoWrapRef} className="relative pt-1">
                      <button
                        type="button"
                        onClick={() => setDemoOpen(!demoOpen)}
                        className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#E9EAF3] bg-[#FCFBF9] text-xs font-semibold text-[#7D8799] hover:text-[#151D32] hover:border-[#624FDA]/30 transition-colors cursor-pointer font-ui"
                      >
                        <Users size={14} className="text-[#624FDA]" />
                        <span>All Pre-Seeded Institutional Personas ({ALL_DEMO_ACCOUNTS.length})</span>
                        <ChevronDown size={14} className={demoOpen ? "rotate-180 transition-transform" : ""} />
                      </button>

                      {demoOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setDemoOpen(false)}
                            aria-hidden="true"
                          />
                          <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl bg-white border border-[#E9EAF3] shadow-2xl p-2 max-h-72 overflow-y-auto divide-y divide-[#E9EAF3]">
                            {ALL_DEMO_ACCOUNTS.map((acct, idx) => (
                              <div
                                key={acct.key}
                                className="p-2.5 flex items-center justify-between gap-2 hover:bg-[#FCFBF9] rounded-xl transition-colors"
                              >
                                <button
                                  type="button"
                                  onClick={() => applyDemoAccount(acct)}
                                  className="text-left flex-1 min-w-0 cursor-pointer"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-[#151D32] truncate">
                                      {acct.roleLabel}
                                    </span>
                                    <span className="text-[9px] font-bold text-[#624FDA] uppercase px-1.5 py-0.5 rounded bg-[#F1EFFF]">
                                      {acct.role}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#7D8799] truncate mt-0.5">
                                    {acct.email}
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(acct.email, idx)}
                                  title="Copy email"
                                  className="p-1.5 rounded-lg hover:bg-[#E9EAF3] text-[#7D8799] hover:text-[#151D32] cursor-pointer shrink-0"
                                >
                                  {copiedIdx === idx ? (
                                    <Check size={13} className="text-[#5E9B7D]" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </form>
              </motion.div>
            )}

            {/* ─── TAB 2: REQUEST ACCESS / SIGN UP ─── */}
            {authTab === "signup" && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {!regSubmitted ? (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <p className="text-xs text-[#7D8799] leading-relaxed font-body">
                      Request an institutional account for your campus or educational institution.
                      Our provost office approves access within 2 hours.
                    </p>

                    <FormField label="Full Name & Title" htmlFor="reg-name">
                      <Input
                        id="reg-name"
                        placeholder="Dr. Rajesh Ramanathan"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Institutional / Campus Email" htmlFor="reg-email">
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="director@campus.edu"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Institution / University" htmlFor="reg-inst">
                        <Input
                          id="reg-inst"
                          placeholder="Global Institute of Technology & Campus"
                          value={regInstitution}
                          onChange={(e) => setRegInstitution(e.target.value)}
                          required
                        />
                      </FormField>

                      <FormField label="Department / Unit" htmlFor="reg-dept">
                        <Input
                          id="reg-dept"
                          placeholder="Academic Affairs / Hostel Admin"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Requested Role" htmlFor="reg-role">
                        <Select
                          id="reg-role"
                          value={regRole || "faculty"}
                          onChange={(e) => setRegRole(e.target.value as UserRole)}
                        >
                          <option value="faculty">Faculty / Professor</option>
                          <option value="student">Student / Resident</option>
                          <option value="domain-admin">Department / Hostel Administrator</option>
                          <option value="staff">Staff / Transit Coordinator</option>
                        </Select>
                      </FormField>

                      <FormField label="Council / Employee Reg No." htmlFor="reg-id">
                        <Input
                          id="reg-id"
                          placeholder="MCI-88912"
                          value={regId}
                          onChange={(e) => setRegId(e.target.value)}
                        />
                      </FormField>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-[#624FDA] hover:bg-[#523ec2] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#624FDA]/20 font-ui flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                    >
                      {isLoading ? "Submitting Request..." : "Submit Access Application"}
                    </button>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#EAF5F0] text-center space-y-3">
                    <CheckCircle2 size={36} className="text-[#5E9B7D] mx-auto" />
                    <h3 className="text-base font-bold text-[#151D32] font-ui">
                      Application Submitted Successfully
                    </h3>
                    <p className="text-xs text-[#7D8799] leading-relaxed font-body">
                      We have sent verification instructions to <span className="font-bold text-[#151D32]">{regEmail}</span>.
                      In the meantime, you can explore all modules immediately with our pre-configured Demo Roles.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("signin");
                        setRegSubmitted(false);
                      }}
                      className="mt-2 h-10 px-5 bg-[#624FDA] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Return to Sign In &amp; Use Demo Persona
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── FORGOT PASSWORD MODAL ─── */}
            {showReset && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false);
                    setResetSent(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#7D8799] hover:text-[#151D32] cursor-pointer font-ui"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>

                {resetSent ? (
                  <div className="p-6 rounded-2xl bg-[#EAF5F0] text-center space-y-3">
                    <CheckCircle2 size={36} className="text-[#5E9B7D] mx-auto" />
                    <h3 className="text-base font-bold text-[#151D32] font-ui">Reset Link Dispatched</h3>
                    <p className="text-xs text-[#7D8799] leading-relaxed">
                      Check your inbox at <span className="font-bold text-[#151D32]">{email}</span> for instructions.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReset(false);
                        setResetSent(false);
                      }}
                      className="h-9 px-4 bg-[#624FDA] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#151D32] font-ui">Reset Password</h3>
                    <p className="text-xs text-[#7D8799]">
                      Enter your registered institutional email to receive a password reset link.
                    </p>
                    <FormField label="Academic Email" htmlFor="reset-email">
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your.email@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </FormField>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleResetPassword}
                      className="w-full h-11 bg-[#624FDA] hover:bg-[#523ec2] text-white font-bold rounded-xl text-sm transition-all duration-200 font-ui cursor-pointer"
                    >
                      {isLoading ? "Sending..." : "Send Password Reset Link"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Bottom Security / Support note */}
          <div className="mt-8 pt-4 border-t border-[#E9EAF3] flex items-center justify-between text-[11px] text-[#7D8799]">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#5E9B7D]" />
              <span>TLS 1.3 End-to-End Encrypted</span>
            </span>
            <Link href="/demo" className="text-[#624FDA] hover:underline font-semibold font-ui">
              Demo Documentation Guide &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}