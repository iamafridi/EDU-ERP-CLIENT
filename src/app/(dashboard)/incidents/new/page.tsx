"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Wrench, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";
import { PageHeader, Card, FormField, Input, Select, Textarea, Button } from "@/components/ui";

const incidentSchema = zod.object({
  title: zod.string().min(5, "Title must be at least 5 characters"),
  description: zod.string().min(10, "Please describe the problem in more detail"),
  severity: zod.enum(["low", "medium", "high", "critical"]),
  location: zod.string().min(3, "Location is required (e.g., Room B-204)"),
  category: zod.string().min(3, "Category is required"),
});

type IncidentFormValues = zod.infer<typeof incidentSchema>;

export default function NewIncidentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const canReport =
    user?.role === "student" || user?.role === "faculty" ||
    roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  if (!canReport) {
    router.push("/incidents");
    return null;
  }

  const createIncidentMutation = useMutation({
    mutationFn: api.createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSuccessMsg("Incident ticket logged successfully.");
      setTimeout(() => router.push("/incidents"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "medium",
      location: "",
      category: "",
    },
  });

  const onSubmit = (values: IncidentFormValues) => {
    createIncidentMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      <PageHeader
        title="Report Maintenance Incident"
        subtitle="Log a new facility issue, equipment malfunction, or infrastructure request"
        badge="Estate Ticket"
        actions={
          <Link href="/incidents">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={16} />}
            >
              Back to List
            </Button>
          </Link>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <Card orientation="vertical" padding="lg" variant="default">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Issue Title" error={errors.title?.message} required>
            <Input
              {...register("title")}
              placeholder="Short descriptive summary of the fault"
            />
          </FormField>

          <FormField label="Category" error={errors.category?.message} required>
            <Input
              {...register("category")}
              placeholder="e.g. Plumbing, Electrical, HVAC, Furniture"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Severity Level" required>
              <Select {...register("severity")}>
                <option value="low">Low (Cosmetic/Convenience)</option>
                <option value="medium">Medium (Standard Maintenance)</option>
                <option value="high">High (Urgent Cooling/Plumbing)</option>
                <option value="critical">Critical (Safety Hazard / Flooding)</option>
              </Select>
            </FormField>

            <FormField label="Facility Location" error={errors.location?.message} required>
              <Input
                {...register("location")}
                placeholder="e.g. Room B-204 Bathroom"
              />
            </FormField>
          </div>

          <FormField label="Detailed Description" error={errors.description?.message} required>
            <Textarea
              {...register("description")}
              rows={4}
              placeholder="Provide exact details about the issue to help dispatch technicians..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/incidents">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="gold"
              disabled={createIncidentMutation.isPending}
              icon={<Wrench size={14} />}
            >
              {createIncidentMutation.isPending ? "Logging..." : "Log Ticket"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

