"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Beaker, Plus, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const CATEGORIES = ["biochemistry", "hematology", "microbiology", "pathology", "immunology", "radiology", "other"];
const SAMPLE_TYPES = ["blood", "urine", "stool", "sputum", "csf", "tissue", "swab", "other"];

const testSchema = zod.object({
  patientId: zod.string().min(1, "Patient ID is required"),
  doctorId: zod.string().min(1, "Doctor ID is required"),
  testId: zod.string().min(1, "Select a test"),
  requestDate: zod.string().min(10, "Date is required"),
  notes: zod.string().optional(),
});

type TestFormValues = zod.infer<typeof testSchema>;

export default function NewLabRequestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctor = user?.staffSubRole === "doctor" || user?.staffSubRole === "nurse";

  const { data: tests = [] } = useQuery({
    queryKey: ["labTests"],
    queryFn: api.getLabTests,
  });

  if (!isDoctor && !roleIs("domain-admin", "super-admin")) {
    router.push("/laboratory");
    return null;
  }

  const createRequestMutation = useMutation({
    mutationFn: (payload: TestFormValues) =>
      api.createLabRequest({
        patientId: payload.patientId,
        doctorId: payload.doctorId || user?.id || "",
        tests: [payload.testId],
        requestDate: payload.requestDate,
        notes: payload.notes || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labRequests"] });
      setSuccessMsg("Request created.");
      setTimeout(() => router.push("/laboratory"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      patientId: "",
      doctorId: user?.id || "",
      testId: "",
      requestDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const onSubmit = (values: TestFormValues) => {
    createRequestMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/laboratory" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Beaker className="text-[#2563EB]" />
            New Lab Request
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new laboratory test request.</p>
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
            <label className="text-xs font-semibold text-slate-500">Select Test</label>
            <select {...register("testId")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono">
              <option value="">Choose a test...</option>
              {tests.map((t: any) => (
                <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
              ))}
            </select>
            {errors.testId && <span className="text-[10px] text-red-500 font-semibold block">{errors.testId.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Request Date</label>
            <input type="date" {...register("requestDate")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
            {errors.requestDate && <span className="text-[10px] text-red-500 font-semibold block">{errors.requestDate.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Notes</label>
            <textarea {...register("notes")} rows={2}
              className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link href="/laboratory"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={createRequestMutation.isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <Plus size={14} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
