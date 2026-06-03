"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";

interface Program {
  name: string;
  score: number;
  color: string;
}

const PROGRAMS: Program[] = [
  { name: "Medicine", score: 84, color: "bg-gold" },
  { name: "Nursing", score: 72, color: "bg-info" },
  { name: "Pharmacy", score: 65, color: "bg-success" },
  { name: "Public Health", score: 58, color: "bg-primary" },
];

export function ProgramPerformanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-surface border border-border rounded-2xl p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/[0.08] flex items-center justify-center">
            <BarChart3 size={15} className="text-gold" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-text font-ui">Program performance</h3>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-4">
        {PROGRAMS.map((program, i) => (
          <div key={program.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-text font-ui">{program.name}</span>
              <span className="text-sm font-bold text-text tabular-nums font-ui">{program.score}%</span>
            </div>
            <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${program.score}%` }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`h-full ${program.color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Supporting text */}
      <p className="text-[11px] text-text-subtle mt-4 font-body">Based on attendance, progression & outcomes</p>

      {/* Action */}
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold hover:text-gold-hover transition-colors font-ui"
        >
          View report
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
