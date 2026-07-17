"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Search,
  Users,
  GraduationCap,
  BookOpen,
  Home,
  FileText,
  LayoutDashboard,
  UserCheck,
  CreditCard,
  Library,
  MessageSquare,
  Shield,
  Wrench,
  Stethoscope,
  Heart,
  Bus,
  Megaphone,
  User,
  ArrowRight,
  Calendar,
  ClipboardList,
  Bed,
  Beaker,
  Pill,
  Settings,
  Bell,
  Loader,
} from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  href: string;
  category: string;
  icon: React.ElementType;
}

const searchIndex: SearchResult[] = [
  { id: "nav-dash", label: "Dashboard", href: "/", category: "Navigation", icon: LayoutDashboard },
  { id: "nav-students", label: "Student Directory", href: "/students", category: "Navigation", icon: Users },
  { id: "nav-register", label: "Student Onboarding", href: "/students/register", category: "Navigation", icon: UserCheck },
  { id: "nav-faculty", label: "Faculty Directory", href: "/faculties", category: "Navigation", icon: GraduationCap },
  { id: "nav-courses", label: "Course Catalog", href: "/courses", category: "Navigation", icon: BookOpen },
  { id: "nav-departments", label: "Departments", href: "/departments", category: "Navigation", icon: FileText },
  { id: "nav-rooms", label: "Dorms & Rooms", href: "/rooms", category: "Navigation", icon: Home },
  { id: "nav-attendance", label: "Attendance", href: "/attendance", category: "Navigation", icon: UserCheck },
  { id: "nav-exams", label: "Exams & Grades", href: "/exams", category: "Navigation", icon: FileText },
  { id: "nav-fees", label: "Fees & Ledger", href: "/fees", category: "Navigation", icon: CreditCard },
  { id: "nav-library", label: "Library", href: "/library", category: "Navigation", icon: Library },
  { id: "nav-mess", label: "Mess & Meals", href: "/mess", category: "Navigation", icon: Home },
  { id: "nav-transport", label: "Transport", href: "/transport", category: "Navigation", icon: Bus },
  { id: "nav-admissions", label: "Admissions", href: "/admissions", category: "Navigation", icon: UserCheck },
  { id: "nav-security", label: "Security Desk", href: "/security", category: "Navigation", icon: Shield },
  { id: "nav-grievances", label: "Grievances", href: "/grievances", category: "Navigation", icon: Wrench },
  { id: "nav-incidents", label: "Maintenance Desk", href: "/incidents", category: "Navigation", icon: Wrench },
  { id: "nav-health", label: "Health Center", href: "/health-center", category: "Navigation", icon: Heart },
  { id: "nav-clinical", label: "Clinical & Counseling", href: "/clinical", category: "Navigation", icon: Stethoscope },
  { id: "nav-leave", label: "Leave Management", href: "/leave", category: "Navigation", icon: UserCheck },
  { id: "nav-notices", label: "Notices", href: "/notices", category: "Navigation", icon: Megaphone },
  { id: "nav-alumni", label: "Alumni", href: "/alumni", category: "Navigation", icon: Users },
  { id: "nav-reports", label: "Reports", href: "/reports", category: "Navigation", icon: FileText },
  { id: "nav-chat", label: "Messaging", href: "/chat", category: "Navigation", icon: MessageSquare },
  { id: "nav-parents", label: "Parent Portal", href: "/parents", category: "Navigation", icon: User },
  { id: "nav-notifications", label: "Notifications", href: "/notifications", category: "Navigation", icon: Megaphone },
  { id: "nav-payroll", label: "Payroll", href: "/payroll", category: "Navigation", icon: CreditCard },
  { id: "nav-expenses", label: "Expenses", href: "/expenses", category: "Navigation", icon: CreditCard },
  { id: "nav-timetable", label: "Timetable", href: "/timetable", category: "Navigation", icon: Calendar },
  { id: "nav-transcripts", label: "Transcripts", href: "/transcripts", category: "Navigation", icon: FileText },
  { id: "nav-curriculum", label: "Curriculum", href: "/curriculum", category: "Navigation", icon: BookOpen },
  { id: "nav-scholarships", label: "Scholarships", href: "/scholarships", category: "Navigation", icon: GraduationCap },
  { id: "nav-accreditation", label: "Accreditation", href: "/accreditation", category: "Navigation", icon: Shield },
  { id: "nav-research", label: "Research", href: "/research", category: "Navigation", icon: Beaker },
  { id: "nav-skill-lab", label: "Skill Lab", href: "/skill-lab", category: "Navigation", icon: ClipboardList },
  { id: "nav-logbook", label: "Clinical Logbook", href: "/logbook", category: "Navigation", icon: ClipboardList },
  { id: "nav-opd", label: "OPD", href: "/opd", category: "Navigation", icon: Stethoscope },
  { id: "nav-ipd", label: "IPD", href: "/ipd", category: "Navigation", icon: Bed },
  { id: "nav-laboratory", label: "Laboratory", href: "/laboratory", category: "Navigation", icon: Beaker },
  { id: "nav-pharmacy", label: "Pharmacy", href: "/pharmacy", category: "Navigation", icon: Pill },
  { id: "nav-users", label: "User Management", href: "/users", category: "Navigation", icon: Users },
  { id: "nav-audit", label: "Audit Trail", href: "/audit", category: "Navigation", icon: Shield },
  { id: "nav-settings", label: "Settings", href: "/settings", category: "Navigation", icon: Settings },
  { id: "nav-activity-log", label: "Activity Log", href: "/activity-log", category: "Navigation", icon: Bell },
];

const categoryIcons: Record<string, React.ElementType> = {
  Students: Users,
  Faculty: GraduationCap,
  Courses: BookOpen,
  Rooms: Home,
  Users: User,
  Navigation: FileText,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const apiResults: SearchResult[] = (searchData?.results || []).map((r: any) => ({
    ...r,
    icon: categoryIcons[r.category] || Users,
  }));

  const showNavFallback = !debouncedQuery.trim();

  const allResults = showNavFallback
    ? searchIndex.slice(0, 8)
    : [...apiResults, ...searchIndex.filter((s) => {
        const q = debouncedQuery.toLowerCase();
        return (
          s.label.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          s.category.toLowerCase().includes(q)
        );
      })];

  const groupedResults = allResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    if (!acc[r.category].find((x) => x.id === r.id)) acc[r.category].push(r);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const flatResults = Object.values(groupedResults).flat();
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatResults[selectedIndex]) {
      navigate(flatResults[selectedIndex].href);
    }
  };

  const hasResults = Object.keys(groupedResults).length > 0;
  const paletteRef = useRef<HTMLDivElement>(null);

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

  return (
    <AnimatePresence>
      {open && (
        <div ref={paletteRef} className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette search">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white border border-[#e1e2ed] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-[#e1e2ed]">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search students, courses, rooms, pages..."
                className="flex-1 h-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              {isSearching && <Loader size={16} className="text-slate-400 animate-spin shrink-0" />}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-[10px] font-mono text-slate-400 rounded border border-[#e1e2ed]">
                ESC
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-2" aria-live="polite" aria-atomic="false">
              {!hasResults && !isSearching && !isSearchError && (
                <div className="p-8 text-center text-sm text-slate-400">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {isSearching && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Searching...
                </div>
              )}

              {isSearchError && (
                <div className="p-8 text-center text-sm text-red-400">
                  Search failed. Please try again.
                </div>
              )}

              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {category}
                  </div>
                  {items.map((item) => {
                    const globalIdx = flatResults.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#2563EB]/10 text-[#2563EB]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#2563EB]/15 text-[#2563EB]" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                          )}
                        </div>
                        <ArrowRight size={14} className="text-slate-300 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-[#e1e2ed] bg-slate-50 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-[#e1e2ed] rounded text-[10px] font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-[#e1e2ed] rounded text-[10px] font-mono">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-[#e1e2ed] rounded text-[10px] font-mono">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
