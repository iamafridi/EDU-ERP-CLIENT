"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { ClipboardList, ArrowLeft, Pencil, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
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
  "w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all font-mono";
const selectClass =
  "w-full h-10 px-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all";
const textareaClass =
  "w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all";
const labelClass = "text-xs font-semibold text-slate-500";
const errorClass = "text-[10px] text-red-500 mt-0.5";

export default function LogbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isAdminOrHod = roleIs("domain-admin", "super-admin");

  const { data: procedures = [] } = useQuery({
    queryKey: ["clinicalProcedures"],
    queryFn: api.getClinicalProcedures,
  });

  const { data: logEntries = [] } = useQuery({
    queryKey: ["logEntries"],
    queryFn: api.getLogEntries,
  });

  const allItems = [
    ...procedures.map((p: any) => ({ ...p, _type: "procedure" })),
    ...logEntries.map((e: any) => ({ ...e, _type: "log-entry" })),
  ];

  const item = allItems.find((i: any) => i.id === params.id);

  const procForm = useForm<ProcedureForm>({
    resolver: zodResolver(procedureSchema),
  });

  const entryForm = useForm<LogEntryForm>({
    resolver: zodResolver(logEntrySchema),
  });

  useEffect(() => {
    if (item) {
      if (item._type === "procedure") {
        procForm.reset({
          code: item.code || "",
          name: item.name || "",
          category: item.category || "medical",
          minimumRequired: item.minimumRequired ?? 1,
          description: item.description || "",
        });
      } else {
        entryForm.reset({
          student: item.student || "",
          procedure: item.procedure || "",
          patientAge: item.patientAge ?? 25,
          patientGender: item.patientGender || "Male",
          diagnosis: item.diagnosis || "",
          date: item.date || "",
          supervisor: item.supervisor || "",
          competency: item.competency || "observed",
          notes: item.notes || "",
        });
      }
    }
  }, [item, procForm, entryForm]);

  const updateProcMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateClinicalProcedure(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicalProcedures"] });
      setSuccessMsg("Procedure updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteProcMutation = useMutation({
    mutationFn: api.deleteClinicalProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicalProcedures"] });
      router.push("/logbook");
    },
  });

  const signOffMutation = useMutation({
    mutationFn: api.signOffLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      setSuccessMsg("Entry signed off.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: api.deleteLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logEntries"] });
      router.push("/logbook");
    },
  });

  const handleUpdateProc = (data: ProcedureForm) => {
    if (!item || item._type !== "procedure") return;
    updateProcMutation.mutate({ id: item.id, payload: data });
  };

  const handleDelete = () => {
    if (!item) return;
    if (confirm("Delete this item?")) {
      if (item._type === "procedure") {
        deleteProcMutation.mutate(item.id);
      } else {
        deleteEntryMutation.mutate(item.id);
      }
    }
  };

  if (!item) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Item not found.</p>
        <Link href="/logbook" className="text-xs text-gold hover:underline mt-2 inline-block">Back to Logbook</Link>
      </div>
    );
  }

  const isProcedure = item._type === "procedure";

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/logbook" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-gold" />
            {isProcedure ? "Procedure Details" : "Log Entry Details"}
          </h1>
        </div>
        <div className="flex gap-2">
          {isProcedure && isAdminOrHod && !isEditing && (
            <button onClick={() => setIsEditing(true)}
              className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
              <Pencil size={14} /> Edit
            </button>
          )}
          {isProcedure && isAdminOrHod && isEditing && (
            <button onClick={() => { setIsEditing(false); procForm.reset(); }}
              className="h-10 px-4 bg-white border border-border text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
              Cancel
            </button>
          )}
          {!isProcedure && !item.supervisorSignOff && isAdminOrHod && (
            <button onClick={() => signOffMutation.mutate(item.id)}
              className="h-10 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200">
              <ShieldCheck size={14} /> Sign Off
            </button>
          )}
          <button onClick={handleDelete}
            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
            <Trash2 size={14} /> Delete
          </button>
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
        <div className="p-4 border-b border-border bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isProcedure ? "Procedure Information" : "Entry Information"}
          </span>
        </div>

        {isProcedure ? (
          isEditing ? (
            <form onSubmit={procForm.handleSubmit(handleUpdateProc)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Code</label>
                  <input type="text" {...procForm.register("code")} className={inputClass} />
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
                <input type="text" {...procForm.register("name")} className={inputClass} />
                {procForm.formState.errors.name && <p className={errorClass}>{procForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Category</label>
                <select {...procForm.register("category")} className={selectClass}>
                  {CATEGORIES.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Description</label>
                <textarea {...procForm.register("description")} rows={2} className={textareaClass} />
              </div>
              <div className="flex justify-end pt-4 border-t border-border">
                <button type="submit" disabled={updateProcMutation.isPending}
                  className="h-10 px-4 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Pencil size={14} /> Update Procedure
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Code</label>
                  <p className="text-sm font-mono font-bold text-gold">{item.code}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Min Required</label>
                  <p className="text-sm font-mono font-bold text-slate-600">{item.minimumRequired}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Name</label>
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Category</label>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold capitalize">{item.category}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Description</label>
                <p className="text-sm text-slate-600">{item.description || "\u2014"}</p>
              </div>
            </div>
          )
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Student</label>
                <p className="text-sm font-semibold text-slate-800">{item.studentName || item.student}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Procedure</label>
                <p className="text-sm font-semibold text-slate-700">{item.procedureName || item.procedure}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Patient</label>
                <p className="text-sm text-slate-600">{item.patientAge}y / {item.patientGender}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Date</label>
                <p className="text-sm font-mono text-slate-600">{item.date}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Diagnosis</label>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-bold">{item.diagnosis}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Supervisor</label>
                <p className="text-sm font-semibold text-slate-700">{item.supervisor}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Competency</label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.competency === "competent" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                  item.competency === "performed" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                  item.competency === "assisted" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                  "bg-slate-50 text-slate-600 border border-slate-200"
                }`}>{item.competency}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Sign Off</label>
                {item.supervisorSignOff ? (
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><CheckCircle2 size={14} /> Signed</span>
                ) : (
                  <span className="text-slate-400 text-xs">Pending</span>
                )}
              </div>
            </div>
            {item.notes && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
                <p className="text-sm text-slate-600">{item.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
