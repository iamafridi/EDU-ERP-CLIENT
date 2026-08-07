"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

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

const TIME_SLOTS = [
  "09:00-09:15","09:15-09:30","09:30-09:45","09:45-10:00",
  "10:00-10:15","10:15-10:30","10:30-10:45","10:45-11:00",
  "11:00-11:15","11:15-11:30","11:30-11:45","11:45-12:00",
  "14:00-14:15","14:15-14:30","14:30-14:45","14:45-15:00",
  "15:00-15:15","15:15-15:30","15:30-15:45","15:45-16:00",
];

const STATUS_TONES: Record<string, "info" | "warning" | "success" | "neutral"> = {
  scheduled: "info",
  "checked-in": "warning",
  consulted: "success",
  cancelled: "neutral",
};

export default function OPDDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctor = user?.staffSubRole === "doctor";
  const isReceptionist = user?.staffSubRole === "receptionist" || roleIs("domain-admin", "super-admin");

  const { data: appointments = [] } = useQuery({
    queryKey: ["opdAppointments"],
    queryFn: api.getOPDAppointments,
  });

  const { data: visits = [] } = useQuery({
    queryKey: ["opdVisits"],
    queryFn: api.getOPDVisits,
  });

  const id = params.id as string;
  const isVisit = id.startsWith("OPD-VIS") || id.startsWith("VIS");
  const record = isVisit
    ? visits.find((v: any) => v.id === id)
    : appointments.find((a: any) => a.id === id);

  const apptForm = useForm<ApptForm>({
    resolver: zodResolver(apptSchema),
  });

  const visitForm = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
  });

  useEffect(() => {
    if (record && !isVisit) {
      apptForm.reset({
        patientId: record.patientId || "",
        doctorId: record.doctorId || "",
        appointmentDate: record.appointmentDate || "",
        timeSlot: record.timeSlot || "09:00-09:15",
        chiefComplaint: record.chiefComplaint || "",
        notes: record.notes || "",
      });
    }
    if (record && isVisit) {
      visitForm.reset({
        appointmentId: record.appointmentId || "",
        patientId: record.patientId || "",
        doctorId: record.doctorId || "",
        symptoms: record.symptoms || "",
        diagnosis: record.diagnosis || "",
        investigations: record.investigations || "",
        prescription: record.prescription || "",
        followUpDate: record.followUpDate || "",
        notes: record.notes || "",
      });
    }
  }, [record, isVisit]);

  const updateApptMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApptForm> }) =>
      api.updateOPDAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      setSuccessMsg("Appointment updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VisitForm> }) =>
      api.updateOPDVisit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      setSuccessMsg("Visit updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const deleteApptMutation = useMutation({
    mutationFn: api.deleteOPDAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdAppointments"] });
      router.push("/opd");
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: api.deleteOPDVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opdVisits"] });
      router.push("/opd");
    },
  });

  const onSubmitAppt = (data: ApptForm) => {
    updateApptMutation.mutate({ id, data });
  };

  const onSubmitVisit = (data: VisitForm) => {
    updateVisitMutation.mutate({ id, data });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this ${isVisit ? "visit" : "appointment"}?`)) {
      if (isVisit) {
        deleteVisitMutation.mutate(id);
      } else {
        deleteApptMutation.mutate(id);
      }
    }
  };

  if (!record) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-text-muted">Record not found.</p>
        <Link href="/opd" className="text-xs text-primary hover:underline mt-2 inline-block">
          Back to OPD
        </Link>
      </div>
    );
  }

  const canEdit = isVisit ? isDoctor : isReceptionist || isDoctor;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        eyebrow="Outpatient Department (OPD)"
        title={isVisit ? "OPD Consultation Visit Record" : "OPD Appointment Details"}
        description={`Record ID: ${record.id} • Registered for patient ${record.patientName || record.patientId}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "OPD", href: "/opd" },
          { label: record.id },
        ]}
        actions={
          canEdit ? (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<Pencil size={14} />}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    isVisit ? visitForm.reset() : apptForm.reset();
                  }}
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
          ) : undefined
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
          <span className="text-xs font-bold text-text uppercase tracking-wider font-ui">
            {isVisit ? "Visit Information" : "Appointment Information"}
          </span>
        </div>

        {!isVisit && (
          isEditing ? (
            <form onSubmit={apptForm.handleSubmit(onSubmitAppt)} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Patient ID" required error={apptForm.formState.errors.patientId?.message}>
                  <Input
                    type="text"
                    {...apptForm.register("patientId")}
                    className="font-mono"
                  />
                </FormField>
                <FormField label="Doctor ID" required error={apptForm.formState.errors.doctorId?.message}>
                  <Input
                    type="text"
                    {...apptForm.register("doctorId")}
                    className="font-mono"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Date" required error={apptForm.formState.errors.appointmentDate?.message}>
                  <Input
                    type="date"
                    {...apptForm.register("appointmentDate")}
                  />
                </FormField>
                <FormField label="Time Slot" required>
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
                  rows={2}
                />
              </FormField>
              <FormField label="Notes">
                <Textarea
                  {...apptForm.register("notes")}
                  rows={2}
                />
              </FormField>
              <div className="flex justify-end pt-3 border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  loading={updateApptMutation.isPending}
                  leftIcon={<Pencil size={14} />}
                >
                  Update Appointment
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Patient</span>
                  <p className="font-semibold text-text">{record.patientName || record.patientId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Doctor</span>
                  <p className="font-semibold text-text">{record.doctorName || record.doctorId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Date</span>
                  <p className="font-mono text-text">{record.appointmentDate}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Time Slot</span>
                  <Badge tone="neutral" size="sm">{record.timeSlot}</Badge>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Status</span>
                  <Badge tone={STATUS_TONES[record.status] || "info"} size="sm">
                    {record.status}
                  </Badge>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Chief Complaint</span>
                <p className="text-text">{record.chiefComplaint}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Notes</span>
                <p className="text-text-muted">{record.notes || "—"}</p>
              </div>
            </div>
          )
        )}

        {isVisit && (
          isEditing ? (
            <form onSubmit={visitForm.handleSubmit(onSubmitVisit)} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Appointment ID" required error={visitForm.formState.errors.appointmentId?.message}>
                  <Input
                    type="text"
                    {...visitForm.register("appointmentId")}
                    className="font-mono"
                  />
                </FormField>
                <FormField label="Patient ID" required error={visitForm.formState.errors.patientId?.message}>
                  <Input
                    type="text"
                    {...visitForm.register("patientId")}
                    className="font-mono"
                  />
                </FormField>
              </div>
              <FormField label="Doctor ID" required error={visitForm.formState.errors.doctorId?.message}>
                <Input
                  type="text"
                  {...visitForm.register("doctorId")}
                  className="font-mono"
                />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Symptoms" required error={visitForm.formState.errors.symptoms?.message}>
                  <Textarea
                    {...visitForm.register("symptoms")}
                    rows={2}
                  />
                </FormField>
                <FormField label="Diagnosis" required error={visitForm.formState.errors.diagnosis?.message}>
                  <Input
                    type="text"
                    {...visitForm.register("diagnosis")}
                  />
                </FormField>
              </div>
              <FormField label="Investigations">
                <Input
                  type="text"
                  {...visitForm.register("investigations")}
                />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Prescription">
                  <Textarea
                    {...visitForm.register("prescription")}
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
              <div className="flex justify-end pt-3 border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  loading={updateVisitMutation.isPending}
                  leftIcon={<Pencil size={14} />}
                >
                  Update Visit Record
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Patient</span>
                  <p className="font-semibold text-text">{record.patientName || record.patientId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Doctor</span>
                  <p className="font-semibold text-text">{record.doctorName || record.doctorId}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Symptoms</span>
                <p className="text-text">{record.symptoms}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Diagnosis</span>
                <Badge tone="info" size="md">{record.diagnosis}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Investigations</span>
                  <p className="text-text-muted">{record.investigations || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Follow Up</span>
                  <p className="font-mono text-text">{record.followUpDate || "—"}</p>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Prescription</span>
                <p className="text-text-muted">{record.prescription || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1">Notes</span>
                <p className="text-text-muted">{record.notes || "—"}</p>
              </div>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
