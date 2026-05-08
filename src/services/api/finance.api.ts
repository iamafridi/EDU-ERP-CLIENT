import { request, apiClient } from './client';

export const financeApi = {
  // Fees
  getFees: () => request<any[]>({ method: 'GET', url: '/fees' }, []),
  getFeeById: (id: string) => request({ method: 'GET', url: `/fees/${id}` }),
  generateFee: (payload: any) => request({ method: 'POST', url: '/fees/generate-fee', data: payload }),
  bulkGenerateFees: (payload: any) => request({ method: 'POST', url: '/fees/bulk-generate', data: payload }),
  updateFee: (id: string, payload: any) => request({ method: 'PATCH', url: `/fees/${id}`, data: payload }),
  deleteFee: (id: string) => request({ method: 'DELETE', url: `/fees/${id}` }),

  // Fee Structures
  getFeeStructures: () => request<any[]>({ method: 'GET', url: '/fee-structures' }, []),
  createFeeStructure: (payload: any) => request({ method: 'POST', url: '/fee-structures', data: payload }),

  // Payments & Receipts
  getPayments: () => request<any[]>({ method: 'GET', url: '/payments' }, []),
  createPayment: (payload: any) => request({ method: 'POST', url: '/payments', data: payload }),
  getReceipts: () => request<any[]>({ method: 'GET', url: '/receipts' }, []),
  getReceiptById: (id: string) => request({ method: 'GET', url: `/receipts/${id}` }),

  // Cashier Closeout & Bank Bag (no mock fallback — money flows must hit the real ledger)
  getDrawerSummary: (date?: string) =>
    request<any>({ method: 'GET', url: '/cashier-closeouts/drawer-summary', params: date ? { date } : undefined }),
  getCashierCloseouts: (params?: Record<string, any>) =>
    request<any[]>({ method: 'GET', url: '/cashier-closeouts', params }),
  sealCashierCloseout: (payload: {
    businessDate?: string;
    denominations: { note: number; count: number }[];
    coinsAmount?: number;
    varianceReason?: string;
  }) => request<any>({ method: 'POST', url: '/cashier-closeouts/seal', data: payload }),
  recordCloseoutDeposit: (id: string, payload: { bankName: string; depositSlipNo: string; depositedAmount: number }) =>
    request<any>({ method: 'PATCH', url: `/cashier-closeouts/${id}/deposit`, data: payload }),
  verifyCashierCloseout: (id: string, payload: { decision: 'VERIFIED' | 'REJECTED'; rejectionReason?: string }) =>
    request<any>({ method: 'PATCH', url: `/cashier-closeouts/${id}/verify`, data: payload }),

  // Payroll
  getPayrolls: () => request<any[]>({ method: 'GET', url: '/payrolls' }, []),
  createPayroll: (payload: any) => request({ method: 'POST', url: '/payrolls', data: payload }),
  updatePayroll: (id: string, payload: any) => request({ method: 'PATCH', url: `/payrolls/${id}`, data: payload }),
  deletePayroll: (id: string) => request({ method: 'DELETE', url: `/payrolls/${id}` }),

  // Expenses & Budgets
  getExpenses: () => request<any[]>({ method: 'GET', url: '/expenses' }, [
    { id: 'EXP-01', description: 'Diagnostic Lab Reagent Consumables', category: 'Supplies', amount: 350000, date: '2026-09-18', paidBy: 'Finance Bursar' },
    { id: 'EXP-02', description: 'Campus Fiber Optic Maintenance', category: 'Maintenance', amount: 120000, date: '2026-09-20', paidBy: 'IT Department' },
    { id: 'EXP-03', description: 'Faculty Medical Journal Subscriptions', category: 'Equipment', amount: 280000, date: '2026-09-22', paidBy: 'Library Dean' },
    { id: 'EXP-04', description: 'Hostel Block B Emergency Generator Diesel', category: 'Utilities', amount: 95000, date: '2026-09-25', paidBy: 'Estate Ops' },
  ]),
  createExpense: (payload: any) => request({ method: 'POST', url: '/expenses', data: payload }),
  getBudgets: () => request<any[]>({ method: 'GET', url: '/budgets' }, [
    { id: 'BGT-01', budgetHead: 'Academic Faculty Salaries', category: 'Salary', allocatedAmount: 18000000, spentAmount: 12500000, fiscalYear: '2026-2027', department: 'Academic Affairs', status: 'active' },
    { id: 'BGT-02', budgetHead: 'Digital Pathology Lab Equipment', category: 'Equipment', allocatedAmount: 4500000, spentAmount: 3200000, fiscalYear: '2026-2027', department: 'Pathology', status: 'active' },
    { id: 'BGT-03', budgetHead: 'Campus High-Speed Network Expansion', category: 'Infrastructure', allocatedAmount: 2500000, spentAmount: 1800000, fiscalYear: '2026-2027', department: 'ICT Services', status: 'active' },
    { id: 'BGT-04', budgetHead: 'Institutional Merit Scholarship Pool', category: 'Scholarship', allocatedAmount: 3000000, spentAmount: 2100000, fiscalYear: '2026-2027', department: 'Admissions & Bursar', status: 'active' },
    { id: 'BGT-05', budgetHead: 'Hostel Maintenance & Renovation', category: 'Maintenance', allocatedAmount: 1500000, spentAmount: 950000, fiscalYear: '2026-2027', department: 'Estate Management', status: 'active' },
  ]),
  createBudget: (payload: any) => request({ method: 'POST', url: '/budgets', data: payload }),
  getScholarships: () => request<any[]>({ method: 'GET', url: '/scholarships' }, []),

  // GAAP Double-Entry Core Engine
  getAccounts: () => request<any[]>({ method: 'GET', url: '/accounts' }, [
    { _id: 'ACC-01', accountCode: '1010', accountName: 'Main Operating Cash', accountType: 'ASSET', normalBalance: 'DEBIT', isControlAccount: false },
    { _id: 'ACC-02', accountCode: '1120', accountName: 'Central Bank Treasury', accountType: 'ASSET', normalBalance: 'DEBIT', isControlAccount: false },
    { _id: 'ACC-03', accountCode: '1130', accountName: 'Accounts Receivable - Student Fees', accountType: 'ASSET', normalBalance: 'DEBIT', isControlAccount: true },
    { _id: 'ACC-04', accountCode: '2110', accountName: 'Accounts Payable - Vendors', accountType: 'LIABILITY', normalBalance: 'CREDIT', isControlAccount: true },
    { _id: 'ACC-05', accountCode: '3010', accountName: 'Institutional Capital & Reserve', accountType: 'EQUITY', normalBalance: 'CREDIT', isControlAccount: false },
    { _id: 'ACC-06', accountCode: '4100', accountName: 'Academic Tuition & Course Fees', accountType: 'INCOME', normalBalance: 'CREDIT', isControlAccount: false },
    { _id: 'ACC-07', accountCode: '5100', accountName: 'Faculty & Staff Payroll Expense', accountType: 'EXPENSE', normalBalance: 'DEBIT', isControlAccount: false },
    { _id: 'ACC-08', accountCode: '5200', accountName: 'Campus Maintenance & Operations', accountType: 'EXPENSE', normalBalance: 'DEBIT', isControlAccount: false },
  ]),
  createAccount: (payload: any) => request({ method: 'POST', url: '/accounts', data: payload }),
  getJournals: () => request<any[]>({ method: 'GET', url: '/journals' }, [
    { _id: 'JRN-01', journalNumber: 'JRN-2026-001', voucherDate: '2026-09-01T08:00:00Z', journalType: 'GENERAL', description: 'Student Tuition Semester Fee Realization', status: 'POSTED' },
    { _id: 'JRN-02', journalNumber: 'JRN-2026-002', voucherDate: '2026-09-05T10:30:00Z', journalType: 'AP', description: 'Diagnostic Lab Equipment Vendor Challan', status: 'POSTED' },
    { _id: 'JRN-03', journalNumber: 'JRN-2026-003', voucherDate: '2026-09-15T12:00:00Z', journalType: 'PAYROLL', description: 'Institutional Monthly Faculty & Staff Payroll', status: 'POSTED' },
    { _id: 'JRN-04', journalNumber: 'JRN-2026-004', voucherDate: '2026-09-24T16:15:00Z', journalType: 'ADJUSTMENT', description: 'Prepaid Campus Utility Accrual Reversal', status: 'PENDING' },
  ]),
  createJournal: (payload: any) => request({ method: 'POST', url: '/journals', data: payload }),
  postJournal: (id: string) => request({ method: 'POST', url: `/journals/${id}/post` }),
  reverseJournal: (id: string, reason: string) => request({ method: 'POST', url: `/journals/${id}/reverse`, data: { reason } }),
  
  // Financial Reporting
  getTrialBalance: (params?: any) => request<any[]>({ method: 'GET', url: '/accounting-reports/trial-balance', params }, []),
  getBalanceSheet: (params?: any) => request<any>({ method: 'GET', url: '/accounting-reports/balance-sheet', params }, {}),
  getIncomeStatement: (params?: any) => request<any>({ method: 'GET', url: '/accounting-reports/income-statement', params }, {}),
  getGeneralLedger: (params?: any) => request<any>({ method: 'GET', url: '/accounting-reports/general-ledger', params }, {}),
  getSubledgers: (type: string = 'AR') => request<any[]>({ method: 'GET', url: `/subledgers/balances?type=${encodeURIComponent(type)}` }, []),

  // Procurement & AP (PO -> GRN -> 3-Way Match Vendor Invoice)
  getVendors: () => request<any[]>({ method: 'GET', url: '/procurement/vendors' }, []),
  createVendor: (payload: any) => request({ method: 'POST', url: '/procurement/vendors', data: payload }),
  getPurchaseOrders: () => request<any[]>({ method: 'GET', url: '/procurement/purchase-orders' }, [
    { _id: 'PO-2026-081', poNumber: 'PO-2026-081', vendorName: 'Scientific Instruments BD Ltd', date: '2026-09-12', totalAmount: 450000, status: 'APPROVED' },
    { _id: 'PO-2026-082', poNumber: 'PO-2026-082', vendorName: 'Global Academic Publishers', date: '2026-09-15', totalAmount: 180000, status: 'APPROVED' },
    { _id: 'PO-2026-083', poNumber: 'PO-2026-083', vendorName: 'Campus IT Infrastructure Co.', date: '2026-09-22', totalAmount: 320000, status: 'PENDING' },
  ]),
  createPurchaseOrder: (payload: any) => request({ method: 'POST', url: '/procurement/purchase-orders', data: payload }),
  getGoodsReceipts: () => request<any[]>({ method: 'GET', url: '/procurement/goods-receipts' }, [
    { _id: 'GRN-2026-041', grnNumber: 'GRN-2026-041', poId: 'PO-2026-081', vendorName: 'Scientific Instruments BD Ltd', invoiceAmount: 450000, status: 'POSTED' },
    { _id: 'GRN-2026-042', grnNumber: 'GRN-2026-042', poId: 'PO-2026-082', vendorName: 'Global Academic Publishers', invoiceAmount: 180000, status: 'POSTED' },
  ]),
  createGoodsReceipt: (payload: any) => request({ method: 'POST', url: '/procurement/goods-receipts', data: payload }),
  recordVendorInvoice: (payload: any) => request({ method: 'POST', url: '/procurement/vendor-invoices', data: payload }),
  getVendorInvoices: () => request<any[]>({ method: 'GET', url: '/procurement/vendor-invoices' }, []),
  approveVendorInvoiceAP: (id: string, note?: string) => request({ method: 'PATCH', url: `/procurement/vendor-invoices/${id}/approve-ap`, data: { note } }),

  // Caution Deposit Exit Settlements & Clearance
  getCautionRefunds: (params?: any) => request<any[]>({ method: 'GET', url: '/fees/caution-refunds', params }, []),
  getMyCautionRefunds: () => request<any[]>({ method: 'GET', url: '/fees/caution-refunds/my-settlements' }, []),
  createCautionRefund: (payload: any) => request({ method: 'POST', url: '/fees/caution-refunds', data: payload }),
  updateCautionClearance: (id: string, payload: any) => request({ method: 'PATCH', url: `/fees/caution-refunds/${id}/clearance`, data: payload }),
  approveCautionPayout: (id: string, payload: any) => request({ method: 'PATCH', url: `/fees/caution-refunds/${id}/approve-payout`, data: payload }),

  // ──── DOCTOR REVENUE SPLIT & CLINICAL HONORARIUM ENGINE ────
  getDoctorRevenueSplits: () => request<any[]>({ method: 'GET', url: '/finance/doctor-splits' }, [
    {
      id: 'SPLIT-01',
      doctorId: 'FAC-983',
      doctorName: 'Dr. James Sterling (Professor General Surgery)',
      department: 'General Surgery',
      period: 'September 2026',
      totalConsultations: 142,
      grossOPDFees: 213000,
      grossSurgeries: 8,
      grossSurgicalFees: 320000,
      grossTotal: 533000,
      doctorSharePct: 60,
      hospitalSharePct: 40,
      grossDoctorShare: 319800,
      tdsWithholdingTaxPct: 10,
      tdsWithholdingAmount: 31980,
      hospitalInfrastructureDeduction: 15000,
      netPayableToDoctor: 272820,
      payoutStatus: 'APPROVED_FOR_PAYOUT',
      linkedSubledgerAccount: 'SL-FAC-983-EXP',
      journalEntryPosted: 'JRN-2026-DOC-081',
    },
    {
      id: 'SPLIT-02',
      doctorId: 'FAC-984',
      doctorName: 'Prof. Clara Oswald (HOD Obstetrics & Gynaecology)',
      department: 'Obstetrics & Gynaecology',
      period: 'September 2026',
      totalConsultations: 185,
      grossOPDFees: 277500,
      grossSurgeries: 14,
      grossSurgicalFees: 490000,
      grossTotal: 767500,
      doctorSharePct: 65,
      hospitalSharePct: 35,
      grossDoctorShare: 498875,
      tdsWithholdingTaxPct: 10,
      tdsWithholdingAmount: 49887.5,
      hospitalInfrastructureDeduction: 20000,
      netPayableToDoctor: 428987.5,
      payoutStatus: 'APPROVED_FOR_PAYOUT',
      linkedSubledgerAccount: 'SL-FAC-984-EXP',
      journalEntryPosted: 'JRN-2026-DOC-082',
    },
    {
      id: 'SPLIT-03',
      doctorId: 'FAC-985',
      doctorName: 'Dr. Alistair Who (Associate Professor Cardiology)',
      department: 'Cardiology',
      period: 'September 2026',
      totalConsultations: 160,
      grossOPDFees: 240000,
      grossSurgeries: 5,
      grossSurgicalFees: 225000,
      grossTotal: 465000,
      doctorSharePct: 60,
      hospitalSharePct: 40,
      grossDoctorShare: 279000,
      tdsWithholdingTaxPct: 10,
      tdsWithholdingAmount: 27900,
      hospitalInfrastructureDeduction: 12000,
      netPayableToDoctor: 239100,
      payoutStatus: 'PENDING_AUDIT',
      linkedSubledgerAccount: 'SL-FAC-985-EXP',
      journalEntryPosted: null,
    },
  ]),

  settleDoctorPayout: (payload: { splitId: string; doctorId: string; netAmount: number; paymentMethod: string }) =>
    request({ method: 'POST', url: '/finance/doctor-splits/settle', data: payload }),

  // ──── MULTI-FUND RESEARCH GRANT LEDGER (RESTRICTED FUNDS) ────
  getResearchGrants: () => request<any[]>({ method: 'GET', url: '/finance/research-grants' }, [
    {
      id: 'GRNT-2026-01',
      grantCode: 'WHO-SEARO-VBD-2026',
      grantTitle: 'Vector-Borne Dengue & Chikungunya Genomic Surveillance in Urban Clusters',
      fundingAgency: 'World Health Organization (WHO)',
      principalInvestigator: 'Prof. Clara Oswald',
      department: 'Microbiology & Infectious Diseases',
      fundType: 'RESTRICTED_EXTERNAL',
      sanctionedAmount: 7500000,
      receivedMilestoneAmount: 5000000,
      disbursedExpenditure: 3240000,
      unspentBalance: 1760000,
      overheadAllowancePct: 8,
      indirectOverheadEarned: 259200,
      utilizationRatePct: 64.8,
      auditComplianceStatus: '100% COMPLIANT (GAAP Restricted)',
      validityPeriod: '2026-01-01 to 2027-12-31',
    },
    {
      id: 'GRNT-2026-02',
      grantCode: 'DGHS-MCH-NUTR-09',
      grantTitle: 'Maternal & Neonatal Micronutrient Biomarker Clinical Trial',
      fundingAgency: 'Directorate General of Health Services (DGHS)',
      principalInvestigator: 'Dr. Sarah Jenkins',
      department: 'Paediatrics & Community Medicine',
      fundType: 'RESTRICTED_GOVERNMENT',
      sanctionedAmount: 4800000,
      receivedMilestoneAmount: 4800000,
      disbursedExpenditure: 4120000,
      unspentBalance: 680000,
      overheadAllowancePct: 5,
      indirectOverheadEarned: 206000,
      utilizationRatePct: 85.8,
      auditComplianceStatus: '100% COMPLIANT',
      validityPeriod: '2025-07-01 to 2026-12-31',
    },
    {
      id: 'GRNT-2026-03',
      grantCode: 'ICMR-CARDIO-AI-2026',
      grantTitle: 'AI-Guided 12-Lead ECG Early Infarct Risk Stratification',
      fundingAgency: 'Medical Research Council & Bilateral Trust',
      principalInvestigator: 'Dr. Alistair Who',
      department: 'Cardiology',
      fundType: 'RESTRICTED_ENDOWMENT',
      sanctionedAmount: 12000000,
      receivedMilestoneAmount: 6000000,
      disbursedExpenditure: 2150000,
      unspentBalance: 3850000,
      overheadAllowancePct: 10,
      indirectOverheadEarned: 215000,
      utilizationRatePct: 35.8,
      auditComplianceStatus: '100% COMPLIANT',
      validityPeriod: '2026-06-01 to 2028-05-31',
    },
  ]),

  // ──── AUTOMATED BANK RECONCILIATION ENGINE ────
  getBankReconciliationFeed: () => request<any>({ method: 'GET', url: '/finance/bank-reconciliation/latest' }, {
    bankAccount: 'City Bank Escrow Treasury (Acct # 110-38491029)',
    statementPeriod: '2026-09-01 to 2026-09-30',
    openingBankBalance: 42150000,
    closingBankBalance: 68420000,
    generalLedgerBalance: 68395000,
    varianceDifference: 25000,
    autoMatchConfidencePct: 98.4,
    totalTransactionsIngested: 842,
    matchedCount: 838,
    unmatchedCount: 4,
    unmatchedTransactions: [
      { id: 'TX-BNK-881', date: '2026-09-29', refNo: 'BKASH-GATEWAY-TX9812', description: 'Batch MFS Student Tuition Settlement', bankAmount: 185000, erpAmount: 185000, status: 'TIME_ZONE_TIMING_DIFFERENCE', note: 'Settled in bank at 23:58 UTC, ERP recorded at 00:02 local next day' },
      { id: 'TX-BNK-882', date: '2026-09-30', refNo: 'CHQ-DEPOSIT-00491', description: 'Direct Wire from Ministry of Education', bankAmount: 25000, erpAmount: 0, status: 'UNPOSTED_BANK_CREDIT', note: 'Direct bank credit without voucher. Recommended action: Post to Account 4150' },
      { id: 'TX-BNK-883', date: '2026-09-28', refNo: 'VENDOR-EFT-9912', description: 'Scientific Equipment Wire to Vendor', bankAmount: -450000, erpAmount: -450000, status: 'MATCHED_CLEARED', note: 'Cheque cleared on 2026-09-30' },
    ],
  }),

  executeBankReconciliationMatch: (payload: { transactionId: string; action: 'AUTO_RESOLVE' | 'CREATE_ADJUSTMENT_JOURNAL' | 'FLAG_FRAUD' }) =>
    request({ method: 'POST', url: '/finance/bank-reconciliation/resolve', data: payload }),

  // ──── 5-SEGMENT DIMENSIONAL MULTI-FUND & ENCUMBRANCE BUDGET ENGINE ────
  checkEncumbranceBudget: (payload: any) =>
    request({ method: 'POST', url: '/accounting/reports/encumbrance/check', data: payload }),
  getDimensionalFundBudgets: () =>
    request<any[]>({ method: 'GET', url: '/accounting/reports/dimensional-funds' }, []),
};

