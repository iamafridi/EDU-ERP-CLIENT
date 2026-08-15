"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Beaker, Plus, CheckCircle2, ClipboardList, Search, Trash2, Pencil, FileText } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { EhsWasteManagementPanel } from "@/components/campus/EhsWasteManagementPanel";

export default function LaboratoryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"requests" | "results" | "ehs-waste">("requests");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isLabTech = user?.staffSubRole === "lab-technician" || roleIs("domain-admin", "super-admin");
  const isDoctor = user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse";

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["labRequests"],
    queryFn: api.getLabRequests,
  });

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ["labResults", selectedRequestId],
    queryFn: () => api.getLabResultsByRequest(selectedRequestId),
    enabled: activeTab === "results" && !!selectedRequestId,
  });

  const filteredRequests = searchTerm
    ? requests.filter((r: any) =>
        (r.patientName || r.patientId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.status?.toLowerCase().includes(searchTerm.toLowerCase()))
    : requests;

  const visibleRequests = user?.role === "student"
    ? filteredRequests.filter((r: any) => r.patientId === user.id || r.patientName === user.name)
    : filteredRequests;

  const deleteRequestMutation = useMutation({
    mutationFn: api.deleteLabRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labRequests"] });
      setSuccessMsg("Request deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateLabRequestStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labRequests"] });
      setSuccessMsg("Status updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteResultMutation = useMutation({
    mutationFn: api.deleteLabResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labResults"] });
      setSuccessMsg("Result deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Beaker className="text-gold" />
            Laboratory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage lab requests, and record results.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "requests" && isDoctor && (
            <Link href="/laboratory/new"
              className="h-9 px-3 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sm">
              <Plus size={14} /> New Request
            </Link>
          )}
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /><span>{successMsg}</span>
        </motion.div>
      )}

      <div className="flex border-b border-border gap-2">
        <button onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "requests" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <ClipboardList size={14} className="inline mr-1" /> Requests
        </button>
        <button onClick={() => setActiveTab("results")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "results" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <FileText size={14} className="inline mr-1" /> Results
        </button>
        <button onClick={() => setActiveTab("ehs-waste")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "ehs-waste" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <Beaker size={14} className="inline mr-1" /> EHS Hazardous Waste & Bunker
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {activeTab === "requests" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={16} /> Lab Test Requests
              </span>
              <input type="text" placeholder="Search patient or status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 px-3 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-48 font-mono" />
            </div>
            {loadingRequests ? <TableSkeleton rows={5} cols={6} /> : visibleRequests.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Doctor</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Tests</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      {isLabTech && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {visibleRequests.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/laboratory/${r.id}`} className="font-bold text-slate-700 hover:text-gold transition-colors block">
                            {r.patientName || r.patientId}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono block">{r.patientId}</span>
                        </td>
                        <td className="p-3 text-slate-600">{r.doctorName || r.doctorId}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(r.tests || []).map((test: any, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-semibold">
                                {typeof test === "string" ? test : test.name || test.code || test}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{r.requestDate}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            r.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            r.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-100" :
                            r.status === "collected" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            r.status === "cancelled" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>{r.status}</span>
                        </td>
                        {isLabTech && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/laboratory/${r.id}`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                                <Pencil size={13} />
                              </Link>
                              {r.status === "pending" && (
                                <button onClick={() => updateStatusMutation.mutate({ id: r.id, payload: { status: "collected" } })}
                                  className="h-7 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-amber-200">Collect</button>
                              )}
                              {r.status === "collected" && (
                                <button onClick={() => updateStatusMutation.mutate({ id: r.id, payload: { status: "processing" } })}
                                  className="h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-blue-200">Process</button>
                              )}
                              {r.status === "processing" && (
                                <button onClick={() => updateStatusMutation.mutate({ id: r.id, payload: { status: "completed" } })}
                                  className="h-7 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-emerald-200">Complete</button>
                              )}
                              <button onClick={() => { if (confirm("Delete this request?")) deleteRequestMutation.mutate(r.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
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

        {activeTab === "results" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={16} /> Test Results
              </span>
              <div className="flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <select value={selectedRequestId} onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="h-8 px-3 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-56 font-mono">
                  <option value="">Select a request...</option>
                  {requests.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.id} — {r.patientName || r.patientId} ({r.status})</option>
                  ))}
                </select>
              </div>
            </div>
            {!selectedRequestId ? (
              <p className="p-12 text-center text-xs text-slate-400">Select a request to view results.</p>
            ) : loadingResults ? (
              <TableSkeleton rows={3} cols={5} />
            ) : results.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No results for this request.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Test</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Result</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Normal Range</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Remarks</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                      {isLabTech && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {results.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/laboratory/${r.id}`} className="font-bold text-slate-700 hover:text-gold transition-colors block">
                            {r.testName || r.testId}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono block">{r.testId}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-700">{r.resultValue}</span>
                        </td>
                        <td className="p-3 text-slate-500">{r.normalRange}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{r.remarks || "\u2014"}</td>
                        <td className="p-3 font-mono text-slate-500">{r.resultDate}</td>
                        {isLabTech && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/laboratory/${r.id}`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Delete this result?")) deleteResultMutation.mutate(r.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
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

        {activeTab === "ehs-waste" && (
          <div className="p-6">
            <EhsWasteManagementPanel />
          </div>
        )}
      </div>
    </div>
  );
}

