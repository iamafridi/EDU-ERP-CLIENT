"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Check,
} from "lucide-react";
import { ProfileSkeleton, Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Textarea,
  Button,
  Badge,
} from "@/components/ui";

const courseSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  credits: zod.number().min(1, "Credits must be at least 1").max(12, "Credits cannot exceed 12"),
  description: zod.string().max(1000, "Description is too long").optional(),
});

type CourseFormValues = zod.infer<typeof courseSchema>;

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseCode = params.id as string;
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: api.getCourses,
  });

  const { data: faculties = [], isLoading: isLoadingFaculties } = useQuery({
    queryKey: ["faculties"],
    queryFn: api.getFaculties,
  });

  const course = courses.find((c: any) => c.code === courseCode);
  const [assignedFacultyIds, setAssignedFacultyIds] = useState<string[]>([]);

  useEffect(() => {
    if (course) {
      if (courseCode === "CS-301") {
        setAssignedFacultyIds(["FAC-983"]);
      } else if (courseCode === "MB-102") {
        setAssignedFacultyIds(["FAC-984"]);
      } else {
        setAssignedFacultyIds(["FAC-985"]);
      }
    }
  }, [course, courseCode]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      credits: 3,
      description: "",
    },
  });

  useEffect(() => {
    if (course) {
      setValue("title", course.title);
      setValue("credits", course.credits);
      setValue("description", course.description || "");
    }
  }, [course, setValue]);

  const updateCourseMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      return api.createCourse({
        code: courseCode,
        ...values,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setSuccessMsg("Course specifications updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const assignFacultyMutation = useMutation({
    mutationFn: async (facultyIds: string[]) => {
      if (!course) return;
      return api.assignFacultyToCourse(course.id || courseCode, facultyIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setSuccessMsg("Faculty allocation updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const onSubmit = (values: CourseFormValues) => {
    updateCourseMutation.mutate(values);
  };

  const handleToggleFaculty = (facultyId: string) => {
    const isCurrentlyAssigned = assignedFacultyIds.includes(facultyId);
    let updated: string[];
    if (isCurrentlyAssigned) {
      updated = assignedFacultyIds.filter((id) => id !== facultyId);
    } else {
      updated = [...assignedFacultyIds, facultyId];
    }
    setAssignedFacultyIds(updated);
    assignFacultyMutation.mutate(updated);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!course) {
    return (
      <div className="p-12 text-center space-y-3">
        <AlertTriangle size={44} className="text-warning mx-auto" />
        <h3 className="text-base font-bold text-text">Course Not Found</h3>
        <p className="text-xs text-text-muted">
          The requested course code <span className="font-mono font-bold text-text">{courseCode}</span> does not exist in the institutional registry.
        </p>
        <Link href="/courses">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Return to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      <PageHeader
        title={`${courseCode}: ${course.title}`}
        description="Curriculum specifications, syllabus modules, and teaching faculty allocation."
        breadcrumb={[
          { label: "Academics", href: "/courses" },
          { label: "Courses", href: "/courses" },
          { label: courseCode },
        ]}
        actions={
          <Link href="/courses">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Course Catalog
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Course Settings Form */}
        <div className="lg:col-span-2">
          <Card
            title="Course Parameters"
            subtitle="Configure title, credit hours, and learning objectives"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <FormField label="Course Title" error={errors.title?.message} required>
                    <Input {...register("title")} />
                  </FormField>
                </div>
                <div>
                  <FormField label="Credits Weight" error={errors.credits?.message} required>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      {...register("credits", { valueAsNumber: true })}
                      className="font-mono"
                    />
                  </FormField>
                </div>
              </div>

              <FormField label="Curriculum Description & Syllabus Outline" error={errors.description?.message}>
                <Textarea
                  {...register("description")}
                  rows={4}
                />
              </FormField>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/courses">
                  <Button variant="outline">Back</Button>
                </Link>
                {canManage && (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={updateCourseMutation.isPending}
                    leftIcon={<Save size={15} />}
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Faculty Assignment */}
        {canManage && (
          <Card
            title="Teaching Faculty"
            subtitle="Allocate academic lecturers and professors to this syllabus"
          >
            <div className="space-y-2">
              {isLoadingFaculties ? (
                <div className="space-y-2 py-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : faculties.length === 0 ? (
                <p className="text-xs text-text-muted py-4 text-center">No faculty members found in directory.</p>
              ) : (
                faculties.map((fac: any) => {
                  const isAssigned = assignedFacultyIds.includes(fac.facultyId || fac.id);
                  const name =
                    typeof fac.name === "string"
                      ? fac.name
                      : `${fac.name?.firstName ?? ""} ${fac.name?.lastName ?? ""}`.trim();

                  return (
                    <div
                      key={fac.id}
                      onClick={() => handleToggleFaculty(fac.facultyId || fac.id)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all select-none ${
                        isAssigned
                          ? "border-gold bg-gold/5"
                          : "border-border hover:bg-surface-muted"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-text block">
                          {name || "Faculty Member"}
                        </span>
                        <span className="text-[10px] text-text-muted block">
                          {fac.designation || "Lecturer"} • {fac.academicDepartment || "General"}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isAssigned
                            ? "bg-gold border-gold text-on-gold"
                            : "border-border bg-surface"
                        }`}
                      >
                        {isAssigned && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
