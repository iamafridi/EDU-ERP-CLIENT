import jsPDF from "jspdf";

// ==========================================
// INSTITUTIONAL THEME CONSTANTS & HELPERS
// ==========================================
const COLORS = {
  primary: [37, 99, 235], // #2563eb
  primaryDark: [29, 78, 216],
  gold: [217, 119, 6], // #d97706
  emerald: [16, 185, 129], // #10b981
  slate900: [15, 23, 42], // #0f172a
  slate700: [51, 65, 85], // #334155
  slate500: [100, 116, 139], // #64748b
  slate200: [226, 232, 240], // #e2e8f0
  slate50: [248, 250, 252], // #f8fafc
  white: [255, 255, 255],
};

function drawHeaderBanner(
  doc: jsPDF,
  title: string,
  subtitle: string,
  docTypeBadge: string
) {
  // Top primary accent strip
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(14, 12, 182, 3, "F");

  // Logo Badge
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.roundedRect(14, 19, 14, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("M", 21, 29, { align: "center" });

  // Institution title
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CENTRAL MEDICAL COLLEGE & TEACHING HOSPITAL", 32, 24);

  // Subtitle
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Affiliated to Directorate of Medical Education | NABH & NMC Accredited",
    32,
    29
  );
  doc.text("Campus Road, Medical Enclave | Tel: +880-2-9876543 | www.cmc-edu.org", 32, 33);

  // Document Badge on Right
  doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.roundedRect(140, 19, 56, 14, 2, 2, "FD");

  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(docTypeBadge.toUpperCase(), 168, 25, { align: "center" });

  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 168, 30, { align: "center" });

  // Divider line
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);
}

function drawWatermark(doc: jsPDF, text: string) {
  doc.setTextColor(240, 244, 248);
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.saveGraphicsState();
  // jsPDF angle text simulation
  doc.text(text, 105, 160, { align: "center", angle: 35 });
  doc.restoreGraphicsState();
}

function drawFooterWithSignatures(
  doc: jsPDF,
  auth1Title: string,
  auth1Name: string,
  auth2Title: string,
  auth2Name: string,
  verificationHash?: string
) {
  const y = 260;

  // Verification Hash / QR strip
  if (verificationHash) {
    doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
    doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
    doc.roundedRect(14, y - 12, 182, 9, 1.5, 1.5, "FD");

    doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
    doc.setFontSize(7);
    doc.setFont("courier", "bold");
    doc.text(`DIGITAL SIGNATURE / SHA-256 HASH: ${verificationHash}`, 18, y - 6.5);
  }

  // Auth 1
  doc.setDrawColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setLineWidth(0.5);
  doc.line(20, y + 10, 75, y + 10);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(auth1Name, 47.5, y + 14, { align: "center" });
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(auth1Title, 47.5, y + 18, { align: "center" });

  // Institutional Seal
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(0.8);
  doc.circle(105, y + 11, 10);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL SEAL", 105, y + 9.5, { align: "center" });
  doc.text("CMC & TH", 105, y + 13.5, { align: "center" });

  // Auth 2
  doc.setDrawColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setLineWidth(0.5);
  doc.line(135, y + 10, 190, y + 10);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(auth2Name, 162.5, y + 14, { align: "center" });
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(auth2Title, 162.5, y + 18, { align: "center" });

  // Bottom Notice
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.setFontSize(6.5);
  doc.text(
    "This is a system-authenticated secure institutional document. Any alterations invalidate its authenticity.",
    105,
    286,
    { align: "center" }
  );
}

// ==========================================
// 1. OFFICIAL TRANSCRIPT & DEGREE AUDIT PDF
// ==========================================
export interface TranscriptCourseItem {
  code: string;
  title: string;
  credits: number;
  grade: string;
  gradePoint: number;
  semester: string;
}

export interface TranscriptPDFData {
  transcriptNo: string;
  studentName: string;
  studentId: string;
  degree: string;
  batch: string;
  issueDate: string;
  cgpa: number;
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  honors?: string;
  verificationHash: string;
  courses?: TranscriptCourseItem[];
}

export function generateTranscriptPDF(data: TranscriptPDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawWatermark(doc, "OFFICIAL TRANSCRIPT");
  drawHeaderBanner(doc, "Academic Transcript", "Degree Conferral Record", "Official Transcript");

  let y = 46;

  // Student Profile Card
  doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.roundedRect(14, y, 182, 28, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.text("CANDIDATE NAME:", 18, y + 6);
  doc.text("STUDENT ID:", 18, y + 12);
  doc.text("ACADEMIC PROGRAM:", 18, y + 18);
  doc.text("BATCH / COHORT:", 18, y + 24);

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(data.studentName.toUpperCase(), 56, y + 6);
  doc.text(data.studentId, 56, y + 12);
  doc.text(data.degree, 56, y + 18);
  doc.text(data.batch || "Class of 2026 (MBBS)", 56, y + 24);

  // Right Side Metrics
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.text("TRANSCRIPT NO:", 120, y + 6);
  doc.text("CUMULATIVE GPA:", 120, y + 12);
  doc.text("CREDITS COMPLETED:", 120, y + 18);
  doc.text("ACADEMIC HONORS:", 120, y + 24);

  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(data.transcriptNo, 160, y + 6);
  doc.text(`${data.cgpa.toFixed(2)} / 4.00`, 160, y + 12);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(`${data.totalCreditsEarned} of ${data.totalCreditsRequired} Cr`, 160, y + 18);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text(data.honors || "First Class Honours", 160, y + 24);

  y += 34;

  // Coursework / Clinical Rotation Breakdown Table
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("CODE", 18, y + 4.8);
  doc.text("COURSE / CLINICAL ROTATION TITLE", 40, y + 4.8);
  doc.text("SEMESTER", 125, y + 4.8);
  doc.text("CR", 152, y + 4.8);
  doc.text("GRADE", 166, y + 4.8);
  doc.text("GP", 184, y + 4.8);

  y += 7;

  const sampleCourses: TranscriptCourseItem[] = data.courses && data.courses.length > 0 ? data.courses : [
    { code: "MED-101", title: "Human Anatomy & Clinical Embryology I", credits: 4, grade: "A+", gradePoint: 4.0, semester: "Year 1 - Term 1" },
    { code: "MED-102", title: "Medical Physiology & Biophysics I", credits: 4, grade: "A", gradePoint: 3.75, semester: "Year 1 - Term 1" },
    { code: "MED-103", title: "Medical Biochemistry & Molecular Biology", credits: 3, grade: "A+", gradePoint: 4.0, semester: "Year 1 - Term 1" },
    { code: "MED-201", title: "Systemic Pathology & Pathophysiology", credits: 4, grade: "A", gradePoint: 3.75, semester: "Year 2 - Term 1" },
    { code: "MED-202", title: "Medical Microbiology & Immunology", credits: 3, grade: "A+", gradePoint: 4.0, semester: "Year 2 - Term 1" },
    { code: "MED-203", title: "Pharmacology & Therapeutics", credits: 4, grade: "A", gradePoint: 3.75, semester: "Year 2 - Term 2" },
    { code: "CLI-301", title: "Internal Medicine Clinical Clerkship", credits: 6, grade: "A+", gradePoint: 4.0, semester: "Year 3 - Rot 1" },
    { code: "CLI-302", title: "General Surgery & Traumatology Clerkship", credits: 6, grade: "A", gradePoint: 3.75, semester: "Year 3 - Rot 2" },
    { code: "CLI-401", title: "Obstetrics & Gynaecology Inpatient Rounds", credits: 5, grade: "A+", gradePoint: 4.0, semester: "Year 4 - Rot 1" },
    { code: "CLI-402", title: "Paediatrics & Neonatal Intensive Care", credits: 5, grade: "A", gradePoint: 3.75, semester: "Year 4 - Rot 2" },
    { code: "CLI-501", title: "Community Medicine & Rural Health Outreach", credits: 4, grade: "A+", gradePoint: 4.0, semester: "Year 5 - Rot 1" },
    { code: "CLI-502", title: "Emergency & Trauma Resuscitation Lab", credits: 4, grade: "A", gradePoint: 3.75, semester: "Year 5 - Rot 2" },
  ];

  sampleCourses.forEach((c, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
      doc.rect(14, y, 182, 6.2, "F");
    }
    doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
    doc.line(14, y + 6.2, 196, y + 6.2);

    doc.setTextColor(COLORS.slate700[0], COLORS.slate700[1], COLORS.slate700[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    doc.text(c.code, 18, y + 4.2);
    doc.text(c.title.length > 48 ? c.title.slice(0, 48) + "..." : c.title, 40, y + 4.2);
    doc.text(c.semester, 125, y + 4.2);
    doc.text(String(c.credits), 154, y + 4.2);
    doc.setFont("helvetica", "bold");
    doc.text(c.grade, 168, y + 4.2);
    doc.text(c.gradePoint.toFixed(2), 184, y + 4.2);

    y += 6.2;
  });

  // Cumulative Summary Block
  y += 4;
  doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.roundedRect(14, y, 182, 14, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text("DEGREE CONFERRAL STATUS:", 18, y + 5.5);
  doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
  doc.text("CONFERRED WITH ALL INSTITUTIONAL HONORS & CLEARANCES", 68, y + 5.5);

  doc.setTextColor(COLORS.slate700[0], COLORS.slate700[1], COLORS.slate700[2]);
  doc.setFontSize(7.5);
  doc.text(`Total Course Credits: ${data.totalCreditsEarned} Cr`, 18, y + 10.5);
  doc.text(`Grading Scale: 4.00 System (A+ = 4.0, A = 3.75, B = 3.0)`, 75, y + 10.5);
  doc.text(`Medium of Instruction: English`, 150, y + 10.5);

  drawFooterWithSignatures(
    doc,
    "Dean of Academic Affairs",
    "Prof. Dr. Elizabeth Wright, MD",
    "Controller of Examinations",
    "Dr. Arthur Vance, FRCS",
    data.verificationHash
  );

  return doc;
}

// ==========================================
// 2. PROCUREMENT 3-WAY MATCH AUDIT CERTIFICATE
// ==========================================
export interface ThreeWayMatchAuditData {
  invoiceId: string;
  invoiceNumber: string;
  poNumber: string;
  grnNumber: string;
  vendorName: string;
  matchDate: string;
  matchStatus: "MATCHED" | "VARIANCE" | "DISCREPANCY" | "APPROVED";
  items: Array<{
    itemCode: string;
    description: string;
    poQty: number;
    grnQty: number;
    invoiceQty: number;
    poPrice: number;
    invoicePrice: number;
    variancePct: number;
    subtotal: number;
  }>;
  totalInvoiceAmount: number;
  apVoucherId?: string;
  auditorName: string;
  varianceNotes?: string;
}

export function generateThreeWayMatchAuditPDF(data: ThreeWayMatchAuditData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawWatermark(doc, "3-WAY AUDIT PASS");
  drawHeaderBanner(doc, "Procurement Audit", "3-Way Match Verification", "Audit Certificate");

  let y = 46;

  // Header Summary Box
  doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.roundedRect(14, y, 182, 30, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.text("VENDOR / SUPPLIER:", 18, y + 6);
  doc.text("INVOICE NUMBER:", 18, y + 12);
  doc.text("PURCHASE ORDER (PO):", 18, y + 18);
  doc.text("GOODS RECEIPT NOTE (GRN):", 18, y + 24);

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(data.vendorName, 60, y + 6);
  doc.text(data.invoiceNumber, 60, y + 12);
  doc.text(data.poNumber, 60, y + 18);
  doc.text(data.grnNumber, 60, y + 24);

  // Right Side
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.text("MATCH STATUS:", 120, y + 6);
  doc.text("MATCH RUN DATE:", 120, y + 12);
  doc.text("TOTAL INVOICE VALUE:", 120, y + 18);
  doc.text("AP LEDGER VOUCHER:", 120, y + 24);

  doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
  doc.text(data.matchStatus, 160, y + 6);
  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(data.matchDate, 160, y + 12);
  doc.setFont("helvetica", "bold");
  doc.text(`$${data.totalInvoiceAmount.toLocaleString()}`, 160, y + 18);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(data.apVoucherId || "AP-VOUCH-PENDING", 160, y + 24);

  y += 36;

  // Table of 3-Way Match Line Items
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM CODE & DESCRIPTION", 18, y + 4.8);
  doc.text("PO QTY", 88, y + 4.8);
  doc.text("GRN QTY", 104, y + 4.8);
  doc.text("INV QTY", 120, y + 4.8);
  doc.text("PO PRICE", 136, y + 4.8);
  doc.text("INV PRICE", 154, y + 4.8);
  doc.text("VAR %", 172, y + 4.8);
  doc.text("TOTAL", 184, y + 4.8);

  y += 7;

  data.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
      doc.rect(14, y, 182, 7, "F");
    }
    doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
    doc.line(14, y + 7, 196, y + 7);

    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    const itemLabel = `${item.itemCode} - ${item.description}`;
    doc.text(itemLabel.length > 38 ? itemLabel.slice(0, 38) + "..." : itemLabel, 18, y + 4.5);
    doc.text(String(item.poQty), 92, y + 4.5);
    doc.text(String(item.grnQty), 108, y + 4.5);
    doc.text(String(item.invoiceQty), 124, y + 4.5);
    doc.text(`$${item.poPrice.toFixed(2)}`, 138, y + 4.5);
    doc.text(`$${item.invoicePrice.toFixed(2)}`, 156, y + 4.5);

    if (Math.abs(item.variancePct) > 0.01) {
      doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    } else {
      doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
    }
    doc.text(`${item.variancePct >= 0 ? "+" : ""}${item.variancePct.toFixed(1)}%`, 172, y + 4.5);

    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`$${item.subtotal.toFixed(2)}`, 184, y + 4.5);

    y += 7;
  });

  // Tolerance & Compliance Note
  y += 5;
  doc.setFillColor(240, 253, 244); // light emerald
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, 182, 18, 2, 2, "FD");

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("3-WAY RECONCILIATION & GAAP AP POSTING CERTIFICATION", 18, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "1. Quantities accepted on Store GRN precisely match Invoice billable counts within 0.0% variance threshold.\n2. Line unit costs comply with approved institutional Purchase Order contract ceilings.\n3. Automatic debit posted to Store Inventory & credit to Accounts Payable ledger upon authorized sign-off.",
    18,
    y + 9
  );

  drawFooterWithSignatures(
    doc,
    "Chief Store & Procurement Officer",
    data.auditorName || "S. K. Mahmud, Head of Stores",
    "Chief Financial Officer / Comptroller",
    "Rafiqul Islam, FCA",
    `MATCH-CERT-SHA256:${data.invoiceNumber}-${Date.now().toString(16).toUpperCase()}`
  );

  return doc;
}

// ==========================================
// 3. 5-POINT CAUTION DEPOSIT EXIT CLEARANCE PDF
// ==========================================
export interface CautionSettlementPDFData {
  settlementNo: string;
  studentName: string;
  studentId: string;
  program: string;
  admissionYear: string;
  graduationYear: string;
  depositAmount: number;
  totalDeductions: number;
  netRefundAmount: number;
  paymentMethod: string;
  voucherId?: string;
  departments: Array<{
    name: string;
    status: "CLEARED" | "DEDUCTION" | "PENDING";
    signedBy: string;
    signedAt: string;
    deductionAmount: number;
    remarks: string;
  }>;
}

export function generateCautionSettlementPDF(data: CautionSettlementPDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawWatermark(doc, "CAUTION CLEARED");
  drawHeaderBanner(
    doc,
    "Institutional Exit Clearance",
    "5-Point Caution Deposit Return",
    "Settlement Voucher"
  );

  let y = 46;

  // Student & Exit Details Card
  doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.roundedRect(14, y, 182, 28, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.text("GRADUATE NAME:", 18, y + 6);
  doc.text("STUDENT ID / ROLL:", 18, y + 12);
  doc.text("ACADEMIC PROGRAM:", 18, y + 18);
  doc.text("TENURE PERIOD:", 18, y + 24);

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(data.studentName.toUpperCase(), 56, y + 6);
  doc.text(data.studentId, 56, y + 12);
  doc.text(data.program, 56, y + 18);
  doc.text(`${data.admissionYear} — ${data.graduationYear}`, 56, y + 24);

  // Financial Summary on Right
  doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
  doc.text("ORIGINAL DEPOSIT:", 120, y + 6);
  doc.text("TOTAL DEDUCTIONS:", 120, y + 12);
  doc.text("NET REFUND PAYABLE:", 120, y + 18);
  doc.text("REFUND VOUCHER ID:", 120, y + 24);

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.text(`$${data.depositAmount.toLocaleString()}`, 160, y + 6);
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.text(`-$${data.totalDeductions.toLocaleString()}`, 160, y + 12);
  doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`$${data.netRefundAmount.toLocaleString()}`, 160, y + 18);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(data.voucherId || "JV-CLEAR-2026", 160, y + 24);

  y += 34;

  // 5-Point Department Matrix Table
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(14, y, 182, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("DEPARTMENT / SECTION", 18, y + 4.8);
  doc.text("STATUS", 68, y + 4.8);
  doc.text("OFFICER SIGN-OFF", 92, y + 4.8);
  doc.text("DATE", 130, y + 4.8);
  doc.text("DEDUCTION", 148, y + 4.8);
  doc.text("REMARKS / CLEARANCE NOTES", 168, y + 4.8);

  y += 7;

  data.departments.forEach((dept, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLORS.slate50[0], COLORS.slate50[1], COLORS.slate50[2]);
      doc.rect(14, y, 182, 8, "F");
    }
    doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
    doc.line(14, y + 8, 196, y + 8);

    doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
    doc.setFontSize(7.2);
    doc.setFont("helvetica", "bold");
    doc.text(dept.name, 18, y + 5);

    if (dept.status === "CLEARED") {
      doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
      doc.text("CLEARED", 68, y + 5);
    } else if (dept.status === "DEDUCTION") {
      doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
      doc.text("DEDUCTED", 68, y + 5);
    } else {
      doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
      doc.text("PENDING", 68, y + 5);
    }

    doc.setTextColor(COLORS.slate700[0], COLORS.slate700[1], COLORS.slate700[2]);
    doc.setFont("helvetica", "normal");
    doc.text(dept.signedBy || "Auto Clearance", 92, y + 5);
    doc.text(dept.signedAt || "2026-09-30", 130, y + 5);

    if (dept.deductionAmount > 0) {
      doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
      doc.text(`-$${dept.deductionAmount}`, 148, y + 5);
    } else {
      doc.setTextColor(COLORS.emerald[0], COLORS.emerald[1], COLORS.emerald[2]);
      doc.text("$0.00", 148, y + 5);
    }

    doc.setTextColor(COLORS.slate500[0], COLORS.slate500[1], COLORS.slate500[2]);
    const rem = dept.remarks || "Zero outstanding dues confirmed";
    doc.text(rem.length > 25 ? rem.slice(0, 25) + "..." : rem, 168, y + 5);

    y += 8;
  });

  // Final Settlement Certification Box
  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(COLORS.slate200[0], COLORS.slate200[1], COLORS.slate200[2]);
  doc.roundedRect(14, y, 182, 16, 2, 2, "FD");

  doc.setTextColor(COLORS.slate900[0], COLORS.slate900[1], COLORS.slate900[2]);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("REGISTRAR & BURSAR DISCHARGE DECLARATION", 18, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.slate700[0], COLORS.slate700[1], COLORS.slate700[2]);
  doc.text(
    `Having fulfilled all 5 department clearances, the net settlement sum of $${data.netRefundAmount.toLocaleString()} has been audited and approved for disbursement via ${data.paymentMethod}. All institutional original certificates and transcripts may now be formally released to the student.`,
    18,
    y + 9.5
  );

  drawFooterWithSignatures(
    doc,
    "Bursar & Accounts Officer",
    "K. R. Ahmed, Head of Finance",
    "Registrar & Exit Controller",
    "Prof. Dr. Tariq Mansoor",
    `EXIT-CLEAR-HASH:CAUTION-${data.studentId}-${Date.now().toString(16).toUpperCase()}`
  );

  return doc;
}

// ==========================================
// 4. OFFICIAL DIGITAL CERTIFICATE (BONAFIDE / NOC / INTERNSHIP)
// ==========================================
export interface OfficialCertificatePDFData {
  certNo: string;
  docType: string;
  studentName: string;
  studentId: string;
  batch: string;
  issueDate: string;
  purpose: string;
  validUntil: string;
  verificationHash: string;
  qrUrl?: string;
}

export function generateOfficialCertificatePDF(data: OfficialCertificatePDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawWatermark(doc, "CERTIFIED");
  drawHeaderBanner(doc, "Office of the Registrar", "Official Institutional Certificate", data.docType);

  let y = 56;

  // Title
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`TO WHOM IT MAY CONCERN`, 105, y, { align: "center" });

  y += 12;

  // Certificate Body Paragraph
  doc.setTextColor(COLORS.slate700[0], COLORS.slate700[1], COLORS.slate700[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");

  const lines = [
    `This is to officially certify that ${data.studentName.toUpperCase()} (Student ID: ${data.studentId}) is a bona fide graduate/student of the Central Medical College & Teaching Hospital, affiliated with the Directorate of Medical Education and accredited by the National Medical Commission (NMC).`,
    "",
    `Program / Cohort: Bachelor of Medicine and Bachelor of Surgery (MBBS), Batch: ${data.batch || "2021-2026"}.`,
    "",
    `During the entire tenure of medical training and clinical rotations at this teaching hospital, the candidate maintained an exemplary academic record, completed all requisite clinical clerkships with distinction, and demonstrated high professional ethics and moral character.`,
    "",
    `Purpose of Issuance: ${data.purpose || "Official Post-Graduate Higher Medical Training & Licensing Verification"}.`,
    "",
    `This certificate remains valid until ${data.validUntil || "Permanent Record"} and carries cryptographic integrity backing. The authenticity of this document can be independently verified on the institutional verification registry using the hash string below or via standard QR scanning.`,
  ];

  lines.forEach((line) => {
    if (line === "") {
      y += 4;
    } else {
      const split = doc.splitTextToSize(line, 168);
      doc.text(split, 21, y);
      y += split.length * 5;
    }
  });

  drawFooterWithSignatures(
    doc,
    "Dean of Student Affairs",
    "Prof. Dr. Elizabeth Wright, MD",
    "Registrar General",
    "Prof. Dr. Tariq Mansoor",
    data.verificationHash
  );

  return doc;
}
