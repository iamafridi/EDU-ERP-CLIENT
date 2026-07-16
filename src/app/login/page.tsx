"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, UserRole, roleLabels } from "@/store/useAuthStore";
import { KeyRound, Mail, UserSquare2, ShieldAlert, ArrowLeft, CheckCircle2, ChevronDown, Copy, Check, Eye, EyeOff } from "lucide-react";
import {
  auth,
  sendPasswordResetEmail,
} from "@/lib/firebase";
import axios from "axios";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "super-admin", label: roleLabels["super-admin"] },
  { value: "domain-admin", label: roleLabels["domain-admin"] },
  { value: "faculty", label: roleLabels.faculty },
  { value: "student", label: roleLabels.student },
  { value: "staff", label: roleLabels.staff },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const DEMO_ACCOUNT = { role: 'Student', displayRole: 'Student', email: 'demo.student@erp.demo', password: 'Demo@123', badge: 'View-Only' };

export default function LoginPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showDemoPass, setShowDemoPass] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) setErrorMsg(decodeURIComponent(error));
  }, []);

  const copyToClipboard = useCallback(async (text: string, idx: number) => {
    try { await navigator.clipboard.writeText(text); } catch {}
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
    } catch (err: any) {
      if (err.response?.status === 404) {
        setErrorMsg("User not found. Contact your system administrator.");
      } else if (err.response?.status === 401) {
        setErrorMsg(err.response.data?.message || "Invalid email or password.");
      } else if (err.response?.status === 403) {
        setErrorMsg(err.response.data?.message || "Account access denied.");
      } else {
        setErrorMsg(err.response?.data?.message || err.message || "Authentication failed. Please verify credentials.");
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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-[#faf8ff] via-[#ededf9] to-[#d3e4fe] relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#2563EB]/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-[#ffffff]/70 backdrop-blur-md border border-[#c3c6d7]/30 shadow-xl rounded-xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 mb-3">
            H
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
            HostelPro ERP
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Medical College Administrative Entrance Portal
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs flex items-center gap-2 font-sans"
          >
            <ShieldAlert size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 font-sans flex items-center gap-1.5">
              <UserSquare2 size={14} /> Portal Access Role
            </label>
            <select
              value={role || "admin"}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-11 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans cursor-pointer"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value ?? ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <AnimatePresence mode="wait">
            {!showReset ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="space-y-1 mt-5">
                  <label className="text-xs font-semibold text-slate-500 font-sans flex items-center gap-1.5">
                    <Mail size={14} /> Academic Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="admin@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans"
                    />
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1 mt-5">
                  <label className="text-xs font-semibold text-slate-500 font-sans flex items-center gap-1.5">
                    <KeyRound size={14} /> Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans"
                    />
                    <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setErrorMsg(""); }}
                    className="text-[11px] text-[#2563EB] hover:text-[#1d4ed8] font-medium mt-1.5 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full h-11 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-5 disabled:opacity-75 disabled:cursor-not-allowed font-sans"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Sign In to ERP"
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setResetSent(false); setErrorMsg(""); }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </button>

                {resetSent ? (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-700">Reset email sent!</p>
                    <p className="text-xs text-slate-400">Check your inbox for password reset instructions.</p>
                    <button
                      type="button"
                      onClick={() => { setShowReset(false); setResetSent(false); }}
                      className="text-xs text-[#2563EB] font-medium hover:text-[#1d4ed8] cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500">Enter your email and we'll send you a password reset link.</p>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-sans"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    <motion.button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-11 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed font-sans"
                    >
                      {isLoading ? (
                        <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        "Send Reset Link"
                      )}
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-6 border-t border-[#c3c6d7]/40 pt-4">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-amber-500" />
              Demo Credentials
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Testing Only</span>
            </span>
            <motion.div animate={{ rotate: showDemo ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showDemo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/60 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="shrink-0 w-16 text-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        {DEMO_ACCOUNT.displayRole}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-slate-600 font-medium truncate">{DEMO_ACCOUNT.email}</div>
                        <div className="text-slate-400 font-mono flex items-center gap-1">
                          <span className="text-[10px]">Pass:</span>
                          <span className={showDemoPass ? '' : 'tracking-widest'}>
                            {showDemoPass ? DEMO_ACCOUNT.password : '••••••••'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(DEMO_ACCOUNT.email, 0)}
                        title="Copy email"
                        className="p-1.5 rounded-md hover:bg-amber-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {copiedIdx === 0 ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(DEMO_ACCOUNT.password, 1)}
                        title="Copy password"
                        className="p-1.5 rounded-md hover:bg-amber-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {copiedIdx === 1 ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDemoPass(!showDemoPass)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showDemoPass ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showDemoPass ? 'Hide' : 'Show'} Password
                    </button>
                    <span className="text-[10px] text-slate-400">Select "Student" role from dropdown</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
