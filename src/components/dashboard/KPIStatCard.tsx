"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface SparklinePoint {
  value: number;
}

interface KPIStatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  sparkline?: SparklinePoint[];
  accentColor?: string;
  delay?: number;
}

function MiniSparkline({ data, color = "var(--gold)" }: { data: SparklinePoint[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const padding = 2;

  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + ((max - d.value) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <defs>
        <linearGradient id={`spark-fill-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-fill-${color.replace(/[^a-z0-9]/gi, "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KPIStatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  sparkline,
  delay = 0,
}: KPIStatCardProps) {
  const trendColor =
    trend === undefined || trend === null
      ? "text-text-subtle"
      : trend > 0
        ? "text-success"
        : trend < 0
          ? "text-warning"
          : "text-text-subtle";

  const TrendIcon =
    trend === undefined || trend === null || trend === 0
      ? Minus
      : trend > 0
        ? ArrowUpRight
        : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-surface border border-border rounded-2xl p-5 hover:shadow-md hover:border-border-strong transition-all duration-300 overflow-hidden"
    >
      {/* Subtle gold top accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/40 transition-all duration-500" />

      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-primary/[0.04] border border-primary/[0.06] flex items-center justify-center shrink-0 text-primary group-hover:bg-gold/[0.08] group-hover:border-gold/20 group-hover:text-gold transition-all duration-300">
          {icon}
        </div>
        {/* Sparkline */}
        {sparkline && <MiniSparkline data={sparkline} />}
      </div>

      {/* Label */}
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted mb-1.5 font-ui">{label}</p>

      {/* Value + Trend */}
      <div className="flex items-end justify-between gap-2">
        <p className="text-[26px] font-bold tracking-tight text-text tabular-nums leading-none font-ui">{value}</p>
        {trend !== undefined && trend !== null && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums font-ui ${trendColor}`}>
            <TrendIcon size={12} aria-hidden="true" />
            {trend !== 0 && `${Math.abs(trend)}%`}
            {trendLabel && <span className="text-text-subtle font-normal ml-0.5">{trendLabel}</span>}
          </span>
        )}
      </div>
    </motion.div>
  );
}
