"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuthStore, type UserProfile, type UserRole, type DomainAdminType } from "@/store/useAuthStore";
import { createDemoSessionToken } from "@/lib/mockJwt";
import { useToast } from "./ToastFeedback";

export interface DemoPersona {
  key: string;
  role: UserRole;
  roleLabel: string;
  name: string;
  email: string;
  password: string;
  domainAdminType?: DomainAdminType;
  staffSubRole?: string;
  category: string;
  tagline: string;
  highlights: string[];
  icon: typeof ShieldCheck;
  color: string;
  badgeBg: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    key: "super-admin",
    role: "super-admin",
    roleLabel: "Super Administrator",
    name: "System Provost / Administrator",
    email: "super.admin@college.edu",
    password: "Demo@123",
    category: "Master Governance",
    tagline: "Unrestricted access across all 150+ operational screens & 94 backend modules",
    highlights: [
      "Enterprise audit trail, cryptographic logs & system settings",
      "User creation, deletion & institutional role assignments",
      "Full academic, clinical, residential, transport & financial ledger desks",
      "Database snapshot & recovery controls",
    ],
    icon: ShieldCheck,
    color: "from-violet-500 to-indigo-600",
    badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  {
    key: "finance-admin",
    role: "domain-admin",
    roleLabel: "Finance Domain Admin",
    name: "Chief Financial Officer (CFO)",
    email: "finance.admin@college.edu",
    password: "Demo@123",
    domainAdminType: "finance-admin",
    category: "Finance & Accounts",
    tagline: "GAAP double-entry engine, student credit tuition & institutional payroll",
    highlights: [
      "5-Tier Chart of Accounts, Journal Vouchers & Trial Balance",
      "Orbound student credit billing & fee breakdown engine",
      "Money receipts generator, bank reconciliations & payroll runs",
      "Departmental budgets, expense claims & procurement PO/GRN matching",
    ],
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    key: "faculty-admin",
    role: "domain-admin",
    roleLabel: "Academic Domain Admin",
    name: "Dean of Academic Affairs",
    email: "faculty.admin@college.edu",
    password: "Demo@123",
    domainAdminType: "faculty-admin",
    category: "Academics & Curricula",
    tagline: "Curriculum pathways, course catalog, admissions & faculty allocation",
    highlights: [
      "Conflict-free timetable generation & lecture room mapping",
      "Student pre-advising prerequisite validation & approvals",
      "Midterm & final exam scheduling with hall ticket seating",
      "Grading curves, GPA/CGPA computation & official transcripts",
    ],
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-600",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    key: "faculty",
    role: "faculty",
    roleLabel: "Faculty Member / Teacher",
    name: "Dr. Julian Sterling (Associate Professor)",
    email: "j.sterling@college.edu",
    password: "Demo@123",
    category: "Teaching & Classroom",
    tagline: "Daily class schedule, Google Classroom LMS stream & grading queue",
    highlights: [
      "Interactive class routine grid & student roll-call attendance",
      "Course stream announcements & syllabus lecture attachments",
      "Assignment grading queue with rubric scoring & private feedback",
      "Timed online quiz assessments with auto-evaluation",
    ],
    icon: GraduationCap,
    color: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    key: "student",
    role: "student",
    roleLabel: "Undergraduate Student",
    name: "Marcus Chen (CSE Major)",
    email: "demo.student@erp.demo",
    password: "Demo@123",
    category: "Student Experience",
    tagline: "Orbound credit ledger, course advising, LMS submissions & hostel bed",
    highlights: [
      "Orbound financial tracker: per-credit tuition, advising fees, dues vs extra paid",
      "Online course selection, prerequisite checking & class routine view",
      "Google Classroom LMS assignments, digital dropbox & quiz taking",
      "Hostel bed status, mess dining token QR & digital gate pass",
    ],
    icon: Users,
    color: "from-purple-500 to-pink-600",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    key: "staff-warden",
    role: "staff",
    roleLabel: "Hostel Warden / Logistics",
    name: "Manoj Singh (Hall Superintendent)",
    email: "manoj.s@college.edu",
    password: "Demo@123",
    staffSubRole: "warden",
    category: "Campus Logistics",
    tagline: "3D dormitory bed matrix, gate out-pass scanner & dining mess hall",
    highlights: [
      "Multi-block dormitory room & bed occupancy matrix",
      "Security gate pass scanner with barcode/QR verification",
      "Dining hall RFID/QR meal token checkout counter",
      "Facility maintenance repair work-orders & curfew logs",
    ],
    icon: Briefcase,
    color: "from-rose-500 to-red-600",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
];

interface TryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TryDemoModal({ isOpen, onClose }: TryDemoModalProps) {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [launchingKey, setLaunchingKey] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleLaunch = (persona: DemoPersona) => {
    setLaunchingKey(persona.key);
    const profile: UserProfile = {
      id: persona.key,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      isDemo: true,
      domainAdminType: persona.domainAdminType,
      staffSubRole: persona.staffSubRole as any,
    };
    const token = createDemoSessionToken(persona.role || "student", persona.email);
    loginUser(profile, token);
    showToast(`Authenticated as ${persona.roleLabel}. Entering terminal...`);
    setTimeout(() => {
      onClose();
      router.push("/dashboard");
    }, 450);
  };

  const handleCopy = (persona: DemoPersona, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Email: ${persona.email}\nPassword: ${persona.password}\nRole: ${persona.role}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(persona.key);
    showToast(`Credentials for ${persona.roleLabel} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-5xl rounded-3xl border border-white/15 bg-[#0A0C16] shadow-2xl shadow-black/90 p-5 sm:p-8 text-white max-h-[90vh] overflow-y-auto my-auto"
            role="dialog"
            aria-modal="true"
          >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
          aria-label="Close demo modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#624FDA]/20 border border-[#624FDA]/40 text-xs font-bold text-[#8C7BE8] uppercase tracking-wider font-ui mb-3">
            <Sparkles size={13} />
            <span>Interactive Demo Environment • Read-Only Sandbox</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-white font-display tracking-tight mb-2">
            Select an Institutional Persona
          </h2>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-body">
            Explore Hostel Pro-ERP from the exact lens of each stakeholder. Click{" "}
            <span className="text-[#8C7BE8] font-bold">Launch Demo</span> to enter instantly with pre-seeded datasets,
            or copy credentials for the standard sign-in terminal.
          </p>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {DEMO_PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isCopied = copiedKey === persona.key;
            const isLaunching = launchingKey === persona.key;

            return (
              <div
                key={persona.key}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/40 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-violet-950/20"
              >
                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${persona.color} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${persona.badgeBg} font-ui`}
                    >
                      {persona.category}
                    </span>
                  </div>

                  {/* Role Title & Name */}
                  <h3 className="text-base font-bold text-white font-ui mb-0.5 group-hover:text-violet-300 transition-colors">
                    {persona.roleLabel}
                  </h3>
                  <div className="text-xs text-white/50 font-body mb-2.5">
                    {persona.name}
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-white/70 leading-relaxed font-body mb-4">
                    {persona.tagline}
                  </p>

                  {/* Highlights Bullet List */}
                  <ul className="space-y-1.5 mb-5 border-t border-white/10 pt-3">
                    {persona.highlights.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-white/60 leading-tight">
                        <span className="text-[#8C7BE8] font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Actions Bar */}
                <div className="space-y-2 border-t border-white/10 pt-3.5">
                  <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
                    <span className="truncate max-w-[170px]">{persona.email}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(persona, e)}
                      className="inline-flex items-center gap-1 text-[10px] text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Copy credentials"
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunch(persona)}
                    disabled={isLaunching}
                    className="w-full h-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold font-ui transition-all shadow-md shadow-violet-900/40 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Zap size={13} className="fill-white" />
                    <span>{isLaunching ? "Launching..." : "⚡ Launch Demo Now"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="mt-7 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>
            Need production deployment or custom LDAP/SAML single sign-on?
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              const contactEl = document.getElementById("contact");
              if (contactEl) {
                contactEl.scrollIntoView({ behavior: "smooth" });
              } else {
                router.push("/pricing#contact");
              }
            }}
            className="text-[#8C7BE8] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Request Institutional On-Premise Architecture</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
