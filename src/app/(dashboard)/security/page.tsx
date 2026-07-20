"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Shield, Lock, FileSpreadsheet, Plus, CheckCircle2, UserCheck, LogOut, Trash2, MapPin, ClipboardList, Pencil } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function SecurityDashboardPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"gate" | "visitor" | "patrol">("gate");
  const [successMsg, setSuccessMsg] = useState("");

  const isGuardOrAdmin = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  const { data: gateEntries = [], isLoading: isLoadingGate } = useQuery({
    queryKey: ["gateEntries"],
    queryFn: api.getGateEntries,
  });

  const { data: visitorLogs = [], isLoading: isLoadingVisitor } = useQuery({
    queryKey: ["visitorLogs"],
    queryFn: api.getVisitorLogs,
  });

  const { data: patrolLogs = [], isLoading: isLoadingPatrol } = useQuery({
    queryKey: ["patrolLogs"],
    queryFn: api.getPatrolLogs,
  });

  const deleteGateEntryMutation = useMutation({
    mutationFn: api.deleteGateEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      setSuccessMsg("Gate entry deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteVisitorLogMutation = useMutation({
    mutationFn: api.deleteVisitorLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor log deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const checkoutVisitorMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.updateVisitorLog(id, { exitTime: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor checkout logged successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-[#2563EB]" />
            Security & Curfew Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student curfews, register visitor passes, and monitor vehicle transits.
          </p>
        </div>

        {isGuardOrAdmin && (
          <div className="flex items-center gap-3">
            {activeTab === "gate" && (
              <Link
                href="/security/new?type=gate"
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus size={16} />
                New Gate Entry
              </Link>
            )}
            {activeTab === "visitor" && (
              <Link
                href="/security/new?type=visitor"
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus size={16} />
                Generate Visitor Pass
              </Link>
            )}
            {activeTab === "patrol" && (
              <Link
                href="/security/new?type=patrol"
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus size={16} />
                New Patrol Log
              </Link>
            )}
          </div>
        )}
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

      <div className="flex border-b border-[#e1e2ed] gap-2">
        {([
          { key: "gate" as const, label: "Gate Log Entries", icon: FileSpreadsheet },
          { key: "visitor" as const, label: "Visitor Logs & QR Passes", icon: Lock },
          { key: "patrol" as const, label: "Patrol Logs", icon: ClipboardList },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        {activeTab === "gate" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet size={16} /> Curfew & Transit Entries
              </span>
            </div>

            {isLoadingGate ? (
              <TableSkeleton rows={5} cols={8} />
            ) : gateEntries.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No active gate entries recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Person / Name</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Contact / Phone</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Purpose</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Vehicle / ID</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Entry Timestamp</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Curfew Flags</th>
                      {isGuardOrAdmin && (
                        <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {gateEntries.map((ent: any) => (
                      <tr key={ent.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ent.type === "student" ? "bg-blue-50 text-blue-700" :
                            ent.type === "visitor" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {ent.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          <Link href={`/security/${ent.id}?type=gate`} className="hover:text-[#2563EB] transition-colors">
                            {ent.personName}
                          </Link>
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{ent.contactNo || "N/A"}</td>
                        <td className="p-3 text-slate-500">{ent.purpose}</td>
                        <td className="p-3 font-mono text-slate-600">{ent.vehicleNumber || "N/A"}</td>
                        <td className="p-3 text-slate-400 font-mono">{new Date(ent.entryTime).toLocaleString()}</td>
                        <td className="p-3">
                          {ent.isLateEntry ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 border border-red-100 rounded">
                              LATE ENTRY: {ent.lateEntryReason}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <UserCheck size={12} /> Ontime Check-in
                            </span>
                          )}
                        </td>
                        {isGuardOrAdmin && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/security/${ent.id}?type=gate`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                                title="Edit gate entry"
                              >
                                <Pencil size={13} />
                              </Link>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this gate entry?")) {
                                    deleteGateEntryMutation.mutate(ent.id);
                                  }
                                }}
                                className="h-7 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-red-200"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "visitor" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={16} /> Guest Registers & Exit Logs
              </span>
            </div>

            {isLoadingVisitor ? (
              <TableSkeleton rows={5} cols={8} />
            ) : visitorLogs.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No visitor logs found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Visitor Name</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Contact No</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Purpose</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Vehicle No</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Entry Time</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Exit Time</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                      {isGuardOrAdmin && (
                        <th className="p-3 text-xs font-bold text-slate-400 uppercase">Manage</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {visitorLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-semibold text-slate-700">
                          <Link href={`/security/${log.id}?type=visitor`} className="hover:text-[#2563EB] transition-colors">
                            {log.visitorName}
                          </Link>
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{log.contactNo}</td>
                        <td className="p-3 text-slate-500">{log.purpose}</td>
                        <td className="p-3 text-slate-600 font-mono">{log.vehicleNumber || "Walk-in"}</td>
                        <td className="p-3 text-slate-400 font-mono">{new Date(log.entryTime).toLocaleString()}</td>
                        <td className="p-3 text-slate-400 font-mono">
                          {log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still Inside"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/security/${log.id}?type=visitor`}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                              title="Edit visitor log"
                            >
                              <Pencil size={13} />
                            </Link>
                          </div>
                        </td>
                        {isGuardOrAdmin && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {!log.exitTime && (
                                <button
                                  onClick={() => checkoutVisitorMutation.mutate(log.id)}
                                  className="h-7 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-red-150"
                                >
                                  <LogOut size={12} /> Log Exit
                                </button>
                              )}
                              {log.exitTime && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 size={12} /> Checkout Done
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this visitor log?")) {
                                    deleteVisitorLogMutation.mutate(log.id);
                                  }
                                }}
                                className="h-7 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-red-200"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "patrol" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={16} /> Patrol Activity Logs
              </span>
            </div>

            {isLoadingPatrol ? (
              <TableSkeleton rows={5} cols={4} />
            ) : patrolLogs.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No patrol logs found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Location</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Timestamp</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Notes</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {patrolLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-semibold text-slate-700 flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          <Link href={`/security/${log.id}?type=patrol`} className="hover:text-[#2563EB] transition-colors">
                            {log.location}
                          </Link>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{log.notes || "—"}</td>
                        <td className="p-3">
                          <Link
                            href={`/security/${log.id}?type=patrol`}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                            title="View patrol log"
                          >
                            <Pencil size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
