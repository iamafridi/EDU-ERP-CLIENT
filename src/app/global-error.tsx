"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#faf8ff]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Critical Error</h2>
            <p className="text-sm text-slate-500 mb-4">
              {error.message || "A critical application error occurred."}
            </p>
            <button
              onClick={reset}
              className="inline-flex h-10 px-5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors items-center justify-center cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
