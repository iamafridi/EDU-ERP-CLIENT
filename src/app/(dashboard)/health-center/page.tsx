"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Stethoscope, Plus, CheckCircle2, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export default function HealthCenterPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse";

  const { data: visits = [] } = useQuery({
    queryKey: ["health-visits"],
    queryFn: async () => {
      const raw = await api.getHealthVisits();
      return raw.map((v: any) => ({
        ...v,
        studentId: v.studentId ?? "",
        doctorName: v.doctorName ?? "",
        symptoms: v.symptoms ?? v.reason ?? "",
        diagnosis: v.diagnosis ?? "",
        prescribedMeds: v.prescribedMeds ?? v.prescription ?? "",
      }));
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: api.deleteHealthVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-visits"] });
      setSuccessMsg("Health visit record deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const filteredVisits = searchTerm
    ? visits.filter((v: any) =>
        v.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : visits;

  const visibleVisits = filteredVisits.filter((v: any) => {
    if (user?.role === "student") {
      return v.studentId === user.id || v.studentName === user.name;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-[#2563EB]" />
            Health Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student health visits, diagnoses, prescriptions, and medical records.
          </p>
        </div>

        {isStaff && (
          <Link
            href="/health-center/new"
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            New Visit Record
          </Link>
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            Health Visit Records
          </span>
          <input
            type="text"
            placeholder="Search student, diagnosis, symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all w-48 font-mono"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Doctor</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Symptoms</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Diagnosis</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Prescription</th>
                {isStaff && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e2ed]">
              {visibleVisits.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 7 : 6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Stethoscope size={32} className="text-slate-200" />
                      <p className="text-xs font-semibold text-slate-400">
                        {searchTerm ? "No visits match your search." : "No health visit records found."}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        {searchTerm ? "Try a different search term." : "Create a new visit record to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleVisits.map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3">
                      <Link href={`/health-center/${visit.id}`} className="font-bold text-slate-700 hover:text-[#2563EB] transition-colors block">
                        {visit.studentName}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono block">{visit.studentId}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{visit.doctorName}</td>
                    <td className="p-3 text-slate-500 max-w-[180px] truncate" title={visit.symptoms}>
                      {visit.symptoms}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                        {visit.diagnosis}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{visit.visitDate}</td>
                    <td className="p-3 text-slate-500 max-w-[160px] truncate" title={visit.prescribedMeds}>
                      {visit.prescribedMeds || "\u2014"}
                    </td>
                    {isStaff && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/health-center/${visit.id}`}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                            title="Edit visit"
                          >
                            <Pencil size={13} />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm("Delete this health visit record?"))
                                deleteVisitMutation.mutate(visit.id);
                            }}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete visit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
