"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const ALL_ROLES: UserRole[] = [
  "super-admin", "domain-admin", "faculty", "student", "staff",
];

const routePermissions: Record<string, UserRole[]> = {
  "/dashboard": ALL_ROLES,
  "/profile": ALL_ROLES,

  // Student management
  "/students": ["super-admin", "domain-admin", "faculty", "staff"],
  "/students/register": ["super-admin", "domain-admin"],

  // Faculty & academics
  "/faculties": ["super-admin", "domain-admin", "faculty"],
  "/courses": ["super-admin", "domain-admin", "faculty", "student"],
  "/departments": ["super-admin", "domain-admin", "faculty", "student"],
  "/semesters": ["super-admin", "domain-admin", "faculty", "student"],
  "/academics": ["super-admin", "domain-admin", "faculty", "student"],

  // Hostel & rooms
  "/rooms": ["super-admin", "domain-admin", "staff", "student"],

  // Finance & Capital Operations
  "/fees": ["super-admin", "domain-admin", "staff", "student"],
  "/receipts": ["super-admin", "domain-admin", "staff", "student"],
  "/payroll": ["super-admin", "domain-admin", "staff"],
  "/expenses": ["super-admin", "domain-admin", "staff"],
  "/budget": ["super-admin", "domain-admin", "staff"],
  "/daily-wages": ["super-admin", "domain-admin", "staff"],
  "/construction": ["super-admin", "domain-admin", "staff"],

  // Security & incidents
  "/security": ["super-admin", "domain-admin", "staff"],
  "/incidents": ["super-admin", "domain-admin", "staff", "faculty", "student"],

  // Grievances
  "/grievances": ["super-admin", "domain-admin", "faculty", "student", "staff"],

  // Communication
  "/chat": ["super-admin", "domain-admin", "faculty", "student", "staff"],
  "/notifications": ALL_ROLES,
  "/notices": ALL_ROLES,

  // Medical
  "/clinical": ["super-admin", "domain-admin", "faculty", "student", "staff"],
  "/health-center": ["super-admin", "domain-admin", "staff", "student"],
  "/opd": ["super-admin", "domain-admin", "staff"],
  "/ipd": ["super-admin", "domain-admin", "staff"],
  "/laboratory": ["super-admin", "domain-admin", "staff"],
  "/pharmacy": ["super-admin", "domain-admin", "staff"],

  // Admissions & alumni
  "/admissions": ["super-admin", "domain-admin", "student"],
  "/alumni": ["super-admin", "domain-admin", "faculty", "student", "staff"],

  // Transport, mess, library
  "/transport": ["super-admin", "domain-admin", "student", "faculty", "staff"],
  "/mess": ["super-admin", "domain-admin", "staff", "student"],
  "/library": ["super-admin", "domain-admin", "staff", "student", "faculty"],

  // Attendance & exams
  "/attendance": ["super-admin", "domain-admin", "faculty", "student", "staff"],
  "/exams": ["super-admin", "domain-admin", "faculty", "student"],
  "/timetable": ["super-admin", "domain-admin", "faculty", "student"],
  "/transcripts": ["super-admin", "domain-admin", "faculty", "student"],
  "/curriculum": ["super-admin", "domain-admin", "faculty", "student"],
  "/syllabus": ["super-admin", "domain-admin", "faculty", "student"],
  "/enrollment": ["super-admin", "domain-admin", "faculty", "student"],
  "/study-materials": ["super-admin", "domain-admin", "faculty", "student"],
  "/academic-calendar": ["super-admin", "domain-admin", "faculty", "student", "staff"],

  // Leave
  "/leave": ["super-admin", "domain-admin", "faculty", "student", "staff"],

  // Scholarships
  "/scholarships": ["super-admin", "domain-admin", "staff", "student"],
  "/accreditation": ["super-admin", "domain-admin"],
  "/research": ["super-admin", "domain-admin", "faculty", "student"],
  "/skill-lab": ["super-admin", "domain-admin", "faculty", "student"],

  // Logbook & clinical
  "/logbook": ["super-admin", "domain-admin", "faculty", "student", "staff"],

  // Parents
  "/parents": ["super-admin", "domain-admin"],

  // Reports
  "/reports": ["super-admin", "domain-admin", "staff"],

  // User management
  "/users": ["super-admin", "domain-admin"],

  // Audit trail
  "/audit": ["super-admin", "domain-admin"],

  // Admin & governance
  "/admin": ["super-admin", "domain-admin"],
  "/switchboard": ["super-admin", "domain-admin"],
  "/accounting": ["super-admin", "domain-admin", "staff"],

  // Settings
  "/settings": ALL_ROLES,

  // Staff profile (consolidated)
  "/staff": ["staff"],
};

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  // Demo showcase sessions use mock token prefixes and should not be expired
  if (token.startsWith("mock-") || token.includes("demo-session")) return false;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, token, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (token && isTokenExpired(token)) {
      logout();
      router.push("/login");
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Check RBAC for this route
    const matchedPrefix = Object.keys(routePermissions)
      .sort((a, b) => b.length - a.length)
      .find((prefix) => pathname.startsWith(prefix));
    if (matchedPrefix) {
      const allowed = routePermissions[matchedPrefix];
      if (user?.role && !allowed.includes(user.role)) {
        router.push("/dashboard");
      }
    }
  }, [isMounted, isAuthenticated, user, pathname, router, token, logout]);

  if (!isMounted || !isAuthenticated) {
    return (
      <LoadingScreen
        title="MEDCAMPUS OS"
        subtitle="Verifying cryptographic tokens & institutional clearance..."
        variant="full"
        showProgress={true}
      />
    );
  }

  return <>{children}</>;
}
