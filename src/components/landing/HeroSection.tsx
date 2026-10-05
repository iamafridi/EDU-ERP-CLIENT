"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Users,
  Building2,
  BookOpen,
  Bus,
  DollarSign,
  Library,
  Stethoscope,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import DashboardPreview, { PRESET_PREVIEWS } from "./DashboardPreview";
import { useToast } from "./ToastFeedback";
import TryDemoModal from "./TryDemoModal";
import ContactModal from "./ContactModal";

export default function HeroSection() {
  const { showToast } = useToast();
  const [activePreset, setActivePreset] = useState<string>("overview");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const preview = PRESET_PREVIEWS[activePreset] || PRESET_PREVIEWS.overview;

  return (
    <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-[#070D14] text-white">
      {/* ─── Volumetric Brushed Gold & Teal Light Rays ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] gold-beam-conic opacity-40 pointer-events-none -z-10 radial-fade-mask" />
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[900px] h-[550px] teal-beam-conic opacity-35 pointer-events-none -z-10 radial-fade-mask" />

      {/* ─── Cartesian Blueprint Grid with Top Radial Mask ─── */}
      <div className="absolute inset-0 blueprint-grid-bg opacity-35 radial-fade-mask pointer-events-none -z-10" />
      <div className="absolute inset-0 blueprint-dots-bg opacity-20 pointer-events-none -z-10" />

      {/* ─── Ambient Breathing Aurora Glow Pools ─── */}
      <div className="absolute top-1/4 right-10 w-[550px] h-[550px] bg-[#B98B4B]/15 blur-[160px] rounded-full pointer-events-none animate-pulse-aurora -z-10" />
      <div className="absolute top-1/3 left-4 w-[600px] h-[600px] bg-[#0F766E]/20 blur-[150px] rounded-full pointer-events-none animate-pulse-aurora -z-10" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ─── Left Column: Editorial Headline & Copy ─── */}
          <div className="lg:col-span-5 space-y-7">
            {/* Telemetry Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-inner"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#D4AF37] font-ui">
                INSTITUTIONAL CAMPUS OPERATING SYSTEM
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">
                v2.6 LIVE
              </span>
            </motion.div>

            {/* Kinetic Typography Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.18] tracking-tight font-display"
            >
              Run your campus with{" "}
              <span className="inline-block italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF] drop-shadow-sm pb-1.5 pr-2">
                absolute clarity
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="text-base sm:text-lg text-white/75 leading-relaxed font-body"
            >
              Hostel Pro-ERP orchestrates student enrollment, dynamic timetable scheduling,
              multi-block dormitories, transit bus fleets, and 5-tier GAAP accounting into one cohesive,
              cryptographically verifiable platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="h-12 px-6 bg-gradient-to-r from-[#B98B4B] via-[#C99E5C] to-[#A67A3A] hover:brightness-110 text-[#070D14] font-extrabold rounded-xl text-sm transition-all duration-200 shadow-xl shadow-[#B98B4B]/20 hover:shadow-[#B98B4B]/35 font-ui flex items-center justify-center gap-2.5 cursor-pointer border border-[#E5C384]/40 whitespace-nowrap shrink-0"
              >
                <Sparkles size={16} className="text-[#070D14] shrink-0" />
                <span className="whitespace-nowrap">Launch Interactive Demo (5 Roles)</span>
                <ArrowRight size={16} className="shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="h-12 px-6 bg-white/[0.06] border border-white/15 hover:border-white/30 text-white hover:bg-white/[0.12] font-bold rounded-xl text-sm transition-all duration-200 font-ui flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Schedule Briefing</span>
              </button>
            </motion.div>

            {/* Telemetry Micro-Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.45 }}
              className="pt-3 flex flex-wrap items-center gap-4 text-xs text-white/60 font-ui"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#D4AF37]" />
                <span>Zero-Trust RBAC</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-teal-400" />
                <span>99.98% SLA Uptime</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                <span>Sub-Second Mesh Sync</span>
              </div>
            </motion.div>
          </div>

          {/* ─── Right Column: Realistic Browser Product Preview with Interactive Quick Switches ─── */}
          <div className="lg:col-span-7 relative">
            {/* Outer Ambient Glow Container */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#B98B4B]/15 via-teal-500/15 to-[#B98B4B]/15 rounded-3xl blur-2xl opacity-70 -z-10" />

            {/* Quick Campus Switcher Pills above preview */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 bg-[#0A131F]/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl">
              {[
                { id: "overview", label: "Campus Hub" },
                { id: "hostel", label: "Hostel Blocks" },
                { id: "academics", label: "Timetables" },
                { id: "transport", label: "Bus Fleet" },
                { id: "finance", label: "Accounting" },
                { id: "library", label: "Library" },
                { id: "clinic", label: "Campus Health" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePreset(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-ui ${
                    activePreset === tab.id
                      ? "bg-gradient-to-r from-[#B98B4B] to-[#9E743A] text-white shadow-md shadow-[#B98B4B]/30 border border-[#D4AF37]/30"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dashboard Browser Preview with Floating Glass Physics Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="relative rounded-2xl p-1 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-3xl"
            >
              <DashboardPreview data={preview} activeSidebar={activePreset} />

              {/* Floating Card 1: ACTIVE ENROLLMENT TELEMETRY */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -16 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="hidden sm:flex absolute -top-5 -left-5 p-3.5 rounded-2xl bg-[#0B1522]/95 border border-[#B98B4B]/30 shadow-2xl backdrop-blur-2xl items-center gap-3.5 z-20 text-white animate-float-slow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#B98B4B]/15 text-[#D4AF37] border border-[#B98B4B]/30 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/50 font-ui block">
                    ACTIVE ENROLLMENT
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white font-ui">
                      4,286
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 font-ui flex items-center gap-0.5">
                      <TrendingUp size={11} /> +8.4%
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2: HOSTEL CAPACITY & SMART MESS */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 16 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="hidden sm:flex absolute -bottom-5 -right-5 p-3.5 rounded-2xl bg-[#0B1522]/95 border border-teal-500/30 shadow-2xl backdrop-blur-2xl items-center gap-3.5 z-20 text-white animate-float-slow"
                style={{ animationDelay: "-4s" }}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/50 font-ui block">
                    HOSTEL CAPACITY
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white font-ui">
                      94.8%
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-400 font-ui">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                      3D Bed Matrix
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TryDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </section>
  );
}
