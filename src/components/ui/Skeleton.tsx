"use client";

import React from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SkeletonProps {
  className?: string;
  variant?: "pulse" | "shimmer" | "glass";
}

export function Skeleton({ className = "", variant = "shimmer" }: SkeletonProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={`bg-surface-muted/60 rounded ${className}`} />;
  }

  if (variant === "glass") {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-white/40 border border-white/30 backdrop-blur-md ${className}`}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-surface-muted/70 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-surface-muted/30">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 shrink-0" />
          <Skeleton className="h-10 w-24 shrink-0" />
        </div>
      </div>
      <div className="p-4 divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-between bg-surface-muted/20">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-surface border border-border p-6 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <div className="pt-2 border-t border-border/40 flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="bg-surface border border-border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-[260px] w-full rounded-xl" />
    </div>
  );
}

export function WelcomeBannerSkeleton() {
  return (
    <div className="bg-gradient-to-r from-surface to-surface-muted border border-border p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-80 rounded-lg" />
        <Skeleton className="h-4 w-[420px] max-w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border/50">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5 p-3 rounded-xl bg-surface-muted/30">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <WelcomeBannerSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}
