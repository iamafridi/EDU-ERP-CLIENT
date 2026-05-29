"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  DollarSign,
  Bus,
  Library,
  Users,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  Sparkles,
  UserCheck,
  Flame,
  Globe,
  HelpCircle,
} from "lucide-react";
import { useToast } from "./ToastFeedback";
import TryDemoModal from "./TryDemoModal";
import ContactModal from "./ContactModal";

export function GeometricLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Geometric HP / Hostel Pro Monogram */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#624FDA] to-[#8C7BE8] flex items-center justify-center text-white shadow-lg shadow-[#624FDA]/30 shrink-0 group-hover:scale-105 transition-transform border border-white/20">
        <span className="text-white font-black text-sm tracking-tight font-ui">HP</span>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-black text-white tracking-wide font-ui">
            HOSTEL PRO-ERP
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#624FDA]/25 text-[#8C7BE8] border border-[#624FDA]/40 uppercase font-ui">
            v3.2
          </span>
        </div>
        <span className="text-[9px] text-white/50 uppercase tracking-[0.14em] font-ui mt-0.5">
          Campus Operating System
        </span>
      </div>
    </div>
  );
}

export default function LandingHeader() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activeMenuHover, setActiveMenuHover] = useState({
    title: "Domain Administration",
    desc: "Centralized domain authority separating faculty, finance, residential, transport, and clinical administrative controls.",
    badge: "Enterprise RBAC",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close product dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLetsTalk = () => {
    setContactModalOpen(true);
  };

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 mx-auto max-w-[1240px] px-3 sm:px-6 pointer-events-none">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Pill (Pointer events enabled) */}
        <Link
          href="/"
          className="pointer-events-auto group px-3.5 py-2 rounded-full bg-[#0D0E1A]/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60 hover:border-white/25 transition-all flex items-center shrink-0"
        >
          <GeometricLogo />
        </Link>

        {/* ─── Center Design Monks Floating Pill Navbar ─── */}
        <nav
          className="pointer-events-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#06070B]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/5"
          aria-label="Main Navigation"
        >
          {/* Workspaces Mega-Dropdown Toggle */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setProductOpen(!productOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer font-ui ${
                productOpen
                  ? "text-[#8C7BE8] bg-white/[0.08]"
                  : "text-white/85 hover:text-white hover:bg-white/[0.05]"
              }`}
              aria-expanded={productOpen}
            >
              <span>Workspaces</span>
              <ChevronDown
                size={13}
                className={`text-white/50 transition-transform duration-200 ${
                  productOpen ? "rotate-180 text-[#8C7BE8]" : ""
                }`}
              />
            </button>

            {/* Dark Luxury Mega-Dropdown Menu */}
            <AnimatePresence>
              {productOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[780px] rounded-3xl border border-white/15 bg-[#0C0D18]/95 backdrop-blur-2xl shadow-2xl shadow-black/90 p-6 z-50 grid grid-cols-12 gap-6 text-white"
                >
                  {/* Column 1: Roles & Workspaces */}
                  <div className="col-span-4 border-r border-white/10 pr-4 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40 font-ui block mb-2">
                      Roles &amp; Workspaces
                    </span>

                    {[
                      {
                        title: "Super Admin / Provost",
                        desc: "Global institutional parameters, campus creation, database backups & master audit logs.",
                        badge: "Full Control",
                        icon: ShieldCheck,
                      },
                      {
                        title: "Domain Administrators",
                        desc: "Separate domain controls for Faculty, Finance, Residential Wardens, and Fleet In-Charge.",
                        badge: "Domain RBAC",
                        icon: UserCheck,
                      },
                      {
                        title: "Faculty Station",
                        desc: "Lecture timetable grid, syllabi, attendance marking, and internal assessment grades.",
                        badge: "Academic Roster",
                        icon: GraduationCap,
                      },
                      {
                        title: "Student Portal",
                        desc: "Digital locker, exam results, mess food card balance, bus passes, and fee receipts.",
                        badge: "Self-Service",
                        icon: Users,
                      },
                    ].map((item, idx) => (
                      <Link
                        key={idx}
                        href="/modules"
                        onClick={() => setProductOpen(false)}
                        onMouseEnter={() =>
                          setActiveMenuHover({
                            title: item.title,
                            desc: item.desc,
                            badge: item.badge,
                          })
                        }
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] text-[#8C7BE8] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-[#8C7BE8] truncate font-ui">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-white/40 truncate">
                            {item.badge}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Column 2: Core Menus & Modules */}
                  <div className="col-span-4 border-r border-white/10 pr-4 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40 font-ui block mb-2">
                      Campus Modules
                    </span>

                    {[
                      {
                        title: "Classes, Courses & Timetables",
                        desc: "Dynamic conflict-free lecture timetables, room assignments, and semester curriculum planning.",
                        badge: "Academics",
                        icon: BookOpen,
                      },
                      {
                        title: "Hostel & Room Allotment",
                        desc: "Multi-block dormitories, 3D bed matrix, warden approvals, digital gate passes, and repairs.",
                        badge: "Residential",
                        icon: Building2,
                      },
                      {
                        title: "Bus Routes & GPS Fleet",
                        desc: "GPS-enabled route scheduling, designated student bus stops, driver rosters, and transit passes.",
                        badge: "Transport",
                        icon: Bus,
                      },
                      {
                        title: "Double-Entry Finance & HR",
                        desc: "Tuition demand batches, automated bank reconciliation, general ledger, and staff payroll slips.",
                        badge: "Financial Engine",
                        icon: DollarSign,
                      },
                      {
                        title: "Library Catalog & Circulation",
                        desc: "Dewey-decimal classification, RFID barcode issue/return counter, and e-learning repository.",
                        badge: "Library OS",
                        icon: Library,
                      },
                      {
                        title: "Integrated Campus Health",
                        desc: "Campus infirmary, medical clinic OPD triage, pharmacy stocks, and student health records.",
                        badge: "Health Clinic",
                        icon: Stethoscope,
                      },
                    ].map((item, idx) => (
                      <Link
                        key={idx}
                        href="/modules"
                        onClick={() => setProductOpen(false)}
                        onMouseEnter={() =>
                          setActiveMenuHover({
                            title: item.title,
                            desc: item.desc,
                            badge: item.badge,
                          })
                        }
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/[0.06] text-[#8C7BE8] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-[#8C7BE8] truncate font-ui">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-white/40 truncate">
                            {item.badge}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Column 3: Live Preview Card */}
                  <div className="col-span-4 flex flex-col justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#624FDA]/30 text-[#8C7BE8] border border-[#624FDA]/40 font-ui inline-block mb-3">
                        {activeMenuHover.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white font-ui mb-1.5">
                        {activeMenuHover.title}
                      </h4>
                      <p className="text-[11px] text-white/60 leading-relaxed font-body">
                        {activeMenuHover.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4">
                      <Link
                        href="/modules"
                        onClick={() => setProductOpen(false)}
                        className="text-xs font-bold text-[#8C7BE8] hover:text-white flex items-center gap-1.5 font-ui"
                      >
                        <span>Inspect full architecture</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modules Link */}
          <Link
            href="/modules"
            className={`px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors font-ui ${
              pathname === "/modules"
                ? "text-white bg-white/[0.12]"
                : "text-white/85 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            Modules
          </Link>

          {/* Pricing Link */}
          <Link
            href="/pricing"
            className={`px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors font-ui ${
              pathname === "/pricing"
                ? "text-white bg-white/[0.12]"
                : "text-white/85 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            Pricing
          </Link>

          {/* ─── HIGHLIGHTED "LET'S TALK ->" PILL BUTTON (Placed directly after Pricing) ─── */}
          <button
            type="button"
            onClick={handleLetsTalk}
            className="relative group px-4 sm:px-5 py-1.5 rounded-xl border border-[#9061F9] bg-[#0A0B14] hover:bg-[#121422] text-white text-[13px] font-bold transition-all shadow-[0_0_16px_rgba(144,97,249,0.25)] hover:shadow-[0_0_24px_rgba(144,97,249,0.45)] cursor-pointer font-ui flex items-center gap-1.5 overflow-hidden mx-1"
          >
            {/* Top-right corner gloss highlight reflection */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-white/30 blur-[4px] rounded-full -translate-y-3.5 translate-x-3.5 pointer-events-none group-hover:scale-125 transition-transform" />
            <span>Let&apos;s Talk</span>
            <ArrowUpRight size={14} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[2.2]" />
          </button>
        </nav>

        {/* Right Action Pill: Try Demo & Sign In (Pointer events enabled) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Try Demo Button triggering TryDemoModal */}
          <button
            type="button"
            onClick={() => setDemoModalOpen(true)}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-900/40 border border-violet-400/30 transition-all font-ui flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={12} className="text-amber-300" />
            <span>Try Demo</span>
          </button>

          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-[#0D0E1A]/85 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-bold text-white hover:border-[#624FDA]/60 hover:bg-[#624FDA]/20 transition-all font-ui flex items-center gap-1.5"
          >
            <span>Sign In</span>
            <ArrowRight size={13} className="text-[#8C7BE8]" />
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full bg-[#0D0E1A]/85 backdrop-blur-xl border border-white/10 text-white cursor-pointer"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto md:hidden mt-3 p-5 rounded-3xl border border-white/15 bg-[#0C0D18]/95 backdrop-blur-2xl shadow-2xl text-white space-y-4"
          >
            <div className="space-y-1">
              <Link
                href="/modules"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/[0.06]"
              >
                Modules &amp; Architecture
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/[0.06]"
              >
                Pricing &amp; Project Info
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setDemoModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#8C7BE8] hover:text-white hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-300" />
                <span>Interactive Try Demo Modal</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLetsTalk();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold font-ui text-center cursor-pointer"
              >
                Let&apos;s Talk Institutional Briefing
              </button>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white text-xs font-bold font-ui text-center"
              >
                Sign In to Terminal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Try Demo and Contact Modals */}
      <TryDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </header>
  );
}
