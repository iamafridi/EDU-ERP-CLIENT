"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, Plus, Pencil, Trash2, CheckCircle2, X } from "lucide-react";

export default function SkillLabPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ studentName: "", topic: "", verifiedBy: "" });

  const isEditor = can("update", "skillLab");

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skillLabs"],
    queryFn: api.getSkillLabs,
  });

  const createMutation = useMutation({
    mutationFn: api.createSkillLab,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skillLabs"] }); closeModal(); setSuccessMsg("Skill record created."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateSkillLab(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skillLabs"] }); closeModal(); setSuccessMsg("Skill record updated."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSkillLab,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skillLabs"] }); setSuccessMsg("Skill record deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const closeModal = () => { setShowModal(false); setEditItem(null); setForm({ studentName: "", topic: "", verifiedBy: "" }); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ studentName: item.studentName, topic: item.topic, verifiedBy: item.verifiedBy || "" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
    else createMutation.mutate(form);
  };

  const toggleComplete = (item: any) => {
    updateMutation.mutate({ id: item.id, data: { completed: !item.completed } });
  };

  const columns: Column<any>[] = [
    { header: "Student", accessor: "studentName", className: "font-semibold text-slate-700" },
    { header: "Skill / Topic", accessor: "topic" },
    {
      header: "Status", accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${row.completed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
          {row.completed ? "Achieved" : "Practicing"}
        </span>
      ),
    },
    { header: "Verified By", accessor: (row) => <span className="text-xs text-slate-400">{row.verifiedBy || "—"}</span> },
    {
      header: "Actions", accessor: (row) => isEditor ? (
        <div className="flex items-center gap-1">
          <button onClick={() => toggleComplete(row)} className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${row.completed ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"}`} title={row.completed ? "Mark as practicing" : "Mark as achieved"}>
            <CheckCircle2 size={13} />
          </button>
          <button onClick={() => openEdit(row)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={13} /></button>
          <button onClick={() => { if (confirm("Delete this skill record?")) deleteMutation.mutate(row.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Beaker className="text-[#2563EB]" /> Skill Lab</h1>
          <p className="text-xs text-slate-400 mt-1">Track clinical and practical skill competencies.</p>
        </div>
        {isEditor && <button onClick={() => setShowModal(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"><Plus size={16} /> Add Skill Record</button>}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </motion.div>
      )}

      {isLoading ? <TableSkeleton rows={4} cols={4} /> : (
        <DataTable data={skills} columns={columns} searchPlaceholder="Search by student or skill..." searchField="studentName" />
      )}

      <AnimatePresence>{showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Skill Record" : "Add Skill Record"}</span>
              <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Student Name</label>
                <input type="text" value={form.studentName} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Skill / Topic</label>
                <input type="text" value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} required placeholder="e.g. Suture Techniques" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Verified By</label>
                <input type="text" value={form.verifiedBy} onChange={(e) => setForm((p) => ({ ...p, verifiedBy: e.target.value }))} placeholder="e.g. Dr. James Sterling" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
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
