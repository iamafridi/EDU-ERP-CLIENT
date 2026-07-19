"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Beaker, ArrowLeft, Pencil, Trash2, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";

export default function LabRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditingResult, setIsEditingResult] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [newResult, setNewResult] = useState({ testId: "", resultValue: "", normalRange: "", remarks: "", technicianId: "", resultDate: "" });

  const isLabTech = user?.staffSubRole === "lab-technician" || roleIs("domain-admin", "super-admin");

  const { data: requests = [] } = useQuery({
    queryKey: ["labRequests"],
    queryFn: api.getLabRequests,
  });

  const request = requests.find((r: any) => r.id === params.id);

  const { data: results = [] } = useQuery({
    queryKey: ["labResults", params.id],
    queryFn: () => api.getLabResultsByRequest(params.id as string),
    enabled: !!params.id,
  });

  const deleteRequestMutation = useMutation({
    mutationFn: api.deleteLabRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labRequests"] });
      router.push("/laboratory");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateLabRequestStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labRequests"] });
      setSuccessMsg("Status updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createResultMutation = useMutation({
    mutationFn: api.createLabResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labResults"] });
      queryClient.invalidateQueries({ queryKey: ["labRequests"] });
      setSuccessMsg("Result recorded.");
      setNewResult({ testId: "", resultValue: "", normalRange: "", remarks: "", technicianId: "", resultDate: "" });
      setIsEditingResult(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateResultMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateLabResult(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labResults"] });
      setSuccessMsg("Result updated.");
      setIsEditingResult(null);
      setNewResult({ testId: "", resultValue: "", normalRange: "", remarks: "", technicianId: "", resultDate: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteResultMutation = useMutation({
    mutationFn: api.deleteLabResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labResults"] });
      setSuccessMsg("Result deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleSaveResult = () => {
    if (isEditingResult === "new") {
      createResultMutation.mutate({ ...newResult, requestId: params.id });
    } else if (isEditingResult) {
      updateResultMutation.mutate({ id: isEditingResult, payload: newResult });
    }
  };

  const startEditResult = (result?: any) => {
    if (result) {
      setIsEditingResult(result.id);
      setNewResult({
        testId: result.testId || "",
        resultValue: result.resultValue || "",
        normalRange: result.normalRange || "",
        remarks: result.remarks || "",
        technicianId: result.technicianId || "",
        resultDate: result.resultDate || "",
      });
    } else {
      setIsEditingResult("new");
      setNewResult({ testId: "", resultValue: "", normalRange: "", remarks: "", technicianId: user?.id || "", resultDate: new Date().toISOString().split("T")[0] });
    }
  };

  const handleDeleteRequest = () => {
    if (confirm("Delete this lab request and all its results?")) {
      deleteRequestMutation.mutate(params.id as string);
    }
  };

  if (!request) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Request not found.</p>
        <Link href="/laboratory" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Laboratory</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/laboratory" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Beaker className="text-[#2563EB]" />
            Lab Request Details
          </h1>
        </div>
        <button onClick={handleDeleteRequest}
          className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Request Information</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
            request.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
            request.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-100" :
            request.status === "collected" ? "bg-amber-50 text-amber-700 border-amber-100" :
            request.status === "cancelled" ? "bg-red-50 text-red-700 border-red-100" :
            "bg-slate-50 text-slate-600 border-slate-200"
          }`}>{request.status}</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Patient</label>
              <p className="text-sm font-semibold text-slate-800">{request.patientName || request.patientId}</p>
              <span className="text-[10px] text-slate-400 font-mono">{request.patientId}</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Doctor</label>
              <p className="text-sm font-semibold text-slate-800">{request.doctorName || request.doctorId}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Date</label>
              <p className="text-sm font-mono text-slate-600">{request.requestDate}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Request ID</label>
              <p className="text-sm font-mono text-slate-600">{request.id}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Tests</label>
            <div className="flex flex-wrap gap-1">
              {(request.tests || []).map((test: any, i: number) => (
                <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-semibold">
                  {typeof test === "string" ? test : test.name || test.code || test}
                </span>
              ))}
            </div>
          </div>
          {request.notes && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Notes</label>
              <p className="text-sm text-slate-600">{request.notes}</p>
            </div>
          )}

          {isLabTech && (
            <div className="flex gap-2 pt-3 border-t border-[#e1e2ed]">
              {request.status === "pending" && (
                <button onClick={() => updateStatusMutation.mutate({ id: request.id, payload: { status: "collected" } })}
                  className="h-8 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded text-xs transition-colors cursor-pointer border border-amber-200">Collect</button>
              )}
              {request.status === "collected" && (
                <button onClick={() => updateStatusMutation.mutate({ id: request.id, payload: { status: "processing" } })}
                  className="h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-xs transition-colors cursor-pointer border border-blue-200">Process</button>
              )}
              {request.status === "processing" && (
                <button onClick={() => updateStatusMutation.mutate({ id: request.id, payload: { status: "completed" } })}
                  className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-xs transition-colors cursor-pointer border border-emerald-200">Complete</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Results</span>
          {isLabTech && (
            <button onClick={() => startEditResult()}
              className="h-8 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5">
              <Plus size={14} /> Add Result
            </button>
          )}
        </div>

        {isEditingResult && (
          <div className="p-4 bg-slate-50 border-b border-[#e1e2ed] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Test ID</label>
                <input type="text" value={newResult.testId} onChange={(e) => setNewResult((p) => ({ ...p, testId: e.target.value }))}
                  placeholder="e.g. LAB-TST-001"
                  className="w-full h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Result Value</label>
                <input type="text" value={newResult.resultValue} onChange={(e) => setNewResult((p) => ({ ...p, resultValue: e.target.value }))}
                  placeholder="e.g. 11.5"
                  className="w-full h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Normal Range</label>
                <input type="text" value={newResult.normalRange} onChange={(e) => setNewResult((p) => ({ ...p, normalRange: e.target.value }))}
                  placeholder="e.g. 4.5-11.0"
                  className="w-full h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                <input type="date" value={newResult.resultDate} onChange={(e) => setNewResult((p) => ({ ...p, resultDate: e.target.value }))}
                  className="w-full h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Remarks</label>
              <input type="text" value={newResult.remarks} onChange={(e) => setNewResult((p) => ({ ...p, remarks: e.target.value }))}
                placeholder="Optional remarks"
                className="w-full h-8 px-2 bg-white border border-[#c3c6d7] rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditingResult(null)} className="h-8 px-3 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded text-xs hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSaveResult} className="h-8 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded text-xs transition-colors flex items-center gap-1">
                <CheckCircle2 size={12} /> Save
              </button>
            </div>
          </div>
        )}

        {results.length === 0 && !isEditingResult ? (
          <p className="p-12 text-center text-xs text-slate-400">No results recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Test</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Result</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Normal Range</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Remarks</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                  {isLabTech && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {results.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3 font-semibold text-slate-700">{r.testName || r.testId}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-700">{r.resultValue}</span>
                    </td>
                    <td className="p-3 text-slate-500">{r.normalRange}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{r.remarks || "\u2014"}</td>
                    <td className="p-3 font-mono text-slate-500">{r.resultDate}</td>
                    {isLabTech && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditResult(r)} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => { if (confirm("Delete this result?")) deleteResultMutation.mutate(r.id); }} className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
