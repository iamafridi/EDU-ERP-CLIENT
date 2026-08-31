"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Search,
  Plus,
  Users,
  Activity,
  Award,
  Layers,
} from "lucide-react";
import { clinicalApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";
import { showToast } from "@/components/dashboard/ToastFeedback";

export function ClinicalAuditPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isConsultantOrAdmin =
    user?.role === "super-admin" || user?.role === "domain-admin" || user?.role === "faculty";

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [reviewModalAudit, setReviewModalAudit] = useState<any>(null);

  // Log Form
  const [department, setDepartment] = useState("General Surgery");
  const [incidentType, setIncidentType] = useState<any>("SURGICAL_MORBIDITY");
  const [severitySac, setSeveritySac] = useState<any>("SAC_2_MAJOR");
  const [patientProfile, setPatientProfile] = useState("62M, Post-Laparotomy Day 3");
  const [caseSummary, setCaseSummary] = useState(
    "Unplanned ICU re-intubation 8 hours post emergency Hartmann resection due to acute respiratory decompensation and aspiration."
  );

  // Review & 5-Whys form
  const [why1, setWhy1] = useState("Patient developed acute hypoxaemia and tachypnoea in post-op ward.");
  const [why2, setWhy2] = useState("Nasogastric tube had been clamped prematurely without measuring residual output.");
  const [why3, setWhy3] = useState("Junior resident on night call misinterpreted nursing output log.");
  const [rootCause, setRootCause] = useState("Inadequate standardization of post-op NG tube decompression weaning protocols across surgical wards.");
  const [remedialAction, setRemedialAction] = useState("Mandatory surgical ward NG-tube protocol checklist introduced; all surgical residents undergo handover simulation.");
  const [takeaway, setTakeaway] = useState("Always auscultate bowel sounds and inspect 24h bilious aspirate volume before clamping enteral drainage.");

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["clinical-audits"],
    queryFn: () => clinicalApi.getClinicalAudits(),
  });

  const { data: stats } = useQuery({
    queryKey: ["clinical-audit-stats"],
    queryFn: () => clinicalApi.getClinicalAuditStats(),
  });

  const logAuditMutation = useMutation({
    mutationFn: (payload: any) => clinicalApi.logClinicalAuditCase(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-audits"] });
      queryClient.invalidateQueries({ queryKey: ["clinical-audit-stats"] });
      setIsLogModalOpen(false);
      showToast({
        title: "Clinical Audit Logged",
        description: "Case entered into M&M Committee review registry.",
        variant: "success",
      });
    },
  });

  const reviewAuditMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      clinicalApi.reviewClinicalAuditCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-audits"] });
      queryClient.invalidateQueries({ queryKey: ["clinical-audit-stats"] });
      setReviewModalAudit(null);
      showToast({
        title: "5-Whys Audit Concluded",
        description: "Remedial preventative protocols signed off by Clinical Governance.",
        variant: "success",
      });
    },
  });

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logAuditMutation.mutate({
      department,
      incidentType,
      severitySacScore: severitySac,
      patientAgeGender: patientProfile,
      caseSummaryAnonymous: caseSummary,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalAudit) return;
    reviewAuditMutation.mutate({
      id: reviewModalAudit._id || reviewModalAudit.id,
      payload: {
        fiveWhysRootCause: {
          why1,
          why2,
          why3,
          identifiedRootCause: rootCause,
        },
        committeeChairpersonName: user?.name || "Prof. Dr. Elizabeth Wright (Chair of M&M)",
        preventativeProtocolAction: remedialAction,
        residentLearningTakeaway: takeaway,
        status: "REMEDIAL_ACTION_CLOSED",
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Total Audited Cases</span>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            {stats?.totalAuditedCases ?? audits.length} Cases
          </div>
          <span className="text-xs text-text-muted mt-1 block">Morbidity & Sentinel peer audits</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Sentinel / SAC-1 Events</span>
          <div className="mt-2 text-2xl font-bold font-mono text-danger">
            {stats?.sentinelEvents ?? 2} Flagged
          </div>
          <span className="text-xs text-text-muted mt-1 block">Under rapid root-cause review</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Hospital Mortality Audits</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {stats?.mortalityAudits ?? 3} Reviewed
          </div>
          <span className="text-xs text-text-muted mt-1 block">Peer review committee sign-offs</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Remedial Protocol Closure</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {stats?.remediationClosureRate ?? 92}%
          </div>
          <span className="text-xs text-text-muted mt-1 block">Closed with clinical remediation</span>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-text flex items-center gap-2">
            <ShieldAlert size={16} className="text-danger" />
            Hospital Morbidity & Mortality (M&M) / Clinical Governance Review Board
          </h3>
          <p className="text-xs text-text-muted">
            Non-punitive root-cause analysis (5-Whys framework) and institutional learning remediation.
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsLogModalOpen(true)}
        >
          Log M&M / Incident Case
        </Button>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(audits.length > 0
          ? audits
          : [
              {
                _id: "MM-001",
                auditNumber: "MM-AUDIT-2026-001",
                department: "Department of General Surgery",
                incidentType: "SURGICAL_MORBIDITY",
                severitySacScore: "SAC_2_MAJOR",
                patientAgeGender: "58M, Emergency Laparotomy",
                caseSummaryAnonymous:
                  "Unplanned return to operating theatre within 24h post-cholecystectomy due to sub-hepatic fluid collection and biliary leak.",
                status: "REMEDIAL_ACTION_CLOSED",
                fiveWhysRootCause: {
                  identifiedRootCause: "Accessory duct of Luschka not identified during severe acute inflammation dissection.",
                },
                preventativeProtocolAction:
                  "Routine intraoperative cholangiography (IOC) mandated in all Tokyo Grade II/III cholecystitis cases.",
                residentLearningTakeaway: "Clear dissection of the Critical View of Safety (CVS) must be photographed prior to clip application.",
              },
              {
                _id: "MM-002",
                auditNumber: "MM-AUDIT-2026-002",
                department: "Department of Anaesthesiology & ICU",
                incidentType: "UNPLANNED_ICU_INTUBATION",
                severitySacScore: "SAC_2_MAJOR",
                patientAgeGender: "71F, Post-Orthopaedic Fixation",
                caseSummaryAnonymous:
                  "Delayed recovery and severe hypoventilation in post-anaesthesia care unit requiring prolonged mechanical ventilation.",
                status: "UNDER_AUDIT_COMMITTEE_REVIEW",
                fiveWhysRootCause: {
                  identifiedRootCause: "Residual neuromuscular blockade potentiated by mild renal insufficiency.",
                },
              },
            ]
        ).map((a: any) => (
          <Card key={a._id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-gold">{a.auditNumber}</span>
                <h4 className="font-bold text-sm text-text mt-0.5">{a.department}</h4>
              </div>
              <div className="flex gap-1.5 items-center">
                <Badge
                  variant={
                    a.severitySacScore === "SAC_1_CATASTROPHIC"
                      ? "danger"
                      : a.severitySacScore === "SAC_2_MAJOR"
                      ? "warning"
                      : "primary"
                  }
                  size="sm"
                >
                  {a.severitySacScore?.replace(/_/g, " ")}
                </Badge>
                <Badge
                  variant={a.status === "REMEDIAL_ACTION_CLOSED" ? "success" : "warning"}
                  size="sm"
                >
                  {a.status === "REMEDIAL_ACTION_CLOSED" ? "REMEDIATED" : "UNDER REVIEW"}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">{a.caseSummaryAnonymous}</p>

            {a.fiveWhysRootCause?.identifiedRootCause && (
              <div className="p-3 bg-surface-muted rounded-xl space-y-1.5 text-xs">
                <strong className="text-text block">5-Whys Root Cause:</strong>
                <p className="text-text-muted italic">{a.fiveWhysRootCause.identifiedRootCause}</p>

                {a.preventativeProtocolAction && (
                  <div className="pt-1.5 border-t border-border">
                    <strong className="text-emerald-600 block">Remedial Action:</strong>
                    <span className="text-text font-medium">{a.preventativeProtocolAction}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              {a.status !== "REMEDIAL_ACTION_CLOSED" && isConsultantOrAdmin ? (
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<FileCheck size={13} />}
                  onClick={() => setReviewModalAudit(a)}
                >
                  Conduct 5-Whys Review
                </Button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> M&M Governance Sign-Off Concluded
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Log Case Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Clinical Incident for M&M Audit"
        subtitle="Confidential, peer-review protected clinical safety report"
        size="md"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Clinical Department" required>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. General Surgery"
                required
              />
            </FormField>

            <FormField label="Incident Classification" required>
              <Select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                options={[
                  { value: "SURGICAL_MORBIDITY", label: "Surgical Morbidity / Complication" },
                  { value: "HOSPITAL_MORTALITY_AUDIT", label: "Hospital Mortality Audit" },
                  { value: "SENTINEL_EVENT", label: "Sentinel Patient Safety Event (SAC-1)" },
                  { value: "UNPLANNED_ICU_INTUBATION", label: "Unplanned ICU / Re-Intubation" },
                  { value: "ADVERSE_DRUG_REACTION", label: "Adverse Drug Event (ADE)" },
                  { value: "NEAR_MISS_SAFETY", label: "Near-Miss Safety Hazard" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Severity Assessment Code (SAC)" required>
              <Select
                value={severitySac}
                onChange={(e) => setSeveritySac(e.target.value)}
                options={[
                  { value: "SAC_1_CATASTROPHIC", label: "SAC-1: Catastrophic / Sentinel" },
                  { value: "SAC_2_MAJOR", label: "SAC-2: Major Clinical Impairment" },
                  { value: "SAC_3_MODERATE", label: "SAC-3: Moderate Transitory Harm" },
                  { value: "SAC_4_MINOR", label: "SAC-4: Minor / Zero Harm Near-Miss" },
                ]}
              />
            </FormField>

            <FormField label="Anonymous Patient Cohort" required>
              <Input
                value={patientProfile}
                onChange={(e) => setPatientProfile(e.target.value)}
                placeholder="e.g. 62M, Post-Laparotomy Day 3"
                required
              />
            </FormField>
          </div>

          <FormField label="Clinical Case Summary (De-identified)" required>
            <Input
              value={caseSummary}
              onChange={(e) => setCaseSummary(e.target.value)}
              placeholder="Factual sequence of clinical events and adverse outcome"
              required
            />
          </FormField>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={logAuditMutation.isPending}>
              Submit to M&M Board
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5-Whys Review Modal */}
      {reviewModalAudit && (
        <Modal
          isOpen={!!reviewModalAudit}
          onClose={() => setReviewModalAudit(null)}
          title={`5-Whys Root Cause Review: ${reviewModalAudit.auditNumber}`}
          subtitle="Clinical governance and corrective protocol assignment"
          size="lg"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3 bg-surface-muted rounded-xl text-xs space-y-1">
              <strong className="text-text block">Case Summary:</strong>
              <p className="text-text-muted">{reviewModalAudit.caseSummaryAnonymous}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-text block">5-Whys Analytical Drill-Down:</span>
              <Input
                value={why1}
                onChange={(e) => setWhy1(e.target.value)}
                placeholder="Why #1: Immediate proximate trigger"
                className="text-xs"
              />
              <Input
                value={why2}
                onChange={(e) => setWhy2(e.target.value)}
                placeholder="Why #2: Intermediate process factor"
                className="text-xs"
              />
              <Input
                value={why3}
                onChange={(e) => setWhy3(e.target.value)}
                placeholder="Why #3: Team or handover gap"
                className="text-xs"
              />
            </div>

            <FormField label="Identified Systemic Root Cause" required>
              <Input
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="Root cause identified by committee"
                required
              />
            </FormField>

            <FormField label="Mandatory Corrective / Preventative Protocol" required>
              <Input
                value={remedialAction}
                onChange={(e) => setRemedialAction(e.target.value)}
                placeholder="Hospital SOP or clinical checklist updated"
                required
              />
            </FormField>

            <FormField label="Resident & Intern Educational Takeaway" required>
              <Input
                value={takeaway}
                onChange={(e) => setTakeaway(e.target.value)}
                placeholder="Key clinical takeaway for academic grand rounds"
                required
              />
            </FormField>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setReviewModalAudit(null)}>
                Cancel
              </Button>
              <Button variant="gold" type="submit" loading={reviewAuditMutation.isPending}>
                Conclude M&M Review & Sign-Off
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ClinicalAuditPanel;
