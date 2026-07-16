"use client";

import { useAuthStore, UserRole } from "@/store/useAuthStore";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | (string & {});

type ResourcePermissions = Record<string, UserRole[]>;

const modulePermissions: Record<string, Record<string, UserRole[]>> = {
  students: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "staff"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  faculties: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  courses: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  rooms: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  fees: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  attendance: {
    create: ["super-admin", "domain-admin", "faculty"],
    read: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
  },
  exams: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  library: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student", "faculty"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  leave: {
    create: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    approve: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  notices: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  mess: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
    menu_create: ["super-admin", "domain-admin", "staff"],
    menu_read: ["super-admin", "domain-admin", "staff", "student"],
    feedback_create: ["student", "staff"],
  },
  departments: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  timetable: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
    entry_create: ["super-admin", "domain-admin"],
    entry_delete: ["super-admin", "domain-admin"],
  },
  semesters: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  transcripts: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  curriculum: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  grades: {
    create: ["super-admin", "domain-admin", "faculty"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
    publish: ["super-admin", "domain-admin"],
  },
  assessments: {
    create: ["super-admin", "domain-admin", "faculty"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
  },
  syllabus: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  enrollment: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  "study-materials": {
    create: ["super-admin", "domain-admin", "faculty"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
  },
  "academic-calendar": {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  scholarships: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
    approve: ["super-admin", "domain-admin"],
    reject: ["super-admin", "domain-admin"],
  },
  accreditation: {
    create: ["super-admin", "domain-admin"],
    read: ["super-admin", "domain-admin"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  research: {
    create: ["super-admin", "domain-admin", "faculty"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
  },
  skillLab: {
    create: ["super-admin", "domain-admin", "faculty"],
    read: ["super-admin", "domain-admin", "faculty", "student"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
  },
  payroll: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  receipts: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  budget: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  expenses: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  healthCenter: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  opd: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  ipd: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  laboratory: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  pharmacy: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  transport: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "student", "faculty", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  security: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  grievances: {
    create: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    read: ["super-admin", "domain-admin", "staff"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin", "domain-admin"],
  },
  chat: {
    create: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    read: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    update: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  logbook: {
    create: ["super-admin", "domain-admin", "faculty", "staff"],
    read: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    update: ["super-admin", "domain-admin", "faculty"],
    delete: ["super-admin", "domain-admin"],
  },
  incidents: {
    create: ["super-admin", "domain-admin", "staff", "faculty", "student"],
    read: ["super-admin", "domain-admin", "staff", "faculty", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  hostel: {
    create: ["super-admin", "domain-admin", "staff"],
    read: ["super-admin", "domain-admin", "staff", "student"],
    update: ["super-admin", "domain-admin", "staff"],
    delete: ["super-admin", "domain-admin"],
  },
  users: {
    create: ["super-admin"],
    read: ["super-admin", "domain-admin"],
    update: ["super-admin", "domain-admin"],
    delete: ["super-admin"],
  },
  audit: {
    read: ["super-admin", "domain-admin"],
  },
  settings: {
    read: ["super-admin", "domain-admin", "faculty", "student", "staff"],
    update: ["super-admin", "domain-admin", "faculty", "student", "staff"],
  },
  "activity-log": {
    read: ["super-admin", "domain-admin"],
  },
  reports: {
    read: ["super-admin", "domain-admin", "staff"],
    create: ["super-admin", "domain-admin", "staff"],
  },
};

export function usePermission() {
  const user = useAuthStore((s) => s.user);

  const can = (action: string, module: string): boolean => {
    if (!user?.role) return false;
    const permissions = modulePermissions[module];
    if (!permissions) return false;
    const allowed = permissions[action];
    if (!allowed) return false;
    return allowed.includes(user.role);
  };

  const roleIs = (...roles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const roleIn = (roles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  return { can, roleIs, roleIn };
}
