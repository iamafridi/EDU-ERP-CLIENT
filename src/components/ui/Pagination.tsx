"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Current range, e.g. "1-10 of 243". Shown when provided. */
  rangeLabel?: string;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, rangeLabel, className = "" }: PaginationProps) {
  if (totalPages <= 1 && !rangeLabel) return null;
  return (
    <div className={`flex items-center justify-between gap-3 flex-wrap ${className}`}>
      {rangeLabel ? (
        <span className="text-xs text-text-muted tabular-nums">{rangeLabel}</span>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <IconButton
          label="Previous page"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(page - 1, 1))}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </IconButton>
        <span className="text-xs font-medium text-text-muted tabular-nums min-w-20 text-center">
          Page {page} of {totalPages}
        </span>
        <IconButton
          label="Next page"
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(page + 1, totalPages))}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  );
}