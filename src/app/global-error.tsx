"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Global error boundary — must render its own <html> and <body> because the
 * root layout has crashed. Uses minimal inline styles that approximate the
 * design tokens so the page is never completely unstyled.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#faf8ff", color: "#1e293b" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <AlertTriangle size={24} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Critical Error</h2>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 360, marginBottom: 8 }}>
            {error.message || "A critical application error occurred."}
          </p>
          {isDev && error?.digest && (
            <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginBottom: 24 }}>
              Digest: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 20px", background: "#2563EB", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
