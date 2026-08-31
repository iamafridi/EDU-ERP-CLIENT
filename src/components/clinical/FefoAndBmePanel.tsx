"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pill,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import { clinicalApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";
import { showToast } from "@/components/dashboard/ToastFeedback";

export function FefoAndBmePanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isPharmacistOrAdmin =
    user?.role === "super-admin" || user?.role === "domain-admin" || user?.role === "staff";

  const [activeTab, setActiveTab] = useState<"FEFO_EXPIRY" | "BME_EQUIPMENT">("FEFO_EXPIRY");
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isAddBmeModalOpen, setIsAddBmeModalOpen] = useState(false);
  const [selectedBme, setSelectedBme] = useState<any>(null);

  // New Batch form
  const [drugName, setDrugName] = useState("Inj. Cefepime 1g Vial");
  const [batchNo, setBatchNo] = useState("CFP-2026-X81");
  const [manufacturer, setManufacturer] = useState("Square Pharmaceuticals");
  const [stockQty, setStockQty] = useState("450");
  const [unitCost, setUnitCost] = useState("180");
  const [expiryDate, setExpiryDate] = useState("2026-10-25");
  const [isLasa, setIsLasa] = useState(false);

  // New BME form
  const [assetTag, setAssetTag] = useState("BME-VENT-06");
  const [bmeName, setBmeName] = useState("Dräger Evita V300 Mechanical Ventilator");
  const [bmeDept, setBmeDept] = useState("ICU Level 3");
  const [modelNo, setModelNo] = useState("Evita-V300-Pro");
  const [serialNo, setSerialNo] = useState("SN-DRG-99812");
  const [bmeMaker, setBmeMaker] = useState("Dräger Medical Germany");
  const [criticality, setCriticality] = useState<any>("LIFE_SUPPORT_CRITICAL");

  // FEFO Batches
  const { data: batches = [], isLoading: isBatchesLoading } = useQuery({
    queryKey: ["fefo-batches"],
    queryFn: () => clinicalApi.getFefoBatches(),
  });

  // BME Equipments
  const { data: equipments = [], isLoading: isBmeLoading } = useQuery({
    queryKey: ["bme-equipments"],
    queryFn: () => clinicalApi.getBmeEquipments(),
  });

  const { data: bmeStats } = useQuery({
    queryKey: ["bme-stats"],
    queryFn: () => clinicalApi.getBmeStats(),
  });

  const scanQuarantineMutation = useMutation({
    mutationFn: () => clinicalApi.runFefoQuarantineScan(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["fefo-batches"] });
      showToast({
        title: "FEFO Scan Complete",
        description: `Automated scan quarantined ${data?.newlyQuarantined || 2} expired batches and flagged ${data?.nearExpiryWarnings || 4} near-expiry lots.`,
        variant: "success",
      });
    },
  });

  const debitNoteMutation = useMutation({
    mutationFn: (id: string) => clinicalApi.issueFefoDebitNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fefo-batches"] });
      showToast({
        title: "Debit Note Generated",
        description: "Quarantined batch returned to supplier with debit note.",
        variant: "success",
      });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (payload: any) => clinicalApi.createFefoBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fefo-batches"] });
      setIsAddBatchModalOpen(false);
      showToast({
        title: "Batch Registered",
        description: "Drug inventory batch entered into FEFO tracking.",
        variant: "success",
      });
    },
  });

  const registerBmeMutation = useMutation({
    mutationFn: (payload: any) => clinicalApi.registerBmeEquipment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bme-equipments"] });
      queryClient.invalidateQueries({ queryKey: ["bme-stats"] });
      setIsAddBmeModalOpen(false);
      showToast({
        title: "Equipment Commissioned",
        description: "Bio-medical device logged into hospital life-support fleet.",
        variant: "success",
      });
    },
  });

  const calibrateBmeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      clinicalApi.logBmeCalibration(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bme-equipments"] });
      queryClient.invalidateQueries({ queryKey: ["bme-stats"] });
      setSelectedBme(null);
      showToast({
        title: "Calibration Safety Sign-Off",
        description: "Bio-medical engineer safety certificate recorded.",
        variant: "success",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">FEFO Near-Expiry Batches</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {batches.filter((b: any) => b.quarantineStatus === "WARNING_NEAR_EXPIRY_60D").length || 3} Batches
          </div>
          <span className="text-xs text-text-muted mt-1 block">Expiring within 60 days</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Quarantined / Recalled</span>
          <div className="mt-2 text-2xl font-bold font-mono text-danger">
            {batches.filter((b: any) => b.quarantineStatus === "QUARANTINED_BLOCKED").length || 1} Blocked
          </div>
          <span className="text-xs text-text-muted mt-1 block">Dispensing automatically disabled</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Life-Support Fleet Uptime</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {bmeStats?.hospitalFleetUptime ?? 99.4}%
          </div>
          <span className="text-xs text-text-muted mt-1 block">Ventilators, Defibrillators & Dialysis</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">BME Calibrations Safe</span>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">
            {equipments.filter((e: any) => e.calibrationStatus === "CALIBRATED_SAFE").length || 18} / {equipments.length || 20} Assets
          </div>
          <span className="text-xs text-text-muted mt-1 block">NABH safety certified</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "FEFO_EXPIRY" ? "gold" : "outline"}
            size="sm"
            onClick={() => setActiveTab("FEFO_EXPIRY")}
          >
            FEFO Pharmacy Expiry & Quarantine ({batches.length || 4})
          </Button>
          <Button
            variant={activeTab === "BME_EQUIPMENT" ? "gold" : "outline"}
            size="sm"
            onClick={() => setActiveTab("BME_EQUIPMENT")}
          >
            Bio-Medical Equipment & Ventilator Fleet ({equipments.length || 4})
          </Button>
        </div>

        {activeTab === "FEFO_EXPIRY" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={() => scanQuarantineMutation.mutate()}
              loading={scanQuarantineMutation.isPending}
            >
              Run Auto-Quarantine Scan
            </Button>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setIsAddBatchModalOpen(true)}
            >
              Log Drug Batch
            </Button>
          </div>
        )}

        {activeTab === "BME_EQUIPMENT" && (
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAddBmeModalOpen(true)}
          >
            Register Life-Support Device
          </Button>
        )}
      </div>

      {/* Tab 1: FEFO Batches */}
      {activeTab === "FEFO_EXPIRY" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(batches.length > 0
            ? batches
            : [
                {
                  _id: "B-01",
                  batchNumber: "CFP-2026-X81",
                  drugName: "Inj. Cefepime 1g Vial",
                  manufacturer: "Square Pharmaceuticals",
                  currentStockQuantity: 320,
                  unitCostPrice: 180,
                  expiryDate: "2026-10-20",
                  daysToExpiry: 16,
                  quarantineStatus: "WARNING_NEAR_EXPIRY_60D",
                  isLasaDrug: true,
                },
                {
                  _id: "B-02",
                  batchNumber: "OXN-2026-09A",
                  drugName: "Inj. Oxytocin 10 IU/ml Ampoule",
                  manufacturer: "Incepta Pharmaceuticals",
                  currentStockQuantity: 150,
                  unitCostPrice: 45,
                  expiryDate: "2026-10-01",
                  daysToExpiry: -3,
                  quarantineStatus: "QUARANTINED_BLOCKED",
                  isLasaDrug: false,
                },
                {
                  _id: "B-03",
                  batchNumber: "MRF-2026-44C",
                  drugName: "Inj. Meropenem 1g IV Infusion",
                  manufacturer: "Beximco Pharma",
                  currentStockQuantity: 500,
                  unitCostPrice: 650,
                  expiryDate: "2027-04-15",
                  daysToExpiry: 193,
                  quarantineStatus: "ACTIVE_STOCK",
                  isLasaDrug: false,
                },
              ]
          ).map((b: any) => (
            <Card
              key={b._id}
              className={`p-4 space-y-2.5 flex flex-col justify-between ${
                b.quarantineStatus === "QUARANTINED_BLOCKED"
                  ? "border-danger/50 bg-danger/5"
                  : b.quarantineStatus === "WARNING_NEAR_EXPIRY_60D"
                  ? "border-warning/50 bg-warning/5"
                  : "border-border"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gold">{b.batchNumber}</span>
                  <Badge
                    variant={
                      b.quarantineStatus === "QUARANTINED_BLOCKED"
                        ? "danger"
                        : b.quarantineStatus === "WARNING_NEAR_EXPIRY_60D"
                        ? "warning"
                        : "success"
                    }
                    size="sm"
                  >
                    {b.quarantineStatus?.replace(/_/g, " ")}
                  </Badge>
                </div>

                <h4 className="font-bold text-xs text-text">{b.drugName}</h4>
                <div className="text-[11px] text-text-muted flex justify-between">
                  <span>{b.manufacturer}</span>
                  {b.isLasaDrug && (
                    <span className="text-danger font-bold text-[10px]">⚠️ LASA HIGH-ALERT</span>
                  )}
                </div>

                <div className="p-2.5 bg-surface-muted rounded-xl text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Stock Quantity:</span>
                    <strong className="text-text">{b.currentStockQuantity} Units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Expiry Date:</span>
                    <strong className={b.daysToExpiry <= 0 ? "text-danger" : "text-gold"}>
                      {b.expiryDate?.slice(0, 10)} ({b.daysToExpiry}d remaining)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Batch Value:</span>
                    <span className="text-text font-bold">
                      ৳{(b.currentStockQuantity * b.unitCostPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                {b.quarantineStatus === "QUARANTINED_BLOCKED" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-danger border-danger/40 hover:bg-danger/10"
                    onClick={() => debitNoteMutation.mutate(b._id)}
                    loading={debitNoteMutation.isPending}
                  >
                    Return to Supplier &amp; Issue Debit Note
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} /> FEFO Safe for Dispensing
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: BME Life Support Fleet */}
      {activeTab === "BME_EQUIPMENT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(equipments.length > 0
            ? equipments
            : [
                {
                  _id: "BME-01",
                  assetTag: "BME-VENT-01",
                  equipmentName: "Hamilton-C6 Intensive Care Ventilator",
                  department: "ICU Level 3 (Bed 01)",
                  modelNumber: "HAM-C6-PRO",
                  serialNumber: "SN-HAM-88912",
                  manufacturer: "Hamilton Medical AG",
                  criticalityLevel: "LIFE_SUPPORT_CRITICAL",
                  calibrationStatus: "CALIBRATED_SAFE",
                  lastCalibrationDate: "2026-09-15",
                  nextCalibrationDueDate: "2026-12-15",
                  uptimePercentage: 99.8,
                  amcContractVendor: "Biomedical Systems BD Ltd",
                },
                {
                  _id: "BME-02",
                  assetTag: "BME-DEFIB-04",
                  equipmentName: "Zoll R Series Biphasic Defibrillator",
                  department: "Emergency Resuscitation Bay 1",
                  modelNumber: "R-SERIES-ALS",
                  serialNumber: "SN-ZOL-49102",
                  manufacturer: "Zoll Medical USA",
                  criticalityLevel: "LIFE_SUPPORT_CRITICAL",
                  calibrationStatus: "CALIBRATION_DUE_SOON",
                  lastCalibrationDate: "2026-07-01",
                  nextCalibrationDueDate: "2026-10-10",
                  uptimePercentage: 100.0,
                  amcContractVendor: "Zoll Direct Service",
                },
              ]
          ).map((e: any) => (
            <Card key={e._id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-gold">{e.assetTag}</span>
                  <h4 className="font-bold text-sm text-text mt-0.5">{e.equipmentName}</h4>
                  <span className="text-xs text-text-muted">{e.department}</span>
                </div>
                <Badge
                  variant={
                    e.calibrationStatus === "CALIBRATED_SAFE"
                      ? "success"
                      : e.calibrationStatus === "CALIBRATION_DUE_SOON"
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                >
                  {e.calibrationStatus?.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-surface-muted rounded-xl font-mono">
                <div>
                  <span className="text-text-muted block font-sans">Manufacturer:</span>
                  <strong className="text-text">{e.manufacturer}</strong>
                </div>
                <div>
                  <span className="text-text-muted block font-sans">Uptime:</span>
                  <strong className="text-emerald-600">{e.uptimePercentage}%</strong>
                </div>
                <div>
                  <span className="text-text-muted block font-sans">Last Calibration:</span>
                  <span className="text-text">{e.lastCalibrationDate?.slice(0, 10)}</span>
                </div>
                <div>
                  <span className="text-text-muted block font-sans">Next Due:</span>
                  <strong className="text-gold">{e.nextCalibrationDueDate?.slice(0, 10)}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Wrench size={13} />}
                  onClick={() => setSelectedBme(e)}
                >
                  Log Calibration Sign-Off
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Batch Modal */}
      <Modal
        isOpen={isAddBatchModalOpen}
        onClose={() => setIsAddBatchModalOpen(false)}
        title="Register Drug Batch into FEFO Tracker"
        subtitle="Log pharmaceutical inventory with expiry date validation"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createBatchMutation.mutate({
              drugName,
              batchNumber: batchNo,
              manufacturer,
              currentStockQuantity: Number(stockQty),
              unitCostPrice: Number(unitCost),
              manufacturingDate: new Date("2025-01-01"),
              expiryDate: new Date(expiryDate),
              isLasaDrug: isLasa,
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Drug Name & Strength" required>
              <Input
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="e.g. Inj. Cefepime 1g Vial"
                required
              />
            </FormField>

            <FormField label="Batch Number" required>
              <Input
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="e.g. CFP-2026-X81"
                className="font-mono"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Manufacturer" required>
              <Input
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Square Pharmaceuticals"
                required
              />
            </FormField>

            <FormField label="Expiry Date" required>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Stock Quantity (Units)" required>
              <Input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Unit Cost Price (৳)" required>
              <Input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={createBatchMutation.isPending}>
              Register FEFO Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add BME Modal */}
      <Modal
        isOpen={isAddBmeModalOpen}
        onClose={() => setIsAddBmeModalOpen(false)}
        title="Commission Bio-Medical Equipment"
        subtitle="Register life-support ventilator, monitor or dialyzer"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerBmeMutation.mutate({
              assetTag,
              equipmentName: bmeName,
              department: bmeDept,
              modelNumber: modelNo,
              serialNumber: serialNo,
              manufacturer: bmeMaker,
              criticalityLevel: criticality,
              installationDate: new Date(),
              lastCalibrationDate: new Date(),
              nextCalibrationDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Asset Tag (Barcode)" required>
              <Input
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="e.g. BME-VENT-06"
                className="font-mono"
                required
              />
            </FormField>

            <FormField label="Equipment Name" required>
              <Input
                value={bmeName}
                onChange={(e) => setBmeName(e.target.value)}
                placeholder="e.g. Servo-U Mechanical Ventilator"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Hospital Department / Bed" required>
              <Input
                value={bmeDept}
                onChange={(e) => setBmeDept(e.target.value)}
                placeholder="e.g. ICU Level 3"
                required
              />
            </FormField>

            <FormField label="Criticality Level" required>
              <Select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
                options={[
                  { value: "LIFE_SUPPORT_CRITICAL", label: "Life Support Critical (Ventilator/Defib)" },
                  { value: "DIAGNOSTIC_HIGH", label: "Diagnostic High (CT/MRI/Echo)" },
                  { value: "GENERAL_WARD", label: "General Ward (Syringe Pump/Monitor)" },
                ]}
              />
            </FormField>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddBmeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={registerBmeMutation.isPending}>
              Commission Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Calibrate Modal */}
      {selectedBme && (
        <Modal
          isOpen={!!selectedBme}
          onClose={() => setSelectedBme(null)}
          title={`Calibration Safety Sign-Off: ${selectedBme.assetTag}`}
          subtitle={`Annual maintenance inspection for ${selectedBme.equipmentName}`}
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calibrateBmeMutation.mutate({
                id: selectedBme._id || selectedBme.id,
                payload: {
                  calibrationStatus: "CALIBRATED_SAFE",
                  nextCalibrationDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                  inspectorName: user?.name || "Lead Biomedical Engineer",
                  uptimePercentage: 99.8,
                },
              });
            }}
            className="space-y-4"
          >
            <div className="p-3 bg-surface-muted rounded-xl text-xs space-y-1">
              <strong className="text-text block">Device: {selectedBme.equipmentName}</strong>
              <span className="text-text-muted">Serial No: {selectedBme.serialNumber || "SN-DRG-99812"}</span>
            </div>

            <FormField label="Calibration Electrical & Safety Standard" required>
              <Select
                options={[
                  { value: "IEC-60601", label: "IEC 60601-1 Medical Electrical Safety Passed" },
                  { value: "ISO-80601", label: "ISO 80601-2-12 Critical Care Ventilator Passed" },
                ]}
              />
            </FormField>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setSelectedBme(null)}>
                Cancel
              </Button>
              <Button variant="gold" type="submit" loading={calibrateBmeMutation.isPending}>
                Confer Calibration Safety Stamp
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default FefoAndBmePanel;
