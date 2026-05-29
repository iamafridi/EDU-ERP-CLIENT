import React from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { ToastProvider } from "@/components/landing/ToastFeedback";
import ScrollProgressBar from "@/components/landing/ScrollProgressBar";

/**
 * Public route group layout.
 *
 * Provides header + footer for unauthenticated pages: home, about, pricing,
 * and login. No auth guard — these pages are accessible without a session.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-[#090A10] text-white selection:bg-[#624FDA] selection:text-white relative">
        <ScrollProgressBar />
        <PublicHeader />
        <main className="flex-1 pt-24 sm:pt-28">{children}</main>
        <PublicFooter />
      </div>
    </ToastProvider>
  );
}
