"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";
import { UserRole } from "@/store/useAuthStore";

type CanProps = {
  I?: string;
  this?: string;
  role?: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function Can({ I, this: module, role, children, fallback = null }: CanProps) {
  const { can, roleIs } = usePermission();

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roleIs(...roles)) return <>{fallback}</>;
    return <>{children}</>;
  }

  if (I && module) {
    if (!can(I, module)) return <>{fallback}</>;
    return <>{children}</>;
  }

  return <>{children}</>;
}
