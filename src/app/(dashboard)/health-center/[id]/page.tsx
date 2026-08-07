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

export default function HealthVisitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse";

  const { data: visits = [] } = useQuery({
    queryKey: ["health-visits"],
    queryFn: async () => {
      const raw = await api.getHealthVisits();
      return raw.map((v: any) => ({
        ...v,
        studentId: v.studentId ?? "",
        doctorName: v.doctorName ?? "",
        symptoms: v.symptoms ?? v.reason ?? "",
        diagnosis: v.diagnosis ?? "",
        prescribedMeds: v.prescribedMeds ?? v.prescription ?? "",
      }));
    },
  });

  const visit = visits.find((v: any) => v.id === params.id);

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateHealthVisit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-visits"] });
      setSuccessMsg("Visit record updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: api.deleteHealthVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-visits"] });
      router.push("/health-center");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
  });

  useEffect(() => {
    if (visit) {
      reset({
        studentName: visit.studentName || "",
        studentId: visit.studentId || "",
        symptoms: visit.symptoms || "",
        diagnosis: visit.diagnosis || "",
        visitDate: visit.visitDate || "",
        prescribedMeds: visit.prescribedMeds || "",
      });
    }
  }, [visit, reset]);

  const onSubmit = (values: VisitFormValues) => {
    if (!visit) return;
    updateVisitMutation.mutate({
      id: visit.id,
      payload: {
        studentName: values.studentName,
        studentId: values.studentId,
        reason: values.symptoms,
        diagnosis: values.diagnosis,
        visitDate: values.visitDate,
        prescribedMeds: values.prescribedMeds || "",
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this health visit record?")) {
      deleteVisitMutation.mutate(visit?.id);
    }
  };

  if (!visit) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Visit not found.</p>
        <Link href="/health-center" className="text-xs text-gold hover:underline mt-2 inline-block">Back to Health Center</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/health-center" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-gold" />
            Health Visit Details
          </h1>
        </div>
        {isStaff && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => { setIsEditing(false); reset(); }}
                className="h-10 px-4 bg-white border border-border text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
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

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-border bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visit Information</span>
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Student Name</label>
                <input type="text" {...register("studentName")}
                  className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all" />
                {errors.studentName && <span className="text-[10px] text-red-500 font-semibold block">{errors.studentName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Student ID</label>
                <input type="text" {...register("studentId")}
                  className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all font-mono" />
                {errors.studentId && <span className="text-[10px] text-red-500 font-semibold block">{errors.studentId.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Symptoms</label>
              <textarea {...register("symptoms")}
                className="w-full h-20 px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all resize-none" />
              {errors.symptoms && <span className="text-[10px] text-red-500 font-semibold block">{errors.symptoms.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Diagnosis</label>
                <input type="text" {...register("diagnosis")}
                  className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all" />
                {errors.diagnosis && <span className="text-[10px] text-red-500 font-semibold block">{errors.diagnosis.message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Visit Date</label>
                <input type="date" {...register("visitDate")}
                  className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all" />
                {errors.visitDate && <span className="text-[10px] text-red-500 font-semibold block">{errors.visitDate.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Prescribed Medications</label>
              <textarea {...register("prescribedMeds")}
                className="w-full h-20 px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all resize-none" />
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <button type="submit" disabled={updateVisitMutation.isPending}
                className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Visit
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Student Name</label>
                <p className="text-sm font-semibold text-slate-800">{visit.studentName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Student ID</label>
                <p className="text-sm font-mono text-slate-600">{visit.studentId}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Doctor</label>
                <p className="text-sm font-semibold text-slate-800">{visit.doctorName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Visit Date</label>
                <p className="text-sm font-mono text-slate-600">{visit.visitDate}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Symptoms</label>
              <p className="text-sm text-slate-600">{visit.symptoms}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Diagnosis</label>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-bold">{visit.diagnosis}</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Prescribed Medications</label>
              <p className="text-sm text-slate-600">{visit.prescribedMeds || "\u2014"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
