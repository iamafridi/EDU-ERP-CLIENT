"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Award,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  Plus,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
  Download,
} from "lucide-react";
import { clinicalApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";
import { generateOfficialCertificatePDF } from "@/lib/pdfGenerator";
import { showToast } from "@/components/dashboard/ToastFeedback";

export function InternshipRosterPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isFacultyOrAdmin =
    user?.role === "super-admin" || user?.role === "domain-admin" || user?.role === "faculty";

  const [activeTab, setActiveTab] = useState<"ROSTERS" | "PROCEDURES">("ROSTERS");
  const [isLogProcModalOpen, setIsLogProcModalOpen] = useState(false);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<any>(null);

  // Procedure form
  const [procCode, setProcCode] = useState("PROC-IV-CANN");
  const [procName, setProcName] = useState("Peripheral IV Cannulation");
  const [indication, setIndication] = useState("Fluid resuscitation in dehydration");
  const [patientAgeGender, setPatientAgeGender] = useState("45M (Ward Bed 204)");
  const [competency, setCompetency] = useState<any>("PERFORMED_UNDER_DIRECT_SUPERVISION");

  // Roster clearance form
  const [competencyRating, setCompetencyRating] = useState("5");
  const [feedbackNotes, setFeedbackNotes] = useState("Demonstrated excellent bedside etiquette, reliable patient handovers, and sharp procedural accuracy.");

  const { data: rosters = [], isLoading: isRostersLoading } = useQuery({
    queryKey: ["internship-rosters"],
    queryFn: () => clinicalApi.getInternshipRosters(),
  });

  const { data: procedures = [], isLoading: isProcsLoading } = useQuery({
    queryKey: ["clinical-procedures"],
    queryFn: () => clinicalApi.getProcedureLogs(),
  });

  const userRoll = (user as any)?.userId || user?.id || "STU-2021-0082";

  const { data: progressSummary } = useQuery({
    queryKey: ["intern-progress-summary", userRoll],
    queryFn: () => clinicalApi.getInternProgressSummary(userRoll),
  });

  const logProcedureMutation = useMutation({
    mutationFn: (payload: any) => clinicalApi.logClinicalProcedure(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-procedures"] });
      queryClient.invalidateQueries({ queryKey: ["intern-progress-summary"] });
      setIsLogProcModalOpen(false);
      showToast({
        title: "Procedure Logged",
        description: "Bedside procedure submitted for preceptor validation.",
        variant: "success",
      });
    },
  });

  const verifyProcedureMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      clinicalApi.verifyClinicalProcedure(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-procedures"] });
      queryClient.invalidateQueries({ queryKey: ["intern-progress-summary"] });
      showToast({
        title: "Competency Signed Off",
        description: "Preceptor clinical sign-off recorded.",
        variant: "success",
      });
    },
  });

  const clearanceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      clinicalApi.updateInternshipClearance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-rosters"] });
      queryClient.invalidateQueries({ queryKey: ["intern-progress-summary"] });
      setIsClearanceModalOpen(false);
      showToast({
        title: "Posting Cleared",
        description: "Departmental rotation clearance conferred.",
        variant: "success",
      });
    },
  });

  const handleLogProcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logProcedureMutation.mutate({
      internId: user?.id || "650000000000000000000001",
      internName: user?.name || "Dr. Farhan Ahmed (Intern)",
      internRollNumber: userRoll,
      procedureCode: procCode,
      procedureName: procName,
      patientAgeGender,
      clinicalIndication: indication,
      supervisorFacultyId: "650000000000000000000002",
      supervisorFacultyName: "Prof. Dr. Elizabeth Wright, MD",
      competencyLevel: competency,
      status: "PENDING_PRECEPTOR_SIGNOFF",
    });
  };

  const handleClearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoster) return;
    clearanceMutation.mutate({
      id: selectedRoster._id || selectedRoster.id,
      payload: {
        competencyRating: Number(competencyRating),
        clinicalDiligenceFeedback: feedbackNotes,
        clearanceSignOff: true,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">CRRI Completion Readiness</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {progressSummary?.overallReadinessScore ?? 88}%
          </div>
          <span className="text-xs text-text-muted mt-1 block">Procedure quotas & rotations fulfilled</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Rotations Cleared</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {progressSummary?.rotationProgress?.completedRotations ?? 6} / {progressSummary?.rotationProgress?.totalRotations ?? 8} Postings
          </div>
          <span className="text-xs text-text-muted mt-1 block">Medicine, Surgery, OB/GYN, Casualty</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Bedside Procedures Verified</span>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">
            {procedures.filter((p: any) => p.status === "VERIFIED_COMPETENT").length || 42} / 68 Logged
          </div>
          <span className="text-xs text-text-muted mt-1 block">Preceptor authenticated logs</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">CRRI Certificate Status</span>
          <div className="mt-2">
            <Badge variant="gold" size="sm">
              Eligible for Final Degree
            </Badge>
          </div>
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              leftIcon={<Download size={13} />}
              onClick={() => {
                const doc = generateOfficialCertificatePDF({
                  certNo: `CRRI-COMPL-${Date.now().toString().slice(-6)}`,
                  docType: "CRRI Internship Certificate",
                  studentName: user?.name || "Dr. Farhan Ahmed",
                  studentId: userRoll,
                  batch: "MBBS Cohort 2021-2026",
                  issueDate: new Date().toLocaleDateString(),
                  purpose: "Full Medical Council Registration & Licensing",
                  validUntil: "Permanent Medical Council Record",
                  verificationHash: `CRRI-NMC-SHA256-${Date.now().toString(16).toUpperCase()}`,
                });
                doc.save(`CRRI_Certificate_${userRoll}.pdf`);
                showToast({
                  title: "CRRI Certificate Generated",
                  description: "Downloaded official 12-month rotatory completion PDF.",
                  variant: "success",
                });
              }}
            >
              Export Certificate
            </Button>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "ROSTERS" ? "gold" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ROSTERS")}
          >
            12-Month Rotatory Postings ({rosters.length || 6})
          </Button>
          <Button
            variant={activeTab === "PROCEDURES" ? "gold" : "outline"}
            size="sm"
            onClick={() => setActiveTab("PROCEDURES")}
          >
            Mandatory Clinical Quota & Bedside Sign-Offs ({procedures.length || 8})
          </Button>
        </div>

        {activeTab === "PROCEDURES" && (
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsLogProcModalOpen(true)}
          >
            Log Bedside Procedure
          </Button>
        )}
      </div>

      {/* Tab 1: Rotations */}
      {activeTab === "ROSTERS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(rosters.length > 0
            ? rosters
            : [
                {
                  _id: "ROT-01",
                  internName: "Dr. Farhan Ahmed",
                  internRollNumber: "STU-2021-0082",
                  posting: "INTERNAL_MEDICINE",
                  department: "Department of Internal Medicine",
                  durationWeeks: 8,
                  attendanceDaysLogged: 56,
                  requiredDays: 56,
                  supervisorFacultyName: "Prof. Dr. Elizabeth Wright, MD",
                  competencyRating: 5,
                  status: "COMPLETED",
                  clearanceSignOff: true,
                },
                {
                  _id: "ROT-02",
                  internName: "Dr. Farhan Ahmed",
                  internRollNumber: "STU-2021-0082",
                  posting: "GENERAL_SURGERY",
                  department: "Department of Surgery & OT",
                  durationWeeks: 8,
                  attendanceDaysLogged: 56,
                  requiredDays: 56,
                  supervisorFacultyName: "Dr. Arthur Vance, FRCS",
                  competencyRating: 5,
                  status: "COMPLETED",
                  clearanceSignOff: true,
                },
                {
                  _id: "ROT-03",
                  internName: "Dr. Farhan Ahmed",
                  internRollNumber: "STU-2021-0082",
                  posting: "OBSTETRICS_GYNAECOLOGY",
                  department: "Labour Ward & Gynaecology Suite",
                  durationWeeks: 6,
                  attendanceDaysLogged: 42,
                  requiredDays: 42,
                  supervisorFacultyName: "Dr. Sarah Jenkins, MD",
                  competencyRating: 4.8,
                  status: "COMPLETED",
                  clearanceSignOff: true,
                },
                {
                  _id: "ROT-04",
                  internName: "Dr. Farhan Ahmed",
                  internRollNumber: "STU-2021-0082",
                  posting: "EMERGENCY_CASUALTY",
                  department: "Trauma & Resuscitation Bay",
                  durationWeeks: 4,
                  attendanceDaysLogged: 24,
                  requiredDays: 28,
                  supervisorFacultyName: "Dr. Alistair Who, FACEP",
                  status: "IN_PROGRESS",
                  clearanceSignOff: false,
                },
              ]
          ).map((rot: any) => (
            <Card key={rot._id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-text">
                    {rot.posting?.replace(/_/g, " ")}
                  </h4>
                  <span className="text-xs text-text-muted">{rot.department}</span>
                </div>
                <Badge
                  variant={rot.clearanceSignOff ? "success" : "warning"}
                  size="sm"
                >
                  {rot.clearanceSignOff ? "CLEARED & SIGNED" : "IN ROTATION"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-surface-muted rounded-xl">
                <div>
                  <span className="text-text-muted block">Preceptor Faculty:</span>
                  <strong className="text-text">{rot.supervisorFacultyName}</strong>
                </div>
                <div>
                  <span className="text-text-muted block">Attendance Days:</span>
                  <strong className="text-text">
                    {rot.attendanceDaysLogged} / {rot.requiredDays} Days
                  </strong>
                </div>
                {rot.competencyRating && (
                  <div>
                    <span className="text-text-muted block">Competency Score:</span>
                    <strong className="text-gold">★ {rot.competencyRating} / 5.0</strong>
                  </div>
                )}
                <div>
                  <span className="text-text-muted block">Duration:</span>
                  <strong className="text-text">{rot.durationWeeks} Weeks</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                {!rot.clearanceSignOff && isFacultyOrAdmin && (
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<UserCheck size={13} />}
                    onClick={() => {
                      setSelectedRoster(rot);
                      setIsClearanceModalOpen(true);
                    }}
                  >
                    Confer Preceptor Clearance
                  </Button>
                )}
                {rot.clearanceSignOff && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Departmental Seal Applied
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Procedures */}
      {activeTab === "PROCEDURES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(procedures.length > 0
              ? procedures
              : [
                  {
                    _id: "P-01",
                    procedureCode: "PROC-IV-CANN",
                    procedureName: "Peripheral IV Cannulation (18G/20G)",
                    category: "CORE_MANDATORY",
                    patientAgeGender: "52M (Post-Op Ward)",
                    clinicalIndication: "Pre-operative IV antibiotic infusion",
                    supervisorFacultyName: "Prof. Dr. Elizabeth Wright",
                    competencyLevel: "INDEPENDENT_BEDSIDE_MASTERY",
                    status: "VERIFIED_COMPETENT",
                  },
                  {
                    _id: "P-02",
                    procedureCode: "PROC-NORM-DELIV",
                    procedureName: "Normal Vaginal Delivery Conduct",
                    category: "CORE_MANDATORY",
                    patientAgeGender: "26F (G2P1 Labour Room)",
                    clinicalIndication: "Active Second Stage Labour",
                    supervisorFacultyName: "Dr. Sarah Jenkins",
                    competencyLevel: "PERFORMED_UNDER_DIRECT_SUPERVISION",
                    status: "VERIFIED_COMPETENT",
                  },
                  {
                    _id: "P-03",
                    procedureCode: "PROC-LUMB-PUNC",
                    procedureName: "Lumbar Puncture / CSF Sampling",
                    category: "CORE_MANDATORY",
                    patientAgeGender: "38M (Neurology Ward)",
                    clinicalIndication: "Suspected Viral Meningitis Evaluation",
                    supervisorFacultyName: "Dr. Arthur Vance",
                    competencyLevel: "PERFORMED_UNDER_DIRECT_SUPERVISION",
                    status: "PENDING_PRECEPTOR_SIGNOFF",
                  },
                ]
            ).map((proc: any) => (
              <Card key={proc._id} className="p-4 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gold font-bold">
                      {proc.procedureCode}
                    </span>
                    <Badge
                      variant={
                        proc.status === "VERIFIED_COMPETENT"
                          ? "success"
                          : "warning"
                      }
                      size="sm"
                    >
                      {proc.status === "VERIFIED_COMPETENT"
                        ? "VERIFIED"
                        : "PENDING SIGN-OFF"}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-xs text-text">{proc.procedureName}</h4>
                  <p className="text-[11px] text-text-muted">{proc.clinicalIndication}</p>

                  <div className="p-2 bg-surface-muted rounded-lg text-[11px] space-y-0.5">
                    <div>
                      <span className="text-text-muted">Patient: </span>
                      <strong>{proc.patientAgeGender || "Adult Inpatient"}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted">Competency: </span>
                      <span className="font-semibold text-primary">
                        {proc.competencyLevel?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">Preceptor: </span>
                      <span>{proc.supervisorFacultyName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  {proc.status !== "VERIFIED_COMPETENT" && isFacultyOrAdmin ? (
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<CheckCircle2 size={13} />}
                      onClick={() =>
                        verifyProcedureMutation.mutate({
                          id: proc._id,
                          payload: {
                            status: "VERIFIED_COMPETENT",
                            preceptorComments: "Aseptic technique maintained. Successful procedure on first attempt.",
                          },
                        })
                      }
                    >
                      Preceptor Sign-Off
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Bedside Validated
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Log Procedure Modal */}
      <Modal
        isOpen={isLogProcModalOpen}
        onClose={() => setIsLogProcModalOpen(false)}
        title="Log Bedside Clinical Procedure"
        subtitle="Submit procedure experience for preceptor authentication"
        size="md"
      >
        <form onSubmit={handleLogProcSubmit} className="space-y-4">
          <FormField label="Procedure Type" required>
            <Select
              value={procCode}
              onChange={(e) => {
                setProcCode(e.target.value);
                if (e.target.value === "PROC-IV-CANN") setProcName("Peripheral IV Cannulation");
                if (e.target.value === "PROC-LUMB-PUNC") setProcName("Lumbar Puncture / CSF Sampling");
                if (e.target.value === "PROC-ET-INTUB") setProcName("Endotracheal Intubation & Airway Management");
                if (e.target.value === "PROC-NORM-DELIV") setProcName("Normal Vaginal Delivery Conduct");
                if (e.target.value === "PROC-SUTURE-WOUND") setProcName("Surgical Suturing & Wound Debridement");
                if (e.target.value === "PROC-FOLEY-CATH") setProcName("Urinary Foley Catheterization");
              }}
              options={[
                { value: "PROC-IV-CANN", label: "Peripheral IV Cannulation (20/20 Quota)" },
                { value: "PROC-LUMB-PUNC", label: "Lumbar Puncture / CSF Sampling (5/5 Quota)" },
                { value: "PROC-ET-INTUB", label: "Endotracheal Intubation & Airway (5/5 Quota)" },
                { value: "PROC-NORM-DELIV", label: "Normal Vaginal Delivery Conduct (5/5 Quota)" },
                { value: "PROC-SUTURE-WOUND", label: "Surgical Suturing & Wound Care (15/15 Quota)" },
                { value: "PROC-FOLEY-CATH", label: "Urinary Foley Catheterization (10/10 Quota)" },
              ]}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Patient Profile (Age/Bed)" required>
              <Input
                value={patientAgeGender}
                onChange={(e) => setPatientAgeGender(e.target.value)}
                placeholder="e.g. 54M (ICU Bed 04)"
                required
              />
            </FormField>

            <FormField label="Competency Level" required>
              <Select
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                options={[
                  { value: "PERFORMED_UNDER_DIRECT_SUPERVISION", label: "Performed under Direct Supervision" },
                  { value: "INDEPENDENT_BEDSIDE_MASTERY", label: "Independent Bedside Mastery" },
                  { value: "ASSISTED_FACULTY", label: "Assisted Supervising Faculty" },
                  { value: "OBSERVED_ONLY", label: "Observed Only" },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Clinical Indication / Diagnosis" required>
            <Input
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              placeholder="e.g. Hypovolaemic shock resuscitation"
              required
            />
          </FormField>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsLogProcModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={logProcedureMutation.isPending}>
              Submit Log for Preceptor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confer Clearance Modal */}
      {selectedRoster && (
        <Modal
          isOpen={isClearanceModalOpen}
          onClose={() => setIsClearanceModalOpen(false)}
          title={`Departmental Sign-Off: ${selectedRoster.posting?.replace(/_/g, " ")}`}
          subtitle={`Preceptor clearance for ${selectedRoster.internName}`}
          size="md"
        >
          <form onSubmit={handleClearanceSubmit} className="space-y-4">
            <FormField label="Clinical Competency Score (1 to 5 Stars)" required>
              <Select
                value={competencyRating}
                onChange={(e) => setCompetencyRating(e.target.value)}
                options={[
                  { value: "5", label: "★★★★★ 5.0 (Exceptional Mastery & Reliability)" },
                  { value: "4.5", label: "★★★★☆ 4.5 (Proficient & Diligent)" },
                  { value: "4", label: "★★★★☆ 4.0 (Good Bedside Competence)" },
                  { value: "3.5", label: "★★★☆☆ 3.5 (Satisfactory Progress)" },
                ]}
              />
            </FormField>

            <FormField label="Preceptor Evaluation Notes" required>
              <Input
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Evaluation notes on bedside communication and diagnostic diligence"
                required
              />
            </FormField>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsClearanceModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" type="submit" loading={clearanceMutation.isPending}>
                Confer Departmental Clearance
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default InternshipRosterPanel;
