"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Bed, DoorOpen, LogOut, Trash2, Pencil } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

const WARD_BADGES: Record<string, string> = {
  general: "bg-slate-100 text-slate-600 border-slate-200",
  "semi-private": "bg-blue-50 text-blue-700 border-blue-100",
  private: "bg-amber-50 text-amber-700 border-amber-100",
  icu: "bg-red-50 text-red-700 border-red-100",
  nicu: "bg-pink-50 text-pink-700 border-pink-100",
  picu: "bg-purple-50 text-purple-700 border-purple-100",
  emergency: "bg-orange-50 text-orange-700 border-orange-100",
  isolation: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function IPDPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"admissions" | "discharges">("admissions");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isDoctorOrNurse = user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse" || roleIs("domain-admin", "super-admin");

  const { data: admissions = [], isLoading: loadingAdmissions } = useQuery({
    queryKey: ["ipdAdmissions"],
    queryFn: api.getIPDAdmissions,
  });

  const { data: discharges = [], isLoading: loadingDischarges } = useQuery({
    queryKey: ["ipdDischarges"],
    queryFn: api.getIPDDischarges,
  });

  const filteredAdmissions = searchTerm
    ? admissions.filter((a: any) =>
        (a.patientName || a.patientId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
    : admissions;

  const visibleAdmissions = user?.role === "student"
    ? filteredAdmissions.filter((a: any) => a.patientId === user.id || a.patientName === user.name)
    : filteredAdmissions;

  const visibleDischarges = user?.role === "student"
    ? discharges.filter((d: any) => d.patientId === user.id || d.patientName === user.name)
    : discharges;

  const deleteAdmissionMutation = useMutation({
    mutationFn: api.deleteIPDAdmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipdAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["ipdDischarges"] });
      setSuccessMsg("Admission deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bed className="text-[#2563EB]" />
            IPD Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage inpatient admissions, ward allocation, and discharges.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "admissions" && isDoctorOrNurse && (
            <Link href="/ipd/new" className="h-9 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/10">
              <Plus size={14} /> Admit Patient
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

      <div className="flex border-b border-[#e1e2ed] gap-2">
        <button onClick={() => setActiveTab("admissions")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "admissions" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <DoorOpen size={14} className="inline mr-1" /> Admissions
        </button>
        <button onClick={() => setActiveTab("discharges")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "discharges" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <LogOut size={14} className="inline mr-1" /> Discharges
        </button>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        {activeTab === "admissions" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <DoorOpen size={16} /> IPD Admissions
              </span>
              <input type="text" placeholder="Search patient, diagnosis, bed..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all w-48 font-mono" />
            </div>
            {loadingAdmissions ? <TableSkeleton rows={5} cols={7} /> : visibleAdmissions.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No admissions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Doctor</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Ward</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Bed</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Admitted</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Diagnosis</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      {isDoctorOrNurse && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {visibleAdmissions.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/ipd/${a.id}`} className="font-semibold text-slate-700 hover:text-[#2563EB] transition-colors">
                            {a.patientName || a.patientId}
                          </Link>
                        </td>
                        <td className="p-3 text-slate-600">{a.doctorName || a.doctorId}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${WARD_BADGES[a.ward] || WARD_BADGES.general}`}>{a.ward}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-600">{a.bedNumber}</td>
                        <td className="p-3 font-mono text-slate-500">{a.admissionDate}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{a.diagnosis}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            a.status === "admitted" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            a.status === "discharged" ? "bg-slate-100 text-slate-500 border-slate-200" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>{a.status}</span>
                        </td>
                        {isDoctorOrNurse && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/ipd/${a.id}`}
                                className="h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] transition-colors border border-blue-200 flex items-center gap-1">
                                <Pencil size={11} /> Edit
                              </Link>
                              <button onClick={() => { if (window.confirm("Delete this admission?")) deleteAdmissionMutation.mutate(a.id); }}
                                className="h-7 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-red-200 flex items-center gap-1">
                                <Trash2 size={11} /> Delete
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

        {activeTab === "discharges" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <LogOut size={16} /> Discharge Records
              </span>
            </div>
            {loadingDischarges ? <TableSkeleton rows={5} cols={6} /> : visibleDischarges.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No discharge records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Discharge Date</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Summary</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Follow Up</th>
                      {isDoctorOrNurse && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {visibleDischarges.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/ipd/${d.admissionId?._id || d.admissionId || d.id}`} className="font-semibold text-slate-700 hover:text-[#2563EB] transition-colors">
                            {d.patientName || d.patientId || (d.admissionId?.patientName) || "\u2014"}
                          </Link>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{d.dischargeDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold capitalize">{d.dischargeType?.replace(/-/g, " ")}</span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{d.dischargeSummary}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{d.followUpInstructions || "\u2014"}</td>
                        {isDoctorOrNurse && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/ipd/${d.admissionId?._id || d.admissionId || d.id}`}
                                className="h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] transition-colors border border-blue-200 flex items-center gap-1">
                                <Pencil size={11} /> Edit
                              </Link>
                              <button onClick={() => { if (confirm("Delete this discharge record?")) deleteAdmissionMutation?.mutate(d.id); }}
                                className="h-7 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-[10px] transition-colors border border-red-200 flex items-center gap-1">
                                <Trash2 size={11} /> Delete
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
    </div>
  );
}
