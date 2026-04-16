"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CircleDot,
  Ban,
  Loader2,
  type LucideIcon,
} from "lucide-react";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary" | "gold" | "outline" | "default" | "purple";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted border-transparent",
  default: "bg-surface-muted text-text-muted border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
  primary: "bg-primary-soft text-primary border-transparent",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 border",
  gold: "bg-gold/15 text-gold border-gold/30 border",
  outline: "bg-surface-muted/60 text-text-muted border-border border",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Alias for tone */
  variant?: Tone;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  tone,
  variant = "neutral",
  size = "md",
  icon,
  dot = false,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const activeTone = tone || variant;
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium leading-5 font-ui ${toneClasses[activeTone] || toneClasses.neutral} ${sizeCls} ${className}`}
      {...rest}
    >
      {dot && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {icon}
      {children}
    </span>
  );
}

/**
 * StatusBadge - semantic status vocabulary shared across the whole product.
 * Status is never communicated by color alone: every tone carries an icon.
 */
const STATUS_MAP: Record<
  string,
  { tone: Tone; icon: LucideIcon; label?: string }
> = {
  // General states
  active: { tone: "success", icon: CheckCircle2 },
  inactive: { tone: "neutral", icon: Ban },
  pending: { tone: "warning", icon: Clock },
  draft: { tone: "neutral", icon: CircleDot },
  approved: { tone: "success", icon: CheckCircle2 },
  rejected: { tone: "danger", icon: XCircle },
  "in-progress": { tone: "info", icon: Loader2 },
  completed: { tone: "success", icon: CheckCircle2 },
  verified: { tone: "success", icon: CheckCircle2 },
  critical: { tone: "danger", icon: AlertTriangle },
  warning: { tone: "warning", icon: AlertTriangle },
  // Finance
  paid: { tone: "success", icon: CheckCircle2 },
  unpaid: { tone: "warning", icon: Clock },
  overdue: { tone: "danger", icon: AlertTriangle },
  success: { tone: "success", icon: CheckCircle2 },
  failed: { tone: "danger", icon: XCircle },
  // Attendance
  present: { tone: "success", icon: CheckCircle2 },
  absent: { tone: "danger", icon: XCircle },
  late: { tone: "warning", icon: Clock },
  // Operations
  reported: { tone: "warning", icon: Clock },
  investigating: { tone: "info", icon: Loader2 },
  resolved: { tone: "success", icon: CheckCircle2 },
  scheduled: { tone: "info", icon: Clock },
  operational: { tone: "success", icon: CheckCircle2 },
  "under-review": { tone: "info", icon: Loader2 },
  maintenance: { tone: "warning", icon: AlertTriangle },
};

export interface StatusBadgeProps {
  status: string;
  /** Optional explicit label; defaults to a title-cased status. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, label, size = "md", className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim().replace(/\s+/g, "-");
  const entry = STATUS_MAP[normalized];
  if (!entry) {
    return (
      <Badge tone="neutral" size={size} className={className}>
        {label || status}
      </Badge>
    );
  }
  const Icon = entry.icon;
  return (
    <Badge tone={entry.tone} size={size} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {label || entry.label || status}
    </Badge>
  );
}

export default Badge;