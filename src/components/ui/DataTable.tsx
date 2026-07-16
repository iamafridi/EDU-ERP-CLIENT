"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Settings, Save, Trash2, Check, Columns3, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  id?: string;
  hideable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  filterComponent?: React.ReactNode;
  tableId?: string;
}

function loadSavedFilters(tableId: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`dt-filters-${tableId}`) || "{}");
  } catch { return {}; }
}

function saveFiltersToStorage(tableId: string, filters: Record<string, string>) {
  localStorage.setItem(`dt-filters-${tableId}`, JSON.stringify(filters));
}

function loadColumnState(tableId: string): string[] | null {
  try {
    return JSON.parse(localStorage.getItem(`dt-columns-${tableId}`) || "null");
  } catch { return null; }
}

function saveColumnState(tableId: string, visible: string[]) {
  localStorage.setItem(`dt-columns-${tableId}`, JSON.stringify(visible));
}

export default function DataTable<T>({
  data = [],
  columns,
  searchPlaceholder = "Search records...",
  searchField,
  filterComponent,
  tableId,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [savedFilters, setSavedFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  const columnIds = columns.map((c) => c.id || c.header);

  useEffect(() => {
    if (tableId) {
      setSavedFilters(loadSavedFilters(tableId));
      const saved = loadColumnState(tableId);
      if (saved) setVisibleColumns(saved);
      else setVisibleColumns(columnIds);
    } else {
      setVisibleColumns(columnIds);
    }
  }, [tableId, columnIds.join(",")]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) setShowColumnMenu(false);
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) setShowSaveMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = useCallback((colId: string) => {
    setVisibleColumns((prev) => {
      const next = prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId];
      if (tableId) saveColumnState(tableId, next);
      return next;
    });
  }, [tableId]);

  const visibleCols = columns.filter((c) => {
    const id = c.id || c.header;
    return visibleColumns.includes(id);
  });

  const filteredData = data.filter((item) => {
    if (!searchTerm || !searchField) return true;
    const value = item[searchField];
    if (typeof value === "string") return value.toLowerCase().includes(searchTerm.toLowerCase());
    if (typeof value === "number") return value.toString().includes(searchTerm);
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const startRange = (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, filteredData.length);

  const applySavedFilter = useCallback((name: string) => {
    setSearchTerm(savedFilters[name] || "");
    setCurrentPage(1);
    setShowSaveMenu(false);
  }, [savedFilters]);

  const saveCurrentFilter = useCallback(() => {
    if (!filterName.trim() || !tableId) return;
    const updated = { ...savedFilters, [filterName.trim()]: searchTerm };
    setSavedFilters(updated);
    saveFiltersToStorage(tableId, updated);
    setFilterName("");
    setShowSaveMenu(false);
  }, [filterName, searchTerm, savedFilters, tableId]);

  const deleteSavedFilter = useCallback((name: string) => {
    if (!tableId) return;
    const updated = { ...savedFilters };
    delete updated[name];
    setSavedFilters(updated);
    saveFiltersToStorage(tableId, updated);
  }, [savedFilters, tableId]);

  const exportToExcel = useCallback(() => {
    const exportData = data.map((row) => {
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
  }, [data, visibleCols, tableId]);

  const hideableCols = columns.filter((c) => c.hideable !== false);

  return (
    <div className="bg-[#ffffff] border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm flex flex-col h-full transition-colors">
      <div className="p-4 border-b border-[#e1e2ed] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all font-sans"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="h-10 px-3 rounded-lg border border-[#c3c6d7] bg-white text-emerald-600 hover:bg-emerald-50 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            Export
          </button>

          {tableId && (
            <>
              <div className="relative" ref={saveMenuRef}>
                <button
                  onClick={() => setShowSaveMenu(!showSaveMenu)}
                  className="h-10 px-3 rounded-lg border border-[#c3c6d7] bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save size={14} />
                  Saved
                </button>
                {showSaveMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#e1e2ed] rounded-xl shadow-lg z-20 p-2">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Filter name..."
                        className="flex-1 h-8 px-2 bg-slate-50 border border-[#e1e2ed] rounded text-xs outline-none focus:border-[#2563EB]"
                        onKeyDown={(e) => { if (e.key === "Enter") saveCurrentFilter(); }}
                      />
                      <button
                        onClick={saveCurrentFilter}
                        disabled={!filterName.trim()}
                        className="w-7 h-7 rounded flex items-center justify-center bg-[#2563EB] text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                    <div className="border-t border-[#e1e2ed] mt-1 pt-1 max-h-40 overflow-y-auto">
                      {Object.keys(savedFilters).length === 0 && (
                        <div className="px-2 py-3 text-[10px] text-slate-400 text-center">No saved filters</div>
                      )}
                      {Object.keys(savedFilters).map((name) => (
                        <div key={name} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 group">
                          <button
                            onClick={() => applySavedFilter(name)}
                            className="flex-1 text-left text-xs text-slate-600"
                          >
                            {name}
                          </button>
                          <button
                            onClick={() => deleteSavedFilter(name)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={columnMenuRef}>
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className={`h-10 px-3 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    showColumnMenu
                      ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                      : "border-[#c3c6d7] bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Columns3 size={14} />
                  Columns
                </button>
                {showColumnMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e1e2ed] rounded-xl shadow-lg z-20 p-2">
                    {hideableCols.map((col) => {
                      const id = col.id || col.header;
                      const isVisible = visibleColumns.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleColumn(id)}
                          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isVisible ? "bg-[#2563EB] border-[#2563EB]" : "border-slate-300"
                          }`}>
                            {isVisible && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-xs text-slate-600">
                            {col.header}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {filterComponent && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 px-4 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showFilters
                  ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                  : "bg-white border-[#c3c6d7] text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          )}
        </div>
      </div>

      {showFilters && filterComponent && (
        <div className="p-4 bg-slate-50 border-b border-[#e1e2ed] animate-slideDown font-sans">
          {filterComponent}
        </div>
      )}

      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-[#e1e2ed]">
              {visibleCols.map((col, idx) => (
                <th
                  key={idx}
                  className={`h-11 px-6 text-xs font-semibold text-[#434655] uppercase tracking-wider font-sans select-none ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="h-12 border-b border-[#e1e2ed]/80 hover:bg-slate-50/40 transition-colors"
                >
                  {visibleCols.map((col, colIdx) => {
                    let cellContent;
                    if (typeof col.accessor === "function") {
                      cellContent = col.accessor(row);
                    } else {
                      cellContent = row[col.accessor] as React.ReactNode;
                    }
                    return (
                      <td
                        key={colIdx}
                        className={`px-6 text-sm text-slate-700 font-sans ${col.className || ""}`}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  className="px-6 py-12 text-center text-sm text-slate-400 font-sans"
                >
                  No records match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[#e1e2ed] flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 font-sans">
        <span className="text-xs text-slate-400">
          Showing <strong className="text-slate-600">{filteredData.length > 0 ? startRange : 0}</strong> to{" "}
          <strong className="text-slate-600">{endRange}</strong> of{" "}
          <strong className="text-slate-600">{filteredData.length}</strong> entries
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-[#c3c6d7] bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-[#c3c6d7] bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
