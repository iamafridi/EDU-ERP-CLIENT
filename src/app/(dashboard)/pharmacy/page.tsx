"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Pill, Plus, CheckCircle2, ClipboardList, Trash2, ShoppingCart, AlertTriangle, Pencil } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function PharmacyPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"prescriptions" | "dispensing">("prescriptions");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isPharmacist = user?.staffSubRole === "pharmacist" || roleIs("domain-admin", "super-admin");
  const isDoctor = user?.staffSubRole === "doctor";

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: api.getDrugs,
  });

  const { data: lowStockDrugs = [] } = useQuery({
    queryKey: ["lowStockDrugs"],
    queryFn: api.getLowStockDrugs,
  });

  const { data: prescriptions = [], isLoading: loadingPrx } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: api.getPrescriptions,
  });

  const { data: dispensings = [], isLoading: loadingDisp } = useQuery({
    queryKey: ["dispensings"],
    queryFn: api.getDispensings,
  });

  const drugMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    (drugs as any[]).forEach((d: any) => { map[d.id] = d; });
    return map;
  }, [drugs]);

  const filteredPrx = searchTerm
    ? prescriptions.filter((p: any) =>
        (p.patientName || p.patientId)?.toLowerCase().includes(searchTerm.toLowerCase()))
    : prescriptions;

  const deletePrxMutation = useMutation({
    mutationFn: api.deletePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setSuccessMsg("Prescription deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteDispensingMutation = useMutation({
    mutationFn: api.deleteDispensing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensings"] });
      setSuccessMsg("Dispensing record deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const markDispensedMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateDispensing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensings"] });
      setSuccessMsg("Dispensing marked as dispensed.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="text-[#2563EB]" />
            Pharmacy & Dispensary
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage prescriptions and track dispensing.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "prescriptions" && isDoctor && (
            <Link href="/pharmacy/new"
              className="h-9 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/10">
              <Plus size={14} /> New Prescription
            </Link>
          )}
        </div>
      </div>

      {lowStockDrugs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          <span>{lowStockDrugs.length} drug(s) below reorder level. <strong>{lowStockDrugs.map((d: any) => d.name).join(", ")}</strong></span>
        </motion.div>
      )}

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /><span>{successMsg}</span>
        </motion.div>
      )}

      <div className="flex border-b border-[#e1e2ed] gap-2">
        <button onClick={() => setActiveTab("prescriptions")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "prescriptions" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <ClipboardList size={14} className="inline mr-1" /> Prescriptions
        </button>
        <button onClick={() => setActiveTab("dispensing")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "dispensing" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <ShoppingCart size={14} className="inline mr-1" /> Dispensing
        </button>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        {activeTab === "prescriptions" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={16} /> Prescriptions
              </span>
              <input type="text" placeholder="Search patient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all w-48 font-mono" />
            </div>
            {loadingPrx ? <TableSkeleton rows={5} cols={4} /> : filteredPrx.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No prescriptions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Doctor</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Drugs</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {filteredPrx.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/pharmacy/${p.id}`} className="font-bold text-slate-700 hover:text-[#2563EB] transition-colors block">
                            {p.patientName || p.patientId}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono block">{p.patientId}</span>
                        </td>
                        <td className="p-3 text-slate-600">{p.doctorName || p.doctorId}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(p.drugs || []).map((drug: any, i: number) => {
                              const drugInfo = drugMap[drug.drugId];
                              const displayName = drug.drugName || drugInfo?.name || drug.drugId;
                              return (
                                <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-semibold">
                                  {displayName} - {drug.dosage}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{p.date}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/pharmacy/${p.id}`}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                              <Pencil size={13} />
                            </Link>
                            <button onClick={() => { if (confirm("Delete this prescription?")) deletePrxMutation.mutate(p.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "dispensing" && (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart size={16} /> Dispensing Records
              </span>
            </div>
            {loadingDisp ? <TableSkeleton rows={5} cols={5} /> : dispensings.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No dispensing records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Prescription</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Pharmacist</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Dispensed Date</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Notes</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {dispensings.map((d: any) => {
                      const isDispensed = !!d.dispensedDate;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/50 text-xs">
                          <td className="p-3 font-semibold text-slate-700">{d.patientName || (d.prescriptionId?.patientName) || "\u2014"}</td>
                          <td className="p-3">
                            <Link href={`/pharmacy/${d.prescriptionId?.id || d.prescriptionId}`} className="font-mono text-[#2563EB] hover:underline block">
                              {d.prescriptionId?.id || d.prescriptionId || "\u2014"}
                            </Link>
                          </td>
                          <td className="p-3 text-slate-600">{d.pharmacistName || d.pharmacistId}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isDispensed ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                              {isDispensed ? "Dispensed" : "Pending"}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{d.dispensedDate || "\u2014"}</td>
                          <td className="p-3 text-slate-400 max-w-xs truncate">{d.notes || "\u2014"}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {!isDispensed && isPharmacist && (
                                <button onClick={() => markDispensedMutation.mutate({ id: d.id, payload: { dispensedDate: new Date().toISOString().split("T")[0] } })}
                                  className="h-7 px-2 flex items-center justify-center rounded hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition-colors gap-1" title="Mark as Dispensed">
                                  <CheckCircle2 size={13} /> <span className="text-[10px] font-semibold">Dispense</span>
                                </button>
                              )}
                              <Link href={`/pharmacy/${d.id}`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                                title="Edit dispensing record">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Delete this dispensing record?")) deleteDispensingMutation.mutate(d.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
