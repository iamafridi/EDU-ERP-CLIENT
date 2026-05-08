/**
 * Centralized TanStack React Query Key Factory
 * Guarantees type safety and consistent cache invalidation across the ERP.
 */

export const queryKeys = {
  // --- FINANCE & GAAP ACCOUNTING ---
  fees: {
    all: ['fees'] as const,
    list: (filters?: Record<string, unknown>) => ['fees', 'list', filters] as const,
    detail: (id: string) => ['fees', 'detail', id] as const,
  },
  feeStructures: {
    all: ['fee-structures'] as const,
  },
  payments: {
    all: ['payments'] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
  },
  receipts: {
    all: ['receipts'] as const,
    detail: (id: string) => ['receipts', 'detail', id] as const,
  },
  payroll: {
    all: ['payroll'] as const,
    detail: (id: string) => ['payroll', 'detail', id] as const,
  },
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string) => ['accounts', 'detail', id] as const,
  },
  journals: {
    all: ['journals'] as const,
    detail: (id: string) => ['journals', 'detail', id] as const,
  },
  accountingReports: {
    trialBalance: ['accounting-reports', 'trial-balance'] as const,
    balanceSheet: ['accounting-reports', 'balance-sheet'] as const,
    incomeStatement: ['accounting-reports', 'income-statement'] as const,
    generalLedger: (code?: string) => ['accounting-reports', 'general-ledger', code] as const,
  },
  procurement: {
    all: ['procurement'] as const,
    orders: ['procurement', 'orders'] as const,
    receipts: ['procurement', 'receipts'] as const,
  },
  expenses: {
    all: ['expenses'] as const,
  },
  budgets: {
    all: ['budgets'] as const,
  },

  // --- ACADEMIC & LMS ---
  students: {
    all: ['students'] as const,
    list: (filters?: Record<string, unknown>) => ['students', 'list', filters] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
  },
  faculties: {
    all: ['faculties'] as const,
    detail: (id: string) => ['faculties', 'detail', id] as const,
  },
  departments: {
    all: ['departments'] as const,
  },
  semesters: {
    all: ['semesters'] as const,
  },
  courses: {
    all: ['courses'] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
  },
  timetables: {
    all: ['timetables'] as const,
    grid: (semesterId?: string) => ['timetables', 'grid', semesterId] as const,
    student: (studentId: string) => ['timetables', 'student', studentId] as const,
  },
  lms: {
    assignments: (courseId?: string) => ['lms', 'assignments', courseId] as const,
    discussions: (courseId?: string) => ['lms', 'discussions', courseId] as const,
    liveSession: (sessionId?: string) => ['lms', 'live-session', sessionId] as const,
    masteryTree: (studentId?: string) => ['lms', 'mastery-tree', studentId] as const,
  },
  exams: {
    all: ['exams'] as const,
  },
  grades: {
    all: ['grades'] as const,
    student: (studentId?: string) => ['grades', 'student', studentId] as const,
  },
  transcripts: {
    all: ['transcripts'] as const,
    student: (studentId?: string) => ['transcripts', 'student', studentId] as const,
  },
  digitalLocker: {
    all: ['digital-locker'] as const,
    student: (studentId?: string) => ['digital-locker', 'student', studentId ?? 'self'] as const,
  },

  // --- CLINICAL OPERATIONS ---
  bloodBank: {
    stock: ['blood-bank', 'stock'] as const,
    donors: ['blood-bank', 'donors'] as const,
  },
  telemedicine: {
    consultations: ['telemedicine', 'consultations'] as const,
    room: (id: string) => ['telemedicine', 'room', id] as const,
  },
  opd: {
    patients: ['opd', 'patients'] as const,
  },
  ipd: {
    admissions: ['ipd', 'admissions'] as const,
  },
  pharmacy: {
    medicines: ['pharmacy', 'medicines'] as const,
  },
  laboratory: {
    tests: ['laboratory', 'tests'] as const,
  },
  clinicalRotations: {
    all: ['clinical-rotations'] as const,
  },

  // --- CAMPUS OPERATIONS & IOT ---
  rooms: {
    all: ['rooms'] as const,
  },
  hostel: {
    all: ['hostel'] as const,
  },
  mess: {
    all: ['mess'] as const,
  },
  iot: {
    devices: ['iot', 'devices'] as const,
    logs: ['iot', 'logs'] as const,
  },
  gateEntries: {
    all: ['gate-entries'] as const,
  },
  visitorLogs: {
    all: ['visitor-logs'] as const,
  },
  maintenance: {
    all: ['maintenance'] as const,
  },

  // --- GOVERNANCE, COMPLIANCE & HR ---
  disciplinary: {
    infractions: ['disciplinary', 'infractions'] as const,
    hearings: ['disciplinary', 'hearings'] as const,
  },
  placement: {
    jobs: ['placement', 'jobs'] as const,
    applications: ['placement', 'applications'] as const,
  },
  feedback: {
    surveys: ['feedback', 'surveys'] as const,
  },
  accreditation: {
    reports: ['accreditation', 'reports'] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
} as const;

export default queryKeys;
