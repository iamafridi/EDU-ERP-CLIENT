"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Shield, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
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

export default function NewSecurityEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "visitor" ? "visitor" : searchParams.get("type") === "patrol" ? "patrol" : "gate";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<"gate" | "visitor" | "patrol">(initialType);
  const [successMsg, setSuccessMsg] = useState("");

  const isGuardOrAdmin = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  if (!isGuardOrAdmin) {
    router.push("/security");
    return null;
  }

  const createGateEntryMutation = useMutation({
    mutationFn: api.createGateEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      setSuccessMsg("Gate entry check-in logged successfully.");
      setTimeout(() => router.push("/security"), 1500);
    },
  });

  const createVisitorLogMutation = useMutation({
    mutationFn: api.createVisitorLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor pass pre-approval registered.");
      setTimeout(() => router.push("/security"), 1500);
    },
  });

  const createPatrolLogMutation = useMutation({
    mutationFn: api.createPatrolLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrolLogs"] });
      setSuccessMsg("Patrol log created successfully.");
      setTimeout(() => router.push("/security"), 1500);
    },
  });

  const {
    register: registerGate,
    handleSubmit: handleSubmitGate,
    watch: watchGate,
    formState: { errors: gateErrors },
  } = useForm<GateEntryFormValues>({
    resolver: zodResolver(gateEntrySchema),
    defaultValues: {
      type: "student",
      personName: "",
      contactNo: "",
      vehicleNumber: "",
      purpose: "",
      isLateEntry: false,
      lateEntryReason: "",
    },
  });

  const {
    register: registerVisitor,
    handleSubmit: handleSubmitVisitor,
    formState: { errors: visitorErrors },
  } = useForm<VisitorPassFormValues>({
    resolver: zodResolver(visitorPassSchema),
    defaultValues: {
      visitorName: "",
      contactNo: "",
      email: "",
      purpose: "",
      vehicleNumber: "",
    },
  });

  const {
    register: registerPatrol,
    handleSubmit: handleSubmitPatrol,
    formState: { errors: patrolErrors },
  } = useForm<PatrolLogFormValues>({
    resolver: zodResolver(patrolLogSchema),
    defaultValues: {
      location: "",
      status: "active",
      notes: "",
    },
  });

  const onSubmitGateEntry = (values: GateEntryFormValues) => {
    createGateEntryMutation.mutate({ ...values, entryTime: new Date().toISOString() });
  };

  const onSubmitVisitorPass = (values: VisitorPassFormValues) => {
    createVisitorLogMutation.mutate(values);
  };

  const onSubmitPatrolLog = (values: PatrolLogFormValues) => {
    createPatrolLogMutation.mutate(values);
  };

  const gateType = watchGate("type");

  const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const selectClass = "w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const labelClass = "text-xs font-semibold text-slate-500";
  const errorClass = "text-[10px] text-red-500 font-semibold block";

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/security" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-[#2563EB]" />
            New Security Entry
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new gate entry, visitor pass, or patrol log.</p>
        </div>
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Entry Type</label>
          <div className="flex gap-2">
            {([
              { key: "gate" as const, label: "Gate Entry" },
              { key: "visitor" as const, label: "Visitor Log" },
              { key: "patrol" as const, label: "Patrol Log" },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedType(opt.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedType === opt.key
                    ? "bg-[#2563EB] text-white"
                    : "bg-white border border-[#c3c6d7] text-slate-500 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {selectedType === "gate" && (
          <form onSubmit={handleSubmitGate(onSubmitGateEntry)} className="p-6 space-y-4">
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
                <input type="text" {...registerGate("personName")} placeholder="Individual / Driver name" className={inputClass} />
                {gateErrors.personName && <span className={errorClass}>{gateErrors.personName.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Contact Number</label>
                <input type="text" {...registerGate("contactNo")} placeholder="+92 300-0000000" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Vehicle registration No (Optional)</label>
                <input type="text" {...registerGate("vehicleNumber")} placeholder="e.g. LEA-1234" className={`${inputClass} font-mono uppercase`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Purpose of entry</label>
              <input type="text" {...registerGate("purpose")} placeholder="e.g. Returning from leave / food delivery dispatch" className={inputClass} />
              {gateErrors.purpose && <span className={errorClass}>{gateErrors.purpose.message}</span>}
            </div>
            {gateType === "student" && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isLateEntry" {...registerGate("isLateEntry")} className="w-4 h-4 rounded border-[#c3c6d7] text-[#2563EB] focus:ring-[#2563EB]/15 cursor-pointer" />
                  <label htmlFor="isLateEntry" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">Flag as Late/Curfew Entry</label>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">Late Entry Reason</label>
                  <input type="text" {...registerGate("lateEntryReason")} placeholder="Reason for arriving after curfew hour..." className={`${inputClass} h-9 text-xs`} />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/security" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createGateEntryMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Register Entry
              </button>
            </div>
          </form>
        )}

        {selectedType === "visitor" && (
          <form onSubmit={handleSubmitVisitor(onSubmitVisitorPass)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Visitor Name</label>
                <input type="text" {...registerVisitor("visitorName")} placeholder="Guest full name" className={inputClass} />
                {visitorErrors.visitorName && <span className={errorClass}>{visitorErrors.visitorName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Contact Number</label>
                <input type="text" {...registerVisitor("contactNo")} placeholder="Mobile number" className={`${inputClass} font-mono`} />
                {visitorErrors.contactNo && <span className={errorClass}>{visitorErrors.contactNo.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Email Address (Optional)</label>
                <input type="email" {...registerVisitor("email")} placeholder="guest@email.com" className={inputClass} />
                {visitorErrors.email && <span className={errorClass}>{visitorErrors.email.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Vehicle Number (Optional)</label>
                <input type="text" {...registerVisitor("vehicleNumber")} placeholder="e.g. LEA-5678" className={`${inputClass} font-mono uppercase`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Purpose of Visit</label>
              <textarea {...registerVisitor("purpose")} placeholder="Details of the host visit, delivery, or meeting..." className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
              {visitorErrors.purpose && <span className={errorClass}>{visitorErrors.purpose.message}</span>}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/security" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createVisitorLogMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Shield size={14} /> Issue QR Pass
              </button>
            </div>
          </form>
        )}

        {selectedType === "patrol" && (
          <form onSubmit={handleSubmitPatrol(onSubmitPatrolLog)} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className={labelClass}>Location</label>
              <input type="text" {...registerPatrol("location")} placeholder="e.g. North Wing, Block C, Main Gate" className={inputClass} />
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
              <textarea {...registerPatrol("notes")} placeholder="Any observations or remarks during the patrol..." className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/security" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createPatrolLogMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Log Patrol
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
