"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Wrench, Plus, CheckCircle2, AlertTriangle, Info, Trash2, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const severityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-50 text-blue-700 border-blue-100",
  high: "bg-amber-50 text-amber-700 border-amber-100",
  critical: "bg-red-50 text-red-700 border-red-100 animate-pulse",
};

const statusColors: Record<string, string> = {
  reported: "bg-purple-50 text-purple-700 border-purple-100",
  investigating: "bg-sky-50 text-sky-700 border-sky-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function MaintenanceIncidentsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: api.getIncidents,
  });

  const filteredIncidents = useMemo(() => {
    let list = [...incidents];

    if (severityFilter !== "all") {
      list = list.filter((inc: any) => inc.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((inc: any) => inc.status === statusFilter);
    }

    list.sort((a: any, b: any) => {
      return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
    });

    return list;
  }, [incidents, severityFilter, statusFilter]);

  const deleteIncidentMutation = useMutation({
    mutationFn: api.deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSuccessMsg("Incident ticket deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-[#2563EB]" />
            Maintenance & Dispatch Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log facility issues, dispatch technicians, and manage building infrastructure tickets.
          </p>
        </div>

        <Link
          href="/incidents/new"
          className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
        >
          <Plus size={16} />
          Log Maintenance Ticket
        </Link>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity:</span>
          <div className="flex gap-1">
            {["all", "critical", "high", "medium", "low"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer border ${
                  severityFilter === s
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-slate-500 border-[#c3c6d7] hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <div className="flex gap-1">
            {["all", "reported", "investigating", "resolved", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer border ${
                  statusFilter === s
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-slate-500 border-[#c3c6d7] hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Incident & Dispatch Tickets
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-bold">
            {filteredIncidents.length} of {incidents.length} Tasks
          </span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-[#e1e2ed]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto space-y-3">
            <Info size={48} className="text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">
              {incidents.length === 0 ? "No Active Tickets" : "No Matching Tickets"}
            </h3>
            <p className="text-xs text-slate-400">
              {incidents.length === 0
                ? "There are no active maintenance tickets logged at the moment."
                : "No tickets match the selected filters. Try adjusting your criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e1e2ed]">
            {filteredIncidents.map((inc: any) => {
              return (
                <div key={inc.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${statusColors[inc.status] || "bg-slate-50 text-slate-500"}`}>
                        Status: {inc.status}
                      </span>
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${severityColors[inc.severity] || "bg-slate-50 text-slate-500"}`}>
                        Severity: {inc.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Logged: {inc.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {inc.title}
                      {inc.severity === "critical" && <AlertTriangle size={16} className="text-red-500" />}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{inc.description}</p>

                    <div className="text-[10px] font-semibold text-slate-500 bg-slate-100/70 border border-slate-200/50 px-2 py-1 rounded inline-block">
                      Location: <strong className="text-slate-700 font-mono">{inc.location}</strong>
                    </div>

                    {inc.technician && (
                      <div className="text-[10px] font-semibold text-slate-500 bg-blue-50/70 border border-blue-100/50 px-2 py-1 rounded inline-block">
                        Technician: <strong className="text-blue-700 font-mono">{inc.technician}</strong>
                      </div>
                    )}

                    {inc.resolution && (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-emerald-800 block">Resolution Feedback:</span>
                        <p className="text-slate-600">{inc.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 self-start md:self-auto flex items-center gap-2">
                    <Link
                      href={`/incidents/${inc.id}`}
                      className="h-8 px-3 border border-[#c3c6d7] hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Pencil size={12} />
                      Dispatch / Edit
                    </Link>
                    {isStaff && (
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this incident ticket permanently?")) {
                            deleteIncidentMutation.mutate(inc.id);
                          }
                        }}
                        className="h-8 px-3 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
