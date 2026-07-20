"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Wrench, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const incidentSchema = zod.object({
  title: zod.string().min(5, "Title must be at least 5 characters"),
  description: zod.string().min(10, "Please describe the problem in more detail"),
  severity: zod.enum(["low", "medium", "high", "critical"]),
  location: zod.string().min(3, "Location is required (e.g., Room B-204)"),
  category: zod.string().min(3, "Category is required"),
});

type IncidentFormValues = zod.infer<typeof incidentSchema>;

export default function NewIncidentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const canReport =
    user?.role === "student" || user?.role === "faculty" ||
    roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  if (!canReport) {
    router.push("/incidents");
    return null;
  }

  const createIncidentMutation = useMutation({
    mutationFn: api.createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSuccessMsg("Incident ticket logged successfully.");
      setTimeout(() => router.push("/incidents"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "medium",
      location: "",
      category: "",
    },
  });

  const onSubmit = (values: IncidentFormValues) => {
    createIncidentMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/incidents" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-[#2563EB]" />
            Report Maintenance Incident
          </h1>
          <p className="text-xs text-slate-400 mt-1">Log a new facility issue or maintenance request.</p>
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
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Issue Title</label>
            <input
              type="text"
              {...register("title")}
              placeholder="Short description of the fault"
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
            />
            {errors.title && <span className="text-[10px] text-red-500 font-semibold block">{errors.title.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Category</label>
            <input
              type="text"
              {...register("category")}
              placeholder="e.g. Plumbing, Electrical, HVAC"
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
            />
            {errors.category && <span className="text-[10px] text-red-500 font-semibold block">{errors.category.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Severity Level</label>
              <select
                {...register("severity")}
                className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              >
                <option value="low">Low (Cosmetic/Convenience)</option>
                <option value="medium">Medium (Standard Maintenance)</option>
                <option value="high">High (Urgent cooling/plumbing)</option>
                <option value="critical">Critical (Safety hazard / flooding)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Facility Location</label>
              <input
                type="text"
                {...register("location")}
                placeholder="e.g. Room B-204 Bathroom"
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
              />
              {errors.location && <span className="text-[10px] text-red-500 font-semibold block">{errors.location.message}</span>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Detailed Description</label>
            <textarea
              {...register("description")}
              placeholder="Provide details about the issue to help technicians prepare..."
              className="w-full h-32 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
            />
            {errors.description && <span className="text-[10px] text-red-500 font-semibold block">{errors.description.message}</span>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link
              href="/incidents"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createIncidentMutation.isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Wrench size={14} />
              Log Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
