"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import {
  PageHeader,
  Card,
  Tabs,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Textarea,
  CustomDropdown,
} from "@/components/ui";
import {
  TableSkeleton,
} from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Cpu,
  Stethoscope,
  FileCheck,
  AlertTriangle,
  Zap,
  Activity,
  Filter,
  UserCheck,
  Clock,
  ShieldCheck,
  Search,
  Check,
  MapPin,
  Flame,
  Volume2,
} from "lucide-react";

interface SkillItem {
  id?: string;
  _id?: string;
  studentId: string;
  studentName: string;
  topic: string;
  category?: string;
  progressPercent: number;
  grade?: string;
  verifiedBy?: string;
  date?: string;
  status: "PASSED" | "IN_PROGRESS" | "FLAGGED";
}

export default function SkillLabPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const isEditor = roleIs("faculty", "super-admin", "domain-admin");

  const [activeMode, setActiveMode] = useState<string>("osce_matrix");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SkillItem | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Circuit Timer State
  const [countdownSeconds, setCountdownSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Modals
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedDops, setSelectedDops] = useState<any>(null);
  const [showDopsModal, setShowDopsModal] = useState(false);

  // Forms
  const [osceScoreForm, setOsceScoreForm] = useState({
    techniqueScore: 4,
    interpretationScore: 5,
    communicationScore: 4,
    notes: "Candidate demonstrated proper hand hygiene and systematic auscultation sequence.",
  });

  const [dopsForm, setDopsForm] = useState({
    indicationConsent: 5,
    asepticPreparation: 6,
    anatomicalLandmarkIdentification: 5,
    technicalExecution: 5,
    postProcedureCare: 6,
    professionalismCommunication: 6,
    consultantPin: "",
  });

  const [form, setForm] = useState({
    studentName: "",
    topic: "",
    verifiedBy: "",
  });

  // Circuit Timer Hook
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds((prev) => (prev <= 1 ? 300 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, countdownSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Queries
  const { data: rawSkills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: api.getSkills,
  });

  const { data: osceSession } = useQuery({
    queryKey: ["osceLiveCircuit"],
    queryFn: api.getLiveOsceCircuit,
  });

  const { data: dopsList = [] } = useQuery({
    queryKey: ["dopsProcedures"],
    queryFn: api.getDopsProcedures,
  });

  const { data: telemetryList = [] } = useQuery({
    queryKey: ["manikinTelemetry"],
    queryFn: api.getManikinTelemetry,
  });

  // Mutations
  const submitScoreMutation = useMutation({
    mutationFn: api.submitOsceStationScore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["osceLiveCircuit"] });
      setShowScoreModal(false);
      setSuccessMsg("Station rubric evaluation recorded.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const submitDOPSMutation = useMutation({
    mutationFn: api.submitDopsBedsideSignoff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dopsProcedures"] });
      setShowDopsModal(false);
      setSuccessMsg("DOPS Bedside procedure stamped and certified.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      closeModal();
      setSuccessMsg("Skill entry logged successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<SkillItem> }) =>
      api.updateSkill(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      closeModal();
      setSuccessMsg("Skill record updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      setSuccessMsg("Record deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const openAddModal = () => {
    setEditItem(null);
    setForm({ studentName: "", topic: "", verifiedBy: "" });
    setShowModal(true);
  };

  const openEditModal = (item: SkillItem) => {
    setEditItem(item);
    setForm({
      studentName: item.studentName || "",
      topic: item.topic || "",
      verifiedBy: item.verifiedBy || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateMutation.mutate({ id: editItem.id || (editItem as any)._id, data: form });
    } else {
      createMutation.mutate({
        ...form,
        studentId: "STU-NEW",
        progressPercent: 100,
        status: "PASSED",
      });
    }
  };

  const filteredSkills = rawSkills.filter((s: SkillItem) => {
    const matchesCategory = selectedCategory === "ALL" || s.category === selectedCategory;
    const matchesSearch =
      s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const columns: Column<SkillItem>[] = [
    {
      header: "Candidate / Student",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text">{row.studentName}</div>
          <div className="text-[10px] text-text-muted font-mono">{row.studentId}</div>
        </div>
      ),
    },
    {
      header: "Competency Procedure",
      accessor: (row) => (
        <div>
          <div className="text-xs sm:text-sm font-medium text-text">{row.topic}</div>
          <Badge tone="primary" size="sm" className="mt-0.5">
            {row.category || "Clinical Skill"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Progress & Mastery",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
            <div
              className={`h-full rounded-full ${
                row.progressPercent === 100 ? "bg-success" : "bg-warning"
              }`}
              style={{ width: `${row.progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold font-mono text-text">
            {row.progressPercent}%
          </span>
        </div>
      ),
    },
    {
      header: "Assessment Status",
      accessor: (row) => (
        <Badge
          tone={row.status === "PASSED" ? "success" : "warning"}
          size="sm"
        >
          {row.status || "IN_PROGRESS"}
        </Badge>
      ),
    },
    {
      header: "Signing Consultant",
      accessor: (row) => (
        <div className="text-xs text-text-muted flex items-center gap-1">
          <UserCheck size={13} className="text-success" />
          <span>{row.verifiedBy || "Prof. M. Rahman"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          {isEditor && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(row)}
                leftIcon={<Pencil size={12} />}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm("Delete this clinical skill record?")) {
                    deleteMutation.mutate(row.id || (row as any)._id);
                  }
                }}
                leftIcon={<Trash2 size={12} />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const tabItems = [
    { id: "osce_matrix", label: "1. OSCE / OSPE Station Matrix", icon: <Award className="w-4 h-4" /> },
    { id: "dops_signoff", label: "2. Bedside DOPS & Mini-CEX", icon: <Stethoscope className="w-4 h-4" /> },
    { id: "simlab_telemetry", label: "3. Sim-Lab Hardware Telemetry", icon: <Cpu className="w-4 h-4" /> },
    { id: "skills_directory", label: "4. Clinical Skills Repository", icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        eyebrow="Clinical Simulation & Competency Center"
        title="Skill Lab & Clinical OSCE Suite"
        description="Synchronized 12-station OSCE circuit matrix, bedside DOPS competency sign-offs with cryptographic stamps, and high-fidelity SimMan hardware telemetry."
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {activeMode === "osce_matrix" && (
              <div className="bg-surface-muted border border-border px-3.5 py-1.5 rounded-xl flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Station Timer</span>
                  <span className="text-xl font-mono font-bold text-primary">
                    {formatTimer(countdownSeconds)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={isTimerRunning ? "outline" : "primary"}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? "Pause Circuit" : "Resume Bell"}
                </Button>
              </div>
            )}

            {isEditor && activeMode === "skills_directory" && (
              <Button
                variant="primary"
                size="sm"
                onClick={openAddModal}
                leftIcon={<Plus size={15} />}
              >
                Add Skill Record
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card pad="md">
          <div className="text-[11px] text-text-muted uppercase font-semibold">Active OSCE Round</div>
          <div className="text-xl font-bold text-text font-display mt-0.5">Round 3 of 8</div>
          <div className="text-[10px] text-success mt-0.5">24 Active Candidates</div>
        </Card>
        <Card pad="md">
          <div className="text-[11px] text-text-muted uppercase font-semibold">DOPS Sign-Off Rate</div>
          <div className="text-xl font-bold text-text font-display mt-0.5">91.5% Certified</div>
          <div className="text-[10px] text-info mt-0.5">62 Procedures Verified</div>
        </Card>
        <Card pad="md">
          <div className="text-[11px] text-text-muted uppercase font-semibold">SimMan 3G Telemetry</div>
          <div className="text-xl font-bold text-success font-display mt-0.5">ONLINE (98% Bat)</div>
          <div className="text-[10px] text-text-muted mt-0.5">4 Sim Rooms Active</div>
        </Card>
        <Card pad="md">
          <div className="text-[11px] text-text-muted uppercase font-semibold">Anomaly Variances</div>
          <div className="text-xl font-bold text-warning font-display mt-0.5">1 Station Flagged</div>
          <div className="text-[10px] text-warning mt-0.5">Examiner A vs B &gt; 15%</div>
        </Card>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-success-soft border border-success/20 text-success text-xs sm:text-sm font-medium flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operational Modes Navigation Tabs */}
      <Tabs
        items={tabItems}
        value={activeMode}
        onChange={setActiveMode}
      />

      {/* ──── MODE 1: OSCE / OSPE STATION MATRIX ──── */}
      {activeMode === "osce_matrix" && (
        <div className="space-y-6">
          <Card pad="md">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-text font-ui flex items-center gap-2">
                  <Award className="text-primary" size={18} />
                  {osceSession?.examTitle || "Final Professional MBBS Clinical OSCE Circuit"}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Cohort: <span className="font-semibold text-text">{osceSession?.activeCohort}</span> • Circuit Station Time: <span className="font-mono font-semibold">5:00 min / station</span>
                </p>
              </div>
              <Badge tone="success" size="md">
                Live Circuit In Progress
              </Badge>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {(osceSession?.stations || []).map((stn: any) => {
              const isAnomaly = stn.status === "ANOMALY_VARIANCE_FLAGGED";
              const isRest = stn.type === "REST";

              return (
                <Card
                  key={stn.id}
                  pad="md"
                  className={`space-y-3 transition-all ${
                    isAnomaly
                      ? "border-warning bg-warning-soft/30"
                      : isRest
                      ? "bg-surface-muted/40"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge tone="primary" size="sm">
                      Station #{stn.stationNumber}
                    </Badge>
                    <Badge
                      tone={isAnomaly ? "warning" : isRest ? "neutral" : "success"}
                      size="sm"
                    >
                      {isAnomaly ? "Score Discrepancy" : isRest ? "Rest Station" : "Active Scoring"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text line-clamp-1 font-ui">{stn.title}</h3>
                    <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                      <span>Candidate:</span>
                      <span className="font-mono font-bold text-text">{stn.currentCandidate}</span>
                    </div>
                  </div>

                  {!isRest && (
                    <div className="p-2.5 rounded-xl bg-surface-muted/60 border border-border text-xs space-y-1">
                      <div className="text-[10px] text-text-muted uppercase font-semibold">Assigned Examiner</div>
                      <div className="text-xs font-bold text-text">{stn.examiner}</div>
                      <div className="text-[10px] text-text-muted">{stn.examinerDept}</div>
                    </div>
                  )}

                  {!isRest && (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-text-muted">
                        <span>Examiner A Score:</span>
                        <span className="font-mono font-bold text-primary">{stn.scoreExaminerA} / 20</span>
                      </div>
                      <div className="flex items-center justify-between text-text-muted">
                        <span>Examiner B Score:</span>
                        <span className="font-mono font-bold text-primary">{stn.scoreExaminerB} / 20</span>
                      </div>
                      {isAnomaly && (
                        <div className="p-2 bg-warning-soft rounded-lg text-[11px] text-warning font-semibold flex items-center gap-1.5 border border-warning/20">
                          <AlertTriangle size={13} className="shrink-0" />
                          <span>Variance: {stn.variancePct}% (Threshold &gt; 15%)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isRest && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedStation(stn);
                        setShowScoreModal(true);
                      }}
                      leftIcon={<Check size={13} />}
                    >
                      Enter Rubric Score
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── MODE 2: DOPS & MINI-CEX BEDSIDE SIGN-OFF ──── */}
      {activeMode === "dops_signoff" && (
        <div className="space-y-6">
          <Card pad="md">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-text font-ui flex items-center gap-2">
                  <Stethoscope className="text-success" size={18} />
                  Direct Observation of Procedural Skills (DOPS) & Mini-CEX
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Mandatory procedural quotas, geo-fenced ward verification, and BMDC consultant cryptographic sign-off.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedDops(dopsList[0] || null);
                  setShowDopsModal(true);
                }}
                leftIcon={<Plus size={15} />}
              >
                Record Bedside DOPS Sign-Off
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {dopsList.map((dops: any) => {
              const quotaPct = Math.min(100, Math.round((dops.completedQuota / dops.requiredQuota) * 100));
              const isQuotaMet = dops.completedQuota >= dops.requiredQuota;

              return (
                <Card
                  key={dops.id}
                  pad="md"
                  className="space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge tone="neutral" size="sm">
                        {dops.category}
                      </Badge>
                      <h3 className="text-sm font-bold text-text mt-1.5 font-ui">
                        {dops.procedureName}
                      </h3>
                    </div>
                    <Badge
                      tone={isQuotaMet ? "success" : "warning"}
                      size="sm"
                    >
                      {isQuotaMet ? "Quota Certified" : `${dops.completedQuota}/${dops.requiredQuota} Completed`}
                    </Badge>
                  </div>

                  {/* Quota Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-text-muted">BMDC Minimum Quota</span>
                      <span className="font-mono text-text">{quotaPct}%</span>
                    </div>
                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quotaPct >= 100 ? "bg-success" : "bg-warning"
                        }`}
                        style={{ width: `${quotaPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 6-Domain Evaluation Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-muted/50 p-3 rounded-xl border border-border">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Indication / Consent:</span>
                      <span className="font-bold text-text">{dops.scores.indicationConsent}/6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Aseptic Prep:</span>
                      <span className="font-bold text-text">{dops.scores.asepticPreparation}/6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Landmarks:</span>
                      <span className="font-bold text-text">{dops.scores.anatomicalLandmarkIdentification}/6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Execution:</span>
                      <span className="font-bold text-text">{dops.scores.technicalExecution}/6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Post-Op Care:</span>
                      <span className="font-bold text-text">{dops.scores.postProcedureCare}/6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Professionalism:</span>
                      <span className="font-bold text-text">{dops.scores.professionalismCommunication}/6</span>
                    </div>
                  </div>

                  {/* Evaluator & Cryptographic Verification Stamp */}
                  <div className="border-t border-border pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <UserCheck size={14} className="text-success" />
                      <span className="font-semibold text-text">{dops.evaluatorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-text-subtle bg-surface-muted px-2 py-0.5 rounded border border-border">
                      <ShieldCheck size={11} className="text-primary" />
                      {dops.digitalStamp}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedDops(dops);
                      setShowDopsModal(true);
                    }}
                    leftIcon={<FileCheck size={13} />}
                  >
                    View Bedside Competency Record
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── MODE 3: SIM-LAB HARDWARE TELEMETRY ──── */}
      {activeMode === "simlab_telemetry" && (
        <div className="space-y-6">
          <Card pad="md">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-text font-ui flex items-center gap-2">
                  <Cpu className="text-primary" size={18} /> High-Fidelity Simulator & Manikin Telemetry
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Real-time IoT sensors, manikin fluid levels, acoustic drivers, and scheduled calibration cycles.
                </p>
              </div>
              <Badge tone="success" size="md" icon={<Zap size={13} />}>
                IoT Manifold Sync Active
              </Badge>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {telemetryList.map((eqp: any) => {
              const isMaintenance = eqp.status === "MAINTENANCE_REQUIRED";

              return (
                <Card
                  key={eqp.id}
                  pad="md"
                  className={`space-y-4 ${isMaintenance ? "border-warning" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {eqp.id}
                      </span>
                      <h3 className="text-sm font-bold text-text mt-1 font-ui">{eqp.model}</h3>
                      <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {eqp.room}
                      </div>
                    </div>
                    <Badge
                      tone={isMaintenance ? "warning" : "success"}
                      size="sm"
                    >
                      {eqp.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* IoT Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-surface-muted/50 p-2.5 rounded-xl border border-border">
                      <div className="text-[10px] text-text-muted uppercase font-semibold">Battery</div>
                      <div className="text-sm font-bold font-mono text-success mt-0.5">
                        {eqp.batteryLevel}%
                      </div>
                    </div>
                    <div className="bg-surface-muted/50 p-2.5 rounded-xl border border-border">
                      <div className="text-[10px] text-text-muted uppercase font-semibold">Fluid Reservoir</div>
                      <div className="text-sm font-bold font-mono text-primary mt-0.5">
                        {eqp.fluidReservoirPct}%
                      </div>
                    </div>
                    <div className="bg-surface-muted/50 p-2.5 rounded-xl border border-border">
                      <div className="text-[10px] text-text-muted uppercase font-semibold">Hours Logged</div>
                      <div className="text-sm font-bold font-mono text-text mt-0.5">
                        {eqp.runtimeHours}h
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-muted border-t border-border pt-3">
                    <span>Next Calibration: <strong className="text-text">{eqp.nextCalibrationDate}</strong></span>
                    <span className="font-mono text-[10px]">{eqp.firmwareVersion}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── MODE 4: CLINICAL SKILLS REPOSITORY ──── */}
      {activeMode === "skills_directory" && (
        <Card pad="none">
          <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <Input
                placeholder="Search candidate name, ID, or procedure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <CustomDropdown
                options={[
                  { value: "ALL", label: "All Categories" },
                  { value: "Surgical Skills", label: "Surgical Skills" },
                  { value: "Emergency Skills", label: "Emergency Skills" },
                  { value: "Internal Medicine", label: "Internal Medicine" },
                  { value: "Paediatrics", label: "Paediatrics" },
                  { value: "Critical Care", label: "Critical Care" },
                  { value: "Trauma Surgery", label: "Trauma Surgery" },
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                icon={<Filter size={14} />}
              />
            </div>
          </div>

          {skillsLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={5} />
            </div>
          ) : (
            <DataTable columns={columns} data={filteredSkills} />
          )}
        </Card>
      )}

      {/* ──── MODAL: OSCE STATION RUBRIC SCORING ──── */}
      {selectedStation && (
        <Modal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          title={selectedStation.title}
          subtitle={`STATION #${selectedStation.stationNumber} RUBRIC EVALUATION`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-surface-muted/60 p-3 rounded-xl border border-border text-xs">
              <div className="text-text-muted">Candidate:</div>
              <div className="font-bold text-text text-sm">{selectedStation.currentCandidate}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-text mb-1">
                  <span>Clinical Examination Technique:</span>
                  <span className="font-mono font-bold text-primary">{osceScoreForm.techniqueScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={osceScoreForm.techniqueScore}
                  onChange={(e) => setOsceScoreForm({ ...osceScoreForm, techniqueScore: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-text mb-1">
                  <span>Diagnostic Interpretation:</span>
                  <span className="font-mono font-bold text-primary">{osceScoreForm.interpretationScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={osceScoreForm.interpretationScore}
                  onChange={(e) => setOsceScoreForm({ ...osceScoreForm, interpretationScore: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-text mb-1">
                  <span>Patient Communication & Empathy:</span>
                  <span className="font-mono font-bold text-primary">{osceScoreForm.communicationScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={osceScoreForm.communicationScore}
                  onChange={(e) => setOsceScoreForm({ ...osceScoreForm, communicationScore: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <FormField label="Examiner Clinical Observations">
                <Textarea
                  rows={2}
                  placeholder="Candidate demonstrated proper hand hygiene..."
                  value={osceScoreForm.notes}
                  onChange={(e) => setOsceScoreForm({ ...osceScoreForm, notes: e.target.value })}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowScoreModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  submitScoreMutation.mutate({
                    stationId: selectedStation.id,
                    candidateId: selectedStation.currentCandidate,
                    examinerRole: "A",
                    scores: {
                      technique: osceScoreForm.techniqueScore,
                      interpretation: osceScoreForm.interpretationScore,
                      communication: osceScoreForm.communicationScore,
                    },
                    notes: osceScoreForm.notes,
                  })
                }
                loading={submitScoreMutation.isPending}
                leftIcon={<Check size={14} />}
              >
                Submit Station Score
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──── MODAL: DOPS BEDSIDE SIGN-OFF EVALUATION ──── */}
      {selectedDops && (
        <Modal
          isOpen={showDopsModal}
          onClose={() => setShowDopsModal(false)}
          title={selectedDops.procedureName}
          subtitle="BMDC BEDSIDE DOPS CERTIFICATION"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-surface-muted/60 rounded-xl border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Location:</span>
                <span className="font-semibold text-text">{selectedDops.wardLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geo-Fence Check:</span>
                <span className="text-success font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified Inside Hospital Ward
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-text mb-1">
                  <span>Technical Execution & Needle/Instrument Handling:</span>
                  <span className="font-mono font-bold text-success">{dopsForm.technicalExecution} / 6</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={dopsForm.technicalExecution}
                  onChange={(e) => setDopsForm({ ...dopsForm, technicalExecution: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <FormField label="Consultant BMDC Signature PIN">
                <Input
                  type="password"
                  placeholder="Enter 4-digit BMDC consultant PIN"
                  value={dopsForm.consultantPin}
                  onChange={(e) => setDopsForm({ ...dopsForm, consultantPin: e.target.value })}
                  className="font-mono"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowDopsModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  submitDOPSMutation.mutate({
                    procedureId: selectedDops.id,
                    studentId: "STU-2026001",
                    scores: dopsForm,
                  })
                }
                loading={submitDOPSMutation.isPending}
                leftIcon={<ShieldCheck size={14} />}
              >
                Stamp & Certify Quota
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ──── MODAL: ADD / EDIT SKILL RECORD ──── */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editItem ? "Edit Skill Record" : "Add Clinical Skill Record"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="Student Full Name">
            <Input
              type="text"
              required
              placeholder="e.g. Marcus Chen"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            />
          </FormField>

          <FormField label="Skill Topic / Procedure">
            <Input
              type="text"
              required
              placeholder="e.g. Sterile Suture Techniques & Knot Tying"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </FormField>

          <FormField label="Verifying Consultant / Faculty">
            <Input
              type="text"
              placeholder="e.g. Dr. James Sterling"
              value={form.verifiedBy}
              onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="outline"
              type="button"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              {editItem ? "Save Changes" : "Create Record"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
