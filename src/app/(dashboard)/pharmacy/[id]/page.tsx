"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Trash2, CheckCircle2, Pencil, ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  FormField,
  Input,
  Textarea,
} from "@/components/ui";

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editFields, setEditFields] = useState({ patientId: "", doctorId: "", date: "", notes: "" });

  const isPharmacist = user?.staffSubRole === "pharmacist" || roleIs("domain-admin", "super-admin");

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: api.getDrugs,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: api.getPrescriptions,
  });

  const { data: dispensings = [] } = useQuery({
    queryKey: ["dispensings"],
    queryFn: api.getDispensings,
  });

  const drugMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    (drugs as any[]).forEach((d: any) => { map[d.id] = d; });
    return map;
  }, [drugs]);

  const prescription = prescriptions.find((p: any) => p.id === params.id);
  const relatedDispensing = dispensings.find((d: any) => {
    const prxId = d.prescriptionId?.id || d.prescriptionId;
    return prxId === params.id;
  });

  const deletePrxMutation = useMutation({
    mutationFn: api.deletePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      router.push("/pharmacy");
    },
  });

  const updatePrxMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updatePrescription(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setSuccessMsg("Prescription updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const markDispensedMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateDispensing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensings"] });
      setSuccessMsg("Marked as dispensed.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleDelete = () => {
    if (confirm("Delete this prescription?")) {
      deletePrxMutation.mutate(params.id as string);
    }
  };

  const startEdit = () => {
    if (prescription) {
      setEditFields({
        patientId: prescription.patientId || "",
        doctorId: prescription.doctorId || "",
        date: prescription.date || "",
        notes: prescription.notes || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updatePrxMutation.mutate({ id: params.id as string, payload: editFields });
  };

  if (!prescription) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-text-muted">Prescription not found.</p>
        <Link href="/pharmacy" className="text-xs text-primary hover:underline mt-2 inline-block">
          Back to Pharmacy
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        eyebrow="Pharmacy Order Record"
        title="Prescription Details"
        description={`Record ID: ${prescription.id} • Registered under patient ${prescription.patientId}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pharmacy", href: "/pharmacy" },
          { label: prescription.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={startEdit}
                leftIcon={<Pencil size={14} />}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              leftIcon={<Trash2 size={14} />}
            >
              Delete
            </Button>
          </div>
        }
      />

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

      <Card pad="none">
        <div className="p-4 border-b border-border">
          <span className="text-xs font-bold text-text uppercase tracking-wider font-ui">Prescription Information</span>
        </div>
        {isEditing ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Patient ID">
                <Input
                  type="text"
                  value={editFields.patientId}
                  onChange={(e) => setEditFields((p) => ({ ...p, patientId: e.target.value }))}
                  className="font-mono"
                />
              </FormField>
              <FormField label="Doctor ID">
                <Input
                  type="text"
                  value={editFields.doctorId}
                  onChange={(e) => setEditFields((p) => ({ ...p, doctorId: e.target.value }))}
                  className="font-mono"
                />
              </FormField>
            </div>
            <FormField label="Date">
              <Input
                type="date"
                value={editFields.date}
                onChange={(e) => setEditFields((p) => ({ ...p, date: e.target.value }))}
              />
            </FormField>
            <FormField label="Notes">
              <Textarea
                value={editFields.notes}
                onChange={(e) => setEditFields((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </FormField>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                loading={updatePrxMutation.isPending}
                leftIcon={<Pencil size={14} />}
              >
                Update Prescription
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Patient</span>
                <p className="font-semibold text-text">{prescription.patientName || prescription.patientId}</p>
                <span className="text-[10px] text-text-muted font-mono">{prescription.patientId}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Doctor</span>
                <p className="font-semibold text-text">{prescription.doctorName || prescription.doctorId}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Date</span>
                <p className="font-mono text-text">{prescription.date}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Prescription ID</span>
                <p className="font-mono text-primary font-bold">{prescription.id}</p>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Notes</span>
              <p className="text-text-muted">{prescription.notes || "—"}</p>
            </div>
          </div>
        )}
      </Card>

      <Card pad="none">
        <div className="p-4 border-b border-border">
          <span className="text-xs font-bold text-text uppercase tracking-wider font-ui">Prescribed Drugs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-text">
            <thead className="bg-surface-muted text-xs uppercase font-medium text-text-muted border-b border-border">
              <tr>
                <th className="p-3">Drug</th>
                <th className="p-3">Dosage</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {(prescription.drugs || []).map((drug: any, i: number) => {
                const drugInfo = drugMap[drug.drugId];
                const displayName = drug.drugName || drugInfo?.name || drug.drugId;
                return (
                  <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-3">
                      <span className="font-semibold text-text">{displayName}</span>
                      <span className="text-[10px] text-text-muted font-mono block">{drug.drugId}</span>
                    </td>
                    <td className="p-3 font-mono text-text">{drug.dosage}</td>
                    <td className="p-3 text-text-muted">{drug.duration}</td>
                    <td className="p-3 text-text-muted">{drug.instructions || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card pad="none">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5 font-ui">
            <ShoppingCart size={16} className="text-primary" /> Dispensing Status
          </span>
          {relatedDispensing && !relatedDispensing.dispensedDate && isPharmacist && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => markDispensedMutation.mutate({ id: relatedDispensing.id, payload: { dispensedDate: new Date().toISOString().split("T")[0] } })}
              leftIcon={<CheckCircle2 size={13} />}
            >
              Mark Dispensed
            </Button>
          )}
        </div>
        {relatedDispensing ? (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Pharmacist</span>
                <p className="font-semibold text-text">{relatedDispensing.pharmacistName || relatedDispensing.pharmacistId}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Status</span>
                <Badge tone={relatedDispensing.dispensedDate ? "success" : "warning"} size="sm">
                  {relatedDispensing.dispensedDate ? "Dispensed" : "Pending"}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Dispensed Date</span>
                <p className="font-mono text-text">{relatedDispensing.dispensedDate || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Notes</span>
                <p className="text-text-muted">{relatedDispensing.notes || "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="text-text-subtle/40 mx-auto mb-2" />
            <p className="text-xs text-text-muted">No dispensing record for this prescription yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
