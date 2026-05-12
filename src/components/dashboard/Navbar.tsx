"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, roleLabels } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { getRouteMeta, getBreadcrumbs } from "@/config/navigation";
import { IconButton } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import DemoRoleSwitcher from "./DemoRoleSwitcher";
import {
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Home,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import ShowcaseModal from "./ShowcaseModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);

  const { toggleActivityFeed, isMobileMenuOpen, toggleMobileMenu } = useLayoutStore();

  const meta = getRouteMeta(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);
  const roleLabel = user?.role ? roleLabels[user.role] : "Unknown";

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } },
        );
        setUnreadCount(res.data?.data?.count || 0);
      } catch {
        // Backend may not be running
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("eduerp:command-palette", { detail: { open: true } }));
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-20">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-text-muted hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        {/* Dynamic Navigable Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0 overflow-x-auto no-scrollbar py-1">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              {idx > 0 && (
                <ChevronRight size={12} className="text-text-subtle/50 shrink-0" aria-hidden="true" />
              )}
              {crumb.isCurrent ? (
                <span
                  className="font-semibold text-text truncate font-ui max-w-[140px] sm:max-w-[240px]"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-text-muted hover:text-gold transition-colors font-ui font-medium truncate max-w-[120px] flex items-center gap-1 hover:underline underline-offset-2"
                >
                  {idx === 0 && <Home size={12} className="shrink-0 text-text-subtle" />}
                  <span className="truncate">{crumb.label}</span>
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Global search */}
        <button
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-2 h-9 px-3.5 rounded-xl border border-border bg-surface-muted/50 text-text-subtle text-xs w-56 hover:border-gold/30 hover:bg-surface-muted transition-all duration-200 cursor-pointer font-ui"
        >
          <Search size={14} className="text-text-subtle" aria-hidden="true" />
          <span className="flex-1 text-left">Search modules...</span>
          <kbd className="inline-flex items-center px-1.5 h-5 rounded-md border border-border bg-surface text-[10px] font-mono text-text-subtle">
            ⌘K
          </kbd>
        </button>
        <IconButton label="Search" size="sm" className="md:hidden" onClick={openCommandPalette}>
          <Search size={17} aria-hidden="true" />
        </IconButton>

        {/* Help */}
        <IconButton label="Help center" size="sm" className="hidden sm:flex">
          <HelpCircle size={17} aria-hidden="true" />
        </IconButton>

        {/* Notifications */}
        <IconButton label="Notifications" size="sm" onClick={toggleActivityFeed}>
          <Bell size={17} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-warning text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-surface tabular-nums font-ui">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </IconButton>

        {/* Explore ERP Showcase button */}
        <button
          onClick={() => setShowcaseOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-gold/40 bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-all cursor-pointer font-ui shadow-xs"
          title="Explore 29 Live System Screenshots"
        >
          <Sparkles size={13} className="text-gold" />
          <span>Explore ERP</span>
        </button>

        {/* Demo role switcher */}
        <DemoRoleSwitcher />

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" aria-hidden="true" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-surface-muted transition-all duration-200 cursor-pointer"
          >
            <Avatar name={user?.name} size="sm" />
            <span className="hidden lg:flex flex-col items-start leading-3">
              <span className="text-xs font-semibold text-text max-w-32 truncate font-ui">{user?.name || "User"}</span>
              <span className="text-[10px] text-text-subtle font-ui">{roleLabel}</span>
            </span>
            <ChevronDown
              size={13}
              className={`text-text-subtle hidden lg:block transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-surface border border-border shadow-lg p-1.5 z-40"
              >
                <div className="px-3 py-2.5 border-b border-border mb-1 lg:hidden">
                  <p className="text-xs font-semibold text-text truncate font-ui">{user?.name || "User"}</p>
                  <p className="text-[10px] text-text-subtle font-ui">{roleLabel}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-text hover:bg-surface-muted transition-colors cursor-pointer font-ui"
                >
                  My Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowcaseOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gold hover:bg-gold/10 transition-colors cursor-pointer font-ui flex items-center justify-between"
                >
                  <span>Explore ERP Gallery</span>
                  <Sparkles size={12} />
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-text hover:bg-surface-muted transition-colors cursor-pointer font-ui"
                >
                  Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-danger hover:bg-danger-soft transition-colors cursor-pointer flex items-center gap-2 font-ui"
                >
                  <LogOut size={13} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Showcase Modal */}
      <ShowcaseModal isOpen={showcaseOpen} onClose={() => setShowcaseOpen(false)} />
    </header>
  );
}
