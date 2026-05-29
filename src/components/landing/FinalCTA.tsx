"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck, Globe, Sparkles } from "lucide-react";
import { useToast } from "./ToastFeedback";
import ContactModal from "./ContactModal";
import TryDemoModal from "./TryDemoModal";

export default function FinalCTA() {
  const { showToast } = useToast();
  const [emailInput, setEmailInput] = useState("");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactModalOpen(true);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-[#060B12] text-white relative overflow-hidden border-t border-white/[0.08]">
      {/* ─── Volumetric Brushed Gold Glow & Blueprint Grid ─── */}
      <div className="absolute inset-0 blueprint-grid-bg opacity-30 radial-fade-mask pointer-events-none -z-10" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#B98B4B]/15 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[600px] h-[350px] bg-[#0F766E]/20 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl border border-white/15 luxury-glass-card p-8 sm:p-14 lg:p-18 shadow-2xl shadow-black/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Institutional Pitch */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] text-[#D4AF37] text-[11px] font-extrabold uppercase tracking-widest font-ui border border-white/10">
                <Globe size={13} />
                <span>ENTERPRISE &amp; CAMPUS DEPLOYMENT READY</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-display leading-[1.12]">
                Ready to bring your campus into{" "}
                <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF]">
                  complete harmony
                </span>
                ?
              </h2>

              <p className="text-sm sm:text-base text-white/75 leading-relaxed font-body max-w-xl">
                Say goodbye to disconnected software silos, paper forms, and fragmented spreadsheets.
                Hostel Pro-ERP brings student enrollment, academic timetables, hostel blocks, transport routes,
                and double-entry accounting into one coherent operating rhythm.
              </p>

              {/* Deployment stats */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-ui tabular-nums">120+</div>
                  <div className="text-xs text-white/50 font-ui mt-0.5">Campuses &amp; Institutes</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-ui tabular-nums">99.98%</div>
                  <div className="text-xs text-white/50 font-ui mt-0.5">Operational Uptime</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37] font-ui tabular-nums">7-14 Days</div>
                  <div className="text-xs text-white/50 font-ui mt-0.5">Full Data Migration</div>
                </div>
              </div>
            </div>

            {/* Right Column: Direct Demo Registration Form */}
            <div className="lg:col-span-5">
              <div className="p-7 sm:p-9 rounded-2xl bg-[#0B1522]/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
                <h3 className="text-xl font-bold text-white font-ui mb-2">
                  Schedule a Live Executive Briefing
                </h3>
                <p className="text-xs text-white/60 mb-6 font-body">
                  Get a tailored demonstration with pre-configured student, faculty, and dormitory datasets.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cta-email" className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                      Institutional Work Email
                    </label>
                    <div className="relative">
                      <input
                        id="cta-email"
                        type="email"
                        placeholder="provost@university.edu"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#B98B4B]/30 transition-all font-body"
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-[#B98B4B] to-[#9E743A] hover:brightness-110 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-xl shadow-[#B98B4B]/25 font-ui flex items-center justify-center gap-2 cursor-pointer border border-[#E5C384]/30"
                  >
                    <span>Schedule Institutional Briefing</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoModalOpen(true)}
                    className="w-full h-11 bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold rounded-xl text-xs transition-all border border-white/15 font-ui flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#D4AF37]" />
                    <span>Or Launch Interactive Demo (5 Roles)</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 font-body">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-teal-400" />
                      <span>Strict NDA Signed upon request</span>
                    </span>
                    <span>Direct Principal Architect Support</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
      <TryDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </section>
  );
}
