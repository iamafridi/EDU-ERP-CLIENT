"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  DollarSign,
  Bus,
  Library,
  Stethoscope,
  Users,
  Search,
  Bell,
} from "lucide-react";

export interface PreviewData {
  greeting: string;
  subtitle: string;
  kpis: { label: string; value: string; trend?: string; colorTone?: "violet" | "green" | "gold" | "rose" }[];
  chartTitle: string;
  chartTrend: string;
  chartBars: number[];
  activities: { title: string; time: string; badge: string; badgeTone: "violet" | "green" | "rose" | "gold" }[];
}

export const PRESET_PREVIEWS: Record<string, PreviewData> = {
  overview: {
    greeting: "Good morning, Provost Amina.",
    subtitle: "Central University Campus & Residences • All systems operational",
    kpis: [
      { label: "Active Students", value: "4,286", trend: "↗ 8.4% YOY", colorTone: "violet" },
      { label: "Class Attendance", value: "94.2%", trend: "Biometric Verified", colorTone: "green" },
      { label: "Hostel Occupancy", value: "94.0%", trend: "1,850 Residents", colorTone: "gold" },
    ],
    chartTitle: "Weekly Campus Activity & Student Presence",
    chartTrend: "94.2% average institutional attendance",
    chartBars: [70, 78, 86, 94, 91, 95, 93],
    activities: [
      { title: "Semester 4 conflict-free lecture timetable published", time: "10m ago", badge: "Academics", badgeTone: "violet" },
      { title: "Hostel Block B room check-in completed for 48 medicos", time: "22m ago", badge: "Hostel", badgeTone: "gold" },
      { title: "Campus Bus Route #4 morning transit log synchronized", time: "45m ago", badge: "Transport", badgeTone: "green" },
      { title: "Term fee collection batch auto-reconciled with bank feed", time: "1h ago", badge: "Finance", badgeTone: "violet" },
    ],
  },
  hostel: {
    greeting: "Hostel & Residence Command",
    subtitle: "Dormitory Blocks A, B, C & D • 1,850 Active Medicos & Residents",
    kpis: [
      { label: "Bed Capacity", value: "1,850 / 1,950", trend: "94.8% Occupied", colorTone: "gold" },
      { label: "Mess Meals Today", value: "3,200+", trend: "Breakfast & Lunch Scanned", colorTone: "green" },
      { label: "Active Out-Passes", value: "64", trend: "Warden Approved", colorTone: "violet" },
    ],
    chartTitle: "Hourly Dining Hall & Mess Food Card Scans",
    chartTrend: "3,200 meals served across 2 dining halls",
    chartBars: [30, 45, 88, 98, 70, 92, 85],
    activities: [
      { title: "Block C-204 double-occupancy room keys issued", time: "8m ago", badge: "Hostel", badgeTone: "gold" },
      { title: "Dining Hall 1 lunch scanner count cleared: 980 meals", time: "20m ago", badge: "Mess", badgeTone: "green" },
      { title: "Overnight library out-pass verified at Main Campus Gate", time: "38m ago", badge: "Gate Security", badgeTone: "violet" },
      { title: "Hostel A Wing AC maintenance ticket resolved by engineer", time: "1h ago", badge: "Maintenance", badgeTone: "rose" },
    ],
  },
  academics: {
    greeting: "Academic Operations & Classes",
    subtitle: "Dynamic Timetables, Room Allocation & Examination Seating",
    kpis: [
      { label: "Course Batches", value: "36 Active", trend: "18 Departments", colorTone: "violet" },
      { label: "Lecture Attendance", value: "95.4%", trend: "RFID Verified", colorTone: "green" },
      { label: "Exam Seating", value: "100%", trend: "Zero Clash", colorTone: "green" },
    ],
    chartTitle: "Daily Lecture Hall & Laboratory Room Utilization",
    chartTrend: "95.4% average room efficiency",
    chartBars: [82, 89, 94, 96, 92, 98, 95],
    activities: [
      { title: "Computer Science & Anatomy lecture hall swap auto-resolved", time: "6m ago", badge: "Timetable", badgeTone: "violet" },
      { title: "Mid-term internal assessment marksheets locked by Faculty", time: "18m ago", badge: "Grades", badgeTone: "gold" },
      { title: "Auditorium reservation confirmed for University Symposium", time: "50m ago", badge: "Facility", badgeTone: "green" },
    ],
  },
  transport: {
    greeting: "Campus Fleet & Transit Logistics",
    subtitle: "24 Campus Buses • 18 City Pickup Routes • Real-Time GPS Tracking",
    kpis: [
      { label: "Fleet Vehicles", value: "24 Buses", trend: "100% Operational", colorTone: "green" },
      { label: "Daily Commuters", value: "1,420+", trend: "Students & Faculty", colorTone: "violet" },
      { label: "On-Time Arrival", value: "98.6%", trend: "GPS Monitored", colorTone: "green" },
    ],
    chartTitle: "Morning & Evening Campus Transit Passenger Volume",
    chartTrend: "1,420 commuters tracked across all 18 routes",
    chartBars: [90, 95, 70, 40, 50, 96, 92],
    activities: [
      { title: "Bus Route #7 arrived at University North Gate on time", time: "4m ago", badge: "Transit", badgeTone: "green" },
      { title: "Term bus pass digital barcode renewal issued for 84 medicos", time: "25m ago", badge: "Passes", badgeTone: "violet" },
      { title: "Vehicle #12 preventative brake maintenance inspection certified", time: "1h ago", badge: "Fleet Maintenance", badgeTone: "gold" },
    ],
  },
  finance: {
    greeting: "General Ledger & Student Fees",
    subtitle: "GAAP Double-Entry Chart of Accounts • Automated Bank Feeds",
    kpis: [
      { label: "YTD Fee Collections", value: "৳38.4 Cr", trend: "98.2% Realized", colorTone: "violet" },
      { label: "Auto-Reconciled", value: "99.98%", trend: "Zero Discrepancy", colorTone: "green" },
      { label: "Payroll Run", value: "Completed", trend: "420 Staff & Faculty", colorTone: "green" },
    ],
    chartTitle: "Weekly Student Tuition & Hostel Fee Inflows",
    chartTrend: "৳24.2 Lakhs collected today across all counters",
    chartBars: [60, 72, 85, 94, 88, 96, 92],
    activities: [
      { title: "Tuition collection demand batch auto-matched with bank feeds", time: "14m ago", badge: "Fees", badgeTone: "violet" },
      { title: "Hostel cafeteria supply procurement PO approved by Treasurer", time: "30m ago", badge: "Voucher", badgeTone: "gold" },
      { title: "Monthly faculty salary slips generated with tax calculations", time: "2h ago", badge: "Payroll", badgeTone: "green" },
    ],
  },
  library: {
    greeting: "Library Accession & Knowledge Center",
    subtitle: "48,000+ Cataloged Volumes • Dewey Decimal & RFID Barcode Desks",
    kpis: [
      { label: "Cataloged Books", value: "48,200", trend: "Physical & Digital", colorTone: "violet" },
      { label: "Daily Circulation", value: "650+ Issues", trend: "Avg TAT <20s", colorTone: "green" },
      { label: "Quiet Zone Seats", value: "180 / 220", trend: "82% Occupied", colorTone: "gold" },
    ],
    chartTitle: "Hourly Library Checkouts & Study Hall Entries",
    chartTrend: "650+ book checkouts and return transactions",
    chartBars: [40, 65, 85, 92, 88, 75, 60],
    activities: [
      { title: "Medical Surgery Reference 12th Ed. issued to Medico #309", time: "11m ago", badge: "Circulation", badgeTone: "green" },
      { title: "Overdue fine automated payment collected via student ledger", time: "28m ago", badge: "Fines", badgeTone: "gold" },
      { title: "New subscription added: 24 International Science E-Journals", time: "1h ago", badge: "E-Repository", badgeTone: "violet" },
    ],
  },
  clinic: {
    greeting: "Campus Infirmary & Medical Clinic",
    subtitle: "Integrated Student Health Services • OPD Triage & Infirmary Beds",
    kpis: [
      { label: "Infirmary Beds", value: "38 / 40", trend: "Campus Health", colorTone: "rose" },
      { label: "Daily Clinic OPD", value: "240+", trend: "Consultations", colorTone: "green" },
      { label: "Pharmacy Stock", value: "100%", trend: "Essential Medicines", colorTone: "green" },
    ],
    chartTitle: "Campus Clinic & Student Health Hourly Consultations",
    chartTrend: "240 consultations and vital checks recorded",
    chartBars: [35, 60, 80, 95, 85, 70, 50],
    activities: [
      { title: "Resident student admitted to Campus Infirmary Room 3 for observation", time: "9m ago", badge: "Infirmary", badgeTone: "rose" },
      { title: "Routine annual student health checkup completed for Batch 2024", time: "35m ago", badge: "Vitals", badgeTone: "green" },
      { title: "Campus pharmacy dispensed prescribed antibiotic course", time: "1h ago", badge: "Pharmacy", badgeTone: "gold" },
    ],
  },
};

export default function DashboardPreview({
  data = PRESET_PREVIEWS.overview,
  activeSidebar = "overview",
}: {
  data?: PreviewData;
  activeSidebar?: string;
}) {
  return (
    <div className="relative w-full rounded-3xl bg-[#0E101D] border border-white/15 shadow-2xl shadow-black/80 overflow-hidden">
      {/* Browser Chrome Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0B0C15] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D57E86]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#C39A5A]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#5E9B7D]/80" />
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] text-white/50 font-mono">
            <span>https://edu-erp-client.vercel.app/dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#5E9B7D] font-ui">
          <span className="w-2 h-2 rounded-full bg-[#5E9B7D] animate-pulse" />
          <span>Production Cluster Online</span>
        </div>
      </div>

      {/* Main App Layout Inside Browser */}
      <div className="flex min-h-[390px] sm:min-h-[440px]">
        {/* Mini Sidebar */}
        <div className="w-14 sm:w-16 bg-[#0B0C15] border-r border-white/10 flex flex-col items-center py-4 justify-between shrink-0">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#624FDA] to-[#8C7BE8] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#624FDA]/40 font-ui">
              HP
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  activeSidebar === "overview" ? "bg-white/[0.12] text-[#8C7BE8] border border-white/15" : "text-white/40 hover:text-white"
                }`}
                title="Overview"
              >
                <LayoutDashboard size={18} />
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  activeSidebar === "hostel" ? "bg-white/[0.12] text-[#8C7BE8] border border-white/15" : "text-white/40 hover:text-white"
                }`}
                title="Hostels & Dorms"
              >
                <Building2 size={18} />
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  activeSidebar === "academics" ? "bg-white/[0.12] text-[#8C7BE8] border border-white/15" : "text-white/40 hover:text-white"
                }`}
                title="Classes & Timetables"
              >
                <BookOpen size={18} />
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  activeSidebar === "transport" ? "bg-white/[0.12] text-[#8C7BE8] border border-white/15" : "text-white/40 hover:text-white"
                }`}
                title="Transport & Buses"
              >
                <Bus size={18} />
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  activeSidebar === "finance" ? "bg-white/[0.12] text-[#8C7BE8] border border-white/15" : "text-white/40 hover:text-white"
                }`}
                title="Finance & Fees"
              >
                <DollarSign size={18} />
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  activeSidebar === "clinic" ? "bg-white/[0.12] text-[#8C7BE8] border border-white/15" : "text-white/40 hover:text-white"
                }`}
                title="Campus Health Clinic"
              >
                <Stethoscope size={18} />
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs font-ui">
            P
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 sm:p-6 bg-[#0E101D] overflow-hidden flex flex-col justify-between text-white">
          <div>
            {/* Top Bar inside Dashboard */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  {data.greeting}
                </h3>
                <p className="text-[11px] text-white/50 font-body">
                  {data.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-white/50 flex items-center justify-center">
                  <Search size={14} />
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-white/50 flex items-center justify-center relative">
                  <Bell size={14} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#624FDA]" />
                </div>
              </div>
            </div>

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4">
              {data.kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors"
                >
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-ui block truncate">
                    {kpi.label}
                  </span>
                  <div className="text-base sm:text-xl font-extrabold text-white font-ui mt-0.5 tabular-nums">
                    {kpi.value}
                  </div>
                  {kpi.trend && (
                    <span
                      className={`text-[10px] font-semibold mt-0.5 block ${
                        kpi.colorTone === "green"
                          ? "text-[#5E9B7D]"
                          : kpi.colorTone === "gold"
                          ? "text-[#C39A5A]"
                          : kpi.colorTone === "rose"
                          ? "text-[#D57E86]"
                          : "text-[#8C7BE8]"
                      }`}
                    >
                      {kpi.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Telemetry Bar Chart */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-ui">
                  {data.chartTitle}
                </span>
                <span className="text-[10px] font-semibold text-[#8C7BE8] font-ui">
                  {data.chartTrend}
                </span>
              </div>
              <div className="h-16 sm:h-20 flex items-end gap-2 sm:gap-3 pt-2">
                {data.chartBars.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`w-full rounded-t-sm transition-all ${
                        i === data.chartBars.length - 1
                          ? "bg-gradient-to-t from-[#624FDA] to-[#8C7BE8]"
                          : "bg-white/15 hover:bg-white/30"
                      }`}
                    />
                    <span className="text-[9px] text-white/40 font-mono">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-ui block">
                Live Institutional Audit Stream
              </span>
              <div className="divide-y divide-white/10 border-t border-white/10">
                {data.activities.slice(0, 3).map((act, i) => (
                  <div key={i} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          act.badgeTone === "green"
                            ? "bg-[#5E9B7D]"
                            : act.badgeTone === "rose"
                            ? "bg-[#D57E86]"
                            : act.badgeTone === "gold"
                            ? "bg-[#C39A5A]"
                            : "bg-[#8C7BE8]"
                        }`}
                      />
                      <span className="text-white/80 truncate font-body text-[11px] sm:text-xs">
                        {act.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 shrink-0 font-mono">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
