"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Printer,
  QrCode,
  AlertCircle,
  Building,
} from "lucide-react";
import { academicApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select, Textarea } from "@/components/ui";

export function MakeUpExamPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isDeanOrAdmin = user?.role === "super-admin" || user?.role === "domain-admin";

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedReqForSchedule, setSelectedReqForSchedule] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [viewingAdmitCard, setViewingAdmitCard] = useState<any>(null);

  // Form states
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [originalExamDate, setOriginalExamDate] = useState("");
  const [reasonCategory, setReasonCategory] = useState<any>("HOSPITALIZATION");
  const [medicalDescription, setMedicalDescription] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  // Scheduling states
  const [schedDate, setSchedDate] = useState("");
  const [schedStart, setSchedStart] = useState("10:00");
  const [schedEnd, setSchedEnd] = useState("13:00");
  const [schedRoom, setSchedRoom] = useState("Special Exam Hall — LH 104");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["makeup-requests"],
    queryFn: () => academicApi.getMakeUpExams(),
  });

  const applyMutation = useMutation({
    mutationFn: (payload: any) => academicApi.createMakeUpExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makeup-requests"] });
      setIsApplyModalOpen(false);
      setCourseCode("");
      setCourseName("");
      setMedicalDescription("");
      setSuccessMsg("Medical make-up exam petition submitted for health center review.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const verifyHealthMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.verifyHealthCenterMakeUp(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makeup-requests"] });
      setSuccessMsg("Health center medical certificate verification recorded.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const deanApproveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.deanDecisionMakeUp(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["makeup-requests"] });
      setSuccessMsg("Dean academic endorsement recorded. Ready for slot scheduling.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.scheduleMakeUpSlot(id, payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["makeup-requests"] });
      setIsScheduleModalOpen(false);
      setSuccessMsg("Make-up exam slot scheduled & official admit card token generated.");
      setTimeout(() => setSuccessMsg(""), 4500);
      setViewingAdmitCard(data);
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      courseCode,
      courseName: courseName || courseCode,
      originalExamDate,
      reasonCategory,
      medicalDescription,
      hospitalOrClinicName: hospitalName,
    });
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForSchedule) return;
    scheduleMutation.mutate({
      id: selectedReqForSchedule._id || selectedReqForSchedule.id,
      payload: {
        scheduledDate: schedDate,
        scheduledStartTime: schedStart,
        scheduledEndTime: schedEnd,
        scheduledRoom: schedRoom,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-surface-muted/60 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Stethoscope size={16} className="text-gold" />
            Medical &amp; Make-Up Examination Portal
          </h3>
          <p className="text-xs text-text-muted">
            End-to-end medical petition processing: Student sickness application $\rightarrow$ Health Center certification $\rightarrow$ Dean academic approval $\rightarrow$ Admit card slot generation.
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsApplyModalOpen(true)}
        >
          Submit Make-Up Petition
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-text-muted border border-dashed border-border rounded-2xl">
            No make-up examination petitions on record.
          </div>
        ) : (
          requests.map((req: any) => (
            <Card key={req._id || req.id} orientation="vertical" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gold">{req.applicationNumber}</span>
                <Badge
                  variant={
                    req.status === "SLOT_SCHEDULED"
                      ? "success"
                      : req.status === "DEAN_APPROVED"
                      ? "primary"
                      : req.status === "HEALTH_CENTER_REJECTED" || req.status === "DEAN_REJECTED"
                      ? "danger"
                      : "warning"
                  }
                  size="sm"
                >
                  {req.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text">{req.studentName}</h4>
                <span className="text-[11px] font-mono text-text-muted block">{req.studentId} • {req.department}</span>
              </div>

              <div className="p-2.5 bg-surface-muted rounded-xl border border-border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Missed Course:</span>
                  <strong className="text-text font-mono">{req.courseCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Original Exam Date:</span>
                  <span className="font-mono text-text">{req.originalExamDate}</span>
                </div>
                <div className="text-[11px] text-text-muted italic border-t border-border pt-1">
                  Reason: &ldquo;{req.medicalDescription}&rdquo; ({req.hospitalOrClinicName || "College Health Center"})
                </div>
              </div>

              {/* Scheduled details */}
              {req.scheduledDate && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Make-Up Slot:</span>
                    <span className="font-mono">{req.scheduledDate} ({req.scheduledStartTime} - {req.scheduledEndTime})</span>
                  </div>
                  <div className="text-[11px] text-text font-mono flex justify-between">
                    <span>Room: {req.scheduledRoom}</span>
                    <strong className="text-gold cursor-pointer underline" onClick={() => setViewingAdmitCard(req)}>
                      View Admit Card
                    </strong>
                  </div>
                </div>
              )}

              {/* Action Buttons based on Role & State */}
              <div className="pt-2 flex flex-wrap justify-end gap-2 border-t border-border">
                {req.status === "PENDING_HEALTH_CENTER_VERIFICATION" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      verifyHealthMutation.mutate({
                        id: req._id || req.id,
                        payload: { verified: true, doctorNote: "Medical emergency confirmed by Dr. K. Hossain." },
                      })
                    }
                  >
                    Medical Officer Verify
                  </Button>
                )}

                {req.status === "PENDING_DEAN_APPROVAL" && isDeanOrAdmin && (
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() =>
                      deanApproveMutation.mutate({
                        id: req._id || req.id,
                        payload: { approved: true, note: "Approved for supplementary make-up slot." },
                      })
                    }
                  >
                    Dean Approve
                  </Button>
                )}

                {req.status === "DEAN_APPROVED" && isDeanOrAdmin && (
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<Calendar size={13} />}
                    onClick={() => {
                      setSelectedReqForSchedule(req);
                      setIsScheduleModalOpen(true);
                    }}
                  >
                    Schedule Exam Slot
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Petition Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Medical / Make-Up Examination"
        subtitle="Submit medical justification petition for missed midterm or term final exam"
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <Input
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. ANAT-101"
                required
              />
            </FormField>
            <FormField label="Course Title" required>
              <Input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Gross Anatomy"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Original Exam Date (YYYY-MM-DD)" required>
              <Input
                value={originalExamDate}
                onChange={(e) => setOriginalExamDate(e.target.value)}
                placeholder="2026-10-15"
                required
              />
            </FormField>
            <FormField label="Emergency Reason Category" required>
              <Select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
              >
                <option value="HOSPITALIZATION">Hospitalization / Inpatient Stay</option>
                <option value="ACUTE_ILLNESS_CLINICAL">Acute Infectious Illness / High Fever</option>
                <option value="ROAD_ACCIDENT">Traffic / Physical Accident</option>
                <option value="FAMILY_BEREAVEMENT">Family Bereavement</option>
                <option value="OFFICIAL_SPORTS_UNIVERSITY">Official University Duty</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Hospital / Attending Clinic Name">
            <Input
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Medical College Hospital Inpatient Ward-4"
            />
          </FormField>

          <FormField label="Clinical Sickness Details & Diagnosis" required>
            <Textarea
              value={medicalDescription}
              onChange={(e) => setMedicalDescription(e.target.value)}
              placeholder="Describe acute symptoms and hospitalization timeline..."
              rows={3}
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Submitting..." : "Submit Make-Up Application"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Slot Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Supplementary Make-Up Exam Slot"
        subtitle={selectedReqForSchedule ? `${selectedReqForSchedule.studentName} (${selectedReqForSchedule.courseCode})` : ""}
        size="md"
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <FormField label="Scheduled Date (YYYY-MM-DD)" required>
            <Input
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
              placeholder="2026-11-05"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time" required>
              <Input
                value={schedStart}
                onChange={(e) => setSchedStart(e.target.value)}
                placeholder="10:00"
                required
              />
            </FormField>
            <FormField label="End Time" required>
              <Input
                value={schedEnd}
                onChange={(e) => setSchedEnd(e.target.value)}
                placeholder="13:00"
                required
              />
            </FormField>
          </div>

          <FormField label="Designated Exam Hall" required>
            <Input
              value={schedRoom}
              onChange={(e) => setSchedRoom(e.target.value)}
              placeholder="e.g. Special Exam Hall — LH 104"
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={scheduleMutation.isPending}>
              {scheduleMutation.isPending ? "Assigning..." : "Confirm Slot & Issue Admit Card"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admit Card Modal */}
      <Modal
        isOpen={!!viewingAdmitCard}
        onClose={() => setViewingAdmitCard(null)}
        title="Official Supplementary Examination Admit Card"
        subtitle={viewingAdmitCard?.applicationNumber}
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" leftIcon={<Printer size={14} />} onClick={() => window.print()}>
              Print Admit Card
            </Button>
            <Button variant="gold" onClick={() => setViewingAdmitCard(null)}>
              Close
            </Button>
          </div>
        }
      >
        {viewingAdmitCard && (
          <div className="p-6 bg-surface-muted rounded-2xl border border-border space-y-4 text-xs font-sans">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h4 className="text-sm font-bold text-text">Medical College &amp; Hospital</h4>
                <p className="text-[10px] text-text-muted">Office of the Controller of Examinations</p>
              </div>
              <Badge variant="success" size="sm">DEAN AUTHORIZED</Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-text-muted">Candidate Name:</span> <strong className="text-text">{viewingAdmitCard.studentName}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Student ID:</span> <strong className="font-mono text-gold">{viewingAdmitCard.studentId}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Exam Subject:</span> <span>{viewingAdmitCard.courseCode} — {viewingAdmitCard.courseName}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Exam Slot:</span> <strong className="font-mono text-text">{viewingAdmitCard.scheduledDate} ({viewingAdmitCard.scheduledStartTime} - {viewingAdmitCard.scheduledEndTime})</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Assigned Hall:</span> <strong>{viewingAdmitCard.scheduledRoom}</strong></div>
            </div>

            <div className="pt-3 border-t border-border text-center">
              <QrCode size={90} className="mx-auto text-navy" />
              <span className="font-mono text-[10px] text-text-muted block mt-1">{viewingAdmitCard.admitCardToken || "MAKEUP-AUTH-2026-X889"}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MakeUpExamPanel;
