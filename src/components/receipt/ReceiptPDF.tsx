"use client";

// ——— Original @react-pdf/renderer version (commented out for reference) ———
// import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
//
// const styles = StyleSheet.create({
//   page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 15, borderBottomWidth: 2, borderBottomColor: "#2563EB" },
//   logoArea: { flexDirection: "row", alignItems: "center", gap: 12 },
//   logo: { width: 50, height: 50, backgroundColor: "#2563EB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
//   logoText: { color: "white", fontSize: 20, fontWeight: "bold" },
//   title: { fontSize: 18, fontWeight: "bold", color: "#2563EB" },
//   subtitle: { fontSize: 9, color: "#64748b", marginTop: 2 },
//   receiptTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#1e293b" },
//   infoRow: { flexDirection: "row", marginBottom: 4 },
//   infoLabel: { width: 120, color: "#64748b", fontSize: 9 },
//   infoValue: { flex: 1, color: "#1e293b", fontSize: 9, fontWeight: "bold" },
//   table: { marginTop: 15, marginBottom: 15 },
//   tableHeader: { flexDirection: "row", backgroundColor: "#2563EB", padding: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
//   tableHeaderText: { color: "white", fontSize: 9, fontWeight: "bold" },
//   tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", padding: 8 },
//   tableRowAlt: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", padding: 8, backgroundColor: "#f8fafc" },
//   tableCell: { fontSize: 9, color: "#1e293b" },
//   col1: { width: "40%" }, col2: { width: "30%", textAlign: "center" }, col3: { width: "30%", textAlign: "right" },
//   totalRow: { flexDirection: "row", justifyContent: "flex-end", padding: 8, marginTop: 5, borderTopWidth: 2, borderTopColor: "#1e293b" },
//   totalLabel: { fontSize: 10, fontWeight: "bold", marginRight: 30 },
//   totalValue: { fontSize: 10, fontWeight: "bold", color: "#2563EB" },
//   footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", color: "#94a3b8", fontSize: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10 },
//   paymentDetails: { marginTop: 15, padding: 10, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 4 },
// });
//
// export default function ReceiptPDF({ data }: { data: ReceiptData }) {
//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         ...receipt layout using <View>, <Text>...
//       </Page>
//     </Document>
//   );
// }

import jsPDF from "jspdf";

type ReceiptItem = {
  description: string;
  amount: number;
};

export type ReceiptData = {
  receiptNo: string;
  date: string;
  studentName: string;
  studentId: string;
  semester: string;
  paymentMethod: string;
  transactionId: string;
  items: ReceiptItem[];
};

export function generateReceiptPDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const total = data.items.reduce((sum, i) => sum + i.amount, 0);

  // Header bar
  doc.setFillColor(37, 99, 235);
  doc.rect(20, 15, 170, 2, "F");

  // Logo box
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(20, 22, 12, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("E", 26, 30.5, { align: "center" });

  // Title
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("EDU-ERP", 36, 28);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Affiliated to National Medical Commission", 36, 32);
  doc.text("Approved by Ministry of Education", 36, 35);

  // Receipt title
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", 190, 28, { align: "right" });
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.receiptNo}`, 190, 32, { align: "right" });

  // Info rows
  let y = 45;
  const labelX = 20;
  const valueX = 55;
  const lineHeight = 6;

  const infoRows: [string, string][] = [
    ["Receipt No:", data.receiptNo],
    ["Date:", data.date],
    ["Student Name:", data.studentName],
    ["Student ID:", data.studentId],
    ["Semester:", data.semester],
  ];

  doc.setFontSize(8);
  for (const [label, value] of infoRows) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(label, labelX, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(value, valueX, y);
    y += lineHeight;
  }

  // Table
  y += 5;
  const tableWidth = 170;
  const col1Width = tableWidth * 0.4;
  const col2Width = tableWidth * 0.3;
  const col3Width = tableWidth * 0.3;

  // Table header
  doc.setFillColor(37, 99, 235);
  doc.rect(labelX, y, tableWidth, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Description", labelX + 2, y + 5);
  doc.text("Details", labelX + col1Width + 2, y + 5);
  doc.text("Amount (\u20B9)", labelX + col1Width + col2Width + col2Width - 2, y + 5, { align: "right" });
  y += 7;

  // Table rows
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(labelX, y, tableWidth, 7, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(labelX, y, labelX + tableWidth, y);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7);
    doc.text(item.description, labelX + 2, y + 5);
    doc.text(data.semester, labelX + col1Width + 2, y + 5);
    doc.text(`\u20B9${item.amount.toLocaleString()}`, labelX + tableWidth - 2, y + 5, { align: "right" });
    y += 7;
  }

  // Total row
  y += 2;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(labelX + col1Width + col2Width, y, labelX + tableWidth, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Total Amount Paid:", labelX + col1Width + col2Width - 10, y, { align: "right" });
  doc.setTextColor(37, 99, 235);
  doc.text(`\u20B9${total.toLocaleString()}`, labelX + tableWidth, y, { align: "right" });

  // Payment details box
  y += 8;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.3);
  doc.roundedRect(labelX, y, tableWidth, 22, 2, 2, "FD");

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", labelX + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Payment Method:", labelX + 4, y + 12);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text(data.paymentMethod, labelX + 35, y + 12);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Transaction ID:", labelX + 4, y + 17);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text(data.transactionId, labelX + 35, y + 17);

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(labelX, 277, labelX + tableWidth, 277);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(
    `This is a computer-generated receipt. No signature required. | EDU-ERP | ${new Date().getFullYear()}`,
    105,
    282,
    { align: "center" }
  );

  return doc;
}
