"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2, X, Eye, Target, GitBranch } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

const COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"];

const coSchema = zod.object({
  course: zod.string().min(1, "Course is required"),
  code: zod.string().min(1, "Code is required"),
  description: zod.string().min(1, "Description is required"),
  cognitiveLevel: zod.string().min(1, "Cognitive level is required"),
});

const poSchema = zod.object({
  code: zod.string().min(1, "Code is required"),
  description: zod.string().min(1, "Description is required"),
});

type COFormValues = zod.infer<typeof coSchema>;
type POFormValues = zod.infer<typeof poSchema>;

export default function CurriculumPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"cos" | "pos" | "maps">("cos");
  const [isCOModalOpen, setIsCOModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [editingCO, setEditingCO] = useState<any>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [viewingMatrixId, setViewingMatrixId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const isEditor = can("update", "curriculum");
  const isAdmin = can("delete", "curriculum");

  const { data: courseOutcomes = [], isLoading: loadingCO } = useQuery({
    queryKey: ["courseOutcomes"],
    queryFn: api.getCourseOutcomes,
  });

  const { data: programOutcomes = [], isLoading: loadingPO } = useQuery({
    queryKey: ["programOutcomes"],
    queryFn: api.getProgramOutcomes,
  });

  const { data: curriculumMaps = [], isLoading: loadingMaps } = useQuery({
    queryKey: ["curriculumMaps"],
    queryFn: api.getCurriculumMaps,
  });

  const { data: coPoMatrix = [], isLoading: loadingMatrix } = useQuery({
    queryKey: ["coPoMatrix", viewingMatrixId],
    queryFn: () => api.getCOPOMatrix(viewingMatrixId!),
    enabled: !!viewingMatrixId,
  });

  const createCOMutation = useMutation({
    mutationFn: (data: any) => editingCO ? api.updateCourseOutcome(editingCO.id, data) : api.createCourseOutcome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOutcomes"] });
      setSuccessMsg(editingCO ? "Course Outcome updated." : "Course Outcome created.");
      setIsCOModalOpen(false);
      setEditingCO(null);
      resetCOForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteCOMutation = useMutation({
    mutationFn: (id: string) => api.deleteCourseOutcome(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["courseOutcomes"] }); setSuccessMsg("Course Outcome deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const createPOMutation = useMutation({
    mutationFn: (data: any) => editingPO ? api.updateProgramOutcome(editingPO.id, data) : api.createProgramOutcome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programOutcomes"] });
      setSuccessMsg(editingPO ? "Program Outcome updated." : "Program Outcome created.");
      setIsPOModalOpen(false);
      setEditingPO(null);
      resetPOForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deletePOMutation = useMutation({
    mutationFn: (id: string) => api.deleteProgramOutcome(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["programOutcomes"] }); setSuccessMsg("Program Outcome deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const deleteMapMutation = useMutation({
    mutationFn: (id: string) => api.deleteCurriculumMap(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["curriculumMaps"] }); setSuccessMsg("Curriculum map deleted."); setTimeout(() => setSuccessMsg(""), 4000); },
  });

  const {
    register: registerCO,
    handleSubmit: handleSubmitCO,
    reset: resetCOForm,
    setValue: setCOValue,
    formState: { errors: coErrors },
  } = useForm<COFormValues>({ resolver: zodResolver(coSchema), defaultValues: { course: "", code: "", description: "", cognitiveLevel: "apply" } });

  const {
    register: registerPO,
    handleSubmit: handleSubmitPO,
    reset: resetPOForm,
    setValue: setPOValue,
    formState: { errors: poErrors },
  } = useForm<POFormValues>({ resolver: zodResolver(poSchema), defaultValues: { code: "", description: "" } });

  const openCOModal = (co?: any) => {
    if (co) { setEditingCO(co); setCOValue("course", co.course); setCOValue("code", co.code); setCOValue("description", co.description); setCOValue("cognitiveLevel", co.cognitiveLevel); }
    else { setEditingCO(null); resetCOForm(); }
    setIsCOModalOpen(true);
  };

  const openPOModal = (po?: any) => {
    if (po) { setEditingPO(po); setPOValue("code", po.code); setPOValue("description", po.description); }
    else { setEditingPO(null); resetPOForm(); }
    setIsPOModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookOpen className="text-[#2563EB]" /> Curriculum & Outcomes</h1>
          <p className="text-xs text-slate-400 mt-1">Course outcomes, program outcomes, and curriculum mapping.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "cos" && isEditor && (
            <button onClick={() => openCOModal()} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"><Plus size={16} /> Add CO</button>
          )}
          {activeTab === "pos" && isEditor && (
            <button onClick={() => openPOModal()} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"><Plus size={16} /> Add PO</button>
          )}
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-[#e1e2ed] bg-slate-50/50 px-4 gap-4">
          <button onClick={() => setActiveTab("cos")} className={`py-2 text-xs font-bold tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "cos" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            <Target size={14} className="inline mr-1" /> Course Outcomes
          </button>
          <button onClick={() => setActiveTab("pos")} className={`py-2 text-xs font-bold tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "pos" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            <GitBranch size={14} className="inline mr-1" /> Program Outcomes
          </button>
          <button onClick={() => setActiveTab("maps")} className={`py-2 text-xs font-bold tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "maps" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            <BookOpen size={14} className="inline mr-1" /> Curriculum Map
          </button>
        </div>

        {/* Course Outcomes */}
        {activeTab === "cos" && (
          <div>
            {loadingCO ? <TableSkeleton rows={4} cols={5} /> : courseOutcomes.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No course outcomes defined yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Code</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Course</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Description</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Cognitive Level</th>
                      {isEditor && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {courseOutcomes.map((co: any) => (
                      <tr key={co.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-mono font-bold text-[#2563EB]">{co.code}</td>
                        <td className="p-3 font-semibold text-slate-700">{co.courseTitle || co.course}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{co.description}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-semibold">{co.cognitiveLevel}</span></td>
                        {isEditor && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openCOModal(co)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"><Edit2 size={13} /></button>
                              {isAdmin && <button onClick={() => { if (confirm("Delete this course outcome?")) deleteCOMutation.mutate(co.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>}
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
        )}

        {/* Program Outcomes */}
        {activeTab === "pos" && (
          <div>
            {loadingPO ? <TableSkeleton rows={4} cols={3} /> : programOutcomes.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No program outcomes defined yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Code</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Description</th>
                      {isEditor && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {programOutcomes.map((po: any) => (
                      <tr key={po.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-mono font-bold text-[#2563EB]">{po.code}</td>
                        <td className="p-3 text-slate-500">{po.description}</td>
                        {isEditor && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openPOModal(po)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"><Edit2 size={13} /></button>
                              {isAdmin && <button onClick={() => { if (confirm("Delete this program outcome?")) deletePOMutation.mutate(po.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>}
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
        )}

        {/* Curriculum Maps */}
        {activeTab === "maps" && (
          <div>
            {viewingMatrixId ? (
              <div>
                <div className="p-3 border-b border-[#e1e2ed] bg-slate-50/50 flex items-center gap-2">
                  <button onClick={() => setViewingMatrixId(null)} className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer">&larr; Back to Maps</button>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-bold text-slate-500">CO-PO Matrix</span>
                </div>
                {loadingMatrix ? <TableSkeleton rows={4} cols={5} /> : coPoMatrix.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">No matrix data available for this map.</p>
                ) : (
                  <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                          <th className="p-2 text-xs font-bold text-slate-400 uppercase">CO</th>
                          {coPoMatrix[0]?.poMappings?.map((pm: any) => (
                            <th key={pm.po?.id || pm.po} className="p-2 text-xs font-bold text-slate-400 uppercase text-center">{pm.po?.code || pm.po}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e2ed]">
                        {coPoMatrix.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 text-xs">
                            <td className="p-2 font-mono font-bold text-[#2563EB]">{row.co?.code || row.co}</td>
                            {row.poMappings?.map((pm: any, j: number) => (
                              <td key={j} className="p-2 text-center">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${pm.mapped ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-300 border border-slate-200"}`}>
                                  {pm.mapped ? "\u2713" : "\u2014"}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {loadingMaps ? <TableSkeleton rows={3} cols={5} /> : curriculumMaps.length === 0 ? (
                  <p className="p-12 text-center text-xs text-slate-400">No curriculum maps created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Course</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Semester</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Outcomes</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Topics</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e2ed]">
                        {curriculumMaps.map((cm: any) => (
                          <tr key={cm.id} className="hover:bg-slate-50/50 text-xs">
                            <td className="p-3 font-semibold text-slate-700">{cm.courseTitle || cm.course}</td>
                            <td className="p-3 text-slate-500">{cm.academicSemester}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-100 rounded text-[10px] font-semibold">{(cm.courseOutcomes?.length || 0)} COs</span></td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-semibold">{(cm.topics?.length || 0)} topics</span></td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => setViewingMatrixId(cm.id)} className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200">
                                  <Eye size={11} /> CO-PO Matrix
                                </button>
                                {isAdmin && (
                                  <button onClick={() => { if (confirm("Delete this curriculum map?")) deleteMapMutation.mutate(cm.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Outcome Modal */}
      <AnimatePresence>{isCOModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editingCO ? "Edit" : "Add"} Course Outcome</span>
              <button onClick={() => { setIsCOModalOpen(false); setEditingCO(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitCO((values) => createCOMutation.mutate(values))} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Course ID</label>
                <input type="text" {...registerCO("course")} placeholder="e.g. CRS-001" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {coErrors.course && <span className="text-[10px] text-red-500 font-semibold">{coErrors.course.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Outcome Code</label>
                <input type="text" {...registerCO("code")} placeholder="e.g. CO1" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {coErrors.code && <span className="text-[10px] text-red-500 font-semibold">{coErrors.code.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <textarea {...registerCO("description")} rows={3} className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {coErrors.description && <span className="text-[10px] text-red-500 font-semibold">{coErrors.description.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Cognitive Level</label>
                <select {...registerCO("cognitiveLevel")} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
                  {COGNITIVE_LEVELS.map((lvl) => (<option key={lvl} value={lvl}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</option>))}
                </select>
                {coErrors.cognitiveLevel && <span className="text-[10px] text-red-500 font-semibold">{coErrors.cognitiveLevel.message}</span>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => { setIsCOModalOpen(false); setEditingCO(null); }} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {editingCO ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Program Outcome Modal */}
      <AnimatePresence>{isPOModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{editingPO ? "Edit" : "Add"} Program Outcome</span>
              <button onClick={() => { setIsPOModalOpen(false); setEditingPO(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitPO((values) => createPOMutation.mutate(values))} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Outcome Code</label>
                <input type="text" {...registerPO("code")} placeholder="e.g. PO1" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {poErrors.code && <span className="text-[10px] text-red-500 font-semibold">{poErrors.code.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <textarea {...registerPO("description")} rows={3} className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                {poErrors.description && <span className="text-[10px] text-red-500 font-semibold">{poErrors.description.message}</span>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => { setIsPOModalOpen(false); setEditingPO(null); }} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {editingPO ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
