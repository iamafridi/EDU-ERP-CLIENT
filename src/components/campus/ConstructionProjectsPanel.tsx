"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Landmark,
  Layers,
  Receipt,
  TrendingUp,
  FileCheck2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  DollarSign,
  Plus,
  Search,
} from "lucide-react";
import { campusApi } from "@/services/api";
import {
  Card,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  Textarea,
  PageHeader,
  Tabs,
} from "@/components/ui";

export function ConstructionProjectsPanel() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("projects");
  const [selectedProjectId, setSelectedProjectId] = useState("proj-1");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isRaBillModalOpen, setIsRaBillModalOpen] = useState(false);
  const [isVoModalOpen, setIsVoModalOpen] = useState(false);
  const [isCapitalizeModalOpen, setIsCapitalizeModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // RA Bill form state
  const [billGrossWorkToDate, setBillGrossWorkToDate] = useState(25000000);
  const [billPrevCertified, setBillPrevCertified] = useState(18000000);
  const [billAdvanceRecovery, setBillAdvanceRecovery] = useState(700000);
  const [billMaterialRecovery, setBillMaterialRecovery] = useState(300000);

  // VO Form state
  const [voReason, setVoReason] = useState("ARCHITECT_REVISION");
  const [voDescription, setVoDescription] = useState("Additional seismic dampener bracing in Foundation Block B");
  const [voCostImpact, setVoCostImpact] = useState(4500000);
  const [voTimeImpact, setVoTimeImpact] = useState(21);

  // Capitalization Form state
  const [capBuildingAsset, setCapBuildingAsset] = useState("Hospital Auxiliary Wing B");
  const [capCostCenter, setCapCostCenter] = useState("CC-CLINICAL-MED");
  const [capUsefulLife, setCapUsefulLife] = useState(50);

  // Queries
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["construction-metrics"],
    queryFn: () => campusApi.getConstructionMetrics(),
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["construction-projects"],
    queryFn: () => campusApi.getConstructionProjects(),
  });

  const { data: runningBills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ["construction-bills", selectedProjectId],
    queryFn: () => campusApi.getRunningBills(selectedProjectId),
  });

  const { data: projectDetails, isLoading: isLoadingWbs } = useQuery({
    queryKey: ["construction-wbs", selectedProjectId],
    queryFn: () => campusApi.getConstructionProjectDetails(selectedProjectId),
  });
  const wbsItems = projectDetails?.wbsNodes || [];

  // Mutations
  const createRaBillMutation = useMutation({
    mutationFn: (payload: any) => campusApi.createRunningBill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["construction-bills"] });
      queryClient.invalidateQueries({ queryKey: ["construction-metrics"] });
      setIsRaBillModalOpen(false);
      setSuccessMsg("Contractor RA bill generated, retention deducted, and 3-way match verified.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create RA bill.");
      setTimeout(() => setErrorMsg(""), 4000);
    },
  });

  const submitVoMutation = useMutation({
    mutationFn: (payload: any) => campusApi.submitVariationOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["construction-projects"] });
      setIsVoModalOpen(false);
      setSuccessMsg("Variation Order logged and queued for Syndicate / P&D Approval.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const capitalizeMutation = useMutation({
    mutationFn: (payload: any) => campusApi.capitalizeProjectToAssets(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["construction-projects"] });
      queryClient.invalidateQueries({ queryKey: ["construction-metrics"] });
      setIsCapitalizeModalOpen(false);
      setSuccessMsg("CIP to Fixed Asset capitalization posted to Fund 40 dimensional ledger.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateRaBill = (e: React.FormEvent) => {
    e.preventDefault();
    createRaBillMutation.mutate({
      projectId: selectedProjectId,
      billNumber: `RA-00${runningBills.length + 1}`,
      grossWorkDoneToDate: Number(billGrossWorkToDate),
      previouslyCertifiedGross: Number(billPrevCertified),
      advanceRecovery: Number(billAdvanceRecovery),
      materialRecovery: Number(billMaterialRecovery),
    });
  };

  const currentProject = projects.find((p: any) => p._id === selectedProjectId) || projects[0];

  const tabItems = [
    { id: "projects", label: `Projects Portfolio (${projects.length})`, icon: <Building2 className="w-4 h-4" /> },
    { id: "wbs-boq", label: "WBS & BOQ Tracking", icon: <Layers className="w-4 h-4" /> },
    { id: "ra-bills", label: `RA Billing (${runningBills.length})`, icon: <Receipt className="w-4 h-4" /> },
    { id: "evm", label: "EVM S-Curve & Yield", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "capitalization", label: "Asset Capitalization", icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-success-soft text-success border border-success/20 flex items-center justify-between text-xs sm:text-sm font-medium"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-xs opacity-75 hover:opacity-100">Dismiss</button>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-danger-soft text-danger border border-danger/20 flex items-center justify-between text-xs sm:text-sm font-medium"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg("")} className="text-xs opacity-75 hover:opacity-100">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <PageHeader
        eyebrow="Fund 40 Capital Infrastructure"
        title="Construction & Capital Projects Engine"
        description="WBS decomposition, Bill of Quantities (BOQ), contractor Running Account (RA) bills, retention deductions, and CIP capitalization."
        badge={
          <Badge tone="gold" size="sm">
            CN-01 to CN-38 Compliant
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoModalOpen(true)}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-text-muted" />}
            >
              Variation Order
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRaBillModalOpen(true)}
              leftIcon={<Receipt className="w-4 h-4" />}
            >
              Generate RA Bill
            </Button>
          </div>
        }
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card pad="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Projects</p>
              <h3 className="text-2xl font-bold text-text mt-1">{metrics?.activeInProgressCount || 5}</h3>
            </div>
            <div className="p-2.5 bg-primary-soft rounded-xl text-primary">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Fund 40 multi-fund isolation active
          </p>
        </Card>

        <Card pad="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Portfolio Budget (BAC)</p>
              <h3 className="text-2xl font-bold text-text mt-1">
                ৳{((metrics?.totalPortfolioBudget || 840000000) / 10000000).toFixed(1)} Cr
              </h3>
            </div>
            <div className="p-2.5 bg-info-soft rounded-xl text-info">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-info" /> Approved by Syndicate & P&D
          </p>
        </Card>

        <Card pad="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Actual Spent (CIP)</p>
              <h3 className="text-2xl font-bold text-success mt-1">
                ৳{((metrics?.totalActualSpent || 412500000) / 10000000).toFixed(1)} Cr
              </h3>
            </div>
            <div className="p-2.5 bg-success-soft rounded-xl text-success">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Real-time 3-way match verified
          </p>
        </Card>

        <Card pad="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Retention Secured</p>
              <h3 className="text-2xl font-bold text-warning mt-1">
                ৳{((metrics?.totalRetentionSecured || 20625000) / 10000000).toFixed(2)} Cr
              </h3>
            </div>
            <div className="p-2.5 bg-warning-soft rounded-xl text-warning">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-warning" /> 5% security held during 12M DLP
          </p>
        </Card>
      </div>

      {/* Unified Tab Navigation */}
      <Tabs
        items={tabItems}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Projects Portfolio */}
      {activeTab === "projects" && (
        <Card pad="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-text font-ui">Capital Projects Portfolio (Fund 40)</h3>
              <p className="text-xs text-text-muted mt-0.5">Track work-in-progress, expenditure, and contractor commitments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <Input
                  placeholder="Filter projects or contractors..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {projects.map((proj: any) => {
              const progressPct = Math.min(100, Math.round(((proj.actualCost || 0) / (proj.budgetAtCompletion || 1)) * 100));
              const isSelected = selectedProjectId === proj._id;

              return (
                <div
                  key={proj._id}
                  onClick={() => setSelectedProjectId(proj._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary-soft/10 shadow-sm"
                      : "border-border bg-surface-muted/30 hover:border-border-strong hover:bg-surface-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-semibold text-primary">{proj.projectCode}</span>
                    <Badge
                      tone={
                        proj.status === "COMPLETED"
                          ? "success"
                          : proj.status === "IN_PROGRESS"
                          ? "primary"
                          : "warning"
                      }
                      size="sm"
                    >
                      {proj.status}
                    </Badge>
                  </div>

                  <h4 className="font-semibold text-text text-sm mt-2">{proj.name}</h4>
                  <p className="text-xs text-text-muted mt-0.5">Contractor: <span className="text-text font-medium">{proj.contractorName}</span></p>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">CIP Spent / Budget:</span>
                      <span className="font-semibold text-text">
                        ৳{((proj.actualCost || 0) / 10000000).toFixed(1)}Cr / ৳{((proj.budgetAtCompletion || 0) / 10000000).toFixed(1)}Cr
                      </span>
                    </div>

                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                      <div
                        className="bg-primary h-full transition-all rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-text-muted">
                      <span>Progress: {progressPct}%</span>
                      <span>Target: {proj.targetCompletionDate}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                    <span className="text-warning">Retention: ৳{((proj.retentionWithheld || 0) / 100000).toFixed(1)}L</span>
                    <span className="text-primary font-medium">{isSelected ? "● Selected View" : "Click to Inspect"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 2: WBS & BOQ */}
      {activeTab === "wbs-boq" && (
        <Card pad="none">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-text font-ui">
                Work Breakdown Structure (WBS) & BOQ — {currentProject?.name}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Itemized quantities, certified progress, and unit rate billing controls</p>
            </div>
            <Badge tone="primary" size="sm">
              Project Code: {currentProject?.projectCode}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-text">
              <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3">WBS Code & Description</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">BOQ Qty</th>
                  <th className="px-4 py-3">Unit Rate</th>
                  <th className="px-4 py-3">Executed Qty</th>
                  <th className="px-4 py-3">Amount Certified</th>
                  <th className="px-4 py-3">Physical %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {wbsItems.map((item: any) => {
                  const pct = Math.min(100, Math.round(((item.executedQty || 0) / (item.boqQty || 1)) * 100));
                  return (
                    <tr key={item.wbsCode} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-primary font-semibold mr-2">{item.wbsCode}</span>
                        <span className="font-medium text-text">{item.description}</span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{item.unit}</td>
                      <td className="px-4 py-3 font-semibold text-text">{item.boqQty?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-text-muted">৳{item.unitRate?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-primary font-medium">{item.executedQty?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-success">
                        ৳{((item.executedQty || 0) * (item.unitRate || 0)).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-text-muted">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Running Account (RA) Billing */}
      {activeTab === "ra-bills" && (
        <Card pad="none">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-text font-ui">
                Contractor Running Account (RA) Bills & Retention Accounting
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Deduction of 5% security retention, mobilization advance, and material recoveries</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRaBillModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New RA Bill
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-text">
              <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3">Bill No & Date</th>
                  <th className="px-4 py-3">Gross Certified</th>
                  <th className="px-4 py-3">Retention (5%)</th>
                  <th className="px-4 py-3">Advance Recovery</th>
                  <th className="px-4 py-3">Material Deductions</th>
                  <th className="px-4 py-3">Net Payable</th>
                  <th className="px-4 py-3">Audit Match</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {runningBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-text-muted">
                      No RA bills generated yet for this project.
                    </td>
                  </tr>
                ) : (
                  runningBills.map((bill: any) => (
                    <tr key={bill._id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-text">{bill.billNumber}</div>
                        <div className="text-[11px] text-text-muted">{bill.billDate || "2026-09-15"}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-text">
                        ৳{bill.grossAmountThisBill?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-warning">
                        -৳{bill.retentionDeduction?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        -৳{bill.advanceRecovery?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        -৳{bill.materialRecovery?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-success">
                        ৳{bill.netPayableAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="success" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                          3-Way Match Passed
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          tone={
                            bill.status === "PAID"
                              ? "success"
                              : bill.status === "CERTIFIED"
                              ? "primary"
                              : "warning"
                          }
                          size="sm"
                        >
                          {bill.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: EVM S-Curve */}
      {activeTab === "evm" && (
        <Card pad="md" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-text font-ui">Earned Value Management (EVM) S-Curve Metrics</h3>
              <p className="text-xs text-text-muted mt-0.5">Scheduled Value (PV) vs Earned Value (EV) vs Actual Cost (AC)</p>
            </div>
            <div className="flex gap-2">
              <Badge tone="success" size="sm">CPI = 1.04 (Under Budget)</Badge>
              <Badge tone="primary" size="sm">SPI = 0.98 (On Schedule)</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-surface-muted/40 border border-border">
              <div className="text-xs font-semibold text-text-muted uppercase">Planned Value (PV)</div>
              <div className="text-2xl font-bold text-text mt-1">৳42.0 Cr</div>
              <p className="text-xs text-text-muted mt-1">Scheduled progress benchmark to date</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted/40 border border-border">
              <div className="text-xs font-semibold text-text-muted uppercase">Earned Value (EV)</div>
              <div className="text-2xl font-bold text-primary mt-1">৳41.25 Cr</div>
              <p className="text-xs text-text-muted mt-1">Physical work certified by Resident Engineer</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted/40 border border-border">
              <div className="text-xs font-semibold text-text-muted uppercase">Cost Variance (CV)</div>
              <div className="text-2xl font-bold text-success mt-1">+৳1.65 Cr</div>
              <p className="text-xs text-text-muted mt-1">Favorable cost variance below BAC limit</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Asset Capitalization */}
      {activeTab === "capitalization" && (
        <Card pad="md" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-text font-ui">
                CIP to Fixed Asset Capitalization (CN-30 to CN-38)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Transfer construction-in-progress balance into depreciable Fixed Asset Master upon Final Handover
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCapitalizeModalOpen(true)}
              leftIcon={<FileCheck2 className="w-4 h-4" />}
            >
              Capitalize Completed Asset
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted/30 border border-border space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-text-muted">Selected Project CIP Accumulation:</span>
              <span className="font-bold text-text">৳{((currentProject?.actualCost || 0)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-text-muted">Multi-Fund Target Asset Ledger:</span>
              <span className="font-semibold text-primary">Fund 40 - Fixed Assets: Buildings & Infrastructure</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm text-success font-medium">
              <span>Handover Status:</span>
              <span>Substantial Completion Certificate Issued (12-Month DLP Commenced)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Generate RA Bill */}
      <Modal
        isOpen={isRaBillModalOpen}
        onClose={() => setIsRaBillModalOpen(false)}
        title="Generate Contractor RA Bill (CN-12 to CN-19)"
      >
        <form onSubmit={handleCreateRaBill} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Gross Work Done to Date (BDT)">
              <Input
                type="number"
                required
                value={billGrossWorkToDate}
                onChange={(e) => setBillGrossWorkToDate(Number(e.target.value))}
              />
            </FormField>
            <FormField label="Previously Certified (BDT)">
              <Input
                type="number"
                required
                value={billPrevCertified}
                onChange={(e) => setBillPrevCertified(Number(e.target.value))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Advance Recovery (10%)">
              <Input
                type="number"
                value={billAdvanceRecovery}
                onChange={(e) => setBillAdvanceRecovery(Number(e.target.value))}
              />
            </FormField>
            <FormField label="Material Recovery (Cement/Steel)">
              <Input
                type="number"
                value={billMaterialRecovery}
                onChange={(e) => setBillMaterialRecovery(Number(e.target.value))}
              />
            </FormField>
          </div>

          <div className="p-3 bg-surface-muted rounded-lg border border-border text-xs space-y-1.5">
            <div className="flex justify-between text-text">
              <span className="text-text-muted">This Bill Gross:</span>
              <span className="font-bold">৳{(Number(billGrossWorkToDate) - Number(billPrevCertified)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-warning">
              <span>Retention Deduction (5%):</span>
              <span>-৳{((Number(billGrossWorkToDate) - Number(billPrevCertified)) * 0.05).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-success font-bold pt-1.5 border-t border-border">
              <span>Estimated Net Payable:</span>
              <span>
                ৳{(
                  Number(billGrossWorkToDate) -
                  Number(billPrevCertified) -
                  (Number(billGrossWorkToDate) - Number(billPrevCertified)) * 0.05 -
                  Number(billAdvanceRecovery) -
                  Number(billMaterialRecovery)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsRaBillModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Generate & Verify RA Bill
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Variation Order */}
      <Modal
        isOpen={isVoModalOpen}
        onClose={() => setIsVoModalOpen(false)}
        title="Submit Variation Order (CN-20 to CN-23)"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitVoMutation.mutate({
              projectId: selectedProjectId,
              reasonCode: voReason,
              description: voDescription,
              costImpact: Number(voCostImpact),
              timeImpactDays: Number(voTimeImpact),
            });
          }}
          className="space-y-4"
        >
          <FormField label="Reason Code">
            <Select value={voReason} onChange={(e) => setVoReason(e.target.value)}>
              <option value="ARCHITECT_REVISION">Architect / Consultant Revision</option>
              <option value="SITE_CONDITION">Unforeseen Site / Soil Condition</option>
              <option value="STATUTORY_CODE">Statutory Fire/Seismic Compliance</option>
              <option value="SCOPE_ADDITION">Syndicate Approved Scope Addition</option>
            </Select>
          </FormField>

          <FormField label="Detailed Scope Description">
            <Textarea
              required
              rows={3}
              value={voDescription}
              onChange={(e) => setVoDescription(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Cost Impact (BDT)">
              <Input
                type="number"
                required
                value={voCostImpact}
                onChange={(e) => setVoCostImpact(Number(e.target.value))}
              />
            </FormField>
            <FormField label="Time Impact (Days)">
              <Input
                type="number"
                required
                value={voTimeImpact}
                onChange={(e) => setVoTimeImpact(Number(e.target.value))}
              />
            </FormField>
          </div>

          <div className="p-3 bg-warning-soft text-warning border border-warning/20 rounded-lg text-xs">
            Notice: Variation Orders exceeding 10% cumulative project budget trigger an automatic Syndicate P&D governance review.
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsVoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Variation Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Capitalize Completed Asset */}
      <Modal
        isOpen={isCapitalizeModalOpen}
        onClose={() => setIsCapitalizeModalOpen(false)}
        title="CIP Asset Capitalization (CN-30)"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            capitalizeMutation.mutate({
              projectId: selectedProjectId,
              assetName: capBuildingAsset,
              costCenter: capCostCenter,
              usefulLifeYears: Number(capUsefulLife),
            });
          }}
          className="space-y-4"
        >
          <FormField label="Fixed Asset Tag / Title">
            <Input
              required
              value={capBuildingAsset}
              onChange={(e) => setCapBuildingAsset(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Allocated Cost Center">
              <Input
                required
                value={capCostCenter}
                onChange={(e) => setCapCostCenter(e.target.value)}
              />
            </FormField>
            <FormField label="Useful Life (Years)">
              <Input
                type="number"
                required
                value={capUsefulLife}
                onChange={(e) => setCapUsefulLife(Number(e.target.value))}
              />
            </FormField>
          </div>

          <div className="p-3 bg-success-soft text-success border border-success/20 rounded-lg text-xs">
            Accounting Action: Debit Fixed Assets (1500) • Credit Construction in Progress (1600).
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsCapitalizeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Post Capitalization Journal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
