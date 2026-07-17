"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, roleLabels } from "@/store/useAuthStore";
import { useLayoutStore } from "@/store/useLayoutStore";
import { LogOut, Bell, User, Menu, X } from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Dashboard"];
    const segments = pathname.split("/").filter(Boolean);
    return ["Dashboard", ...segments.map(s => s.charAt(0).toUpperCase() + s.slice(1))];
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${useAuthStore.getState().token}` } },
        );
        setUnreadCount(res.data?.data?.count || 0);
      } catch {
        // Backend may not be running — silently keep 0
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

  const { toggleActivityFeed, isMobileMenuOpen, toggleMobileMenu } = useLayoutStore();
  const breadcrumbs = getBreadcrumbs();
  const roleLabel = user?.role ? roleLabels[user.role] : "Unknown";

  return (
    <header className="h-16 bg-[#ffffff] border-b border-[#e1e2ed] flex items-center justify-between px-3 sm:px-6 shrink-0 relative z-10 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-slate-500 hover:bg-[#faf8ff] rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-sans truncate">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300 shrink-0">/</span>}
                <span className={`truncate ${isLast ? "font-semibold text-slate-800" : "hidden sm:inline"}`} {...(isLast ? { "aria-current": "page" as const } : {})}>
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleActivityFeed}
          className="p-2 text-slate-500 hover:bg-[#faf8ff] rounded-full transition-colors relative cursor-pointer"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 font-sans">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              {roleLabel}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#d0e1fb] text-[#2563EB] flex items-center justify-center font-bold text-sm">
            <User size={16} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
