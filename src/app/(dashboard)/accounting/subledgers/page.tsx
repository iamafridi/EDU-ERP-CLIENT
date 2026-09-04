"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FormField, Select } from "@/components/ui/Form";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Truck,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  ShieldCheck,
  Send,
  Sparkles,
} from "lucide-react";

type SubledgerTab = "DOCTOR_SPLIT" | "GRANTS" | "AR" | "AP";

export default function SubledgersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("DOCTOR_SPLIT");
  const [selectedSplit, setSelectedSplit] = useState<any>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Direct City Bank EFT");
  const [successMsg, setSuccessMsg] = useState("");

  // Queries
  const { data: arBalances = [], isLoading: arLoading } = useQuery({
    queryKey: ["subledgers", "AR"],
    queryFn: () => api.getSubledgers("AR"),
  });

  const { data: apBalances = [], isLoading: apLoading } = useQuery({
    queryKey: ["subledgers", "AP"],
    queryFn: () => api.getSubledgers("AP"),
  });

  const { data: doctorSplits = [], isLoading: splitsLoading } = useQuery({
    queryKey: ["doctorRevenueSplits"],
    queryFn: api.getDoctorRevenueSplits,
  });

  const { data: researchGrants = [], isLoading: grantsLoading } = useQuery({
    queryKey: ["researchGrants"],
    queryFn: api.getResearchGrants,
  });

  // Mutation
  const settlePayoutMutation = useMutation({
    mutationFn: api.settleDoctorPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorRevenueSplits"] });
      setShowPayoutModal(false);
      setSuccessMsg(`Clinical Honorarium of ৳${selectedSplit?.netPayableToDoctor?.toLocaleString()} settled via ${paymentMethod}. Posted to General Ledger.`);
      setTimeout(() => setSuccessMsg(""), 5000);
    },
  });

  const handleOpenPayout = (split: any) => {
    setSelectedSplit(split);
    setShowPayoutModal(true);
  };

  const tabItems = [
    { id: "DOCTOR_SPLIT", label: "Doctor Clinical Revenue Splits", icon: <Stethoscope className="w-4 h-4" /> },
    { id: "GRANTS", label: "Restricted Research Grants", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "AR", label: "Student Accounts Receivable (AR)", icon: <Users className="w-4 h-4" /> },
    { id: "AP", label: "Vendor Accounts Payable (AP)", icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        eyebrow="Auxiliary Accounting & GL Subledgers"
        title="Auxiliary Subledgers & Revenue Distribution Hub"
        description="Multi-dimensional subledger engines controlling Student AR, Doctor Clinical Splits, Vendor AP, and Restricted Research Grants."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Accounting", href: "/accounting/chart-of-accounts" },
          { label: "Auxiliary Subledgers" },
        ]}
      />

      {/* Success Notification */}
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

      {/* Unified Tab Navigation */}
      <Tabs
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* ──── TAB 1: DOCTOR CLINICAL SPLIT ENGINE ──── */}
      {activeTab === "DOCTOR_SPLIT" && (
        <div className="space-y-6">
          <Card pad="md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone="primary" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                    Automated Revenue Distribution Engine
                  </Badge>
                </div>
                <h2 className="text-lg font-bold text-text font-ui mt-1">Clinical Faculty Honorarium & Revenue Shares</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Automated distribution: 70% Consultant Split, 10% TDS Withholding Tax, 20% Hospital Infrastructure Levy.
                </p>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border text-right shrink-0">
                <div className="text-[10px] text-text-muted uppercase font-semibold">Total Month Payout</div>
                <div className="text-lg font-bold text-success font-mono">৳940,907.50</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {doctorSplits.map((split: any) => {
              const isApproved = split.payoutStatus === "APPROVED_FOR_PAYOUT";

              return (
                <Card
                  key={split.id}
                  pad="md"
                  className="flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary">
                          {split.doctorId}
                        </span>
                        <h3 className="text-sm font-bold text-text mt-1 line-clamp-1">
                          {split.doctorName}
                        </h3>
                        <div className="text-xs text-text-muted">{split.department}</div>
                      </div>
                      <Badge
                        tone={isApproved ? "success" : "warning"}
                        size="sm"
                      >
                        {split.payoutStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* Gross Breakdowns */}
                    <div className="bg-surface-muted/50 p-3 rounded-xl border border-border space-y-1.5 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>OPD Consultations ({split.totalConsultations} pts):</span>
                        <span className="font-mono font-semibold text-text">৳{split.grossOPDFees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Surgeries Conducted ({split.grossSurgeries}):</span>
                        <span className="font-mono font-semibold text-text">৳{split.grossSurgicalFees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-text border-t border-border pt-1.5">
                        <span>Gross Revenue Generated:</span>
                        <span className="font-mono">৳{split.grossTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Split & Deductions */}
                    <div className="space-y-1 text-xs text-text-muted">
                      <div className="flex justify-between">
                        <span>Doctor Split Share ({split.doctorSharePct}%):</span>
                        <span className="font-mono font-bold text-primary">
                          ৳{split.grossDoctorShare.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-danger">
                        <span>TDS Withholding Tax (10%):</span>
                        <span className="font-mono">-৳{split.tdsWithholdingAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Hospital Infrastructure Levy:</span>
                        <span className="font-mono">-৳{split.hospitalInfrastructureDeduction.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-success-soft rounded-xl border border-success/20 text-xs">
                      <div className="text-[10px] uppercase font-bold text-success">
                        Net Honorarium Payable
                      </div>
                      <div className="text-xl font-bold font-mono text-success mt-0.5">
                        ৳{split.netPayableToDoctor.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenPayout(split)}
                    leftIcon={<Send size={14} />}
                  >
                    Process Subledger Payout
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── TAB 2: RESTRICTED RESEARCH GRANTS LEDGER ──── */}
      {activeTab === "GRANTS" && (
        <div className="space-y-6">
          <Card pad="md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <Badge tone="primary" size="sm" className="mb-1">
                  Restricted Fund Accounting (GAAP / IFRS)
                </Badge>
                <h2 className="text-lg font-bold text-text font-ui mt-1">Multi-Fund External Medical Research Grants</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Ring-fenced fund management for WHO, DGHS, and international clinical trial grants with milestone drawdowns.
                </p>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-border text-right shrink-0">
                <div className="text-[10px] text-text-muted uppercase font-semibold">Total Sanctioned Grants</div>
                <div className="text-lg font-bold text-warning font-mono">৳24,300,000</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {researchGrants.map((grnt: any) => (
              <Card
                key={grnt.id}
                pad="md"
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">
                      {grnt.grantCode}
                    </span>
                    <Badge tone="success" size="sm">
                      {grnt.fundType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-text mt-2 line-clamp-2 font-ui">
                    {grnt.grantTitle}
                  </h3>
                  <div className="text-xs text-text-muted mt-1">Agency: <span className="font-semibold text-text">{grnt.fundingAgency}</span></div>
                  <div className="text-xs text-text-muted">PI: <span className="font-semibold text-text">{grnt.principalInvestigator}</span></div>
                </div>

                {/* Fund Progress */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-text-muted">Budget Utilization Rate</span>
                    <span className="font-mono text-text">{grnt.utilizationRatePct}%</span>
                  </div>
                  <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${grnt.utilizationRatePct}%` }}
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-surface-muted/50 p-3 rounded-xl border border-border text-xs space-y-1.5">
                  <div className="flex justify-between text-text-muted">
                    <span>Sanctioned Budget:</span>
                    <span className="font-mono font-bold text-text">৳{grnt.sanctionedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Milestone Received:</span>
                    <span className="font-mono font-semibold text-success">৳{grnt.receivedMilestoneAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Disbursed Expenses:</span>
                    <span className="font-mono font-semibold text-info">৳{grnt.disbursedExpenditure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted border-t border-border pt-1">
                    <span>Unspent Balance:</span>
                    <span className="font-mono font-bold text-warning">৳{grnt.unspentBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted border-t border-border pt-2">
                  <span className="flex items-center gap-1 text-success font-semibold">
                    <ShieldCheck size={13} /> {grnt.auditComplianceStatus}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ──── TAB 3: STUDENT AR SUBLEDGER ──── */}
      {activeTab === "AR" && (
        <Card pad="none">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold text-text font-ui">Accounts Receivable Subledger (Students - AR-1130)</h3>
            <p className="text-xs text-text-muted mt-0.5">Auxiliary ledger detailing individual student open receivables.</p>
          </div>

          {arLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : arBalances.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs">No open student receivables found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm text-text">
                <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left">Student / Party ID</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {arBalances.map((b: any) => (
                    <tr key={b._id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{b._id}</td>
                      <td className="px-4 py-3 text-text-muted">Student Tuition & Coursework</td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-text">
                        ৳{Number(b.balance || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ──── TAB 4: VENDOR AP SUBLEDGER ──── */}
      {activeTab === "AP" && (
        <Card pad="none">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold text-text font-ui">Accounts Payable Subledger (Vendors - AP-2110)</h3>
            <p className="text-xs text-text-muted mt-0.5">Auxiliary ledger detailing outstanding supplier invoices and purchase commitments.</p>
          </div>

          {apLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : apBalances.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs">No open vendor payables found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm text-text">
                <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left">Vendor / Supplier ID</th>
                    <th className="px-4 py-3 text-left">Supply Category</th>
                    <th className="px-4 py-3 text-right">Payable Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {apBalances.map((b: any) => (
                    <tr key={b._id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{b._id}</td>
                      <td className="px-4 py-3 text-text-muted">Medical Consumables & Lab Equipment</td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-text">
                        ৳{Number(b.balance || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ──── MODAL: PROCESS DOCTOR SPLIT PAYOUT ──── */}
      {selectedSplit && (
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Settle Clinical Honorarium Payout"
          subtitle="GAAP SUBLEDGER SETTLEMENT VOUCHER"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-surface-muted/60 p-3 rounded-xl border border-border text-xs space-y-1">
              <div>Doctor: <span className="font-bold text-text">{selectedSplit.doctorName}</span></div>
              <div>Subledger Account: <span className="font-mono font-bold text-primary">{selectedSplit.linkedSubledgerAccount}</span></div>
            </div>

            <div className="space-y-2 border-y border-border py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Gross Doctor Share:</span>
                <span className="font-mono font-semibold">৳{selectedSplit.grossDoctorShare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-danger">
                <span>10% TDS Withheld:</span>
                <span className="font-mono">-৳{selectedSplit.tdsWithholdingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Hospital Levy (20%):</span>
                <span className="font-mono">-৳{selectedSplit.hospitalInfrastructureDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-success pt-2 border-t border-border">
                <span>Net Payable Amount:</span>
                <span className="font-mono">৳{selectedSplit.netPayableToDoctor.toLocaleString()}</span>
              </div>
            </div>

            <FormField label="Disbursement Channel & Bank Escrow">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Direct City Bank EFT">Direct City Bank BEFTN / RTGS</option>
                <option value="BRAC Bank Corporate Escrow">BRAC Bank Corporate Escrow</option>
                <option value="Institutional Cheque Voucher">Institutional Cheque Voucher</option>
              </Select>
            </FormField>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowPayoutModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => settlePayoutMutation.mutate(selectedSplit.id)}
                loading={settlePayoutMutation.isPending}
                leftIcon={<Send size={14} />}
              >
                Confirm & Post Journal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
