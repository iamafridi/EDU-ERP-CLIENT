"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { AlertOctagon, CheckCircle2, ArrowLeft, Send } from "lucide-react";
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

const grievanceFormSchema = zod.object({
  subject: zod.string().min(5, "Subject must be at least 5 characters"),
  description: zod.string().min(10, "Please describe your grievance in more detail"),
  category: zod.enum(["ragging", "harassment", "academic", "hostel", "other"]),
  priority: zod.enum(["low", "medium", "high", "urgent"]),
  isAnonymous: zod.boolean(),
});

type GrievanceFormValues = zod.infer<typeof grievanceFormSchema>;

export default function NewGrievancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const submitGrievanceMutation = useMutation({
    mutationFn: api.submitGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      setSuccessMsg("Your grievance has been submitted successfully.");
      setTimeout(() => router.push("/grievances"), 1500);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GrievanceFormValues>({
    resolver: zodResolver(grievanceFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "hostel",
      priority: "medium",
      isAnonymous: false,
    },
  });

  const onSubmit = (values: GrievanceFormValues) => {
    submitGrievanceMutation.mutate(values);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title="File New Grievance"
        subtitle="Submit a formal institutional complaint, report harassment, or request hostel intervention."
        actions={
          <Link href="/grievances">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Back to Grievances
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

      <Card
        title="Incident & Complaint Report"
        subtitle="All reports are treated with strict confidentiality in accordance with institutional policy"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Subject / Brief Summary" error={errors.subject?.message} required>
            <Input
              {...register("subject")}
              placeholder="e.g. Broken water filter on 3rd floor Block B"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Category" required>
              <Select {...register("category")}>
                <option value="hostel">Hostel & Accommodation</option>
                <option value="academic">Academic & Curriculum</option>
                <option value="ragging">Anti-Ragging / Bullying</option>
                <option value="harassment">Harassment / Discrimination</option>
                <option value="other">General Facilities / Other</option>
              </Select>
            </FormField>

            <FormField label="Urgency Priority" required>
              <Select {...register("priority")}>
                <option value="low">Low (Standard review)</option>
                <option value="medium">Medium (Requires attention)</option>
                <option value="high">High (Priority escalation)</option>
                <option value="urgent">Urgent (Safety emergency)</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Detailed Description & Evidence" error={errors.description?.message} required>
            <Textarea
              {...register("description")}
              placeholder="Provide complete facts, dates, location, witnesses, or specific details to help the committee investigate..."
              rows={5}
            />
          </FormField>

          <div className="p-4 bg-surface-muted rounded-xl border border-border">
            <Checkbox
              label="Submit Anonymously"
              description="Hide your name and student ID from the public grievance records. Only the Chief Proctor will have access if formal inquiry is required."
              {...register("isAnonymous")}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/grievances">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={submitGrievanceMutation.isPending}
              leftIcon={<Send size={14} />}
            >
              Submit Grievance
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
