"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Shield, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
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

export default function NewSecurityEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType =
    searchParams.get("type") === "visitor"
      ? "visitor"
      : searchParams.get("type") === "patrol"
      ? "patrol"
      : "gate";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<"gate" | "visitor" | "patrol">(initialType);
  const [successMsg, setSuccessMsg] = useState("");

  const isGuardOrAdmin =
    roleIs("domain-admin", "super-admin") ||
    user?.staffSubRole === "warden" ||
    user?.staffSubRole === "guard";

  if (!isGuardOrAdmin) {
    router.push("/security");
    return null;
  }

  const createGateEntryMutation = useMutation({
    mutationFn: api.createGateEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      setSuccessMsg("Gate entry check-in logged successfully.");
      setTimeout(() => router.push("/security"), 1500);
    },
  });

  const createVisitorLogMutation = useMutation({
    mutationFn: api.createVisitorLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor pass pre-approval registered.");
      setTimeout(() => router.push("/security"), 1500);
    },
  });

  const createPatrolLogMutation = useMutation({
    mutationFn: api.createPatrolLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrolLogs"] });
      setSuccessMsg("Patrol log created successfully.");
      setTimeout(() => router.push("/security"), 1500);
    },
  });

  const {
    register: registerGate,
    handleSubmit: handleSubmitGate,
    watch: watchGate,
    formState: { errors: gateErrors },
  } = useForm<GateEntryFormValues>({
    resolver: zodResolver(gateEntrySchema),
    defaultValues: {
      type: "student",
      personName: "",
      contactNo: "",
      vehicleNumber: "",
      purpose: "",
      isLateEntry: false,
      lateEntryReason: "",
    },
  });

  const {
    register: registerVisitor,
    handleSubmit: handleSubmitVisitor,
    formState: { errors: visitorErrors },
  } = useForm<VisitorPassFormValues>({
    resolver: zodResolver(visitorPassSchema),
    defaultValues: {
      visitorName: "",
      contactNo: "",
      email: "",
      purpose: "",
      vehicleNumber: "",
    },
  });

  const {
    register: registerPatrol,
    handleSubmit: handleSubmitPatrol,
    formState: { errors: patrolErrors },
  } = useForm<PatrolLogFormValues>({
    resolver: zodResolver(patrolLogSchema),
    defaultValues: {
      location: "",
      status: "active",
      notes: "",
    },
  });

  const isLate = watchGate("isLateEntry");

  const onSubmitGateEntry = (values: GateEntryFormValues) => {
    createGateEntryMutation.mutate({ ...values, entryTime: new Date().toISOString() });
  };

  const onSubmitVisitorPass = (values: VisitorPassFormValues) => {
    createVisitorLogMutation.mutate(values);
  };

  const onSubmitPatrolLog = (values: PatrolLogFormValues) => {
    createPatrolLogMutation.mutate(values);
  };

  const isPending =
    createGateEntryMutation.isPending ||
    createVisitorLogMutation.isPending ||
    createPatrolLogMutation.isPending;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title="Log Security Activity"
        subtitle="Record perimeter gate check-ins, visitor day passes, or security rounds."
        actions={
          <Link href="/security">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Back to Security
            </Button>
          </Link>
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

      {/* Switcher Tabs */}
      <div className="flex gap-2 p-1.5 bg-surface-muted rounded-xl border border-border w-fit">
        {([
          { key: "gate" as const, label: "Gate & Curfew Check-in" },
          { key: "visitor" as const, label: "Visitor Pass" },
          { key: "patrol" as const, label: "Patrol Round" },
        ]).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSelectedType(opt.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedType === opt.key
                ? "bg-surface text-gold shadow-sm border border-border"
                : "text-text-muted hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card
        title={
          selectedType === "gate"
            ? "Perimeter Gate Check-in"
            : selectedType === "visitor"
            ? "Visitor Authorization Pass"
            : "Warden Patrol Audit Record"
        }
        subtitle="Security checkpoint verification parameters"
      >
        {selectedType === "gate" && (
          <form onSubmit={handleSubmitGate(onSubmitGateEntry)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Entry Category" required>
                <Select {...registerGate("type")}>
                  <option value="student">Student / Resident</option>
                  <option value="visitor">Visitor / Guest</option>
                  <option value="vehicle">Delivery / Service Vehicle</option>
                </Select>
              </FormField>

              <FormField label="Person Full Name" error={gateErrors.personName?.message} required>
                <Input {...registerGate("personName")} placeholder="e.g. Shakib Al Hasan" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Phone Number" error={gateErrors.contactNo?.message}>
                <Input {...registerGate("contactNo")} placeholder="e.g. +880 1711-223344" className="font-mono" />
              </FormField>
              <FormField label="Vehicle Plate Number (If applicable)">
                <Input {...registerGate("vehicleNumber")} placeholder="e.g. DHA-GA-1234" className="font-mono uppercase" />
              </FormField>
            </div>

            <FormField label="Purpose of Entry" error={gateErrors.purpose?.message} required>
              <Input {...registerGate("purpose")} placeholder="e.g. Returning from clinical hospital duty" />
            </FormField>

            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3">
              <Checkbox
                label="Flag as Late Curfew Entry"
                description="Check if resident arrived past the 10:00 PM dormitory curfew limit"
                {...registerGate("isLateEntry")}
              />

              {isLate && (
                <FormField label="Late Reason / Explanation" required>
                  <Input
                    {...registerGate("lateEntryReason")}
                    placeholder="e.g. Late emergency ward round approval from Department Head"
                  />
                </FormField>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/security">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" loading={isPending} leftIcon={<Plus size={14} />}>
                Record Check-in
              </Button>
            </div>
          </form>
        )}

        {selectedType === "visitor" && (
          <form onSubmit={handleSubmitVisitor(onSubmitVisitorPass)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Visitor Full Name" error={visitorErrors.visitorName?.message} required>
                <Input {...registerVisitor("visitorName")} placeholder="e.g. Dr. Kamal Hossain" />
              </FormField>
              <FormField label="Contact Number" error={visitorErrors.contactNo?.message} required>
                <Input {...registerVisitor("contactNo")} placeholder="+880 1812-345678" className="font-mono" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Email Address (Optional)" error={visitorErrors.email?.message}>
                <Input type="email" {...registerVisitor("email")} placeholder="kamal@example.com" />
              </FormField>
              <FormField label="Vehicle License Plate">
                <Input {...registerVisitor("vehicleNumber")} placeholder="e.g. DHA-CHA-5566" className="font-mono uppercase" />
              </FormField>
            </div>

            <FormField label="Purpose of Campus Visit" error={visitorErrors.purpose?.message} required>
              <Textarea
                {...registerVisitor("purpose")}
                placeholder="e.g. Visiting student in Hostel Block B, authorized by guardian"
                rows={3}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/security">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" loading={isPending} leftIcon={<Plus size={14} />}>
                Issue Visitor Pass
              </Button>
            </div>
          </form>
        )}

        {selectedType === "patrol" && (
          <form onSubmit={handleSubmitPatrol(onSubmitPatrolLog)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Patrol Sector / Zone" error={patrolErrors.location?.message} required>
                <Input {...registerPatrol("location")} placeholder="e.g. Academic Block 2 - East Perimeter" />
              </FormField>
              <FormField label="Round Status" required>
                <Select {...registerPatrol("status")}>
                  <option value="active">Active Round In-Progress</option>
                  <option value="completed">Completed & Verified</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Observations & Warden Notes">
              <Textarea
                {...registerPatrol("notes")}
                placeholder="e.g. All fire escape doors secured, exterior lights functioning normally"
                rows={4}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/security">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" loading={isPending} leftIcon={<Plus size={14} />}>
                Save Patrol Log
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
