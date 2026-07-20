"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { AlertOctagon, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const grievanceFormSchema = zod.object({
  subject: zod.string().min(5, "Subject must be at least 5 characters"),
  description: zod.string().min(10, "Please describe your grievance in more detail"),
  category: zod.enum(["ragging", "harassment", "academic", "hostel", "other"]),
  priority: zod.enum(["low", "medium", "high", "urgent"]),
  isAnonymous: zod.boolean(),
});

type GrievanceFormValues = zod.infer<typeof grievanceFormSchema>;

export default function NewGrievancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const submitGrievanceMutation = useMutation({
    mutationFn: api.submitGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      setSuccessMsg("Your grievance has been submitted successfully.");
      setTimeout(() => router.push("/grievances"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GrievanceFormValues>({
    resolver: zodResolver(grievanceFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "hostel",
      priority: "medium",
      isAnonymous: false,
    },
  });

  const onSubmit = (values: GrievanceFormValues) => {
    submitGrievanceMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/grievances" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertOctagon className="text-[#2563EB]" />
            File New Grievance
          </h1>
          <p className="text-xs text-slate-400 mt-1">Submit a formal complaint or report an incident.</p>
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
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grievance Details</span>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Subject / Heading</label>
            <input
              type="text"
              {...register("subject")}
              placeholder="Brief summary of the concern"
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
            />
            {errors.subject && (
              <span className="text-[10px] text-red-500 font-semibold block">{errors.subject.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Category</label>
              <select
                {...register("category")}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              >
                <option value="hostel">Hostel Accommodation</option>
                <option value="academic">Academic / Curriculum</option>
                <option value="harassment">Harassment Alert</option>
                <option value="ragging">Ragging Incident</option>
                <option value="other">Other Concerns</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Priority</label>
              <select
                {...register("priority")}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAnonymous"
              {...register("isAnonymous")}
              className="w-4 h-4 rounded border-[#c3c6d7] text-[#2563EB] focus:ring-[#2563EB]/15 cursor-pointer"
            />
            <label htmlFor="isAnonymous" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
              File Anonymously
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Detailed Description</label>
            <textarea
              {...register("description")}
              placeholder="Provide full context, dates, and locations if applicable..."
              className="w-full h-32 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
            />
            {errors.description && (
              <span className="text-[10px] text-red-500 font-semibold block">{errors.description.message}</span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link
              href="/grievances"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitGrievanceMutation.isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={14} />
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
