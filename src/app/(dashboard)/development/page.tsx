'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
} from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface Project {
  _id: string;
  code: string;
  title: string;
  category: string;
  projectDirector: string;
  allocatedBudget: number;
  totalDisbursed: number;
  committedDues: number;
  remainingBuffer: number;
  startDate: string;
  targetCompletion: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progressPct: number;
}

interface ProjectJournal {
  _id: string;
  voucherNumber: string;
  projectId: string;
  projectTitle: string;
  date: string;
  title: string;
  category: string;
  contractor: string;
  amountPaid: number;
  dueAmount: number;
  paymentMethod: string;
  bankAccount: string;
  invoiceRef: string;
  status: string;
}

export default function CapitalDevelopmentPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'PROJECTS_JOURNAL' | 'RETENTION_ESCROW'>('PROJECTS_JOURNAL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Journal form state
  const [targetProject, setTargetProject] = useState('DEV-PRJ-01');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalCategory, setJournalCategory] = useState('CIVIL_WORKS');
  const [contractor, setContractor] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [dueAmount, setDueAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('BANK_WIRE_TRANSFER');
  const [bankAccount, setBankAccount] = useState('Sonali Bank Escrow A/C #020001889');
  const [invoiceRef, setInvoiceRef] = useState('');

  // Fetch Projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['developmentProjects'],
    queryFn: async () => {
      const res = await api.getDevelopmentProjects();
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  // Fetch Daily Journals
  const { data: journals = [], isLoading: isLoadingJournals } = useQuery<ProjectJournal[]>({
    queryKey: ['developmentJournals', selectedProjectId],
    queryFn: async () => {
      const res = await api.getProjectJournals(selectedProjectId === 'ALL' ? undefined : selectedProjectId);
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  // Fetch High-Level Metrics
  const { data: metrics } = useQuery({
    queryKey: ['developmentMetrics'],
    queryFn: async () => {
      const res = await api.getDevelopmentMetrics();
      return res?.data || res;
    },
  });

  // Filtered Journals
  const filteredJournals = useMemo(() => {
    if (selectedProjectId === 'ALL') return journals;
    return journals.filter((j) => j.projectId === selectedProjectId);
  }, [journals, selectedProjectId]);

  // Aggregate Calculations
  const aggregateMetrics = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
    const totalDisbursed = projects.reduce((sum, p) => sum + p.totalDisbursed, 0);
    const totalDues = projects.reduce((sum, p) => sum + p.committedDues, 0);
    const totalRemaining = totalBudget - (totalDisbursed + totalDues);
    return { totalBudget, totalDisbursed, totalDues, totalRemaining };
  }, [projects]);

  // Create Journal Mutation
  const createJournalMutation = useMutation({
    mutationFn: () =>
      api.createProjectJournal({
        projectId: targetProject,
        title: journalTitle,
        category: journalCategory,
        contractor,
        amountPaid: Number(amountPaid) || 0,
        dueAmount: Number(dueAmount) || 0,
        paymentMethod,
        bankAccount,
        invoiceRef,
        date: new Date().toISOString().split('T')[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developmentJournals'] });
      queryClient.invalidateQueries({ queryKey: ['developmentProjects'] });
      setIsJournalModalOpen(false);
      setJournalTitle('');
      setContractor('');
      setAmountPaid('');
      setDueAmount('0');
      setInvoiceRef('');
      setSuccessToast('Daily expenditure journal posted & synchronized with GAAP General Ledger.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Capital Development & Daily Ledger Tracker"
        subtitle="Board-allocated infrastructure budgets, daily expenditure journals, and weekly financial audit rollups."
        actions={
          <Button
            variant="primary"
            onClick={() => setIsJournalModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post Daily Expenditure Journal</span>
          </Button>
        }
      />

      {/* Success Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-between text-sm shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-400/60 hover:text-emerald-400">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Essential Financial Metrics in BDT (৳) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card pad="md" className="flex flex-col justify-between border-primary/20 bg-primary/5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Total Allocated Investment
          </span>
          <div className="text-2xl font-black font-mono text-text mt-2">
            ৳{aggregateMetrics.totalBudget.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1">Board-sanctioned capital pool</span>
        </Card>

        <Card pad="md" className="flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Total Disbursed (Spend)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            ৳{aggregateMetrics.totalDisbursed.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1">Disbursed via verified bank wire & LC</span>
        </Card>

        <Card pad="md" className="flex flex-col justify-between border-amber-500/20 bg-amber-500/5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Committed Dues / Outstanding
          </span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-2">
            ৳{aggregateMetrics.totalDues.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1">Contractor payables pending audit clearance</span>
        </Card>

        <Card pad="md" className="flex flex-col justify-between border-sky-500/20 bg-sky-500/5">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            True Remaining Buffer
          </span>
          <div className="text-2xl font-black font-mono text-sky-300 mt-2">
            ৳{aggregateMetrics.totalRemaining.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1">Available liquidity buffer</span>
        </Card>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('PROJECTS_JOURNAL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'PROJECTS_JOURNAL'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text border border-border/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Capital Projects & Daily Journal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RETENTION_ESCROW')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'RETENTION_ESCROW'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text border border-border/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>10% Contractor Retention Money & Escrow</span>
        </button>
      </div>

      {/* TAB 1: CAPITAL PROJECTS & DAILY EXPENDITURE JOURNAL */}
      {activeTab === 'PROJECTS_JOURNAL' && (
        <>
          {/* Capital Development Projects Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-text">Active Capital Projects ({projects.length})</h2>
              </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs py-1.5 px-3 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Projects View</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((prj) => (
            <Card
              key={prj._id}
              pad="md"
              className="flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-primary">{prj.code}</span>
                  <Badge tone="success">{prj.progressPct}% Complete</Badge>
                </div>
                <h3 className="font-bold text-sm text-text mt-1">{prj.title}</h3>
                <p className="text-xs text-text-muted mt-0.5">Director: {prj.projectDirector}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${prj.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>Spent: ৳{prj.totalDisbursed.toLocaleString()}</span>
                  <span>Budget: ৳{prj.allocatedBudget.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Committed Dues:</span>
                  <span className="font-mono font-bold text-amber-400">৳{prj.committedDues.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Remaining Buffer:</span>
                  <span className="font-mono font-bold text-sky-400">৳{prj.remainingBuffer.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Daily Expenditure Journal & General Ledger Feed */}
      <Card pad="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <h3 className="font-bold text-base text-text">Daily Expenditure Journal & GAAP Voucher Stream</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Live journal entries debiting Work-in-Progress (WIP) Assets and crediting Bank/AP Ledgers.
            </p>
          </div>
          <Badge tone="default">Vouchers Synchronized</Badge>
        </div>

        <div className="space-y-3">
          {filteredJournals.map((j) => (
            <div
              key={j._id}
              className="p-3 bg-surface border border-border rounded-xl space-y-2 text-xs hover:border-primary/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{j.voucherNumber}</span>
                    <h4 className="font-bold text-sm text-text">{j.title}</h4>
                    <Badge tone="primary" className="text-[10px] py-0 px-1.5">
                      {j.category}
                    </Badge>
                  </div>
                  <p className="text-text-muted mt-0.5">
                    {j.projectTitle} • Contractor: <span className="font-semibold text-text">{j.contractor}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm text-emerald-400">
                    ৳{j.amountPaid.toLocaleString()} Paid
                  </div>
                  {j.dueAmount > 0 && (
                    <div className="font-mono text-[10px] text-amber-400">
                      ৳{j.dueAmount.toLocaleString()} Due
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border/30 flex flex-wrap items-center justify-between gap-2 text-text-muted text-[11px]">
                <div className="flex items-center gap-3">
                  <span>Date: {j.date}</span>
                  <span>Method: {j.paymentMethod}</span>
                  <span>Invoice: {j.invoiceRef}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-primary">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{j.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </>
      )}

      {/* TAB 2: 10% CONTRACTOR RETENTION ESCROW & DEFECT LIABILITY */}
      {activeTab === 'RETENTION_ESCROW' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">10% Contractor Retention Money & Statutory Escrow Ledger</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Statutory civil engineering retention held in bank escrow accounts during the 12-month Defect Liability Period prior to final clearance.
              </p>
            </div>
            <Badge tone="warning">GAAP Escrow Held</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "RET-2026-01",
                projectId: "DEV-PRJ-01",
                projectTitle: "Advanced Anatomy VR Simulation Suite",
                contractor: "National Engineering Consortium",
                grossCertifiedBilled: 14200000,
                liquidDisbursed: 12780000,
                retentionMoney10Pct: 1420000,
                escrowBankAccount: "Sonali Bank Contractor Escrow #020009941",
                releaseMaturityDate: "2027-09-30",
                status: "HELD_IN_ESCROW",
              },
              {
                id: "RET-2026-02",
                projectId: "DEV-PRJ-02",
                projectTitle: "Campus Fiber Optic Backbone",
                contractor: "FiberTech Bangladesh Ltd.",
                grossCertifiedBilled: 9800000,
                liquidDisbursed: 8820000,
                retentionMoney10Pct: 980000,
                escrowBankAccount: "City Bank Escrow #110029384",
                releaseMaturityDate: "2027-05-15",
                status: "HELD_IN_ESCROW",
              },
            ].map((escrow) => (
              <div key={escrow.id} className="p-4 bg-surface border border-border rounded-xl space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-primary">{escrow.id}</span>
                    <h4 className="font-bold text-sm text-text mt-0.5">{escrow.projectTitle}</h4>
                    <p className="text-text-muted">Contractor: {escrow.contractor}</p>
                  </div>
                  <Badge tone="warning">10% Escrow Held</Badge>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Gross Certified Work:</span>
                    <span className="font-mono font-bold">৳{escrow.grossCertifiedBilled.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Liquid Funds Disbursed (90%):</span>
                    <span className="font-mono font-bold">৳{escrow.liquidDisbursed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Retention Withheld (10%):</span>
                    <span className="font-mono">৳{escrow.retentionMoney10Pct.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 text-[11px] text-text-muted space-y-1">
                  <p>Escrow Account: {escrow.escrowBankAccount}</p>
                  <p className="text-sky-400">Defect Liability Release Maturity: {escrow.releaseMaturityDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Post Daily Expenditure Modal */}
      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        title="Post Daily Project Expenditure Voucher"
      >
        <div className="space-y-4 text-xs">
          <FormField label="Target Capital Project">
            <select
              value={targetProject}
              onChange={(e) => setTargetProject(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} — {p.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Expenditure Milestone / Voucher Title">
            <Input
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="e.g. Electrical Conduit Laying & Main Distribution Panel"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Expenditure Category">
              <select
                value={journalCategory}
                onChange={(e) => setJournalCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
              >
                <option value="CIVIL_WORKS">Civil Works & Foundation</option>
                <option value="ELECTRICAL_HVAC">Electrical & HVAC Fitting</option>
                <option value="EQUIPMENT_IMPORT">Specialized Equipment & Import</option>
                <option value="TELECOM_CABLE">Fiber Optic & Telecom Trenching</option>
                <option value="STRUCTURAL_STEEL">Structural Steel & Framing</option>
              </select>
            </FormField>

            <FormField label="Vendor / Contractor Name">
              <Input
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                placeholder="e.g. National Infra Consortium"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount Disbursed BDT (৳)">
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="850000"
              />
            </FormField>
            <FormField label="Retained Dues / Balance Payable BDT (৳)">
              <Input
                type="number"
                value={dueAmount}
                onChange={(e) => setDueAmount(e.target.value)}
                placeholder="150000"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Payment Channel / Instrument">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
              >
                <option value="BANK_WIRE_TRANSFER">Bank Wire Transfer (EFT)</option>
                <option value="LETTER_OF_CREDIT">Letter of Credit (LC)</option>
                <option value="DIRECT_CHEQUE">Account Payee Cheque</option>
              </select>
            </FormField>
            <FormField label="Challan / Invoice Reference #">
              <Input
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="INV-2026-901"
              />
            </FormField>
          </div>

          <FormField label="Escrow Bank Ledger Account">
            <Input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsJournalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!journalTitle || !amountPaid || createJournalMutation.isPending}
              loading={createJournalMutation.isPending}
              onClick={() => createJournalMutation.mutate()}
            >
              Post to General Ledger
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
