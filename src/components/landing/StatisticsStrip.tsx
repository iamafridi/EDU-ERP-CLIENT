"use client";

import React from "react";
import { motion } from "framer-motion";

const STATS = [
  { value: "97+", label: "Connected Campus Modules", note: "Zero Data Silos" },
  { value: "5", label: "Cryptographic RBAC Roles", note: "Domain Isolated" },
  { value: "৳4.8M+", label: "Daily Ledger Throughput", note: "Sonali & bKash Mesh" },
  { value: "99.98%", label: "Operational SLA Uptime", note: "Continuous Sync" },
];

export default function StatisticsStrip() {
  return (
    <section className="py-16 bg-[#060B12] border-b border-white/[0.08] text-white relative overflow-hidden">
      <div className="absolute inset-0 blueprint-dots-bg opacity-15 pointer-events-none -z-10" />
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="border-l-2 border-[#B98B4B]/40 pl-5 sm:pl-6 group hover:border-[#D4AF37] transition-colors"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#D4AF37] tracking-tight font-ui tabular-nums">
                {stat.value}
              </div>
              <p className="text-xs sm:text-sm text-white/80 font-bold font-ui mt-1.5">
                {stat.label}
              </p>
              <p className="text-[11px] text-white/40 font-mono mt-0.5">
                {stat.note}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
