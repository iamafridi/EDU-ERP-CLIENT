"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Plus, Pencil, Trash2, CheckCircle2, X, FileText, Download, Upload, ExternalLink } from "lucide-react";

interface StudyMaterial {
  id: string;
  title: string;
  course: string;
  department: string;
  type: "notes" | "presentation" | "video" | "assignment" | "reference";
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  downloads: number;
}

const MOCK_MATERIALS: StudyMaterial[] = [
  { id: "SM-001", title: "Anatomy Upper Limb Notes", course: "MBBS-101", department: "Anatomy", type: "notes", uploadedBy: "Dr. Harrison", uploadDate: "2026-06-10", fileSize: "2.4 MB", downloads: 156 },
  { id: "SM-002", title: "Physiology Blood Components PPT", course: "MBBS-102", department: "Physiology", type: "presentation", uploadedBy: "Dr. Drake", uploadDate: "2026-06-08", fileSize: "5.1 MB", downloads: 89 },
  { id: "SM-003", title: "Biochemistry Enzyme Kinetics Video", course: "MBBS-103", department: "Biochemistry", type: "video", uploadedBy: "Prof. Lee", uploadDate: "2026-06-05", fileSize: "124 MB", downloads: 234 },
  { id: "SM-004", title: "Anatomy Lower Limb Assignment", course: "MBBS-101", department: "Anatomy", type: "assignment", uploadedBy: "Dr. Harrison", uploadDate: "2026-06-12", fileSize: "0.5 MB", downloads: 67 },
  { id: "SM-005", title: "Physiology CNS Reference Guide", course: "MBBS-102", department: "Physiology", type: "reference", uploadedBy: "Dr. Drake", uploadDate: "2026-05-20", fileSize: "8.3 MB", downloads: 312 },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  notes: { label: "Notes", color: "text-blue-700", bg: "bg-blue-50" },
  presentation: { label: "Presentation", color: "text-purple-700", bg: "bg-purple-50" },
  video: { label: "Video", color: "text-red-700", bg: "bg-red-50" },
  assignment: { label: "Assignment", color: "text-amber-700", bg: "bg-amber-50" },
  reference: { label: "Reference", color: "text-emerald-700", bg: "bg-emerald-50" },
};

export default function StudyMaterialsPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<StudyMaterial | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "",
    course: "",
    department: "",
    type: "notes",
    fileSize: "",
  });

  const isEditor = can("update", "study-materials");

  const { data: materials = MOCK_MATERIALS, isLoading } = useQuery({
    queryKey: ["study-materials"],
    queryFn: async () => MOCK_MATERIALS,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return { success: true, data: { id: `SM-${Date.now()}`, ...payload, uploadedBy: "Current User", uploadDate: new Date().toISOString().split("T")[0], downloads: 0 } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      closeModal();
      setSuccessMsg("Material uploaded successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      closeModal();
      setSuccessMsg("Material updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      setSuccessMsg("Material deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ title: "", course: "", department: "", type: "notes", fileSize: "" });
  };

  const openEdit = (item: StudyMaterial) => {
    setEditItem(item);
    setForm({ title: item.title, course: item.course, department: item.department, type: item.type, fileSize: item.fileSize });
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({ title: "", course: "", department: "", type: "notes", fileSize: "" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = materials.filter((m: StudyMaterial) => {
    if (filterType && m.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!m.title.toLowerCase().includes(q) && !m.course.toLowerCase().includes(q) && !m.department.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="text-[#2563EB]" />
            Study Materials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload and share course resources with students.
          </p>
        </div>
        {isEditor && (
          <button
            onClick={openCreate}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload size={16} /> Upload Material
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

      {/* Filters */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
          >
            <option value="">All Types</option>
            <option value="notes">Notes</option>
            <option value="presentation">Presentation</option>
            <option value="video">Video</option>
            <option value="assignment">Assignment</option>
            <option value="reference">Reference</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Resources ({filtered.length})
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No materials found.</p>
            <p className="text-[10px] text-slate-300 mt-1">Upload study materials to share with students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((item: StudyMaterial) => {
              const typeCfg = TYPE_CONFIG[item.type];
              return (
                <div key={item.id} className="border border-[#e1e2ed] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeCfg.bg} ${typeCfg.color}`}>
                      {typeCfg.label}
                    </span>
                    {isEditor && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this material?")) deleteMutation.mutate(item.id); }}
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-[10px] text-slate-400 mb-3">{item.course} · {item.department}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.uploadedBy}</span>
                    <span>{item.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e1e2ed]">
                    <span className="text-[10px] text-slate-400">{item.downloads} downloads</span>
                    <button className="h-7 px-3 bg-[#2563EB]/10 text-[#2563EB] rounded text-[10px] font-semibold hover:bg-[#2563EB]/20 transition-colors cursor-pointer flex items-center gap-1">
                      <Download size={12} /> Download
                    </button>
                  </div>
                </div>
              );
            })}
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
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Material" : "Upload Material"}</span>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Anatomy Upper Limb Notes"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Course Code</label>
                    <input
                      type="text"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      placeholder="MBBS-101"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono"
                    />
                  </div>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    >
                      <option value="notes">Notes</option>
                      <option value="presentation">Presentation</option>
                      <option value="video">Video</option>
                      <option value="assignment">Assignment</option>
                      <option value="reference">Reference</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">File Size</label>
                    <input
                      type="text"
                      value={form.fileSize}
                      onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                      placeholder="2.4 MB"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                {!editItem && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">File</label>
                    <div className="border-2 border-dashed border-[#c3c6d7] rounded-lg p-6 text-center hover:border-[#2563EB]/50 transition-colors cursor-pointer">
                      <Upload size={24} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-slate-300 mt-1">PDF, PPTX, MP4, DOCX up to 500MB</p>
                    </div>
                  </div>
                )}
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
                    {editItem ? "Update Material" : "Upload Material"}
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
