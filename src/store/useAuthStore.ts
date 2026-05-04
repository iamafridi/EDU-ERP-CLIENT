import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { queryClient } from "@/lib/queryClient";

export type UserRole =
  | "super-admin"
  | "domain-admin"
  | "faculty"
  | "student"
  | "staff"
  | null;

export type DomainAdminType =
  | "faculty-admin"
  | "finance-admin"
  | "medical-admin"
  | "staff-admin";

export type StaffCategory =
  | "medical"
  | "finance"
  | "security"
  | "facility"
  | "library"
  | "frontdesk"
  | "mess";

export type StaffSubRole =
  | "doctor"
  | "nurse"
  | "lab-technician"
  | "pharmacist"
  | "accountant"
  | "guard"
  | "warden"
  | "maintenance"
  | "librarian"
  | "receptionist"
  | "counselor"
  | "mess-manager";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  firebaseUid?: string;
  isDemo?: boolean;
  domainAdminType?: DomainAdminType;
  staffSubRole?: StaffSubRole;
  staffCategory?: StaffCategory;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (profile: UserProfile, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (profile, token) =>
        set((state) => {
          if (state.user && state.user.role !== profile.role) {
            queryClient.clear();
          }
          return { user: profile, token, isAuthenticated: true };
        }),
      logout: () => {
        queryClient.clear();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "hostelpro-auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const roleLabels: Record<NonNullable<UserRole>, string> = {
  "super-admin": "Super Administrator",
  "domain-admin": "Domain Administrator",
  faculty: "Faculty Member",
  student: "Student",
  staff: "Staff",
};

export const domainAdminTypeLabels: Record<DomainAdminType, string> = {
  "faculty-admin": "Faculty Administrator",
  "finance-admin": "Finance Administrator",
  "medical-admin": "Medical Administrator",
  "staff-admin": "Staff Administrator",
};

export const staffSubRoleLabels: Record<StaffSubRole, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  "lab-technician": "Lab Technician",
  pharmacist: "Pharmacist",
  accountant: "Accountant",
  guard: "Security Guard",
  warden: "Warden",
  maintenance: "Maintenance Staff",
  librarian: "Librarian",
  receptionist: "Receptionist",
  counselor: "Counselor",
  "mess-manager": "Mess Manager",
};

export const staffCategoryLabels: Record<StaffCategory, string> = {
  medical: "Medical Staff",
  finance: "Finance Staff",
  security: "Security Staff",
  facility: "Facility Staff",
  library: "Library Staff",
  frontdesk: "Front Desk Staff",
  mess: "Mess Staff",
};

export const hasRole = (user: { role: UserRole } | null, allowedRoles: UserRole[]): boolean => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};
