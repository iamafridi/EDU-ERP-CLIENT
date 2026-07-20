"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowLeft, CheckCircle2, Trash2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [resolutionText, setResolutionText] = useState("");

  const isAdmin = roleIs("domain-admin") || user?.staffSubRole === "warden";

  const { data: grievances = [] } = useQuery({
    queryKey: ["grievances"],
    queryFn: api.getGrievances,
  });

  const grievance = grievances.find((g: any) => g.id === params.id);

  const updateGrievanceMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.updateGrievance(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      setSuccessMsg("Grievance status updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteGrievanceMutation = useMutation({
    mutationFn: api.deleteGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      router.push("/grievances");
    },
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance) return;
    updateGrievanceMutation.mutate({
      id: grievance.id,
      payload: {
        status: updateStatus,
        resolution: resolutionText || undefined,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this grievance? This action cannot be undone.")) {
      deleteGrievanceMutation.mutate(grievance.id);
    }
  };

  if (!grievance) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Grievance not found.</p>
        <Link href="/grievances" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Grievances</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-50 text-blue-700 border-blue-100",
    "under-review": "bg-amber-50 text-amber-700 border-amber-100",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    closed: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/grievances" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertOctagon className="text-[#2563EB]" />
            Grievance Details
          </h1>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} disabled={deleteGrievanceMutation.isPending}
            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Trash2 size={14} /> Delete
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Information</span>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${statusColors[grievance.status] || "bg-slate-50 text-slate-500"}`}>
              {grievance.status}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 uppercase">
              {grievance.category}
            </span>
            {grievance.priority && (
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 uppercase">
                {grievance.priority}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Subject</label>
            <p className="text-sm font-bold text-slate-800">{grievance.subject}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Filed By</label>
              <p className="text-sm font-semibold text-slate-700">{grievance.studentName || "Anonymous"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Submitted</label>
              <p className="text-sm font-mono text-slate-600">{grievance.date}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Description</label>
            <p className="text-sm text-slate-600 leading-relaxed">{grievance.description}</p>
          </div>

          {grievance.resolution && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-lg text-xs space-y-1">
              <span className="font-bold text-emerald-800 block">Resolution Feedback:</span>
              <p className="text-slate-600">{grievance.resolution}</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={16} /> Admin Action
            </span>
          </div>
          <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Update Status</label>
              <select
                value={updateStatus || grievance.status}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              >
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Resolution Notes</label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Outline what actions have been taken to address this grievance..."
                className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <button
                type="submit"
                disabled={updateGrievanceMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck size={14} />
                Commit Resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
