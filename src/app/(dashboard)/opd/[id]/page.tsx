"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Stethoscope, ArrowLeft, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

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

const TIME_SLOTS = [
  "09:00-09:15","09:15-09:30","09:30-09:45","09:45-10:00",
  "10:00-10:15","10:15-10:30","10:30-10:45","10:45-11:00",
  "11:00-11:15","11:15-11:30","11:30-11:45","11:45-12:00",
  "14:00-14:15","14:15-14:30","14:30-14:45","14:45-15:00",
  "15:00-15:15","15:15-15:30","15:30-15:45","15:45-16:00",
];

const STATUS_BADGES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  "checked-in": "bg-amber-50 text-amber-700 border-amber-100",
  consulted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-slate-50 text-slate-400 border-slate-200",
};

const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono";
const textareaClass = "w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
const labelClass = "text-xs font-semibold text-slate-500";
const errorClass = "text-[10px] text-red-500 mt-0.5";

export default function OPDDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctor = user?.staffSubRole === "doctor";
  const isReceptionist = user?.staffSubRole === "receptionist" || roleIs("domain-admin", "super-admin");

  const { data: appointments = [] } = useQuery({
    queryKey: ["opdAppointments"],
    queryFn: api.getOPDAppointments,
  });

  const { data: visits = [] } = useQuery({
    queryKey: ["opdVisits"],
    queryFn: api.getOPDVisits,
  });

  const id = params.id as string;
  const isVisit = id.startsWith("OPD-VIS") || id.startsWith("VIS");
  const record = isVisit
    ? visits.find((v: any) => v.id === id)
    : appointments.find((a: any) => a.id === id);

  const apptForm = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
  });

  const visitForm = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
  });

  useEffect(() => {
    if (record && !isVisit) {
      apptForm.reset({
        patientId: record.patientId || "",
        doctorId: record.doctorId || "",
        appointmentDate: record.appointmentDate || "",
        timeSlot: record.timeSlot || "09:00-09:15",
        chiefComplaint: record.chiefComplaint || "",
        notes: record.notes || "",
      });
    }
    if (record && isVisit) {
      visitForm.reset({
        appointmentId: record.appointmentId || "",
        patientId: record.patientId || "",
        doctorId: record.doctorId || "",
        symptoms: record.symptoms || "",
        diagnosis: record.diagnosis || "",
        investigations: record.investigations || "",
        prescription: record.prescription || "",
        followUpDate: record.followUpDate || "",
        notes: record.notes || "",
      });
    }
  }, [record, isVisit, apptForm, visitForm]);

  const updateApptMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateAppointmentStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Appointment updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateOPDVisit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      setSuccessMsg("Visit updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteApptMutation = useMutation({
    mutationFn: api.deleteOPDAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      router.push("/opd");
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: api.deleteOPDVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      router.push("/opd");
    },
  });

  const onSubmitAppt = (data: ApptForm) => {
    updateApptMutation.mutate({ id, payload: data });
  };

  const onSubmitVisit = (data: VisitForm) => {
    updateVisitMutation.mutate({ id, payload: data });
  };

  const handleDelete = () => {
    if (confirm("Delete this record?")) {
      if (isVisit) {
        deleteVisitMutation.mutate(id);
      } else {
        deleteApptMutation.mutate(id);
      }
    }
  };

  if (!record) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Record not found.</p>
        <Link href="/opd" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to OPD</Link>
      </div>
    );
  }

  const canEdit = isVisit ? isDoctor : isReceptionist;

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/opd" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-[#2563EB]" />
            {isVisit ? "Visit Details" : "Appointment Details"}
          </h1>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => { setIsEditing(false); isVisit ? visitForm.reset() : apptForm.reset(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
            <button onClick={handleDelete}
              className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isVisit ? "Visit Information" : "Appointment Information"}
          </span>
        </div>

        {!isVisit && (
          isEditing ? (
            <form onSubmit={apptForm.handleSubmit(onSubmitAppt)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Patient ID</label>
                  <input type="text" {...apptForm.register("patientId")} className={inputClass} />
                  {apptForm.formState.errors.patientId && <p className={errorClass}>{apptForm.formState.errors.patientId.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Doctor ID</label>
                  <input type="text" {...apptForm.register("doctorId")} className={inputClass} />
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
                <textarea {...apptForm.register("chiefComplaint")} rows={2} className={textareaClass} />
                {apptForm.formState.errors.chiefComplaint && <p className={errorClass}>{apptForm.formState.errors.chiefComplaint.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Notes</label>
                <textarea {...apptForm.register("notes")} rows={2} className={textareaClass} />
              </div>
              <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
                <button type="submit" disabled={updateApptMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Pencil size={14} /> Update
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Patient</label>
                  <p className="text-sm font-semibold text-slate-800">{record.patientName || record.patientId}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Doctor</label>
                  <p className="text-sm font-semibold text-slate-800">{record.doctorName || record.doctorId}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Date</label>
                  <p className="text-sm font-mono text-slate-600">{record.appointmentDate}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Time Slot</label>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold">{record.timeSlot}</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Status</label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_BADGES[record.status] || STATUS_BADGES.scheduled}`}>{record.status}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Chief Complaint</label>
                <p className="text-sm text-slate-600">{record.chiefComplaint}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
                <p className="text-sm text-slate-600">{record.notes || "\u2014"}</p>
              </div>
            </div>
          )
        )}

        {isVisit && (
          isEditing ? (
            <form onSubmit={visitForm.handleSubmit(onSubmitVisit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Appointment ID</label>
                  <input type="text" {...visitForm.register("appointmentId")} className={inputClass} />
                  {visitForm.formState.errors.appointmentId && <p className={errorClass}>{visitForm.formState.errors.appointmentId.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Patient ID</label>
                  <input type="text" {...visitForm.register("patientId")} className={inputClass} />
                  {visitForm.formState.errors.patientId && <p className={errorClass}>{visitForm.formState.errors.patientId.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Doctor ID</label>
                <input type="text" {...visitForm.register("doctorId")} className={inputClass} />
                {visitForm.formState.errors.doctorId && <p className={errorClass}>{visitForm.formState.errors.doctorId.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Symptoms</label>
                  <textarea {...visitForm.register("symptoms")} rows={2} className={textareaClass} />
                  {visitForm.formState.errors.symptoms && <p className={errorClass}>{visitForm.formState.errors.symptoms.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Diagnosis</label>
                  <input type="text" {...visitForm.register("diagnosis")} className={inputClass} />
                  {visitForm.formState.errors.diagnosis && <p className={errorClass}>{visitForm.formState.errors.diagnosis.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Investigations</label>
                <input type="text" {...visitForm.register("investigations")} className={inputClass} />
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
              <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
                <button type="submit" disabled={updateVisitMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Pencil size={14} /> Update
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Patient</label>
                  <p className="text-sm font-semibold text-slate-800">{record.patientName || record.patientId}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Doctor</label>
                  <p className="text-sm font-semibold text-slate-800">{record.doctorName || record.doctorId}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Symptoms</label>
                <p className="text-sm text-slate-600">{record.symptoms}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Diagnosis</label>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-bold">{record.diagnosis}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Investigations</label>
                  <p className="text-sm text-slate-600">{record.investigations || "\u2014"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Follow Up</label>
                  <p className="text-sm font-mono text-slate-600">{record.followUpDate || "\u2014"}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Prescription</label>
                <p className="text-sm text-slate-600">{record.prescription || "\u2014"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
                <p className="text-sm text-slate-600">{record.notes || "\u2014"}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
