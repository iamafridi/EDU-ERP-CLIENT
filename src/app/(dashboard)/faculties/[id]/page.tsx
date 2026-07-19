"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ChevronLeft, GraduationCap, Save, Edit, AlertCircle, Sparkles } from "lucide-react";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";

// Zod validation schema for Faculty profile editing
const facultySchema = zod.object({
  name: zod.string().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
  designation: zod.string().min(2, "Designation must be specified"),
  academicDepartment: zod.string().min(2, "Department must be specified"),
  email: zod.string().email("Please enter a valid email address"),
  contactNo: zod.string().min(5, "Contact number is too short"),
});

type FacultyFormValues = zod.infer<typeof facultySchema>;

export default function FacultyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const facultyId = params.id as string;
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: faculties = [], isLoading } = useQuery({
    queryKey: ["faculties"],
    queryFn: api.getFaculties,
  });

  const faculty = faculties.find((f: any) => f.facultyId === facultyId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: "",
      designation: "Professor",
      academicDepartment: "Computer Science",
      email: "",
      contactNo: "",
    },
  });

  // Prefill details
  useEffect(() => {
    if (faculty) {
      setValue("name", typeof faculty.name === 'string' ? faculty.name : `${faculty.name?.firstName ?? ''} ${faculty.name?.lastName ?? ''}`.trim());
      setValue("designation", faculty.designation);
      setValue("academicDepartment", faculty.academicDepartment);
      setValue("email", faculty.email);
      setValue("contactNo", faculty.contactNo);
    }
  }, [faculty, setValue]);

  const updateFacultyMutation = useMutation({
    mutationFn: (values: FacultyFormValues) => {
      return api.updateFaculty(faculty?.id || facultyId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setIsEditing(false);
      setSuccessMsg("Faculty staff specifications updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const onSubmit = (values: FacultyFormValues) => {
    updateFacultyMutation.mutate(values);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!faculty) {
    return (
      <div className="bg-white border border-[#e1e2ed] p-8 rounded-xl text-center space-y-4 max-w-md mx-auto font-sans mt-12">
        <AlertCircle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Faculty Record Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested Faculty ID <strong className="font-mono text-slate-600">{facultyId}</strong> does not exist in the institutional ERP database.
        </p>
        <Link href="/faculties">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
            <ChevronLeft size={16} /> Return to Directory
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-2xl">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link href="/faculties">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <ChevronLeft size={16} /> Back to Directory
          </span>
        </Link>
        {!isEditing && roleIs("domain-admin", "super-admin") && (
          <button
            onClick={() => setIsEditing(true)}
            className="h-9 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Edit size={14} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Header Info */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
          {(typeof faculty.name === 'string' ? faculty.name : faculty.name?.firstName ?? '').charAt(0) || '?'}
        </div>
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs font-mono mb-1">
            {faculty.facultyId}
          </span>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {(typeof faculty.name === 'string' ? faculty.name : `${faculty.name?.firstName ?? ''} ${faculty.name?.lastName ?? ''}`.trim()) || ''}
            <Sparkles size={16} className="text-[#2563EB]" />
          </h1>
          <p className="text-xs text-slate-400">
            {faculty.designation} &bull; {faculty.academicDepartment}
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

      {/* Detail or Edit Form Container */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Full Name</label>
              <input
                type="text"
                {...register("name")}
                className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                  errors.name ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                }`}
              />
              {errors.name && (
                <span className="text-[10px] text-red-500 font-semibold block">{errors.name.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Designation</label>
                <input
                  type="text"
                  {...register("designation")}
                  className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                    errors.designation ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                  }`}
                />
                {errors.designation && (
                  <span className="text-[10px] text-red-500 font-semibold block">{errors.designation.message}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Department</label>
                <input
                  type="text"
                  {...register("academicDepartment")}
                  className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                    errors.academicDepartment ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                  }`}
                />
                {errors.academicDepartment && (
                  <span className="text-[10px] text-red-500 font-semibold block">{errors.academicDepartment.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                    errors.email ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                  }`}
                />
                {errors.email && (
                  <span className="text-[10px] text-red-500 font-semibold block">{errors.email.message}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Number</label>
                <input
                  type="text"
                  {...register("contactNo")}
                  className={`w-full h-10 px-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all ${
                    errors.contactNo ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-[#c3c6d7]"
                  }`}
                />
                {errors.contactNo && (
                  <span className="text-[10px] text-red-500 font-semibold block">{errors.contactNo.message}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e1e2ed] mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFacultyMutation.isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save size={16} />
                {updateFacultyMutation.isPending ? "Saving..." : "Save Modifications"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Staff Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Designation</span>
                  <span className="font-semibold text-slate-700">{faculty.designation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-700">{faculty.academicDepartment}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Communication Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Email Address</span>
                  <span className="font-semibold text-slate-700">{faculty.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Mobile Phone</span>
                  <span className="font-semibold text-slate-700">{faculty.contactNo}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
