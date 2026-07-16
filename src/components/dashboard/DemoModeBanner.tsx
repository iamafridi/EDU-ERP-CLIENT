"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function DemoModeBanner() {
  const user = useAuthStore((s) => s.user);
  if (!user?.isDemo) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium flex items-center justify-center gap-2">
      <span>🔍</span>
      <span>Demo Mode — You are in view-only mode. You can browse all features but cannot create, edit, or delete data.</span>
    </div>
  );
}
