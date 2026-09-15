"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, roleLabels } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { getRouteMeta } from "@/config/navigation";
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
} from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { toggleActivityFeed, isMobileMenuOpen, toggleMobileMenu } = useLayoutStore();

  const meta = getRouteMeta(pathname);
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
        // Backend may not be running - silently keep 0
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
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-3 sm:px-5 shrink-0 relative z-20">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-text-muted hover:bg-surface-muted rounded-md transition-colors cursor-pointer"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          <span className="hidden sm:inline truncate">{meta.sectionLabel || "EDU-ERP"}</span>
          {(meta.sectionLabel || pathname !== "/") && (
            <span className="text-text-subtle hidden sm:inline" aria-hidden="true">/</span>
          )}
          <span className="truncate font-medium text-text" aria-current="page">
            {meta.pageLabel}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Global search */}
        <button
          onClick={openCommandPalette}
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-surface-muted/60 text-text-subtle text-xs w-56 hover:border-border-strong hover:text-text-muted transition-colors cursor-pointer"
        >
          <Search size={14} aria-hidden="true" />
          <span className="flex-1 text-left">Search modules...</span>
          <kbd className="inline-flex items-center px-1.5 h-5 rounded border border-border bg-surface text-[10px] font-mono text-text-subtle">
            Ctrl K
          </kbd>
        </button>
        <IconButton label="Search" size="sm" className="md:hidden" onClick={openCommandPalette}>
          <Search size={17} aria-hidden="true" />
        </IconButton>

        {/* Notifications */}
        <IconButton label="Notifications" size="sm" onClick={toggleActivityFeed}>
          <Bell size={17} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-surface tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </IconButton>

        {/* Demo-only: one-click role switching for presentations */}
        <DemoRoleSwitcher />

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" aria-hidden="true" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <Avatar name={user?.name} size="sm" />
            <span className="hidden lg:flex flex-col items-start leading-3">
              <span className="text-xs font-medium text-text max-w-32 truncate">{user?.name || "User"}</span>
              <span className="text-[10px] text-text-subtle">{roleLabel}</span>
            </span>
            <ChevronDown size={13} className={`text-text-subtle hidden lg:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
              <div role="menu" aria-label="User menu" className="absolute right-0 top-full mt-1.5 w-48 rounded-lg bg-surface-raised border border-border shadow-md p-1 z-40">
                <div className="px-3 py-2 border-b border-border mb-1 lg:hidden">
                  <p className="text-xs font-medium text-text truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-text-subtle">{roleLabel}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-text hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  My Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-text hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-danger hover:bg-danger-soft transition-colors cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={13} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}