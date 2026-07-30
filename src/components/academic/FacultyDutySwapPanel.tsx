"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Check,
  Building,
} from "lucide-react";
import { academicApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";

export function FacultyDutySwapPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isHodOrAdmin = user?.role === "super-admin" || user?.role === "domain-admin";

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDutyId, setSelectedDutyId] = useState("");
  const [targetFacultyId, setTargetFacultyId] = useState("");
  const [swapReason, setSwapReason] = useState("");
  const [emergencyType, setEmergencyType] = useState<any>("PERSONAL_EMERGENCY");
  const [successMsg, setSuccessMsg] = useState("");
  const [responseNote, setResponseNote] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"roster" | "my-swaps" | "admin-review">("roster");

  // Queries
  const { data: duties = [], isLoading: isLoadingDuties } = useQuery({
    queryKey: ["invigilation-duties"],
    queryFn: () => academicApi.getInvigilationDuties(),
  });

  const { data: myDuties = [] } = useQuery({
    queryKey: ["my-invigilation-duties"],
    queryFn: () => academicApi.getMyInvigilationDuties(),
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => academicApi.getFaculties(),
  });

  const { data: mySwaps = { sent: [], received: [] }, isLoading: isLoadingSwaps } = useQuery({
    queryKey: ["my-duty-swaps"],
    queryFn: () => academicApi.getMyDutySwaps(),
  });

  const { data: allSwaps = [] } = useQuery({
    queryKey: ["all-duty-swaps"],
    queryFn: () => academicApi.getAllDutySwaps(),
  });

  // Mutations
  const createSwapMutation = useMutation({
    mutationFn: (payload: any) => academicApi.createDutySwap(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invigilation-duties"] });
      queryClient.invalidateQueries({ queryKey: ["my-duty-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["all-duty-swaps"] });
      setIsRequestModalOpen(false);
      setSwapReason("");
      setSelectedDutyId("");
      setTargetFacultyId("");
      setSuccessMsg("Invigilation duty swap proposal dispatched to colleague.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const respondSwapMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.respondToDutySwap(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invigilation-duties"] });
      queryClient.invalidateQueries({ queryKey: ["my-duty-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["all-duty-swaps"] });
      setSuccessMsg("Your response to the swap request was submitted.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const decideHodMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.decideDutySwapHod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invigilation-duties"] });
      queryClient.invalidateQueries({ queryKey: ["my-duty-swaps"] });
      queryClient.invalidateQueries({ queryKey: ["all-duty-swaps"] });
      setSuccessMsg("Exam roster updated. Duty reassigned in official database.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDutyId || !targetFacultyId || !swapReason.trim()) return;
    createSwapMutation.mutate({
      dutyId: selectedDutyId,
      targetFacultyId,
      reason: swapReason,
      emergencyType,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-surface-muted/60 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-gold" />
            Faculty Exam Duty Swap &amp; Invigilation Roster
          </h3>
          <p className="text-xs text-text-muted">
            Official invigilator schedule management: Propose peer duty exchanges, collect colleague consent, and obtain HOD / Exam Controller roster reassignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsRequestModalOpen(true)}
          >
            Request Duty Swap
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Sub tabs */}
      <div className="flex border-b border-border gap-2 pb-px text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab("roster")}
          className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "roster"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          Active Duty Roster ({duties.length})
        </button>
        <button
          onClick={() => setActiveSubTab("my-swaps")}
          className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "my-swaps"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          My Swap Requests
          {(mySwaps.received?.filter((s: any) => s.status === "PENDING_TARGET_FACULTY").length > 0) && (
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          )}
        </button>
        {isHodOrAdmin && (
          <button
            onClick={() => setActiveSubTab("admin-review")}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeSubTab === "admin-review"
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            HOD Endorsement Queue ({allSwaps.filter((s: any) => s.status === "PENDING_HOD_APPROVAL").length})
          </button>
        )}
      </div>

      {/* Subtab 1: Roster */}
      {activeSubTab === "roster" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {duties.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-text-muted border border-dashed border-border rounded-2xl">
              No invigilation duties scheduled for this term yet.
            </div>
          ) : (
            duties.map((duty: any) => (
              <Card key={duty._id || duty.id} orientation="vertical" padding="md" className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={duty.status === "SWAP_PENDING" ? "warning" : duty.status === "SWAPPED" ? "info" : "success"} size="sm">
                    {duty.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-[11px] font-mono text-text-muted">{duty.date}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text">{duty.examTitle}</h4>
                  <span className="text-[11px] font-mono text-gold block">{duty.courseCode} — {duty.courseName}</span>
                </div>

                <div className="p-2.5 bg-surface-muted rounded-xl border border-border space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted flex items-center gap-1"><Clock size={12} /> Time:</span>
                    <span className="font-mono text-text font-bold">{duty.startTime} — {duty.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted flex items-center gap-1"><MapPin size={12} /> Hall:</span>
                    <span className="font-bold text-text">{duty.room} ({duty.building || "Academic-1"})</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border">
                    <span className="text-text-muted flex items-center gap-1"><UserCheck size={12} /> Invigilator:</span>
                    <span className="font-bold text-emerald-600">
                      {duty.faculty?.name ? `${duty.faculty.name.firstName || ""} ${duty.faculty.name.lastName || ""}` : "Assigned Faculty"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-text-muted">{duty.role?.replace(/_/g, " ")}</span>
                  {duty.status === "ASSIGNED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDutyId(duty._id || duty.id);
                        setIsRequestModalOpen(true);
                      }}
                    >
                      Propose Swap
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Subtab 2: My Swaps */}
      {activeSubTab === "my-swaps" && (
        <div className="space-y-6">
          {/* Incoming Proposals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Incoming Swap Proposals from Colleagues ({mySwaps.received?.length || 0})
            </h4>

            {mySwaps.received?.length === 0 ? (
              <p className="p-6 text-center text-xs text-text-muted border border-border rounded-xl">
                No incoming swap proposals pending your review.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySwaps.received.map((s: any) => (
                  <Card key={s._id} orientation="vertical" padding="md" className="space-y-3 border-gold/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-gold">{s.swapNumber}</span>
                      <Badge variant={s.status === "PENDING_TARGET_FACULTY" ? "warning" : "success"} size="sm">
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-text font-semibold">
                        {s.requesterFaculty?.name ? `${s.requesterFaculty.name.firstName} ${s.requesterFaculty.name.lastName}` : "Faculty"} requested you to take over their duty:
                      </div>
                      <div className="p-2.5 bg-surface-muted rounded-xl border border-border text-[11px] font-mono">
                        {s.duty?.examTitle} ({s.duty?.courseCode}) on {s.duty?.date} @ {s.duty?.room} ({s.duty?.startTime} - {s.duty?.endTime})
                      </div>
                      <p className="text-text-muted italic pt-1">Reason: &ldquo;{s.reason}&rdquo;</p>
                    </div>

                    {s.status === "PENDING_TARGET_FACULTY" && (
                      <div className="pt-2 flex justify-end gap-2 border-t border-border">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => respondSwapMutation.mutate({ id: s._id, payload: { decision: "REJECT", note: "Cannot accommodate due to prior clinical commitment." } })}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="gold"
                          size="sm"
                          leftIcon={<Check size={14} />}
                          onClick={() => respondSwapMutation.mutate({ id: s._id, payload: { decision: "ACCEPT", note: "Consented to take over duty." } })}
                        >
                          Accept &amp; Forward to HOD
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              My Outgoing Swap Requests ({mySwaps.sent?.length || 0})
            </h4>
            {mySwaps.sent?.length === 0 ? (
              <p className="p-6 text-center text-xs text-text-muted border border-border rounded-xl">
                You have not initiated any exam duty swap requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySwaps.sent.map((s: any) => (
                  <Card key={s._id} orientation="vertical" padding="md" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-text">{s.swapNumber}</span>
                      <Badge variant={s.status === "HOD_APPROVED" ? "success" : s.status === "TARGET_REJECTED" || s.status === "HOD_REJECTED" ? "danger" : "warning"} size="sm">
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-xs text-text-muted">
                      Target Colleague: <strong className="text-text">{s.targetFaculty?.name ? `${s.targetFaculty.name.firstName} ${s.targetFaculty.name.lastName}` : "Faculty"}</strong>
                    </div>
                    <div className="text-xs text-text-muted font-mono">
                      Duty: {s.duty?.courseCode} on {s.duty?.date} ({s.duty?.startTime})
                    </div>
                    {s.hodApprovalNote && (
                      <p className="text-[11px] text-emerald-600 bg-emerald-500/10 p-2 rounded-lg mt-1">
                        HOD Note: {s.hodApprovalNote}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: Admin Review */}
      {activeSubTab === "admin-review" && isHodOrAdmin && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-text uppercase tracking-wider">
            Exam Controller &amp; HOD Final Endorsement Queue
          </h4>

          {allSwaps.filter((s: any) => s.status === "PENDING_HOD_APPROVAL").length === 0 ? (
            <p className="p-12 text-center text-xs text-text-muted border border-dashed border-border rounded-2xl">
              No swap requests currently awaiting HOD endorsement.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSwaps
                .filter((s: any) => s.status === "PENDING_HOD_APPROVAL")
                .map((s: any) => (
                  <Card key={s._id} orientation="vertical" padding="md" className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-gold">{s.swapNumber}</span>
                      <Badge variant="warning" size="sm">Colleague Consented</Badge>
                    </div>

                    <div className="text-xs space-y-1.5 p-3 bg-surface-muted rounded-xl border border-border">
                      <div>
                        <span className="text-text-muted">From: </span>
                        <strong className="text-text">{s.requesterFaculty?.name?.firstName} {s.requesterFaculty?.name?.lastName}</strong>
                      </div>
                      <div>
                        <span className="text-text-muted">To: </span>
                        <strong className="text-emerald-600">{s.targetFaculty?.name?.firstName} {s.targetFaculty?.name?.lastName}</strong>
                      </div>
                      <div className="pt-1 border-t border-border font-mono text-[11px]">
                        Slot: {s.duty?.examTitle} ({s.duty?.courseCode}) | {s.duty?.date} @ {s.duty?.room}
                      </div>
                      <div className="text-text-muted italic">Reason: {s.reason}</div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => decideHodMutation.mutate({ id: s._id, payload: { decision: "REJECT", note: "Roster density constraint." } })}
                      >
                        Reject Swap
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        leftIcon={<ShieldCheck size={14} />}
                        onClick={() => decideHodMutation.mutate({ id: s._id, payload: { decision: "APPROVE", note: "Approved and duty roster updated." } })}
                      >
                        Authorize &amp; Update Roster
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Duty Swap Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Propose Invigilation Duty Swap"
        subtitle="Initiate formal peer duty reassignment with departmental endorsement"
        size="md"
      >
        <form onSubmit={handleCreateSwap} className="space-y-4">
          <FormField label="Select Your Assigned Duty Slot" required>
            <Select
              value={selectedDutyId}
              onChange={(e) => setSelectedDutyId(e.target.value)}
              required
            >
              <option value="">Select an invigilation slot...</option>
              {myDuties.map((d: any) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.examTitle} ({d.courseCode}) — {d.date} ({d.startTime}) @ {d.room}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Target Colleague (Faculty Member)" required>
            <Select
              value={targetFacultyId}
              onChange={(e) => setTargetFacultyId(e.target.value)}
              required
            >
              <option value="">Select replacement faculty colleague...</option>
              {faculties.map((f: any) => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.name ? `${f.name.firstName} ${f.name.lastName}` : f.email} ({f.designation || "Faculty"})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Emergency Category" required>
            <Select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
            >
              <option value="PERSONAL_EMERGENCY">Personal / Family Emergency</option>
              <option value="CLINICAL_CALL">Urgent Clinical Call / Surgery</option>
              <option value="MEDICAL">Medical Illness</option>
              <option value="ACADEMIC_CONFERENCE">Academic Conference Presentation</option>
              <option value="SCHEDULE_OVERLAP">Departmental Examination Clashing</option>
            </Select>
          </FormField>

          <FormField label="Detailed Rationale for Swap" required>
            <Input
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder="e.g. Scheduled for emergency laparoscopy surgery duty at hospital"
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              type="submit"
              disabled={createSwapMutation.isPending}
            >
              {createSwapMutation.isPending ? "Submitting..." : "Send Proposal to Colleague"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FacultyDutySwapPanel;
