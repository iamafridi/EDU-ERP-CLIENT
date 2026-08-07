"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Calendar, Plus, CheckCircle2, Stethoscope, FileText, Trash2, Pencil } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

const STATUS_BADGES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  "checked-in": "bg-amber-50 text-amber-700 border-amber-100",
  consulted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-slate-50 text-slate-400 border-slate-200",
};

export default function OPDPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"appointments" | "visits">("appointments");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isDoctor = user?.staffSubRole === "doctor";
  const isReceptionist = user?.staffSubRole === "receptionist" || roleIs("domain-admin", "super-admin");

  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ["opdAppointments"],
    queryFn: api.getOPDAppointments,
  });

  const { data: visits = [], isLoading: loadingVisits } = useQuery({
    queryKey: ["opdVisits"],
    queryFn: api.getOPDVisits,
  });

  const filteredAppointments = searchTerm
    ? appointments.filter((a: any) =>
        (a.patientName || a.patientId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()))
    : appointments;

  const filteredVisits = searchTerm
    ? visits.filter((v: any) =>
        (v.patientName || v.patientId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()))
    : visits;

  const visibleAppointments = user?.role === "student"
    ? filteredAppointments.filter((a: any) => a.patientId === user.id || a.patientName === user.name)
    : filteredAppointments;

  const visibleVisits = user?.role === "student"
    ? filteredVisits.filter((v: any) => v.patientId === user.id || v.patientName === user.name)
    : filteredVisits;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateAppointmentStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Status updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteApptMutation = useMutation({
    mutationFn: api.deleteOPDAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Appointment deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: api.deleteOPDVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      setSuccessMsg("Visit deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-gold" />
            OPD Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage outpatient appointments, consultations, and patient visits.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "appointments" && isReceptionist && (
            <Link href="/opd/new" className="h-9 px-3 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sm">
              <Plus size={14} /> New Appointment
            </Link>
          )}
          {activeTab === "visits" && isDoctor && (
            <Link href="/opd/new" className="h-9 px-3 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sm">
              <Plus size={14} /> Record Visit
            </Link>
          )}
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /><span>{successMsg}</span>
        </motion.div>
      )}

      <div className="flex border-b border-border gap-2">
        <button onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "appointments" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <Calendar size={14} className="inline mr-1" /> Appointments
        </button>
        <button onClick={() => setActiveTab("visits")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "visits" ? "border-gold text-gold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <FileText size={14} className="inline mr-1" /> Visit Records
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {activeTab === "appointments" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={16} /> OPD Appointments
              </span>
              <input type="text" placeholder="Search patient or complaint..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 px-3 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-48 font-mono" />
            </div>
            {loadingAppts ? <TableSkeleton rows={5} cols={6} /> : visibleAppointments.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No appointments found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Doctor</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Time</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Complaint</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      {isReceptionist && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {visibleAppointments.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/opd/${a.id}`} className="font-semibold text-slate-700 hover:text-gold transition-colors">
                            {a.patientName || a.patientId}
                          </Link>
                        </td>
                        <td className="p-3 text-slate-600">{a.doctorName || a.doctorId}</td>
                        <td className="p-3 font-mono text-slate-500">{a.appointmentDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-semibold">{a.timeSlot}</span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{a.chiefComplaint}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_BADGES[a.status] || STATUS_BADGES.scheduled}`}>{a.status}</span>
                        </td>
                        {isReceptionist && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {a.status === "scheduled" && (
                                <button onClick={() => updateStatusMutation.mutate({ id: a.id, payload: { status: "checked-in" } })}
                                  className="h-7 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-amber-200">
                                  Check In
                                </button>
                              )}
                              {a.status === "checked-in" && (
                                <button onClick={() => updateStatusMutation.mutate({ id: a.id, payload: { status: "consulted" } })}
                                  className="h-7 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] transition-colors cursor-pointer border border-emerald-200">
                                  Complete
                                </button>
                              )}
                              <Link href={`/opd/${a.id}`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors"
                                title="Edit appointment">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Cancel this appointment?")) deleteApptMutation.mutate(a.id); }}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={13} />
                              </button>
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
        )}

        {activeTab === "visits" && (
          <div>
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={16} /> Consultation Records
              </span>
              <input type="text" placeholder="Search patient or diagnosis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 px-3 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/15 focus:border-gold transition-all w-48 font-mono" />
            </div>
            {loadingVisits ? <TableSkeleton rows={5} cols={6} /> : visibleVisits.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No visit records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border">
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Patient</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Doctor</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Symptoms</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Diagnosis</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Prescription</th>
                      <th className="p-3 text-xs font-bold text-slate-400 uppercase">Follow Up</th>
                      {isDoctor && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e2ed]">
                    {visibleVisits.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 text-xs">
                        <td className="p-3">
                          <Link href={`/opd/${v.id}`} className="font-semibold text-slate-700 hover:text-gold transition-colors">
                            {v.patientName || v.patientId}
                          </Link>
                        </td>
                        <td className="p-3 text-slate-600">{v.doctorName || v.doctorId}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{v.symptoms}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700">{v.diagnosis}</span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{v.prescription || "\u2014"}</td>
                        <td className="p-3 font-mono text-slate-500">{v.followUpDate || "\u2014"}</td>
                        {isDoctor && (
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/opd/${v.id}`}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-gold transition-colors">
                                <Pencil size={13} />
                              </Link>
                              <button onClick={() => { if (confirm("Delete this visit?")) deleteVisitMutation.mutate(v.id); }}
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={13} />
                              </button>
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
        )}
      </div>
    </div>
  );
}
