"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Stethoscope, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const visitSchema = zod.object({
  studentName: zod.string().min(2, "Student name is required"),
  studentId: zod.string().min(3, "Student ID is required"),
  symptoms: zod.string().min(3, "Symptoms are required"),
  diagnosis: zod.string().min(3, "Diagnosis is required"),
  visitDate: zod.string().min(10, "Date is required"),
  prescribedMeds: zod.string().optional(),
});

type VisitFormValues = zod.infer<typeof visitSchema>;

export default function NewHealthVisitPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse";

  if (!isStaff) {
    router.push("/health-center");
    return null;
  }

  const createVisitMutation = useMutation({
    mutationFn: (payload: VisitFormValues) =>
      api.createHealthVisit({
        studentName: payload.studentName,
        studentId: payload.studentId,
        reason: payload.symptoms,
        diagnosis: payload.diagnosis,
        visitDate: payload.visitDate,
        prescribedMeds: payload.prescribedMeds || "",
        doctorName: user?.name || "Dr. Attending",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-visits"] });
      setSuccessMsg("Health visit record created successfully.");
      setTimeout(() => router.push("/health-center"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      studentName: "",
      studentId: "",
      symptoms: "",
      diagnosis: "",
      visitDate: new Date().toISOString().split("T")[0],
      prescribedMeds: "",
    },
  });

  const onSubmit = (values: VisitFormValues) => {
    createVisitMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/health-center" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-[#2563EB]" />
            Record Health Visit
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new student health visit record.</p>
        </div>
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Student Name</label>
              <input type="text" {...register("studentName")} placeholder="Full name"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              {errors.studentName && <span className="text-[10px] text-red-500 font-semibold block">{errors.studentName.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Student ID</label>
              <input type="text" {...register("studentId")} placeholder="e.g. STU-001"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
              {errors.studentId && <span className="text-[10px] text-red-500 font-semibold block">{errors.studentId.message}</span>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Symptoms</label>
            <textarea {...register("symptoms")} placeholder="Describe symptoms presented..."
              className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
            {errors.symptoms && <span className="text-[10px] text-red-500 font-semibold block">{errors.symptoms.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Diagnosis</label>
              <input type="text" {...register("diagnosis")} placeholder="Preliminary diagnosis"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              {errors.diagnosis && <span className="text-[10px] text-red-500 font-semibold block">{errors.diagnosis.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Visit Date</label>
              <input type="date" {...register("visitDate")}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              {errors.visitDate && <span className="text-[10px] text-red-500 font-semibold block">{errors.visitDate.message}</span>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Prescribed Medications</label>
            <textarea {...register("prescribedMeds")} placeholder="List prescribed medications..."
              className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link href="/health-center"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={createVisitMutation.isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <Stethoscope size={14} />
              Record Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
