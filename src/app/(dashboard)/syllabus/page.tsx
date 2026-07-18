"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Pencil, Trash2, CheckCircle2, X, FileText, Clock } from "lucide-react";

interface Syllabus {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  credits: number;
  objectives: string;
  topics: string;
  textbooks: string;
  evaluation: string;
  status: "draft" | "approved" | "published";
}

const MOCK_SYLLABUS: Syllabus[] = [
  { id: "SYL-001", courseCode: "MBBS-101", courseName: "Anatomy - I", department: "Anatomy", semester: 1, credits: 4, objectives: "Understand gross anatomy of human body", topics: "General anatomy, Upper limb, Lower limb, Thorax", textbooks: "Gray's Anatomy, BDC Vol 1", evaluation: "Internal 40 + External 60", status: "published" },
  { id: "SYL-002", courseCode: "MBBS-102", courseName: "Physiology - I", department: "Physiology", semester: 1, credits: 4, objectives: "Understand basic physiological processes", topics: "General physiology, Blood, Nerve-Muscle, CNS", textbooks: "Guyton, Sembulingam", evaluation: "Internal 40 + External 60", status: "published" },
  { id: "SYL-003", courseCode: "MBBS-103", courseName: "Biochemistry - I", department: "Biochemistry", semester: 1, credits: 4, objectives: "Understand molecular basis of life", topics: "Cell biology, Enzymes, Carbohydrates, Lipids", textbooks: "Harper, Satyanarayana", evaluation: "Internal 40 + External 60", status: "approved" },
  { id: "SYL-004", courseCode: "MBBS-201", courseName: "Anatomy - II", department: "Anatomy", semester: 2, credits: 4, objectives: "Understand abdomen, pelvis, and head-neck anatomy", topics: "Abdomen, Pelvis, Head & Neck, Brain", textbooks: "Gray's Anatomy, BDC Vol 2", evaluation: "Internal 40 + External 60", status: "draft" },
];

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function SyllabusPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Syllabus | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    department: "",
    semester: "1",
    credits: "4",
    objectives: "",
    topics: "",
    textbooks: "",
    evaluation: "",
    status: "draft",
  });

  const isEditor = can("update", "syllabus");

  const { data: syllabusList = MOCK_SYLLABUS, isLoading } = useQuery({
    queryKey: ["syllabus"],
    queryFn: async () => {
      // Mock data since backend doesn't exist yet
      return MOCK_SYLLABUS;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      // Mock create
      return { success: true, data: { id: `SYL-${Date.now()}`, ...payload } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      closeModal();
      setSuccessMsg("Syllabus created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Mock update
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      closeModal();
      setSuccessMsg("Syllabus updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock delete
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      setSuccessMsg("Syllabus deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ courseCode: "", courseName: "", department: "", semester: "1", credits: "4", objectives: "", topics: "", textbooks: "", evaluation: "", status: "draft" });
  };

  const openEdit = (item: Syllabus) => {
    setEditItem(item);
    setForm({
      courseCode: item.courseCode,
      courseName: item.courseName,
      department: item.department,
      semester: String(item.semester),
      credits: String(item.credits),
      objectives: item.objectives,
      topics: item.topics,
      textbooks: item.textbooks,
      evaluation: item.evaluation,
      status: item.status,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({ courseCode: "", courseName: "", department: "", semester: "1", credits: "4", objectives: "", topics: "", textbooks: "", evaluation: "", status: "draft" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, semester: Number(form.semester), credits: Number(form.credits) };
    if (editItem) updateMutation.mutate({ id: editItem.id, data: payload });
    else createMutation.mutate(payload);
  };

  const publishedCount = syllabusList.filter((s: Syllabus) => s.status === "published").length;
  const draftCount = syllabusList.filter((s: Syllabus) => s.status === "draft").length;

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-[#2563EB]" />
            Course Syllabus
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage course syllabi, topics, and evaluation criteria.
          </p>
        </div>
        {isEditor && (
          <button
            onClick={openCreate}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Add Syllabus
          </button>
        )}
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600" /> {successMsg}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{syllabusList.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{publishedCount}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{draftCount}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus List */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Course Syllabi
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : syllabusList.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No syllabi found.</p>
            <p className="text-[10px] text-slate-300 mt-1">Add a syllabus to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Course</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Department</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Sem</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Credits</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  {isEditor && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {syllabusList.map((item: Syllabus) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-slate-700">{item.courseName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.courseCode}</p>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{item.department}</td>
                    <td className="p-3 text-slate-600">{item.semester}</td>
                    <td className="p-3 text-slate-600">{item.credits}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    {isEditor && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                            title="Edit syllabus"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => { if (confirm("Delete this syllabus?")) deleteMutation.mutate(item.id); }}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete syllabus"
                          >
                            <Trash2 size={13} />
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Syllabus" : "New Syllabus"}</span>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Course Code</label>
                    <input
                      type="text"
                      value={form.courseCode}
                      onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                      placeholder="MBBS-101"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Course Name</label>
                    <input
                      type="text"
                      value={form.courseName}
                      onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                      placeholder="Anatomy - I"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Department</label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="Anatomy"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Semester</label>
                    <select
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Credits</label>
                    <input
                      type="number"
                      value={form.credits}
                      onChange={(e) => setForm({ ...form, credits: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Course Objectives</label>
                  <textarea
                    value={form.objectives}
                    onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                    placeholder="Understand gross anatomy of human body"
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Topics Covered</label>
                  <textarea
                    value={form.topics}
                    onChange={(e) => setForm({ ...form, topics: e.target.value })}
                    placeholder="General anatomy, Upper limb, Lower limb"
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Textbooks</label>
                  <input
                    type="text"
                    value={form.textbooks}
                    onChange={(e) => setForm({ ...form, textbooks: e.target.value })}
                    placeholder="Gray's Anatomy, BDC Vol 1"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Evaluation Pattern</label>
                  <input
                    type="text"
                    value={form.evaluation}
                    onChange={(e) => setForm({ ...form, evaluation: e.target.value })}
                    placeholder="Internal 40 + External 60"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {editItem ? "Update Syllabus" : "Create Syllabus"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
