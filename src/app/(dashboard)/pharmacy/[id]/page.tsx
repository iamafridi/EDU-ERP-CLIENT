"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Pill, ArrowLeft, Trash2, CheckCircle2, Pencil, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editFields, setEditFields] = useState({ patientId: "", doctorId: "", date: "", notes: "" });

  const isPharmacist = user?.staffSubRole === "pharmacist" || roleIs("domain-admin", "super-admin");

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: api.getDrugs,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: api.getPrescriptions,
  });

  const { data: dispensings = [] } = useQuery({
    queryKey: ["dispensings"],
    queryFn: api.getDispensings,
  });

  const drugMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    (drugs as any[]).forEach((d: any) => { map[d.id] = d; });
    return map;
  }, [drugs]);

  const prescription = prescriptions.find((p: any) => p.id === params.id);
  const relatedDispensing = dispensings.find((d: any) => {
    const prxId = d.prescriptionId?.id || d.prescriptionId;
    return prxId === params.id;
  });

  const deletePrxMutation = useMutation({
    mutationFn: api.deletePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      router.push("/pharmacy");
    },
  });

  const updatePrxMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updatePrescription(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setSuccessMsg("Prescription updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const markDispensedMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateDispensing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensings"] });
      setSuccessMsg("Marked as dispensed.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleDelete = () => {
    if (confirm("Delete this prescription?")) {
      deletePrxMutation.mutate(params.id as string);
    }
  };

  const startEdit = () => {
    if (prescription) {
      setEditFields({
        patientId: prescription.patientId || "",
        doctorId: prescription.doctorId || "",
        date: prescription.date || "",
        notes: prescription.notes || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updatePrxMutation.mutate({ id: params.id as string, payload: editFields });
  };

  if (!prescription) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Prescription not found.</p>
        <Link href="/pharmacy" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Pharmacy</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/pharmacy" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="text-[#2563EB]" />
            Prescription Details
          </h1>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={startEdit}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)}
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
              Cancel
            </button>
          )}
          <button onClick={handleDelete}
            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescription Information</span>
        </div>
        {isEditing ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Patient ID</label>
                <input type="text" value={editFields.patientId} onChange={(e) => setEditFields((p) => ({ ...p, patientId: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Doctor ID</label>
                <input type="text" value={editFields.doctorId} onChange={(e) => setEditFields((p) => ({ ...p, doctorId: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <input type="date" value={editFields.date} onChange={(e) => setEditFields((p) => ({ ...p, date: e.target.value }))}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Notes</label>
              <textarea value={editFields.notes} onChange={(e) => setEditFields((p) => ({ ...p, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button onClick={handleSaveEdit} disabled={updatePrxMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Prescription
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Patient</label>
                <p className="text-sm font-semibold text-slate-800">{prescription.patientName || prescription.patientId}</p>
                <span className="text-[10px] text-slate-400 font-mono">{prescription.patientId}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Doctor</label>
                <p className="text-sm font-semibold text-slate-800">{prescription.doctorName || prescription.doctorId}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Date</label>
                <p className="text-sm font-mono text-slate-600">{prescription.date}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Prescription ID</label>
                <p className="text-sm font-mono text-slate-600">{prescription.id}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
              <p className="text-sm text-slate-600">{prescription.notes || "\u2014"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescribed Drugs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Drug</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Dosage</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Duration</th>
                <th className="p-3 text-xs font-bold text-slate-400 uppercase">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e2ed]">
              {(prescription.drugs || []).map((drug: any, i: number) => {
                const drugInfo = drugMap[drug.drugId];
                const displayName = drug.drugName || drugInfo?.name || drug.drugId;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3">
                      <span className="font-semibold text-slate-700">{displayName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{drug.drugId}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{drug.dosage}</td>
                    <td className="p-3 text-slate-500">{drug.duration}</td>
                    <td className="p-3 text-slate-500">{drug.instructions || "\u2014"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart size={16} /> Dispensing Status
          </span>
          {relatedDispensing && !relatedDispensing.dispensedDate && isPharmacist && (
            <button onClick={() => markDispensedMutation.mutate({ id: relatedDispensing.id, payload: { dispensedDate: new Date().toISOString().split("T")[0] } })}
              className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-xs transition-colors cursor-pointer border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={12} /> Mark Dispensed
            </button>
          )}
        </div>
        {relatedDispensing ? (
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Pharmacist</label>
                <p className="text-sm font-semibold text-slate-800">{relatedDispensing.pharmacistName || relatedDispensing.pharmacistId}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Status</label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  relatedDispensing.dispensedDate ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>{relatedDispensing.dispensedDate ? "Dispensed" : "Pending"}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Dispensed Date</label>
                <p className="text-sm font-mono text-slate-600">{relatedDispensing.dispensedDate || "\u2014"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
                <p className="text-sm text-slate-600">{relatedDispensing.notes || "\u2014"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No dispensing record for this prescription yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
