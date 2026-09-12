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
  FileCheck,
  Plus,
  Building2,
  DollarSign,
  Package,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Library,
  GraduationCap,
  Home,
  Check,
  Search,
  Filter,
} from 'lucide-react';

interface Requisition {
  _id: string;
  reqNumber: string;
  title: string;
  requestorName: string;
  department: string;
  category: 'LIBRARY' | 'LABORATORY' | 'FACULTY_CLASSROOM' | 'HOSTEL_LOGISTICS';
  itemType: 'ASSET' | 'CONSUMABLE';
  quantity: number;
  estimatedCost: number;
  urgency: 'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL';
  status: 'DRAFT' | 'PENDING_HOD' | 'APPROVED_HOD' | 'APPROVED_BY_BOARD' | 'DISPATCHED_TO_PO' | 'REJECTED';
  justification: string;
  submittedAt: string;
}

export default function RequisitionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'ALL' | 'LIBRARY' | 'LABORATORY' | 'FACULTY_CLASSROOM' | 'HOSTEL_LOGISTICS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
  const [selectedReqForTender, setSelectedReqForTender] = useState<Requisition | null>(null);
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'LIBRARY' | 'LABORATORY' | 'FACULTY_CLASSROOM' | 'HOSTEL_LOGISTICS'>('LIBRARY');
  const [itemType, setItemType] = useState<'ASSET' | 'CONSUMABLE'>('ASSET');
  const [quantity, setQuantity] = useState('10');
  const [estimatedCost, setEstimatedCost] = useState('50000');
  const [urgency, setUrgency] = useState<'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL');
  const [justification, setJustification] = useState('');

  const { data: requisitions = [], isLoading } = useQuery<Requisition[]>({
    queryKey: ['campusRequisitions'],
    queryFn: async () => {
      const res = await api.getRequisitions();
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      const matchesTab = activeTab === 'ALL' || r.category === activeTab;
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requestorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [requisitions, activeTab, searchQuery]);

  const metrics = useMemo(() => {
    const totalCount = requisitions.length;
    const totalEstValue = requisitions.reduce((sum, r) => sum + r.estimatedCost, 0);
    const approvedBoard = requisitions.filter((r) => r.status === 'APPROVED_BY_BOARD' || r.status === 'DISPATCHED_TO_PO').length;
    const pendingReview = requisitions.filter((r) => r.status === 'PENDING_HOD' || r.status === 'APPROVED_HOD').length;
    return { totalCount, totalEstValue, approvedBoard, pendingReview };
  }, [requisitions]);

  const createMutation = useMutation({
    mutationFn: () =>
      api.createRequisition({
        title,
        requestorName: user?.name || 'Faculty Member',
        department: user?.role === 'student' ? 'Student Body' : 'Medical Sciences Dept',
        category,
        itemType,
        quantity: Number(quantity) || 1,
        estimatedCost: Number(estimatedCost) || 0,
        urgency,
        justification,
        submittedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campusRequisitions'] });
      setIsCreateModalOpen(false);
      setTitle('');
      setJustification('');
      setSuccessToast('Requisition logged and submitted into Department Approval Pipeline.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateRequisitionStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campusRequisitions'] });
      setSuccessToast('Requisition approval status updated.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  const getUrgencyTone = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'danger';
      case 'URGENT':
        return 'warning';
      case 'NORMAL':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISPATCHED_TO_PO':
        return <Badge tone="success">PO Dispatched</Badge>;
      case 'APPROVED_BY_BOARD':
        return <Badge tone="success">Board Approved</Badge>;
      case 'APPROVED_HOD':
        return <Badge tone="primary">HOD Cleared</Badge>;
      case 'PENDING_HOD':
        return <Badge tone="warning">Pending HOD</Badge>;
      default:
        return <Badge tone="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Universal Requisition Management"
        subtitle="End-to-end material and capital fund intake for Library, Laboratories, Classrooms, and Residential Hostels."
        actions={
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Requisition</span>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card pad="md" className="flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Requisitions</span>
          <div className="text-2xl font-black font-mono text-text mt-2">{metrics.totalCount} Filed</div>
          <span className="text-[11px] text-text-muted mt-1">Across 4 institutional wings</span>
        </Card>

        <Card pad="md" className="flex flex-col justify-between border-primary/20 bg-primary/5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Aggregate Estimated Value</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            ৳{metrics.totalEstValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1">In Bangladeshi Taka (৳)</span>
        </Card>

        <Card pad="md" className="flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Under Review</span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-2">{metrics.pendingReview} Requests</div>
          <span className="text-[11px] text-text-muted mt-1">Awaiting HOD / Bursar vetting</span>
        </Card>

        <Card pad="md" className="flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Board Approved & Dispatched</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">{metrics.approvedBoard} Cleared</div>
          <span className="text-[11px] text-text-muted mt-1">Ready for Purchase Order Issue</span>
        </Card>
      </div>

      {/* Category Tabs & Search */}
      <Card pad="md" className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Requisitions', icon: Layers },
              { id: 'LIBRARY', label: 'Library Books & Sets', icon: Library },
              { id: 'LABORATORY', label: 'Lab & Clinical Reagents', icon: Package },
              { id: 'FACULTY_CLASSROOM', label: 'Faculty & Smart Classes', icon: GraduationCap },
              { id: 'HOSTEL_LOGISTICS', label: 'Hostel & Residential', icon: Home },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text border border-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search title, dept, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </Card>

      {/* Requisitions List */}
      <div className="space-y-3">
        {filteredRequisitions.map((req) => (
          <Card
            key={req._id}
            pad="md"
            className="hover:border-primary/50 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-primary">{req.reqNumber}</span>
                  <h3 className="font-bold text-base text-text">{req.title}</h3>
                  <Badge tone={getUrgencyTone(req.urgency)} className="text-[10px] py-0 px-1.5">
                    {req.urgency}
                  </Badge>
                  <Badge tone="default" className="text-[10px] py-0 px-1.5">
                    {req.itemType}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Requested by <span className="font-semibold text-text">{req.requestorName}</span> ({req.department}) • Qty: {req.quantity}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono font-bold text-base text-emerald-400">
                    ৳{req.estimatedCost.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-muted">Estimated Budget</div>
                </div>
                {getStatusBadge(req.status)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-text-muted">
              <p className="italic text-text/80 line-clamp-1">
                &ldquo;{req.justification}&rdquo;
              </p>

              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'PENDING_HOD' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'APPROVED_HOD' })}
                    loading={updateStatusMutation.isPending}
                    className="text-xs"
                  >
                    HOD Approve
                  </Button>
                )}
                {req.status === 'APPROVED_HOD' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'APPROVED_BY_BOARD' })}
                    loading={updateStatusMutation.isPending}
                    className="text-xs"
                  >
                    Board Escalate
                  </Button>
                )}
                {req.status === 'APPROVED_BY_BOARD' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReqForTender(req);
                      setIsTenderModalOpen(true);
                    }}
                    className="text-xs text-sky-400 border-sky-500/30"
                  >
                    View 3-Bid Tender
                  </Button>
                )}
                {req.status === 'APPROVED_BY_BOARD' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'DISPATCHED_TO_PO' })}
                    loading={updateStatusMutation.isPending}
                    className="text-xs text-emerald-400 border-emerald-500/30"
                  >
                    Dispatch to PO
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Requisition Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="File New Institutional Requisition"
      >
        <div className="space-y-4 text-xs">
          <FormField label="Requisition Title / Equipment Name">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 50x High-Titer Antigen Rapid Test Kits"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Requisition Wing">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
              >
                <option value="LIBRARY">Library & Academic Books</option>
                <option value="LABORATORY">Laboratory & Clinical Consumables</option>
                <option value="FACULTY_CLASSROOM">Faculty & Classroom Hardware</option>
                <option value="HOSTEL_LOGISTICS">Hostel & Estate Amenities</option>
              </select>
            </FormField>

            <FormField label="Item Type">
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
              >
                <option value="ASSET">Fixed Asset (Capital)</option>
                <option value="CONSUMABLE">Expendable Consumable</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Quantity">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </FormField>
            <FormField label="Estimated Total BDT (৳)">
              <Input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </FormField>
            <FormField label="Urgency Level">
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </FormField>
          </div>

          <FormField label="Operational Justification & Allocation Requirement">
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="State syllabus requirements, student enrollment impact, or safety rationale..."
              className="w-full p-2.5 bg-surface border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!title || createMutation.isPending}
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Submit Requisition
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3-Bid Tender Comparative Statement Modal */}
      <Modal
        isOpen={isTenderModalOpen}
        onClose={() => setIsTenderModalOpen(false)}
        title={`3-Bid Tender Comparative Statement: ${selectedReqForTender?.reqNumber || ''}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Institutional Procurement Compliance requires at least 3 competing vendor bids evaluated for statutory compliance, delivery lead time, and lowest evaluated cost.
          </p>

          <div className="space-y-3">
            {[
              {
                bidId: "BID-101",
                vendorName: "MediTech Importers Ltd.",
                quotedAmount: 182000,
                deliveryLeadDays: 14,
                complianceScore: 96,
                status: "LOWEST_EVALUATED_BIDDER",
                warrantyMonths: 24,
                isRecommended: true,
              },
              {
                bidId: "BID-102",
                vendorName: "Scientific Instruments BD Co.",
                quotedAmount: 195000,
                deliveryLeadDays: 21,
                complianceScore: 92,
                status: "COMPLIANT",
                warrantyMonths: 12,
                isRecommended: false,
              },
              {
                bidId: "BID-103",
                vendorName: "Apex BioSciences Logistics",
                quotedAmount: 210000,
                deliveryLeadDays: 10,
                complianceScore: 88,
                status: "NON_RESPONSIVE_HIGH",
                warrantyMonths: 12,
                isRecommended: false,
              },
            ].map((bid) => (
              <div
                key={bid.bidId}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  bid.isRecommended
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-border bg-surface'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text text-sm">{bid.vendorName}</span>
                    {bid.isRecommended && (
                      <Badge tone="success" className="text-[10px]">
                        Recommended Awardee
                      </Badge>
                    )}
                  </div>
                  <p className="text-text-muted mt-0.5">
                    Lead Time: {bid.deliveryLeadDays} Days • Technical Score: {bid.complianceScore}% • Warranty: {bid.warrantyMonths} Mos
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-text">
                    ৳{bid.quotedAmount.toLocaleString()}
                  </div>
                  <Button
                    variant={bid.isRecommended ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setIsTenderModalOpen(false);
                      setSuccessToast(`Purchase Order assigned to lowest evaluated bidder: ${bid.vendorName}`);
                      setTimeout(() => setSuccessToast(''), 4000);
                    }}
                    className="text-xs py-1 h-auto mt-1"
                  >
                    Select Bid
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsTenderModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
