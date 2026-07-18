"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Plus, Pencil, Trash2, CheckCircle2, X, ThumbsUp, ThumbsDown } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  awarded: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  disbursed: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ScholarshipsPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ studentName: "", scholarshipName: "", amount: "", awardDate: "" });

  const isEditor = can("update", "scholarships");

  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ["scholarships"],
    queryFn: api.getScholarships,
  });

  const createMutation = useMutation({
    mutationFn: api.createScholarship,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["scholarships"] }); closeModal(); setSuccessMsg("Scholarship created."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateScholarship(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["scholarships"] }); closeModal(); setSuccessMsg("Scholarship updated."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteScholarship,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["scholarships"] }); setSuccessMsg("Scholarship deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const approveMutation = useMutation({
    mutationFn: api.approveScholarship,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["scholarships"] }); setSuccessMsg("Scholarship approved."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const rejectMutation = useMutation({
    mutationFn: api.rejectScholarship,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["scholarships"] }); setSuccessMsg("Scholarship rejected."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const closeModal = () => { setShowModal(false); setEditItem(null); setForm({ studentName: "", scholarshipName: "", amount: "", awardDate: "" }); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ studentName: item.studentName, scholarshipName: item.scholarshipName, amount: String(item.amount), awardDate: item.awardDate || "" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editItem) updateMutation.mutate({ id: editItem.id, data: payload });
    else createMutation.mutate(payload);
  };

  const columns: Column<any>[] = [
    { header: "Student", accessor: "studentName", className: "font-semibold text-slate-700" },
    { header: "Scholarship", accessor: "scholarshipName" },
    { header: "Amount", accessor: (row) => <span className="font-mono font-semibold">${row.amount?.toLocaleString()}</span> },
    {
      header: "Status", accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${STATUS_STYLES[row.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
          {row.status}
        </span>
      ),
    },
    { header: "Award Date", accessor: (row) => <span className="text-slate-400 text-xs">{row.awardDate || "—"}</span> },
    {
      header: "Actions", accessor: (row) => isEditor ? (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={13} /></button>
          <button onClick={() => { if (confirm("Delete this scholarship?")) deleteMutation.mutate(row.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
          {row.status === "pending" && (
            <>
              <button onClick={() => approveMutation.mutate(row.id)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Approve"><ThumbsUp size={13} /></button>
              <button onClick={() => rejectMutation.mutate(row.id)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Reject"><ThumbsDown size={13} /></button>
            </>
          )}
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Award className="text-[#2563EB]" /> Scholarships</h1>
          <p className="text-xs text-slate-400 mt-1">Manage merit, need-based, and other scholarship awards.</p>
        </div>
        {isEditor && <button onClick={() => setShowModal(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"><Plus size={16} /> Add Scholarship</button>}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </motion.div>
      )}

      {isLoading ? <TableSkeleton rows={4} cols={5} /> : (
        <DataTable data={scholarships} columns={columns} searchPlaceholder="Search by student or scholarship name..." searchField="studentName" />
      )}

      <AnimatePresence>{showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Scholarship" : "Add Scholarship"}</span>
              <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Student Name</label>
                <input type="text" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Scholarship Name</label>
                <input type="text" value={form.scholarshipName} onChange={(e) => setForm((p) => ({ ...p, scholarshipName: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Amount ($)</label>
                  <input type="number" min={0} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Award Date</label>
                  <input type="date" value={form.awardDate} onChange={(e) => setForm((p) => ({ ...p, awardDate: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
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
