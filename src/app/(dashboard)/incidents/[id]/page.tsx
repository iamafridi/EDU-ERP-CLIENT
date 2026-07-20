"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Wrench, ArrowLeft, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [statusVal, setStatusVal] = useState("reported");
  const [resolutionText, setResolutionText] = useState("");
  const [technicianVal, setTechnicianVal] = useState("");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: api.getIncidents,
  });

  const incident = incidents.find((inc: any) => inc.id === params.id);

  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.updateIncident(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSuccessMsg("Incident ticket updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteIncidentMutation = useMutation({
    mutationFn: api.deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      router.push("/incidents");
    },
  });

  useEffect(() => {
    if (incident) {
      setStatusVal(incident.status);
      setResolutionText(incident.resolution || "");
      setTechnicianVal(incident.technician || "");
    }
  }, [incident]);

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;
    updateIncidentMutation.mutate({
      id: incident.id,
      payload: {
        status: statusVal,
        resolution: resolutionText || undefined,
        technician: technicianVal || undefined,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this incident ticket permanently?")) {
      deleteIncidentMutation.mutate(incident?.id);
    }
  };

  const severityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700 border-slate-200",
    medium: "bg-blue-50 text-blue-700 border-blue-100",
    high: "bg-amber-50 text-amber-700 border-amber-100",
    critical: "bg-red-50 text-red-700 border-red-100 animate-pulse",
  };

  const statusColors: Record<string, string> = {
    reported: "bg-purple-50 text-purple-700 border-purple-100",
    investigating: "bg-sky-50 text-sky-700 border-sky-100",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    closed: "bg-slate-100 text-slate-500 border-slate-200",
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Loading incident details...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Incident not found.</p>
        <Link href="/incidents" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Incidents</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/incidents" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-[#2563EB]" />
            Incident Details
          </h1>
        </div>
        {isStaff && (
          <button
            onClick={handleDelete}
            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} /> Delete
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

      {/* Incident Info */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incident Information</span>
          <span className="text-[10px] font-bold bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded uppercase font-mono">
            {incident.id}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${statusColors[incident.status] || "bg-slate-50 text-slate-500"}`}>
              Status: {incident.status}
            </span>
            <span className={`px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${severityColors[incident.severity] || "bg-slate-50 text-slate-500"}`}>
              Severity: {incident.severity}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Logged: {incident.date}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">{incident.title}</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Description</label>
            <p className="text-sm text-slate-600 leading-relaxed">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Location</label>
              <p className="text-sm font-mono text-slate-700">{incident.location}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Category</label>
              <p className="text-sm text-slate-600">{incident.category || "\u2014"}</p>
            </div>
          </div>

          {incident.technician && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Assigned Technician</label>
              <p className="text-sm font-mono text-blue-700">{incident.technician}</p>
            </div>
          )}

          {incident.resolution && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Resolution</label>
              <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-lg text-xs">
                <p className="text-slate-600">{incident.resolution}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Dispatch Form */}
      {isStaff && (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatch / Update</span>
          </div>
          <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Dispatch Status</label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              >
                <option value="reported">Reported</option>
                <option value="investigating">Investigating / Dispatched</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Assigned Technician</label>
              <input
                type="text"
                value={technicianVal}
                onChange={(e) => setTechnicianVal(e.target.value)}
                placeholder="e.g. John Doe (Plumbing)"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Resolution Summary / Repair Log</label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Log parts replaced, technician names, or completion status..."
                className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link
                href="/incidents"
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center"
              >
                Close
              </Link>
              <button
                type="submit"
                disabled={updateIncidentMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldAlert size={14} />
                Commit Dispatch Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
