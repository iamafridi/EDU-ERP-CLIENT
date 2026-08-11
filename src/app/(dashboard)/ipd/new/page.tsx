"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Bed, CheckCircle2, ArrowLeft, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const WARDS = ["general", "semi-private", "private", "icu", "nicu", "picu", "emergency", "isolation"];

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

const inputClass = "w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all font-mono";
const textareaClass = "w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all";
const labelClass = "text-xs font-semibold text-slate-500";
const errorClass = "text-[10px] text-red-500 mt-0.5";

export default function NewIPDPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctorOrNurse = user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse" || roleIs("domain-admin", "super-admin");

  if (!isDoctorOrNurse) {
    router.push("/ipd");
    return null;
  }

  const admitForm = useForm<AdmitFormData>({
    resolver: zodResolver(admitSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      ward: "general",
      bedNumber: "",
      admissionDate: "",
      diagnosis: "",
      notes: "",
    },
  });

  const createAdmissionMutation = useMutation({
    mutationFn: api.createIPDAdmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipdAdmissions"] });
      setSuccessMsg("Patient admitted.");
      setTimeout(() => router.push("/ipd"), 1000);
    },
  });

  const handleAdmit = (data: AdmitFormData) => {
    createAdmissionMutation.mutate(data);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/ipd" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bed className="text-gold" />
            Admit Patient
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new inpatient admission record.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm max-w-lg">
        <form onSubmit={admitForm.handleSubmit(handleAdmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Patient ID</label>
              <input type="text" {...admitForm.register("patientId")} placeholder="e.g. PAT-001" className={inputClass} />
              {admitForm.formState.errors.patientId && <p className={errorClass}>{admitForm.formState.errors.patientId.message}</p>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Doctor ID</label>
              <input type="text" {...admitForm.register("doctorId")} placeholder="e.g. DR-001" className={inputClass} />
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
              <input type="text" {...admitForm.register("bedNumber")} placeholder="e.g. ICU-03" className={inputClass} />
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
              <input type="text" {...admitForm.register("diagnosis")} placeholder="e.g. Pneumonia" className={inputClass} />
              {admitForm.formState.errors.diagnosis && <p className={errorClass}>{admitForm.formState.errors.diagnosis.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Notes</label>
            <textarea {...admitForm.register("notes")} rows={2} className={textareaClass} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/ipd" className="h-10 px-4 bg-white border border-border text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
            <button type="submit" disabled={createAdmissionMutation.isPending}
              className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <Plus size={14} /> Admit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
