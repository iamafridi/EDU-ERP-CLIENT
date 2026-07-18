"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Plus, X, Calendar, UserCheck } from "lucide-react";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export default function LeaveManagementPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    employeeName: "",
    type: "sick",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const canApprove = roleIs("super-admin", "domain-admin");

  const { data: leaveRequests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: api.getLeaveRequests,
  });

  const createLeaveMutation = useMutation({
    mutationFn: api.createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      setSuccessMsg("Leave request submitted successfully.");
      setIsApplyModalOpen(false);
      setNewLeave({ employeeId: "", employeeName: "", type: "sick", startDate: "", endDate: "", reason: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: api.updateLeaveRequestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      setSuccessMsg("Leave request status updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    createLeaveMutation.mutate(newLeave);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock size={12} />,
    approved: <CheckCircle2 size={12} />,
    rejected: <XCircle size={12} />,
  };

  const columns: Column<LeaveRequest>[] = [
    { header: "Employee Name", accessor: "employeeName" },
    { header: "Employee ID", accessor: "employeeId", className: "font-mono text-slate-500" },
    {
      header: "Leave Type",
      accessor: (row) => (
        <span className="capitalize px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
          {row.type}
        </span>
      ),
    },
    {
      header: "Duration",
      accessor: (row) => (
        <span className="font-mono text-slate-500 text-xs">
          {row.startDate} — {row.endDate}
        </span>
      ),
    },
    { header: "Reason", accessor: "reason" },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${statusColors[row.status] || "bg-slate-50 text-slate-500"}`}>
          {statusIcons[row.status]}
          {row.status}
        </span>
      ),
    },
    ...(canApprove
      ? [
          {
            header: "Actions" as const,
            accessor: (row: LeaveRequest) =>
              row.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(row.id, "approved")}
                    className="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-emerald-100"
                  >
                    <CheckCircle2 size={12} /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(row.id, "rejected")}
                    className="h-7 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-red-100"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">—</span>
              ),
          } as Column<LeaveRequest>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-[#2563EB]" />
            Leave Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apply for leave, track request status, and manage approvals.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
        >
          <Plus size={16} />
          Apply for Leave
        </button>
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={16} /> Leave Requests
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-bold">
            {leaveRequests.filter((l) => l.status === "pending").length} Pending
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <DataTable<LeaveRequest>
            data={leaveRequests}
            columns={columns}
            searchPlaceholder="Search by employee name..."
            searchField="employeeName"
          />
        )}
      </div>

      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Apply for Leave</span>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Employee ID</label>
                    <input
                      type="text"
                      value={newLeave.employeeId}
                      onChange={(e) => setNewLeave((p) => ({ ...p, employeeId: e.target.value }))}
                      placeholder="e.g. FAC-001"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Employee Name</label>
                    <input
                      type="text"
                      value={newLeave.employeeName}
                      onChange={(e) => setNewLeave((p) => ({ ...p, employeeName: e.target.value }))}
                      placeholder="Full name"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Leave Type</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave((p) => ({ ...p, type: e.target.value }))}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="academic">Academic Leave</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave((p) => ({ ...p, startDate: e.target.value }))}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">End Date</label>
                    <input
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave((p) => ({ ...p, endDate: e.target.value }))}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Reason</label>
                  <textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="Brief explanation for the leave request..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Calendar size={14} />
                    Submit Request
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
