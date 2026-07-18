"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Pencil, Trash2, CheckCircle2, X } from "lucide-react";

interface Semester {
  id: string;
  name: string;
  code: string;
  startMonth: string;
  endMonth: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SemestersPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSem, setSelectedSem] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", startMonth: "", endMonth: "" });

  const canModify = roleIs("super-admin", "domain-admin");

  const { data: semesters = [], isLoading } = useQuery<Semester[]>({
    queryKey: ["semesters"],
    queryFn: api.getSemesters,
  });

  const createMutation = useMutation({
    mutationFn: api.createSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      setSuccessMsg("Semester created successfully.");
      setIsCreateOpen(false);
      setFormData({ name: "", code: "", startMonth: "", endMonth: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
      api.updateSemester(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      setSuccessMsg("Semester updated successfully.");
      setIsEditOpen(false);
      setSelectedSem(null);
      setFormData({ name: "", code: "", startMonth: "", endMonth: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      setSuccessMsg("Semester deleted successfully.");
      setIsDeleteOpen(false);
      setSelectedSem(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSem) {
      updateMutation.mutate({ id: selectedSem.id, data: formData });
    }
  };

  const openEdit = (sem: Semester) => {
    setSelectedSem(sem);
    setFormData({
      name: sem.name,
      code: sem.code,
      startMonth: sem.startMonth,
      endMonth: sem.endMonth,
    });
    setIsEditOpen(true);
  };

  const openDelete = (sem: Semester) => {
    setSelectedSem(sem);
    setIsDeleteOpen(true);
  };

  const columns: Column<Semester>[] = [
    {
      header: "Semester Name",
      accessor: (row) => (
        <span className="font-semibold text-slate-800">{row.name}</span>
      ),
    },
    {
      header: "Code",
      accessor: (row) => (
        <span className="font-mono text-slate-500">{row.code}</span>
      ),
    },
    {
      header: "Start Month",
      accessor: "startMonth",
    },
    {
      header: "End Month",
      accessor: "endMonth",
    },
    ...(canModify
      ? [
          {
            header: "Actions",
            accessor: (row: Semester) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(row)}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => openDelete(row)}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          } as Column<Semester>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Academic Semesters
            <Calendar size={22} className="text-[#2563EB]" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage academic semesters and their time periods.
          </p>
        </div>
        {canModify && (
          <button
            onClick={() => { setFormData({ name: "", code: "", startMonth: "", endMonth: "" }); setIsCreateOpen(true); }}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Add Semester
          </button>
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

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable<Semester>
          data={semesters}
          columns={columns}
          searchPlaceholder="Search semesters by name..."
          searchField="name"
        />
      )}

      <AnimatePresence>
        {isCreateOpen && (
          <ModalShell title="Create Semester" onClose={() => setIsCreateOpen(false)}>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Semester Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Fall 2026"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. 01"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Start Month</label>
                  <select
                    value={formData.startMonth}
                    onChange={(e) => setFormData((p) => ({ ...p, startMonth: e.target.value }))}
                    required
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">Select month...</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">End Month</label>
                  <select
                    value={formData.endMonth}
                    onChange={(e) => setFormData((p) => ({ ...p, endMonth: e.target.value }))}
                    required
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">Select month...</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Plus size={14} /> Create</button>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditOpen && selectedSem && (
          <ModalShell title="Edit Semester" onClose={() => setIsEditOpen(false)}>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Semester Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Start Month</label>
                  <select
                    value={formData.startMonth}
                    onChange={(e) => setFormData((p) => ({ ...p, startMonth: e.target.value }))}
                    required
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">Select month...</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">End Month</label>
                  <select
                    value={formData.endMonth}
                    onChange={(e) => setFormData((p) => ({ ...p, endMonth: e.target.value }))}
                    required
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">Select month...</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsEditOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Pencil size={14} /> Update</button>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && selectedSem && (
          <ModalShell title="Delete Semester" onClose={() => setIsDeleteOpen(false)}>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <strong>{selectedSem.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsDeleteOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate(selectedSem.id)}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
