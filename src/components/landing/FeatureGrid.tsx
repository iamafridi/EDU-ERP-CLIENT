"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Building2,
  Calendar,
  Bus,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface FeatureCardItem {
  icon: typeof Layers;
  title: string;
  description: string;
  colorTone: "teal" | "gold" | "navy";
  highlightBadge: string;
}

const FEATURES: FeatureCardItem[] = [
  {
    icon: Layers,
    title: "Unified Campus Operating System",
    description: "A synchronized single source of truth for student enrollment, timetables, dormitories, transit fleets, and 5-tier institutional finance.",
    colorTone: "gold",
    highlightBadge: "Synchronized Core",
  },
  {
    icon: ShieldCheck,
    title: "Domain-Aware Cryptographic RBAC",
    description: "Strict isolation giving wardens, finance treasurers, faculty deans, medical superintendents, and provosts dedicated workspaces.",
    colorTone: "navy",
    highlightBadge: "Zero-Trust",
  },
  {
    icon: Calendar,
    title: "Welsh-Powell Conflict-Free Timetabling",
    description: "Algorithmic graph coloring schedules faculty, lecture halls, laboratory rotations, and exam seating with 0 conflicts.",
    colorTone: "teal",
    highlightBadge: "Graph Coloring",
  },
  {
    icon: Building2,
    title: "Hostel & 3D Bed Matrix Precision",
    description: "Multi-block dormitories, biometric gate scanners, warden digital out-passes, RFID dining mess ledgers, and maintenance repair tickets.",
    colorTone: "gold",
    highlightBadge: "3D Matrix",
  },
  {
    icon: Bus,
    title: "Transit IoT & Bus Fleet Mesh",
    description: "GPS-monitored student bus routes, designated neighborhood stops, driver roster shifts, and tamper-proof digital transit passes.",
    colorTone: "teal",
    highlightBadge: "GPS Telemetry",
  },
  {
    icon: DollarSign,
    title: "Double-Entry GAAP Institutional Finance",
    description: "5-tier Chart of Accounts, 3-part bank challans, promissory notes, tuition demand batches, and automated bank reconciliation.",
    colorTone: "gold",
    highlightBadge: "GAAP Subledgers",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-[#060B12] text-white relative overflow-hidden border-t border-b border-white/[0.06]">
      {/* ─── Ambient Blueprint Grid & Glow Physics ─── */}
      <div className="absolute inset-0 blueprint-grid-bg opacity-30 radial-fade-mask-bottom pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#B98B4B]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#0F766E]/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#D4AF37] font-ui">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span>THE HOSTEL PRO-ERP ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight font-display">
            Engineered with{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF]">
              uncompromising rigor
            </span>
            .
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-body">
            Purpose-built for premier medical colleges, residential universities, and multi-campus institutions.
          </p>
        </div>

        {/* 3-Column Luxury Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="group p-8 rounded-3xl luxury-glass-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Icon Tile */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border ${
                        item.colorTone === "teal"
                          ? "bg-[#0F766E]/20 text-teal-400 border-teal-500/30"
                          : item.colorTone === "gold"
                          ? "bg-[#B98B4B]/20 text-[#D4AF37] border-[#B98B4B]/35"
                          : "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-white/60 border border-white/10 font-bold">
                      {item.highlightBadge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-ui mb-3 group-hover:text-[#D4AF37] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-white/70 leading-relaxed font-body">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                  <Link
                    href="/modules"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] hover:text-white font-ui cursor-pointer group-hover:translate-x-1 transition-transform"
                  >
                    <span>Inspect module specs</span>
                    <ChevronRight size={14} />
                  </Link>
                  <span className="text-[10px] text-white/30 font-mono">SEC-0{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
