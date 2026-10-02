"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  Plus,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  MessageSquare,
  ShieldAlert,
  HeartHandshake,
  Activity,
  UserCheck,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  SearchInput,
  Button,
  Badge,
  ActionMenu,
  CustomDropdown,
  ProgressBar,
  Modal,
} from "@/components/ui";

interface EarlyWarningStudent {
  id: string;
  studentName: string;
  studentId: string;
  department: string;
  cgpa: number;
  attendancePct: number;
  consecutiveAbsences: number;
  failedPrereqs: number;
  riskLevel: "CRITICAL" | "MODERATE" | "WATCHLIST";
  assignedCounselor: string;
  status: "OPEN" | "COUNSELING_IN_PROGRESS" | "RESOLVED";
}

const mockEarlyWarningCases: EarlyWarningStudent[] = [
  {
    id: "EWS-2026-01",
    studentName: "Shafiqur Rahman",
    studentId: "CSE-2023-0199",
    department: "Computer Science & Engineering",
    cgpa: 1.84,
    attendancePct: 58.0,
    consecutiveAbsences: 5,
    failedPrereqs: 2,
    riskLevel: "CRITICAL",
    assignedCounselor: "Dr. Farhana Ahmed (Student Welfare Dean)",
    status: "OPEN",
  },
  {
    id: "EWS-2026-02",
    studentName: "Sabrina Mostofa",
    studentId: "EEE-2024-0045",
    department: "Electrical & Electronic Engineering",
    cgpa: 2.12,
    attendancePct: 69.5,
    consecutiveAbsences: 3,
    failedPrereqs: 1,
    riskLevel: "MODERATE",
    assignedCounselor: "Prof. Tanvir Hasan (Academic Advisor)",
    status: "COUNSELING_IN_PROGRESS",
  },
  {
    id: "EWS-2026-03",
    studentName: "Kamrul Islam",
    studentId: "BBA-2024-0112",
    department: "School of Business",
    cgpa: 2.35,
    attendancePct: 72.0,
    consecutiveAbsences: 2,
    failedPrereqs: 0,
    riskLevel: "WATCHLIST",
    assignedCounselor: "Dr. Nadia Karim (Counseling Center)",
    status: "RESOLVED",
  },
];

export default function GrievancePortal() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"grievances" | "ews" | "hotline">("grievances");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEwsModal, setSelectedEwsModal] = useState<EarlyWarningStudent | null>(null);

  const isAdmin =
    roleIs("domain-admin", "super-admin") || user?.staffSubRole === "warden";

  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ["grievances"],
    queryFn: api.getGrievances,
  });

  const deleteGrievanceMutation = useMutation({
    mutationFn: api.deleteGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      setSuccessMsg("Grievance has been deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const resolvedCount = grievances.filter((g: any) => g.status === "resolved" || g.status === "closed").length;
  const resolutionRate = grievances.length > 0 ? Math.round((resolvedCount / grievances.length) * 100) : 0;

  const filteredGrievances = grievances.filter((grv: any) => {
    const matchesStatus = selectedStatus && selectedStatus !== "all" ? grv.status === selectedStatus : true;
    const term = searchTerm.toLowerCase();
    const matchesKeyword =
      !term ||
      grv.subject?.toLowerCase().includes(term) ||
      grv.description?.toLowerCase().includes(term) ||
      grv.category?.toLowerCase().includes(term) ||
      grv.studentName?.toLowerCase().includes(term);

    return matchesStatus && matchesKeyword;
  });

  const statusVariantMap: Record<string, "warning" | "gold" | "success" | "neutral"> = {
    submitted: "warning",
    "under-review": "gold",
    resolved: "success",
    closed: "neutral",
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Student Welfare, Grievance & Early Warning System"
        subtitle="Confidential grievance redressal, Early Warning Sentinel (EWS) for academic risks & attendance dropouts, and 24/7 Anti-Ragging Hotline triage."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/grievances/new">
              <Button variant="gold" leftIcon={<Plus size={15} />}>
                File New Grievance
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI & Progress Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Resolution Rate</span>
            <Badge variant="success" size="sm">{resolutionRate}% Resolved</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {resolvedCount} <span className="text-xs font-normal text-text-muted">/ {grievances.length} Total</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={resolutionRate} variant="success" size="sm" />
          </div>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Under Review</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {grievances.filter((g: any) => g.status === "under-review" || g.status === "submitted").length} Cases
          </div>
          <span className="text-xs text-text-muted mt-1 block">Active warden & disciplinary review</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">EWS Academic At-Risk</span>
          <div className="mt-2 text-2xl font-bold font-mono text-danger">
            3 Active Alerts
          </div>
          <span className="text-xs text-text-muted mt-1 block">Attendance &lt; 75% or GPA &lt; 2.20</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Avg. Response Time</span>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            4.2 <span className="text-xs font-normal text-text-muted">Hours</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Institutional SLA: &lt; 24 hours</span>
        </Card>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "grievances", label: "Confidential Grievance Register", icon: MessageSquare },
          { key: "ews", label: "Early Warning Sentinel (EWS)", icon: Activity },
          { key: "hotline", label: "Anti-Ragging & Crisis Hotline", icon: ShieldAlert },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Grievances */}
      {activeTab === "grievances" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {isAdmin ? "All Registered Complaints" : "Your Filed Grievances"} ({filteredGrievances.length})
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <SearchInput
                value={searchTerm}
                onValueChange={setSearchTerm}
                placeholder="Search complaints..."
                className="w-64"
              />
              <div className="w-48">
                <CustomDropdown
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Filter by status"
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "submitted", label: "Submitted" },
                    { value: "under-review", label: "Under Review" },
                    { value: "resolved", label: "Resolved" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} cols={4} />
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto space-y-3">
              <HelpCircle size={44} className="text-border-strong mx-auto" />
              <h3 className="text-sm font-bold text-text">
                {searchTerm || (selectedStatus && selectedStatus !== "all") ? "No Matching Grievances" : "No Grievances Recorded"}
              </h3>
              <p className="text-xs text-text-muted">
                {searchTerm || (selectedStatus && selectedStatus !== "all")
                  ? "Try adjusting your search criteria or resetting filters."
                  : "There are no active grievances recorded. Use the report button if you encounter campus or hostel difficulties."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredGrievances.map((grv: any) => {
                const variant = statusVariantMap[grv.status] || "neutral";

                return (
                  <div
                    key={grv.id}
                    className="p-5 hover:bg-surface-muted/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={variant} size="sm">
                          {grv.status}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {grv.category}
                        </Badge>
                        <span className="text-[11px] text-text-muted font-mono flex items-center gap-1">
                          <Calendar size={11} />
                          {grv.date || "Recent"}
                        </span>
                      </div>

                      <Link href={`/grievances/${grv.id}`} className="block group">
                        <h3 className="text-base font-bold text-text group-hover:text-gold transition-colors">
                          {grv.subject}
                        </h3>
                      </Link>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {grv.description}
                      </p>

                      {grv.resolution && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1 mt-2">
                          <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            Official Warden Resolution:
                          </span>
                          <p className="text-text-muted">{grv.resolution}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-between shrink-0 gap-3">
                      <span className="text-xs text-text-muted">
                        Complainant: <strong className="text-text font-medium">{grv.studentName || "Confidential Anonymous"}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<MessageSquare size={13} />}
                          onClick={() => router.push(`/grievances/${grv.id}`)}
                        >
                          Review
                        </Button>
                        {isAdmin && (
                          <ActionMenu
                            items={[
                              {
                                label: "View Full Thread",
                                icon: <MessageSquare size={13} />,
                                onClick: () => router.push(`/grievances/${grv.id}`),
                              },
                              {
                                label: "Delete Grievance",
                                icon: <Trash2 size={13} />,
                                variant: "danger",
                                onClick: () => {
                                  if (window.confirm("Are you sure you want to delete this grievance?")) {
                                    deleteGrievanceMutation.mutate(grv.id);
                                  }
                                },
                              },
                            ]}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Early Warning Sentinel (EWS) */}
      {activeTab === "ews" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Activity size={16} className="text-danger" />
                Algorithmic Early Warning Sentinel (EWS)
              </h3>
              <p className="text-xs text-text-muted">
                Automatic trigger when student attendance drops below 75%, consecutive lecture unexcused absences exceed 3, or CGPA falls into probation band (&lt; 2.20).
              </p>
            </div>
            <Badge variant="danger" size="sm">
              3 Under Proactive Intervention
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockEarlyWarningCases.map((ews) => (
              <Card key={ews.id} orientation="vertical" padding="md" className="border-danger/30 hover:border-danger transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="font-mono text-xs font-bold text-text-muted">{ews.id}</span>
                  <Badge variant={ews.riskLevel === "CRITICAL" ? "danger" : ews.riskLevel === "MODERATE" ? "warning" : "gold"} size="sm">
                    {ews.riskLevel} RISK
                  </Badge>
                </div>

                <div className="py-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-text">{ews.studentName}</h4>
                    <span className="text-xs font-mono text-gold">{ews.studentId} • {ews.department}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-surface-muted rounded-xl border border-border space-y-1">
                      <span className="text-[10px] uppercase text-text-muted font-bold block">Attendance</span>
                      <span className={`font-mono font-bold text-sm ${ews.attendancePct < 75 ? "text-danger" : "text-emerald-600"}`}>
                        {ews.attendancePct}%
                      </span>
                      <ProgressBar value={ews.attendancePct} variant={ews.attendancePct < 75 ? "danger" : "success"} size="xs" />
                    </div>
                    <div className="p-2 bg-surface-muted rounded-xl border border-border space-y-1">
                      <span className="text-[10px] uppercase text-text-muted font-bold block">Current CGPA</span>
                      <span className={`font-mono font-bold text-sm ${ews.cgpa < 2.0 ? "text-danger" : "text-amber-600"}`}>
                        {ews.cgpa.toFixed(2)} / 4.00
                      </span>
                      <span className="text-[10px] text-text-muted block">Failed Prereqs: {ews.failedPrereqs}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-muted rounded-xl border border-border text-xs">
                    <span className="text-[10px] uppercase text-text-muted font-bold block">Assigned Welfare Counselor</span>
                    <p className="font-medium text-text mt-0.5">{ews.assignedCounselor}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Badge variant={ews.status === "RESOLVED" ? "success" : "warning"} size="sm">
                    {ews.status.replace("_", " ")}
                  </Badge>
                  <Button
                    variant="gold"
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    leftIcon={<HeartHandshake size={13} />}
                    onClick={() => setSelectedEwsModal(ews)}
                  >
                    Counseling Notes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Anti-Ragging Hotline */}
      {activeTab === "hotline" && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-red-950/20 via-surface to-surface-muted border border-red-500/30 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">24/7 University Proctorial Anti-Ragging Emergency Dispatch</h3>
                <p className="text-xs text-text-muted">
                  Strict Zero-Tolerance UGC Anti-Ragging Statutory Policy. Direct hotline to Proctor Office, Campus Security Command, and Medical Triage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-surface rounded-xl border border-border space-y-1">
                <span className="text-xs text-text-muted font-bold uppercase">Proctorial Emergency Hotline</span>
                <p className="text-lg font-mono font-bold text-danger">+880 1711-998877</p>
                <span className="text-[11px] text-text-muted">Instant response dispatch &lt; 5 mins</span>
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border space-y-1">
                <span className="text-xs text-text-muted font-bold uppercase">Anonymous Whistleblower Vault</span>
                <p className="text-lg font-mono font-bold text-gold">confidential@uas.ac.bd</p>
                <span className="text-[11px] text-text-muted">PGP Encrypted • IP Masked</span>
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border space-y-1">
                <span className="text-xs text-text-muted font-bold uppercase">Medical & Trauma Support</span>
                <p className="text-lg font-mono font-bold text-emerald-600">Ext. 4400 (Campus Clinic)</p>
                <span className="text-[11px] text-text-muted">Immediate clinical stabilization</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counseling Intervention Modal */}
      <Modal
        isOpen={!!selectedEwsModal}
        onClose={() => setSelectedEwsModal(null)}
        title="Early Warning Counseling Intervention"
        subtitle={selectedEwsModal ? `${selectedEwsModal.studentName} (${selectedEwsModal.studentId})` : ""}
        size="md"
        footer={
          <div className="flex items-center justify-end w-full gap-2">
            <Button variant="outline" onClick={() => setSelectedEwsModal(null)}>
              Close
            </Button>
            <Button variant="gold" onClick={() => {
              alert(`Counseling session logged for ${selectedEwsModal?.studentName}. Academic advisor notified.`);
              setSelectedEwsModal(null);
            }}>
              Log Counseling Session
            </Button>
          </div>
        }
      >
        {selectedEwsModal && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text">Risk Classification</span>
                <Badge variant="danger" size="sm">{selectedEwsModal.riskLevel} INTERVENTION</Badge>
              </div>
              <p className="text-text-muted">
                Student has missed {selectedEwsModal.consecutiveAbsences} consecutive class sessions with an overall attendance of {selectedEwsModal.attendancePct}%. Current CGPA is {selectedEwsModal.cgpa.toFixed(2)}.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-text uppercase text-[10px]">Counselor Confidential Clinical Notes</label>
              <textarea
                rows={4}
                className="w-full p-3 bg-surface rounded-xl border border-border text-text font-sans text-xs focus:border-gold outline-none"
                placeholder="Enter counseling summary, remedial tutoring plan, or personal welfare mitigation steps..."
                defaultValue="Student met with academic advisor. Agreed to attend remedial lab clinics on Saturdays and undergo weekly attendance check-ins."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
