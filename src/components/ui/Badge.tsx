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

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-muted border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
  primary: "bg-primary-soft text-primary border-transparent",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: React.ReactNode;
  dot?: boolean;
}

export function Badge({ tone = "neutral", icon, dot = false, className = "", children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-5 ${toneClasses[tone]} ${className}`}
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
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim().replace(/\s+/g, "-");
  const entry = STATUS_MAP[normalized];
  if (!entry) {
    return (
      <Badge tone="neutral" className={className}>
        {label || status}
      </Badge>
    );
  }
  const Icon = entry.icon;
  return (
    <Badge tone={entry.tone} icon={<Icon size={12} aria-hidden="true" />} className={className}>
      {label || entry.label || status}
    </Badge>
  );
}