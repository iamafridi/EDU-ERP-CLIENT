"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ClipboardList, UserCheck, Plus, Calendar, X, Edit2, Trash2 } from "lucide-react";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: string;
  course: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
}

export default function AttendancePage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canMarkAttendance = roleIs("super-admin", "domain-admin", "faculty");
  const [activeTab, setActiveTab] = useState<"mark" | "report">(canMarkAttendance ? "mark" : "report");
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAttendance, setNewAttendance] = useState({ studentId: "", studentName: "", course: "", date: "", status: "present" });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: api.getStudents,
  });

  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendanceRecords"],
    queryFn: api.getAttendanceRecords,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: api.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Attendance recorded successfully.");
      setSelectedStatuses({});
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: api.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Attendance entry created successfully.");
      setIsModalOpen(false);
      setNewAttendance({ studentId: "", studentName: "", course: "", date: "", status: "present" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    createAttendanceMutation.mutate(newAttendance);
  };

  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState({ status: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Attendance record updated.");
      setEditRecord(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Attendance record deleted.");
      setDeleteConfirm(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const uniqueCourses = [...new Set(attendanceRecords.map((r) => r.course))].sort();

  const filteredRecords = courseFilter
    ? attendanceRecords.filter((r) => r.course === courseFilter)
    : attendanceRecords;

  const handleBulkMark = () => {
    const entries = Object.entries(selectedStatuses).filter(([_, s]) => s);
    if (entries.length === 0) return;
    entries.forEach(([studentId, status]) => {
      const student = students.find((s) => s.id === studentId || s.studentId === studentId);
      markAttendanceMutation.mutate({
        studentId,
        studentName: student?.name || "",
        date: new Date().toISOString().split("T")[0],
        status,
        course: "General",
      });
    });
  };

  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth());
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyStatuses, setMonthlyStatuses] = useState<Record<string, string>>({});
  const [monthlyCourse, setMonthlyCourse] = useState("General");

  const monthlyMutation = useMutation({
    mutationFn: api.markAttendanceBulkDateRange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Monthly attendance marked successfully.");
      setIsMonthlyModalOpen(false);
      setMonthlyStatuses({});
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const getWeekdaysInMonth = (month: number, year: number) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const days: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        days.push(d.toISOString().split("T")[0]);
      }
    }
    return days;
  };

  const handleMarkMonthly = () => {
    const entries = Object.entries(monthlyStatuses).filter(([_, s]) => s);
    if (entries.length === 0) return;
    const days = getWeekdaysInMonth(monthlyMonth, monthlyYear);
    if (days.length === 0) return;
    monthlyMutation.mutate({
      startDate: days[0],
      endDate: days[days.length - 1],
      course: monthlyCourse,
      students: entries.map(([studentId, status]) => {
        const student = students.find((s) => s.id === studentId || s.studentId === studentId);
        return { studentId, studentName: student?.name || "", status };
      }),
    });
  };

  const statusColors: Record<string, string> = {
    present: "bg-emerald-50 text-emerald-700 border-emerald-100",
    absent: "bg-red-50 text-red-700 border-red-100",
    late: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const reportColumns: Column<AttendanceRecord>[] = [
    { header: "Student Name", accessor: "studentName" },
    { header: "Student ID", accessor: "studentId", className: "font-mono text-slate-500" },
    { header: "Date", accessor: (row) => <span className="font-mono text-slate-500">{row.date}</span> },
    { header: "Course", accessor: "course", className: "font-mono text-slate-500" },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${statusColors[row.status] || "bg-slate-50 text-slate-500"}`}>
          {row.status}
        </span>
      ),
    },
    ...(canMarkAttendance
      ? [
          {
            header: "Actions",
            accessor: (row: AttendanceRecord) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditRecord(row); setEditForm({ status: row.status }); }}
                  className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(row.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          } as Column<AttendanceRecord>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-[#2563EB]" />
            Attendance Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mark daily attendance and view attendance reports.
          </p>
        </div>
        {canMarkAttendance && activeTab === "report" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Add Attendance Record
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

      <div className="flex border-b border-[#e1e2ed] gap-2">
        {canMarkAttendance && (
          <button
            onClick={() => setActiveTab("mark")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "mark"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Mark Attendance
          </button>
        )}
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            !canMarkAttendance || activeTab === "report"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Attendance Report
        </button>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        {activeTab === "mark" ? (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={16} /> Student Roster — Mark Today's Attendance
              </span>
              <div className="flex items-center gap-2">
                {canMarkAttendance && (
                  <button
                    onClick={() => { setMonthlyMonth(new Date().getMonth()); setMonthlyYear(new Date().getFullYear()); setMonthlyStatuses({}); setIsMonthlyModalOpen(true); }}
                    className="h-8 px-3 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-[11px] hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar size={13} />
                    Mark Monthly
                  </button>
                )}
                {canMarkAttendance && (
                  <span className="text-[10px] text-slate-400 font-semibold">{new Date().toLocaleDateString()}</span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student Name</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student ID</th>
                    <th className="p-3 text-xs font-bold text-slate-400 uppercase">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e2ed]">
                  {studentsLoading ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-xs text-slate-400">Loading students...</td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-xs text-slate-400">No students found. Add students first.</td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id || student.studentId} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-semibold text-slate-700">{student.name}</td>
                        <td className="p-3 font-mono text-slate-500">{student.studentId || student.id}</td>
                        <td className="p-3">
                          <select
                            value={selectedStatuses[student.studentId || student.id] || ""}
                            onChange={(e) =>
                              setSelectedStatuses((prev) => ({ ...prev, [student.studentId || student.id]: e.target.value }))
                            }
                            disabled={!canMarkAttendance}
                            className="h-9 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">— Select —</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {canMarkAttendance && (
              <div className="p-4 border-t border-[#e1e2ed] bg-slate-50 flex justify-end">
                <button
                  onClick={handleBulkMark}
                  disabled={Object.values(selectedStatuses).filter(Boolean).length === 0 || markAttendanceMutation.isPending}
                  className="h-10 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markAttendanceMutation.isPending ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Submit Attendance
                </button>
              </div>
            )}

            {!canMarkAttendance && (
              <div className="p-4 border-t border-[#e1e2ed] bg-slate-50">
                <p className="text-xs text-slate-400 text-center">You have view-only access to attendance records.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={16} /> Attendance History
              </span>
              {uniqueCourses.length > 0 && (
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>

            {isLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <DataTable<AttendanceRecord>
                data={filteredRecords}
                columns={reportColumns}
                searchPlaceholder="Search by student name..."
                searchField="studentName"
              />
            )}
          </div>
        )}
      </div>

      {/* Add Attendance Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Add Attendance Record</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddAttendance} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Student ID</label>
                    <input
                      type="text"
                      value={newAttendance.studentId}
                      onChange={(e) => setNewAttendance((p) => ({ ...p, studentId: e.target.value }))}
                      placeholder="e.g. STU-001"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Student Name</label>
                    <input
                      type="text"
                      value={newAttendance.studentName}
                      onChange={(e) => setNewAttendance((p) => ({ ...p, studentName: e.target.value }))}
                      placeholder="Full name"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Course Code</label>
                    <input
                      type="text"
                      value={newAttendance.course}
                      onChange={(e) => setNewAttendance((p) => ({ ...p, course: e.target.value }))}
                      placeholder="e.g. CS-301"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Date</label>
                    <input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance((p) => ({ ...p, date: e.target.value }))}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    value={newAttendance.status}
                    onChange={(e) => setNewAttendance((p) => ({ ...p, status: e.target.value }))}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    Add Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Attendance Modal */}
      <AnimatePresence>
        {editRecord && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Edit Attendance</span>
                <button
                  onClick={() => setEditRecord(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-xs text-slate-500 space-y-1">
                  <p><span className="font-semibold text-slate-700">Student:</span> {editRecord.studentName}</p>
                  <p><span className="font-semibold text-slate-700">Date:</span> {editRecord.date}</p>
                  <p><span className="font-semibold text-slate-700">Course:</span> {editRecord.course}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ status: e.target.value })}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    onClick={() => setEditRecord(null)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: editRecord.id, payload: { status: editForm.status } })}
                    disabled={updateMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Delete Attendance Record</span>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">Are you sure you want to delete this attendance record? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mark Monthly Modal */}
      <AnimatePresence>
        {isMonthlyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Calendar size={16} className="text-[#2563EB]" />
                  Mark Monthly Attendance
                </span>
                <button
                  onClick={() => setIsMonthlyModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Month</label>
                    <select
                      value={monthlyMonth}
                      onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Year</label>
                    <input
                      type="number"
                      value={monthlyYear}
                      onChange={(e) => setMonthlyYear(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Course</label>
                  <input
                    type="text"
                    value={monthlyCourse}
                    onChange={(e) => setMonthlyCourse(e.target.value)}
                    placeholder="e.g. CS-301"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="text-xs text-slate-400 font-semibold">
                  Marking attendance for all weekdays in {["January","February","March","April","May","June","July","August","September","October","November","December"][monthlyMonth]} {monthlyYear} ({getWeekdaysInMonth(monthlyMonth, monthlyYear).length} days)
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 border border-[#e1e2ed] rounded-lg p-2">
                  {students.map((student) => (
                    <div key={student.id || student.studentId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div>
                        <span className="text-sm font-semibold text-slate-700">{student.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-2">{student.studentId || student.id}</span>
                      </div>
                      <select
                        value={monthlyStatuses[student.studentId || student.id] || ""}
                        onChange={(e) =>
                          setMonthlyStatuses((prev) => ({ ...prev, [student.studentId || student.id]: e.target.value }))
                        }
                        className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      >
                        <option value="">— Select —</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsMonthlyModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkMonthly}
                    disabled={Object.values(monthlyStatuses).filter(Boolean).length === 0 || monthlyMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {monthlyMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    ) : (
                      <Calendar size={14} />
                    )}
                    Mark Month
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
