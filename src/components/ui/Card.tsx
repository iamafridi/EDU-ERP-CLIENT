"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  pad?: "none" | "sm" | "md" | "lg";
  padding?: "none" | "sm" | "md" | "lg";
  noPadding?: boolean;
  hoverable?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "elevated" | "flat" | "bordered" | "gold" | string;
  orientation?: "horizontal" | "vertical" | string;
}

export function Card({
  pad,
  padding = "md",
  noPadding = false,
  hoverable = false,
  title,
  subtitle,
  action,
  variant,
  orientation,
  className = "",
  children,
  ...rest
}: CardProps) {
  const chosenPad = pad || padding;
  const effectivePad = noPadding ? "none" : chosenPad;
  const pads = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  return (
    <div
      className={`bg-surface border border-border rounded-2xl shadow-sm ${
        hoverable ? "transition-all duration-300 hover:shadow-md hover:border-border-strong" : ""
      } ${className}`}
      {...rest}
    >
      {(title || subtitle || action) && (
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-text font-display">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={pads[effectivePad]}>{children}</div>
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  delta?: number | null;
  deltaLabel?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

export function StatCard({ label, value, icon, delta, deltaLabel, tone = "default" }: StatCardProps) {
  const deltaTone =
    tone !== "default"
      ? tone
      : delta === null || delta === undefined
        ? "default"
        : delta > 0
          ? "success"
          : delta < 0
            ? "danger"
            : "default";

  const DeltaIcon =
    delta === null || delta === undefined || delta === 0 ? Minus : delta! > 0 ? ArrowUpRight : ArrowDownRight;
  const deltaColor =
    deltaTone === "success"
      ? "text-success"
      : deltaTone === "danger"
        ? "text-warning"
        : deltaTone === "warning"
          ? "text-warning"
          : "text-text-muted";

  return (
    <Card pad="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-text-muted leading-5 font-ui uppercase tracking-wider">{label}</p>
        {icon && (
          <span className="w-9 h-9 rounded-xl bg-gold/[0.06] border border-gold/10 text-gold flex items-center justify-center shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tracking-tight text-text tabular-nums leading-none font-ui">{value}</p>
        {delta !== undefined && delta !== null && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums font-ui ${deltaColor}`}>
            <DeltaIcon size={12} aria-hidden="true" />
            {delta !== 0 && Math.abs(delta)}
            {deltaLabel && <span className="text-text-subtle font-normal">{deltaLabel}</span>}
          </span>
        )}
      </div>
    </Card>
  );
}

export default Card;

