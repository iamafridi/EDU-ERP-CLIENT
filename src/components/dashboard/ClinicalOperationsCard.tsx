"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

interface ClinicalStat {
  label: string;
  value: string;
}

const STATS: ClinicalStat[] = [
  { label: "OPD visits today", value: "186" },
  { label: "Lab turnaround", value: "42 min avg." },
  { label: "Pharmacy fill rate", value: "98.6%" },
];

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 58;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-[130px] h-[130px]">
      <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="65"
          cy="65"
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <motion.circle
          cx="65"
          cy="65"
          r={normalizedRadius}
          fill="none"
          stroke="#B98B4B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-bold text-white tabular-nums leading-none font-ui">{percentage}%</span>
        <span className="text-[10px] text-white/40 mt-1 font-ui uppercase tracking-wider">occupied</span>
      </div>
    </div>
  );
}

export function ClinicalOperationsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative bg-surface-navy rounded-2xl p-6 sm:p-7 overflow-hidden"
    >
      {/* Decorative gold circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full border border-gold/[0.06]" />
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border border-gold/[0.04]" />
      <div className="absolute bottom-8 -left-8 w-24 h-24 rounded-full border border-gold/[0.05]" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h3 className="text-lg font-bold text-white font-display italic">Care, in balance.</h3>
        <p className="text-[12px] text-white/40 mt-1 font-body">Real-time view of the university health center.</p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
        {/* Circular progress */}
        <CircularProgress percentage={74} />

        {/* Stats */}
        <div className="flex-1 space-y-3 w-full">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-[12px] text-white/50 font-body">{stat.label}</span>
              <span className="text-[13px] font-semibold text-white tabular-nums font-ui">{stat.value}</span>
            </div>
          ))}

          {/* Status */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-semibold text-success font-ui">All clear</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.06]">
        <Link
          href="/opd"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-[12px] font-semibold text-gold hover:bg-gold/15 hover:border-gold/30 transition-all duration-200 font-ui"
        >
          <Activity size={14} aria-hidden="true" />
          Open clinical command center
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
