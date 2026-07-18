"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ListChecks, Plus, CheckCircle2, X, Award, UserCheck } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface ApplicationRow {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  program: string;
  status: string;
  submittedAt: string;
}

interface MeritRow {
  id: string;
  applicantName: string;
  applicationId: string;
  rank: number;
  score: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  reviewed: "bg-blue-50 text-blue-700 border-blue-100",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

export default function AdmissionsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"applications" | "merit">("applications");
  const [successMsg, setSuccessMsg] = useState("");
  const [isMeritModalOpen, setIsMeritModalOpen] = useState(false);
  const [meritForm, setMeritForm] = useState({ applicantName: "", applicationId: "", score: 0 });

  const isRegistrarOrAdmin = roleIs("super-admin", "domain-admin");

  const { data: applications = [], isLoading: loadingApps } = useQuery<ApplicationRow[]>({
    queryKey: ["admissionApplications"],
    queryFn: api.getAdmissionApplications,
  });

  const { data: meritList = [], isLoading: loadingMerit } = useQuery<MeritRow[]>({
    queryKey: ["meritList"],
    queryFn: api.getMeritList,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateAdmissionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissionApplications"] });
      setSuccessMsg("Application status updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createMeritMutation = useMutation({
    mutationFn: api.createMeritListEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meritList"] });
      setSuccessMsg("Merit list entry created.");
      setIsMeritModalOpen(false);
      setMeritForm({ applicantName: "", applicationId: "", score: 0 });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleCreateMerit = (e: React.FormEvent) => {
    e.preventDefault();
    createMeritMutation.mutate(meritForm);
  };

  const appColumns: Column<ApplicationRow>[] = [
    { header: "Applicant Name", accessor: "applicantName", className: "font-semibold text-slate-700" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone", className: "font-mono text-slate-500" },
    { header: "Program", accessor: "program", className: "font-medium" },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${statusColors[row.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
          {row.status}
        </span>
      ),
    },
    { header: "Submitted", accessor: "submittedAt", className: "font-mono text-slate-400" },
    ...(isRegistrarOrAdmin
      ? [
          {
            header: "Actions" as const,
            accessor: (row: ApplicationRow) => (
              <div className="flex items-center gap-1.5">
                {row.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(row.id, "reviewed")}
                      className="h-6 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-blue-100"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(row.id, "rejected")}
                      className="h-6 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-red-100"
                    >
                      Reject
                    </button>
                  </>
                )}
                {row.status === "reviewed" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(row.id, "accepted")}
                      className="h-6 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-emerald-100"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(row.id, "rejected")}
                      className="h-6 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-red-100"
                    >
                      Reject
                    </button>
                  </>
                )}
                {row.status === "accepted" && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Enrolled
                  </span>
                )}
                {row.status === "rejected" && (
                  <span className="text-[10px] text-red-400 font-semibold">Denied</span>
                )}
              </div>
            ),
          } as Column<ApplicationRow>,
        ]
      : []),
  ];

  const meritColumns: Column<MeritRow>[] = [
    {
      header: "Rank",
      accessor: (row) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs">
          {row.rank}
        </span>
      ),
    },
    { header: "Applicant Name", accessor: "applicantName", className: "font-semibold text-slate-700" },
    { header: "Application ID", accessor: "applicationId", className: "font-mono text-slate-500" },
    {
      header: "Score",
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-700">{row.score.toFixed(1)}%</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
          row.status === "selected" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          {row.status}
        </span>
      ),
    },
    { header: "Created", accessor: "createdAt", className: "font-mono text-slate-400" },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-[#2563EB]" />
            Admissions Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage applicant intake, review applications, and publish merit lists.
          </p>
        </div>

        {activeTab === "merit" && isRegistrarOrAdmin && (
          <button
            onClick={() => setIsMeritModalOpen(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Add Merit Entry
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
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "applications"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <UserCheck size={14} className="inline mr-1" />
          Applications
        </button>
        <button
          onClick={() => setActiveTab("merit")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "merit"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <ListChecks size={14} className="inline mr-1" />
          Merit List
        </button>
      </div>

      {activeTab === "applications" ? (
        loadingApps ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <DataTable<ApplicationRow>
            data={applications}
            columns={appColumns}
            searchPlaceholder="Search applicants by name..."
            searchField="applicantName"
          />
        )
      ) : (
        loadingMerit ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <DataTable<MeritRow>
            data={meritList}
            columns={meritColumns}
            searchPlaceholder="Search merit entries..."
            searchField="applicantName"
          />
        )
      )}

      <AnimatePresence>
        {isMeritModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Create Merit List Entry</span>
                <button
                  onClick={() => setIsMeritModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateMerit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Applicant Name</label>
                  <input
                    type="text"
                    value={meritForm.applicantName}
                    onChange={(e) => setMeritForm({ ...meritForm, applicantName: e.target.value })}
                    placeholder="Full name"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Application ID</label>
                  <input
                    type="text"
                    value={meritForm.applicationId}
                    onChange={(e) => setMeritForm({ ...meritForm, applicationId: e.target.value })}
                    placeholder="e.g. APP-001"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Score (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={meritForm.score}
                    onChange={(e) => setMeritForm({ ...meritForm, score: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsMeritModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Award size={14} />
                    Create Entry
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
