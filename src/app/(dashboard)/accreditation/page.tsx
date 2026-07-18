"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Pencil, Trash2, CheckCircle2, X } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  accredited: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "under-review": "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-red-50 text-red-700 border-red-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const BODIES = ["NAAC", "NMC", "AICTE", "UGC", "NBA", "other"];

export default function AccreditationPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ accreditingBody: "", status: "under-review", validFrom: "", validUntil: "", score: "" });

  const isEditor = can("update", "accreditation");

  const { data: accreditations = [], isLoading } = useQuery({
    queryKey: ["accreditations"],
    queryFn: api.getAccreditations,
  });

  const createMutation = useMutation({
    mutationFn: api.createAccreditation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accreditations"] }); closeModal(); setSuccessMsg("Accreditation created."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateAccreditation(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accreditations"] }); closeModal(); setSuccessMsg("Accreditation updated."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteAccreditation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accreditations"] }); setSuccessMsg("Accreditation deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const closeModal = () => { setShowModal(false); setEditItem(null); setForm({ accreditingBody: "", status: "under-review", validFrom: "", validUntil: "", score: "" }); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ accreditingBody: item.accreditingBody, status: item.status, validFrom: item.validFrom || "", validUntil: item.validUntil || "", score: item.score || "" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
    else createMutation.mutate(form);
  };

  const columns: Column<any>[] = [
    { header: "Accrediting Body", accessor: "accreditingBody", className: "font-semibold text-slate-700" },
    {
      header: "Status", accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${STATUS_STYLES[row.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{row.status}</span>
      ),
    },
    { header: "Score/Grade", accessor: (row) => <span className="font-mono font-bold text-slate-600">{row.score || "—"}</span> },
    { header: "Valid From", accessor: (row) => <span className="text-xs text-slate-400">{row.validFrom || "—"}</span> },
    { header: "Valid Until", accessor: (row) => <span className="text-xs text-slate-400">{row.validUntil || "—"}</span> },
    { header: "Last Review", accessor: (row) => <span className="text-xs text-slate-400">{row.lastReviewDate || "—"}</span> },
    {
      header: "Actions", accessor: (row) => isEditor ? (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={13} /></button>
          <button onClick={() => { if (confirm("Delete this accreditation record?")) deleteMutation.mutate(row.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Shield className="text-[#2563EB]" /> Accreditation</h1>
          <p className="text-xs text-slate-400 mt-1">Manage institutional accreditations, certifications, and compliance.</p>
        </div>
        {isEditor && <button onClick={() => setShowModal(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"><Plus size={16} /> Add Accreditation</button>}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </motion.div>
      )}

      {isLoading ? <TableSkeleton rows={4} cols={6} /> : (
        <DataTable data={accreditations} columns={columns} searchPlaceholder="Search by accrediting body..." searchField="accreditingBody" />
      )}

      <AnimatePresence>{showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Accreditation" : "Add Accreditation"}</span>
              <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Accrediting Body</label>
                  <select value={form.accreditingBody} onChange={(e) => setForm((p) => ({ ...p, accreditingBody: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
                    <option value="">Select body...</option>
                    {BODIES.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
                    {Object.keys(STATUS_STYLES).map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Score / Grade</label>
                <input type="text" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} placeholder="e.g. A+, 85%" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={closeModal} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm">{editItem ? "Update" : "Create"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
