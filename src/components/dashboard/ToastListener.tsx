"use client";

import { useEffect, useState } from "react";

export default function ToastListener() {
  const [toast, setToast] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToast(detail);
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener("demo-toast", handler);
    return () => window.removeEventListener("demo-toast", handler);
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm bg-amber-50 border border-amber-200 shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-xs font-semibold text-amber-800">Demo Mode</p>
          <p className="text-[11px] text-amber-700 mt-0.5">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
