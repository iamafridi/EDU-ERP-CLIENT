"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, CheckCircle2, Calendar, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Tabs,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const TIME_SLOTS = [
  "09:00-09:15","09:15-09:30","09:30-09:45","09:45-10:00",
  "10:00-10:15","10:15-10:30","10:30-10:45","10:45-11:00",
  "11:00-11:15","11:15-11:30","11:30-11:45","11:45-12:00",
  "14:00-14:15","14:15-14:30","14:30-14:45","14:45-15:00",
  "15:00-15:15","15:15-15:30","15:30-15:45","15:45-16:00",
];

const apptSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  notes: z.string().optional(),
});

type ApptForm = z.infer<typeof apptSchema>;

const visitSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  investigations: z.string().optional(),
  prescription: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

type VisitForm = z.infer<typeof visitSchema>;

export default function NewOPDPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [mode, setMode] = useState<string>("appointment");

  const isReceptionist = user?.staffSubRole === "receptionist" || roleIs("domain-admin", "super-admin");
  const isDoctor = user?.staffSubRole === "doctor";

  if (!isReceptionist && !isDoctor) {
    router.push("/opd");
    return null;
  }

  const apptForm = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentDate: "",
      timeSlot: "09:00-09:15",
      chiefComplaint: "",
      notes: "",
    },
  });

  const visitForm = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      appointmentId: "",
      patientId: "",
      doctorId: "",
      symptoms: "",
      diagnosis: "",
      investigations: "",
      prescription: "",
      followUpDate: "",
      notes: "",
    },
  });

  const createApptMutation = useMutation({
    mutationFn: api.createOPDAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Appointment created.");
      setTimeout(() => router.push("/opd"), 1000);
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: api.createOPDVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Visit recorded.");
      setTimeout(() => router.push("/opd"), 1000);
    },
  });

  const handleCreateAppt = (data: ApptForm) => {
    createApptMutation.mutate(data);
  };

  const handleCreateVisit = (data: VisitForm) => {
    createVisitMutation.mutate(data);
  };

  const tabItems = [
    ...(isReceptionist ? [{ id: "appointment", label: "Schedule Appointment", icon: <Calendar className="w-4 h-4" /> }] : []),
    ...(isDoctor ? [{ id: "visit", label: "Record Consultation Visit", icon: <FileText className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        eyebrow="Outpatient Department (OPD)"
        title={mode === "appointment" ? "New OPD Appointment" : "Record OPD Visit"}
        description={
          mode === "appointment"
            ? "Schedule a new outpatient appointment slot and assign consulting physician."
            : "Record clinical symptoms, diagnosis, ordered investigations, and Rx regimen."
        }
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "OPD", href: "/opd" },
          { label: mode === "appointment" ? "New Appointment" : "Record Visit" },
        ]}
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

      {tabItems.length > 1 && (
        <Tabs
          items={tabItems}
          value={mode}
          onChange={setMode}
        />
      )}

      <Card pad="md">
        {mode === "appointment" && (
          <form onSubmit={apptForm.handleSubmit(handleCreateAppt)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Patient ID" required error={apptForm.formState.errors.patientId?.message}>
                <Input
                  type="text"
                  {...apptForm.register("patientId")}
                  placeholder="e.g. PAT-001"
                  className="font-mono"
                />
              </FormField>

              <FormField label="Doctor ID" required error={apptForm.formState.errors.doctorId?.message}>
                <Input
                  type="text"
                  {...apptForm.register("doctorId")}
                  placeholder="e.g. DR-001"
                  className="font-mono"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Appointment Date" required error={apptForm.formState.errors.appointmentDate?.message}>
                <Input
                  type="date"
                  {...apptForm.register("appointmentDate")}
                />
              </FormField>

              <FormField label="Consultation Time Slot" required>
                <Select {...apptForm.register("timeSlot")}>
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Chief Complaint" required error={apptForm.formState.errors.chiefComplaint?.message}>
              <Textarea
                {...apptForm.register("chiefComplaint")}
                placeholder="e.g. High fever, productive cough, and shortness of breath for 3 days"
                rows={2}
              />
            </FormField>

            <FormField label="Administrative Notes">
              <Textarea
                {...apptForm.register("notes")}
                placeholder="Special triage instructions or referral details..."
                rows={2}
              />
            </FormField>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Link href="/opd">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={createApptMutation.isPending}
              >
                Schedule Appointment
              </Button>
            </div>
          </form>
        )}

        {mode === "visit" && (
          <form onSubmit={visitForm.handleSubmit(handleCreateVisit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Appointment ID" required error={visitForm.formState.errors.appointmentId?.message}>
                <Input
                  type="text"
                  {...visitForm.register("appointmentId")}
                  placeholder="e.g. OPD-APPT-001"
                  className="font-mono"
                />
              </FormField>

              <FormField label="Patient ID" required error={visitForm.formState.errors.patientId?.message}>
                <Input
                  type="text"
                  {...visitForm.register("patientId")}
                  placeholder="e.g. PAT-001"
                  className="font-mono"
                />
              </FormField>
            </div>

            <FormField label="Doctor ID" required error={visitForm.formState.errors.doctorId?.message}>
              <Input
                type="text"
                {...visitForm.register("doctorId")}
                placeholder="e.g. DR-001"
                className="font-mono"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Clinical Symptoms" required error={visitForm.formState.errors.symptoms?.message}>
                <Textarea
                  {...visitForm.register("symptoms")}
                  placeholder="e.g. Fever, productive cough, shortness of breath"
                  rows={2}
                />
              </FormField>

              <FormField label="Provisional Diagnosis" required error={visitForm.formState.errors.diagnosis?.message}>
                <Input
                  type="text"
                  {...visitForm.register("diagnosis")}
                  placeholder="e.g. Community-Acquired Pneumonia (LRTI)"
                />
              </FormField>
            </div>

            <FormField label="Ordered Lab Investigations">
              <Input
                type="text"
                {...visitForm.register("investigations")}
                placeholder="e.g. CBC, ESR, Chest X-ray PA View, Sputum AFB"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Rx Prescription Summary">
                <Textarea
                  {...visitForm.register("prescription")}
                  placeholder="Tab. Cefuroxime 500mg TDS x 7 days..."
                  rows={2}
                />
              </FormField>

              <FormField label="Follow Up Date">
                <Input
                  type="date"
                  {...visitForm.register("followUpDate")}
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Link href="/opd">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={createVisitMutation.isPending}
              >
                Record Consultation Visit
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
