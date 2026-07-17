"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CommandPalette from "./CommandPalette";
import QuickActions from "./QuickActions";
import ActivityFeed from "./ActivityFeed";
import DemoModeBanner from "./DemoModeBanner";
import ToastListener from "./ToastListener";
import ToastContainer from "@/components/ui/ToastContainer";
import ShortcutsHelp from "./ShortcutsHelp";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isActivityFeedOpen = useLayoutStore((s) => s.isActivityFeedOpen);
  const setActivityFeedOpen = useLayoutStore((s) => s.setActivityFeedOpen);
  const reduced = useReducedMotion();

  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandOpen((prev) => !prev);
      return;
    }
    if (e.key === "Escape") {
      setCommandOpen(false);
      setShortcutsOpen(false);
      setActivityFeedOpen(false);
      return;
    }
    if (e.key === "?") {
      setShortcutsOpen((prev) => !prev);
      return;
    }
  }, [setActivityFeedOpen]);

  useKeyboardShortcut("a", () => router.push("/attendance"));
  useKeyboardShortcut("l", () => router.push("/leave"));
  useKeyboardShortcut("n", () => router.push("/notices"));
  useKeyboardShortcut("f", () => router.push("/fees"));

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf8ff] transition-colors">
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <QuickActions />
      <ActivityFeed open={isActivityFeedOpen} onClose={() => setActivityFeedOpen(false)} />
      <ShortcutsHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ToastContainer />
      <ToastListener />
        <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        <Navbar />
        <DemoModeBanner />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <motion.div
            key={usePathname()}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
