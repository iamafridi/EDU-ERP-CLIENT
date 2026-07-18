"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Plus, Pencil, Trash2, CheckCircle2, X, FileText, Download, ShieldCheck } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function TranscriptsPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [studentId, setStudentId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isEditor = can("update", "transcripts");
  const isAdmin = can("delete", "transcripts");

  const { data: transcripts = [], isLoading } = useQuery({
    queryKey: ["transcripts"],
    queryFn: api.getTranscripts,
  });

  const createMutation = useMutation({
    mutationFn: api.createTranscriptRequest,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transcripts"] }); closeModal(); setSuccessMsg("Transcript generated."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTranscript(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transcripts"] }); closeModal(); setSuccessMsg("Transcript updated."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTranscript,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transcripts"] }); setSuccessMsg("Transcript deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.verifyTranscript(id, "Admin"),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transcripts"] }); setSuccessMsg("Transcript verified."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const closeModal = () => { setIsModalOpen(false); setEditItem(null); setStudentId(""); };

  const openEdit = (item: any) => {
    setEditItem(item);
    setStudentId(item.studentId);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ id: editItem.id, data: { studentId } });
    else createMutation.mutate({ studentId });
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Award className="text-[#2563EB]" /> Academic Transcripts</h1>
          <p className="text-xs text-slate-400 mt-1">GPA records, transcript requests, and verification.</p>
        </div>
        {isEditor && (
          <button onClick={() => setIsModalOpen(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Plus size={16} /> Generate Transcript
          </button>
        )}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </motion.div>
      )}

      {isLoading ? <TableSkeleton rows={5} cols={6} /> : transcripts.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-[#e1e2ed] rounded-xl">No transcripts registered yet.</div>
      ) : (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">CGPA</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Issue Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {transcripts.map((trn: any) => (
                  <tr key={trn.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3">
                      <span className="font-bold text-slate-700 block">{trn.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{trn.studentId}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600 text-sm">{trn.cgpa?.toFixed(2)}</td>
                    <td className="p-3 text-slate-500 font-mono">{trn.issueDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${trn.status === "verified" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                        {trn.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => alert("Downloading PDF transcript...")} className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200">
                          <Download size={12} /> PDF
                        </button>
                        {trn.status !== "verified" && isAdmin && (
                          <button onClick={() => { if (confirm("Verify this transcript?")) verifyMutation.mutate(trn.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Verify">
                            <ShieldCheck size={13} />
                          </button>
                        )}
                        {isEditor && (
                          <button onClick={() => openEdit(trn)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => { if (confirm("Delete this transcript?")) deleteMutation.mutate(trn.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>{isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Transcript" : "Generate Transcript"}</span>
              <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Student ID</label>
                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. STU-001" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={closeModal} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm flex items-center gap-1.5">
                  <FileText size={14} /> {editItem ? "Update" : "Generate"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
