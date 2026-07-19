"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, ArrowLeft, Plus, BookOpen, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const CATEGORIES = ["medical", "surgical", "obgyn", "pediatrics", "orthopedics", "ent", "ophthalmology", "psychiatry", "emergency", "other"];
const COMPETENCIES = ["observed", "assisted", "performed", "competent"];

const procedureSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Procedure name is required"),
  category: z.string().min(1, "Category is required"),
  minimumRequired: z.number().min(1, "Must be at least 1"),
  description: z.string(),
});

type ProcedureForm = z.infer<typeof procedureSchema>;

const logEntrySchema = z.object({
  student: z.string().min(1, "Student ID is required"),
  procedure: z.string().min(1, "Procedure is required"),
  patientAge: z.number().min(0, "Age must be 0 or more").max(150, "Invalid age"),
  patientGender: z.enum(["Male", "Female", "Other"]),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  date: z.string().min(1, "Date is required"),
  supervisor: z.string().min(1, "Supervisor is required"),
  competency: z.enum(["observed", "assisted", "performed", "competent"]),
  notes: z.string(),
});

type LogEntryForm = z.infer<typeof logEntrySchema>;

const inputClass =
  "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono";
const selectClass =
  "w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
const labelClass = "text-xs font-semibold text-slate-500";
const errorClass = "text-[10px] text-red-500 mt-0.5";

export default function NewLogbookEntryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [entryType, setEntryType] = useState<"procedure" | "log-entry" | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: procedures = [] } = useQuery({
    queryKey: ["clinicalProcedures"],
    queryFn: api.getClinicalProcedures,
  });

  const procForm = useForm<ProcedureForm>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "medical",
      minimumRequired: 1,
      description: "",
    },
  });

  const entryForm = useForm<LogEntryForm>({
    resolver: zodResolver(logEntrySchema),
    defaultValues: {
      student: "",
      procedure: "",
      patientAge: 25,
      patientGender: "Male",
      diagnosis: "",
      date: "",
      supervisor: "",
      competency: "observed",
      notes: "",
    },
  });

  const createProcMutation = useMutation({
    mutationFn: api.createClinicalProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicalProcedures"] });
      setSuccessMsg("Procedure created.");
      setTimeout(() => router.push("/logbook"), 1500);
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: api.createLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      setSuccessMsg("Log entry recorded.");
      setTimeout(() => router.push("/logbook"), 1500);
    },
  });

  const handleCreateProc = (data: ProcedureForm) => {
    createProcMutation.mutate(data);
  };

  const handleCreateEntry = (data: LogEntryForm) => {
    createEntryMutation.mutate(data);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/logbook" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-[#2563EB]" />
            New Logbook Entry
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a clinical procedure or log an entry.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /><span>{successMsg}</span>
        </motion.div>
      )}

      {!entryType ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <button onClick={() => setEntryType("procedure")}
            className="bg-white border border-[#e1e2ed] rounded-xl p-6 hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer text-left space-y-3 group">
            <div className="h-10 w-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center group-hover:bg-[#2563EB]/20 transition-colors">
              <BookOpen size={20} className="text-[#2563EB]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Clinical Procedure</h3>
            <p className="text-xs text-slate-400">Add a new procedure to the catalog for students to log against.</p>
          </button>

          <button onClick={() => setEntryType("log-entry")}
            className="bg-white border border-[#e1e2ed] rounded-xl p-6 hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer text-left space-y-3 group">
            <div className="h-10 w-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center group-hover:bg-[#2563EB]/20 transition-colors">
              <User size={20} className="text-[#2563EB]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Log Entry</h3>
            <p className="text-xs text-slate-400">Record a patient encounter or clinical experience for a student.</p>
          </button>
        </div>
      ) : entryType === "procedure" ? (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Add Clinical Procedure</span>
            <button onClick={() => setEntryType(null)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 text-xs cursor-pointer">X</button>
          </div>
          <form onSubmit={procForm.handleSubmit(handleCreateProc)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Code</label>
                <input type="text" {...procForm.register("code")} placeholder="e.g. CVC-I" className={inputClass} />
                {procForm.formState.errors.code && <p className={errorClass}>{procForm.formState.errors.code.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Min Required</label>
                <input type="number" {...procForm.register("minimumRequired", { valueAsNumber: true })} min={1} className={inputClass} />
                {procForm.formState.errors.minimumRequired && <p className={errorClass}>{procForm.formState.errors.minimumRequired.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Procedure Name</label>
              <input type="text" {...procForm.register("name")} placeholder="e.g. Central Venous Catheter Insertion" className={inputClass} />
              {procForm.formState.errors.name && <p className={errorClass}>{procForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Category</label>
              <select {...procForm.register("category")} className={selectClass}>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
              </select>
              {procForm.formState.errors.category && <p className={errorClass}>{procForm.formState.errors.category.message}</p>}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Description</label>
              <textarea {...procForm.register("description")} rows={2} className={textareaClass} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <button type="button" onClick={() => setEntryType(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Back</button>
              <button type="submit" disabled={createProcMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Create Procedure
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
          <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">New Log Entry</span>
            <button onClick={() => setEntryType(null)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 text-xs cursor-pointer">X</button>
          </div>
          <form onSubmit={entryForm.handleSubmit(handleCreateEntry)} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Student ID</label>
                <input type="text" {...entryForm.register("student")} placeholder="e.g. STU-001" className={inputClass} />
                {entryForm.formState.errors.student && <p className={errorClass}>{entryForm.formState.errors.student.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Procedure</label>
                <select {...entryForm.register("procedure")} className={selectClass}>
                  <option value="">Select</option>
                  {procedures.map((p: any) => (<option key={p.id} value={p.id}>{p.code} - {p.name}</option>))}
                </select>
                {entryForm.formState.errors.procedure && <p className={errorClass}>{entryForm.formState.errors.procedure.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Age</label>
                <input type="number" {...entryForm.register("patientAge", { valueAsNumber: true })} min={0} max={150} className={inputClass} />
                {entryForm.formState.errors.patientAge && <p className={errorClass}>{entryForm.formState.errors.patientAge.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Gender</label>
                <select {...entryForm.register("patientGender")} className={selectClass}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Date</label>
                <input type="date" {...entryForm.register("date")} className={inputClass} />
                {entryForm.formState.errors.date && <p className={errorClass}>{entryForm.formState.errors.date.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Diagnosis</label>
              <input type="text" {...entryForm.register("diagnosis")} placeholder="e.g. Septic shock" className={inputClass} />
              {entryForm.formState.errors.diagnosis && <p className={errorClass}>{entryForm.formState.errors.diagnosis.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Supervisor</label>
                <input type="text" {...entryForm.register("supervisor")} placeholder="Faculty ID" className={inputClass} />
                {entryForm.formState.errors.supervisor && <p className={errorClass}>{entryForm.formState.errors.supervisor.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Competency</label>
                <select {...entryForm.register("competency")} className={selectClass}>
                  {COMPETENCIES.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Notes</label>
              <textarea {...entryForm.register("notes")} rows={2} className={textareaClass} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <button type="button" onClick={() => setEntryType(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Back</button>
              <button type="submit" disabled={createEntryMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"><Plus size={14} /> Record Entry</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
