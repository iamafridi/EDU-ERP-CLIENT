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
  Sparkles,
  FileSpreadsheet,
  Printer,
  Sliders,
  Scale,
  Award,
  Landmark,
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
  "Quick Actions": Sparkles,
  "Student Dossiers": Users,
};

const RECENTS_KEY = "eduerp-command-recents";
const MAX_RECENTS = 5;

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

const QUICK_ACTIONS: SearchResult[] = [
  {
    id: "qa-exams",
    label: "Master Tabulation Sheet & Multi-Examiner Arbitration",
    description: "Open Controller of Examinations desk and 0.6% grace rules",
    href: "/exams",
    category: "Quick Actions",
    icon: Scale,
  },
  {
    id: "qa-challan",
    label: "Generate 3-Part Bank Challan",
    description: "Print triplicate student deposit slips with optical barcode",
    href: "/fees",
    category: "Quick Actions",
    icon: Printer,
  },
  {
    id: "qa-merit",
    label: "Admissions Composite Merit Calculator",
    description: "Calibrate 40% Test + 30% HSC + 30% SSC weights",
    href: "/admissions",
    category: "Quick Actions",
    icon: Sliders,
  },
  {
    id: "qa-routines",
    label: "Welsh-Powell Clash-Free Exam Seating Grid",
    description: "2D anti-cheating odd-even desk allocations",
    href: "/routines",
    category: "Quick Actions",
    icon: FileSpreadsheet,
  },
  {
    id: "qa-reports",
    label: "Statutory UGC / BANBEIS Form HE-04 Return",
    description: "Annual accreditation return and teacher-student ratio analytics",
    href: "/reports",
    category: "Quick Actions",
    icon: Landmark,
  },
  {
    id: "qa-convocation",
    label: "14th Convocation Pass & Degree Minting",
    description: "5-point zero dues clearance and digital degree vault",
    href: "/alumni",
    category: "Quick Actions",
    icon: Award,
  },
];

const MOCK_STUDENTS: SearchResult[] = [
  {
    id: "stu-tahmid",
    label: "Tahmid Hasan (CSE-2023-0142)",
    description: "CGPA 3.92 • Dean's Honor List • Accounts Cleared",
    href: "/transcripts",
    category: "Student Dossiers",
    icon: Users,
  },
  {
    id: "stu-nafis",
    label: "Nafis Fuad (CSE-2023-0143)",
    description: "CGPA 3.55 • Good Standing • 13 Credits Attempted",
    href: "/grades",
    category: "Student Dossiers",
    icon: Users,
  },
  {
    id: "stu-samia",
    label: "Samia Rahman (EEE-2022-0051)",
    description: "CGPA 3.82 • Freedom Fighter Quota • Merit Scholar",
    href: "/scholarships",
    category: "Student Dossiers",
    icon: Users,
  },
];

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
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
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
      }))
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
    .map((href) => navResults.find((r) => r.href === href) || QUICK_ACTIONS.find((q) => q.href === href))
    .filter((r): r is SearchResult => Boolean(r))
    .slice(0, MAX_RECENTS);

  const showFallback = !debouncedQuery.trim();

  const allResults = showFallback
    ? [
        ...(recentItems.length > 0 ? [{ label: "Recent", items: recentItems }] : []),
        { label: "Quick Actions", items: QUICK_ACTIONS },
        { label: "Key Student Dossiers", items: MOCK_STUDENTS },
        { label: "Core Modules", items: navResults.slice(0, 8) },
      ]
    : [
        ...(apiResults.length > 0 ? [{ label: "Database Records", items: apiResults }] : []),
        {
          label: "Quick Actions",
          items: QUICK_ACTIONS.filter((q) => {
            const needle = debouncedQuery.toLowerCase();
            return (
              q.label.toLowerCase().includes(needle) ||
              (q.description && q.description.toLowerCase().includes(needle))
            );
          }),
        },
        {
          label: "Students",
          items: MOCK_STUDENTS.filter((s) => {
            const needle = debouncedQuery.toLowerCase();
            return (
              s.label.toLowerCase().includes(needle) ||
              (s.description && s.description.toLowerCase().includes(needle))
            );
          }),
        },
        {
          label: "Modules & Routes",
          items: navResults.filter((s) => {
            const needle = debouncedQuery.toLowerCase();
            return (
              s.label.toLowerCase().includes(needle) ||
              s.category.toLowerCase().includes(needle)
            );
          }),
        },
      ].filter((g) => g.items.length > 0);

  const flatResults = allResults.flatMap((g) => g.items);

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
    [onClose, router]
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

  useEffect(() => {
    if (!open) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !paletteRef.current) return;
      const focusable = paletteRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette search"
        >
          <div
            className="fixed inset-0 bg-[#07111A]/70 backdrop-blur-md transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative w-full max-w-2xl bg-surface border border-gold/40 rounded-2xl shadow-2xl overflow-hidden font-sans"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 h-14 border-b border-border bg-surface-muted/30">
              <Search size={18} className="text-gold shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, search modules, or student roll number..."
                className="flex-1 h-full bg-transparent text-sm text-text placeholder:text-text-muted outline-none font-medium"
                aria-label="Search modules and records"
              />
              {isSearching && (
                <Loader size={16} className="text-gold animate-spin shrink-0" aria-hidden="true" />
              )}
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-text-muted">
                ESC
              </kbd>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-2.5 space-y-3" aria-live="polite">
              {flatResults.length === 0 && !isSearching && !isSearchError && (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-bold text-text">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs text-text-muted mt-1">
                    Try searching for &quot;Exams&quot;, &quot;Challan&quot;, &quot;Tahmid&quot;, or &quot;Advising&quot;.
                  </p>
                </div>
              )}

              {isSearching && (
                <div className="px-4 py-8 text-center text-xs text-text-muted">
                  Searching institutional database...
                </div>
              )}

              {allResults.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    {group.label === "Recent" && <Clock size={11} className="text-gold" />}
                    {group.label === "Quick Actions" && <Sparkles size={11} className="text-gold" />}
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
                        className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gold/15 text-text border border-gold/30 shadow-sm"
                            : "text-text hover:bg-surface-muted/60 border border-transparent"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-gold text-white shadow-sm"
                              : "bg-surface-muted text-text-muted"
                          }`}
                        >
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-bold truncate text-text">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="block text-[11px] text-text-muted truncate mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </span>
                        <ArrowRight
                          size={14}
                          className={`shrink-0 transition-transform ${
                            isSelected ? "text-gold translate-x-0.5" : "text-text-muted opacity-40"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Keyboard Shortcuts Footer */}
            <div className="hidden sm:flex items-center justify-between px-5 py-2.5 border-t border-border bg-surface-muted/40 text-[11px] text-text-muted">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono text-[10px]">
                    Esc
                  </kbd>{" "}
                  Dismiss
                </span>
              </div>
              <span className="font-mono text-[10px] text-gold font-semibold">
                UAS Quick Access Desk
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}