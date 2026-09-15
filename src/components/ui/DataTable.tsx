"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, useSyncExternalStore } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Save,
  Trash2,
  Check,
  Columns3,
  FileSpreadsheet,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button, IconButton } from "./Button";
import { EmptyState, ErrorState, Spinner } from "./Feedback";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  id?: string;
  hideable?: boolean;
  /** Disable sorting for this column (sortable by default when accessor is a key). */
  sortable?: boolean;
  /** Extract a comparable value for sorting when accessor renders nodes. */
  sortValue?: (row: T) => string | number;
  /** Hide this column by default (user can re-enable via the column menu). */
  defaultHidden?: boolean;
  /** Hide this column below lg screens even if selected (priority columns). */
  priority?: "high" | "medium" | "low";
}

type SortState = { columnId: string; direction: "asc" | "desc" } | null;

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  filterComponent?: React.ReactNode;
  tableId?: string;
  /** Show skeleton rows instead of the table body. */
  loading?: boolean;
  /** Show a page-level error state with retry. */
  error?: boolean;
  onRetry?: () => void;
  /** Enable row selection with a bulk-actions bar. */
  selectable?: boolean;
  /** Stable key per row for selection/export. Defaults to index. */
  rowKey?: (row: T) => string;
  /** Rendered in the bulk bar when rows are selected (buttons etc). */
  bulkActions?: (selectedRows: T[], clear: () => void) => React.ReactNode;
  /** Row click handler (adds pointer affordance). */
  onRowClick?: (row: T) => void;
  /** Rows per page. Default 10. */
  pageSize?: number;
  /** Compact row height for operational surfaces. Default "comfortable". */
  density?: "comfortable" | "compact";
  /** Empty-state copy when there is no data at all. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

function loadSavedFilters(tableId: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`dt-filters-${tableId}`) || "{}");
  } catch {
    return {};
  }
}

function saveFiltersToStorage(tableId: string, filters: Record<string, string>) {
  localStorage.setItem(`dt-filters-${tableId}`, JSON.stringify(filters));
}

function loadColumnState(tableId: string): string[] | null {
  try {
    return JSON.parse(localStorage.getItem(`dt-columns-${tableId}`) || "null");
  } catch {
    return null;
  }
}

function saveColumnState(tableId: string, visible: string[]) {
  localStorage.setItem(`dt-columns-${tableId}`, JSON.stringify(visible));
}

function cellText<T>(col: Column<T>, row: T): string | number {
  if (col.sortValue) return col.sortValue(row);
  if (typeof col.accessor === "function") return "";
  const v = row[col.accessor];
  if (typeof v === "number") return v;
  if (typeof v === "string") return v.toLowerCase();
  return "";
}

export default function DataTable<T>({
  data = [],
  columns,
  searchPlaceholder = "Search records...",
  searchField,
  filterComponent,
  tableId,
  loading = false,
  error = false,
  onRetry,
  selectable = false,
  rowKey,
  bulkActions,
  onRowClick,
  pageSize = 10,
  density = "comfortable",
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [savedFilters, setSavedFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  const columnIds = useMemo(() => columns.map((c) => c.id || c.header), [columns]);

  // Load persisted filters/columns after hydration via the adjust-during-render
  // pattern (no setState inside effects). Re-runs when tableId or columns change.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const loadKey = `${tableId ?? ""}|${columnIds.join(",")}`;
  const [prevLoadKey, setPrevLoadKey] = useState<string | null>(null);
  if (mounted && prevLoadKey !== loadKey) {
    setPrevLoadKey(loadKey);
    setSavedFilters(tableId ? loadSavedFilters(tableId) : {});
    const saved = tableId ? loadColumnState(tableId) : null;
    setVisibleColumns(saved ?? columnIds);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) setShowColumnMenu(false);
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) setShowSaveMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Page is clamped to totalPages below, so no reset effect is needed.

  const toggleColumn = useCallback(
    (colId: string) => {
      setVisibleColumns((prev) => {
        const next = prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId];
        if (tableId) saveColumnState(tableId, next);
        return next;
      });
    },
    [tableId],
  );

  const visibleCols = columns.filter((c) => visibleColumns.includes(c.id || c.header));

  const filteredData = useMemo(() => {
    let rows = data;
    if (searchTerm && searchField) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter((item) => {
        const value = item[searchField];
        if (typeof value === "string") return value.toLowerCase().includes(q);
        if (typeof value === "number") return value.toString().includes(q);
        return true;
      });
    }
    if (sort) {
      const col = columns.find((c) => (c.id || c.header) === sort.columnId);
      if (col) {
        const dir = sort.direction === "asc" ? 1 : -1;
        rows = [...rows].sort((a, b) => {
          const av = cellText(col, a);
          const bv = cellText(col, b);
          if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
          return String(av).localeCompare(String(bv)) * dir;
        });
      }
    }
    return rows;
  }, [data, searchTerm, searchField, sort, columns]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startRange = (safePage - 1) * pageSize + 1;
  const endRange = Math.min(safePage * pageSize, filteredData.length);

  const keyFor = useCallback(
    (row: T, idx: number) => (rowKey ? rowKey(row) : String(idx)),
    [rowKey],
  );

  const toggleRow = useCallback(
    (key: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [],
  );

  const allPageKeys = paginatedData.map((r, i) => keyFor(r, i));
  const allSelected = allPageKeys.length > 0 && allPageKeys.every((k) => selected.has(k));
  function toggleAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) allPageKeys.forEach((k) => next.delete(k));
      else allPageKeys.forEach((k) => next.add(k));
      return next;
    });
  }

  const selectedRows = data.filter((r, i) => selected.has(keyFor(r, i)));

  const handleSort = useCallback(
    (col: Column<T>) => {
      const id = col.id || col.header;
      const canSort = col.sortable !== false && (col.sortValue || typeof col.accessor !== "function");
      if (!canSort) return;
      setSort((prev) => {
        if (prev?.columnId === id) {
          if (prev.direction === "asc") return { columnId: id, direction: "desc" };
          return null;
        }
        return { columnId: id, direction: "asc" };
      });
    },
    [],
  );

  const applySavedFilter = useCallback(
    (name: string) => {
      setSearchTerm(savedFilters[name] || "");
      setCurrentPage(1);
      setShowSaveMenu(false);
    },
    [savedFilters],
  );

  const saveCurrentFilter = useCallback(() => {
    if (!filterName.trim() || !tableId) return;
    const updated = { ...savedFilters, [filterName.trim()]: searchTerm };
    setSavedFilters(updated);
    saveFiltersToStorage(tableId, updated);
    setFilterName("");
    setShowSaveMenu(false);
  }, [filterName, searchTerm, savedFilters, tableId]);

  const deleteSavedFilter = useCallback(
    (name: string) => {
      if (!tableId) return;
      const updated = { ...savedFilters };
      delete updated[name];
      setSavedFilters(updated);
      saveFiltersToStorage(tableId, updated);
    },
    [savedFilters, tableId],
  );

  const exportToExcel = useCallback(() => {
    const exportData = filteredData.map((row) => {
      const obj: Record<string, unknown> = {};
      visibleCols.forEach((col) => {
        obj[col.header] = typeof col.accessor === "function" ? "" : row[col.accessor];
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `export-${tableId || "data"}-${new Date().toISOString().split("T")[0]}.xlsx`);
  }, [filteredData, visibleCols, tableId]);

  const hideableCols = columns.filter((c) => c.hideable !== false);
  const rowHeight = density === "compact" ? "h-9" : "h-12";

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-muted/40">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            aria-label={searchPlaceholder}
            className="w-full h-9 pl-9 pr-8 bg-surface border border-border-strong rounded-md text-[13px] text-text placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text cursor-pointer"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportToExcel} leftIcon={<FileSpreadsheet size={13} aria-hidden="true" />}>
            Export
          </Button>

          {tableId && (
            <>
              <div className="relative" ref={saveMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveMenu(!showSaveMenu)}
                  aria-expanded={showSaveMenu}
                  leftIcon={<Save size={13} aria-hidden="true" />}
                >
                  Saved
                </Button>
                {showSaveMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-surface-raised border border-border rounded-lg shadow-md z-20 p-1.5">
                    <div className="flex items-center gap-1.5 px-1.5 py-1">
                      <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Filter name..."
                        aria-label="Filter name"
                        className="flex-1 h-7 px-2 bg-surface-muted border border-border rounded text-xs outline-none focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCurrentFilter();
                        }}
                      />
                      <IconButton label="Save filter" size="sm" variant="primary" onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                        <Check size={12} aria-hidden="true" />
                      </IconButton>
                    </div>
                    <div className="border-t border-border mt-1 pt-1 max-h-40 overflow-y-auto">
                      {Object.keys(savedFilters).length === 0 && (
                        <div className="px-2 py-2.5 text-[11px] text-text-subtle text-center">No saved filters</div>
                      )}
                      {Object.keys(savedFilters).map((name) => (
                        <div key={name} className="flex items-center justify-between px-1.5 py-1 rounded-md hover:bg-surface-muted group">
                          <button
                            type="button"
                            onClick={() => applySavedFilter(name)}
                            className="flex-1 text-left text-xs text-text-muted hover:text-text cursor-pointer"
                          >
                            {name}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedFilter(name)}
                            aria-label={`Delete saved filter ${name}`}
                            className="w-6 h-6 rounded flex items-center justify-center text-text-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={columnMenuRef}>
                <Button
                  variant={showColumnMenu ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  aria-expanded={showColumnMenu}
                  leftIcon={<Columns3 size={13} aria-hidden="true" />}
                >
                  Columns
                </Button>
                {showColumnMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-surface-raised border border-border rounded-lg shadow-md z-20 p-1.5">
                    {hideableCols.map((col) => {
                      const id = col.id || col.header;
                      const isVisible = visibleColumns.includes(id);
                      return (
                        <button
                          type="button"
                          key={id}
                          onClick={() => toggleColumn(id)}
                          role="menuitemcheckbox"
                          aria-checked={isVisible}
                          className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-surface-muted text-left transition-colors cursor-pointer"
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isVisible ? "bg-primary border-primary" : "border-border-strong"
                          }`}>
                            {isVisible && <Check size={11} className="text-on-primary" aria-hidden="true" />}
                          </span>
                          <span className="text-xs text-text-muted">{col.header}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {filterComponent && (
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              leftIcon={<SlidersHorizontal size={13} aria-hidden="true" />}
            >
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && filterComponent && (
        <div className="p-4 bg-surface-muted/40 border-b border-border">{filterComponent}</div>
      )}

      {/* Bulk actions bar */}
      {selectable && selected.size > 0 && (
        <div className="px-3 py-2 border-b border-border bg-primary-soft flex items-center justify-between gap-3 flex-wrap" aria-live="polite">
          <span className="text-xs font-medium text-primary tabular-nums">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {bulkActions?.(selectedRows, () => setSelected(new Set()))}
            <IconButton label="Clear selection" size="sm" onClick={() => setSelected(new Set())}>
              <X size={14} aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-x-auto min-h-0">
        {error ? (
          <ErrorState onRetry={onRetry} className="py-16" />
        ) : loading ? (
          <div className="p-4 space-y-2.5" aria-busy="true" aria-label="Loading data">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                {visibleCols.slice(0, 6).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 flex-1 rounded bg-surface-muted animate-pulse"
                    style={{ animationDelay: `${j * 60}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-muted border-b border-border">
                {selectable && (
                  <th scope="col" className="h-10 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAllPage}
                      aria-label="Select all rows on this page"
                      className="w-4 h-4 rounded border-border-strong accent-[var(--primary)] cursor-pointer"
                    />
                  </th>
                )}
                {visibleCols.map((col, idx) => {
                  const id = col.id || col.header;
                  const canSort = col.sortable !== false && (col.sortValue || typeof col.accessor !== "function");
                  const isSorted = sort?.columnId === id;
                  const SortIcon = isSorted ? (sort!.direction === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
                  return (
                    <th
                      key={idx}
                      scope="col"
                      aria-sort={isSorted ? (sort!.direction === "asc" ? "ascending" : "descending") : undefined}
                      className={`h-10 px-4 text-[11px] font-semibold text-text-muted uppercase tracking-wide select-none ${col.className || ""}`}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col)}
                          className="inline-flex items-center gap-1 hover:text-text transition-colors cursor-pointer"
                        >
                          {col.header}
                          <SortIcon size={12} className={isSorted ? "text-primary" : "text-text-subtle"} aria-hidden="true" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => {
                  const key = keyFor(row, rowIdx);
                  const isSelected = selected.has(key);
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`${rowHeight} border-b border-border/70 last:border-0 transition-colors ${
                        isSelected ? "bg-primary-soft/50" : "hover:bg-surface-muted/50"
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {selectable && (
                        <td className="px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                            aria-label={`Select row ${rowIdx + 1}`}
                            className="w-4 h-4 rounded border-border-strong accent-[var(--primary)] cursor-pointer"
                          />
                        </td>
                      )}
                      {visibleCols.map((col, colIdx) => {
                        const cellContent =
                          typeof col.accessor === "function"
                            ? col.accessor(row)
                            : (row[col.accessor] as React.ReactNode);
                        return (
                          <td key={colIdx} className={`px-4 text-[13px] text-text ${col.className || ""}`}>
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleCols.length + (selectable ? 1 : 0)} className="p-0">
                    {data.length === 0 ? (
                      <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        action={emptyAction}
                      />
                    ) : (
                      <EmptyState
                        variant="filter"
                        title="No matching records"
                        description="Try adjusting your search or clearing the filters."
                        action={
                          searchTerm ? (
                            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                              Clear search
                            </Button>
                          ) : undefined
                        }
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="px-3 py-2.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 bg-surface-muted/40">
        <span className="text-xs text-text-muted tabular-nums">
          {filteredData.length > 0 ? `${startRange}-${endRange}` : "0"} of {filteredData.length}
        </span>
        <div className="flex items-center gap-1.5">
          <IconButton
            label="Previous page"
            size="sm"
            variant="outline"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </IconButton>
          <span className="text-xs font-medium text-text-muted tabular-nums min-w-20 text-center">
            Page {safePage} of {totalPages}
          </span>
          <IconButton
            label="Next page"
            size="sm"
            variant="outline"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            <ChevronRight size={15} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export { Spinner };