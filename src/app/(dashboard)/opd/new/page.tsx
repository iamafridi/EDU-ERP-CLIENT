"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Stethoscope, CheckCircle2, ArrowLeft, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const TIME_SLOTS = [
  "09:00-09:15","09:15-09:30","09:30-09:45","09:45-10:00",
  "10:00-10:15","10:15-10:30","10:30-10:45","10:45-11:00",
  "11:00-11:15","11:15-11:30","11:30-11:45","11:45-12:00",
  "14:00-14:15","14:15-14:30","14:30-14:45","14:45-15:00",
  "15:00-15:15","15:15-15:30","15:30-15:45","15:45-16:00",
];

const apptSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  notes: z.string(),
});

type ApptForm = z.infer<typeof apptSchema>;

const visitSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  investigations: z.string(),
  prescription: z.string(),
  followUpDate: z.string(),
  notes: z.string(),
});

type VisitForm = z.infer<typeof visitSchema>;

const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono";
const textareaClass = "w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
const labelClass = "text-xs font-semibold text-slate-500";
const errorClass = "text-[10px] text-red-500 mt-0.5";

export default function NewOPDPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [mode, setMode] = useState<"appointment" | "visit">("appointment");

  const isReceptionist = user?.staffSubRole === "receptionist" || roleIs("domain-admin", "super-admin");
  const isDoctor = user?.staffSubRole === "doctor";

  if (!isReceptionist && !isDoctor) {
    router.push("/opd");
    return null;
  }

  const apptForm = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentDate: "",
      timeSlot: "09:00-09:15",
      chiefComplaint: "",
      notes: "",
    },
  });

  const visitForm = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      appointmentId: "",
      patientId: "",
      doctorId: "",
      symptoms: "",
      diagnosis: "",
      investigations: "",
      prescription: "",
      followUpDate: "",
      notes: "",
    },
  });

  const createApptMutation = useMutation({
    mutationFn: api.createOPDAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Appointment created.");
      setTimeout(() => router.push("/opd"), 1000);
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: api.createOPDVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Visit recorded.");
      setTimeout(() => router.push("/opd"), 1000);
    },
  });

  const handleCreateAppt = (data: ApptForm) => {
    createApptMutation.mutate(data);
  };

  const handleCreateVisit = (data: VisitForm) => {
    createVisitMutation.mutate(data);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/opd" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-[#2563EB]" />
            {mode === "appointment" ? "New OPD Appointment" : "Record OPD Visit"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "appointment" ? "Schedule a new outpatient appointment." : "Record a new consultation visit."}
          </p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="flex gap-2">
        {isReceptionist && (
          <button onClick={() => setMode("appointment")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${mode === "appointment" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            Appointment
          </button>
        )}
        {isDoctor && (
          <button onClick={() => setMode("visit")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${mode === "visit" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            Visit Record
          </button>
        )}
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        {mode === "appointment" && (
          <form onSubmit={apptForm.handleSubmit(handleCreateAppt)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Patient ID</label>
                <input type="text" {...apptForm.register("patientId")} placeholder="e.g. PAT-001" className={inputClass} />
                {apptForm.formState.errors.patientId && <p className={errorClass}>{apptForm.formState.errors.patientId.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Doctor ID</label>
                <input type="text" {...apptForm.register("doctorId")} placeholder="e.g. DR-001" className={inputClass} />
                {apptForm.formState.errors.doctorId && <p className={errorClass}>{apptForm.formState.errors.doctorId.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Date</label>
                <input type="date" {...apptForm.register("appointmentDate")} className={inputClass} />
                {apptForm.formState.errors.appointmentDate && <p className={errorClass}>{apptForm.formState.errors.appointmentDate.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Time Slot</label>
                <select {...apptForm.register("timeSlot")} className={inputClass}>
                  {TIME_SLOTS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Chief Complaint</label>
              <textarea {...apptForm.register("chiefComplaint")} placeholder="e.g. Fever and cough for 3 days" rows={2} className={textareaClass} />
              {apptForm.formState.errors.chiefComplaint && <p className={errorClass}>{apptForm.formState.errors.chiefComplaint.message}</p>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Notes</label>
              <textarea {...apptForm.register("notes")} rows={2} className={textareaClass} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/opd" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createApptMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Create
              </button>
            </div>
          </form>
        )}

        {mode === "visit" && (
          <form onSubmit={visitForm.handleSubmit(handleCreateVisit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Appointment ID</label>
                <input type="text" {...visitForm.register("appointmentId")} placeholder="e.g. OPD-APPT-001" className={inputClass} />
                {visitForm.formState.errors.appointmentId && <p className={errorClass}>{visitForm.formState.errors.appointmentId.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Patient ID</label>
                <input type="text" {...visitForm.register("patientId")} placeholder="e.g. PAT-001" className={inputClass} />
                {visitForm.formState.errors.patientId && <p className={errorClass}>{visitForm.formState.errors.patientId.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Doctor ID</label>
              <input type="text" {...visitForm.register("doctorId")} placeholder="e.g. DR-001" className={inputClass} />
              {visitForm.formState.errors.doctorId && <p className={errorClass}>{visitForm.formState.errors.doctorId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Symptoms</label>
                <textarea {...visitForm.register("symptoms")} placeholder="e.g. Fever, cough, SOB" rows={2} className={textareaClass} />
                {visitForm.formState.errors.symptoms && <p className={errorClass}>{visitForm.formState.errors.symptoms.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Diagnosis</label>
                <input type="text" {...visitForm.register("diagnosis")} placeholder="e.g. LRTI" className={inputClass} />
                {visitForm.formState.errors.diagnosis && <p className={errorClass}>{visitForm.formState.errors.diagnosis.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Investigations</label>
              <input type="text" {...visitForm.register("investigations")} placeholder="e.g. CBC, Chest X-ray" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Prescription</label>
                <textarea {...visitForm.register("prescription")} rows={2} className={textareaClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Follow Up Date</label>
                <input type="date" {...visitForm.register("followUpDate")} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/opd" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createVisitMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
