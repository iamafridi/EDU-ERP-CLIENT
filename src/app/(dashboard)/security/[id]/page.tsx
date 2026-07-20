"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const gateEntrySchema = zod.object({
  type: zod.enum(["student", "visitor", "vehicle"]),
  personName: zod.string().min(2, "Name is required"),
  contactNo: zod.string().optional(),
  vehicleNumber: zod.string().optional(),
  purpose: zod.string().min(3, "Purpose is required"),
  isLateEntry: zod.boolean(),
  lateEntryReason: zod.string().optional(),
});

type GateEntryFormValues = zod.infer<typeof gateEntrySchema>;

const visitorPassSchema = zod.object({
  visitorName: zod.string().min(2, "Visitor name is required"),
  contactNo: zod.string().min(5, "Contact number is required"),
  email: zod.string().email("Invalid email").optional().or(zod.literal("")),
  purpose: zod.string().min(3, "Purpose is required"),
  vehicleNumber: zod.string().optional(),
});

type VisitorPassFormValues = zod.infer<typeof visitorPassSchema>;

const patrolLogSchema = zod.object({
  location: zod.string().min(2, "Location is required"),
  status: zod.enum(["active", "completed"]),
  notes: zod.string().optional(),
});

type PatrolLogFormValues = zod.infer<typeof patrolLogSchema>;

export default function SecurityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "gate" | "visitor" | "patrol") || "gate";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isGuardOrAdmin = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  const { data: gateEntries = [] } = useQuery({ queryKey: ["gateEntries"], queryFn: api.getGateEntries });
  const { data: visitorLogs = [] } = useQuery({ queryKey: ["visitorLogs"], queryFn: api.getVisitorLogs });
  const { data: patrolLogs = [] } = useQuery({ queryKey: ["patrolLogs"], queryFn: api.getPatrolLogs });

  const item = type === "gate"
    ? gateEntries.find((e: any) => e.id === params.id)
    : type === "visitor"
    ? visitorLogs.find((v: any) => v.id === params.id)
    : patrolLogs.find((p: any) => p.id === params.id);

  const updateGateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateGateEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      setSuccessMsg("Gate entry updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateVisitorMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateVisitorLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor log updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updatePatrolMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updatePatrolLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrolLogs"] });
      setSuccessMsg("Patrol log updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteGateMutation = useMutation({
    mutationFn: api.deleteGateEntry,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gateEntries"] }); router.push("/security"); },
  });

  const deleteVisitorMutation = useMutation({
    mutationFn: api.deleteVisitorLog,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["visitorLogs"] }); router.push("/security"); },
  });

  const deletePatrolMutation = useMutation({
    mutationFn: api.deletePatrolLog,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["patrolLogs"] }); router.push("/security"); },
  });

  const {
    register: registerGate,
    handleSubmit: handleSubmitGate,
    reset: resetGate,
    watch: watchGate,
    formState: { errors: gateErrors },
  } = useForm<GateEntryFormValues>({ resolver: zodResolver(gateEntrySchema) });

  const {
    register: registerVisitor,
    handleSubmit: handleSubmitVisitor,
    reset: resetVisitor,
    formState: { errors: visitorErrors },
  } = useForm<VisitorPassFormValues>({ resolver: zodResolver(visitorPassSchema) });

  const {
    register: registerPatrol,
    handleSubmit: handleSubmitPatrol,
    reset: resetPatrol,
    formState: { errors: patrolErrors },
  } = useForm<PatrolLogFormValues>({ resolver: zodResolver(patrolLogSchema) });

  useEffect(() => {
    if (!item) return;
    if (type === "gate") {
      resetGate({
        type: item.type || "student",
        personName: item.personName || "",
        contactNo: item.contactNo || "",
        vehicleNumber: item.vehicleNumber || "",
        purpose: item.purpose || "",
        isLateEntry: item.isLateEntry || false,
        lateEntryReason: item.lateEntryReason || "",
      });
    } else if (type === "visitor") {
      resetVisitor({
        visitorName: item.visitorName || "",
        contactNo: item.contactNo || "",
        email: item.email || "",
        purpose: item.purpose || "",
        vehicleNumber: item.vehicleNumber || "",
      });
    } else {
      resetPatrol({
        location: item.location || "",
        status: item.status || "active",
        notes: item.notes || "",
      });
    }
  }, [item, type, resetGate, resetVisitor, resetPatrol]);

  const onSubmitGate = (values: GateEntryFormValues) => {
    if (!item) return;
    updateGateMutation.mutate({ id: item.id, payload: values });
  };

  const onSubmitVisitor = (values: VisitorPassFormValues) => {
    if (!item) return;
    updateVisitorMutation.mutate({ id: item.id, payload: values });
  };

  const onSubmitPatrol = (values: PatrolLogFormValues) => {
    if (!item) return;
    updatePatrolMutation.mutate({ id: item.id, payload: values });
  };

  const handleDelete = () => {
    if (!item) return;
    if (!confirm("Delete this record?")) return;
    if (type === "gate") deleteGateMutation.mutate(item.id);
    else if (type === "visitor") deleteVisitorMutation.mutate(item.id);
    else deletePatrolMutation.mutate(item.id);
  };

  const gateTypeWatch = watchGate?.("type");

  const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const selectClass = "w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const labelClass = "text-xs font-semibold text-slate-500";
  const errorClass = "text-[10px] text-red-500 font-semibold block";
  const detailLabelClass = "text-xs font-semibold text-slate-400 uppercase block mb-1";

  const titleMap: Record<string, string> = { gate: "Gate Entry Details", visitor: "Visitor Log Details", patrol: "Patrol Log Details" };

  if (!item) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Record not found.</p>
        <Link href="/security" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Security</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/security" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-[#2563EB]" />
            {titleMap[type]}
          </h1>
        </div>
        {isGuardOrAdmin && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => { setIsEditing(false); if (type === "gate") resetGate(); else if (type === "visitor") resetVisitor(); else resetPatrol(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
            <button onClick={handleDelete} className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{titleMap[type]}</span>
        </div>

        {type === "gate" && isEditing && (
          <form onSubmit={handleSubmitGate(onSubmitGate)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Transit Category</label>
                <select {...registerGate("type")} className={selectClass}>
                  <option value="student">Student Curfew Gate</option>
                  <option value="visitor">Unscheduled Visitor</option>
                  <option value="vehicle">Utility/Service Vehicle</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Transit Name</label>
                <input type="text" {...registerGate("personName")} className={inputClass} />
                {gateErrors.personName && <span className={errorClass}>{gateErrors.personName.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Contact Number</label>
                <input type="text" {...registerGate("contactNo")} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Vehicle Number</label>
                <input type="text" {...registerGate("vehicleNumber")} className={`${inputClass} font-mono uppercase`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Purpose</label>
              <input type="text" {...registerGate("purpose")} className={inputClass} />
              {gateErrors.purpose && <span className={errorClass}>{gateErrors.purpose.message}</span>}
            </div>
            {gateTypeWatch === "student" && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isLateEntry" {...registerGate("isLateEntry")} className="w-4 h-4 rounded border-[#c3c6d7] text-[#2563EB] focus:ring-[#2563EB]/15 cursor-pointer" />
                  <label htmlFor="isLateEntry" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">Flag as Late/Curfew Entry</label>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">Late Entry Reason</label>
                  <input type="text" {...registerGate("lateEntryReason")} className={`${inputClass} h-9 text-xs`} />
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateGateMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Entry
              </button>
            </div>
          </form>
        )}

        {type === "gate" && !isEditing && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={detailLabelClass}>Type</label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.type === "student" ? "bg-blue-50 text-blue-700" : item.type === "visitor" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"
                }`}>{item.type}</span>
              </div>
              <div>
                <label className={detailLabelClass}>Person Name</label>
                <p className="text-sm font-semibold text-slate-800">{item.personName}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Contact</label>
                <p className="text-sm font-mono text-slate-600">{item.contactNo || "N/A"}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Vehicle</label>
                <p className="text-sm font-mono text-slate-600">{item.vehicleNumber || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <label className={detailLabelClass}>Purpose</label>
                <p className="text-sm text-slate-600">{item.purpose}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Entry Time</label>
                <p className="text-sm font-mono text-slate-600">{new Date(item.entryTime).toLocaleString()}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Curfew Flag</label>
                {item.isLateEntry ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 border border-red-100 rounded">LATE: {item.lateEntryReason}</span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold">On-time</span>
                )}
              </div>
            </div>
          </div>
        )}

        {type === "visitor" && isEditing && (
          <form onSubmit={handleSubmitVisitor(onSubmitVisitor)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Visitor Name</label>
                <input type="text" {...registerVisitor("visitorName")} className={inputClass} />
                {visitorErrors.visitorName && <span className={errorClass}>{visitorErrors.visitorName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Contact Number</label>
                <input type="text" {...registerVisitor("contactNo")} className={`${inputClass} font-mono`} />
                {visitorErrors.contactNo && <span className={errorClass}>{visitorErrors.contactNo.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Email (Optional)</label>
                <input type="email" {...registerVisitor("email")} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Vehicle Number (Optional)</label>
                <input type="text" {...registerVisitor("vehicleNumber")} className={`${inputClass} font-mono uppercase`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Purpose</label>
              <textarea {...registerVisitor("purpose")} className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
              {visitorErrors.purpose && <span className={errorClass}>{visitorErrors.purpose.message}</span>}
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateVisitorMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Visitor Log
              </button>
            </div>
          </form>
        )}

        {type === "visitor" && !isEditing && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={detailLabelClass}>Visitor Name</label>
                <p className="text-sm font-semibold text-slate-800">{item.visitorName}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Contact</label>
                <p className="text-sm font-mono text-slate-600">{item.contactNo}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Email</label>
                <p className="text-sm text-slate-600">{item.email || "—"}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Vehicle</label>
                <p className="text-sm font-mono text-slate-600">{item.vehicleNumber || "Walk-in"}</p>
              </div>
              <div className="col-span-2">
                <label className={detailLabelClass}>Purpose</label>
                <p className="text-sm text-slate-600">{item.purpose}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Entry Time</label>
                <p className="text-sm font-mono text-slate-600">{new Date(item.entryTime).toLocaleString()}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Exit Time</label>
                <p className="text-sm font-mono text-slate-600">{item.exitTime ? new Date(item.exitTime).toLocaleString() : "Still Inside"}</p>
              </div>
            </div>
          </div>
        )}

        {type === "patrol" && isEditing && (
          <form onSubmit={handleSubmitPatrol(onSubmitPatrol)} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>Location</label>
              <input type="text" {...registerPatrol("location")} className={inputClass} />
              {patrolErrors.location && <span className={errorClass}>{patrolErrors.location.message}</span>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Status</label>
              <select {...registerPatrol("status")} className={selectClass}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Notes (Optional)</label>
              <textarea {...registerPatrol("notes")} className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updatePatrolMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Patrol Log
              </button>
            </div>
          </form>
        )}

        {type === "patrol" && !isEditing && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={detailLabelClass}>Location</label>
                <p className="text-sm font-semibold text-slate-800">{item.location}</p>
              </div>
              <div>
                <label className={detailLabelClass}>Status</label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>{item.status}</span>
              </div>
              <div>
                <label className={detailLabelClass}>Timestamp</label>
                <p className="text-sm font-mono text-slate-600">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <label className={detailLabelClass}>Notes</label>
                <p className="text-sm text-slate-600">{item.notes || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
