"use client";

import React from "react";
import { SectionHeader } from "./PageHeader";

/** Label/value pairs in a responsive grid - for detail pages. */
export function KeyValueGrid({
  items,
  columns = 2,
  className = "",
}: {
  items: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const cols = columns === 1 ? "grid-cols-1" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <dl className={`grid grid-cols-1 ${cols} gap-x-6 gap-y-4 ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[11px] font-medium text-text-subtle uppercase tracking-wide">{item.label}</dt>
          <dd className="text-sm text-text mt-0.5 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Simple definition list for compact metadata (one column). */
export function InfoList({
  items,
  className = "",
}: {
  items: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={`space-y-2.5 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
          <dt className="text-xs text-text-muted shrink-0">{item.label}</dt>
          <dd className="text-xs text-text text-right font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Grouped form section: title + optional description + field grid. */
export function FormSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <SectionHeader title={title} description={description} />
      {children}
    </section>
  );
}