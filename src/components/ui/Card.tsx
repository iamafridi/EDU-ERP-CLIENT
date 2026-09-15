"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding scale. Dense surfaces (tables) can opt into less padding. */
  pad?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

export function Card({ pad = "md", hoverable = false, className = "", children, ...rest }: CardProps) {
  const pads = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };
  return (
    <div
      className={`bg-surface border border-border rounded-lg shadow-sm ${pads[pad]} ${
        hoverable ? "transition-all duration-150 hover:shadow-md hover:border-border-strong" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Optional icon shown in a soft tile on the right. */
  icon?: React.ReactNode;
  /** Optional delta: positive number for improvement, negative for decline. */
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
        ? "text-danger"
        : deltaTone === "warning"
          ? "text-warning"
          : "text-text-muted";

  return (
    <Card pad="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-text-muted leading-5">{label}</p>
        {icon && (
          <span className="w-9 h-9 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-text tabular-nums leading-none">{value}</p>
        {delta !== undefined && delta !== null && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${deltaColor}`}>
            <DeltaIcon size={12} aria-hidden="true" />
            {delta !== 0 && Math.abs(delta)}
            {deltaLabel && <span className="text-text-subtle font-normal">{deltaLabel}</span>}
          </span>
        )}
      </div>
    </Card>
  );
}