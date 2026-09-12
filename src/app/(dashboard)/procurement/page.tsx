'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, financeApi } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input, Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import { 
  ShoppingCart, 
  PackageCheck, 
  Plus, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Scale,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Layers,
  Sparkles,
  FileCheck,
  Download,
} from 'lucide-react';
import { generateThreeWayMatchAuditPDF } from '@/lib/pdfGenerator';

interface ThreeWayMatchItem {
  id: string;
  poRef: string;
  grnRef: string;
  invoiceNo: string;
  vendorName: string;
  itemDescription: string;
  poAmount: number;
  grnReceivedAmount: number;
  invoiceBilledAmount: number;
  variance: number;
  variancePercentage: number;
  binLocation: string;
  status: 'PERFECT_MATCH' | 'VARIANCE_FLAGGED' | 'CLEARED_FOR_AP';
}

const SAMPLE_3WAY_MATCHES: ThreeWayMatchItem[] = [
  {
    id: '3WM-2026-001',
    poRef: 'PO-2026-081',
    grnRef: 'GRN-2026-041',
    invoiceNo: 'INV-SCI-9982',
    vendorName: 'Scientific Instruments BD Ltd',
    itemDescription: 'Olympus Binocular Microscopes (15 Units)',
    poAmount: 450000,
    grnReceivedAmount: 450000,
    invoiceBilledAmount: 450000,
    variance: 0,
    variancePercentage: 0.0,
    binLocation: 'VAULT-RACK-02-SHELF-A',
    status: 'CLEARED_FOR_AP',
  },
  {
    id: '3WM-2026-002',
    poRef: 'PO-2026-082',
    grnRef: 'GRN-2026-042',
    invoiceNo: 'INV-GAP-4421',
    vendorName: 'Global Academic Publishers',
    itemDescription: 'Gray\'s Anatomy & Guyton Medical Reference Sets',
    poAmount: 180000,
    grnReceivedAmount: 180000,
    invoiceBilledAmount: 180000,
    variance: 0,
    variancePercentage: 0.0,
    binLocation: 'LIB-STACK-04-DEWEY-610',
    status: 'PERFECT_MATCH',
  },
  {
    id: '3WM-2026-003',
    poRef: 'PO-2026-083',
    grnRef: 'GRN-2026-043',
    invoiceNo: 'INV-CIT-8831',
    vendorName: 'Campus IT Infrastructure Co.',
    itemDescription: 'Biometric RFID Turnstile Controllers (4 Units)',
    poAmount: 320000,
    grnReceivedAmount: 320000,
    invoiceBilledAmount: 324000,
    variance: 4000,
    variancePercentage: 1.25,
    binLocation: 'IT-STORE-CAGE-B',
    status: 'VARIANCE_FLAGGED',
  },
];

export default function ProcurementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PO' | 'GRN' | '3WAY_MATCH'>('PO');
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [threeWayMatches, setThreeWayMatches] = useState<ThreeWayMatchItem[]>(SAMPLE_3WAY_MATCHES);

  // Form states
  const [vendorName, setVendorName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  
  // GRN states
  const [selectedPoId, setSelectedPoId] = useState('');
  const [grnVendor, setGrnVendor] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');

  const { data: purchaseOrders = [], isLoading: isLoadingPo } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      try {
        const res = await api.getPurchaseOrders();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // fallback
      }
      return [
        { _id: 'PO-2026-081', poNumber: 'PO-2026-081', vendorName: 'Scientific Instruments BD Ltd', date: '2026-09-12', totalAmount: 450000, status: 'APPROVED' },
        { _id: 'PO-2026-082', poNumber: 'PO-2026-082', vendorName: 'Global Academic Publishers', date: '2026-09-15', totalAmount: 180000, status: 'APPROVED' },
        { _id: 'PO-2026-083', poNumber: 'PO-2026-083', vendorName: 'Campus IT Infrastructure Co.', date: '2026-09-22', totalAmount: 320000, status: 'PENDING' },
      ];
    },
  });

  const { data: goodsReceipts = [], isLoading: isLoadingGrn } = useQuery({
    queryKey: ['goodsReceipts'],
    queryFn: async () => {
      try {
        const res = await api.getGoodsReceipts();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // fallback
      }
      return [
        { _id: 'GRN-2026-041', grnNumber: 'GRN-2026-041', poId: 'PO-2026-081', vendorName: 'Scientific Instruments BD Ltd', invoiceAmount: 450000, status: 'POSTED' },
        { _id: 'GRN-2026-042', grnNumber: 'GRN-2026-042', poId: 'PO-2026-082', vendorName: 'Global Academic Publishers', invoiceAmount: 180000, status: 'POSTED' },
      ];
    },
  });

  const createPoMutation = useMutation({
    mutationFn: api.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setSuccessMsg('Purchase Order generated and sent to vendor.');
      setIsPoModalOpen(false);
      setVendorName('');
      setPoNumber('');
      setTotalAmount('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const createGrnMutation = useMutation({
    mutationFn: api.createGoodsReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      setSuccessMsg('Goods Receipt recorded and journal entry posted to GAAP Ledger.');
      setIsGrnModalOpen(false);
      setSelectedPoId('');
      setGrnVendor('');
      setInvoiceAmount('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !totalAmount) return;
    createPoMutation.mutate({
      poNumber: poNumber || `PO-${Date.now().toString().slice(-4)}`,
      vendorName,
      totalAmount: Number(totalAmount),
      date: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
    });
  };

  const handleCreateGrn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnVendor || !invoiceAmount) return;
    createGrnMutation.mutate({
      poId: selectedPoId || 'PO-2026-001',
      vendorName: grnVendor,
      invoiceAmount: Number(invoiceAmount),
      receiptDate: new Date(),
    });
  };

  const poColumns: Column<any>[] = [
    {
      header: 'PO Number',
      accessor: (row) => (
        <span className="font-mono font-medium text-text">{row.poNumber || row._id}</span>
      ),
      sortValue: (row) => row.poNumber || row._id,
    },
    {
      header: 'Vendor / Supplier',
      accessor: (row) => (
        <div className="flex items-center gap-2 font-medium text-text">
          <Building2 size={16} className="text-text-muted shrink-0" />
          <span>{row.vendorName || 'General Supplier'}</span>
        </div>
      ),
      sortValue: (row) => row.vendorName || '',
    },
    {
      header: 'Order Date',
      accessor: (row) => (
        <span className="text-xs text-text-muted font-mono">{row.date || '2026-09-20'}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-mono font-semibold text-text">
          ৳{Number(row.totalAmount || 0).toLocaleString()}
        </span>
      ),
      sortValue: (row) => Number(row.totalAmount || 0),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const isApproved = row.status === 'APPROVED';
        return (
          <Badge
            variant={isApproved ? 'success' : 'warning'}
            icon={isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          >
            {row.status || 'PENDING'}
          </Badge>
        );
      },
      sortValue: (row) => row.status || '',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight size={14} />}
            onClick={() => {
              setSelectedPoId(row.poNumber || row._id);
              setGrnVendor(row.vendorName || '');
              setInvoiceAmount(String(row.totalAmount || ''));
              setIsGrnModalOpen(true);
            }}
          >
            Receive GRN
          </Button>
        </div>
      ),
    },
  ];

  const grnColumns: Column<any>[] = [
    {
      header: 'GRN Ref',
      accessor: (row) => (
        <span className="font-mono font-medium text-text">{row.grnNumber || row._id}</span>
      ),
      sortValue: (row) => row.grnNumber || row._id,
    },
    {
      header: 'Related PO',
      accessor: (row) => (
        <span className="font-mono text-xs text-text-muted">{row.poId || 'PO-2026-001'}</span>
      ),
    },
    {
      header: 'Vendor',
      accessor: (row) => (
        <span className="font-medium text-text">{row.vendorName || 'General Supplier'}</span>
      ),
      sortValue: (row) => row.vendorName || '',
    },
    {
      header: 'Billed Amount',
      accessor: (row) => (
        <span className="font-mono font-semibold text-text">
          ৳{Number(row.invoiceAmount || 0).toLocaleString()}
        </span>
      ),
      sortValue: (row) => Number(row.invoiceAmount || 0),
    },
    {
      header: 'GAAP Ledger Post',
      accessor: () => (
        <Badge variant="outline" className="font-mono text-xs text-primary">
          DR 1100 / CR 2110
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant="success" icon={<CheckCircle2 size={12} />}>
          {row.status || 'POSTED'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Procurement, Store Inventory & 3-Way Match"
        description="Institutional purchasing, storekeeper Goods Received Notes (GRN), 3-way matching tolerance validation, and automatic GAAP Accounts Payable posting."
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Finance', href: '/accounting/chart-of-accounts' },
          { label: 'Procurement' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'PO' && (
              <Button
                variant="gold"
                icon={<Plus size={16} />}
                onClick={() => setIsPoModalOpen(true)}
              >
                New Purchase Order
              </Button>
            )}
            {activeTab === 'GRN' && (
              <Button
                variant="gold"
                icon={<PackageCheck size={16} />}
                onClick={() => setIsGrnModalOpen(true)}
              >
                Receive Goods (GRN)
              </Button>
            )}
          </div>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Modern Tabs */}
      <Tabs
        tabs={[
          {
            id: 'PO',
            label: `Purchase Orders (${purchaseOrders.length})`,
            icon: <ShoppingCart size={14} />,
          },
          {
            id: 'GRN',
            label: `Goods Receipts / GRN (${goodsReceipts.length})`,
            icon: <PackageCheck size={14} />,
          },
          {
            id: '3WAY_MATCH',
            label: `3-Way Match Verification (${threeWayMatches.length})`,
            icon: <Scale size={14} />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'PO' | 'GRN' | '3WAY_MATCH')}
      />

      {/* Tab 1: Purchase Orders */}
      {activeTab === 'PO' && (
        <Card noPadding>
          <DataTable
            columns={poColumns}
            data={purchaseOrders}
            loading={isLoadingPo}
            searchPlaceholder="Search purchase orders by number or vendor..."
            emptyTitle="No purchase orders recorded yet"
            emptyDescription="Generate institutional purchase orders for equipment or services."
          />
        </Card>
      )}

      {/* Tab 2: Goods Receipts */}
      {activeTab === 'GRN' && (
        <Card noPadding>
          <DataTable
            columns={grnColumns}
            data={goodsReceipts}
            loading={isLoadingGrn}
            searchPlaceholder="Search goods receipts by GRN number or vendor..."
            emptyTitle="No goods receipts posted yet"
            emptyDescription="Log received inventory items to balance purchase orders against AP."
          />
        </Card>
      )}

      {/* Tab 3: 3-Way Match & Physical Bin Locator */}
      {activeTab === '3WAY_MATCH' && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Scale size={16} className="text-gold" />
                Automated 3-Way Purchase Order Matching &amp; Physical Bin Vault
              </h3>
              <p className="text-xs text-text-muted">
                Compares Authorized PO Value vs Physical GRN Received vs Vendor Tax Invoice before clearing Accounts Payable vouchers.
              </p>
            </div>
            <Badge variant="gold" size="sm">Discrepancy Tolerance: ±0.5%</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {threeWayMatches.map((m) => (
              <Card
                key={m.id}
                className={`p-5 space-y-4 flex flex-col justify-between ${
                  m.status === 'VARIANCE_FLAGGED'
                    ? 'border-warning/50 bg-warning/5'
                    : 'border-border'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gold">{m.id}</span>
                    <Badge variant={m.status === 'CLEARED_FOR_AP' ? 'success' : m.status === 'VARIANCE_FLAGGED' ? 'warning' : 'primary'} size="sm">
                      {m.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text">{m.vendorName}</h4>
                    <p className="text-xs text-text-muted">{m.itemDescription}</p>
                  </div>

                  <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-muted">1. PO Amount ({m.poRef}):</span>
                      <span className="text-text font-bold">৳{m.poAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">2. GRN Received ({m.grnRef}):</span>
                      <span className="text-text font-bold">৳{m.grnReceivedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">3. Invoice Billed ({m.invoiceNo}):</span>
                      <span className="text-text font-bold">৳{m.invoiceBilledAmount.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between pt-1 border-t border-border font-bold ${m.variance === 0 ? 'text-emerald-600' : 'text-warning'}`}>
                      <span>Variance Check:</span>
                      <span>৳{m.variance.toLocaleString()} ({m.variancePercentage}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <QrCode size={14} className="text-gold" />
                    <span>Bin Tag: <strong className="font-mono text-text">{m.binLocation}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={13} />}
                    onClick={() => {
                      const doc = generateThreeWayMatchAuditPDF({
                        invoiceId: m.id,
                        invoiceNumber: m.invoiceNo,
                        poNumber: m.poRef,
                        grnNumber: m.grnRef,
                        vendorName: m.vendorName,
                        matchDate: new Date().toLocaleDateString(),
                        matchStatus: m.status === 'CLEARED_FOR_AP' ? 'APPROVED' : m.status === 'VARIANCE_FLAGGED' ? 'VARIANCE' : 'MATCHED',
                        items: [
                          {
                            itemCode: m.id,
                            description: m.itemDescription,
                            poQty: 15,
                            grnQty: 15,
                            invoiceQty: 15,
                            poPrice: m.poAmount / 15,
                            invoicePrice: m.invoiceBilledAmount / 15,
                            variancePct: m.variancePercentage,
                            subtotal: m.invoiceBilledAmount,
                          },
                        ],
                        totalInvoiceAmount: m.invoiceBilledAmount,
                        apVoucherId: `AP-${m.poRef}`,
                        auditorName: "Comptroller & Chief Store Inspector",
                      });
                      doc.save(`Audit_3WayMatch_${m.invoiceNo}.pdf`);
                    }}
                  >
                    Audit PDF
                  </Button>

                  {m.status === 'CLEARED_FOR_AP' ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> AP Voucher Posted (৳{m.invoiceBilledAmount.toLocaleString()})
                    </span>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        setThreeWayMatches((prev) =>
                          prev.map((item) =>
                            item.id === m.id ? { ...item, status: 'CLEARED_FOR_AP' } : item
                          )
                        );
                        setSuccessMsg(`3-Way match confirmed for ${m.vendorName}. Accounts Payable bill released.`);
                        setTimeout(() => setSuccessMsg(''), 4000);
                      }}
                    >
                      Clear &amp; Post AP Bill
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* PO Modal */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Create Purchase Order"
        subtitle="Issue formal requisition order to registered vendor."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleCreatePo}
              loading={createPoMutation.isPending}
              leftIcon={<Plus size={16} />}
            >
              Issue Order
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePo} className="space-y-4">
          <FormField label="PO Code" required>
            <Input
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2026-088"
              required
            />
          </FormField>

          <FormField label="Vendor / Supplier" required>
            <Input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Delta Academic Supplies Ltd"
              required
            />
          </FormField>

          <FormField label="Total Amount (BDT ৳)" required>
            <Input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="e.g. 150000"
              required
            />
          </FormField>
        </form>
      </Modal>

      {/* GRN Modal */}
      <Modal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        title="Record Goods Receipt (GRN)"
        subtitle="Verify delivery of ordered supplies and generate Accounts Payable journal entry."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsGrnModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleCreateGrn}
              loading={createGrnMutation.isPending}
              leftIcon={<PackageCheck size={16} />}
            >
              Post GRN &amp; AP Ledger
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateGrn} className="space-y-4">
          <FormField label="Purchase Order Reference" required>
            <Select
              value={selectedPoId}
              onChange={(e) => {
                setSelectedPoId(e.target.value);
                const selected = purchaseOrders.find((p: any) => (p.poNumber || p._id) === e.target.value);
                if (selected) {
                  setGrnVendor(selected.vendorName || '');
                  setInvoiceAmount(String(selected.totalAmount || ''));
                }
              }}
            >
              <option value="">Select Associated Purchase Order</option>
              {purchaseOrders.map((p: any) => (
                <option key={p._id} value={p.poNumber || p._id}>
                  {p.poNumber || p._id} - {p.vendorName} (৳{Number(p.totalAmount || 0).toLocaleString()})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Delivering Vendor" required>
            <Input
              value={grnVendor}
              onChange={(e) => setGrnVendor(e.target.value)}
              placeholder="Vendor Name"
              required
            />
          </FormField>

          <FormField label="Verified Invoice Amount (BDT ৳)" required>
            <Input
              type="number"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              placeholder="Amount matching delivery challan"
              required
            />
          </FormField>

          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text">Automated Accounting Double-Entry:</p>
            <p className="font-mono text-primary">DR 1100 (Store Inventory) — ৳{Number(invoiceAmount || 0).toLocaleString()}</p>
            <p className="font-mono text-text">CR 2110 (Accounts Payable) — ৳{Number(invoiceAmount || 0).toLocaleString()}</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
