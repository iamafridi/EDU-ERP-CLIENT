"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Plus,
  CheckCircle2,
  ClipboardList,
  Trash2,
  ShoppingCart,
  Pencil,
  ShieldAlert,
  Lock,
  Key,
  ShieldCheck,
  Search,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { FefoAndBmePanel } from "@/components/clinical/FefoAndBmePanel";
import {
  PageHeader,
  Card,
  Tabs,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
} from "@/components/ui";

export default function PharmacyPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("fefo_expiry");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showVaultDispenseModal, setShowVaultDispenseModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<any>(null);

  // Vault Dispensation Form State
  const [vaultForm, setVaultForm] = useState({
    quantity: 2,
    patientId: "IPD-Bed 304 (Post-Op ICU)",
    doctorPin: "",
    witnessPin: "",
    indication: "Breakthrough acute post-operative pain",
  });

  const isPharmacist = user?.staffSubRole === "pharmacist" || roleIs("domain-admin", "super-admin");
  const isDoctor = user?.staffSubRole === "doctor" || roleIs("faculty", "super-admin");

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: api.getDrugs,
  });

  const { data: prescriptions = [], isLoading: loadingPrx } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: api.getPrescriptions,
  });

  const { data: dispensings = [], isLoading: loadingDisp } = useQuery({
    queryKey: ["dispensings"],
    queryFn: api.getDispensings,
  });

  const { data: vaultData } = useQuery({
    queryKey: ["controlledSubstanceVault"],
    queryFn: api.getControlledSubstanceVault,
  });

  const drugMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    (drugs as any[]).forEach((d: any) => {
      map[d.id] = d;
    });
    return map;
  }, [drugs]);

  const filteredPrx = searchTerm
    ? prescriptions.filter((p: any) =>
        (p.patientName || p.patientId)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : prescriptions;

  const deletePrxMutation = useMutation({
    mutationFn: api.deletePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setSuccessMsg("Prescription deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const dispenseVaultMutation = useMutation({
    mutationFn: api.dispenseControlledSubstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controlledSubstanceVault"] });
      setShowVaultDispenseModal(false);
      setSuccessMsg("Controlled narcotic dispensed. Dual cryptographic signatures recorded.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleOpenVaultDispense = (drug: any) => {
    setSelectedDrug(drug);
    setShowVaultDispenseModal(true);
  };

  const handleVaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispenseVaultMutation.mutate({
      drugId: selectedDrug?.id,
      ...vaultForm,
    });
  };

  const tabItems = [
    { id: "fefo_expiry", label: "FEFO Expiry & BME Fleet", icon: <Pill className="w-4 h-4" /> },
    { id: "narcotic_vault", label: "Controlled Narcotic Vault", icon: <Lock className="w-4 h-4" /> },
    { id: "prescriptions", label: "Prescriptions Queue", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "dispensing", label: "General Dispensary", icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        eyebrow="Clinical Pharmacy & Controlled Dispensary"
        title="Pharmacy, Formulary & Narcotic Vault"
        description="FEFO batch-expiry auto-quarantine, BME equipment uptime telemetry, and dual-auth forensic narcotic vault."
        actions={
          <div className="flex items-center gap-2.5">
            {(isPharmacist || isDoctor) && (
              <Link href="/pharmacy/new">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={15} />}
                >
                  New Prescription
                </Button>
              </Link>
            )}
          </div>
        }
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

      {/* ──── TAB 0: FEFO AUTO-QUARANTINE & BME FLEET ──── */}
      {activeTab === "fefo_expiry" && (
        <FefoAndBmePanel />
      )}

      {/* ──── TAB 1: CONTROLLED NARCOTIC VAULT ──── */}
      {activeTab === "narcotic_vault" && vaultData && (
        <div className="space-y-6">
          <Card pad="md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge tone="danger" size="sm" icon={<ShieldAlert className="w-3 h-3" />}>
                    DGDA Schedule-X & Schedule-H Forensic Vault
                  </Badge>
                  <Badge tone="success" size="sm">
                    {vaultData.vaultStatus}
                  </Badge>
                </div>
                <h2 className="text-lg font-bold text-text font-ui mt-1">Biometric Locked Narcotic & Controlled Drug Repository</h2>
                <p className="text-xs text-text-muted mt-0.5 max-w-xl">
                  Mandatory dual-authorization PIN protocol (Consultant BMDC PIN + Witness Sister In-Charge) for opioid and scheduled anaesthetic dispensation.
                </p>
              </div>

              <div className="text-xs space-y-1 bg-surface-muted p-3 rounded-xl border border-border shrink-0">
                <div>Chief Signatory: <span className="font-semibold text-text">{vaultData.vaultChiefSignatory}</span></div>
                <div>Head Pharmacist: <span className="font-semibold text-text">{vaultData.headPharmacist}</span></div>
              </div>
            </div>
          </Card>

          <Card pad="none">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text font-ui flex items-center gap-2">
                <Lock size={15} className="text-primary" /> Vault Inventory & Ampoule Thresholds
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-text">
                <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                  <tr>
                    <th className="p-3">Drug Formulation</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Batch / Expiry</th>
                    <th className="p-3 font-mono">Vault Stock</th>
                    <th className="p-3">Last Dispensation</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {vaultData.items.map((item: any) => {
                    const isLow = item.stockAmpoules <= item.minThreshold;

                    return (
                      <tr key={item.id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-text">{item.drugName}</div>
                          <div className="text-[10px] text-text-muted font-mono">Unit: ৳{item.unitPrice} / ampoule</div>
                        </td>
                        <td className="p-3">
                          <Badge tone="danger" size="sm">
                            {item.schedule.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-text">{item.batchNo}</div>
                          <div className="text-[10px] text-text-muted">Exp: {item.expiryDate}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isLow ? "text-danger" : "text-success"
                            }`}
                          >
                            {item.stockAmpoules} ampoules
                          </span>
                          {isLow && <div className="text-[10px] text-danger font-semibold">Below Min ({item.minThreshold})</div>}
                        </td>
                        <td className="p-3 text-text-muted">
                          <div className="text-text">{item.lastDispensedTo}</div>
                          <div className="text-[10px] text-text-muted">By: {item.dispensedBy}</div>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenVaultDispense(item)}
                            leftIcon={<Key size={13} />}
                          >
                            Dispense Dual-Auth
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Forensic Audit Log */}
          <Card pad="md" className="space-y-3">
            <h3 className="text-sm font-bold text-text font-ui flex items-center gap-2">
              <ShieldCheck size={16} className="text-success" /> Forensic Vault Audit Trail
            </h3>
            <div className="space-y-2">
              {vaultData.recentAuditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-surface-muted/50 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-text">{log.drugName}</span>
                    <span className="ml-2 font-mono text-primary font-bold">Qty: {log.quantity}</span>
                    <div className="text-text-muted mt-0.5">Patient: {log.recipientPatient} • Indication: {log.reason}</div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-mono text-text-subtle">{log.verificationHash}</div>
                    <div className="text-text font-medium mt-0.5">Doctor: {log.primaryDoctor} (Witness: {log.witness})</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ──── TAB 2: PRESCRIPTIONS QUEUE ──── */}
      {activeTab === "prescriptions" && (
        <Card pad="none">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5 font-ui">
              <ClipboardList size={16} className="text-primary" /> Active Outpatient & Inpatient Prescriptions
            </span>
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <Input
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>
          {loadingPrx ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={4} />
            </div>
          ) : filteredPrx.length === 0 ? (
            <p className="p-12 text-center text-xs text-text-muted">No prescriptions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-text">
                <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Drugs</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {filteredPrx.map((p: any) => (
                    <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="p-3">
                        <Link href={`/pharmacy/${p.id}`} className="font-bold text-text hover:text-primary block">
                          {p.patientName || p.patientId}
                        </Link>
                        <span className="text-[10px] text-text-muted font-mono block">{p.patientId}</span>
                      </td>
                      <td className="p-3 text-text-muted">{p.doctorName || p.doctorId}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(p.drugs || []).map((drug: any, i: number) => {
                            const drugInfo = drugMap[drug.drugId];
                            const displayName = drug.drugName || drugInfo?.name || drug.drugId;
                            return (
                              <Badge key={i} tone="info" size="sm">
                                {displayName} - {drug.dosage}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-text-muted">{p.date}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/pharmacy/${p.id}`}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-muted text-text-muted hover:text-text transition-colors"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm("Delete this prescription?")) deletePrxMutation.mutate(p.id);
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-danger-soft text-text-muted hover:text-danger transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ──── TAB 3: GENERAL DISPENSARY ──── */}
      {activeTab === "dispensing" && (
        <Card pad="none">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5 font-ui">
              <ShoppingCart size={16} className="text-primary" /> Dispensing Records
            </span>
          </div>
          {loadingDisp ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={4} />
            </div>
          ) : dispensings.length === 0 ? (
            <p className="p-12 text-center text-xs text-text-muted">No dispensing records recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-text">
                <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
                  <tr>
                    <th className="p-3">Dispensing ID</th>
                    <th className="p-3">Prescription</th>
                    <th className="p-3">Pharmacist</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 font-mono">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {dispensings.map((d: any) => (
                    <tr key={d.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{d.id}</td>
                      <td className="p-3 text-text font-medium">{d.prescriptionId}</td>
                      <td className="p-3 text-text-muted">{d.pharmacistName || d.pharmacistId}</td>
                      <td className="p-3">
                        <Badge tone="success" size="sm">
                          {d.status || "Dispensed"}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-text-muted">{d.date || "2026-10-02"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ──── MODAL: DUAL-AUTH NARCOTIC DISPENSATION ──── */}
      {selectedDrug && (
        <Modal
          isOpen={showVaultDispenseModal}
          onClose={() => setShowVaultDispenseModal(false)}
          title="Dual-Authorization Narcotic Dispensation"
          subtitle="MANDATORY FORENSIC AUDIT PROTOCOL"
        >
          <form onSubmit={handleVaultSubmit} className="space-y-4">
            <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs space-y-1 text-danger">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert size={14} /> Drug: {selectedDrug.drugName} ({selectedDrug.schedule})
              </div>
              <div>Batch: <span className="font-mono">{selectedDrug.batchNo}</span> • Available: <span className="font-bold">{selectedDrug.stockAmpoules} ampoules</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Quantity (Ampoules)">
                <Input
                  type="number"
                  min={1}
                  max={selectedDrug.stockAmpoules}
                  required
                  value={vaultForm.quantity}
                  onChange={(e) => setVaultForm({ ...vaultForm, quantity: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Recipient Patient / Bed">
                <Input
                  type="text"
                  required
                  value={vaultForm.patientId}
                  onChange={(e) => setVaultForm({ ...vaultForm, patientId: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Clinical Indication">
              <Input
                type="text"
                required
                value={vaultForm.indication}
                onChange={(e) => setVaultForm({ ...vaultForm, indication: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <FormField label="Consultant Doctor PIN">
                <Input
                  type="password"
                  placeholder="6-digit BMDC PIN"
                  required
                  value={vaultForm.doctorPin}
                  onChange={(e) => setVaultForm({ ...vaultForm, doctorPin: e.target.value })}
                />
              </FormField>
              <FormField label="Witness Nurse PIN">
                <Input
                  type="password"
                  placeholder="Witness Staff PIN"
                  required
                  value={vaultForm.witnessPin}
                  onChange={(e) => setVaultForm({ ...vaultForm, witnessPin: e.target.value })}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowVaultDispenseModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={dispenseVaultMutation.isPending}
                leftIcon={<Lock size={14} />}
              >
                Authorize & Dispense
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
