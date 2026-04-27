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
  items?: TabItem[];
  tabs?: TabItem[];
  /** Active tab id. */
  value?: string;
  activeTab?: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, tabs, value, activeTab, onChange, className = "" }: TabsProps) {
  const activeItems = items || tabs || [];
  const activeVal = value || activeTab || "";

  return (
    <div
      role="tablist"
      aria-label="Section tabs"
      className={`flex items-center gap-1 border-b border-border overflow-x-auto ${className}`}
    >
      {activeItems.map((tab) => {
        const selected = tab.id === activeVal;
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
              const idx = activeItems.findIndex((t) => t.id === activeVal);
              let next: number | null = null;
              if (e.key === "ArrowRight") next = (idx + 1) % activeItems.length;
              if (e.key === "ArrowLeft") next = (idx - 1 + activeItems.length) % activeItems.length;
              if (next !== null) {
                e.preventDefault();
                onChange(activeItems[next].id);
                document.getElementById(`tab-${activeItems[next].id}`)?.focus();
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