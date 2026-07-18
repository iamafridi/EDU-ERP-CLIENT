"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ChevronLeft, Save, Sparkles, AlertTriangle } from "lucide-react";
import { ProfileSkeleton, Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";

// Zod validation schema matching backend specifications
const courseSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  credits: zod.number().min(1, "Credits must be at least 1").max(6, "Credits cannot exceed 6"),
  description: zod.string().max(500, "Description is too long").optional(),
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

  // Setup initial pre-assigned faculties mock
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

  // Prefill form values once course is loaded
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
      setTimeout(() => setSuccessMsg(""), 3000);
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
      setTimeout(() => setSuccessMsg(""), 3000);
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
      <div className="bg-white border border-[#e1e2ed] p-8 rounded-xl text-center space-y-4 max-w-md mx-auto font-sans mt-12">
        <AlertTriangle size={48} className="text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Course Registry Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested course code <strong className="font-mono text-slate-600">{courseCode}</strong> does not exist in the institutional registry.
        </p>
        <Link href="/courses">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
            <ChevronLeft size={16} /> Return to Course Catalog
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* Back navigation button */}
      <div>
        <Link href="/courses">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <ChevronLeft size={16} /> Back to Catalog
          </span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold text-xs font-mono mb-2">
            Registry Code: {courseCode}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {course.title}
            <Sparkles size={18} className="text-[#2563EB]" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update curriculum parameters and allocate faculty members to this course.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-semibold"
        >
          {successMsg}
        </motion.div>
      )}

      {/* Main Grid Layout: Form and Faculty panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Settings Form */}
        <div className="lg:col-span-2 bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-[#e1e2ed] pb-2">
            Course Specifications
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Course Title</label>
              <input
                type="text"
                {...register("title")}
                className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                  errors.title ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                }`}
              />
              {errors.title && (
                <span className="text-[10px] text-red-500 font-semibold block">{errors.title.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Credits Weighting</label>
              <input
                type="number"
                {...register("credits", { valueAsNumber: true })}
                className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                  errors.credits ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                }`}
              />
              {errors.credits && (
                <span className="text-[10px] text-red-500 font-semibold block">{errors.credits.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Course Description</label>
              <textarea
                {...register("description")}
                className={`w-full h-24 px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none ${
                  errors.description ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                }`}
              />
              {errors.description && (
                <span className="text-[10px] text-red-500 font-semibold block">{errors.description.message}</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/courses">
                <span className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center">
                  Cancel
                </span>
              </Link>
              {roleIs("domain-admin", "super-admin") && (
                <button
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save size={16} />
                  {updateCourseMutation.isPending ? "Saving..." : "Save Modifications"}
                </button>
              )}
            </div>
          </form>
        </div>

        {roleIs("domain-admin", "super-admin") && (
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-[#e1e2ed] pb-2">
              Faculty Allocation
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Assign academic staff members to teach this course curriculum.
            </p>
          </div>

          <div className="space-y-2.5">
            {isLoadingFaculties ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : faculties.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No faculties found in the directory.</p>
            ) : (
              faculties.map((fac: any) => {
                const isAssigned = assignedFacultyIds.includes(fac.facultyId || fac.id);
                return (
                  <div
                    key={fac.id}
                    onClick={() => handleToggleFaculty(fac.facultyId || fac.id)}
                    className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      isAssigned
                        ? "border-[#2563EB] bg-[#2563EB]/5 hover:bg-[#2563EB]/10"
                        : "border-[#e1e2ed] hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700 block">{(typeof fac.name === 'string' ? fac.name : `${fac.name?.firstName ?? ''} ${fac.name?.lastName ?? ''}`.trim()) || ''}</span>
                      <span className="text-[10px] text-slate-400 block">{fac.designation} • {fac.academicDepartment}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isAssigned ? "bg-[#2563EB] border-[#2563EB] text-white" : "border-[#c3c6d7] bg-white"
                      }`}
                    >
                      {isAssigned && (
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>)}
      </div>
    </div>
  );
}
