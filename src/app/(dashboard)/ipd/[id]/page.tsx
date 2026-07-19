"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Bed, ArrowLeft, Pencil, Trash2, CheckCircle2, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const WARDS = ["general", "semi-private", "private", "icu", "nicu", "picu", "emergency", "isolation"];
const DISCHARGE_TYPES = ["regular", "against-medical-advice", "referred", "expired"];

const WARD_BADGES: Record<string, string> = {
  general: "bg-slate-100 text-slate-600 border-slate-200",
  "semi-private": "bg-blue-50 text-blue-700 border-blue-100",
  private: "bg-amber-50 text-amber-700 border-amber-100",
  icu: "bg-red-50 text-red-700 border-red-100",
  nicu: "bg-pink-50 text-pink-700 border-pink-100",
  picu: "bg-purple-50 text-purple-700 border-purple-100",
  emergency: "bg-orange-50 text-orange-700 border-orange-100",
  isolation: "bg-rose-50 text-rose-700 border-rose-100",
};

const admitSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  ward: z.string().min(1, "Ward is required"),
  bedNumber: z.string().min(1, "Bed number is required"),
  admissionDate: z.string().min(1, "Admission date is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string(),
});

type AdmitFormData = z.infer<typeof admitSchema>;

const dischargeSchema = z.object({
  dischargeDate: z.string().min(1, "Discharge date is required"),
  dischargeType: z.string().min(1, "Discharge type is required"),
  dischargeSummary: z.string().min(1, "Discharge summary is required"),
  followUpInstructions: z.string(),
});

type DischargeFormData = z.infer<typeof dischargeSchema>;

const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono";
const textareaClass = "w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
const labelClass = "text-xs font-semibold text-slate-500";
const errorClass = "text-[10px] text-red-500 mt-0.5";

export default function IPDDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctorOrNurse = user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse" || roleIs("domain-admin", "super-admin");
  const id = params.id as string;

  const { data: admissions = [] } = useQuery({
    queryKey: ["ipdAdmissions"],
    queryFn: api.getIPDAdmissions,
  });

  const { data: discharges = [] } = useQuery({
    queryKey: ["ipdDischarges"],
    queryFn: api.getIPDDischarges,
  });

  const admission = admissions.find((a: any) => a.id === id);
  const discharge = discharges.find((d: any) => (d.admissionId?._id || d.admissionId) === id);

  const admitForm = useForm<AdmitFormData>({
    resolver: zodResolver(admitSchema),
  });

  const dischargeForm = useForm<DischargeFormData>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: { dischargeDate: "", dischargeType: "regular", dischargeSummary: "", followUpInstructions: "" },
  });

  useEffect(() => {
    if (admission) {
      admitForm.reset({
        patientId: admission.patientId || "",
        doctorId: admission.doctorId || "",
        ward: admission.ward || "general",
        bedNumber: admission.bedNumber || "",
        admissionDate: admission.admissionDate || "",
        diagnosis: admission.diagnosis || "",
        notes: admission.notes || "",
      });
    }
  }, [admission, admitForm]);

  useEffect(() => {
    if (discharge) {
      dischargeForm.reset({
        dischargeDate: discharge.dischargeDate || "",
        dischargeType: discharge.dischargeType || "regular",
        dischargeSummary: discharge.dischargeSummary || "",
        followUpInstructions: discharge.followUpInstructions || "",
      });
    }
  }, [discharge, dischargeForm]);

  const updateAdmissionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateIPDAdmission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipdAdmissions"] });
      setSuccessMsg("Admission updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteAdmissionMutation = useMutation({
    mutationFn: api.deleteIPDAdmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipdAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["ipdDischarges"] });
      router.push("/ipd");
    },
  });

  const dischargeMutation = useMutation({
    mutationFn: ({ admissionId, payload }: { admissionId: string; payload: any }) => api.dischargePatient(admissionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipdAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["ipdDischarges"] });
      setSuccessMsg("Patient discharged.");
      setShowDischargeForm(false);
      dischargeForm.reset();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateDischargeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateIPDDischarge(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipdDischarges"] });
      setSuccessMsg("Discharge record updated.");
      setShowDischargeForm(false);
      dischargeForm.reset();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const onSubmitAdmit = (data: AdmitFormData) => {
    updateAdmissionMutation.mutate({ id, payload: data });
  };

  const onSubmitDischarge = (data: DischargeFormData) => {
    if (discharge) {
      updateDischargeMutation.mutate({ id: discharge.id, payload: data });
    } else if (admission) {
      dischargeMutation.mutate({ admissionId: id, payload: data });
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this admission?")) {
      deleteAdmissionMutation.mutate(id);
    }
  };

  if (!admission) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Admission not found.</p>
        <Link href="/ipd" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to IPD</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/ipd" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bed className="text-[#2563EB]" />
            Admission Details
          </h1>
        </div>
        {isDoctorOrNurse && (
          <div className="flex gap-2">
            {!isEditing && !showDischargeForm && (
              <button onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            )}
            {isEditing && (
              <button onClick={() => { setIsEditing(false); admitForm.reset(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
            {admission.status === "admitted" && !isEditing && (
              <button onClick={() => { setShowDischargeForm(!showDischargeForm); }}
                className="h-10 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer border border-orange-200">
                <LogOut size={14} /> {discharge ? "Edit Discharge" : "Discharge"}
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admission Information</span>
        </div>
        {isEditing ? (
          <form onSubmit={admitForm.handleSubmit(onSubmitAdmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Patient ID</label>
                <input type="text" {...admitForm.register("patientId")} className={inputClass} />
                {admitForm.formState.errors.patientId && <p className={errorClass}>{admitForm.formState.errors.patientId.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Doctor ID</label>
                <input type="text" {...admitForm.register("doctorId")} className={inputClass} />
                {admitForm.formState.errors.doctorId && <p className={errorClass}>{admitForm.formState.errors.doctorId.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Ward</label>
                <select {...admitForm.register("ward")} className={inputClass}>
                  {WARDS.map((w) => (<option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Bed Number</label>
                <input type="text" {...admitForm.register("bedNumber")} className={inputClass} />
                {admitForm.formState.errors.bedNumber && <p className={errorClass}>{admitForm.formState.errors.bedNumber.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Admission Date</label>
                <input type="date" {...admitForm.register("admissionDate")} className={inputClass} />
                {admitForm.formState.errors.admissionDate && <p className={errorClass}>{admitForm.formState.errors.admissionDate.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Diagnosis</label>
                <input type="text" {...admitForm.register("diagnosis")} className={inputClass} />
                {admitForm.formState.errors.diagnosis && <p className={errorClass}>{admitForm.formState.errors.diagnosis.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Notes</label>
              <textarea {...admitForm.register("notes")} rows={2} className={textareaClass} />
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateAdmissionMutation.isPending}
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
                <p className="text-sm font-semibold text-slate-800">{admission.patientName || admission.patientId}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Doctor</label>
                <p className="text-sm font-semibold text-slate-800">{admission.doctorName || admission.doctorId}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Ward</label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${WARD_BADGES[admission.ward] || WARD_BADGES.general}`}>{admission.ward}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Bed</label>
                <p className="text-sm font-mono font-bold text-slate-600">{admission.bedNumber}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Admitted</label>
                <p className="text-sm font-mono text-slate-600">{admission.admissionDate}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Status</label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  admission.status === "admitted" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  admission.status === "discharged" ? "bg-slate-100 text-slate-500 border-slate-200" :
                  "bg-amber-50 text-amber-700 border-amber-100"
                }`}>{admission.status}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Diagnosis</label>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-bold">{admission.diagnosis}</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
              <p className="text-sm text-slate-600">{admission.notes || "\u2014"}</p>
            </div>
          </div>
        )}
      </div>

      {showDischargeForm && (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {discharge ? "Edit Discharge" : "Discharge Patient"}
            </span>
          </div>
          <form onSubmit={dischargeForm.handleSubmit(onSubmitDischarge)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Discharge Date</label>
                <input type="date" {...dischargeForm.register("dischargeDate")} className={inputClass} />
                {dischargeForm.formState.errors.dischargeDate && <p className={errorClass}>{dischargeForm.formState.errors.dischargeDate.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Type</label>
                <select {...dischargeForm.register("dischargeType")} className={inputClass}>
                  {DISCHARGE_TYPES.map((t) => (<option key={t} value={t}>{t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Discharge Summary</label>
              <textarea {...dischargeForm.register("dischargeSummary")} rows={3} className={textareaClass} />
              {dischargeForm.formState.errors.dischargeSummary && <p className={errorClass}>{dischargeForm.formState.errors.dischargeSummary.message}</p>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Follow Up Instructions</label>
              <textarea {...dischargeForm.register("followUpInstructions")} rows={2} className={textareaClass} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <button type="button" onClick={() => { setShowDischargeForm(false); dischargeForm.reset(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={dischargeMutation.isPending || updateDischargeMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <LogOut size={14} /> {discharge ? "Update" : "Discharge"}
              </button>
            </div>
          </form>
        </div>
      )}

      {discharge && !showDischargeForm && (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discharge Information</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Discharge Date</label>
                <p className="text-sm font-mono text-slate-600">{discharge.dischargeDate}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Type</label>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold capitalize">{discharge.dischargeType?.replace(/-/g, " ")}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Summary</label>
              <p className="text-sm text-slate-600">{discharge.dischargeSummary}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Follow Up Instructions</label>
              <p className="text-sm text-slate-600">{discharge.followUpInstructions || "\u2014"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
