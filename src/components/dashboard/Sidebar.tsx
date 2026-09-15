"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { NAV_SECTIONS, FOOTER_NAV, filterSectionsByRole, type NavItem, type NavSection } from "@/config/navigation";
import { ChevronDown, ChevronLeft, PanelLeftClose, PanelLeftOpen, GraduationCap } from "lucide-react";

/** Structural ink sidebar: intentionally dark in both themes. */
const INK = {
  bg: "bg-slate-950",
  border: "border-slate-800",
  text: "text-slate-400",
  textDim: "text-slate-500",
  hover: "hover:text-slate-100 hover:bg-slate-800/60",
  active: "bg-blue-500/15 text-blue-300",
  activeBar: "bg-blue-400",
  accent: "text-blue-400",
};

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

function NavItemLink({
  item,
  pathname,
  onClick,
  collapsed = false,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
  collapsed?: boolean;
}) {
  const isActive = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-md text-[13px] font-medium transition-colors ${
        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-2.5 py-2"
      } ${isActive ? INK.active : `${INK.text} ${INK.hover}`}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={17} className={`shrink-0 ${isActive ? INK.accent : "text-slate-500"}`} aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-blue-400"
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
  // Auto-expand when a child becomes active (adjust-state-on-prop-change).
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
        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${INK.textDim} ${INK.hover}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Icon size={13} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{section.label}</span>
          <span className="text-[9px] font-normal text-slate-600 tabular-nums">{section.items.length}</span>
        </span>
        <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.18 }} className="shrink-0">
          <ChevronDown size={13} aria-hidden="true" />
        </motion.span>
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
            <div className="space-y-0.5 py-0.5">
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

/** Collapsed rail: section icon button that opens a flyout with the items. */
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
        className={`relative w-10 h-10 mx-auto flex items-center justify-center rounded-md transition-colors cursor-pointer ${
          hasActive ? INK.active : `${INK.text} ${INK.hover}`
        }`}
      >
        <Icon size={18} className={hasActive ? INK.accent : "text-slate-500"} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-0 ml-2 w-56 rounded-lg bg-slate-900 border border-slate-800 shadow-lg p-1.5 z-40"
          >
            <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.label}</p>
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

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className={`flex items-center h-14 border-b border-slate-800 overflow-hidden ${isSidebarCollapsed ? "justify-center px-0" : "px-4 gap-2.5"}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shrink-0">
          <GraduationCap size={17} aria-hidden="true" />
        </div>
        {!isSidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white tracking-wide leading-4">EDU-ERP</p>
            <p className="text-[9px] text-slate-500 leading-3">Medical College Suite</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5">
        {isSidebarCollapsed ? (
          <div className="space-y-1">
            {sections.map((section) => (
              <RailFlyout key={section.label} section={section} pathname={pathname} />
            ))}
            {footerItems.length > 0 && (
              <div className="border-t border-slate-800/70 pt-1.5 mt-1.5">
                {footerItems.map((item) => (
                  <NavItemLink key={item.href} item={item} pathname={pathname} onClick={handleNavClick} collapsed />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {sections.map((section) => (
              <SectionGroup
                key={section.label}
                section={section}
                pathname={pathname}
                onClick={handleNavClick}
                initiallyOpen={section.items.some((item) => isActivePath(pathname, item.href))}
              />
            ))}
            {footerItems.length > 0 && (
              <div className="border-t border-slate-800/70 pt-1.5 mt-1.5">
                {footerItems.map((item) => (
                  <NavItemLink key={item.href} item={item} pathname={pathname} onClick={handleNavClick} />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer: collapse toggle (desktop) + mobile close */}
      <div className={`border-t border-slate-800 p-2 ${isSidebarCollapsed ? "flex justify-center" : ""}`}>
        {isSidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="w-10 h-10 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <PanelLeftOpen size={17} aria-hidden="true" />
          </button>
        ) : (
          <div className="flex items-center justify-between px-1.5">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center gap-2 text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
            >
              <PanelLeftClose size={14} aria-hidden="true" />
              Collapse
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`hidden lg:flex flex-col h-full shrink-0 ${INK.bg} ${INK.border} border-r select-none z-30 transition-[width] duration-200 ease-in-out ${
          isSidebarCollapsed ? "w-16" : "w-60"
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
            className={`fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col lg:hidden ${INK.bg} ${INK.border} border-r`}
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