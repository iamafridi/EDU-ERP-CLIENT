'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  ShieldAlert, 
  Activity
} from 'lucide-react';

export default function BloodBankPage() {
  const queryClient = useQueryClient();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState(1);
  const [patientId, setPatientId] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const { data: bloodStock = [], isLoading } = useQuery({
    queryKey: ['bloodStock'],
    queryFn: api.getBloodStock,
  });

  const requestTransfusionMutation = useMutation({
    mutationFn: api.requestBloodTransfusion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
      setSuccessMsg(`Transfusion requisition for ${units} unit(s) of ${bloodGroup} registered & cross-matched.`);
      setIsRequestModalOpen(false);
      setPatientId('');
      setDoctorName('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Cross-match failed: Insufficient stock units available.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestTransfusionMutation.mutate({
      bloodGroupRequired: bloodGroup,
      units: Number(units),
      patientId: patientId || 'PAT-001',
      requestedBy: doctorName || 'Attending Physician',
      requestedAt: new Date(),
    });
  };

  const totalUnits = bloodStock.reduce((acc: number, item: any) => acc + (item.unitsAvailable || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <Droplet className="w-6 h-6 text-red-500 fill-red-500/20" />
            Blood Bank & Transfusion Logistics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time cold-chain blood reserve monitoring, cross-match verification, and emergency donor registry.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Request Blood Units
          </button>
        </div>
      </div>

      {/* Notifications */}
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
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/40 bg-card">
          <div className="text-xs uppercase font-semibold text-muted-foreground">Total Reserve</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-2">{totalUnits} Bags</div>
          <div className="text-xs text-muted-foreground mt-1">Cold storage: 4°C</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/40 bg-card">
          <div className="text-xs uppercase font-semibold text-muted-foreground">Universal Donor (O-)</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">
            {bloodStock.find((s: any) => s.bloodGroup === 'O-')?.unitsAvailable || 0} Units
          </div>
          <div className="text-xs text-amber-400 mt-1">Emergency Standby</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/40 bg-card">
          <div className="text-xs uppercase font-semibold text-muted-foreground">Testing Protocol</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">100% Screened</div>
          <div className="text-xs text-muted-foreground mt-1">ELISA & NAT Verified</div>
        </div>
        <div className="p-4 rounded-2xl border border-border/40 bg-card">
          <div className="text-xs uppercase font-semibold text-muted-foreground">Registered Donors</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">840</div>
          <div className="text-xs text-primary mt-1">Campus Community</div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40 font-semibold text-sm text-foreground flex items-center justify-between">
          <span>Current Banked Units by Group & Component</span>
          <span className="text-xs text-muted-foreground">Auto-updates on transfusion</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b border-border/40">
              <tr>
                <th className="px-6 py-3.5">ABO / Rh Group</th>
                <th className="px-6 py-3.5">Component Type</th>
                <th className="px-6 py-3.5">Available Bags</th>
                <th className="px-6 py-3.5">Storage Batch</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Querying blood bank inventory...
                  </td>
                </tr>
              ) : bloodStock.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No blood stock data available.
                  </td>
                </tr>
              ) : (
                bloodStock.map((stock: any) => (
                  <tr key={stock._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-base text-foreground font-mono">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 mr-2">
                        {stock.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">
                      {stock.componentType || 'WHOLE_BLOOD'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground">
                      {stock.unitsAvailable} Unit{stock.unitsAvailable !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      BATCH-{stock._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      {stock.unitsAvailable > 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Adequate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Critical Low
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border/40 bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-lg font-bold text-foreground">Requisition Blood Units</h3>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Blood Group Required
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O- (Universal)</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Patient Hospital ID
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="e.g. PAT-2026-092"
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Prescribing Consultant
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Alistair Who"
                    className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border/40 text-sm font-semibold hover:bg-muted/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestTransfusionMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500"
                  >
                    {requestTransfusionMutation.isPending ? 'Verifying...' : 'Validate & Dispatch'}
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
