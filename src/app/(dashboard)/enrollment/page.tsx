"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Plus, CheckCircle2, X, Calendar, Users, Clock } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-50 text-slate-600 border-slate-200",
  upcoming: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function EnrollmentPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    semester: "",
    studentCount: "",
    registrationStart: "",
    registrationEnd: "",
    status: "upcoming",
  });

  const isEditor = can("update", "enrollment");

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["semesterRegistrations"],
    queryFn: api.getSemesterRegistrations,
  });

  const createMutation = useMutation({
    mutationFn: api.createSemesterRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesterRegistrations"] });
      closeModal();
      setSuccessMsg("Enrollment period created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ semester: "", studentCount: "", registrationStart: "", registrationEnd: "", status: "upcoming" });
  };

  const openCreate = () => {
    setForm({ semester: "", studentCount: "", registrationStart: "", registrationEnd: "", status: "upcoming" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      studentCount: Number(form.studentCount) || 0,
    };
    createMutation.mutate(payload);
  };

  const activeRegistrations = registrations.filter((r: any) => r.status === "active");
  const completedRegistrations = registrations.filter((r: any) => r.status === "completed");
  const upcomingRegistrations = registrations.filter((r: any) => r.status === "upcoming" || r.status === "UPCOMING");

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-[#2563EB]" />
            Semester Enrollment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage semester registration periods and student enrollment.
          </p>
        </div>
        {isEditor && (
          <button
            onClick={openCreate}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> New Registration
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
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeRegistrations.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{upcomingRegistrations.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
              <Users size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{completedRegistrations.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration List */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Registration Periods
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No registration periods found.</p>
            <p className="text-[10px] text-slate-300 mt-1">Create a new registration period to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Semester</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Students</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Start Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">End Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {registrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3 font-semibold text-slate-700">{reg.semester}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Users size={14} className="text-slate-400" />
                        {reg.studentCount}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(reg.registrationStart).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(reg.registrationEnd).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${STATUS_STYLES[reg.status?.toLowerCase()] || STATUS_STYLES.upcoming}`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
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
                <span className="text-sm font-bold text-slate-800">New Registration Period</span>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Semester</label>
                  <input
                    type="text"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    placeholder="e.g., Fall 2026"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Expected Student Count</label>
                  <input
                    type="number"
                    value={form.studentCount}
                    onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
                    placeholder="450"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={form.registrationStart}
                      onChange={(e) => setForm({ ...form, registrationStart: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">End Date</label>
                    <input
                      type="date"
                      value={form.registrationEnd}
                      onChange={(e) => setForm({ ...form, registrationEnd: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
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
                    disabled={createMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Registration"}
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
