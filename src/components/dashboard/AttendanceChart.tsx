"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

const WEEK_DATA = [
  { day: "Mon", attendance: 91.2, target: 90 },
  { day: "Tue", attendance: 93.5, target: 90 },
  { day: "Wed", attendance: 92.1, target: 90 },
  { day: "Thu", attendance: 94.8, target: 90 },
  { day: "Fri", attendance: 92.8, target: 90 },
  { day: "Sat", attendance: 89.3, target: 90 },
  { day: "Sun", attendance: 88.1, target: 90 },
];

const MONTH_DATA = [
  { day: "Week 1", attendance: 90.5, target: 90 },
  { day: "Week 2", attendance: 92.3, target: 90 },
  { day: "Week 3", attendance: 93.1, target: 90 },
  { day: "Week 4", attendance: 92.8, target: 90 },
];

interface AttendanceChartProps {
  currentRate?: number;
  trend?: number;
}

export function AttendanceChart({ currentRate = 92.8, trend = 2.1 }: AttendanceChartProps) {
  const [range, setRange] = useState<"week" | "month">("week");
  const data = range === "week" ? WEEK_DATA : MONTH_DATA;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-surface border border-border rounded-2xl p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-text font-ui">Attendance & engagement</h3>
          <p className="text-xs text-text-muted mt-0.5 font-body">Average attendance across all active programs</p>
        </div>
        {/* Range toggle */}
        <div className="flex items-center bg-surface-muted rounded-xl p-0.5 border border-border">
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer font-ui ${
                range === r
                  ? "bg-surface text-text shadow-sm border border-border"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {r === "week" ? "This week" : "This month"}
            </button>
          ))}
        </div>
      </div>

      {/* Current rate */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-text tabular-nums font-ui">{currentRate}%</span>
        <span className="text-xs font-semibold text-success font-ui">+{trend}%</span>
        <span className="text-xs text-text-subtle font-body">compared to previous period</span>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B98B4B" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#B98B4B" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-subtle)", fontFamily: "var(--font-ui)" }}
            />
            <YAxis
              domain={[85, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-subtle)", fontFamily: "var(--font-ui)" }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "12px",
                fontFamily: "var(--font-ui)",
                boxShadow: "var(--shadow-md)",
              }}
            />
            <ReferenceLine
              y={90}
              stroke="var(--border-strong)"
              strokeDasharray="6 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="#B98B4B"
              strokeWidth={2.5}
              fill="url(#goldGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#B98B4B",
                stroke: "#FFFEFA",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + Link */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full bg-gold" />
            <span className="text-[11px] text-text-muted font-ui">Attendance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full bg-border-strong border-dashed" />
            <span className="text-[11px] text-text-muted font-ui">Target baseline · 90%</span>
          </div>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:text-gold-hover transition-colors font-ui"
        >
          View detailed analytics
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
