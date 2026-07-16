"use client";

import React from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  const reduced = useReducedMotion();
  return (
    <div
      className={`${reduced ? "bg-slate-200" : "animate-pulse bg-slate-200 rounded"} ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#e1e2ed] flex items-center gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-24 shrink-0" />
        <Skeleton className="h-10 w-24 shrink-0" />
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-[#e1e2ed]/50 last:border-0">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-[#e1e2ed] flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="bg-white border border-[#e1e2ed] p-4 sm:p-6 rounded-xl">
      <Skeleton className="h-4 w-48 mb-4" />
      <Skeleton className="h-[260px] w-full rounded-lg" />
    </div>
  );
}

export function WelcomeBannerSkeleton() {
  return (
    <div className="bg-white border border-[#e1e2ed] p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-3 w-96" />
      </div>
      <Skeleton className="h-8 w-36 rounded-lg" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <ChartCardSkeleton key={i} />
        ))}
        {Array.from({ length: 2 }).map((_, i) => (
          <ChartCardSkeleton key={i + 2} />
        ))}
        <div className="lg:col-span-2">
          <ChartCardSkeleton />
        </div>
      </div>
    </div>
  );
}
