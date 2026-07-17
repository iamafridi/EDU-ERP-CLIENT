"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Download, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface Activity {
  id: string;
  type: "fee" | "leave" | "complaint" | "incident" | "attendance" | "notice" | "message" | "health";
  message: string;
  timestamp: string;
  user?: string;
  href?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  fee: { label: "Payment", color: "text-emerald-600", bg: "bg-emerald-50" },
  leave: { label: "Leave", color: "text-blue-600", bg: "bg-blue-50" },
  complaint: { label: "Complaint", color: "text-amber-600", bg: "bg-amber-50" },
  incident: { label: "Incident", color: "text-red-600", bg: "bg-red-50" },
  attendance: { label: "Attendance", color: "text-purple-600", bg: "bg-purple-50" },
  notice: { label: "Notice", color: "text-cyan-600", bg: "bg-cyan-50" },
  message: { label: "Message", color: "text-sky-600", bg: "bg-sky-50" },
  health: { label: "Health", color: "text-rose-600", bg: "bg-rose-50" },
};

const ALL_TYPES = Object.keys(TYPE_CONFIG);

const generateMockActivities = (): Activity[] => {
  const now = Date.now();
  const activities: Activity[] = [
    { id: "a1", type: "fee", message: "Marcus Chen paid fee $500 (Tuition Fee)", timestamp: new Date(now - 2 * 60000).toISOString(), user: "Marcus Chen", href: "/fees" },
    { id: "a2", type: "leave", message: "Dr. Drake approved leave for Sophia Martinez", timestamp: new Date(now - 15 * 60000).toISOString(), user: "Dr. Drake", href: "/leave" },
    { id: "a3", type: "complaint", message: "Ethan Gallagher filed complaint about mess food", timestamp: new Date(now - 1 * 3600000).toISOString(), user: "Ethan Gallagher", href: "/grievances" },
    { id: "a4", type: "incident", message: "Room B-203 reported water leak — assigned to maintenance", timestamp: new Date(now - 2 * 3600000).toISOString(), user: "Maintenance", href: "/incidents" },
    { id: "a5", type: "attendance", message: "MBBS Y1 — 4 students marked absent today", timestamp: new Date(now - 3 * 3600000).toISOString(), user: "System", href: "/attendance" },
    { id: "a6", type: "notice", message: "New notice: Hostel Winter Break Schedule published", timestamp: new Date(now - 5 * 3600000).toISOString(), user: "Admin", href: "/notices" },
    { id: "a7", type: "message", message: "New message from Aria Takahashi to Dr. Harrison", timestamp: new Date(now - 8 * 3600000).toISOString(), user: "Aria Takahashi", href: "/chat" },
    { id: "a8", type: "health", message: "Student visited Health Center: John Doe — mild fever", timestamp: new Date(now - 24 * 3600000).toISOString(), user: "John Doe", href: "/health-center" },
    { id: "a9", type: "fee", message: "Sophia Martinez paid hostel fee $350", timestamp: new Date(now - 30 * 3600000).toISOString(), user: "Sophia Martinez", href: "/fees" },
    { id: "a10", type: "leave", message: "Ethan Gallagher applied for 3-day leave", timestamp: new Date(now - 36 * 3600000).toISOString(), user: "Ethan Gallagher", href: "/leave" },
    { id: "a11", type: "attendance", message: "MBBS Y2 — lab session attendance recorded", timestamp: new Date(now - 48 * 3600000).toISOString(), user: "System", href: "/attendance" },
    { id: "a12", type: "notice", message: "Exam schedule for MBBS Y1 published", timestamp: new Date(now - 72 * 3600000).toISOString(), user: "Admin", href: "/notices" },
    { id: "a13", type: "complaint", message: "Library AC not working — complaint filed", timestamp: new Date(now - 96 * 3600000).toISOString(), user: "Library Staff", href: "/grievances" },
    { id: "a14", type: "incident", message: "Block A elevator maintenance completed", timestamp: new Date(now - 120 * 3600000).toISOString(), user: "Maintenance", href: "/incidents" },
    { id: "a15", type: "health", message: "Health Center: Flu vaccination drive scheduled", timestamp: new Date(now - 168 * 3600000).toISOString(), user: "Health Center", href: "/health-center" },
    { id: "a16", type: "message", message: "Dr. Harrison sent message to MBBS Y1 group", timestamp: new Date(now - 192 * 3600000).toISOString(), user: "Dr. Harrison", href: "/chat" },
    { id: "a17", type: "fee", message: "Library fine paid by Liam O'Connor — $25", timestamp: new Date(now - 216 * 3600000).toISOString(), user: "Liam O'Connor", href: "/fees" },
    { id: "a18", type: "attendance", message: "Clinical rotation attendance for MBBS Y3", timestamp: new Date(now - 240 * 3600000).toISOString(), user: "System", href: "/attendance" },
    { id: "a19", type: "notice", message: "Hostel mess menu updated for December", timestamp: new Date(now - 264 * 3600000).toISOString(), user: "Admin", href: "/notices" },
    { id: "a20", type: "leave", message: "Staff leave approved: David Miller (Security)", timestamp: new Date(now - 288 * 3600000).toISOString(), user: "David Miller", href: "/leave" },
  ];
  return activities;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const limit = 10;

  const allActivities = generateMockActivities();

  const filtered = allActivities.filter((act) => {
    if (typeFilter && act.type !== typeFilter) return false;
    if (startDate && new Date(act.timestamp) < new Date(startDate)) return false;
    if (endDate && new Date(act.timestamp) > new Date(endDate + "T23:59:59")) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!act.message.toLowerCase().includes(q) && !(act.user || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const clearFilters = () => {
    setTypeFilter("");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasFilters = typeFilter || searchTerm || startDate || endDate;

  const handleExportCSV = useCallback(() => {
    const headers = ["Type", "Message", "User", "Timestamp"];
    const rows = filtered.map((act) => [
      TYPE_CONFIG[act.type]?.label || act.type,
      act.message,
      act.user || "",
      formatDate(act.timestamp),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const btnClass = "h-9 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5";
  const inputClass = "h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="text-[#2563EB]" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
            <p className="text-xs text-slate-400 mt-1">Track all system activities and user actions.</p>
          </div>
        </div>
        <button onClick={handleExportCSV} className={btnClass}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Search messages or users..." className={`${inputClass} pl-9 w-full`} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className={`${inputClass} min-w-[140px]`}>
              <option value="">All Types</option>
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className={inputClass} />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="h-9 px-3 text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1 cursor-pointer">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e1e2ed] bg-slate-50">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No activities found</td>
                </tr>
              ) : (
                paginated.map((act) => {
                  const cfg = TYPE_CONFIG[act.type];
                  return (
                    <tr key={act.id} className="border-b border-[#e1e2ed] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${cfg?.bg} ${cfg?.color} border border-transparent`}>
                          {cfg?.label || act.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 max-w-xs truncate">{act.message}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{act.user || "-"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(act.timestamp)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(act.timestamp)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e1e2ed] bg-slate-50">
          <span className="text-[10px] text-slate-400 font-semibold">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <span className="text-[10px] font-bold text-slate-500 min-w-[40px] text-center">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
