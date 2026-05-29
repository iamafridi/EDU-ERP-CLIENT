"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Bus,
  DollarSign,
  Library,
  Stethoscope,
  ArrowRight,
  Lock,
  Camera,
  Sliders,
  Sparkles,
} from "lucide-react";
import DashboardPreview, { PRESET_PREVIEWS } from "./DashboardPreview";
import { useToast } from "./ToastFeedback";
import { useAuthStore, type UserProfile } from "@/store/useAuthStore";
import { createDemoSessionToken } from "@/lib/mockJwt";

type TourTab = "overview" | "hostel" | "academics" | "transport" | "finance" | "library" | "clinic";

interface TourContent {
  id: TourTab;
  tabLabel: string;
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  previewPreset: string;
  screenshot: string;
  route: string;
}

const TOUR_DATA: Record<TourTab, TourContent> = {
  overview: {
    id: "overview",
    tabLabel: "All-Campus Hub",
    icon: LayoutDashboard,
    title: "Every signal, in one coherent view.",
    description:
      "Monitor student attendance, dormitory bed capacity, transport routes, and financial collections without hunting through disconnected software.",
    previewPreset: "overview",
    screenshot: "/screenshots/dashboard-overview.png",
    route: "/dashboard",
  },
  hostel: {
    id: "hostel",
    tabLabel: "Hostel & Smart Mess",
    icon: Building2,
    title: "Dormitories that operate with precision.",
    description:
      "Visualize multi-block wings, room allotments, resident key check-in, warden digital out-passes, and cafeteria dining food card ledgers.",
    previewPreset: "hostel",
    screenshot: "/screenshots/student-fees.png",
    route: "/rooms",
  },
  academics: {
    id: "academics",
    tabLabel: "Classes & Timetables",
    icon: BookOpen,
    title: "Make learning visible & conflict-free.",
    description:
      "Bring courses, dynamic lecture hall schedules, faculty assignments, attendance, and Welsh-Powell exam seating into one considered workspace.",
    previewPreset: "academics",
    screenshot: "/screenshots/routines-timetable.png",
    route: "/routines",
  },
  transport: {
    id: "transport",
    tabLabel: "IoT & Sensory Mesh",
    icon: Bus,
    title: "Campus telemetry in continuous rhythm.",
    description:
      "Coordinate edge RFID turnstiles, biometric door controllers, fleet transit routes, and ambient cold chain sensory nodes.",
    previewPreset: "transport",
    screenshot: "/screenshots/iot-telemetry.png",
    route: "/iot",
  },
  finance: {
    id: "finance",
    tabLabel: "Finance & Double-Entry",
    icon: DollarSign,
    title: "Financial confidence, built in.",
    description:
      "Automate tuition demand batches, bank feed reconciliations, subledger vouchers, faculty payroll, and real-time balance sheets in Bangladeshi Taka (৳).",
    previewPreset: "finance",
    screenshot: "/screenshots/accounting-reports.png",
    route: "/accounting/reports",
  },
  library: {
    id: "library",
    tabLabel: "Credentials & Locker",
    icon: Library,
    title: "Cryptographic trust across campus.",
    description:
      "Automate official transcripts, verified degree certificates, disciplinary logs, and tamper-evident student credential digital lockers.",
    previewPreset: "library",
    screenshot: "/screenshots/digital-locker.png",
    route: "/digital-locker",
  },
  clinic: {
    id: "clinic",
    tabLabel: "Research & Grants",
    icon: Stethoscope,
    title: "Medical innovation & grant allocation.",
    description:
      "Track faculty clinical studies, peer-reviewed medical publications, research milestones, and institutional grant financing in BDT (৳).",
    previewPreset: "clinic",
    screenshot: "/screenshots/research-grants.png",
    route: "/research",
  },
};

export default function ProductTour() {
  const router = useRouter();
  const loginUser = useAuthStore((s) => s.login);
  const [activeTab, setActiveTab] = useState<TourTab>("overview");
  const [viewMode, setViewMode] = useState<"screenshot" | "simulator">("screenshot");
  const { showToast } = useToast();
  const current = TOUR_DATA[activeTab];

  return (
    <section id="product-tour" className="py-24 lg:py-32 bg-[#060B12] border-b border-white/[0.08] text-white relative overflow-hidden">
      {/* ─── Ambient Blueprint Grid & Glows ─── */}
      <div className="absolute inset-0 blueprint-grid-bg opacity-30 radial-fade-mask pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#B98B4B]/10 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#0F766E]/15 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#D4AF37] font-ui">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span>INTERACTIVE PRODUCT EXPERIENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight font-display">
            Everything essential,{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF]">
              flawlessly in sync
            </span>
            .
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-body">
            From student registration to hostel room key check-in, bus transit fleet tracking, and GAAP general ledger
            reconciliation in BDT (৳) — Hostel Pro-ERP gives every stakeholder the definitive view.
          </p>
        </div>

        {/* View Mode Toggle & Interactive Tab Selector Buttons */}
        <div className="flex flex-col items-center gap-5 mb-14">
          {/* Mode Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0B1522] border border-white/10 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setViewMode("screenshot")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-ui flex items-center gap-2 ${
                viewMode === "screenshot"
                  ? "bg-gradient-to-r from-[#B98B4B] to-[#9E743A] text-white shadow-lg shadow-[#B98B4B]/30 border border-[#D4AF37]/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Camera size={14} />
              <span>Production Screen Capture</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("simulator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-ui flex items-center gap-2 ${
                viewMode === "simulator"
                  ? "bg-gradient-to-r from-[#B98B4B] to-[#9E743A] text-white shadow-lg shadow-[#B98B4B]/30 border border-[#D4AF37]/30"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Sliders size={14} />
              <span>Interactive Telemetry Simulator</span>
            </button>
          </div>

          {/* Module Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {(Object.keys(TOUR_DATA) as TourTab[]).map((tabKey) => {
              const item = TOUR_DATA[tabKey];
              const Icon = item.icon;
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer font-ui flex items-center gap-2 border ${
                    isActive
                      ? "bg-white/10 text-white border-[#D4AF37] shadow-lg shadow-[#B98B4B]/20"
                      : "bg-[#0B1522]/80 border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-[#D4AF37]" : "text-white/50"} />
                  <span>{item.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Tab Copy */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37] bg-white/[0.06] border border-white/10 px-3 py-1 rounded-md font-ui">
                    {current.tabLabel}
                  </span>
                  <span className="text-xs font-mono text-white/40">{current.route}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-normal text-white font-display">
                  {current.title}
                </h3>
                <p className="text-sm sm:text-base text-white/75 leading-relaxed font-body">
                  {current.description}
                </p>

                <div className="pt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const profile: UserProfile = {
                        id: "super-admin",
                        name: "System Provost / Administrator",
                        email: "super.admin@college.edu",
                        role: "super-admin",
                        isDemo: true,
                      };
                      const token = createDemoSessionToken("super-admin", "super.admin@college.edu");
                      loginUser(profile, token);
                      showToast(`Launching sandbox for ${current.route}...`);
                      setTimeout(() => router.push(current.route), 350);
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#D4AF37] hover:text-white font-ui cursor-pointer group"
                  >
                    <span>Launch {current.tabLabel.toLowerCase()} sandbox</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Dynamic Browser Preview or Live Screenshot */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${viewMode}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28 }}
              >
                {viewMode === "screenshot" ? (
                  <div className="rounded-3xl border border-white/15 bg-[#09111C] shadow-2xl shadow-black/80 overflow-hidden">
                    {/* Browser chrome header */}
                    <div className="px-4 py-3 bg-[#060D17] border-b border-white/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-white/50 truncate max-w-xs">
                        <Lock size={11} className="text-emerald-400 shrink-0" />
                        <span className="truncate">https://erp.college.edu{current.route}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                        PRODUCTION GRADE
                      </span>
                    </div>

                    {/* Screenshot image */}
                    <div className="p-3 bg-[#070D14]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={current.screenshot}
                        alt={`${current.tabLabel} Screenshot`}
                        className="w-full h-auto rounded-xl border border-white/10 shadow-xl object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <DashboardPreview
                    data={PRESET_PREVIEWS[current.previewPreset] || PRESET_PREVIEWS.overview}
                    activeSidebar={activeTab}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
