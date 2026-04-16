"use client";

import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover shadow-sm active:shadow-none",
  secondary:
    "bg-primary-soft text-primary hover:bg-primary-soft/70 active:bg-primary-soft",
  outline:
    "bg-surface text-text border border-border hover:border-border-strong hover:bg-surface-muted active:bg-surface-muted",
  ghost: "bg-transparent text-text-muted hover:bg-surface-muted hover:text-text",
  danger: "bg-danger text-white hover:opacity-90 shadow-sm active:shadow-none",
  gold: "bg-gold text-on-gold hover:bg-gold-hover shadow-sm active:shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  icon,
  className = "",
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const effectiveLeftIcon = leftIcon || icon;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-ui ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" aria-hidden="true" />
      ) : (
        effectiveLeftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  size?: ButtonSize;
  variant?: "ghost" | "outline" | "primary" | "danger";
  active?: boolean;
  icon?: React.ReactNode;
}

export function IconButton({
  label,
  size = "md",
  variant = "ghost",
  active = false,
  className = "",
  children,
  icon,
  ...rest
}: IconButtonProps) {
  const effectiveLabel = label || (rest.title as string) || (rest["aria-label"] as string) || "action";
  const dims: Record<ButtonSize, string> = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-11 h-11",
  };
  const variantCls =
    variant === "outline"
      ? "border border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text"
      : variant === "primary"
        ? "bg-primary text-on-primary hover:bg-primary-hover"
        : variant === "danger"
          ? "text-danger hover:bg-danger-soft"
          : active
            ? "bg-gold/[0.08] text-gold"
            : "text-text-muted hover:bg-surface-muted hover:text-text";
  return (
    <button
      type="button"
      aria-label={effectiveLabel}
      title={effectiveLabel}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${dims[size]} ${variantCls} ${className}`}
      {...rest}
    >
      {children || icon}
    </button>
  );
}

export default Button;

