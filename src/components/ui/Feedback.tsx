"use client";

import React from "react";
import { SearchX, Inbox, ShieldAlert, WifiOff, RefreshCw, AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./Button";

/** Lightweight inline spinner. Full-page spinners are avoided by design. */
export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />;
}

export type EmptyStateVariant = "none" | "search" | "filter" | "permission" | "error";

export interface EmptyStateProps {
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const variantIcon: Record<Exclude<EmptyStateVariant, "none">, React.ReactNode> = {
  search: <SearchX size={28} aria-hidden="true" />,
  filter: <SearchX size={28} aria-hidden="true" />,
  permission: <ShieldAlert size={28} aria-hidden="true" />,
  error: <AlertCircle size={28} aria-hidden="true" />,
};

export function EmptyState({
  title,
  description,
  variant = "none",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-muted text-text-subtle flex items-center justify-center mb-3">
        {icon || (variant !== "none" ? variantIcon[variant] : <Inbox size={28} aria-hidden="true" />)}
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {description && <p className="text-xs text-text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "This section could not be loaded. Your data has not been affected.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mb-3">
        <AlertCircle size={28} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="text-xs text-text-muted mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} aria-hidden="true" />} onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const alertConfig: Record<AlertTone, { cls: string; icon: React.ReactNode }> = {
  info: { cls: "bg-info-soft text-info", icon: <Info size={16} aria-hidden="true" /> },
  success: { cls: "bg-success-soft text-success", icon: <CheckCircle2 size={16} aria-hidden="true" /> },
  warning: { cls: "bg-warning-soft text-warning", icon: <AlertTriangle size={16} aria-hidden="true" /> },
  danger: { cls: "bg-danger-soft text-danger", icon: <AlertCircle size={16} aria-hidden="true" /> },
};

export function Alert({ tone = "info", title, children, className = "" }: AlertProps) {
  const cfg = alertConfig[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`rounded-md p-3 flex gap-2.5 text-xs leading-5 ${cfg.cls} ${className}`}>
      <span className="mt-0.5 shrink-0">{cfg.icon}</span>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
    </div>
  );
}

/** Convenience exports so callers can build "offline" style states. */
export { WifiOff, RefreshCw };