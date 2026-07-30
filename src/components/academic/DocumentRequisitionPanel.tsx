"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileCheck,
  Plus,
  QrCode,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Building,
  Check,
  Clock,
  Search,
  Download,
} from "lucide-react";
import { academicApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";
import { generateOfficialCertificatePDF } from "@/lib/pdfGenerator";

export function DocumentRequisitionPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isRegistrarOrAdmin = user?.role === "super-admin" || user?.role === "domain-admin" || user?.role === "staff";

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeCertificate, setActiveCertificate] = useState<any>(null);

  // Verification modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyTokenInput, setVerifyTokenInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form states
  const [docCategory, setDocCategory] = useState("CHARACTER_CERTIFICATE");
  const [purpose, setPurpose] = useState("VISA_IMMIGRATION");
  const [deliveryMode, setDeliveryMode] = useState<any>("DIGITAL_DOWNLOAD_VERIFIED");

  const { data: requisitions = [], isLoading } = useQuery({
    queryKey: ["document-requisitions"],
    queryFn: () => academicApi.getAllDocumentRequisitions(),
  });

  const applyMutation = useMutation({
    mutationFn: (payload: any) => academicApi.createDocumentRequisition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-requisitions"] });
      setIsApplyModalOpen(false);
      setSuccessMsg("Document requisition submitted. Departmental clearance initiated.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const clearanceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.updateDocumentClearance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-requisitions"] });
      setSuccessMsg("Departmental clearance gate updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const signIssueMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => academicApi.signAndIssueDocument(id, payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["document-requisitions"] });
      setSuccessMsg("Document digitally signed by Registrar with unique QR verification code.");
      setTimeout(() => setSuccessMsg(""), 4500);
      setActiveCertificate(data);
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      documentCategory: docCategory,
      purpose,
      deliveryMode,
      feeAmount: docCategory === "TRANSCRIPT_ATTESTATION" ? 1000 : 500,
    });
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTokenInput.trim()) return;
    setIsVerifying(true);
    try {
      const res = await academicApi.verifyDocumentByQrToken(verifyTokenInput.trim());
      setVerificationResult(res);
    } catch {
      setVerificationResult({ verified: false, error: "No official certificate matching this verification code." });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-surface-muted/60 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Award size={16} className="text-gold" />
            Official Student Document Requisition &amp; QR Certificate Authority
          </h3>
          <p className="text-xs text-text-muted">
            Issue cryptographically verifiable Character Certificates, Testimonials, Medium of Instruction Letters, and Attested Transcripts for embassies, BMDC, and foreign universities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Search size={14} />}
            onClick={() => {
              setIsVerifyModalOpen(true);
              setVerificationResult(null);
            }}
          >
            Authenticate Certificate QR
          </Button>
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for Document
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Requisitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requisitions.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-text-muted border border-dashed border-border rounded-2xl">
            No document requisitions currently logged in the registry.
          </div>
        ) : (
          requisitions.map((req: any) => (
            <Card key={req._id || req.id} orientation="vertical" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gold">{req.requisitionNumber}</span>
                <Badge
                  variant={
                    req.status === "READY_FOR_DOWNLOAD"
                      ? "success"
                      : req.status === "DEPARTMENT_RECOMMENDED"
                      ? "primary"
                      : "warning"
                  }
                  size="sm"
                >
                  {req.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-bold text-text">{req.documentCategory?.replace(/_/g, " ")}</h4>
                <span className="text-[11px] text-text-muted font-mono">{req.studentName} ({req.studentId})</span>
              </div>

              <div className="p-2.5 bg-surface-muted rounded-xl border border-border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Purpose:</span>
                  <strong className="text-text">{req.purpose?.replace(/_/g, " ")}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Requisition Fee:</span>
                  <span className="font-mono font-bold text-emerald-600">৳{req.feeAmount} ({req.feeStatus})</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-border">
                  <span className="text-text-muted">Clearance Mesh:</span>
                  <span className="font-semibold text-emerald-600">
                    {req.libraryCleared && req.accountsCleared && req.hostelCleared ? "✓ 3/3 Cleared" : "Pending Gates"}
                  </span>
                </div>
              </div>

              {/* QR Token Badge if issued */}
              {req.status === "READY_FOR_DOWNLOAD" && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1"><ShieldCheck size={13} /> Authenticated:</span>
                    <span className="font-mono text-[10px]">{req.qrVerificationToken}</span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<Printer size={13} />}
                      onClick={() => setActiveCertificate(req)}
                    >
                      View &amp; Print Certificate
                    </Button>
                  </div>
                </div>
              )}

              {/* Administrative Actions */}
              {isRegistrarOrAdmin && req.status !== "READY_FOR_DOWNLOAD" && (
                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  {req.status === "SUBMITTED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        clearanceMutation.mutate({
                          id: req._id || req.id,
                          payload: { libraryCleared: true, accountsCleared: true, hostelCleared: true },
                        })
                      }
                    >
                      Verify Clearances
                    </Button>
                  )}
                  {req.status === "DEPARTMENT_RECOMMENDED" && (
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<ShieldCheck size={14} />}
                      onClick={() =>
                        signIssueMutation.mutate({
                          id: req._id || req.id,
                          payload: { registrarSignatoryName: "Prof. Dr. M. Rahman, Registrar" },
                        })
                      }
                    >
                      Sign &amp; Release Certificate
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Official Certificate / Attestation"
        subtitle="Request registrar-attested documents with cryptographic QR validation"
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <FormField label="Select Document Certificate Category" required>
            <Select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
            >
              <option value="CHARACTER_CERTIFICATE">Character Certificate</option>
              <option value="TESTIMONIAL">Official Academic Testimonial</option>
              <option value="BONAFIDE_LETTER">Bonafide Student Certificate</option>
              <option value="TRANSCRIPT_ATTESTATION">Official Transcript Attestation</option>
              <option value="MEDIUM_OF_INSTRUCTION">Medium of Instruction (English) Letter</option>
              <option value="NO_OBJECTION_CERTIFICATE">No Objection Certificate (NOC)</option>
              <option value="INTERNSHIP_COMPLETION">Internship Completion Certificate</option>
            </Select>
          </FormField>

          <FormField label="Purpose of Document" required>
            <Select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="VISA_IMMIGRATION">Embassy / Visa / Immigration Application</option>
              <option value="HIGHER_EDUCATION">Foreign University Higher Education (USMLE/PLAB)</option>
              <option value="BANK_LOAN">Bank Educational Loan Application</option>
              <option value="EMPLOYMENT_JOB">Employment / Hospital Job Verification</option>
              <option value="BMDC_REGISTRATION">BMDC / Medical Council Registration</option>
              <option value="OTHER">Other Academic Requirement</option>
            </Select>
          </FormField>

          <FormField label="Delivery Mode" required>
            <Select
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
            >
              <option value="DIGITAL_DOWNLOAD_VERIFIED">Digital Download (Instant QR Authenticated PDF)</option>
              <option value="HARDCOPY_COLLECTION_COUNTER">Physical Hardcopy from Registrar Counter</option>
            </Select>
          </FormField>

          <div className="p-3 bg-surface-muted rounded-xl border border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Requisition Processing Fee:</span>
            <strong className="font-mono text-emerald-600 text-sm">
              ৳{docCategory === "TRANSCRIPT_ATTESTATION" ? "1,000" : "500"} BDT
            </strong>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Submitting..." : "Submit Requisition"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Certificate Viewer Modal with QR Code */}
      <Modal
        isOpen={!!activeCertificate}
        onClose={() => setActiveCertificate(null)}
        title="Official Authenticated Certificate"
        subtitle={activeCertificate?.requisitionNumber}
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" leftIcon={<Printer size={14} />} onClick={() => window.print()}>
              Print Certificate
            </Button>
            <Button variant="gold" onClick={() => setActiveCertificate(null)}>
              Close
            </Button>
          </div>
        }
      >
        {activeCertificate && (
          <div className="p-8 bg-surface-muted rounded-2xl border border-border space-y-6 text-center font-serif text-text">
            <div className="border-b-2 border-gold pb-4 space-y-1">
              <h2 className="text-lg font-bold text-text uppercase tracking-widest">Medical College &amp; Hospital</h2>
              <p className="text-[11px] font-sans text-text-muted uppercase tracking-wider">Office of the Registrar • Dhaka, Bangladesh</p>
            </div>

            <div className="py-2">
              <span className="text-xs font-sans font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full">
                {activeCertificate.documentCategory?.replace(/_/g, " ")}
              </span>
            </div>

            <p className="text-xs leading-relaxed font-sans text-text text-left">
              This is to officially certify that <strong className="font-bold text-text">{activeCertificate.studentName}</strong>, bearing Student Registration Number <strong className="font-mono text-gold">{activeCertificate.studentId}</strong>, is a bonafide student in the <strong className="text-text">{activeCertificate.department || "School of Medicine"}</strong>. To the best of our knowledge, during their tenure at this institution, they have borne an exemplary moral character and academic diligence.
            </p>

            <div className="pt-6 border-t border-border flex justify-between items-end font-sans text-xs">
              <div className="text-left space-y-1">
                <QrCode size={75} className="text-navy" />
                <span className="font-mono text-[9px] text-text-muted block">CODE: {activeCertificate.qrVerificationToken}</span>
              </div>

              <div className="text-right space-y-1">
                <div className="w-32 border-b border-text-muted/50 pb-1 font-mono text-[10px] text-emerald-600">
                  DIGITALLY SIGNED
                </div>
                <strong className="text-[11px] block text-text">{activeCertificate.registrarSignatoryName || "Registrar"}</strong>
                <span className="text-[10px] text-text-muted block">Office of Academic Affairs</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={() => {
                  const doc = generateOfficialCertificatePDF({
                    certNo: activeCertificate.qrVerificationToken || activeCertificate._id,
                    docType: (activeCertificate.documentCategory || "OFFICIAL_CERTIFICATE").replace(/_/g, " "),
                    studentName: activeCertificate.studentName,
                    studentId: activeCertificate.studentId,
                    batch: "2021-2026",
                    issueDate: new Date().toLocaleDateString(),
                    purpose: (activeCertificate.purposeOfIssue || "OFFICIAL_RECORD").replace(/_/g, " "),
                    validUntil: "Permanent Record",
                    verificationHash: activeCertificate.qrVerificationToken || `TOKEN-${Date.now()}`,
                  });
                  doc.save(`${activeCertificate.documentCategory}_${activeCertificate.studentId}.pdf`);
                }}
              >
                Download Official Signed PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Public QR Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Third-Party Document QR Authentication"
        subtitle="Verify authentic certificate issuance for embassies, licensing boards, and employers"
        size="md"
      >
        <div className="space-y-4">
          <form onSubmit={handleVerifyToken} className="space-y-3">
            <FormField label="Enter Verification Code / Scan QR Code" required>
              <div className="flex gap-2">
                <Input
                  value={verifyTokenInput}
                  onChange={(e) => setVerifyTokenInput(e.target.value)}
                  placeholder="e.g. AUTH-QR-2026-X889Q2"
                  className="font-mono uppercase"
                  required
                />
                <Button variant="gold" type="submit" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </FormField>
          </form>

          {verificationResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${verificationResult.verified ? "bg-emerald-500/10 border-emerald-500/20 text-text" : "bg-danger/10 border-danger/20 text-danger"}`}>
              {verificationResult.verified ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-emerald-600 text-sm">
                    <CheckCircle2 size={18} />
                    Verified Official Document
                  </div>
                  <div className="space-y-1 pt-1 font-sans text-text">
                    <div><span className="text-text-muted">Certificate Type: </span><strong>{verificationResult.certificateType?.replace(/_/g, " ")}</strong></div>
                    <div><span className="text-text-muted">Issued To: </span><strong>{verificationResult.issuedTo} ({verificationResult.registrationId})</strong></div>
                    <div><span className="text-text-muted">Department: </span><span>{verificationResult.department}</span></div>
                    <div><span className="text-text-muted">Signatory: </span><span>{verificationResult.signatory}</span></div>
                    <div><span className="text-text-muted">Status: </span><Badge variant="success" size="sm">GENUINE &amp; RECORDED</Badge></div>
                  </div>
                </>
              ) : (
                <div className="font-semibold text-danger">
                  ⚠️ {verificationResult.error || "Verification failed. Invalid token."}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default DocumentRequisitionPanel;
