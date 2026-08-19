"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, CheckCircle2, ArrowLeft, Trash2, Plus } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const drugRowSchema = zod.object({
  drugId: zod.string().min(1, "Select a drug"),
  dosage: zod.string().min(1, "Dosage is required"),
  duration: zod.string().min(1, "Duration is required"),
  instructions: zod.string().optional(),
});

const prescriptionSchema = zod.object({
  patientId: zod.string().min(1, "Patient ID is required"),
  doctorId: zod.string().min(1, "Doctor ID is required"),
  date: zod.string().min(10, "Date is required"),
  drugs: zod.array(drugRowSchema).min(1, "Add at least one drug"),
  notes: zod.string().optional(),
});

type PrescriptionFormValues = zod.infer<typeof prescriptionSchema>;

export default function NewPrescriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const isDoctor = user?.staffSubRole === "doctor";

  const { data: drugs = [] } = useQuery({
    queryKey: ["drugs"],
    queryFn: api.getDrugs,
  });

  if (!isDoctor && !roleIs("domain-admin", "super-admin")) {
    router.push("/pharmacy");
    return null;
  }

  const createPrxMutation = useMutation({
    mutationFn: (payload: PrescriptionFormValues) =>
      api.createPrescription({
        patientId: payload.patientId,
        doctorId: payload.doctorId || user?.id || "",
        drugs: payload.drugs,
        date: payload.date,
        notes: payload.notes || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setSuccessMsg("Prescription created.");
      setTimeout(() => router.push("/pharmacy"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      doctorId: user?.id || "",
      date: new Date().toISOString().split("T")[0],
      drugs: [{ drugId: "", dosage: "", duration: "", instructions: "" }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drugs",
  });

  const onSubmit = (values: PrescriptionFormValues) => {
    createPrxMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        eyebrow="Prescription Terminal"
        title="New Outpatient / Inpatient Prescription"
        description="Issue verified prescription regimen with automatic dosage calculation and formulary checks."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pharmacy", href: "/pharmacy" },
          { label: "New Prescription" },
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

      <Card pad="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Patient ID" required error={errors.patientId?.message}>
              <Input
                type="text"
                {...register("patientId")}
                placeholder="e.g. PAT-001"
                className="font-mono"
              />
            </FormField>

            <FormField label="Doctor ID" required error={errors.doctorId?.message}>
              <Input
                type="text"
                {...register("doctorId")}
                placeholder="e.g. DR-001"
                className="font-mono"
              />
            </FormField>
          </div>

          <FormField label="Prescription Date" required error={errors.date?.message}>
            <Input
              type="date"
              {...register("date")}
            />
          </FormField>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text font-ui">Prescribed Drug Regimen</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ drugId: "", dosage: "", duration: "", instructions: "" })}
                leftIcon={<Plus size={12} />}
              >
                Add Drug
              </Button>
            </div>
            {errors.drugs && (
              <span className="text-xs text-danger font-semibold block">
                {errors.drugs.message || errors.drugs.root?.message}
              </span>
            )}

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {fields.map((field, idx) => (
                <div key={field.id} className="p-3 bg-surface-muted/50 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Drug Item #{idx + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-xs text-danger hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Select
                        {...register(`drugs.${idx}.drugId`)}
                        placeholder="Select Drug from Formulary"
                      >
                        {(drugs as any[]).map((d: any) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </Select>
                      {errors.drugs?.[idx]?.drugId && (
                        <span className="text-[10px] text-danger mt-0.5 block">
                          {errors.drugs[idx]?.drugId?.message}
                        </span>
                      )}
                    </div>

                    <Input
                      type="text"
                      {...register(`drugs.${idx}.dosage`)}
                      placeholder="Dosage (e.g. 500mg TDS)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      type="text"
                      {...register(`drugs.${idx}.duration`)}
                      placeholder="Duration (e.g. 7 days)"
                    />
                    <Input
                      type="text"
                      {...register(`drugs.${idx}.instructions`)}
                      placeholder="Special Instructions (e.g. After meals)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FormField label="Clinical Advice / Remarks">
            <Textarea
              rows={2}
              {...register("notes")}
              placeholder="Advice on diet, fluid intake, or emergency review warnings..."
            />
          </FormField>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Link href="/pharmacy">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={createPrxMutation.isPending}
            >
              Sign & Issue Prescription
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
