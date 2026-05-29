import React from "react";

const INSTITUTIONS = [
  "GLOBAL TECH UNIVERSITY",
  "APOLLO INSTITUTE",
  "METROPOLITAN CAMPUS",
  "AURELIA RESIDENCES",
  "IMPERIAL ACADEMY",
];

export default function TrustStrip() {
  return (
    <section className="py-7 border-y border-white/[0.08] bg-[#0C0D18]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/40 uppercase font-ui shrink-0 text-center sm:text-left">
            TRUSTED BY CAMPUS ADMINISTRATIONS ACROSS 120+ INSTITUTIONS
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6 sm:gap-10">
            {INSTITUTIONS.map((name, i) => (
              <span
                key={i}
                className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-white/30 hover:text-white/80 transition-colors font-ui select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
