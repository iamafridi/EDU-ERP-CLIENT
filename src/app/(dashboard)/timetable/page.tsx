"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Grid3X3, List, Plus, X, CheckCircle2, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_LABELS: Record<string, string> = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri" };
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const ENTRY_TYPES = ["lecture", "lab", "tutorial"];
const COLORS = ["bg-blue-100 text-blue-700 border-blue-200", "bg-emerald-100 text-emerald-700 border-emerald-200", "bg-amber-100 text-amber-700 border-amber-200", "bg-purple-100 text-purple-700 border-purple-200", "bg-rose-100 text-rose-700 border-rose-200"];

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const aS = parseInt(aStart.split(":")[0]) * 60 + parseInt(aStart.split(":")[1] || "0");
  const aE = parseInt(aEnd.split(":")[0]) * 60 + parseInt(aEnd.split(":")[1] || "0");
  const bS = parseInt(bStart.split(":")[0]) * 60 + parseInt(bStart.split(":")[1] || "0");
  const bE = parseInt(bEnd.split(":")[0]) * 60 + parseInt(bEnd.split(":")[1] || "0");
  return aS < bE && bS < aE;
}

export default function TimetablePage() {
  const { user } = useAuthStore();
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTT, setSelectedTT] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [newTT, setNewTT] = useState({ academicSemester: "", department: "", year: 1, section: "A" });
  const [editTT, setEditTT] = useState<any>(null);
  const [newEntry, setNewEntry] = useState({ day: "monday", startTime: "09:00", endTime: "10:00", course: "", faculty: "", room: "", type: "lecture" });

  const isEditor = can("update", "timetable");

  const { data: timetables = [], isLoading } = useQuery({
    queryKey: ["timetables"],
    queryFn: api.getTimetables,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: api.getFaculties,
    enabled: isEditor,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: api.getCourses,
    enabled: isEditor,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: api.getRooms,
    enabled: isEditor,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: api.getSemesters,
    enabled: isEditor,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: api.getAcademicDepartments,
    enabled: isEditor,
  });

  const { data: gridData = {}, isLoading: loadingGrid } = useQuery({
    queryKey: ["timetableGrid", selectedTT],
    queryFn: () => api.getTimetableGrid(selectedTT),
    enabled: !!selectedTT && viewMode === "grid",
  });

  const activeTT = selectedTT ? timetables.find((t: any) => t.id === selectedTT) : timetables[0];

  const createTTMutation = useMutation({
    mutationFn: (data: any) => api.createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetables"] });
      setSuccessMsg("Timetable created.");
      setIsCreateModalOpen(false);
      setNewTT({ academicSemester: "", department: "", year: 1, section: "A" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateTTMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTimetable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetables"] });
      setSuccessMsg("Timetable updated.");
      setIsEditModalOpen(false);
      setEditTT(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteTTMutation = useMutation({
    mutationFn: (id: string) => api.deleteTimetable(id),
    onSuccess: (_: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: ["timetables"] });
      if (selectedTT === id) setSelectedTT("");
      setSuccessMsg("Timetable deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: (data: any) => api.addTimetableEntry(activeTT?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetables"] });
      queryClient.invalidateQueries({ queryKey: ["timetableGrid"] });
      setSuccessMsg("Entry added to timetable.");
      setIsEntryModalOpen(false);
      setNewEntry({ day: "monday", startTime: "09:00", endTime: "10:00", course: "", faculty: "", room: "", type: "lecture" });
      setConflicts([]);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const removeEntryMutation = useMutation({
    mutationFn: ({ ttId, entryId }: { ttId: string; entryId: string }) => api.removeTimetableEntry(ttId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetables"] });
      queryClient.invalidateQueries({ queryKey: ["timetableGrid"] });
      setSuccessMsg("Entry removed.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateTT = (e: React.FormEvent) => {
    e.preventDefault();
    createTTMutation.mutate(newTT);
  };

  const handleEditTT = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTT) updateTTMutation.mutate({ id: editTT.id, data: { academicSemester: editTT.academicSemester, department: editTT.department, year: editTT.year, section: editTT.section } });
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const detected: string[] = [];
    if (activeTT) {
      for (const existing of activeTT.entries) {
        if (
          existing.room === newEntry.room &&
          existing.day === newEntry.day &&
          timesOverlap(newEntry.startTime, newEntry.endTime, existing.startTime, existing.endTime)
        ) {
          detected.push(`${existing.courseTitle || existing.courseCode || existing.course} (${existing.startTime}-${existing.endTime})`);
        }
      }
    }
    setConflicts(detected);
    addEntryMutation.mutate(newEntry);
  };

  const openEditModal = (tt: any) => {
    setEditTT({ ...tt });
    setIsEditModalOpen(true);
  };

  const courseColorMap: Record<string, string> = {};
  let colorIdx = 0;
  if (activeTT) {
    for (const entry of activeTT.entries) {
      const key = entry.course || entry.courseCode;
      if (!courseColorMap[key]) {
        courseColorMap[key] = COLORS[colorIdx % COLORS.length];
        colorIdx++;
      }
    }
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-[#2563EB]" />
            Lecture Timetable
          </h1>
          <p className="text-xs text-slate-400 mt-1">Weekly class schedule grid view with entry management.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#e1e2ed] rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${viewMode === "grid" ? "bg-[#2563EB] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}><Grid3X3 size={14} /> Grid</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${viewMode === "list" ? "bg-[#2563EB] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}><List size={14} /> List</button>
          </div>
          {isEditor && (
            <>
              <button onClick={() => setIsCreateModalOpen(true)} className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                <Plus size={14} /> New Timetable
              </button>
              {activeTT && (
                <button onClick={() => setIsEntryModalOpen(true)} className="h-9 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/10">
                  <Plus size={14} /> Add Entry
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /><span>{successMsg}</span>
        </motion.div>
      )}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" /><span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="ml-auto text-amber-400 hover:text-amber-600"><X size={14} /></button>
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        {timetables.map((tt: any) => (
          <div key={tt.id} className={`flex items-center border rounded-lg overflow-hidden ${selectedTT === tt.id || (!selectedTT && timetables[0]?.id === tt.id) ? "border-[#2563EB]" : "border-[#e1e2ed]"}`}>
            <button onClick={() => setSelectedTT(tt.id)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${selectedTT === tt.id || (!selectedTT && timetables[0]?.id === tt.id) ? "bg-[#2563EB] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {tt.department} - Year {tt.year} {tt.section}
            </button>
            {isEditor && (
              <div className="flex border-l border-inherit">
                <button onClick={() => openEditModal(tt)} className={`px-2 py-1.5 text-xs transition-colors cursor-pointer ${selectedTT === tt.id || (!selectedTT && timetables[0]?.id === tt.id) ? "text-white hover:bg-blue-600" : "text-slate-400 hover:text-blue-600 hover:bg-slate-50"}`} title="Edit timetable"><Pencil size={12} /></button>
                <button onClick={() => { if (confirm("Delete this timetable and all its entries?")) deleteTTMutation.mutate(tt.id); }} className={`px-2 py-1.5 text-xs transition-colors cursor-pointer ${selectedTT === tt.id || (!selectedTT && timetables[0]?.id === tt.id) ? "text-white hover:bg-red-500" : "text-slate-400 hover:text-red-500 hover:bg-slate-50"}`} title="Delete timetable"><Trash2 size={12} /></button>
              </div>
            )}
          </div>
        ))}
        {timetables.length === 0 && !isLoading && (
          <p className="text-xs text-slate-400">No timetables created yet.</p>
        )}
      </div>

      {isLoading ? <TableSkeleton rows={5} cols={6} /> : !activeTT ? (
        <div className="p-12 text-center">
          <p className="text-xs text-slate-400 mb-3">No timetable selected. Create one or select from the list above.</p>
          {isEditor && (
            <button onClick={() => setIsCreateModalOpen(true)} className="h-9 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer">
              <Plus size={14} className="inline mr-1" /> Create Timetable
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
          {loadingGrid ? <TableSkeleton rows={6} cols={6} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                    <th className="p-2 text-xs font-bold text-slate-400 uppercase w-16">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="p-2 text-xs font-bold text-slate-400 uppercase text-center">{DAY_LABELS[day]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e2ed]">
                  {TIME_SLOTS.map((slot, si) => (
                    <tr key={slot} className={si % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                      <td className="p-2 text-[10px] font-mono font-bold text-slate-400 border-r border-[#e1e2ed]">{slot}</td>
                      {DAYS.map((day) => {
                        const entries = gridData[day]?.[slot] || [];
                        const entry = entries[0];
                        return (
                          <td key={`${day}-${slot}`} className="p-1 border-r border-[#e1e2ed] align-top min-h-[48px]">
                            {entry ? (
                              <div className={`p-1 rounded text-[9px] leading-tight border ${courseColorMap[entry.course || entry.courseCode] || "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                <div className="font-bold truncate">{entry.courseCode || entry.course}</div>
                                <div className="truncate opacity-80">{entry.facultyName || entry.faculty}</div>
                                <div className="truncate opacity-60">{entry.room}</div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <List size={16} /> All Entries — {activeTT.department} Year {activeTT.year} {activeTT.section}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Day</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Time</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Course</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Faculty</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Room</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                  {isEditor && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {activeTT.entries?.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-xs text-slate-400">No entries. Add one using the button above.</td></tr>
                ) : (
                  activeTT.entries?.map((entry: any, i: number) => (
                    <tr key={entry.id || i} className="hover:bg-slate-50/50 text-xs">
                      <td className="p-3 font-semibold text-slate-600 capitalize">{entry.day}</td>
                      <td className="p-3 font-mono text-slate-500">{entry.startTime} - {entry.endTime}</td>
                      <td className="p-3 font-semibold text-slate-700">{entry.courseTitle || entry.courseCode || entry.course}</td>
                      <td className="p-3 text-slate-500">{entry.facultyName || entry.faculty}</td>
                      <td className="p-3 font-mono text-slate-500">{entry.room}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-semibold capitalize">{entry.type}</span>
                      </td>
                      {isEditor && (
                        <td className="p-3">
                          <button onClick={() => { if (confirm("Remove this entry?")) removeEntryMutation.mutate({ ttId: activeTT.id, entryId: entry.id }); }}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Timetable Modal */}
      <AnimatePresence>{isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Create Timetable</span>
              <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTT} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Academic Semester</label>
                <select value={newTT.academicSemester} onChange={(e) => setNewTT((p) => ({ ...p, academicSemester: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="">Select semester...</option>
                  {semesters.map((s: any) => (<option key={s.id} value={s.name || s.id}>{s.name || s.code}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Department</label>
                <select value={newTT.department} onChange={(e) => setNewTT((p) => ({ ...p, department: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="">Select department...</option>
                  {departments.map((d: any) => (<option key={d.id} value={d.name || d.id}>{d.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Year</label>
                  <input type="number" min={1} max={6} value={newTT.year} onChange={(e) => setNewTT((p) => ({ ...p, year: parseInt(e.target.value) || 1 }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Section</label>
                  <input type="text" maxLength={1} value={newTT.section} onChange={(e) => setNewTT((p) => ({ ...p, section: e.target.value.toUpperCase() }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={createTTMutation.isPending} className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Plus size={14} /> {createTTMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Edit Timetable Modal */}
      <AnimatePresence>{isEditModalOpen && editTT && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Edit Timetable</span>
              <button onClick={() => { setIsEditModalOpen(false); setEditTT(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditTT} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Academic Semester</label>
                <select value={editTT.academicSemester} onChange={(e) => setEditTT((p: any) => ({ ...p, academicSemester: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="">Select semester...</option>
                  {semesters.map((s: any) => (<option key={s.id} value={s.name || s.id}>{s.name || s.code}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Department</label>
                <select value={editTT.department} onChange={(e) => setEditTT((p: any) => ({ ...p, department: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="">Select department...</option>
                  {departments.map((d: any) => (<option key={d.id} value={d.name || d.id}>{d.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Year</label>
                  <input type="number" min={1} max={6} value={editTT.year} onChange={(e) => setEditTT((p: any) => ({ ...p, year: parseInt(e.target.value) || 1 }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Section</label>
                  <input type="text" maxLength={1} value={editTT.section} onChange={(e) => setEditTT((p: any) => ({ ...p, section: e.target.value.toUpperCase() }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditTT(null); }} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={updateTTMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Pencil size={14} /> {updateTTMutation.isPending ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Add Entry Modal */}
      <AnimatePresence>{isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Add Timetable Entry</span>
              <button onClick={() => { setIsEntryModalOpen(false); setConflicts([]); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            {!activeTT ? (
              <div className="p-6 text-center text-xs text-slate-400">Create a timetable first before adding entries.</div>
            ) : (
              <form onSubmit={handleAddEntry} className="p-6 space-y-4">
                {conflicts.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-700 font-semibold flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <div>
                      Room conflict with: <ul className="list-disc list-inside mt-1">{[...new Set(conflicts)].map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Day</label>
                    <select value={newEntry.day} onChange={(e) => setNewEntry((p) => ({ ...p, day: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      {DAYS.map((d) => (<option key={d} value={d}>{DAY_LABELS[d]}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Type</label>
                    <select value={newEntry.type} onChange={(e) => setNewEntry((p) => ({ ...p, type: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      {ENTRY_TYPES.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Start</label>
                    <select value={newEntry.startTime} onChange={(e) => setNewEntry((p) => ({ ...p, startTime: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      {TIME_SLOTS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">End</label>
                    <select value={newEntry.endTime} onChange={(e) => setNewEntry((p) => ({ ...p, endTime: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      {TIME_SLOTS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Course</label>
                  <select value={newEntry.course} onChange={(e) => setNewEntry((p) => ({ ...p, course: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="">Select course...</option>
                    {courses.map((c: any) => (<option key={c.id} value={c.code || c.id}>{c.code} — {c.title}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Faculty</label>
                  <select value={newEntry.faculty} onChange={(e) => setNewEntry((p) => ({ ...p, faculty: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="">Select faculty...</option>
                    {faculties.map((f: any) => (<option key={f.id} value={f.facultyId || f.id}>{f.name} — {f.designation}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Room</label>
                  <select value={newEntry.room} onChange={(e) => setNewEntry((p) => ({ ...p, room: e.target.value }))} required className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="">Select room...</option>
                    {rooms.map((r: any) => (<option key={r.id} value={r.roomNumber || r.id}>{r.roomNumber} — {r.building}</option>))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button type="button" onClick={() => { setIsEntryModalOpen(false); setConflicts([]); }} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={addEntryMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"><Plus size={14} /> {addEntryMutation.isPending ? "Adding..." : "Add Entry"}</button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
