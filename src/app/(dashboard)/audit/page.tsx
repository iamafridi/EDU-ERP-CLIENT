"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Shield, Search, Download, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

const ACTION_BADGES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  UPDATE: "bg-blue-50 text-blue-700 border-blue-100",
  DELETE: "bg-red-50 text-red-700 border-red-100",
};

export default function AuditTrailPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams: Record<string, any> = { page, limit };
  if (action) queryParams.action = action;
  if (resource) queryParams.resource = resource;
  if (userId) queryParams.userId = userId;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  if (searchTerm) queryParams.searchTerm = searchTerm;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, limit, action, resource, userId, startDate, endDate, searchTerm],
    queryFn: () => api.getAuditLogs(queryParams),
  });

  const logs: any[] = data?.logs ?? [];
  const meta = data?.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 };

  const clearFilters = () => {
    setAction("");
    setResource("");
    setUserId("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Action", "Resource", "Resource ID", "User ID", "User Role", "IP Address", "Details"];
    const rows = logs.map((log: any) => [
      log.timestamp || "",
      log.action || "",
      log.resource || "",
      log.resourceId || "",
      log.userId || "",
      log.userRole || "",
      log.ip || "",
      log.diff ? JSON.stringify(log.diff).slice(0, 200) : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = action || resource || userId || startDate || endDate || searchTerm;

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-[#2563EB]" />
            Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track all system changes and user activities.</p>
        </div>
        <button onClick={exportCSV} disabled={logs.length === 0}
          className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} /> Filters
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input type="text" placeholder="Resource..." value={resource} onChange={(e) => { setResource(e.target.value); setPage(1); }}
              className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono" />
            <input type="text" placeholder="User ID..." value={userId} onChange={(e) => { setUserId(e.target.value); setPage(1); }}
              className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono" />
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full h-8 pl-7 pr-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No audit logs found.</p>
            <p className="text-[10px] text-slate-300 mt-1">{hasFilters ? "Try adjusting your filters." : "No activity has been recorded yet."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Timestamp</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Resource</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Resource ID</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">User</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Role</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e2ed]">
                  {logs.map((log: any, i: number) => (
                    <tr key={log._id || log.id || i} className="hover:bg-slate-50/50 text-xs">
                      <td className="p-3 font-mono text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "\u2014"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${ACTION_BADGES[log.action] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{log.resource}</td>
                      <td className="p-3 font-mono text-slate-400">{log.resourceId || "\u2014"}</td>
                      <td className="p-3 font-mono text-slate-600">{log.userId || "\u2014"}</td>
                      <td className="p-3 text-slate-500">{log.userRole || "\u2014"}</td>
                      <td className="p-3 font-mono text-slate-400">{log.ip || "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="h-7 px-2 bg-white border border-[#c3c6d7] rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1">
                  <ChevronLeft size={12} /> Prev
                </button>
                <span className="text-xs font-semibold text-slate-500">Page {meta.page} of {meta.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                  className="h-7 px-2 bg-white border border-[#c3c6d7] rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1">
                  Next <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
