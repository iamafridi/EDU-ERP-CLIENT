"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CheckCircle2, Plus, X, Edit2, Trash2 } from "lucide-react";

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  grade: string;
  score: number;
}

interface Exam {
  id: string;
  code: string;
  title: string;
}

export default function GradesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canManage = roleIs("super-admin", "domain-admin");
  const [successMsg, setSuccessMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Grade | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newGrade, setNewGrade] = useState({ studentId: "", studentName: "", examId: "", examTitle: "", grade: "A", score: 0 });
  const [editForm, setEditForm] = useState({ grade: "", score: 0 });

  const { data: grades = [], isLoading } = useQuery<Grade[]>({
    queryKey: ["grades"],
    queryFn: api.getGrades,
  });

  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: api.getExams,
  });

  const createMutation = useMutation({
    mutationFn: api.createGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setSuccessMsg("Grade recorded successfully.");
      setIsModalOpen(false);
      setNewGrade({ studentId: "", studentName: "", examId: "", examTitle: "", grade: "A", score: 0 });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateGrade(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setSuccessMsg("Grade updated.");
      setEditRecord(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setSuccessMsg("Grade deleted.");
      setDeleteId(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const gradeColor = (g: string) => {
    if (g.startsWith("A")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (g.startsWith("B")) return "bg-blue-50 text-blue-700 border-blue-100";
    if (g.startsWith("C")) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-red-50 text-red-700 border-red-100";
  };

  const columns: Column<Grade>[] = [
    { header: "Student Name", accessor: "studentName" },
    { header: "Student ID", accessor: "studentId", className: "font-mono text-slate-500" },
    { header: "Exam", accessor: "examTitle" },
    {
      header: "Grade",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${gradeColor(row.grade)}`}>
          {row.grade}
        </span>
      ),
    },
    {
      header: "Score",
      accessor: (row) => <span className="font-mono font-bold text-slate-700">{row.score}%</span>,
    },
    ...(canManage
      ? [{
          header: "Actions",
          accessor: (row: Grade) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditRecord(row); setEditForm({ grade: row.grade, score: row.score }); }}
                className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeleteId(row.id)}
                className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ),
        } as Column<Grade>]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-[#2563EB]" />
            Grade Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View, add, edit, and manage student grade records.
          </p>
        </div>
        {canManage && (
          <button onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10">
            <Plus size={16} /> Record Grade
          </button>
        )}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-[#e1e2ed] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Grade Records</span>
        </div>
        {isLoading ? <TableSkeleton rows={5} cols={6} /> : (
          <DataTable<Grade> data={grades} columns={columns} searchPlaceholder="Search by student name..." searchField="studentName" />
        )}
      </div>

      {/* Create Grade Modal */}
      <AnimatePresence>{isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Record Grade</span>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newGrade); }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Student ID</label>
                  <input type="text" value={newGrade.studentId} onChange={(e) => setNewGrade((p) => ({ ...p, studentId: e.target.value }))} placeholder="e.g. STU-001" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Student Name</label>
                  <input type="text" value={newGrade.studentName} onChange={(e) => setNewGrade((p) => ({ ...p, studentName: e.target.value }))} placeholder="Full name" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Exam</label>
                <select value={newGrade.examId} onChange={(e) => { const exam = exams.find((ex) => ex.id === e.target.value); setNewGrade((p) => ({ ...p, examId: e.target.value, examTitle: exam?.title || "" })); }} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="">Select exam</option>
                  {exams.map((ex) => (<option key={ex.id} value={ex.id}>{ex.title} ({ex.code})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Grade</label>
                  <select value={newGrade.grade} onChange={(e) => setNewGrade((p) => ({ ...p, grade: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="A">A</option><option value="A-">A-</option><option value="B+">B+</option>
                    <option value="B">B</option><option value="B-">B-</option><option value="C+">C+</option>
                    <option value="C">C</option><option value="F">F</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Score (%)</label>
                  <input type="number" value={newGrade.score} onChange={(e) => setNewGrade((p) => ({ ...p, score: Number(e.target.value) }))} min={0} max={100} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Plus size={14} /> Record Grade</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Edit Grade Modal */}
      <AnimatePresence>{editRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Edit Grade</span>
              <button onClick={() => setEditRecord(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Student:</span> {editRecord.studentName} ({editRecord.examTitle})</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Grade</label>
                  <select value={editForm.grade} onChange={(e) => setEditForm((p) => ({ ...p, grade: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="A">A</option><option value="A-">A-</option><option value="B+">B+</option>
                    <option value="B">B</option><option value="B-">B-</option><option value="C+">C+</option>
                    <option value="C">C</option><option value="F">F</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Score (%)</label>
                  <input type="number" value={editForm.score} onChange={(e) => setEditForm((p) => ({ ...p, score: Number(e.target.value) }))} min={0} max={100} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setEditRecord(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => updateMutation.mutate({ id: editRecord.id, payload: { grade: editForm.grade, score: editForm.score } })}
                  disabled={updateMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {updateMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <CheckCircle2 size={14} />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>{deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Delete Grade</span>
              <button onClick={() => setDeleteId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Are you sure you want to delete this grade record? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setDeleteId(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteId)}
                  disabled={deleteMutation.isPending}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {deleteMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
