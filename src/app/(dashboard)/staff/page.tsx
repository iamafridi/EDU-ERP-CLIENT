"use client";

import React from "react";
import { useAuthStore, StaffSubRole, staffSubRoleLabels } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Heart, HeartPulse, Microscope, Pill, DollarSign,
  Shield, Home, BookOpen, UserCheck, Stethoscope,
  Mail, Phone, Hash, Award, Clock, DoorOpen,
  Building2, Wrench, Utensils,
} from "lucide-react";
import ProfileDetailPage from "@/components/ui/ProfileDetailPage";
import type { ComponentType } from "react";

type ProfileFieldDef = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: (profileRef: Record<string, any>, user: any) => string;
  mono?: boolean;
};

type StaffRoleConfig = {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  profileSubtitle: (profileRef: Record<string, any>, user: any) => string;
  sections: { title: string; fields: ProfileFieldDef[] }[];
};

const getField = (profileRef: Record<string, any>, user: any, refKey: string, fallback: string): string => {
  return profileRef?.[refKey] ?? fallback;
};

const getName = (profileRef: Record<string, any>, user: any, fallback: string): string => {
  if (profileRef?.name) {
    if (typeof profileRef.name === "object") {
      return `${profileRef.name.firstName || ""} ${profileRef.name.lastName || ""}`.trim();
    }
    return String(profileRef.name);
  }
  return user?.name || fallback;
};

const STAFF_ROLE_CONFIG: Record<StaffSubRole, StaffRoleConfig> = {
  doctor: {
    icon: Heart,
    title: "Doctor Profile",
    subtitle: "Your health center physician profile information.",
    profileSubtitle: (p, u) => `Physician \u00b7 ${getField(p, u, "specialization", "Internal Medicine")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "james.harrison@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-3001"), mono: true },
        ],
      },
      {
        title: "Professional Details",
        fields: [
          { icon: Award, label: "License Number", value: (p, u) => getField(p, u, "licenseNumber", "MD-789-012"), mono: true },
          { icon: Shield, label: "Specialization", value: (p, u) => getField(p, u, "specialization", "Internal Medicine") },
        ],
      },
    ],
  },
  nurse: {
    icon: HeartPulse,
    title: "Nurse Profile",
    subtitle: "Your health center nursing staff profile information.",
    profileSubtitle: (p, u) => `Nurse \u00b7 ${getField(p, u, "employeeId", "EMP-NUR-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "jessica.martinez@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-8001"), mono: true },
        ],
      },
      {
        title: "Professional Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-NUR-001"), mono: true },
          { icon: Shield, label: "Department", value: (p, u) => getField(p, u, "department", "Health Center") },
          { icon: Shield, label: "Qualification", value: (p, u) => getField(p, u, "qualification", "BSN, RN") },
          { icon: Clock, label: "Shift", value: (p, u) => getField(p, u, "shift", "Day") },
        ],
      },
    ],
  },
  "lab-technician": {
    icon: Microscope,
    title: "Lab Technician Profile",
    subtitle: "Your laboratory technician profile information.",
    profileSubtitle: (p, u) => `Lab Technician \u00b7 ${getField(p, u, "employeeId", "EMP-LAB-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "david.park@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-9001"), mono: true },
        ],
      },
      {
        title: "Professional Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-LAB-001"), mono: true },
          { icon: Shield, label: "Specialization", value: (p, u) => getField(p, u, "specialization", "Clinical Laboratory Science") },
          { icon: Shield, label: "Qualification", value: (p, u) => getField(p, u, "qualification", "MLS (ASCP)") },
        ],
      },
    ],
  },
  pharmacist: {
    icon: Pill,
    title: "Pharmacist Profile",
    subtitle: "Your pharmacy staff profile information.",
    profileSubtitle: (p, u) => `Pharmacist \u00b7 ${getField(p, u, "employeeId", "EMP-PHA-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "kevin.nguyen@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-1001"), mono: true },
        ],
      },
      {
        title: "Professional Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-PHA-001"), mono: true },
          { icon: Award, label: "License Number", value: (p, u) => getField(p, u, "licenseNumber", "PHAR-456-789"), mono: true },
          { icon: Shield, label: "Qualification", value: (p, u) => getField(p, u, "qualification", "PharmD") },
        ],
      },
    ],
  },
  accountant: {
    icon: DollarSign,
    title: "Accountant Profile",
    subtitle: "Your finance and accounting staff profile information.",
    profileSubtitle: (p, u) => `Accountant \u00b7 ${getField(p, u, "employeeId", "EMP-ACC-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "sarah.mitchell@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-2001"), mono: true },
        ],
      },
      {
        title: "Employment Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-ACC-001"), mono: true },
          { icon: Shield, label: "Department", value: (p, u) => getField(p, u, "department", "Finance & Accounts") },
        ],
      },
    ],
  },
  guard: {
    icon: Shield,
    title: "Security Guard Profile",
    subtitle: "Your campus security personnel profile information.",
    profileSubtitle: (p, u) => `Security Guard \u00b7 ${getField(p, u, "employeeId", "EMP-GRD-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "michael.torres@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-4001"), mono: true },
        ],
      },
      {
        title: "Duty Details",
        fields: [
          { icon: Clock, label: "Shift", value: (p, u) => getField(p, u, "shift", "Rotating") },
          { icon: DoorOpen, label: "Assigned Gate", value: (p, u) => getField(p, u, "assignedGate", "Main Entrance Gate") },
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-GRD-001"), mono: true },
        ],
      },
    ],
  },
  warden: {
    icon: Home,
    title: "Warden Profile",
    subtitle: "Your hostel warden profile information.",
    profileSubtitle: (p, u) => `Warden \u00b7 ${getField(p, u, "employeeId", "EMP-WRD-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "robert.kim@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-6001"), mono: true },
        ],
      },
      {
        title: "Assignment Details",
        fields: [
          { icon: Building2, label: "Assigned Hostel", value: (p, u) => getField(p, u, "assignedHostel", "Boys Hostel A") },
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-WRD-001"), mono: true },
        ],
      },
    ],
  },
  librarian: {
    icon: BookOpen,
    title: "Librarian Profile",
    subtitle: "Your library staff profile information.",
    profileSubtitle: (p, u) => `Librarian \u00b7 ${getField(p, u, "employeeId", "EMP-LIB-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "laura.bennett@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-5001"), mono: true },
        ],
      },
      {
        title: "Employment Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-LIB-001"), mono: true },
          { icon: Shield, label: "Department", value: (p, u) => getField(p, u, "department", "Library Services") },
        ],
      },
    ],
  },
  receptionist: {
    icon: UserCheck,
    title: "Receptionist Profile",
    subtitle: "Your front desk receptionist profile information.",
    profileSubtitle: (p, u) => `Receptionist \u00b7 ${getField(p, u, "employeeId", "EMP-REC-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "anna.chen@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-7001"), mono: true },
        ],
      },
      {
        title: "Employment Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-REC-001"), mono: true },
          { icon: Shield, label: "Department", value: (p, u) => getField(p, u, "department", "Front Desk") },
          { icon: Clock, label: "Shift", value: (p, u) => getField(p, u, "shift", "Day") },
        ],
      },
    ],
  },
  counselor: {
    icon: Stethoscope,
    title: "Counselor Profile",
    subtitle: "Your counseling and wellness staff profile information.",
    profileSubtitle: (p, u) => `Counselor \u00b7 ${getField(p, u, "employeeId", "EMP-CNS-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "emily.watson@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-3005"), mono: true },
        ],
      },
      {
        title: "Professional Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-CNS-001"), mono: true },
          { icon: Shield, label: "Specialization", value: (p, u) => getField(p, u, "specialization", "Clinical Psychology") },
        ],
      },
    ],
  },
  "mess-manager": {
    icon: Utensils,
    title: "Mess Manager Profile",
    subtitle: "Your mess and catering staff profile information.",
    profileSubtitle: (p, u) => `Mess Manager \u00b7 ${getField(p, u, "employeeId", "EMP-MES-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "alex.johnson@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-1101"), mono: true },
        ],
      },
      {
        title: "Employment Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-MES-001"), mono: true },
          { icon: Shield, label: "Department", value: (p, u) => getField(p, u, "department", "Mess & Catering") },
        ],
      },
    ],
  },
  maintenance: {
    icon: Wrench,
    title: "Maintenance Staff Profile",
    subtitle: "Your facility maintenance staff profile information.",
    profileSubtitle: (p, u) => `Maintenance \u00b7 ${getField(p, u, "employeeId", "EMP-MNT-001")}`,
    sections: [
      {
        title: "Contact Information",
        fields: [
          { icon: Mail, label: "Email", value: (p, u) => getField(p, u, "email", u?.email || "carlos.garcia@college.edu") },
          { icon: Phone, label: "Contact", value: (p, u) => getField(p, u, "contactNo", "+1 555-1201"), mono: true },
        ],
      },
      {
        title: "Employment Details",
        fields: [
          { icon: Hash, label: "Employee ID", value: (p, u) => getField(p, u, "id", "EMP-MNT-001"), mono: true },
          { icon: Shield, label: "Department", value: (p, u) => getField(p, u, "department", "Facility Management") },
        ],
      },
    ],
  },
};

export default function StaffProfilePage() {
  const { user } = useAuthStore();

  const { data: profileRes } = useQuery({
    queryKey: ["staff-profile"],
    queryFn: api.getMe,
  });

  const userData = profileRes?.data;
  const profileRef = (userData?.profileRef || {}) as Record<string, any>;

  const subRole = user?.staffSubRole;
  const config = subRole ? STAFF_ROLE_CONFIG[subRole] : null;

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-sm text-slate-400">Staff profile configuration not found for your role.</p>
      </div>
    );
  }

  const profile = {
    name: getName(profileRef, user, user?.name || "Staff Member"),
    subtitle: config.profileSubtitle(profileRef, user),
  };

  const sections = config.sections.map((section) => ({
    title: section.title,
    fields: section.fields.map((field) => ({
      icon: field.icon,
      label: field.label,
      value: field.value(profileRef, user),
      mono: field.mono,
    })),
  }));

  return (
    <ProfileDetailPage
      roleIcon={config.icon}
      title={config.title}
      subtitle={config.subtitle}
      profile={profile}
      sections={sections}
    />
  );
}
