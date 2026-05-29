"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  BookOpen,
  Bus,
  DollarSign,
  Library,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  Utensils,
  Sparkles,
} from "lucide-react";
import { useToast } from "./ToastFeedback";

interface ModulePill {
  title: string;
  icon: typeof Building2;
  count: string;
  details: string;
  colorTone: "gold" | "teal" | "navy";
}

const MODULES: ModulePill[] = [
  {
    title: "Hostels & 3D Dormitories",
    icon: Building2,
    count: "14 modules",
    details: "Multi-block wings, 3D bed matrix, warden approvals, biometric gate out-passes & repair maintenance tickets.",
    colorTone: "gold",
  },
  {
    title: "Classes & Timetables",
    icon: BookOpen,
    count: "18 modules",
    details: "Dynamic constraint-solver timetables, lecture room capacity, RFID attendance & exam seating admit cards.",
    colorTone: "teal",
  },
  {
    title: "Smart Mess & Cafeteria",
    icon: Utensils,
    count: "10 modules",
    details: "Digital meal card RFID scanner, resident meal balance ledgers, diet schedules & bulk kitchen procurement.",
    colorTone: "gold",
  },
  {
    title: "Bus Fleet & Transit Mesh",
    icon: Bus,
    count: "8 modules",
    details: "Neighborhood pickup routes, designated bus stops, GPS fleet tracking, driver rosters & digital transit passes.",
    colorTone: "teal",
  },
  {
    title: "Double-Entry GAAP Finance",
    icon: DollarSign,
    count: "16 modules",
    details: "GAAP 5-tier general ledger, tuition demand batches, bank feed reconciliations & faculty salary slips.",
    colorTone: "gold",
  },
  {
    title: "Library Dewey Circulation",
    icon: Library,
    count: "10 modules",
    details: "Dewey Decimal accession cataloging, rapid barcode counter checkouts, overdue fines & digital thesis repositories.",
    colorTone: "navy",
  },
  {
    title: "Campus Health & Infirmary",
    icon: Stethoscope,
    count: "12 modules",
    details: "Campus infirmary beds, OPD triage desks, digital prescription records & pharmacy inventory tracking.",
    colorTone: "teal",
  },
];

export default function ModuleCoverage() {
  const { showToast } = useToast();

  return (
    <section id="modules" className="py-24 lg:py-32 bg-[#070D14] text-white relative overflow-hidden border-b border-white/[0.08]">
      {/* ─── Volumetric Light & Blueprint Matrix ─── */}
      <div className="absolute inset-0 blueprint-grid-gold opacity-25 radial-fade-mask-bottom pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#B98B4B]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[#0F766E]/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-5 space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#D4AF37] font-ui">
              <Sparkles size={12} className="text-[#D4AF37]" />
              <span>SYSTEM-WIDE CAMPUS SCOPE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight font-display leading-[1.12]">
              From residence halls{" "}
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF]">
                to lecture halls &amp; transit
              </span>
              .
            </h2>

            <p className="text-base sm:text-lg text-white/75 leading-relaxed font-body">
              Every essential campus workflow has a dedicated, interconnected subsystem. Zero manual double-entry, zero lost records.
            </p>

            <div className="pt-2 space-y-3.5">
              {[
                "Zero manual double-entry across 97 distinct campus submodules",
                "Dedicated domain portals for wardens, accountants, deans & fleet heads",
                "Full operational and regulatory audit readiness built in",
              ].map((point, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-white/85 font-ui">
                  <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Link
                href="/modules"
                className="h-12 px-7 bg-gradient-to-r from-[#B98B4B] to-[#9E743A] hover:brightness-110 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2.5 shadow-xl shadow-[#B98B4B]/25 font-ui cursor-pointer border border-[#E5C384]/30"
              >
                <span>View Full Modules Directory &amp; Mindmap</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column: Module Pills / Cards */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MODULES.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    onClick={() =>
                      showToast(`Selected ${mod.title} module group (${mod.count}). Detailed in /modules.`, "info")
                    }
                    className="group p-5 rounded-2xl luxury-glass-card hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 border ${
                            mod.colorTone === "gold"
                              ? "bg-[#B98B4B]/20 text-[#D4AF37] border-[#B98B4B]/30"
                              : mod.colorTone === "teal"
                              ? "bg-[#0F766E]/20 text-teal-400 border-teal-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <h3 className="text-base font-bold text-white font-ui group-hover:text-[#D4AF37] transition-colors">
                          {mod.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/10">
                        {mod.count}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-body">
                      {mod.details}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
