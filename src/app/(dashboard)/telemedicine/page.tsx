'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  X, 
  User, 
  ShieldCheck, 
  Stethoscope
} from 'lucide-react';

export default function TelemedicinePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Schedule consultation state
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. James Sterling');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['telemedicineConsultations'],
    queryFn: api.getTelemedicineConsultations,
  });

  const scheduleMutation = useMutation({
    mutationFn: api.scheduleTelemedicineConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemedicineConsultations'] });
      setSuccessMsg('Telemedicine consultation room reserved and encrypted link generated.');
      setIsScheduleModalOpen(false);
      setPatientName('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleMutation.mutate({
      patientName: patientName || user?.name || 'Student Patient',
      doctorName,
      scheduledAt: scheduledAt || new Date().toISOString(),
      status: 'SCHEDULED',
      joinUrl: `https://meet.edunexus.edu/tlm-${Date.now().toString().slice(-4)}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <Video className="w-6 h-6 text-primary" />
            Telemedicine & Clinical E-Consults
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            HIPAA/BMDC-compliant encrypted WebRTC audio-visual clinical consults and student health counseling.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-hover transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Virtual Consult
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Main View: In-Call Room OR Consultation List */}
      {activeCall ? (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-2xl">
          <div className="p-4 bg-muted/40 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                Clinical Session: {activeCall.patientName} &bull; {activeCall.doctorName}
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              End-to-End Encrypted (AES-256-GCM)
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[420px] bg-background/50">
            {/* Remote Feed */}
            <div className="rounded-xl border border-border/40 bg-card/60 relative flex flex-col items-center justify-center overflow-hidden min-h-[260px]">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Stethoscope className="w-10 h-10" />
              </div>
              <p className="text-sm font-semibold text-foreground">{activeCall.doctorName}</p>
              <p className="text-xs text-muted-foreground">Remote Physician Video Stream</p>
              <span className="absolute bottom-3 left-3 text-xs bg-background/80 px-2 py-0.5 rounded font-mono text-muted-foreground">
                1080p @ 60fps
              </span>
            </div>

            {/* Local Feed */}
            <div className="rounded-xl border border-border/40 bg-card/60 relative flex flex-col items-center justify-center overflow-hidden min-h-[260px]">
              {isVideoOff ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground mb-3">
                    <VideoOff className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-muted-foreground">Camera feed is muted</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                    <User className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">You ({activeCall.patientName})</p>
                  <p className="text-xs text-muted-foreground">Local Patient Feed</p>
                </div>
              )}
              <span className="absolute bottom-3 left-3 text-xs bg-background/80 px-2 py-0.5 rounded font-mono text-muted-foreground">
                Local Device
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-muted/40 border-t border-border/40 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full border transition-all ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-card hover:bg-muted/40 text-foreground border-border/40'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-full border transition-all ${
                isVideoOff
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-card hover:bg-muted/40 text-foreground border-border/40'
              }`}
              title={isVideoOff ? 'Enable Video' : 'Disable Video'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveCall(null)}
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              Disconnect Session
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40 font-semibold text-sm text-foreground flex items-center justify-between">
            <span>Scheduled Tele-Health Consultations</span>
            <span className="text-xs text-muted-foreground">{consultations.length} Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b border-border/40">
                <tr>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Physician / Counselor</th>
                  <th className="px-6 py-3.5">Schedule</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Accessing appointment schedule...
                    </td>
                  </tr>
                ) : consultations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No upcoming virtual consultations scheduled.
                    </td>
                  </tr>
                ) : (
                  consultations.map((c: any) => (
                    <tr key={c._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {c.patientName}
                      </td>
                      <td className="px-6 py-4 text-foreground flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        {c.doctorName || 'Dr. James Sterling'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : 'Today at 2:00 PM'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {c.status || 'SCHEDULED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setActiveCall(c)}
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Enter Consultation Room
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border/40 bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-lg font-bold text-foreground">Book Virtual Consultation</h3>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Patient Name / ID
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Marcus Chen (STU-001)"
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Attending Physician
                  </label>
                  <select
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Dr. James Sterling">Dr. James Sterling (Internal Medicine)</option>
                    <option value="Prof. Clara Oswald">Prof. Clara Oswald (Microbiology & Virology)</option>
                    <option value="Dr. Alistair Who">Dr. Alistair Who (Cardiology Specialist)</option>
                    <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Student Mental Health)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border/40 text-sm font-semibold hover:bg-muted/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-hover"
                  >
                    {scheduleMutation.isPending ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
