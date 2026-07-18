"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, Plus, Pencil, Trash2, CheckCircle2, X } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  "under-review": "bg-purple-50 text-purple-700 border-purple-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function ResearchPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ title: "", leadResearcher: "", department: "", startDate: "", endDate: "", fundingAmount: "", status: "active" });

  const isEditor = can("update", "research");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["researchProjects"],
    queryFn: api.getResearchProjects,
  });

  const createMutation = useMutation({
    mutationFn: api.createResearchProject,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["researchProjects"] }); closeModal(); setSuccessMsg("Research project created."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateResearchProject(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["researchProjects"] }); closeModal(); setSuccessMsg("Research project updated."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteResearchProject,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["researchProjects"] }); setSuccessMsg("Research project deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const closeModal = () => { setShowModal(false); setEditItem(null); setForm({ title: "", leadResearcher: "", department: "", startDate: "", endDate: "", fundingAmount: "", status: "active" }); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ title: item.title, leadResearcher: item.leadResearcher, department: item.department || "", startDate: item.startDate || "", endDate: item.endDate || "", fundingAmount: String(item.fundingAmount || ""), status: item.status || "active" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, fundingAmount: Number(form.fundingAmount) || 0 };
    if (editItem) updateMutation.mutate({ id: editItem.id, data: payload });
    else createMutation.mutate(payload);
  };

  const columns: Column<any>[] = [
    { header: "Title", accessor: "title", className: "font-semibold text-slate-700 max-w-[200px] truncate" },
    { header: "Lead Researcher", accessor: "leadResearcher" },
    { header: "Department", accessor: (row) => <span className="text-xs text-slate-500">{row.department || "—"}</span> },
    { header: "Funding", accessor: (row) => <span className="font-mono font-semibold">${(row.fundingAmount || 0).toLocaleString()}</span> },
    {
      header: "Status", accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${STATUS_STYLES[row.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{row.status}</span>
      ),
    },
    { header: "Period", accessor: (row) => <span className="text-xs text-slate-400">{row.startDate || "—"} — {row.endDate || "—"}</span> },
    {
      header: "Actions", accessor: (row) => isEditor ? (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={13} /></button>
          <button onClick={() => { if (confirm("Delete this research project?")) deleteMutation.mutate(row.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Beaker className="text-[#2563EB]" /> Research Projects</h1>
          <p className="text-xs text-slate-400 mt-1">Manage research projects, publications, and grants.</p>
        </div>
        {isEditor && <button onClick={() => setShowModal(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"><Plus size={16} /> Add Project</button>}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </motion.div>
      )}

      {isLoading ? <TableSkeleton rows={4} cols={6} /> : (
        <DataTable data={projects} columns={columns} searchPlaceholder="Search by title or researcher..." searchField="title" />
      )}

      <AnimatePresence>{showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Research Project" : "Add Research Project"}</span>
              <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Project Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Lead Researcher</label>
                  <input type="text" value={form.leadResearcher} onChange={(e) => setForm((p) => ({ ...p, leadResearcher: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Funding Amount ($)</label>
                  <input type="number" min={0} value={form.fundingAmount} onChange={(e) => setForm((p) => ({ ...p, fundingAmount: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
                    {Object.keys(STATUS_STYLES).map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
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
