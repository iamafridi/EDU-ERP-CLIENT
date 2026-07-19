"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Pill, Plus, CheckCircle2, ArrowLeft, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const drugRowSchema = zod.object({
  drugId: zod.string().min(1, "Select a drug"),
  dosage: zod.string().min(1, "Dosage is required"),
  duration: zod.string().min(1, "Duration is required"),
  instructions: zod.string().optional(),
});

const prescriptionSchema = zod.object({
  patientId: zod.string().min(1, "Patient ID is required"),
  doctorId: zod.string().min(1, "Doctor ID is required"),
  date: zod.string().min(10, "Date is required"),
  drugs: zod.array(drugRowSchema).min(1, "Add at least one drug"),
  notes: zod.string().optional(),
});

type PrescriptionFormValues = zod.infer<typeof prescriptionSchema>;

export default function NewPrescriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctor = user?.staffSubRole === "doctor";

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: api.getDrugs,
  });

  if (!isDoctor && !roleIs("domain-admin", "super-admin")) {
    router.push("/pharmacy");
    return null;
  }

  const createPrxMutation = useMutation({
    mutationFn: (payload: PrescriptionFormValues) =>
      api.createPrescription({
        patientId: payload.patientId,
        doctorId: payload.doctorId || user?.id || "",
        drugs: payload.drugs,
        date: payload.date,
        notes: payload.notes || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setSuccessMsg("Prescription created.");
      setTimeout(() => router.push("/pharmacy"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      doctorId: user?.id || "",
      date: new Date().toISOString().split("T")[0],
      drugs: [{ drugId: "", dosage: "", duration: "", instructions: "" }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drugs",
  });

  const onSubmit = (values: PrescriptionFormValues) => {
    createPrxMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/pharmacy" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="text-[#2563EB]" />
            New Prescription
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new drug prescription.</p>
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Patient ID</label>
              <input type="text" {...register("patientId")} placeholder="e.g. PAT-001"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
              {errors.patientId && <span className="text-[10px] text-red-500 font-semibold block">{errors.patientId.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Doctor ID</label>
              <input type="text" {...register("doctorId")} placeholder="e.g. DR-001"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
              {errors.doctorId && <span className="text-[10px] text-red-500 font-semibold block">{errors.doctorId.message}</span>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input type="date" {...register("date")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
            {errors.date && <span className="text-[10px] text-red-500 font-semibold block">{errors.date.message}</span>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500">Drugs</label>
              <button type="button" onClick={() => append({ drugId: "", dosage: "", duration: "", instructions: "" })}
                className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">+ Add Drug</button>
            </div>
            {errors.drugs && <span className="text-[10px] text-red-500 font-semibold block">{errors.drugs.message || errors.drugs.root?.message}</span>}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {fields.map((field, idx) => (
                <div key={field.id} className="p-3 bg-slate-50 border border-[#e1e2ed] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Drug #{idx + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="text-[10px] text-red-500 hover:underline cursor-pointer flex items-center gap-1"><Trash2 size={10} /> Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select {...register(`drugs.${idx}.drugId`)} className="h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] w-full">
                        <option value="">Select Drug</option>
                        {(drugs as any[]).map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                      {errors.drugs?.[idx]?.drugId && <span className="text-[9px] text-red-500">{errors.drugs[idx]?.drugId?.message}</span>}
                    </div>
                    <input type="text" {...register(`drugs.${idx}.dosage`)} placeholder="Dosage"
                      className="h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" {...register(`drugs.${idx}.duration`)} placeholder="Duration (e.g. 7 days)"
                      className="h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                    <input type="text" {...register(`drugs.${idx}.instructions`)} placeholder="Instructions"
                      className="h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Notes</label>
            <textarea {...register("notes")} rows={2}
              className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link href="/pharmacy"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={createPrxMutation.isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <Plus size={14} /> Create Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
