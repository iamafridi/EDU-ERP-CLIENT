"use client";

import React from "react";
import Link from "next/link";
import { GeometricLogo } from "./LandingHeader";
import { ShieldCheck, Lock, Globe, Server, CheckCircle2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0914] text-white pt-18 pb-8 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-[#624FDA]/15 blur-[140px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand & Mission column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block group">
              <GeometricLogo />
            </Link>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-body max-w-sm">
              Hostel Pro-ERP is the comprehensive institutional operating system that powers universities,
              colleges, and residential campuses — connecting student enrollment, academic timetables,
              hostel dormitories, bus fleets, and double-entry finance into one calm daily workflow.
            </p>

            <div className="pt-2 space-y-1.5 text-xs text-white/50 font-body">
              <div>
                <span className="text-white/80 font-bold font-ui">Engineering HQ:</span> Chittagong &amp; Dhaka, Bangladesh
              </div>
              <div>
                <span className="text-white/80 font-bold font-ui">Global Deployments:</span> US, UK, UAE, Singapore &amp; India
              </div>
              <div>
                <span className="text-white/80 font-bold font-ui">Inquiries:</span> provost@hostelpro-erp.com
              </div>
            </div>
          </div>

          {/* Directory Column 1: Roles & Workspaces */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7BE8] font-ui">
              Roles &amp; Desks
            </h4>
            <ul className="space-y-2 text-xs text-white/60 font-body">
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Super Admin / Provost
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Domain Administrators
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Faculty &amp; Professors
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Student &amp; Parent Portal
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Warden &amp; Dorm Staff
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Librarian &amp; Transport Head
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Column 2: Campus Living & Logistics */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7BE8] font-ui">
              Campus Operations
            </h4>
            <ul className="space-y-2 text-xs text-white/60 font-body">
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Multi-Block Hostel Dormitories
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Smart Mess &amp; Digital Dining Ledger
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Bus Routes &amp; Fleet GPS Scheduling
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Library Catalog &amp; Circulation
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Campus Health &amp; Clinic Station
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Digital Gate Passes &amp; Attendance
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Column 3: Accounting & Governance */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7BE8] font-ui">
              Finance &amp; Governance
            </h4>
            <ul className="space-y-2 text-xs text-white/60 font-body">
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Double-Entry General Ledger
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Student Tuition Demand Batches
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Payroll Processing &amp; HR Slips
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Multi-Voucher Dual Approvals
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Chained Immutable Audit Trails
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Institutional Pricing &amp; ROI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Partner & Compliance Badges Row (Inspired by Design Monks) */}
        <div className="py-8 flex flex-wrap items-center justify-between gap-6 border-b border-white/10 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <span className="flex items-center gap-1.5 font-semibold text-white/80">
              <ShieldCheck size={16} className="text-[#5E9B7D]" />
              <span>ISO 27001 Certified Framework</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-white/80">
              <Lock size={16} className="text-[#8C7BE8]" />
              <span>TLS 1.3 / 256-Bit Encrypted</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-white/80">
              <Server size={16} className="text-[#C39A5A]" />
              <span>99.99% Guaranteed Cloud SLA</span>
            </span>
          </div>

          <div className="text-[11px] text-white/40 font-mono">
            MongoDB Atlas Replica Set • Docker • Node.js • Next.js 16
          </div>
        </div>

        {/* Copyright & Legal Row */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-body">
          <p>&copy; {new Date().getFullYear()} Hostel Pro-ERP LLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Security &amp; Audit Whitepaper
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* ─── GIANT DESIGN MONKS STYLE FOOTER TEXT BANNER ─── */}
      <div className="w-full overflow-hidden select-none border-t border-white/[0.06] pt-6 sm:pt-10 pb-4">
        <div className="max-w-[100vw] overflow-hidden whitespace-nowrap text-center">
          <span className="inline-block text-[14vw] sm:text-[13vw] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/30 via-white/10 to-white/0 font-ui hover:from-white/40 hover:via-[#8C7BE8]/20 transition-all duration-300">
            HOSTEL PRO_ERP
          </span>
        </div>
      </div>
    </footer>
  );
}
