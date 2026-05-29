"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
  CheckCircle2,
  Lock,
  Database,
  Activity,
  FileCheck2,
  Stethoscope,
  DollarSign,
  ShieldCheck,
  Server,
  Layers,
  Zap,
} from "lucide-react";
import { GeometricLogo } from "@/components/landing/LandingHeader";
import { useAuthStore, type UserProfile } from "@/store/useAuthStore";
import { createDemoSessionToken } from "@/lib/mockJwt";
import { useToast } from "@/components/landing/ToastFeedback";

/* ─── Architectural Layers Data ─── */
type ArchLayer = "presentation" | "business" | "persistence" | "security";

interface LayerInfo {
  title: string;
  badge: string;
  summary: string;
  technologies: { name: string; purpose: string }[];
  highlights: string[];
}

const ARCH_LAYERS: Record<ArchLayer, LayerInfo> = {
  presentation: {
    title: "Presentation & Micro-Interaction Layer",
    badge: "Frontend UI/UX",
    summary:
      "Engineered with Next.js 16 App Router, React 19, and Tailwind CSS. Delivers instantaneous route transitions, fluid Framer Motion micro-interactions, responsive data tables, and high-density campus dashboards.",
    technologies: [
      { name: "Next.js 16 (App Router)", purpose: "Hybrid SSR/SSG & edge API proxying" },
      { name: "React 19 & Hooks", purpose: "Concurrent UI rendering & reactive state" },
      { name: "Tailwind CSS", purpose: "Design tokens, dark cosmic luxury palette" },
      { name: "Framer Motion & GSAP", purpose: "Fluid micro-animations & layout springs" },
      { name: "Lucide React", purpose: "Accessible vector iconography" },
    ],
    highlights: [
      "Sub-100ms client route navigation via Next.js pre-fetching",
      "Dynamic responsive tables with inline sorting, filtering, and print rules",
      "Consistent dark cosmic luxury aesthetic featuring obsidian cards and violet glows",
    ],
  },
  business: {
    title: "Business Logic & Institutional Engines",
    badge: "Backend Core",
    summary:
      "A modular Node.js & Express RESTful services framework designed for strict domain boundaries. Enforces double-entry financial invariants, academic timetable collision checking, and hostel bed allocations.",
    technologies: [
      { name: "Node.js & Express", purpose: "High-throughput asynchronous REST services" },
      { name: "TypeScript 5 Strict", purpose: "End-to-end type safety & compiler verification" },
      { name: "Double-Entry Ledger Engine", purpose: "Debits must equal credits at database transaction boundary" },
      { name: "Timetable Constraint Engine", purpose: "Zero room and instructor collision validator" },
      { name: "Real-time Telemetry WebSockets", purpose: "Instant bed occupancy & token queue updates" },
    ],
    highlights: [
      "Strict zero-orphan transaction rollbacks on all financial and room allocation changes",
      "Domain-specific controllers with isolated request validations",
      "Comprehensive error hierarchy with structured JSON diagnostic envelopes",
    ],
  },
  persistence: {
    title: "Data Persistence & Transaction Engine",
    badge: "Database & Storage",
    summary:
      "Powered by MongoDB Atlas multi-node replica sets with ACID session support. Indexes optimize multi-thousand student records, daily mess dining logs, and multi-year financial ledgers without degradation.",
    technologies: [
      { name: "MongoDB Atlas Replica Set", purpose: "Distributed fault-tolerant document store" },
      { name: "Mongoose 8 ODM", purpose: "Schema enforcement, virtuals, and compound indexing" },
      { name: "ACID Multi-Document Transactions", purpose: "Guaranteed atomicity for journal vouchers and bed transfers" },
      { name: "Automated Daily Snapshots", purpose: "Continuous disaster recovery with point-in-time restore" },
    ],
    highlights: [
      "Zero ledger discrepancy through multi-document write locks during voucher posting",
      "Optimized compound indexes for fast date-range filtering on student logs",
      "Complete historical versioning for accreditation and audit reports",
    ],
  },
  security: {
    title: "Security, Governance & Cryptographic Audit",
    badge: "Compliance & RBAC",
    summary:
      "Enterprise security architecture adhering to higher-education standards and data privacy rules. Features 5-role RBAC, cryptographically chained audit logs, and encrypted digital lockers.",
    technologies: [
      { name: "JWT & Stateless Tokens", purpose: "Stateless cryptographically signed access tokens" },
      { name: "Role-Based Access Control (RBAC)", purpose: "Granular route and UI permission gatekeepers" },
      { name: "Chained Audit Trails", purpose: "Records timestamp, user ID, IP address, and delta snapshot" },
      { name: "AES-256 & TLS 1.3", purpose: "Full encryption for data in transit and at rest" },
    ],
    highlights: [
      "Immutable tamper-evident system logs preventing audit record alteration",
      "Strict domain administration isolating wardens, accountants, and deans",
      "Automated access token expiration with secure refresh cookie rotation",
    ],
  },
};

const ACCREDITATIONS = [
  {
    org: "National Higher Education Council",
    status: "Audit Compliant",
    detail: "Automated institutional metrics generation aligned with national university standards.",
    icon: Award,
  },
  {
    org: "ISO/IEC 27001 Information Security",
    status: "Framework Aligned",
    detail: "Data access controls, encrypted backups, and chained audit trails matching ISO specifications.",
    icon: ShieldCheck,
  },
  {
    org: "Campus Living & Hostel Safety Standards",
    status: "Integrated",
    detail: "Digital gate-pass out-logs, emergency infirmary contact chains, and visitor verification.",
    icon: FileCheck2,
  },
  {
    org: "Double-Entry GAAP Accounting Standards",
    status: "100% Invariant",
    detail: "Chart of Accounts structure enforces debits equal credits on every voucher posted.",
    icon: DollarSign,
  },
];

interface ScreenshotItem {
  id: string;
  category: string;
  title: string;
  route: string;
  description: string;
  image: string;
}

const GALLERY_SCREENSHOTS: ScreenshotItem[] = [
  {
    id: "dashboard",
    category: "Executive",
    title: "Executive Mission Control",
    route: "/dashboard",
    description: "Centralized institutional dashboard with live KPI counters, student presence telemetry, and schedule feeds.",
    image: "/screenshots/dashboard-overview.png",
  },
  {
    id: "accounting",
    category: "Finance",
    title: "GAAP Double-Entry Ledger & Financial Reports",
    route: "/accounting/reports",
    description: "Comprehensive multi-entity balance sheets, profit & loss statements, and audited general ledger views in Bangladeshi Taka (৳).",
    image: "/screenshots/accounting-reports.png",
  },
  {
    id: "routines",
    category: "Academics",
    title: "Welsh-Powell Clash-Free Timetable Generator",
    route: "/routines",
    description: "Graph coloring algorithm allocating zero-conflict assessment routines and classroom section scheduling.",
    image: "/screenshots/routines-timetable.png",
  },
  {
    id: "calendar",
    category: "Academics",
    title: "Institutional Academic Calendar & Recesses",
    route: "/academic-calendar",
    description: "Assessment milestones, examination windows, and national holidays with dual grid and list perspective.",
    image: "/screenshots/academic-calendar.png",
  },
  {
    id: "iot",
    category: "Operations",
    title: "IoT Sensory Mesh & Gate Automation",
    route: "/iot",
    description: "Real-time RFID turnstiles, biometric dormitory controllers, and cold storage telemetry monitoring.",
    image: "/screenshots/iot-telemetry.png",
  },
  {
    id: "research",
    category: "Academics",
    title: "Research Projects & BDT (৳) Grant Allocations",
    route: "/research",
    description: "Medical publications, faculty clinical trials, and institutional research endowments.",
    image: "/screenshots/research-grants.png",
  },
  {
    id: "digital-locker",
    category: "Identity",
    title: "Cryptographic Student Digital Locker",
    route: "/digital-locker",
    description: "Tamper-evident institutional document store for medical degrees, BMDC certifications, and official transcripts.",
    image: "/screenshots/digital-locker.png",
  },
  {
    id: "admin",
    category: "Governance",
    title: "SuperAdmin Mission Control & Node Topology",
    route: "/admin",
    description: "System-wide module health, database connection clusters, active user sessions, and cryptographic audit trails.",
    image: "/screenshots/admin-mission-control.png",
  },
];

export default function AboutPage() {
  const router = useRouter();
  const loginUser = useAuthStore((s) => s.login);
  const { showToast } = useToast();
  const [selectedLayer, setSelectedLayer] = useState<ArchLayer>("presentation");
  const [activeScreenshot, setActiveScreenshot] = useState<string>("dashboard");
  const layer = ARCH_LAYERS[selectedLayer];
  const activeItem = GALLERY_SCREENSHOTS.find((g) => g.id === activeScreenshot) || GALLERY_SCREENSHOTS[0];

  const handleLaunchDemoRoute = (targetRoute: string) => {
    const profile: UserProfile = {
      id: "super-admin",
      name: "System Provost / Administrator",
      email: "super.admin@college.edu",
      role: "super-admin",
      isDemo: true,
    };
    const token = createDemoSessionToken("super-admin", "super.admin@college.edu");
    loginUser(profile, token);
    showToast(`Launching demo session for ${targetRoute}...`);
    setTimeout(() => {
      router.push(targetRoute);
    }, 350);
  };

  return (
    <div className="flex flex-col bg-[#090A10] text-white selection:bg-[#624FDA]/40 selection:text-white min-h-screen">
      {/* ─── Hero: The Vision ─── */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-white/10 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-violet-600/15 blur-[140px] pointer-events-none -z-10 rounded-full" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-xs font-bold text-violet-300 uppercase tracking-wider font-ui mb-6 backdrop-blur-md">
              <Sparkles size={13} className="text-[#8C7BE8]" />
              ENGINEERED FOR RESIDENTIAL CAMPUS EXCELLENCE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-display mb-6 leading-[1.14]"
          >
            The software architecture behind{" "}
            <span className="italic font-normal bg-gradient-to-r from-violet-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Hostel Pro-ERP
            </span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto leading-relaxed font-body"
          >
            Hostel Pro-ERP unifies student enrollment, dynamic class &amp; exam scheduling, 
            multi-block hostel residences, biometric mess dining, GPS bus fleet dispatch, 
            double-entry financial ledgers, and campus health infirmaries into one cohesive platform.
          </motion.p>
        </div>
      </section>

      {/* ─── Core Institutional Mission ─── */}
      <section className="py-20 bg-[#0C0D18]/80 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block">
                WHY WE BUILT HOSTEL PRO-ERP
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-display">
                Eliminating the chaos of disconnected software across institutional campuses.
              </h2>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed font-body">
                Historically, universities and residential colleges run on 6 to 10 disconnected legacy silos: paper registers
                for hostel beds, desktop spreadsheets for tuition fees, separate software for bus tracking,
                and manual binders for room allotments.
              </p>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed font-body">
                When administrative boards review campus operations, staff spend weeks frantically
                cross-checking registers. Hostel Pro-ERP replaces this fragility with a unified, real-time operating core.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "100% elimination of redundant data entry across departments",
                  "Real-time dormitory bed occupancy & mess dining ledger tracking",
                  "Automated tuition fee demand generation & instant bank reconciliation",
                  "Verifiable institutional regulatory compliance dossiers on demand",
                ].map((pt, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-white/80 font-ui">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center mb-3 border border-violet-500/30">
                    <Activity size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-ui">2,800+ Beds</div>
                  <p className="text-xs text-white/50 mt-1">Residential dorm capacity managed digitally</p>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3 border border-emerald-500/30">
                    <GraduationCap size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-ui">5,400+</div>
                  <p className="text-xs text-white/50 mt-1">Students &amp; scholars actively tracked</p>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3 border border-amber-500/30">
                    <DollarSign size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-ui">99.98%</div>
                  <p className="text-xs text-white/50 mt-1">Automated ledger &amp; fee collection accuracy</p>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center mb-3 border border-violet-500/30">
                    <Lock size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-white font-ui">Zero Silos</div>
                  <p className="text-xs text-white/50 mt-1">Unified relational &amp; document persistence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Platform Visual Showcase (#showcase) ─── */}
      <section id="showcase" className="py-20 lg:py-28 bg-[#0C0D18]/90 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block mb-3">
              PRODUCTION INTERFACE GALLERY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white font-display mb-4">
              Real Workflows. Real Precision.
            </h2>
            <p className="text-base sm:text-lg text-white/60 font-body">
              Inspect visual captures from our live modernized application release, built with shared
              micro-components, Bangladeshi Taka (৳) accounting, and real-time sensory telemetry.
            </p>
          </div>

          {/* Screenshot Category & Route Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {GALLERY_SCREENSHOTS.map((item) => {
              const active = activeScreenshot === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveScreenshot(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-ui flex items-center gap-2 ${
                    active
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40 border border-violet-400/40"
                      : "bg-white/[0.04] text-white/60 border border-white/10 hover:border-violet-500/30 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
                    {item.category}
                  </span>
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>

          {/* Browser Preview Container */}
          {activeItem && (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-white/15 bg-[#090A10] shadow-2xl overflow-hidden shadow-violet-950/40"
            >
              {/* Browser Window Header */}
              <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center justify-center gap-2 px-4 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-white/50">
                  <Lock size={12} className="text-emerald-400" />
                  <span>https://erp.medicalcollege.edu{activeItem.route}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50 font-ui font-semibold">
                  <span>Live Production Capture</span>
                </div>
              </div>

              {/* Image Frame */}
              <div className="relative p-2 sm:p-4 bg-[#090A10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl object-cover"
                />
              </div>

              {/* Bottom Caption & Route Info */}
              <div className="p-5 sm:p-6 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider font-ui">
                      {activeItem.category} Module
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-xs font-mono text-white/60">{activeItem.route}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 max-w-2xl font-body">
                    {activeItem.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLaunchDemoRoute(activeItem.route)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 border border-violet-400/30 text-xs font-bold font-ui inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all cursor-pointer"
                >
                  <Zap size={13} className="text-amber-300" />
                  <span>Launch Live Sandbox</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Interactive Technical Architecture Deep-Dive (#architecture) ─── */}
      <section id="architecture" className="py-20 lg:py-28 bg-[#090A10] border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block mb-3">
              SYSTEM ENGINEERING
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white font-display mb-4">
              4-Tier Architectural Blueprint
            </h2>
            <p className="text-base sm:text-lg text-white/60 font-body">
              Every layer of Hostel Pro-ERP is architected for continuous fault tolerance, data integrity,
              and low-latency responsiveness. Click a tier to inspect implementation details.
            </p>
          </div>

          {/* Tier Switcher Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {(Object.keys(ARCH_LAYERS) as ArchLayer[]).map((k) => {
              const active = selectedLayer === k;
              const info = ARCH_LAYERS[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedLayer(k)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer font-ui ${
                    active
                      ? "bg-violet-600/15 border-violet-500 shadow-xl shadow-violet-900/30 ring-1 ring-violet-500/40"
                      : "bg-white/[0.03] border-white/10 hover:border-violet-500/40 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-1">
                    {info.badge}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">{info.title}</h3>
                </button>
              );
            })}
          </div>

          {/* Active Layer Deep-Dive Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLayer}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-white/10 bg-[#0C0D18]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-5">
                  <div>
                    <span className="px-3 py-1 rounded-md bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider font-ui inline-block mb-3">
                      {layer.badge}
                    </span>
                    <h3 className="text-2xl font-bold text-white font-display mb-3">
                      {layer.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed font-body">
                      {layer.summary}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-white font-ui">
                      Key Architectural Guarantees:
                    </p>
                    {layer.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 font-ui">
                      Active Technology Stack Components
                    </h4>
                    <div className="divide-y divide-white/10">
                      {layer.technologies.map((tech, i) => (
                        <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-white font-mono">{tech.name}</span>
                          <span className="text-white/50 text-right truncate max-w-[60%] font-body">
                            {tech.purpose}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Regulatory & Accreditation Compliance Roadmap ─── */}
      <section className="py-20 bg-[#0C0D18]/80 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block mb-3">
              COMPLIANCE BY DESIGN
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-white font-display mb-3">
              Built to satisfy stringent institutional standards.
            </h2>
            <p className="text-sm sm:text-base text-white/60 font-body">
              Every workflow in Hostel Pro-ERP has been designed to meet the exact reporting criteria of
              national higher-education boards and administrative regulatory bodies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACCREDITATIONS.map((acc, idx) => {
              const Icon = acc.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.05] transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0">
                    <Icon size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-ui">{acc.org}</h3>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-ui">
                        {acc.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-body">
                      {acc.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Creator & Engineering Leadership ─── */}
      <section className="py-20 lg:py-24 bg-[#090A10]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#624FDA] to-[#8C7BE8] text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-900/50 border border-white/20">
            <GraduationCap size={32} />
          </div>

          <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block mb-2">
            ARCHITECT &amp; SYSTEMS ENGINEER
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-white font-display mb-2">
            Afridi Akbar Ifty
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-white/50 font-ui mb-5">
            Software Engineer &amp; Systems Architect • Chittagong, Bangladesh
          </p>

          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed font-body mb-8">
            &quot;Higher education campuses are complex ecosystems with thousands of students residing, dining, commuting,
            and studying daily. Hostel Pro-ERP was designed to give chancellors, wardens, bursars, and department heads total operational clarity with zero data friction.&quot;
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="h-11 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-violet-900/30 border border-violet-400/30 font-ui"
            >
              <span>Test the platform</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/pricing"
              className="h-11 px-6 bg-white/[0.06] border border-white/15 hover:border-violet-500/40 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 font-ui"
            >
              <span>Review pricing plans</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
