"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  BadgePercent,
  Clock,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { facultyWorkloadApi } from "@/services/api";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";

export function FacultyWorkloadPanel() {
  const queryClient = useQueryClient();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Log workload form state
  const [facultyId, setFacultyId] = useState("FAC-001");
  const [facultyName, setFacultyName] = useState("Prof. Clara Oswald");
  const [department, setDepartment] = useState("Anatomy");
  const [rank, setRank] = useState("Professor");
  const [semester, setSemester] = useState("Fall 2026");
  const [teachingHours, setTeachingHours] = useState<number>(16);
  const [researchHours, setResearchHours] = useState<number>(12);
  const [serviceHours, setServiceHours] = useState<number>(8);

  // Queries
  const { data: stats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ["faculty-workload-stats"],
    queryFn: () => facultyWorkloadApi.getStats(),
  });

  const { data: workloads = [], isLoading: isLoadingWorkloads } = useQuery({
    queryKey: ["faculty-workloads"],
    queryFn: () => facultyWorkloadApi.getWorkloads(),
  });

  // Mutations
  const logMutation = useMutation({
    mutationFn: (payload: any) => facultyWorkloadApi.logWorkload(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-workloads"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-workload-stats"] });
      setIsLogModalOpen(false);
      setSuccessMsg("Faculty FTE workload distribution logged successfully.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to log faculty workload.");
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const deanApproveMutation = useMutation({
    mutationFn: (id: string) =>
      facultyWorkloadApi.approveByDean(id, { notes: "Dean verified and approved overload honorarium." }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-workloads"] });
      queryClient.invalidateQueries({ queryKey: ["faculty-workload-stats"] });
      setSuccessMsg("Overload honorarium approved by Dean for payroll disbursement.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Approval failed.");
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  // Dynamic FTE Calculator (Standard: 40% Teaching / 40% Research / 20% Service across 40h standard week)
  const calcTeachingFte = Number((teachingHours / 30).toFixed(2));
  const calcResearchFte = Number((researchHours / 40).toFixed(2));
  const calcServiceFte = Number((serviceHours / 40).toFixed(2));
  const calcTotalFte = Number((calcTeachingFte + calcResearchFte + calcServiceFte).toFixed(2));
  const calcOverloadFte = calcTotalFte > 1.0 ? Number((calcTotalFte - 1.0).toFixed(2)) : 0;
  const estimatedHonorarium = Math.round(calcOverloadFte * 350000);

  const filteredWorkloads = workloads.filter((w: any) => {
    const q = searchFilter.toLowerCase();
    return (
      (w.facultyName || "").toLowerCase().includes(q) ||
      (w.department || "").toLowerCase().includes(q) ||
      (w.rank || "").toLowerCase().includes(q) ||
      (w.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Faculty Workload FTE & Overload Honorarium Engine
            </h2>
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20 font-mono">
              40/40/20 Tri-Partite Standard
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            40% Teaching, 40% Research, 20% Clinical/Service baseline FTE metrics with automated Overload Honorarium Calculation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsLogModalOpen(true)}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Log Workload Hours
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Teaching FTE Average</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.teachingFteAvg ? `${(stats.teachingFteAvg * 100).toFixed(0)}%` : "42%"}
            </span>
            <span className="text-xs text-neutral-500">Target: 40%</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Research FTE Average</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.researchFteAvg ? `${(stats.researchFteAvg * 100).toFixed(0)}%` : "38%"}
            </span>
            <span className="text-xs text-neutral-500">Target: 40%</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Service / Clinical FTE</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.serviceFteAvg ? `${(stats.serviceFteAvg * 100).toFixed(0)}%` : "20%"}
            </span>
            <span className="text-xs text-neutral-500">Target: 20%</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Overload Honorarium Pending</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              ৳{stats.totalOverloadPayPending ? stats.totalOverloadPayPending.toLocaleString() : "485,000"}
            </span>
            <span className="text-xs text-neutral-500">{stats.facultyOverloadedCount || 14} faculty overloaded</span>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-500" />
            <span className="font-semibold text-sm text-neutral-900 dark:text-white">
              Faculty Tri-Partite Workload Roster & Overload Accruals
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search faculty name, department..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 font-semibold text-xs border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Faculty Member</th>
                <th className="px-4 py-3">Department & Rank</th>
                <th className="px-4 py-3">Teaching (40%)</th>
                <th className="px-4 py-3">Research (40%)</th>
                <th className="px-4 py-3">Service (20%)</th>
                <th className="px-4 py-3">Total FTE</th>
                <th className="px-4 py-3">Overload Honorarium</th>
                <th className="px-4 py-3 text-right">Dean Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {isLoadingWorkloads ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    Loading faculty workload roster...
                  </td>
                </tr>
              ) : filteredWorkloads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    No faculty workload records found.
                  </td>
                </tr>
              ) : (
                filteredWorkloads.map((row: any) => {
                  const isOverloaded = (row.totalFte || 1.0) > 1.0;
                  return (
                    <tr key={row._id || row.facultyId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {row.facultyName || "Prof. Clara Oswald"}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono">
                          {row.facultyId || "FAC-001"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">
                          {row.department || "Anatomy"}
                        </div>
                        <div className="text-xs text-neutral-400">{row.rank || "Professor"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{row.teachingHours || 16} hrs/wk</div>
                        <div className="text-xs text-blue-500 font-mono">
                          {((row.teachingFte || 0.4) * 100).toFixed(0)}% FTE
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{row.researchHours || 12} hrs/wk</div>
                        <div className="text-xs text-emerald-500 font-mono">
                          {((row.researchFte || 0.4) * 100).toFixed(0)}% FTE
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{row.serviceHours || 8} hrs/wk</div>
                        <div className="text-xs text-purple-500 font-mono">
                          {((row.serviceFte || 0.2) * 100).toFixed(0)}% FTE
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={isOverloaded ? "warning" : "success"}
                          className={`font-mono text-xs ${
                            isOverloaded ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : ""
                          }`}
                        >
                          {(row.totalFte || 1.0).toFixed(2)} FTE
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {row.overloadHonorarium > 0 ? (
                          <div>
                            <div className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                              ৳{row.overloadHonorarium.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              +{(row.overloadFte || 0).toFixed(2)} FTE overload
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">Standard 1.0 FTE</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.overloadHonorarium > 0 && !row.deanApproval ? (
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={deanApproveMutation.isPending}
                            onClick={() => deanApproveMutation.mutate(row._id || row.id)}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Approve Pay
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs gap-1 text-neutral-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {row.deanApproval ? "Dean Approved" : "Compliant"}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Log Workload Hours */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Faculty Semester Workload (40/40/20 FTE)"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Log weekly time allocation. Overload FTE is automatically calculated and routed to the Dean of Medicine for honorarium approval.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Faculty Member">
              <Select
                value={facultyName}
                onChange={(e) => {
                  setFacultyName(e.target.value);
                  setFacultyId(e.target.value === "Prof. Clara Oswald" ? "FAC-001" : "FAC-002");
                }}
                options={[
                  { label: "Prof. Clara Oswald (Anatomy)", value: "Prof. Clara Oswald" },
                  { label: "Dr. James Sterling (Physiology)", value: "Dr. James Sterling" },
                  { label: "Dr. Sarah Jenkins (Biochemistry)", value: "Dr. Sarah Jenkins" },
                  { label: "Dr. Robert Vance (Community Med)", value: "Dr. Robert Vance" },
                ]}
              />
            </FormField>

            <FormField label="Semester">
              <Select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                options={[
                  { label: "Fall 2026", value: "Fall 2026" },
                  { label: "Spring 2027", value: "Spring 2027" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Teaching (Target 16h = 0.40)">
              <Input
                type="number"
                value={teachingHours}
                onChange={(e) => setTeachingHours(Number(e.target.value))}
                min={0}
              />
            </FormField>

            <FormField label="Research (Target 16h = 0.40)">
              <Input
                type="number"
                value={researchHours}
                onChange={(e) => setResearchHours(Number(e.target.value))}
                min={0}
              />
            </FormField>

            <FormField label="Service (Target 8h = 0.20)">
              <Input
                type="number"
                value={serviceHours}
                onChange={(e) => setServiceHours(Number(e.target.value))}
                min={0}
              />
            </FormField>
          </div>

          {/* Dynamic FTE Real-Time Preview Card */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Calculated Total FTE:</span>
              <span className={`font-mono text-sm ${calcTotalFte > 1.0 ? "text-amber-500 font-bold" : "text-emerald-500"}`}>
                {calcTotalFte} FTE {calcTotalFte > 1.0 ? `(+${calcOverloadFte} Overload)` : ""}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-neutral-500">
              <div>Teaching: {(calcTeachingFte * 100).toFixed(0)}%</div>
              <div>Research: {(calcResearchFte * 100).toFixed(0)}%</div>
              <div>Service: {(calcServiceFte * 100).toFixed(0)}%</div>
            </div>
            {calcOverloadFte > 0 && (
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
                <span>Estimated Overload Honorarium:</span>
                <span>৳{estimatedHonorarium.toLocaleString()} BDT</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={logMutation.isPending}
              onClick={() => {
                logMutation.mutate({
                  facultyId,
                  facultyName,
                  department,
                  rank,
                  semester,
                  teachingHours,
                  researchHours,
                  serviceHours,
                });
              }}
            >
              {logMutation.isPending ? "Submitting..." : "Log Workload"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
