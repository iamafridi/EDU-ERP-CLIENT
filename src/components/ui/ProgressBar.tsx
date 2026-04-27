"use client";

import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "gold" | "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  gold: "bg-gold",
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-teal-600",
};

const sizeStyles = {
  xs: "h-1.5",
  sm: "h-2",
  md: "h-2.5",
  lg: "h-3.5",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  showValue = true,
  size = "sm",
  variant = "gold",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-text">{label}</span>}
          {sublabel && <span className="text-text-muted text-[11px]">{sublabel}</span>}
          {showValue && (
            <span className="font-mono font-bold text-text-muted ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface-muted rounded-full overflow-hidden border border-border/40 ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}

export function StepTracker({
  steps,
  className = "",
}: {
  steps: StepItem[];
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 overflow-x-auto py-2 ${className}`}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isDone = step.status === "completed";
        const isCurrent = step.status === "current";

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? "bg-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? "bg-gold text-on-gold ring-4 ring-gold/20 shadow-xs"
                    : "bg-surface-muted text-text-subtle border border-border"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <div className="text-left">
                <div
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-gold font-bold" : isDone ? "text-text" : "text-text-subtle"
                  }`}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-[10px] text-text-muted">{step.description}</div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 min-w-[20px] transition-all ${
                  isDone ? "bg-emerald-500" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressBar;
