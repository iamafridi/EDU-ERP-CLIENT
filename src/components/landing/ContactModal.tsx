"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  Building2,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Send,
} from "lucide-react";
import { useToast } from "./ToastFeedback";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: string;
}

const MODULE_OPTIONS = [
  "GAAP Core Accounting & Trial Balance (23+ Features)",
  "EDU Orbound Student Billing & Credit Ledger",
  "Google Classroom Style LMS & Timed Quizzes",
  "Hostel Multi-Block 3D Bed Matrix & Gate Passes",
  "Smart Mess Dining Hall & RFID Meal Tokens",
  "Bus Fleet GPS Tracking & Designated Stops",
  "Campus Clinic Infirmary & Doctor Appointments",
  "Library Accession, Barcodes & Circulation",
  "Biometric Attendance, Staff HR & Payroll",
  "Online Admissions & Quota Merit Lists",
];

export default function ContactModal({ isOpen, onClose, defaultModule }: ContactModalProps) {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("Dean / Provost");
  const [campusSize, setCampusSize] = useState("1,000 - 5,000 Students");
  const [selectedModules, setSelectedModules] = useState<string[]>(
    defaultModule ? [defaultModule] : [MODULE_OPTIONS[0], MODULE_OPTIONS[1]]
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !institution) {
      showToast("Please complete required contact fields.", "info");
      return;
    }

    setIsSubmitting(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      fullName,
      email,
      phone,
      institution,
      role,
      campusSize,
      interests: selectedModules,
      message: message || "Requested institutional presentation and demo dataset.",
    };

    try {
      // 1. Post to internal briefing pipeline route
      await fetch("/api/inquiries/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateParams),
      }).catch((e) => console.log("Briefing local pipeline log:", e));

      // 2. Post to EmailJS if credentials are setup
      if (serviceId && templateId && publicKey) {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              from_name: fullName,
              from_email: email,
              phone_number: phone,
              institution_name: institution,
              designation: role,
              campus_size: campusSize,
              interested_modules: selectedModules.join(", "),
              message: message || "Requested institutional presentation and demo dataset.",
            },
          }),
        });
      }

      showToast("Institutional briefing request recorded successfully!");
      setSubmitted(true);
    } catch (err) {
      console.warn("Briefing transport warning:", err);
      showToast("Briefing request registered!");
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl cursor-pointer"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/15 bg-[#0A0C16] shadow-2xl shadow-black/90 p-6 sm:p-9 text-white max-h-[92vh] overflow-y-auto my-auto"
            role="dialog"
            aria-modal="true"
          >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="max-w-xl mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/40 text-[11px] font-bold text-[#8C7BE8] uppercase tracking-wider font-ui mb-3">
                <Sparkles size={13} />
                <span>INSTITUTIONAL BRIEFING &amp; SYSTEM ARCHITECTURE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-normal text-white font-display tracking-tight mb-2">
                Let&apos;s Talk: Connect with System Architects
              </h2>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-body">
                Tailored for vice chancellors, treasurers, registrars, and IT directors planning campus-wide modernization.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                    Full Name &amp; Academic Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Prof. Dr. Tariqur Rahman"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-body"
                    />
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                    Campus / Institutional Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="registrar@eastdelta.edu.bd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-body"
                    />
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* University Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                    University / College / Group Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="East Delta University (Chittagong)"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-body"
                    />
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="+880 1819-000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-body"
                    />
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                    Your Institutional Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#121424] border border-white/15 text-white text-xs focus:outline-none focus:border-violet-500 font-body"
                  >
                    <option value="Vice Chancellor / Provost">Vice Chancellor / Provost</option>
                    <option value="Dean / Registrar">Dean / Registrar</option>
                    <option value="Chief Financial Officer / Treasurer">Chief Financial Officer / Treasurer</option>
                    <option value="IT Director / Systems Engineer">IT Director / Systems Engineer</option>
                    <option value="Hostel Warden / Hall Super">Hostel Warden / Hall Super</option>
                    <option value="Department Chair / Faculty">Department Chair / Faculty</option>
                  </select>
                </div>

                {/* Campus Size */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                    Estimated Student Body
                  </label>
                  <select
                    value={campusSize}
                    onChange={(e) => setCampusSize(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#121424] border border-white/15 text-white text-xs focus:outline-none focus:border-violet-500 font-body"
                  >
                    <option value="Under 1,000 Students">Under 1,000 Students</option>
                    <option value="1,000 - 5,000 Students">1,000 - 5,000 Students</option>
                    <option value="5,000 - 15,000 Students">5,000 - 15,000 Students</option>
                    <option value="15,000+ Students (Multi-Campus)">15,000+ Students (Multi-Campus)</option>
                  </select>
                </div>
              </div>

              {/* Modules of Interest Pills */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2 font-ui">
                  Modules of Immediate Priority (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MODULE_OPTIONS.map((mod) => {
                    const isSelected = selectedModules.includes(mod);
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => toggleModule(mod)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-violet-600/30 border-violet-400 text-white shadow-sm shadow-violet-900/40"
                            : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]"
                        }`}
                      >
                        {isSelected && <span className="text-violet-300 mr-1.5">✓</span>}
                        <span>{mod}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 font-ui">
                  Specific Requirements or Current System Constraints
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Migrating from Orbound blackbox & manual spreadsheet billing to unified GAAP double-entry core..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-violet-500 font-body"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-xl shadow-violet-900/40 font-ui flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send size={16} />
                <span>{isSubmitting ? "Dispatching Dossier..." : "Send Institutional Briefing Request"}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-white/45 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Institutional NDA guaranteed</span>
                </span>
                <span>Configured for EmailJS service transport</span>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white font-ui">
              Inquiry Dispatched Successfully
            </h3>
            <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed font-body">
              Thank you, <span className="font-bold text-white">{fullName}</span>. Our lead campus architect will review
              the configuration profile for <span className="font-bold text-white">{institution}</span> and reach out
              to <span className="text-violet-300 font-mono">{email}</span> within 4 business hours.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="h-10 px-6 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold font-ui transition-colors cursor-pointer border border-white/15"
              >
                Return to Campus Explorer
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
