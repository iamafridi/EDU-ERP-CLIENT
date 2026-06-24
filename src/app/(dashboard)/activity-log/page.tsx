"use client";

import React, { useState, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import {
  PageHeader,
  Card,
  SearchInput,
  Select,
  Input,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

interface Activity {
  id: string;
  type: "fee" | "leave" | "complaint" | "incident" | "attendance" | "notice" | "message" | "health";
  message: string;
  timestamp: string;
  user?: string;
  href?: string;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; tone: "neutral" | "success" | "warning" | "danger" | "info" | "primary" | "gold" }
> = {
  fee: { label: "Finance / Fee", tone: "success" },
  leave: { label: "Faculty Leave", tone: "primary" },
  complaint: { label: "Grievance", tone: "warning" },
  incident: { label: "Campus Incident", tone: "danger" },
  attendance: { label: "Attendance", tone: "info" },
  notice: { label: "Official Notice", tone: "gold" },
  message: { label: "Communication", tone: "neutral" },
  health: { label: "Student Wellness", tone: "danger" },
};

const ALL_TYPES = Object.keys(TYPE_CONFIG);

const generateMockActivities = (): Activity[] => {
  const now = Date.now();
  const activities: Activity[] = [
    {
      id: "a1",
      type: "fee",
      message: "Marcus Chen paid tuition fee ৳50,000 (Semester V)",
      timestamp: new Date(now - 2 * 60000).toISOString(),
      user: "Marcus Chen",
      href: "/fees",
    },
    {
      id: "a2",
      type: "leave",
      message: "Dr. Drake approved academic leave for Sophia Martinez",
      timestamp: new Date(now - 15 * 60000).toISOString(),
      user: "Dr. Drake",
      href: "/leave",
    },
    {
      id: "a3",
      type: "complaint",
      message: "Ethan Gallagher filed hostel grievance regarding meal quality",
      timestamp: new Date(now - 1 * 3600000).toISOString(),
      user: "Ethan Gallagher",
      href: "/grievances",
    },
    {
      id: "a4",
      type: "incident",
      message: "Hostel Block B room reported electrical repair — assigned to estate works",
      timestamp: new Date(now - 2 * 3600000).toISOString(),
      user: "Estate Maintenance",
      href: "/incidents",
    },
    {
      id: "a5",
      type: "attendance",
      message: "MBBS Term 1 Lecture — 4 students marked absent today",
      timestamp: new Date(now - 3 * 3600000).toISOString(),
      user: "Attendance Engine",
      href: "/attendance",
    },
    {
      id: "a6",
      type: "notice",
      message: "Hostel Semester Recess Routine & Gate Timings published",
      timestamp: new Date(now - 5 * 3600000).toISOString(),
      user: "Provost Office",
      href: "/notices",
    },
    {
      id: "a7",
      type: "message",
      message: "Aria Takahashi submitted dissertation inquiry to Dr. Harrison",
      timestamp: new Date(now - 8 * 3600000).toISOString(),
      user: "Aria Takahashi",
      href: "/chat",
    },
    {
      id: "a8",
      type: "fee",
      message: "Sophia Martinez paid hostel accommodation fee ৳35,000",
      timestamp: new Date(now - 30 * 3600000).toISOString(),
      user: "Sophia Martinez",
      href: "/fees",
    },
    {
      id: "a9",
      type: "leave",
      message: "Ethan Gallagher submitted 3-day medical leave application",
      timestamp: new Date(now - 36 * 3600000).toISOString(),
      user: "Ethan Gallagher",
      href: "/leave",
    },
    {
      id: "a10",
      type: "attendance",
      message: "MBBS Term 2 Anatomy Dissection Lab attendance verified",
      timestamp: new Date(now - 48 * 3600000).toISOString(),
      user: "Faculty Registrar",
      href: "/attendance",
    },
    {
      id: "a11",
      type: "notice",
      message: "Midterm Examination timetable for MBBS Term 1 published",
      timestamp: new Date(now - 72 * 3600000).toISOString(),
      user: "Controller of Exams",
      href: "/notices",
    },
    {
      id: "a12",
      type: "complaint",
      message: "Central Library reading room air conditioning repair ticket created",
      timestamp: new Date(now - 96 * 3600000).toISOString(),
      user: "Library Custodian",
      href: "/grievances",
    },
    {
      id: "a13",
      type: "incident",
      message: "Hostel Block A passenger elevator annual safety inspection completed",
      timestamp: new Date(now - 120 * 3600000).toISOString(),
      user: "Facilities Manager",
      href: "/incidents",
    },
    {
      id: "a14",
      type: "fee",
      message: "Library fine cleared by Liam O'Connor — ৳250",
      timestamp: new Date(now - 216 * 3600000).toISOString(),
      user: "Liam O'Connor",
      href: "/fees",
    },
    {
      id: "a15",
      type: "notice",
      message: "Central Mess revised dietary rotation menu published for next month",
      timestamp: new Date(now - 264 * 3600000).toISOString(),
      user: "Mess Committee",
      href: "/notices",
    },
    {
      id: "a16",
      type: "leave",
      message: "Security warden duty shift leave endorsed: David Miller",
      timestamp: new Date(now - 288 * 3600000).toISOString(),
      user: "Chief Warden",
      href: "/leave",
    },
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
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
      if (!act.message.toLowerCase().includes(q) && !(act.user || "").toLowerCase().includes(q)) {
        return false;
      }
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
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log & Audit Stream"
        subtitle="Chronological audit stream of institutional transactions, fee payments, and administrative events."
        actions={
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            icon={<Download size={14} />}
          >
            Export CSV
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card noPadding className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={14} /> Filter Activity Stream
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} icon={<X size={12} />}>
              Clear Filters
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            placeholder="Search messages or users..."
            value={searchTerm}
            onValueChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Activity Types</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_CONFIG[t].label}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="text-xs"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="text-xs"
          />
        </div>
      </Card>

      {/* Activity Table */}
      <Card noPadding>
        {paginated.length === 0 ? (
          <EmptyState
            title="No Activity Events Found"
            description={
              hasFilters
                ? "No institutional activity matches your search criteria."
                : "No recent events have been logged."
            }
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-border">
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase w-36">
                      Event Category
                    </th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">
                      Event Description
                    </th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase w-36">
                      Triggered By
                    </th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase w-28">
                      Relative Time
                    </th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase text-right w-44">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((act) => {
                    const cfg = TYPE_CONFIG[act.type] || { label: act.type, tone: "neutral" };
                    return (
                      <tr key={act.id} className="hover:bg-surface-hover text-xs">
                        <td className="p-3">
                          <Badge variant={cfg.tone} size="sm">
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-text font-medium">{act.message}</td>
                        <td className="p-3 text-text-muted font-medium">{act.user || "System"}</td>
                        <td className="p-3 text-text-subtle font-mono text-[11px]">
                          {timeAgo(act.timestamp)}
                        </td>
                        <td className="p-3 text-right text-text-subtle font-mono text-[11px]">
                          {formatDate(act.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, filtered.length)} of{" "}
                {filtered.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  icon={<ChevronLeft size={13} />}
                >
                  Prev
                </Button>
                <span className="text-xs font-semibold text-text px-1">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  rightIcon={<ChevronRight size={13} />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
