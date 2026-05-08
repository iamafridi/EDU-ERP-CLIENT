import { request } from './client';

export const academicApi = {
  // Students
  getStudents: () => request<any[]>({ method: 'GET', url: '/students' }, []),
  getStudentById: (id: string) => request({ method: 'GET', url: `/students/${id}` }),
  createStudent: (payload: any) => request({ method: 'POST', url: '/users/create-student', data: payload }),
  updateStudent: (id: string, payload: any) => request({ method: 'PATCH', url: `/students/${id}`, data: payload }),
  deleteStudent: (id: string) => request({ method: 'DELETE', url: `/students/${id}` }),

  // Faculties & Departments
  getFaculties: () => request<any[]>({ method: 'GET', url: '/faculties' }, []),
  createFaculty: (payload: any) => request({ method: 'POST', url: '/users/create-faculty', data: payload }),
  updateFaculty: (id: string, payload: any) => request({ method: 'PATCH', url: `/faculties/${id}`, data: payload }),
  deleteFaculty: (id: string) => request({ method: 'DELETE', url: `/faculties/${id}` }),
  getDepartments: () => request<any[]>({ method: 'GET', url: '/academic-departments' }, []),
  createDepartment: (payload: any) => request({ method: 'POST', url: '/academic-departments/create-academic-department', data: payload }),

  // Courses & Semesters
  getCourses: () => request<any[]>({ method: 'GET', url: '/courses' }, []),
  createCourse: (payload: any) => request({ method: 'POST', url: '/courses/create-course', data: payload }),
  getAcademicSemesters: () => request<any[]>({ method: 'GET', url: '/academic-semesters' }, []),
  createAcademicSemester: (payload: any) => request({ method: 'POST', url: '/academic-semesters', data: payload }),
  getSemesterRegistrations: () => request<any[]>({ method: 'GET', url: '/semester-registrations' }, []),

  // Timetabling & Attendance
  getTimetables: () => request<any[]>({ method: 'GET', url: '/timetables' }, []),
  getTimetableGrid: (id: string) => request({ method: 'GET', url: `/timetables/${id}/grid` }),
  getSchedules: () => request<any[]>({ method: 'GET', url: '/schedules' }, []),
  getAttendance: () => request<any[]>({ method: 'GET', url: '/attendance' }, []),

  // Exams, Invigilation Roster & Duty Swaps
  getExams: () => request<any[]>({ method: 'GET', url: '/exams' }, []),
  getInvigilationDuties: (params?: any) => request<any[]>({ method: 'GET', url: '/exams/invigilation-duties', params }, []),
  getMyInvigilationDuties: () => request<any[]>({ method: 'GET', url: '/exams/invigilation-duties/my-duties' }, []),
  createInvigilationDuty: (payload: any) => request({ method: 'POST', url: '/exams/invigilation-duties', data: payload }),
  createDutySwap: (payload: any) => request({ method: 'POST', url: '/exams/duty-swaps', data: payload }),
  getMyDutySwaps: () => request<{ sent: any[]; received: any[] }>({ method: 'GET', url: '/exams/duty-swaps/my-swaps' }, { sent: [], received: [] }),
  getAllDutySwaps: (status?: string) => request<any[]>({ method: 'GET', url: '/exams/duty-swaps', params: { status } }, []),
  respondToDutySwap: (id: string, payload: { decision: 'ACCEPT' | 'REJECT'; note?: string }) =>
    request({ method: 'PATCH', url: `/exams/duty-swaps/${id}/respond`, data: payload }),
  decideDutySwapHod: (id: string, payload: { decision: 'APPROVE' | 'REJECT'; note?: string }) =>
    request({ method: 'PATCH', url: `/exams/duty-swaps/${id}/decide-hod`, data: payload }),

  // Medical / Make-Up Exams
  createMakeUpExam: (payload: any) => request({ method: 'POST', url: '/exams/makeup-requests', data: payload }),
  getMyMakeUpExams: () => request<any[]>({ method: 'GET', url: '/exams/makeup-requests/my-requests' }, []),
  getMakeUpExams: (params?: any) => request<any[]>({ method: 'GET', url: '/exams/makeup-requests', params }, []),
  verifyHealthCenterMakeUp: (id: string, payload: { verified: boolean; doctorNote: string }) =>
    request({ method: 'PATCH', url: `/exams/makeup-requests/${id}/health-verify`, data: payload }),
  deanDecisionMakeUp: (id: string, payload: { approved: boolean; note?: string }) =>
    request({ method: 'PATCH', url: `/exams/makeup-requests/${id}/dean-approve`, data: payload }),
  scheduleMakeUpSlot: (id: string, payload: { scheduledDate: string; scheduledStartTime: string; scheduledEndTime: string; scheduledRoom: string; scheduledInvigilator?: string }) =>
    request({ method: 'PATCH', url: `/exams/makeup-requests/${id}/schedule`, data: payload }),

  getGrades: () => request<any[]>({ method: 'GET', url: '/grades' }, []),
  getTranscripts: () => request<any[]>({ method: 'GET', url: '/transcripts' }, [
    { id: 'TRN-2026-001', studentId: 'STU-2026001', studentName: 'Marcus Chen', cgpa: 3.88, issueDate: '2026-08-30', status: 'verified' },
    { id: 'TRN-2026-002', studentId: 'STU-2026002', studentName: 'Sophia Martinez', cgpa: 3.94, issueDate: '2026-09-02', status: 'verified' },
    { id: 'TRN-2026-003', studentId: 'STU-2026003', studentName: 'Ethan Gallagher', cgpa: 3.65, issueDate: '2026-09-14', status: 'pending' },
    { id: 'TRN-2026-004', studentId: 'STU-2026004', studentName: 'Aria Takahashi', cgpa: 3.82, issueDate: '2026-09-19', status: 'verified' },
  ]),
  generateTranscript: (payload: any) => request({ method: 'POST', url: '/transcripts/generate', data: payload }),

  // LMS Classroom++
  getLMSAssignments: (courseId?: string) => 
    request<any[]>({ method: 'GET', url: courseId ? `/lms/courses/${courseId}/assignments` : '/lms/courses/default/assignments' }, []),
  submitLMSAssignment: (payload: any) => request({ method: 'POST', url: '/lms/assignments/submit', data: payload }),
  getLMSDiscussions: (courseId?: string) => 
    request<any[]>({ method: 'GET', url: courseId ? `/lms/courses/${courseId}/discussions` : '/lms/courses/default/discussions' }, []),
  createLMSDiscussion: (payload: any) => request({ method: 'POST', url: '/lms/discussions', data: payload }),

  // Digital Locker & Official Document Requisitions
  getDigitalLockerDocuments: (studentId?: string) => 
    request<any[]>({ method: 'GET', url: studentId ? `/digital-locker/student/${studentId}` : '/digital-locker' }, [
      { _id: "DOC-2026-001", title: "Official Higher Secondary Certificate", documentType: "CERTIFICATE", status: "VERIFIED", createdAt: "2026-08-15T10:00:00Z" },
      { _id: "DOC-2026-002", title: "National Identity Smart Card / Passport", documentType: "ID_CARD", status: "VERIFIED", createdAt: "2026-08-18T14:30:00Z" },
      { _id: "DOC-2026-003", title: "Undergraduate Academic Transcript Semester 1-4", documentType: "TRANSCRIPT", status: "PENDING", createdAt: "2026-09-10T09:15:00Z" },
    ]),
  uploadDigitalLockerDocument: (payload: any) => request({ method: 'POST', url: '/digital-locker/upload', data: payload }),
  verifyDigitalLockerDocument: (id: string, payload: any) => request({ method: 'PATCH', url: `/digital-locker/${id}/verify`, data: payload }),
  createDocumentRequisition: (payload: any) => request({ method: 'POST', url: '/digital-locker/requisitions', data: payload }),
  getMyDocumentRequisitions: () => request<any[]>({ method: 'GET', url: '/digital-locker/requisitions/my-requisitions' }, []),
  getAllDocumentRequisitions: (params?: any) => request<any[]>({ method: 'GET', url: '/digital-locker/requisitions', params }, []),
  updateDocumentClearance: (id: string, payload: any) => request({ method: 'PATCH', url: `/digital-locker/requisitions/${id}/clearance`, data: payload }),
  signAndIssueDocument: (id: string, payload: any) => request({ method: 'PATCH', url: `/digital-locker/requisitions/${id}/sign-issue`, data: payload }),
  verifyDocumentByQrToken: (token: string) => request({ method: 'GET', url: `/digital-locker/verify/${token}` }),

  // High-Volume Course Advising Engine
  getAdvisingCourses: (params?: any) => request<any[]>({ method: 'GET', url: '/advising/courses', params }, [
    {
      id: "CRS-MED-101",
      code: "ANAT-101",
      title: "Gross Human Anatomy & Embryology",
      department: "Anatomy",
      credits: 4,
      tuitionPerCredit: 6500,
      hasLab: true,
      labFee: 3000,
      sections: [
        {
          id: "SEC-01",
          sectionName: "Section A",
          instructor: "Prof. Clara Oswald",
          room: "LH-101 (Main Building)",
          schedule: "Sun / Tue 09:00 - 10:30",
          examRoutine: "2026-11-15 09:00 - 12:00",
          totalSeats: 45,
          enrolledCount: 38,
          availableSeats: 7,
          status: "AVAILABLE",
        },
        {
          id: "SEC-02",
          sectionName: "Section B",
          instructor: "Dr. Alistair Who",
          room: "LH-102 (West Annex)",
          schedule: "Mon / Wed 11:00 - 12:30",
          examRoutine: "2026-11-15 09:00 - 12:00",
          totalSeats: 45,
          enrolledCount: 45,
          availableSeats: 0,
          status: "FULL",
        },
      ],
    },
    {
      id: "CRS-MED-102",
      code: "PHYS-102",
      title: "Cellular & Systems Physiology",
      department: "Physiology",
      credits: 3,
      tuitionPerCredit: 6500,
      hasLab: true,
      labFee: 3000,
      sections: [
        {
          id: "SEC-01",
          sectionName: "Section A",
          instructor: "Dr. James Sterling",
          room: "Auditorium 2",
          schedule: "Sun / Tue 11:00 - 12:30",
          examRoutine: "2026-11-18 10:00 - 13:00",
          totalSeats: 50,
          enrolledCount: 42,
          availableSeats: 8,
          status: "AVAILABLE",
        },
        {
          id: "SEC-02",
          sectionName: "Section B",
          instructor: "Dr. Sarah Jenkins",
          room: "LH-104",
          schedule: "Mon / Wed 09:00 - 10:30",
          examRoutine: "2026-11-18 10:00 - 13:00",
          totalSeats: 50,
          enrolledCount: 35,
          availableSeats: 15,
          status: "AVAILABLE",
        },
      ],
    },
    {
      id: "CRS-MED-103",
      code: "BIOC-103",
      title: "Clinical Biochemistry & Metabolic Pathways",
      department: "Biochemistry",
      credits: 3,
      tuitionPerCredit: 6500,
      hasLab: false,
      labFee: 0,
      sections: [
        {
          id: "SEC-01",
          sectionName: "Section A",
          instructor: "Prof. Sarah Connor",
          room: "Science Complex 301",
          schedule: "Mon / Wed 13:30 - 15:00",
          examRoutine: "2026-11-21 09:00 - 12:00",
          totalSeats: 40,
          enrolledCount: 29,
          availableSeats: 11,
          status: "AVAILABLE",
        },
      ],
    },
    {
      id: "CRS-MED-104",
      code: "COMM-104",
      title: "Community Medicine & Epidemiology",
      department: "Community Medicine",
      credits: 3,
      tuitionPerCredit: 6500,
      hasLab: false,
      labFee: 0,
      sections: [
        {
          id: "SEC-01",
          sectionName: "Section A",
          instructor: "Dr. Robert Vance",
          room: "LH-201",
          schedule: "Sun / Tue 14:00 - 15:30",
          examRoutine: "2026-11-24 14:00 - 17:00",
          totalSeats: 60,
          enrolledCount: 52,
          availableSeats: 8,
          status: "AVAILABLE",
        },
      ],
    },
    {
      id: "CRS-MED-105",
      code: "PHAR-105",
      title: "Pharmacokinetics & Chemotherapy",
      department: "Pharmacology",
      credits: 4,
      tuitionPerCredit: 6500,
      hasLab: true,
      labFee: 3000,
      sections: [
        {
          id: "SEC-01",
          sectionName: "Section A",
          instructor: "Dr. Emily Blunt",
          room: "Pharmacy Wing 202",
          schedule: "Mon / Wed 15:30 - 17:00",
          examRoutine: "2026-11-27 09:00 - 12:00",
          totalSeats: 35,
          enrolledCount: 20,
          availableSeats: 15,
          status: "AVAILABLE",
        },
      ],
    },
  ]),
  getStudentAdvisingRecord: (studentId: string) => request<any>({ method: 'GET', url: `/advising/student/${studentId}` }, {
    studentId,
    studentName: "Marcus Chen",
    rollNumber: "STU-2026001",
    department: "Bachelor of Medicine & Surgery (MBBS)",
    semester: "Fall 2026",
    cgpa: 3.88,
    creditsCompleted: 45,
    maxCreditLimit: 18,
    minCreditLimit: 9,
    status: "PROVISIONALLY_ADVISED",
    scholarshipWaiverPct: 20,
    advisedCourses: [
      { courseId: "CRS-MED-101", code: "ANAT-101", title: "Gross Human Anatomy & Embryology", credits: 4, sectionId: "SEC-01", sectionName: "Section A", instructor: "Prof. Clara Oswald", schedule: "Sun / Tue 09:00 - 10:30", examRoutine: "2026-11-15 09:00 - 12:00", tuition: 26000, labFee: 3000, isDropAllowed: true, isWithdrawAllowed: false },
      { courseId: "CRS-MED-102", code: "PHYS-102", title: "Cellular & Systems Physiology", credits: 3, sectionId: "SEC-01", sectionName: "Section A", instructor: "Dr. James Sterling", schedule: "Sun / Tue 11:00 - 12:30", examRoutine: "2026-11-18 10:00 - 13:00", tuition: 19500, labFee: 3000, isDropAllowed: true, isWithdrawAllowed: false },
      { courseId: "CRS-MED-103", code: "BIOC-103", title: "Clinical Biochemistry & Metabolic Pathways", credits: 3, sectionId: "SEC-01", sectionName: "Section A", instructor: "Prof. Sarah Connor", schedule: "Mon / Wed 13:30 - 15:00", examRoutine: "2026-11-21 09:00 - 12:00", tuition: 19500, labFee: 0, isDropAllowed: true, isWithdrawAllowed: false },
    ],
    financialSummary: {
      totalCredits: 10,
      grossTuition: 65000,
      waiverPercentage: 20,
      netTuition: 52000,
      advisingFee: 2500,
      labFee: 6000,
      developmentFee: 2000,
      medicalCoverageFee: 1000,
      lateAdvisingPenalty: 1000,
      lateTuitionPenalty: 0,
      grandTotal: 64500,
      paidAmount: 0,
      dueAmount: 64500,
      settlementStatus: "UNSETTLED",
    },
  }),
  submitProvisionalAdvising: (payload: any) => request({ method: 'POST', url: '/advising/provisional-submit', data: payload }),
  settleAdvisingPayment: (payload: any) => request({ method: 'POST', url: '/advising/settle', data: payload }),
  dropAdvisedCourse: (payload: any) => request({ method: 'POST', url: '/advising/drop-course', data: payload }),
  withdrawAdvisedCourse: (payload: any) => request({ method: 'POST', url: '/advising/withdraw-course', data: payload }),
  swapCourseSection: (payload: any) => request({ method: 'POST', url: '/advising/swap-section', data: payload }),
  reassignSectionInstructor: (payload: any) => request({ method: 'POST', url: '/advising/reassign-instructor', data: payload }),
  splitSection: (payload: any) => request({ method: 'POST', url: '/advising/split-section', data: payload }),
  getAdvisingWindows: () => request<any>({ method: 'GET', url: '/advising/windows' }, {
    semester: "Fall 2026",
    regularAdvisingStart: "2026-09-01T08:00:00Z",
    regularAdvisingEnd: "2026-09-15T23:59:59Z",
    dropDeadline100Refund: "2026-09-22T23:59:59Z",
    lateDropDeadline50Refund: "2026-09-30T23:59:59Z",
    withdrawalDeadlineWGrade: "2026-10-31T23:59:59Z",
    tuitionSettlementDeadline: "2026-10-05T23:59:59Z",
    lateAdvisingFineDefault: 1000,
    lateTuitionFineDefault: 10000,
  }),
  getAdvisingNotifications: (studentId?: string) => request<any[]>({ method: 'GET', url: `/advising/notifications/${studentId || 'all'}` }, [
    {
      id: "NOTIF-01",
      timestamp: "2026-09-28T09:00:00Z",
      type: "PUSH_ALERT",
      channel: "SMS & Mobile App",
      title: "Advising Seat Hold Initiated",
      message: "ANAT-101 Section A held in cache. 10-minute hold active. Complete Step 1 provisional lock.",
      status: "DELIVERED",
    },
    {
      id: "NOTIF-02",
      timestamp: "2026-09-29T14:30:00Z",
      type: "FINANCE_WARNING",
      channel: "Email & Student Portal",
      title: "Late Advising Penalty Assessed",
      message: "Advising submitted past regular window. Dynamic late fine of ৳1,000 appended to demand note.",
      status: "DELIVERED",
    },
    {
      id: "NOTIF-03",
      timestamp: "2026-09-30T16:15:00Z",
      type: "SETTLEMENT_CLEARANCE",
      channel: "SMS & Portal Banner",
      title: "Double-Entry Fiscal Clearance Posted",
      message: "Tuition settlement of ৳64,500 verified. Official Enrollment Challan generated.",
      status: "DELIVERED",
    },
  ]),

  // Advanced Concurrency Scenarios (Waitlist, Prerequisite Chains, Queue Throttler)
  joinSectionWaitlist: (payload: any) => request({ method: 'POST', url: '/advising/waitlist/join', data: payload }),
  leaveSectionWaitlist: (payload: any) => request({ method: 'POST', url: '/advising/waitlist/leave', data: payload }),
  getPrerequisitesAudit: (studentId: string) => request<any>({ method: 'GET', url: `/advising/prerequisites/${studentId}` }, {
    studentId,
    clearedCourses: [
      { code: "BIO-100", title: "General Biology & Genetics", grade: "A", points: 4.0 },
      { code: "CHEM-100", title: "Foundations of Organic Chemistry", grade: "B+", points: 3.3 },
      { code: "ENG-101", title: "Medical Academic Writing", grade: "A-", points: 3.7 },
    ],
    pendingPrerequisites: [],
    retakeEligibleCourses: [
      { code: "CHEM-100", title: "Foundations of Organic Chemistry", currentGrade: "B+", targetGrade: "A", cgpaImpact: "+0.12" },
      { code: "COMM-104", title: "Community Medicine & Epidemiology", currentGrade: "C+", targetGrade: "A", cgpaImpact: "+0.28" },
    ],
  }),
  getVirtualQueueStatus: () => request<any>({ method: 'GET', url: '/advising/queue-status' }, {
    isThrottlingActive: false,
    queuePosition: 1,
    estimatedWaitSeconds: 0,
    activeConcurrentAdvisors: 1420,
    maxConcurrentCapacity: 5000,
  }),

  // ──── NEXT-LEVEL ENTERPRISE ADVISING SCENARIOS ────

  // Full Audit Trail: Every state mutation (add, drop, withdraw, swap, waitlist claim, lock, settle) is logged immutably
  getAdvisingAuditTrail: (studentId: string, params?: any) => request<any[]>({ method: 'GET', url: `/advising/audit-trail/${studentId}`, params }, [
    { id: 'AUD-001', timestamp: '2026-09-28T09:00:12Z', actor: 'STU-2026001 (Marcus Chen)', action: 'SECTION_SELECTED', target: 'ANAT-101 Section A', details: 'Seat hold cache initiated. 10-minute TTL started.', ipAddress: '103.26.45.78', sessionId: 'SES-88A201', financialImpact: null },
    { id: 'AUD-002', timestamp: '2026-09-28T09:02:45Z', actor: 'STU-2026001 (Marcus Chen)', action: 'SECTION_SELECTED', target: 'PHYS-102 Section A', details: 'Added to cart. Conflict check passed against existing selections.', ipAddress: '103.26.45.78', sessionId: 'SES-88A201', financialImpact: null },
    { id: 'AUD-003', timestamp: '2026-09-28T09:04:18Z', actor: 'STU-2026001 (Marcus Chen)', action: 'PROVISIONAL_LOCK_SUBMITTED', target: '3 courses / 10 credits', details: 'Step 1 provisional lock executed. Seats decremented from available pool.', ipAddress: '103.26.45.78', sessionId: 'SES-88A201', financialImpact: { grossBill: 65000, netBill: 64500 } },
    { id: 'AUD-004', timestamp: '2026-09-28T09:06:33Z', actor: 'SYSTEM_FINANCE_ENGINE', action: 'LATE_ADVISING_FINE_ASSESSED', target: 'STU-2026001', details: 'Advising submitted after regular window (2026-09-15). Late surcharge ৳1,000 appended.', ipAddress: 'SYSTEM', sessionId: 'SES-INTERNAL', financialImpact: { fineAmount: 1000, fineType: 'LATE_ADVISING' } },
    { id: 'AUD-005', timestamp: '2026-09-29T14:30:00Z', actor: 'STU-2026001 (Marcus Chen)', action: 'TUITION_SETTLEMENT_STEP2', target: 'bKash Campus Gateway', details: 'Step 2 settlement via bKash. GAAP Double-Entry Journal JRN-2026-ADV-001 posted.', ipAddress: '103.26.45.78', sessionId: 'SES-88A202', financialImpact: { amount: 64500, journalId: 'JRN-2026-ADV-001', debitAccount: 'AR-Student STU-2026001', creditAccount: 'Operating Revenue 4100' } },
    { id: 'AUD-006', timestamp: '2026-09-30T11:15:00Z', actor: 'STU-2026001 (Marcus Chen)', action: 'COURSE_DROPPED', target: 'BIOC-103 Section A', details: 'Dropped within 100% refund window. Credit memo CM-2026-090 generated.', ipAddress: '103.26.45.78', sessionId: 'SES-88A203', financialImpact: { refundAmount: 19500, refundPct: 100, creditMemoId: 'CM-2026-090' } },
    { id: 'AUD-007', timestamp: '2026-10-01T08:30:00Z', actor: 'DEAN_OFFICE (Prof. Sarah Connor)', action: 'SECTION_INSTRUCTOR_REASSIGNED', target: 'ANAT-101 Section B', details: 'Instructor changed from Dr. Alistair Who to Dr. Helena Troy per faculty leave.', ipAddress: '10.10.2.15', sessionId: 'SES-ADM-040', financialImpact: null },
    { id: 'AUD-008', timestamp: '2026-10-02T09:00:00Z', actor: 'WAITLIST_ENGINE', action: 'WAITLIST_SEAT_CASCADE', target: 'ANAT-101 Section B → STU-2026008', details: 'STU-2026007 dropped from Section B. FIFO cascade promoted STU-2026008 (Position #1). 60-min claim lease dispatched via SMS.', ipAddress: 'SYSTEM', sessionId: 'SES-INTERNAL', financialImpact: null },
  ]),

  // Tiered Refund Calculation Engine: Dynamically computes refund % based on current date vs deadline windows
  calculateTieredRefund: (payload: { studentId: string; courseId: string; currentDate?: string }) =>
    request<any>({ method: 'POST', url: '/advising/calculate-refund', data: payload }, {
      courseId: payload.courseId,
      courseCode: 'BIOC-103',
      courseTitle: 'Clinical Biochemistry & Metabolic Pathways',
      originalTuition: 19500,
      windows: [
        { label: '100% Refund Window', deadline: '2026-09-22T23:59:59Z', refundPct: 100, status: 'EXPIRED' },
        { label: '50% Refund Window (Late Drop)', deadline: '2026-09-30T23:59:59Z', refundPct: 50, status: 'ACTIVE' },
        { label: 'Withdrawal Window (W Grade / 0% Refund)', deadline: '2026-10-31T23:59:59Z', refundPct: 0, status: 'UPCOMING' },
        { label: 'Post-Withdrawal (No Action Possible)', deadline: null, refundPct: 0, status: 'LOCKED' },
      ],
      currentWindowLabel: '50% Refund Window (Late Drop)',
      currentRefundPct: 50,
      calculatedRefundAmount: 9750,
      administrativeFee: 500,
      netRefundToStudent: 9250,
      refundMethod: 'Credit to Student Ledger Balance',
      journalEntry: { debit: 'Operating Revenue 4100', credit: 'AR-Student STU-2026001', amount: 9250 },
    }),

  // Bulk Dean Advising: Mass-register a batch of students into a specific section (orientation/remedial)
  bulkDeanAdvise: (payload: { sectionId: string; studentIds: string[]; semester: string; overrideMaxCredit?: boolean }) =>
    request({ method: 'POST', url: '/advising/bulk-dean-advise', data: payload }),

  // Financial Reconciliation Bridge: Summarize advising-to-finance cross-module totals for a cohort
  getAdvisingFinancialReconciliation: (semester: string) => request<any>({ method: 'GET', url: `/advising/reconciliation/${semester}` }, {
    semester,
    cohortSize: 1420,
    totalGrossTuitionBilled: 92300000,
    totalScholarshipDeductions: 18460000,
    totalNetTuitionBilled: 73840000,
    totalInstitutionalFees: 8520000,
    totalLateFines: 142000,
    grandTotalBilled: 82502000,
    totalSettled: 71240000,
    totalOutstanding: 11262000,
    settlementRate: 86.3,
    journalEntriesPosted: 1420,
    creditMemosIssued: 38,
    refundsProcessed: 485000,
    reconciliationStatus: 'VARIANCE_WITHIN_TOLERANCE',
    varianceAmount: 12400,
    variancePct: 0.015,
    breakdown: {
      byDepartment: [
        { department: 'Anatomy', students: 180, billed: 11700000, settled: 10200000, outstanding: 1500000 },
        { department: 'Physiology', students: 165, billed: 10725000, settled: 9800000, outstanding: 925000 },
        { department: 'Biochemistry', students: 150, billed: 9750000, settled: 8600000, outstanding: 1150000 },
        { department: 'Community Medicine', students: 210, billed: 13650000, settled: 12100000, outstanding: 1550000 },
        { department: 'Pharmacology', students: 195, billed: 12675000, settled: 11200000, outstanding: 1475000 },
      ],
      byPaymentMethod: [
        { method: 'bKash Campus Gateway', count: 620, amount: 31100000 },
        { method: 'Nagad Direct', count: 380, amount: 19000000 },
        { method: 'City Bank Escrow Deposit', count: 285, amount: 14250000 },
        { method: 'Student Excess Balance', count: 135, amount: 6890000 },
      ],
    },
  }),

  // Concurrent Seat Lock Heartbeat: Real-time status of all active section locks across the system
  getSectionLockStatus: () => request<any[]>({ method: 'GET', url: '/advising/section-locks' }, [
    { sectionId: 'SEC-01', courseCode: 'ANAT-101', sectionName: 'Section A', totalSeats: 45, confirmedEnrolled: 38, provisionallyLocked: 4, cacheHeldExpiring: 2, trueAvailable: 1, lockHolders: [
      { studentId: 'STU-2026012', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T09:15:00Z' },
      { studentId: 'STU-2026019', holdType: 'CACHE_HOLD', expiresAt: '2026-10-01T09:02:30Z' },
      { studentId: 'STU-2026024', holdType: 'CACHE_HOLD', expiresAt: '2026-10-01T09:08:00Z' },
      { studentId: 'STU-2026031', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T10:00:00Z' },
      { studentId: 'STU-2026037', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T09:45:00Z' },
      { studentId: 'STU-2026041', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T09:50:00Z' },
    ]},
    { sectionId: 'SEC-02', courseCode: 'ANAT-101', sectionName: 'Section B', totalSeats: 45, confirmedEnrolled: 45, provisionallyLocked: 0, cacheHeldExpiring: 0, trueAvailable: 0, lockHolders: [] },
    { sectionId: 'SEC-01', courseCode: 'PHYS-102', sectionName: 'Section A', totalSeats: 50, confirmedEnrolled: 42, provisionallyLocked: 3, cacheHeldExpiring: 1, trueAvailable: 4, lockHolders: [
      { studentId: 'STU-2026015', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T09:20:00Z' },
      { studentId: 'STU-2026022', holdType: 'CACHE_HOLD', expiresAt: '2026-10-01T09:05:00Z' },
      { studentId: 'STU-2026028', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T09:30:00Z' },
      { studentId: 'STU-2026033', holdType: 'PROVISIONAL', expiresAt: '2026-10-01T09:55:00Z' },
    ]},
  ]),

  // Faculty Advisor Override: When a student exceeds credit limit or has unmet prereqs, the advisor can force-approve
  submitAdvisorOverride: (payload: { studentId: string; overrideType: 'CREDIT_OVERLOAD' | 'PREREQUISITE_WAIVER' | 'TIME_CONFLICT_EXCEPTION'; courseId: string; justification: string; advisorId: string }) =>
    request({ method: 'POST', url: '/advising/advisor-override', data: payload }),

  // Get Override Requests pending faculty/dean approval
  getPendingOverrideRequests: () => request<any[]>({ method: 'GET', url: '/advising/override-requests' }, [
    { id: 'OVR-001', studentId: 'STU-2026003', studentName: 'Ethan Gallagher', overrideType: 'CREDIT_OVERLOAD', courseCode: 'PHAR-105', courseTitle: 'Pharmacokinetics & Chemotherapy', requestedCredits: 21, maxAllowed: 18, justification: 'Final semester graduation requirement. Dean recommendation attached.', status: 'PENDING_ADVISOR', requestedAt: '2026-09-29T10:00:00Z' },
    { id: 'OVR-002', studentId: 'STU-2026005', studentName: "Liam O'Connor", overrideType: 'PREREQUISITE_WAIVER', courseCode: 'ANAT-101', courseTitle: 'Gross Human Anatomy & Embryology', missingPrereq: 'BIO-100', justification: 'Transfer student with equivalent coursework from foreign university. Transcript attached.', status: 'PENDING_DEAN', requestedAt: '2026-09-30T14:30:00Z' },
    { id: 'OVR-003', studentId: 'STU-2026008', studentName: 'Priya Sharma', overrideType: 'TIME_CONFLICT_EXCEPTION', courseCode: 'COMM-104', courseTitle: 'Community Medicine & Epidemiology', conflictWith: 'BIOC-103', justification: 'Clinical rotation schedule conflict. Student will attend makeup lectures on Thursdays.', status: 'PENDING_ADVISOR', requestedAt: '2026-10-01T08:00:00Z' },
  ]),
  approveOverrideRequest: (id: string, payload: { approvedBy: string; notes: string }) =>
    request({ method: 'POST', url: `/advising/override-requests/${id}/approve`, data: payload }),
  rejectOverrideRequest: (id: string, payload: { rejectedBy: string; reason: string }) =>
    request({ method: 'POST', url: `/advising/override-requests/${id}/reject`, data: payload }),

  // Cross-Enrollment Validation: Check if student is enrolled in conflicting programs/semesters
  validateCrossEnrollment: (studentId: string, courseIds: string[]) =>
    request<any>({ method: 'POST', url: '/advising/cross-enrollment-check', data: { studentId, courseIds } }, {
      isValid: true,
      conflicts: [],
      warnings: [
        { type: 'HEAVY_LOAD', message: 'Student will have 4 back-to-back sessions on Monday. Consider redistributing.' },
        { type: 'EXAM_CLUSTER', message: '3 final exams scheduled within 48-hour window (Nov 15-17). Exam reschedule may be needed.' },
      ],
      creditLoadAnalysis: {
        totalCredits: 17,
        maxAllowed: 18,
        utilizationPct: 94.4,
        recommendation: 'Within limits but near ceiling. Adding more courses requires advisor override.',
      },
    }),

  // Advising Analytics: Semester-level enrollment analytics for registrar dashboard
  getAdvisingAnalytics: (semester: string) => request<any>({ method: 'GET', url: `/advising/analytics/${semester}` }, {
    semester,
    totalStudentsAdvised: 1380,
    totalStudentsPending: 40,
    averageCreditsPerStudent: 15.2,
    mostOversubscribedSections: [
      { courseCode: 'ANAT-101', section: 'Section B', waitlistLength: 12, enrolledCount: 45, capacity: 45 },
      { courseCode: 'PHYS-102', section: 'Section A', waitlistLength: 8, enrolledCount: 50, capacity: 50 },
    ],
    dropRateByWindow: {
      regularDrop100Pct: { count: 85, totalRefunded: 1275000 },
      lateDrop50Pct: { count: 23, totalRefunded: 172500 },
      withdrawalWGrade: { count: 12, totalRefunded: 0 },
    },
    fineCollection: {
      lateAdvisingFines: { count: 142, totalCollected: 142000 },
      lateTuitionFines: { count: 18, totalCollected: 180000 },
    },
    sectionSwapCount: 67,
    instructorReassignments: 4,
    sectionSplits: 2,
    averageAdvisingTimeMinutes: 8.3,
    peakConcurrentUsers: 2840,
    peakTimestamp: '2026-09-14T10:30:00Z',
  }),
};

export const doubleBlindApi = {
  getMarks: (params?: any) => request<any[]>({ method: 'GET', url: '/exams/double-blind/marks', params }, [
    {
      _id: 'db-1',
      examId: 'EXAM-ANAT-2026',
      courseCode: 'ANAT-101',
      courseTitle: 'Gross Human Anatomy & Embryology',
      studentRoll: 'MED-2026-042',
      blindCode: 'BLIND-9942A',
      firstEvaluatorId: 'FAC-001',
      firstEvaluatorName: 'Prof. Clara Oswald',
      firstMarks: 78,
      secondEvaluatorId: 'FAC-002',
      secondEvaluatorName: 'Dr. James Sterling',
      secondMarks: 86,
      discrepancyPercentage: 10.25,
      requiresAdjudication: true,
      status: 'DISCREPANCY_FLAGGED',
      finalMarks: null,
      maxMarks: 100,
      adjudicationNote: 'Requires Chair final review due to >5% variance between evaluators',
    },
    {
      _id: 'db-2',
      examId: 'EXAM-PHYS-2026',
      courseCode: 'PHYS-102',
      courseTitle: 'Cellular Physiology & Biophysics',
      studentRoll: 'MED-2026-015',
      blindCode: 'BLIND-8815B',
      firstEvaluatorId: 'FAC-003',
      firstEvaluatorName: 'Dr. Sarah Jenkins',
      firstMarks: 82,
      secondEvaluatorId: 'FAC-004',
      secondEvaluatorName: 'Dr. Robert Vance',
      secondMarks: 84,
      discrepancyPercentage: 2.43,
      requiresAdjudication: false,
      status: 'RESOLVED',
      finalMarks: 83,
      maxMarks: 100,
    },
    {
      _id: 'db-3',
      examId: 'EXAM-BIOC-2026',
      courseCode: 'BIOC-103',
      courseTitle: 'Clinical Biochemistry',
      studentRoll: 'MED-2026-088',
      blindCode: 'BLIND-7788C',
      firstEvaluatorId: 'FAC-002',
      firstEvaluatorName: 'Dr. James Sterling',
      firstMarks: 91,
      secondEvaluatorId: null,
      secondEvaluatorName: null,
      secondMarks: null,
      discrepancyPercentage: null,
      requiresAdjudication: false,
      status: 'FIRST_EVALUATED',
      finalMarks: null,
      maxMarks: 100,
    }
  ]),
  submitFirstMark: (payload: { examId: string; studentRoll: string; blindCode: string; marks: number; maxMarks?: number; remarks?: string }) =>
    request({ method: 'POST', url: '/exams/double-blind/first-eval', data: payload }),
  submitSecondMark: (id: string, payload: { marks: number; remarks?: string }) =>
    request({ method: 'PATCH', url: `/exams/double-blind/${id}/second-eval`, data: payload }),
  adjudicateChairMark: (id: string, payload: { finalMarks: number; notes: string }) =>
    request({ method: 'PATCH', url: `/exams/double-blind/${id}/chair-adjudicate`, data: payload }),
};

export const facultyWorkloadApi = {
  getStats: () => request<any>({ method: 'GET', url: '/faculties/workload/stats' }, {
    totalFaculty: 84,
    teachingFteAvg: 0.42,
    researchFteAvg: 0.38,
    serviceFteAvg: 0.20,
    totalOverloadPayPending: 485000,
    facultyOverloadedCount: 14,
    complianceRate: 92.8,
  }),
  getWorkloads: (params?: any) => request<any[]>({ method: 'GET', url: '/faculties/workloads', params }, [
    {
      _id: 'fw-1',
      facultyId: 'FAC-001',
      facultyName: 'Prof. Clara Oswald',
      department: 'Anatomy',
      rank: 'Professor',
      semester: 'Fall 2026',
      teachingHours: 16,
      teachingFte: 0.53,
      researchHours: 12,
      researchFte: 0.30,
      serviceHours: 8,
      serviceFte: 0.20,
      totalFte: 1.03,
      baselineFte: 1.0,
      overloadFte: 0.03,
      overloadHonorarium: 12500,
      status: 'APPROVED',
      deanApproval: true,
      lastAudited: '2026-09-30T10:00:00Z',
    },
    {
      _id: 'fw-2',
      facultyId: 'FAC-002',
      facultyName: 'Dr. James Sterling',
      department: 'Physiology',
      rank: 'Associate Professor',
      semester: 'Fall 2026',
      teachingHours: 18,
      teachingFte: 0.60,
      researchHours: 14,
      researchFte: 0.35,
      serviceHours: 6,
      serviceFte: 0.15,
      totalFte: 1.10,
      baselineFte: 1.0,
      overloadFte: 0.10,
      overloadHonorarium: 35000,
      status: 'PENDING_DEAN_APPROVAL',
      deanApproval: false,
      lastAudited: '2026-10-01T14:20:00Z',
    },
    {
      _id: 'fw-3',
      facultyId: 'FAC-003',
      facultyName: 'Dr. Sarah Jenkins',
      department: 'Biochemistry',
      rank: 'Assistant Professor',
      semester: 'Fall 2026',
      teachingHours: 12,
      teachingFte: 0.40,
      researchHours: 16,
      researchFte: 0.40,
      serviceHours: 8,
      serviceFte: 0.20,
      totalFte: 1.00,
      baselineFte: 1.0,
      overloadFte: 0.00,
      overloadHonorarium: 0,
      status: 'STANDARD_COMPLIANT',
      deanApproval: true,
      lastAudited: '2026-09-28T11:00:00Z',
    }
  ]),
  logWorkload: (payload: any) => request({ method: 'POST', url: '/faculties/workloads', data: payload }),
  approveByDean: (id: string, payload: { notes?: string }) =>
    request({ method: 'PATCH', url: `/faculties/workloads/${id}/approve-dean`, data: payload }),
};

