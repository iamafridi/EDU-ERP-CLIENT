"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { AlertOctagon, Plus, HelpCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function GrievancePortal() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = roleIs("domain-admin") || user?.staffSubRole === "warden";

  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ["grievances"],
    queryFn: api.getGrievances,
  });

  const deleteGrievanceMutation = useMutation({
    mutationFn: api.deleteGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      setSuccessMsg("Grievance has been deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const filteredGrievances = grievances.filter((grv: any) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const matchesStatus =
      grv.status === term ||
      grv.status === "under-review" && term === "under-review" ||
      grv.status === "submitted" && term === "submitted" ||
      grv.status === "resolved" && term === "resolved" ||
      grv.status === "closed" && term === "closed";
    const matchesKeyword =
      grv.subject?.toLowerCase().includes(term) ||
      grv.description?.toLowerCase().includes(term);
    return matchesStatus || matchesKeyword;
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertOctagon className="text-[#2563EB]" />
            Grievances & Appeals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit formal complaints, flag violations, and track resolution progress.
          </p>
        </div>

        {!isAdmin && (
          <Link
            href="/grievances/new"
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            File New Grievance
          </Link>
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isAdmin ? "All Registered Complaints" : "Your Filed Grievances"}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject, description, or status..."
              className="h-8 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all w-56 font-mono"
            />
            <select
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all w-40"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-[#e1e2ed]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto space-y-3">
            <HelpCircle size={48} className="text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">
              {searchTerm ? "No Matching Grievances Found" : "No Complaints Recorded"}
            </h3>
            <p className="text-xs text-slate-400">
              {searchTerm
                ? "Try adjusting your search or filter to find what you are looking for."
                : "There are no unresolved grievances in your account. Use the button to submit a report if you face any issues."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e1e2ed]">
            {filteredGrievances.map((grv: any) => {
              const statusColors: Record<string, string> = {
                submitted: "bg-blue-50 text-blue-700 border-blue-100",
                "under-review": "bg-amber-50 text-amber-700 border-amber-100",
                resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
                closed: "bg-slate-100 text-slate-600 border-slate-200"
              };

              return (
                <div key={grv.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${statusColors[grv.status] || "bg-slate-50 text-slate-500"}`}>
                        {grv.status}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 uppercase">
                        {grv.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Submitted: {grv.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800">{grv.subject}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{grv.description}</p>

                    {grv.resolution && (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-emerald-800 block">Resolution Feedback:</span>
                        <p className="text-slate-600">{grv.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between shrink-0 h-full gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Filed by: <strong className="text-slate-600">{grv.studentName || "Anonymous"}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/grievances/${grv.id}`}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                        title="View details"
                      >
                        <AlertOctagon size={13} />
                      </Link>
                      <Link
                        href={`/grievances/${grv.id}`}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors"
                        title="Edit grievance"
                      >
                        <Pencil size={13} />
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this grievance? This action cannot be undone.")) {
                              deleteGrievanceMutation.mutate(grv.id);
                            }
                          }}
                          disabled={deleteGrievanceMutation.isPending}
                          className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete grievance"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
