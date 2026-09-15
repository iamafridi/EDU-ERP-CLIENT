"use client";

import React, { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  /** Optional count shown as a trailing number (e.g. unread count). */
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Active tab id. */
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Section tabs"
      className={`flex items-center gap-1 border-b border-border overflow-x-auto ${className}`}
    >
      {items.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => {
              // Arrow-key navigation between tabs
              const idx = items.findIndex((t) => t.id === value);
              let next: number | null = null;
              if (e.key === "ArrowRight") next = (idx + 1) % items.length;
              if (e.key === "ArrowLeft") next = (idx - 1 + items.length) % items.length;
              if (next !== null) {
                e.preventDefault();
                onChange(items[next].id);
                document.getElementById(`tab-${items[next].id}`)?.focus();
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 h-10 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
              selected
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text hover:border-border-strong"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                selected ? "bg-primary-soft text-primary" : "bg-surface-muted text-text-muted"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Convenience: controlled-uncontrolled hybrid for quick use.
 * Use <Tabs> directly when the page already tracks state.
 */
export function useTabs(initial: string) {
  const [value, setValue] = useState(initial);
  return { value, onChange: setValue };
}