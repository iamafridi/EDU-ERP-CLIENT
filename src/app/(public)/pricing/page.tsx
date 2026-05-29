"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  ArrowRight,
  Building2,
  GraduationCap,
  Globe,
  Crown,
  ShieldCheck,
  ChevronDown,
  Layers,
  Lock,
  Server,
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/components/landing/ToastFeedback";

interface PlanTier {
  key: string;
  name: string;
  subtitle: string;
  icon: typeof GraduationCap;
  monthlyPrice: number | string;
  annualPrice: number | string;
  popular?: boolean;
  studentLimit: string;
  hostelLimit: string;
  features: string[];
  cta: string;
}

const TIERS: PlanTier[] = [
  {
    key: "starter",
    name: "College Academic & Day Scholar",
    subtitle: "For colleges and institutes managing day scholars, class schedules, and fee receipts.",
    icon: GraduationCap,
    monthlyPrice: 24000,
    annualPrice: 19200,
    studentLimit: "Up to 1,200 Students",
    hostelLimit: "Basic residential support",
    features: [
      "Student Lifecycle & Digital Credential Locker",
      "Dynamic Conflict-Free Timetable Scheduler",
      "Biometric & RFID Classroom Attendance Integration",
      "Examination Seating & Grading System",
      "Library Book Barcode Circulation Desk",
      "Standard Fee Collection & 3-Part Bank Challans",
      "10 Departmental Administrator Roles",
      "99.8% Uptime SLA • Standard Support",
    ],
    cta: "Select College Edition",
  },
  {
    key: "campus_pro",
    name: "Hostel Pro Residential Campus",
    subtitle: "The flagship operating system for complete residential universities, colleges, and dormitories.",
    icon: Building2,
    monthlyPrice: 48000,
    annualPrice: 38400,
    popular: true,
    studentLimit: "Up to 4,500 Students",
    hostelLimit: "Unlimited Hostel Blocks & 3D Bed Matrix",
    features: [
      "All College Academic Modules Included",
      "Multi-Block Hostel Dormitories & 3D Bed Matrix",
      "Smart Mess Digital Meal Scanner & Ledgers",
      "Bus Fleet Logistics, GPS Routes & Student Passes",
      "Double-Entry GAAP General Ledger & Balance Sheet",
      "Faculty & Staff Payroll Slips & Leave Tracking",
      "Integrated Campus Health Clinic & Infirmary",
      "Warden Digital Out-Pass Approvals & Gate Scanner",
      "50 Domain Administrator & Staff Roles",
      "99.98% Uptime SLA • 24/7 Priority Hotline",
    ],
    cta: "Launch Hostel Pro Campus",
  },
  {
    key: "university_system",
    name: "Multi-Campus University Network",
    subtitle: "For multi-branch university groups, polytechnics, and medical health systems.",
    icon: Globe,
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    studentLimit: "Unlimited Students & Residents",
    hostelLimit: "Unlimited Multi-Campus Dorms",
    features: [
      "Everything in Hostel Pro Residential Included",
      "Multi-Campus Centralized Tenancy & Consolidated Reporting",
      "On-Premise Institutional Datacenter Deployment (Local Server)",
      "Bi-Directional ERP, LMS, PACS & LIS Connectors",
      "Cryptographically Isolated Database Instances",
      "Custom Workflow Scripting & State Automation",
      "Unlimited Super Admin & Domain Roles",
      "Dedicated Principal Technical Architect (TAM)",
      "99.99% Guaranteed SLA with Penalty Clauses",
    ],
    cta: "Schedule Executive Briefing",
  },
];

const COMPARISON_CATEGORIES = [
  {
    name: "Hostels, Mess & Residential Life",
    rows: [
      { feature: "Multi-Block Hostel Dormitories", f: "Single Dorm", pro: "Unlimited Wings", ent: "Multi-Campus" },
      { feature: "Interactive 3D Bed Matrix Allotment", f: true, pro: true, ent: true },
      { feature: "Smart Mess RFID/QR Meal Scanner", f: false, pro: true, ent: true },
      { feature: "Campus Gate Digital Out-Pass Register", f: false, pro: true, ent: true },
      { feature: "Facility Maintenance Repair Ticketing", f: true, pro: true, ent: true },
    ],
  },
  {
    name: "Classes, Timetables & Academics",
    rows: [
      { feature: "Conflict-Free Dynamic Timetable Scheduler", f: true, pro: true, ent: true },
      { feature: "Lecture Room Capacity Constraint Engine", f: true, pro: true, ent: true },
      { feature: "RFID & Biometric Student Attendance", f: true, pro: true, ent: true },
      { feature: "Exam Seating Admit Card Generator", f: true, pro: true, ent: true },
      { feature: "Library Catalog & Barcode Circulation", f: "Standard", pro: "Full RFID", ent: "Multi-Branch" },
    ],
  },
  {
    name: "Transport, Buses & Fleet Logistics",
    rows: [
      { feature: "Neighborhood Bus Route Scheduling", f: false, pro: true, ent: true },
      { feature: "Designated Student Stop Allocation", f: false, pro: true, ent: true },
      { feature: "Vehicle GPS Fleet & Fuel Logs", f: false, pro: true, ent: true },
      { feature: "Digital Student Transit Bus Passes", f: false, pro: true, ent: true },
    ],
  },
  {
    name: "Financial Accounting & Payroll HR",
    rows: [
      { feature: "Double-Entry GAAP Chart of Accounts", f: "Standard", pro: "5-Tier Hierarchical", ent: "Multi-Entity" },
      { feature: "Tuition & Hostel Fee Demand Batches", f: true, pro: true, ent: true },
      { feature: "Automated Bank Feed Reconciliation", f: false, pro: true, ent: true },
      { feature: "Faculty & Staff Payroll Slips & Leaves", f: false, pro: true, ent: true },
      { feature: "Multi-Voucher Dual Approver Workflows", f: false, pro: true, ent: true },
    ],
  },
  {
    name: "Security, Governance & Deployment",
    rows: [
      { feature: "Domain RBAC Isolation Engine", f: true, pro: true, ent: true },
      { feature: "Chained Immutable Audit Trails", f: false, pro: true, ent: true },
      { feature: "On-Premise Local Server Deployment", f: false, pro: false, ent: true },
      { feature: "Guaranteed SLA", f: "99.8%", pro: "99.98%", ent: "99.99%" },
    ],
  },
];

const FAQS = [
  {
    q: "What makes Hostel Pro-ERP different from generic school software?",
    a: "Generic software treats dormitories, buses, and accounting as disconnected modules. Hostel Pro-ERP was engineered from the ground up to unify residential campus operations — linking 3D bed matrix allotments with mess meal cards, bus routes, lecture routines, and double-entry general ledgers in Bangladeshi Taka (৳).",
  },
  {
    q: "Can we run Hostel Pro-ERP entirely on our own campus servers?",
    a: "Yes. The Multi-Campus University Network tier fully supports on-premise deployment inside your institution's server room behind your firewall, with automated local backups and zero cloud dependency.",
  },
  {
    q: "How does the domain administration system work?",
    a: "Hostel Pro-ERP enforces strict cryptographic domain boundaries. Hostel Wardens only manage dormitories and gate passes; Finance Treasurers only access fee demands and vouchers; Faculty Deans only access courses and timetables. The Super Admin retains global oversight and immutable audit logs.",
  },
  {
    q: "Is campus healthcare and clinical management included?",
    a: "Yes! Hostel Pro-ERP includes an integrated campus health module with infirmary bed management, student health records, OPD triage, and pharmacy stock tracking for universities, colleges, and teaching hospitals.",
  },
  {
    q: "How fast is data migration from legacy spreadsheets?",
    a: "Most institutions complete onboarding in 7 to 14 days using our pre-formatted spreadsheet importers for student cohorts, room inventories, bus stops, and opening chart of accounts.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [studentCount, setStudentCount] = useState(2500);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { showToast } = useToast();

  const estMonthlyRate = Math.round(studentCount * 24);
  const estHoursSaved = Math.round(studentCount * 0.45);
  const estPaperSavedBDT = Math.round(studentCount * 180);

  const handleSelectPlan = (planName: string) => {
    showToast(`Selected ${planName}. Generating customized institutional proposal.`, "success");
  };

  return (
    <div className="flex flex-col bg-[#060B12] text-white selection:bg-[#B98B4B] selection:text-[#060B12] min-h-screen">
      {/* ─── Hero & Project Overview ─── */}
      <section className="relative pt-14 pb-18 lg:pt-20 lg:pb-28 border-b border-white/[0.08] overflow-hidden bg-[#070D14]">
        {/* Volumetric Brushed Gold Rays & Blueprint Grid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] gold-beam-conic opacity-35 pointer-events-none -z-10 radial-fade-mask" />
        <div className="absolute inset-0 blueprint-grid-bg opacity-35 radial-fade-mask pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-10 w-[550px] h-[550px] bg-[#B98B4B]/15 blur-[160px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-[600px] h-[600px] bg-[#0F766E]/20 blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-[#D4AF37] uppercase tracking-widest font-ui mb-6 backdrop-blur-md">
              <Crown size={13} className="text-[#D4AF37]" />
              CAMPUS OPERATING SYSTEM · TRANSPARENT INSTITUTIONAL LICENSING
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-display mb-6 leading-[1.12]"
          >
            Predictable licensing for{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF]">
              residential campuses
            </span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-base sm:text-lg text-white/75 max-w-3xl mx-auto leading-relaxed font-body mb-8"
          >
            Hostel Pro-ERP connects student admissions, conflict-free routine schedules,
            residential dormitories, bus fleets, and double-entry accounting into one coherent platform.
          </motion.p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3.5">
            <span
              className={`text-xs sm:text-sm font-semibold font-ui cursor-pointer transition-colors ${
                !isAnnual ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Billed Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full bg-white/[0.08] border border-white/20 p-1 transition-colors cursor-pointer hover:border-[#D4AF37]/50"
              aria-label="Toggle annual billing"
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#B98B4B] to-[#D4AF37] shadow-md shadow-[#B98B4B]/50"
                animate={{ x: isAnnual ? 26 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className={`text-xs sm:text-sm font-semibold font-ui cursor-pointer flex items-center gap-2 transition-colors ${
                isAnnual ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
              onClick={() => setIsAnnual(true)}
            >
              <span>Annual Billing</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold font-ui">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Dynamic Campus Sizing & ROI Calculator ─── */}
      <section className="py-14 border-b border-white/[0.08] bg-[#070D14]/80 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-dots-bg opacity-15 pointer-events-none -z-10" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="p-7 sm:p-9 rounded-3xl luxury-glass-card shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] font-ui">
                  Interactive Campus Sizing &amp; ROI Calculator
                </span>
                <h3 className="text-xl font-bold text-white font-ui mt-1">
                  Tailor to your campus enrollment &amp; bed matrix
                </h3>
                <p className="text-xs text-white/60">
                  Slide to preview your estimated operational hours recovered, paper cost savings, and recommended tier.
                </p>
              </div>
              <div className="text-left md:text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D4AF37] font-ui tabular-nums">
                  {studentCount.toLocaleString()}
                </span>
                <span className="text-xs text-white/50 font-ui block">Enrolled Students &amp; Residents</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={500}
              max={15000}
              step={100}
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-mono mt-3">
              <span>500 Students</span>
              <span>7,500 Students</span>
              <span>15,000+ Students (Full Multi-Campus)</span>
            </div>

            {/* Calculated KPI Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-7 pt-7 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-ui block">
                  Est. Monthly Investment
                </span>
                <div className="text-2xl font-extrabold text-white font-ui mt-1 tabular-nums">
                  ৳{estMonthlyRate.toLocaleString()}
                  <span className="text-xs font-normal text-white/50"> / mo</span>
                </div>
                <span className="text-[11px] text-[#D4AF37] font-semibold mt-0.5 block">
                  ~৳{(estMonthlyRate / studentCount).toFixed(0)} / student / month
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-ui block">
                  Admin Time Recovered
                </span>
                <div className="text-2xl font-extrabold text-emerald-400 font-ui mt-1 tabular-nums">
                  ~{estHoursSaved} hrs
                  <span className="text-xs font-normal text-white/50"> / month</span>
                </div>
                <span className="text-[11px] text-white/50 mt-0.5 block">
                  Zero paper registers &amp; spreadsheet silos
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-ui block">
                  Recommended Tier
                </span>
                <div className="text-xl font-extrabold text-white font-ui mt-1">
                  {studentCount <= 1200 ? "College Edition" : studentCount <= 4500 ? "Hostel Pro Residential" : "University Network"}
                </div>
                <span className="text-[11px] text-[#D4AF37] mt-0.5 block font-mono">
                  Full module coverage included
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3 Tier Cards ─── */}
      <section className="py-24 bg-[#060B12] relative overflow-hidden">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
              return (
                <div
                  key={tier.key}
                  className={`relative rounded-3xl border flex flex-col justify-between transition-all duration-300 p-8 sm:p-9 ${
                    tier.popular
                      ? "border-[#D4AF37]/80 bg-gradient-to-b from-[#141C2B] via-[#0B1522] to-[#070D14] shadow-2xl shadow-black/90 ring-1 ring-[#D4AF37]/50"
                      : "border-white/10 luxury-glass-card hover:border-[#D4AF37]/40"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#B98B4B] to-[#9E743A] text-[#070D14] text-[10px] font-extrabold uppercase tracking-widest font-ui shadow-lg shadow-[#B98B4B]/40 border border-[#E5C384]/50">
                      Flagship Tier • Recommended
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        tier.popular
                          ? "bg-[#B98B4B]/20 text-[#D4AF37] border-[#D4AF37]/40"
                          : "bg-white/[0.06] text-white/80 border-white/10"
                      }`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-xs font-bold text-white/50 font-mono">
                        {tier.studentLimit}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white font-display mb-1.5">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-white/65 leading-relaxed font-body mb-6">
                      {tier.subtitle}
                    </p>

                    <div className="pb-6 border-b border-white/10">
                      <div className="flex items-baseline gap-1">
                        {typeof price === "number" ? (
                          <>
                            <span className="text-4xl font-extrabold text-white font-ui tabular-nums">
                              ৳{price.toLocaleString()}
                            </span>
                            <span className="text-xs text-white/50 font-body">/ month</span>
                          </>
                        ) : (
                          <span className="text-4xl font-extrabold text-white font-ui">
                            {price}
                          </span>
                        )}
                      </div>
                      {typeof price === "number" && (
                        <p className="text-[11px] text-white/40 mt-1">
                          {isAnnual ? "Billed annually (20% savings applied)" : "Billed monthly"}
                        </p>
                      )}
                    </div>

                    <div className="py-6 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] font-ui block">
                        Included Platform Capabilities:
                      </span>
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                          <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(tier.name)}
                      className={`w-full h-12 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all font-ui cursor-pointer ${
                        tier.popular
                          ? "bg-gradient-to-r from-[#B98B4B] to-[#9E743A] hover:brightness-110 text-white shadow-xl shadow-[#B98B4B]/30 border border-[#D4AF37]/30"
                          : "bg-white/[0.06] border border-white/15 hover:border-[#D4AF37]/40 text-white hover:bg-white/[0.1]"
                      }`}
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Security & Compliance Architecture ─── */}
      <section className="py-20 bg-[#070D14] border-y border-white/[0.08] relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid-gold opacity-20 pointer-events-none -z-10" />
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#D4AF37] font-ui">
                <Sparkles size={12} className="text-[#D4AF37]" />
                <span>ENTERPRISE CAMPUS ASSURANCE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-display">
                Built specifically for residential institutional operations.
              </h2>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed font-body">
                Running a residential campus involves coordinating thousands of students across dormitories,
                cafeterias, bus stops, lecture halls, and cash collection desks. Hostel Pro-ERP prevents data
                silos by enforcing a single shared database engine with strict domain boundaries.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  "Domain Administration isolating Wardens, Accountants, Deans & Fleet Heads",
                  "Automated Fee Demand Batches eliminating human reconciliation error",
                  "Real-Time Biometric & Barcode Integration across Gates, Mess & Classrooms",
                  "Cryptographically chained audit trails guaranteeing regulatory compliance",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-white/85 font-ui">
                    <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl luxury-glass-card shadow-2xl space-y-4">
                <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-[#B98B4B]/20 border border-[#D4AF37]/35 text-[#D4AF37] flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-ui">
                      Security &amp; Compliance Architecture
                    </h3>
                    <p className="text-xs text-white/50">
                      Institutional Data Protection &amp; Regulatory Standards
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs text-white font-body">
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="font-semibold font-ui text-white/90">Data Encryption</span>
                    <span className="font-mono text-[#D4AF37]">TLS 1.3 / AES-256 at Rest</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="font-semibold font-ui text-white/90">Regulatory Compliance</span>
                    <span className="font-mono text-emerald-400">BMDC, UGC, NAAC &amp; AICTE Ready</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="font-semibold font-ui text-white/90">Access Governance</span>
                    <span className="font-mono text-teal-400">5-Role RBAC with Domain Scopes</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="font-semibold font-ui text-white/90">Disaster Recovery</span>
                    <span className="font-mono text-[#D4AF37]">Automated Daily Encrypted Snapshots</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Detailed Feature Comparison Matrix ─── */}
      <section className="py-24 bg-[#060B12] border-b border-white/[0.08]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#D4AF37] font-ui">
              <span>DEEP-DIVE SPECIFICATIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal text-white font-display">
              Full Module Matrix
            </h2>
            <p className="text-sm text-white/65 font-body">
              Compare capabilities across hostels, classes, buses, and financial ledgers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/15 luxury-glass-card shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-white/[0.05] border-b border-white/10">
                  <th className="p-4 text-xs font-bold text-white/90 uppercase tracking-wider font-ui w-2/5">
                    Campus Capability
                  </th>
                  <th className="p-4 text-xs font-bold text-white/90 text-center uppercase tracking-wider font-ui w-1/5">
                    College Edition
                  </th>
                  <th className="p-4 text-xs font-bold text-[#D4AF37] text-center uppercase tracking-wider font-ui w-1/5 bg-[#B98B4B]/10">
                    Hostel Pro Campus
                  </th>
                  <th className="p-4 text-xs font-bold text-white/90 text-center uppercase tracking-wider font-ui w-1/5">
                    University Network
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {COMPARISON_CATEGORIES.map((cat) => (
                  <React.Fragment key={cat.name}>
                    <tr className="bg-white/[0.02]">
                      <td colSpan={4} className="px-4 py-2.5 text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider font-ui">
                        {cat.name}
                      </td>
                    </tr>
                    {cat.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 text-xs sm:text-sm font-medium text-white/80 font-body">
                          {row.feature}
                        </td>
                        <td className="p-4 text-center text-xs">
                          {typeof row.f === "boolean" ? (
                            row.f ? <Check size={16} className="text-emerald-400 mx-auto" /> : <X size={16} className="text-white/20 mx-auto" />
                          ) : (
                            <span className="font-semibold text-white/90">{row.f}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-xs bg-[#B98B4B]/5">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? <Check size={16} className="text-[#D4AF37] mx-auto" /> : <X size={16} className="text-white/20 mx-auto" />
                          ) : (
                            <span className="font-bold text-[#D4AF37]">{row.pro}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-xs">
                          {typeof row.ent === "boolean" ? (
                            row.ent ? <Check size={16} className="text-emerald-400 mx-auto" /> : <X size={16} className="text-white/20 mx-auto" />
                          ) : (
                            <span className="font-semibold text-white/90">{row.ent}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ─── */}
      <section className="py-24 bg-[#070D14]" id="faq">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#D4AF37] font-ui block">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-white font-display">
              Answers for Institutional Deans &amp; Treasurers
            </h2>
            <p className="text-sm text-white/65 font-body">
              Everything you need to know about deployment, domain RBAC, and data migration.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 luxury-glass-card overflow-hidden transition-all hover:border-[#D4AF37]/30"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer font-ui"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-white/50 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#D4AF37]" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-white/70 leading-relaxed font-body border-t border-white/10 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
