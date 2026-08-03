"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, HeartHandshake, CheckSquare, Plus, CheckCircle2, ShieldAlert, Calendar, Clock, Eye, X } from "lucide-react";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

const counselingSchema = zod.object({
  counselorName: zod.string().min(3, "Counselor name is required"),
  dateTime: zod.string().min(10, "Please select a valid date & time"),
  notes: zod.string().optional(),
});

type CounselingFormValues = zod.infer<typeof counselingSchema>;

export default function ClinicalPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"rotation" | "skills" | "counseling">("rotation");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: rotations = [], isLoading: isLoadingRotations } = useQuery({
    queryKey: ["clinicalRotations"],
    queryFn: api.getClinicalRotations,
  });

  const { data: skillLabs = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["skillLabs"],
    queryFn: api.getSkillLabs,
  });

  const { data: counselingSessions = [], isLoading: isLoadingCounseling } = useQuery({
    queryKey: ["counselingSessions"],
    queryFn: api.getCounselingSessions,
  });

  const bookSessionMutation = useMutation({
    mutationFn: api.createCounselingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselingSessions"] });
      setSuccessMsg("Counseling slot booked successfully.");
      setIsBookModalOpen(false);
      resetCounseling();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const {
    register: registerCounseling,
    handleSubmit: handleSubmitCounseling,
    reset: resetCounseling,
    formState: { errors: counselingErrors },
  } = useForm<CounselingFormValues>({
    resolver: zodResolver(counselingSchema),
    defaultValues: {
      counselorName: "Dr. Sarah Jenkins",
      dateTime: "",
      notes: "",
    },
  });

  const onSubmitCounseling = (values: CounselingFormValues) => {
    bookSessionMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-gold" />
            Clinical Rotations & Health Services
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor hospital rotation rosters, track clinical skill lab checklists, and schedule counseling sessions.
          </p>
        </div>

        {activeTab === "counseling" && (
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-sm"
          >
            <Plus size={16} />
            Book Counselor Appointment
          </button>
        )}
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

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("rotation")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "rotation"
              ? "border-gold text-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Clinical Rotations
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "skills"
              ? "border-gold text-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Skill Lab Checklists
        </button>
        <button
          onClick={() => setActiveTab("counseling")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "counseling"
              ? "border-gold text-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Counseling Desk
        </button>
      </div>

      {/* Viewport */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {activeTab === "rotation" ? (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope size={16} /> Hospital Duty Roster
              </span>
            </div>

            {isLoadingRotations ? (
              <TableSkeleton rows={5} cols={5} />
            ) : rotations.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No clinical rotations assigned.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Department</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Hospital Placement</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Supervisor</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Duty Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {rotations.map((rot: any) => (
                      <tr key={rot.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3 font-semibold text-slate-700">{rot.studentName}</td>
                        <td className="p-3 text-gold font-bold">{rot.department}</td>
                        <td className="p-3 text-slate-500">{rot.hospital}</td>
                        <td className="p-3 text-slate-600 font-medium">{rot.supervisor}</td>
                        <td className="p-3 text-slate-400 font-mono font-semibold">{rot.shift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === "skills" ? (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare size={16} /> Skill Lab Checklists
              </span>
            </div>

            {isLoadingSkills ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 border border-border rounded-xl flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            ) : skillLabs.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No skill checks found.</p>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillLabs.map((skl: any) => (
                  <div
                    key={skl.id}
                    className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                      skl.completed
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-border hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">{skl.topic}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Assigned to: <strong className="text-slate-500">{skl.studentName}</strong>
                      </span>
                      {skl.completed && skl.verifiedBy && (
                        <span className="text-[9px] text-emerald-600 font-bold block">
                          Verified by: {skl.verifiedBy}
                        </span>
                      )}
                    </div>
                    <div className="shrink-0">
                      {skl.completed ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake size={16} /> Mental Health & Counselor Logs
              </span>
            </div>

            {isLoadingCounseling ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 border border-border rounded-xl flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : counselingSessions.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No scheduled sessions found.</p>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {counselingSessions.map((cns: any) => (
                  <div key={cns.id} className="bg-white p-4 border border-border rounded-xl flex items-start gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                      <HeartHandshake size={20} />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700">{cns.counselorName}</span>
                        <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded capitalize">
                          {cns.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Student: {cns.studentName}</p>
                      {cns.notes && <p className="text-[11px] text-slate-400 italic">"{cns.notes}"</p>}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-semibold pt-1">
                        <Calendar size={12} />
                        <span>{new Date(cns.dateTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Counselor Slot Booking Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Book Counseling Slot</span>
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitCounseling(onSubmitCounseling)} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Counselor Specialist</label>
                  <select
                    {...registerCounseling("counselorName")}
                    className="w-full h-10 px-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all"
                  >
                    <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Lead Counselor)</option>
                    <option value="Prof. Arthur Dent">Prof. Arthur Dent (Behavioral Therapist)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Appointment Date & Time</label>
                  <input
                    type="datetime-local"
                    {...registerCounseling("dateTime")}
                    className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all font-mono"
                  />
                  {counselingErrors.dateTime && (
                    <span className="text-[10px] text-red-500 font-semibold block">{counselingErrors.dateTime.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Brief Intake Notes (Optional)</label>
                  <textarea
                    {...registerCounseling("notes")}
                    placeholder="E.g. exam anxiety / sleep guidance..."
                    className="w-full h-20 px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="h-10 px-4 bg-white border border-border text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <HeartHandshake size={14} />
                    Schedule Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
