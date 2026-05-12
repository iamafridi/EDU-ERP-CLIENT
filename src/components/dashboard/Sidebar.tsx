"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { NAV_SECTIONS, FOOTER_NAV, filterSectionsByRole, type NavItem, type NavSection } from "@/config/navigation";
import {
  ChevronDown,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  Building2,
  ChevronRight,
} from "lucide-react";

/** Clinical Luxury sidebar tokens */
const STYLE = {
  bg: "bg-surface-navy",
  border: "border-white/[0.06]",
  text: "text-text-on-navy-muted",
  textDim: "text-white/30",
  hover: "hover:text-white hover:bg-white/[0.06]",
  active: "bg-white/[0.08] text-gold",
  activeBar: "bg-gold",
  accent: "text-gold",
  badge: "bg-gold/20 text-gold",
};

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && href !== "/dashboard" && pathname.startsWith(href));
}

/* ─── Section groups for the new layout ─── */
const SECTION_GROUPS = [
  { label: "Workspace", sections: ["Overview", "Academics", "Students"] },
  { label: "Operations", sections: ["Clinical", "Finance", "Campus Life", "Library"] },
  { label: "Governance", sections: ["Administration"] },
];

function getSectionGroup(label: string): string {
  for (const group of SECTION_GROUPS) {
    if (group.sections.includes(label)) return group.label;
  }
  return "Workspace";
}

function NavItemLink({
  item,
  pathname,
  onClick,
  collapsed = false,
  count,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
  collapsed?: boolean;
  count?: number;
}) {
  const isActive = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2"
      } ${isActive ? STYLE.active : `${STYLE.text} ${STYLE.hover}`}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={17} className={`shrink-0 ${isActive ? STYLE.accent : "opacity-60"}`} aria-hidden="true" />
      {!collapsed && (
        <>
          <span className="truncate flex-1">{item.label}</span>
          {count !== undefined && count > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${STYLE.badge}`}>
              {count}
            </span>
          )}
        </>
      )}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gold"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </Link>
  );
}

function SectionGroup({
  section,
  pathname,
  onClick,
  initiallyOpen = false,
}: {
  section: NavSection;
  pathname: string;
  onClick: () => void;
  initiallyOpen?: boolean;
}) {
  const hasActiveChild = section.items.some((item) => isActivePath(pathname, item.href));
  const [isOpen, setIsOpen] = useState(initiallyOpen || hasActiveChild);
  const [prevActive, setPrevActive] = useState(hasActiveChild);
  if (hasActiveChild !== prevActive) {
    setPrevActive(hasActiveChild);
    if (hasActiveChild) setIsOpen(true);
  }

  const Icon = section.icon;
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] rounded-lg transition-colors cursor-pointer hover:bg-white/[0.06] text-white/70 hover:text-white"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Icon size={14} className="shrink-0 text-gold opacity-90" aria-hidden="true" />
          <span className="truncate">{section.label}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-gold/90 font-mono">
            {section.items.length}
          </span>
          <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.18 }} className="shrink-0">
            <ChevronDown size={12} className="text-white/40" aria-hidden="true" />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 py-0.5 pl-1">
              {section.items.map((item) => (
                <NavItemLink key={item.href} item={item} pathname={pathname} onClick={onClick} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Collapsed rail: icon button → flyout */
function RailFlyout({ section, pathname }: { section: NavSection; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = section.icon;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hasActive = section.items.some((item) => isActivePath(pathname, item.href));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${section.label} menu`}
        title={section.label}
        className={`relative w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          hasActive ? STYLE.active : `${STYLE.text} ${STYLE.hover}`
        }`}
      >
        <Icon size={18} className={hasActive ? STYLE.accent : "opacity-60"} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-0 ml-2 w-56 rounded-xl bg-surface-navy border border-white/[0.08] shadow-xl p-2 z-40"
          >
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">{section.label}</p>
            {section.items.map((item) => (
              <NavItemLink key={item.href} item={item} pathname={pathname} onClick={() => setOpen(false)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen, isSidebarCollapsed, toggleSidebar } = useLayoutStore();
  const user = useAuthStore((s) => s.user);
  const userRole: UserRole | null = user?.role ?? null;

  const sections = filterSectionsByRole(NAV_SECTIONS, userRole);
  const footerItems = FOOTER_NAV.filter((item) => userRole && item.roles.includes(userRole));
  const handleNavClick = useCallback(() => setMobileMenuOpen(false), [setMobileMenuOpen]);

  // Group sections by their category
  const groupedSections = SECTION_GROUPS.map((group) => ({
    label: group.label,
    sections: sections.filter((s) => group.sections.includes(s.label)),
  })).filter((g) => g.sections.length > 0);

  const sidebarContent = (
    <>
      {/* ── Brand & Top Collapse Header ── */}
      <div className={`flex items-center h-16 border-b border-white/[0.06] overflow-hidden ${isSidebarCollapsed ? "justify-center px-0" : "px-4 justify-between"}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center shrink-0 shadow-gold">
            <GraduationCap size={18} className="text-white" aria-hidden="true" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white tracking-wide leading-4 font-ui">HOSTEL PRO-ERP</p>
              <p className="text-[9px] text-white/40 leading-3 uppercase tracking-[0.14em] font-ui">Campus OS</p>
            </div>
          )}
        </div>

        {/* Top collapse button */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer ${
            isSidebarCollapsed ? "hidden" : "flex items-center justify-center"
          }`}
        >
          <PanelLeftClose size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Rail expand toggle when collapsed */}
      {isSidebarCollapsed && (
        <div className="py-2 flex justify-center border-b border-white/[0.06]">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <PanelLeftOpen size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Campus Switcher ── */}
      {!isSidebarCollapsed && (
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 mb-1 font-ui">Active Campus</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[12px] font-semibold text-white/80 font-ui truncate">St. Aurelia Medical</span>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {isSidebarCollapsed ? (
          <div className="space-y-1">
            {sections.map((section) => (
              <RailFlyout key={section.label} section={section} pathname={pathname} />
            ))}
            {footerItems.length > 0 && (
              <div className="border-t border-white/[0.06] pt-2 mt-2">
                {footerItems.map((item) => (
                  <NavItemLink key={item.href} item={item} pathname={pathname} onClick={handleNavClick} collapsed />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSections.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 font-ui">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.sections.map((section) => (
                    <SectionGroup
                      key={section.label}
                      section={section}
                      pathname={pathname}
                      onClick={handleNavClick}
                      initiallyOpen={userRole === "super-admin" || userRole === "domain-admin" || section.items.some((item) => isActivePath(pathname, item.href))}
                    />
                  ))}
                </div>
              </div>
            ))}
            {footerItems.length > 0 && (
              <div className="border-t border-white/[0.06] pt-3">
                <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 font-ui">System</p>
                {footerItems.map((item) => (
                  <NavItemLink key={item.href} item={item} pathname={pathname} onClick={handleNavClick} />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Mobile Footer Drawer Close ── */}
      <div className="lg:hidden border-t border-white/[0.06] p-2 flex justify-end">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Close</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`hidden lg:flex flex-col h-full shrink-0 ${STYLE.bg} select-none z-30 transition-[width] duration-200 ease-in-out ${
          isSidebarCollapsed ? "w-[68px]" : "w-[260px]"
        }`}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={`fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col lg:hidden ${STYLE.bg}`}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
