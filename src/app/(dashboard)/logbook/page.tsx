"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { ClipboardList, Plus, CheckCircle2, BookOpen, User, TrendingUp, Search, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { InternshipRosterPanel } from "@/components/academic/InternshipRosterPanel";

export default function LogbookPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"crri_internship" | "catalog" | "entries" | "summary">("crri_internship");
  const [successMsg, setSuccessMsg] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [rotationFilter, setRotationFilter] = useState("");

  const isAdminOrHod = roleIs("domain-admin", "super-admin");
  const isStudent = roleIs("student");

  const { data: procedures = [], isLoading: loadingProcs } = useQuery({
    queryKey: ["clinicalProcedures"],
    queryFn: api.getClinicalProcedures,
  });

  const { data: logEntries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ["logEntries"],
    queryFn: api.getLogEntries,
  });

  const { data: rotations = [] } = useQuery({
    queryKey: ["clinicalRotations"],
    queryFn: api.getClinicalRotations,
  });

  const studentEntries = logEntries.filter((e: any) => {
    const matchesStudent = studentFilter
      ? e.student === studentFilter || e.studentName?.toLowerCase().includes(studentFilter.toLowerCase())
      : true;
    const matchesRotation = rotationFilter
      ? e.rotation === rotationFilter || e.department === rotationFilter
      : true;
    return matchesStudent && matchesRotation;
  });

  const { data: summary = [], isLoading: loadingSummary } = useQuery({
    queryKey: ["competencySummary", studentFilter],
    queryFn: () => api.getStudentCompetencySummary(studentFilter || "STU-001"),
    enabled: activeTab === "summary" && !!studentFilter,
  });

  const deleteProcMutation = useMutation({
    mutationFn: api.deleteClinicalProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicalProcedures"] });
      setSuccessMsg("Procedure deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: api.deleteLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      setSuccessMsg("Entry deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const signOffMutation = useMutation({
    mutationFn: api.signOffLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      setSuccessMsg("Entry signed off.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const uniqueDepartments: string[] = Array.from(new Set(rotations.map((r: any) => r.department).filter(Boolean)));

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-gold" />
            Clinical Logbook
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track clinical procedures, log patient encounters, and monitor competency progress.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "catalog" && isAdminOrHod && (
            <Link href="/logbook/new" className="h-9 px-3 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sm">
              <Plus size={14} /> Add Procedure
            </Link>
          )}
          {activeTab === "entries" && (
            <Link href="/logbook/new" className="h-9 px-3 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sm">
              <Plus size={14} /> New Entry
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
        <button onClick={() => setActiveTab("crri_internship")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "crri_internship" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <ShieldCheck size={14} className="inline mr-1" /> CRRI Rotations &amp; Procedure Quotas
        </button>
        <button onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "catalog" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <BookOpen size={14} className="inline mr-1" /> Procedure Catalog
        </button>
        <button onClick={() => setActiveTab("entries")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "entries" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <User size={14} className="inline mr-1" /> Log Entries
        </button>
        <button onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "summary" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <TrendingUp size={14} className="inline mr-1" /> Competency Summary
        </button>
      </div>

      {activeTab === "crri_internship" && (
        <InternshipRosterPanel />
      )}

      {activeTab !== "crri_internship" && (
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {activeTab === "catalog" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={16} /> Clinical Procedure Catalog
              </span>
            </div>
            {loadingProcs ? <TableSkeleton rows={5} cols={5} /> : procedures.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No procedures defined yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Code</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Name</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Category</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Required</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Description</th>
                      {isAdminOrHod && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {procedures.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-mono font-bold text-gold">{p.code}</td>
                        <td className="p-3 font-semibold text-slate-700">{p.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold capitalize">{p.category}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-600">{p.minimumRequired}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{p.description || "\u2014"}</td>
                        {isAdminOrHod && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/logbook/${p.id}`} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Delete this procedure?")) deleteProcMutation.mutate(p.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={13} />
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

        {activeTab === "entries" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User size={16} /> Student Procedure Logs
              </span>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Filter by student..." value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}
                  className="h-8 px-3 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-48 font-mono" />
                <select value={rotationFilter} onChange={(e) => setRotationFilter(e.target.value)}
                  className="h-8 px-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-40">
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>
            {loadingEntries ? <TableSkeleton rows={5} cols={7} /> : studentEntries.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No log entries found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Procedure</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Competency</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Sign Off</th>
                      {!isStudent && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {studentEntries.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/logbook/${e.id}`} className="font-bold text-slate-700 hover:text-gold transition-colors block">
                            {e.studentName || e.student}
                          </Link>
                        </td>
                        <td className="p-3 font-semibold text-slate-600">{e.procedureName || e.procedure}</td>
                        <td className="p-3 text-slate-500">{e.patientAge}y / {e.patientGender}</td>
                        <td className="p-3 font-mono text-slate-500">{e.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            e.competency === "competent" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            e.competency === "performed" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            e.competency === "assisted" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}>{e.competency}</span>
                        </td>
                        <td className="p-3">
                          {e.supervisorSignOff ? (
                            <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1"><CheckCircle2 size={12} /> Signed</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Pending</span>
                          )}
                        </td>
                        {!isStudent && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {!e.supervisorSignOff && (
                                <button onClick={() => signOffMutation.mutate(e.id)} className="h-7 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-emerald-200">
                                  <ShieldCheck size={11} /> Sign Off
                                </button>
                              )}
                              <Link href={`/logbook/${e.id}`} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Delete this entry?")) deleteEntryMutation.mutate(e.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={13} />
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

        {activeTab === "summary" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={16} /> Competency Summary
              </span>
              <div className="flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <input type="text" placeholder="Student ID (e.g. STU-001)" value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}
                  className="h-8 px-3 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-48 font-mono" />
              </div>
            </div>
            {!studentFilter ? (
              <p className="p-12 text-center text-xs text-slate-400">Enter a student ID to view their competency summary.</p>
            ) : loadingSummary ? (
              <TableSkeleton rows={5} cols={6} />
            ) : summary.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No data for this student.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Procedure</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Logged</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Required</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Observed</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Assisted</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Performed</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Competent</th>
                      {isAdminOrHod && (
                        <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {summary.map((item: any, i: number) => (
                      <tr key={item.procedure?.id || i} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <span className="font-semibold text-slate-700 block">{item.procedure?.name || item.procedure}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.procedure?.code || ""}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">{item.totalLogs}</td>
                        <td className="p-3 font-mono text-slate-500">{item.minimumRequired}</td>
                        <td className="p-3">
                          {item.met ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">Met</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">Not Met</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{item.byCompetency?.observed || 0}</td>
                        <td className="p-3 font-mono text-slate-500">{item.byCompetency?.assisted || 0}</td>
                        <td className="p-3 font-mono text-slate-500">{item.byCompetency?.performed || 0}</td>
                        <td className="p-3 font-mono text-slate-500">{item.byCompetency?.competent || 0}</td>
                        {isAdminOrHod && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/logbook/${item.procedure?.id || i}`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors"
                                title="Edit competency">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Delete this competency record?")) deleteProcMutation?.mutate(item.procedure?.id); }}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete competency">
                                <Trash2 size={13} />
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
      </div>
      )}
    </div>
  );
}
