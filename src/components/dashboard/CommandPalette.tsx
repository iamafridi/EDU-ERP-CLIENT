"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { NAV_SECTIONS, FOOTER_NAV, filterSectionsByRole } from "@/config/navigation";
import {
  Search,
  ArrowRight,
  Loader,
  Clock,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Stethoscope,
  CreditCard,
  Home,
  ShieldCheck,
} from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  href: string;
  category: string;
  icon: React.ElementType;
}

const sectionIcons: Record<string, React.ElementType> = {
  Overview: LayoutDashboard,
  Academics: BookOpen,
  Students: Users,
  Clinical: Stethoscope,
  Finance: CreditCard,
  "Campus Life": Home,
  Administration: ShieldCheck,
  Faculty: GraduationCap,
};

const RECENTS_KEY = "eduerp-command-recents";
const MAX_RECENTS = 6;

function loadRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(href: string) {
  try {
    const next = [href, ...loadRecents().filter((h) => h !== href)].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface ApiSearchHit {
  id: string;
  label: string;
  description?: string;
  href: string;
  category: string;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);

  const user = useAuthStore((s) => s.user);
  const userRole: UserRole | null = user?.role ?? null;

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query, open]);

  const { data: searchData, isLoading: isSearching, isError: isSearchError } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => api.globalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0 && open,
    staleTime: 30000,
    retry: 1,
  });

  const apiResults: SearchResult[] = (searchData?.results || []).map((r: ApiSearchHit) => ({
    ...r,
    icon: sectionIcons[r.category] || Users,
  }));

  // Role-filtered nav index, single source with the sidebar
  const navResults: SearchResult[] = [
    ...filterSectionsByRole(NAV_SECTIONS, userRole).flatMap((section) =>
      section.items.map((item) => ({
        id: `nav-${item.href}`,
        label: item.label,
        href: item.href,
        category: section.label,
        icon: item.icon,
      })),
    ),
    ...FOOTER_NAV.filter((item) => userRole && item.roles.includes(userRole)).map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      href: item.href,
      category: "System",
      icon: item.icon,
    })),
  ];

  const recentItems = recents
    .map((href) => navResults.find((r) => r.href === href))
    .filter((r): r is SearchResult => Boolean(r))
    .slice(0, MAX_RECENTS);

  const showNavFallback = !debouncedQuery.trim();

  const allResults = showNavFallback
    ? recentItems.length > 0
      ? [{ label: "Recent", items: recentItems }, { label: "Navigate", items: navResults.slice(0, 8) }]
      : [{ label: "Navigate", items: navResults.slice(0, 8) }]
    : [
        ...(apiResults.length > 0 ? [{ label: "Records", items: apiResults }] : []),
        {
          label: "Navigate",
          items: navResults.filter((s) => {
            const q = debouncedQuery.toLowerCase();
            return (
              s.label.toLowerCase().includes(q) ||
              s.category.toLowerCase().includes(q)
            );
          }),
        },
      ];

  const flatResults = allResults.flatMap((g) => g.items);

  // Reset palette state when it opens (adjust-state-on-prop-change pattern).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setSelectedIndex(0);
      setRecents(loadRecents());
    }
  }

  // Keep the selection at the top whenever the query changes.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      saveRecent(href);
      setRecents(loadRecents());
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const handleClose = useCallback(() => {
    onClose();
    triggerRef.current?.focus?.();
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatResults[selectedIndex]) {
      navigate(flatResults[selectedIndex].href);
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  // Tab trap within the palette
  useEffect(() => {
    if (!open) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !paletteRef.current) return;
      const focusable = paletteRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  let globalIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={paletteRef}
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[14vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette search"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-surface-raised border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
              <Search size={16} className="text-text-subtle shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search modules and records..."
                className="flex-1 h-full bg-transparent text-sm text-text placeholder:text-text-subtle outline-none"
                aria-label="Search modules and records"
              />
              {isSearching && <Loader size={15} className="text-text-subtle animate-spin shrink-0" aria-hidden="true" />}
              <kbd className="hidden sm:inline-flex items-center px-1.5 h-5 rounded border border-border bg-surface text-[10px] font-mono text-text-subtle">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-1.5" aria-live="polite">
              {flatResults.length === 0 && !isSearching && !isSearchError && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-text">No results for &quot;{query}&quot;</p>
                  <p className="text-xs text-text-muted mt-1">Try a module name like &quot;Attendance&quot; or &quot;Fees&quot;.</p>
                </div>
              )}

              {isSearching && <div className="px-4 py-8 text-center text-xs text-text-muted">Searching records...</div>}

              {isSearchError && (
                <div className="px-4 py-8 text-center text-xs text-danger">
                  Record search is unavailable right now. Module navigation still works.
                </div>
              )}

              {allResults.map((group) => (
                <div key={group.label}>
                  <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                    {group.label === "Recent" && <Clock size={10} aria-hidden="true" />}
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const idx = globalIdx++;
                    const isSelected = idx === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left transition-colors cursor-pointer ${
                          isSelected ? "bg-primary-soft text-primary" : "text-text hover:bg-surface-muted"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary/10 text-primary" : "bg-surface-muted text-text-muted"
                        }`}>
                          <Icon size={15} aria-hidden="true" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-medium truncate">{item.label}</span>
                          {item.description && (
                            <span className="block text-[10px] text-text-subtle truncate">{item.description}</span>
                          )}
                        </span>
                        <ArrowRight size={13} className="text-text-subtle shrink-0" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-border bg-surface-muted/50 text-[10px] text-text-subtle">
              <span><kbd className="px-1 py-0.5 rounded border border-border bg-surface font-mono">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 rounded border border-border bg-surface font-mono">↵</kbd> Open</span>
              <span><kbd className="px-1 py-0.5 rounded border border-border bg-surface font-mono">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}