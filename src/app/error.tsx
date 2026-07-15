"use client";

import React from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-[#faf8ff] via-[#ededf9] to-[#d3e4fe] relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-red-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-500/15 blur-3xl" />
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-lg text-slate-600 mb-2">Something went wrong</p>
        <p className="text-sm text-slate-400 mb-2 max-w-md">{error.message || "An unexpected error occurred."}</p>
        <p className="text-xs text-slate-400 mb-8">Digest: {error.digest || "N/A"}</p>
        <button
          onClick={reset}
          className="inline-flex h-11 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors items-center justify-center cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
