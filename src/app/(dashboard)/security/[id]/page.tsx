"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Select,
  Textarea,
  Checkbox,
  Button,
  Badge,
} from "@/components/ui";

const gateEntrySchema = zod.object({
  type: zod.enum(["student", "visitor", "vehicle"]),
  personName: zod.string().min(2, "Name is required"),
  contactNo: zod.string().optional(),
  vehicleNumber: zod.string().optional(),
  purpose: zod.string().min(3, "Purpose is required"),
  isLateEntry: zod.boolean(),
  lateEntryReason: zod.string().optional(),
});

type GateEntryFormValues = zod.infer<typeof gateEntrySchema>;

const visitorPassSchema = zod.object({
  visitorName: zod.string().min(2, "Visitor name is required"),
  contactNo: zod.string().min(5, "Contact number is required"),
  email: zod.string().email("Invalid email").optional().or(zod.literal("")),
  purpose: zod.string().min(3, "Purpose is required"),
  vehicleNumber: zod.string().optional(),
});

type VisitorPassFormValues = zod.infer<typeof visitorPassSchema>;

const patrolLogSchema = zod.object({
  location: zod.string().min(2, "Location is required"),
  status: zod.enum(["active", "completed"]),
  notes: zod.string().optional(),
});

type PatrolLogFormValues = zod.infer<typeof patrolLogSchema>;

export default function SecurityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "gate" | "visitor" | "patrol") || "gate";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isGuardOrAdmin =
    roleIs("domain-admin", "super-admin") ||
    user?.staffSubRole === "warden" ||
    user?.staffSubRole === "guard";

  const { data: gateEntries = [], isLoading: isLoadingGate } = useQuery({
    queryKey: ["gateEntries"],
    queryFn: api.getGateEntries,
  });
  const { data: visitorLogs = [], isLoading: isLoadingVisitor } = useQuery({
    queryKey: ["visitorLogs"],
    queryFn: api.getVisitorLogs,
  });
  const { data: patrolLogs = [], isLoading: isLoadingPatrol } = useQuery({
    queryKey: ["patrolLogs"],
    queryFn: api.getPatrolLogs,
  });

  const item =
    type === "gate"
      ? gateEntries.find((e: any) => e.id === params.id)
      : type === "visitor"
      ? visitorLogs.find((v: any) => v.id === params.id)
      : patrolLogs.find((p: any) => p.id === params.id);

  const updateGateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateGateEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      setSuccessMsg("Gate entry updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const updateVisitorMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateVisitorLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor log updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const updatePatrolMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updatePatrolLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrolLogs"] });
      setSuccessMsg("Patrol log updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteGateMutation = useMutation({
    mutationFn: api.deleteGateEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      router.push("/security");
    },
  });

  const deleteVisitorMutation = useMutation({
    mutationFn: api.deleteVisitorLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      router.push("/security");
    },
  });

  const deletePatrolMutation = useMutation({
    mutationFn: api.deletePatrolLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrolLogs"] });
      router.push("/security");
    },
  });

  const {
    register: registerGate,
    handleSubmit: handleSubmitGate,
    reset: resetGate,
    watch: watchGate,
    formState: { errors: gateErrors },
  } = useForm<GateEntryFormValues>({ resolver: zodResolver(gateEntrySchema) });

  const {
    register: registerVisitor,
    handleSubmit: handleSubmitVisitor,
    reset: resetVisitor,
    formState: { errors: visitorErrors },
  } = useForm<VisitorPassFormValues>({ resolver: zodResolver(visitorPassSchema) });

  const {
    register: registerPatrol,
    handleSubmit: handleSubmitPatrol,
    reset: resetPatrol,
    formState: { errors: patrolErrors },
  } = useForm<PatrolLogFormValues>({ resolver: zodResolver(patrolLogSchema) });

  useEffect(() => {
    if (!item) return;
    if (type === "gate") {
      resetGate({
        type: item.type || "student",
        personName: item.personName || "",
        contactNo: item.contactNo || "",
        vehicleNumber: item.vehicleNumber || "",
        purpose: item.purpose || "",
        isLateEntry: item.isLateEntry || false,
        lateEntryReason: item.lateEntryReason || "",
      });
    } else if (type === "visitor") {
      resetVisitor({
        visitorName: item.visitorName || "",
        contactNo: item.contactNo || "",
        email: item.email || "",
        purpose: item.purpose || "",
        vehicleNumber: item.vehicleNumber || "",
      });
    } else {
      resetPatrol({
        location: item.location || "",
        status: item.status || "active",
        notes: item.notes || "",
      });
    }
  }, [item, type, resetGate, resetVisitor, resetPatrol]);

  const onSubmitGate = (values: GateEntryFormValues) => {
    if (!item) return;
    updateGateMutation.mutate({ id: item.id, payload: values });
  };

  const onSubmitVisitor = (values: VisitorPassFormValues) => {
    if (!item) return;
    updateVisitorMutation.mutate({ id: item.id, payload: values });
  };

  const onSubmitPatrol = (values: PatrolLogFormValues) => {
    if (!item) return;
    updatePatrolMutation.mutate({ id: item.id, payload: values });
  };

  const handleDelete = () => {
    if (!item) return;
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    if (type === "gate") deleteGateMutation.mutate(item.id);
    else if (type === "visitor") deleteVisitorMutation.mutate(item.id);
    else deletePatrolMutation.mutate(item.id);
  };

  const isPending =
    updateGateMutation.isPending ||
    updateVisitorMutation.isPending ||
    updatePatrolMutation.isPending ||
    deleteGateMutation.isPending ||
    deleteVisitorMutation.isPending ||
    deletePatrolMutation.isPending;

  const isLate = watchGate?.("isLateEntry");

  if (isLoadingGate || isLoadingVisitor || isLoadingPatrol) {
    return (
      <div className="p-12 text-center text-text-muted">
        <p className="text-sm">Loading security record...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm text-text-muted">Record not found or has been removed.</p>
        <Link href="/security">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Security
          </Button>
        </Link>
      </div>
    );
  }

  const titleMap: Record<string, string> = {
    gate: "Gate Entry & Curfew Check",
    visitor: "Visitor Pass Authorization",
    patrol: "Patrol Activity Record",
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title={titleMap[type] || "Security Log Details"}
        subtitle={`Viewing ${type} verification record`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/security">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Security
              </Button>
            </Link>
            {isGuardOrAdmin && (
              <>
                {!isEditing ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Pencil size={14} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      if (type === "gate") resetGate();
                      else if (type === "visitor") resetVisitor();
                      else resetPatrol();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  onClick={handleDelete}
                  loading={isPending}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <Card
        title={isEditing ? `Edit ${titleMap[type]}` : `${titleMap[type]} Specifications`}
        subtitle="Security audit tracking and entry timestamps"
      >
        {/* Gate Form / View */}
        {type === "gate" && (
          isEditing ? (
            <form onSubmit={handleSubmitGate(onSubmitGate)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Entry Category" required>
                  <Select {...registerGate("type")}>
                    <option value="student">Student / Resident</option>
                    <option value="visitor">Visitor / Guest</option>
                    <option value="vehicle">Delivery / Service Vehicle</option>
                  </Select>
                </FormField>
                <FormField label="Person Name" error={gateErrors.personName?.message} required>
                  <Input {...registerGate("personName")} />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Contact Phone">
                  <Input {...registerGate("contactNo")} className="font-mono" />
                </FormField>
                <FormField label="Vehicle Number">
                  <Input {...registerGate("vehicleNumber")} className="font-mono uppercase" />
                </FormField>
              </div>

              <FormField label="Purpose of Entry" error={gateErrors.purpose?.message} required>
                <Input {...registerGate("purpose")} />
              </FormField>

              <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3">
                <Checkbox
                  label="Flag as Late Curfew Entry"
                  description="Resident arrived past the designated dormitory curfew limit"
                  {...registerGate("isLateEntry")}
                />
                {isLate && (
                  <FormField label="Late Reason / Explanation" required>
                    <Input {...registerGate("lateEntryReason")} />
                  </FormField>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                  Save Entry
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Category</span>
                  <Badge variant="neutral" size="sm">{item.type}</Badge>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Person</span>
                  <span className="text-base font-bold text-text">{item.personName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Contact</span>
                  <span className="text-sm font-mono text-text">{item.contactNo || "—"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Vehicle</span>
                  <span className="text-sm font-mono font-bold text-text">{item.vehicleNumber || "Walk-in"}</span>
                </div>
              </div>

              <div className="p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Purpose</span>
                <p className="text-sm text-text font-medium">{item.purpose}</p>
              </div>

              <div className="p-4 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Curfew Check</span>
                  {item.isLateEntry ? (
                    <Badge variant="danger" size="sm">
                      <AlertTriangle size={12} className="inline mr-1" />
                      Late: {item.lateEntryReason}
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      <UserCheck size={12} className="inline mr-1" />
                      On-Time Check-in
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Timestamp</span>
                  <span className="text-sm font-mono text-text-muted">{new Date(item.entryTime).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Visitor Form / View */}
        {type === "visitor" && (
          isEditing ? (
            <form onSubmit={handleSubmitVisitor(onSubmitVisitor)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Visitor Name" error={visitorErrors.visitorName?.message} required>
                  <Input {...registerVisitor("visitorName")} />
                </FormField>
                <FormField label="Contact Phone" error={visitorErrors.contactNo?.message} required>
                  <Input {...registerVisitor("contactNo")} className="font-mono" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Email Address">
                  <Input type="email" {...registerVisitor("email")} />
                </FormField>
                <FormField label="Vehicle Number">
                  <Input {...registerVisitor("vehicleNumber")} className="font-mono uppercase" />
                </FormField>
              </div>

              <FormField label="Purpose of Visit" error={visitorErrors.purpose?.message} required>
                <Textarea {...registerVisitor("purpose")} rows={3} />
              </FormField>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                  Save Visitor
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Visitor</span>
                  <span className="text-base font-bold text-text">{item.visitorName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Contact</span>
                  <span className="text-sm font-mono text-text">{item.contactNo}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Vehicle</span>
                  <span className="text-sm font-mono font-bold text-text">{item.vehicleNumber || "Walk-in"}</span>
                </div>
              </div>

              <div className="p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Purpose</span>
                <p className="text-sm text-text font-medium">{item.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Entry Time</span>
                  <span className="text-sm font-mono text-text">{new Date(item.entryTime).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Exit Time</span>
                  <span className="text-sm font-mono text-text">
                    {item.exitTime ? new Date(item.exitTime).toLocaleString() : "Currently Inside"}
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Patrol Form / View */}
        {type === "patrol" && (
          isEditing ? (
            <form onSubmit={handleSubmitPatrol(onSubmitPatrol)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Patrol Location / Sector" error={patrolErrors.location?.message} required>
                  <Input {...registerPatrol("location")} />
                </FormField>
                <FormField label="Round Status" required>
                  <Select {...registerPatrol("status")}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </Select>
                </FormField>
              </div>

              <FormField label="Observations & Notes">
                <Textarea {...registerPatrol("notes")} rows={4} />
              </FormField>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                  Save Patrol Log
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Location</span>
                  <span className="text-base font-bold text-text flex items-center gap-1.5">
                    <MapPin size={14} className="text-gold" />
                    {item.location}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Status</span>
                  <Badge variant={item.status === "completed" ? "success" : "warning"} size="sm">
                    {item.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Timestamp</span>
                  <span className="text-sm font-mono text-text-muted">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Field Observations</span>
                <p className="text-sm text-text leading-relaxed">{item.notes || "No incidents or remarks recorded."}</p>
              </div>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
