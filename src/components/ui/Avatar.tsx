"use client";

import React from "react";
import { User } from "lucide-react";

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const dims = sizes[size];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar URLs have unknown intrinsic size; next/image would require explicit dimensions
      <img
        src={src}
        alt={name || "User avatar"}
        className={`rounded-full object-cover shrink-0 bg-surface-muted ${dims} ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full shrink-0 bg-primary-soft text-primary font-semibold select-none ${dims} ${className}`}
    >
      {name ? initials(name) : <User size={size === "lg" ? 18 : size === "md" ? 15 : 12} />}
    </span>
  );
}