"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Plus,
  Printer,
  CheckCircle2,
  Building,
  CreditCard,
  DollarSign,
  UserCheck,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { financeApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";
import { generateCautionSettlementPDF } from "@/lib/pdfGenerator";

export function CautionRefundPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isBursarOrAdmin = user?.role === "super-admin" || user?.role === "domain-admin" || (user as any)?.staffSubRole === "accountant";

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [payoutModalSettlement, setPayoutModalSettlement] = useState<any>(null);

  // Form states
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [department, setDepartment] = useState("School of Medicine");
  const [graduationBatch, setGraduationBatch] = useState("MBBS Batch 2026");
  const [cautionPaid, setCautionPaid] = useState("50000");

  // Payout states
  const [payoutMethod, setPayoutMethod] = useState<any>("CHEQUE_ISSUED");
  const [bankName, setBankName] = useState("Sonali Bank — College Branch");
  const [chequeNo, setChequeNo] = useState("");

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ["caution-refunds"],
    queryFn: () => financeApi.getCautionRefunds(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createCautionRefund(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caution-refunds"] });
      setIsApplyModalOpen(false);
      setStudentId("");
      setStudentName("");
      setSuccessMsg("Caution deposit exit settlement application logged.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const clearanceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => financeApi.updateCautionClearance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caution-refunds"] });
      setSuccessMsg("Departmental deduction & clearance mesh updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const payoutMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => financeApi.approveCautionPayout(id, payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["caution-refunds"] });
      setPayoutModalSettlement(null);
      setSuccessMsg(`Refund payment authorized & AP Voucher posted to Ledger (${data.apVoucherNumber || "AP-REF-2026"}).`);
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      studentId,
      studentName,
      department,
      graduationBatch,
      initialCautionDeposit: Number(cautionPaid),
    });
  };

  const handlePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModalSettlement) return;
    payoutMutation.mutate({
      id: payoutModalSettlement._id || payoutModalSettlement.id,
      payload: {
        payoutMethod,
        bankName,
        chequeNumber: chequeNo || `CHQ-SONALI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-surface-muted/60 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <ShieldCheck size={16} className="text-gold" />
            Caution Deposit Return &amp; 5-Point Exit Settlement Desk
          </h3>
          <p className="text-xs text-text-muted">
            Net refundable security deposit settlement for graduating interns &amp; departing students: Reconciles Library overdue books, Lab breakage, Hostel damages, Mess dues, and Hospital clinical clearance before issuing Accounts Payable cheques.
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsApplyModalOpen(true)}
        >
          New Exit Settlement
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Settlements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settlements.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-text-muted border border-dashed border-border rounded-2xl">
            No caution deposit exit settlements logged in the system.
          </div>
        ) : (
          settlements.map((dep: any) => (
            <Card key={dep._id || dep.id} orientation="vertical" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text">{dep.studentName}</h4>
                  <span className="text-xs font-mono text-gold">{dep.studentId} • {dep.graduationBatch}</span>
                </div>
                <Badge
                  variant={
                    dep.status === "CHEQUE_ISSUED" || dep.status === "DISBURSED"
                      ? "success"
                      : dep.status === "CLEARANCE_COMPLETE"
                      ? "primary"
                      : "gold"
                  }
                  size="sm"
                >
                  {dep.status.replace(/_/g, " ")}
                </Badge>
              </div>

              {/* Deductions Breakdown */}
              <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1.5 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-text-muted">Initial Caution Security Deposit:</span>
                  <strong className="font-mono font-bold text-text">৳{dep.initialCautionDeposit?.toLocaleString()}</strong>
                </div>

                <div className="space-y-1 pt-1 border-t border-border text-[11px]">
                  <div className="flex justify-between text-text-muted">
                    <span>1. Library Overdue Dues:</span>
                    <span className="font-mono">{dep.libraryCleared ? "✓ Cleared (৳0)" : `৳${dep.libraryDue || 0}`}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>2. Lab Equipment Breakage:</span>
                    <span className="font-mono">{dep.labCleared ? "✓ Cleared (৳0)" : `৳${dep.labDamageDue || 0}`}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>3. Hostel Room &amp; Estate Inspection:</span>
                    <span className="font-mono">{dep.hostelCleared ? "✓ Cleared (৳0)" : `৳${dep.hostelDamageDue || 0}`}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>4. Dining Hall Mess Dues:</span>
                    <span className="font-mono">{dep.messCleared ? "✓ Cleared (৳0)" : `৳${dep.messDue || 0}`}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>5. Hospital Clinical Rotation Clearance:</span>
                    <span className="font-mono">{dep.hospitalCleared ? "✓ Cleared (৳0)" : `৳${dep.hospitalDues || 0}`}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-border font-bold">
                  <span className="text-text">Net Refundable Settlement:</span>
                  <span className="font-mono text-emerald-600 text-sm">৳{dep.netRefundAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Status or Payout details */}
              {dep.apVoucherNumber && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs flex justify-between items-center text-emerald-600">
                  <span>Cheque: <strong>{dep.chequeNumber}</strong></span>
                  <span className="font-mono font-bold">{dep.apVoucherNumber}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={13} />}
                  onClick={() => {
                    const doc = generateCautionSettlementPDF({
                      settlementNo: dep.settlementNumber || dep._id || "SETTLE-001",
                      studentName: dep.studentName,
                      studentId: dep.studentId,
                      program: dep.department || "School of Medicine",
                      admissionYear: "2021",
                      graduationYear: "2026",
                      depositAmount: dep.cautionPaid || 50000,
                      totalDeductions: dep.totalDeductions || 0,
                      netRefundAmount: dep.netRefundAmount || dep.cautionPaid || 50000,
                      paymentMethod: dep.payoutMethod || "CHEQUE_ISSUED",
                      voucherId: dep.apVoucherNumber || "AP-REF-PENDING",
                      departments: [
                        { name: "1. Medical Library Dues", status: dep.libraryCleared ? "CLEARED" : "PENDING", signedBy: "Head Librarian", signedAt: "2026-09-28", deductionAmount: dep.libraryDeduction || 0, remarks: "Zero unreturned books" },
                        { name: "2. Lab & Breakage Store", status: dep.labCleared ? "CLEARED" : "PENDING", signedBy: "Chief Lab Tech", signedAt: "2026-09-29", deductionAmount: dep.labDeduction || 0, remarks: "Microscope & glassware cleared" },
                        { name: "3. Hostel Warden Office", status: dep.hostelCleared ? "CLEARED" : "PENDING", signedBy: "Hostel Warden", signedAt: "2026-09-29", deductionAmount: dep.hostelDeduction || 0, remarks: "Room inventory handed over" },
                        { name: "4. Mess & Dining Hall", status: dep.messCleared ? "CLEARED" : "PENDING", signedBy: "Mess Supervisor", signedAt: "2026-09-30", deductionAmount: dep.messDeduction || 0, remarks: "All monthly bills settled" },
                        { name: "5. Clinical & Hospital Posting", status: dep.hospitalCleared ? "CLEARED" : "PENDING", signedBy: "Clinical Registrar", signedAt: "2026-09-30", deductionAmount: dep.hospitalDeduction || 0, remarks: "Clinical duty sign-off complete" },
                      ],
                    });
                    doc.save(`Caution_Settlement_${dep.studentId}.pdf`);
                  }}
                >
                  Export PDF Voucher
                </Button>

                {dep.status === "PENDING_5POINT_CLEARANCE" && isBursarOrAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      clearanceMutation.mutate({
                        id: dep._id || dep.id,
                        payload: {
                          libraryCleared: true,
                          labCleared: true,
                          hostelCleared: true,
                          messCleared: true,
                          hospitalCleared: true,
                        },
                      })
                    }
                  >
                    Clear All 5 Gates
                  </Button>
                )}

                {dep.status === "CLEARANCE_COMPLETE" && isBursarOrAdmin && (
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<DollarSign size={13} />}
                    onClick={() => setPayoutModalSettlement(dep)}
                  >
                    Authorize Payout Cheque
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Settlement Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Initiate Caution Deposit Settlement"
        subtitle="Log exit clearance petition for graduating student"
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Student Registration ID" required>
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. MED-2021-0082"
                className="font-mono"
                required
              />
            </FormField>
            <FormField label="Student Full Name" required>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Dr. Farhan Ahmed"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Department / Faculty" required>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="School of Medicine"
                required
              />
            </FormField>
            <FormField label="Graduation Cohort / Batch" required>
              <Input
                value={graduationBatch}
                onChange={(e) => setGraduationBatch(e.target.value)}
                placeholder="MBBS Batch 2026"
                required
              />
            </FormField>
          </div>

          <FormField label="Original Caution Deposit Paid (৳ BDT)" required>
            <Input
              type="number"
              value={cautionPaid}
              onChange={(e) => setCautionPaid(e.target.value)}
              className="font-mono"
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Logging..." : "Create Settlement Case"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payout Modal */}
      <Modal
        isOpen={!!payoutModalSettlement}
        onClose={() => setPayoutModalSettlement(null)}
        title="Authorize & Issue Caution Deposit Refund"
        subtitle={payoutModalSettlement ? `${payoutModalSettlement.studentName} (৳${payoutModalSettlement.netRefundAmount?.toLocaleString()})` : ""}
        size="md"
      >
        <form onSubmit={handlePayout} className="space-y-4">
          <FormField label="Disbursement Method" required>
            <Select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
            >
              <option value="CHEQUE_ISSUED">Accounts Payable Cheque</option>
              <option value="EFT_BANK_TRANSFER">Electronic Funds Transfer (EFT)</option>
              <option value="BKASH_MERCHANT_DISBURSEMENT">bKash Corporate Payout</option>
            </Select>
          </FormField>

          <FormField label="College Disbursing Bank" required>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Sonali Bank — College Branch"
              required
            />
          </FormField>

          <FormField label="Cheque Leaf Number / EFT Transfer Reference">
            <Input
              value={chequeNo}
              onChange={(e) => setChequeNo(e.target.value)}
              placeholder="e.g. CHQ-SONALI-998241"
              className="font-mono"
            />
          </FormField>

          <div className="p-3 bg-surface-muted rounded-xl border border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Net Payout Amount:</span>
            <strong className="font-mono text-emerald-600 text-base">
              ৳{payoutModalSettlement?.netRefundAmount?.toLocaleString()}
            </strong>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setPayoutModalSettlement(null)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={payoutMutation.isPending}>
              {payoutMutation.isPending ? "Issuing..." : "Sign Cheque & Post AP Voucher"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CautionRefundPanel;
