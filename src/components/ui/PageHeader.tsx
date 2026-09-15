"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-text-muted ${className}`}>
      {items.map((crumb, idx) => {
        const isLast = idx === items.length - 1;
        if (isLast || !crumb.href) {
          return (
            <span key={idx} aria-current={isLast ? "page" : undefined} className="truncate text-text-subtle">
              {crumb.label}
            </span>
          );
        }
        return (
          <React.Fragment key={idx}>
            <Link href={crumb.href} className="hover:text-text transition-colors truncate">
              {crumb.label}
            </Link>
            <ChevronRight size={12} className="text-text-subtle shrink-0" aria-hidden="true" />
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  /** Context label above the title (e.g. "Finance", "MBBS 2024") - use sparingly. */
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumb, eyebrow, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} className="mb-2" />}
        {eyebrow && <p className="text-[11px] font-medium uppercase tracking-wider text-primary mb-0.5">{eyebrow}</p>}
        <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
        {description && <p className="text-xs text-text-muted mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  className = "",
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}