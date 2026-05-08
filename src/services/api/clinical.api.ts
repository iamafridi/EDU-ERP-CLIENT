import { request } from './client';

export const clinicalApi = {
  // Blood Bank
  getBloodStock: () => request<any[]>({ method: 'GET', url: '/blood-bank/stock' }, []),
  requestBloodTransfusion: (payload: any) => request({ method: 'POST', url: '/blood-bank/transfusions', data: payload }),
  requestTransfusion: (payload: any) => request({ method: 'POST', url: '/blood-bank/transfusions', data: payload }),

  // Telemedicine
  getTelemedicineConsultations: () => request<any[]>({ method: 'GET', url: '/telemedicine/consultations' }, []),
  getTelemedicineConsultationById: (id: string) => request({ method: 'GET', url: `/telemedicine/consultations/${id}` }),
  scheduleTelemedicineConsultation: (payload: any) => request({ method: 'POST', url: '/telemedicine/consultations', data: payload }),
  createTelemedicineConsultation: (payload: any) => request({ method: 'POST', url: '/telemedicine/consultations', data: payload }),

  // Hospital Clinical Operations
  getOPDPatients: () => request<any[]>({ method: 'GET', url: '/opd' }, []),
  getIPDAdmissions: () => request<any[]>({ method: 'GET', url: '/ipd' }, []),
  getLaboratoryTests: () => request<any[]>({ method: 'GET', url: '/laboratory' }, []),
  getPharmacyMedicines: () => request<any[]>({ method: 'GET', url: '/pharmacy' }, []),
  getClinicalRotations: () => request<any[]>({ method: 'GET', url: '/clinical-rotations' }, []),
  getSkillLabs: () => request<any[]>({ method: 'GET', url: '/skill-labs' }, [
    { id: 'SKL-001', studentName: 'Marcus Chen', studentId: 'STU-2026001', topic: 'Sterile Suture Techniques & Knot Tying', category: 'Surgical Skills', completed: true, verifiedBy: 'Dr. James Sterling', score: 94, verifiedAt: '2026-09-24T10:30:00Z', stationId: 'STN-04' },
    { id: 'SKL-002', studentName: 'Marcus Chen', studentId: 'STU-2026001', topic: 'Endotracheal Intubation & Airway Management', category: 'Emergency Skills', completed: true, verifiedBy: 'Dr. Alistair Who', score: 88, verifiedAt: '2026-09-26T14:15:00Z', stationId: 'STN-02' },
    { id: 'SKL-003', studentName: 'Sophia Martinez', studentId: 'STU-2026002', topic: 'Lumbar Puncture & CSF Sample Collection', category: 'Internal Medicine', completed: false, verifiedBy: 'Prof. Clara Oswald', score: 72, verifiedAt: null, stationId: 'STN-07' },
    { id: 'SKL-004', studentName: 'Ethan Gallagher', studentId: 'STU-2026003', topic: 'Neonatal Resuscitation Protocol (NRP)', category: 'Paediatrics', completed: true, verifiedBy: 'Dr. Sarah Jenkins', score: 96, verifiedAt: '2026-09-28T09:40:00Z', stationId: 'STN-09' },
    { id: 'SKL-005', studentName: 'Aria Takahashi', studentId: 'STU-2026004', topic: 'Central Venous Catheterization (CVC)', category: 'Critical Care', completed: false, verifiedBy: 'Dr. James Sterling', score: 65, verifiedAt: null, stationId: 'STN-01' },
    { id: 'SKL-006', studentName: 'Liam O\'Connor', studentId: 'STU-2026005', topic: 'Diagnostic Peritoneal Lavage (DPL)', category: 'Trauma Surgery', completed: true, verifiedBy: 'Dr. Alistair Who', score: 91, verifiedAt: '2026-09-30T11:20:00Z', stationId: 'STN-05' },
  ]),
  createSkillLab: (payload: any) => request({ method: 'POST', url: '/skill-labs', data: payload }),
  updateSkillLab: (id: string, payload: any) => request({ method: 'PATCH', url: `/skill-labs/${id}`, data: payload }),
  deleteSkillLab: (id: string) => request({ method: 'DELETE', url: `/skill-labs/${id}` }),

  getHealthCenterRecords: () => request<any[]>({ method: 'GET', url: '/health-center' }, []),
  getLogbooks: () => request<any[]>({ method: 'GET', url: '/logbook' }, []),

  // ──── OSCE / OSPE PRACTICAL EXAM STATION MATRIX ────
  getOSCEExamSession: () => request<any>({ method: 'GET', url: '/osce/active-session' }, {
    sessionId: 'OSCE-2026-FINAL-MBBS',
    examTitle: 'Final Professional MBBS Clinical OSCE Circuit',
    currentCircuitRound: 3,
    totalRounds: 8,
    stationDurationSeconds: 300,
    timeRemainingSeconds: 184,
    circuitStatus: 'IN_PROGRESS',
    activeCohort: 'Batch 52 - Group A',
    totalCandidates: 24,
    stations: [
      { id: 'STN-01', stationNumber: 1, title: 'Cardiovascular Examination', type: 'MANIKIN_EXAM', room: 'SimLab Room 101', examinerA: 'Prof. Alistair Who', examinerB: 'Dr. Helena Troy', currentCandidate: 'STU-2026001 (Marcus Chen)', standardPatient: 'Harvey Cardiac SimMan', scoreA: 18.5, scoreB: 19.0, maxScore: 20, variancePct: 2.7, status: 'EVALUATING' },
      { id: 'STN-02', stationNumber: 2, title: 'Respiratory Auscultation & Chest X-Ray', type: 'INTERPRETATION', room: 'SimLab Room 102', examinerA: 'Dr. Sarah Jenkins', examinerB: 'Dr. Robert Paul', currentCandidate: 'STU-2026002 (Sophia Martinez)', standardPatient: 'Chest X-Ray Station', scoreA: 17.0, scoreB: 16.5, maxScore: 20, variancePct: 3.0, status: 'EVALUATING' },
      { id: 'STN-03', stationNumber: 3, title: 'Breaking Bad News (Oncology Counseling)', type: 'COMMUNICATION', room: 'Consultation Suite B', examinerA: 'Prof. Clara Oswald', examinerB: 'Dr. Tariqul Islam', currentCandidate: 'STU-2026003 (Ethan Gallagher)', standardPatient: 'Ms. Rebecca (Standardized Patient)', scoreA: 19.5, scoreB: 20.0, maxScore: 20, variancePct: 2.5, status: 'EVALUATING' },
      { id: 'STN-04', stationNumber: 4, title: 'Aseptic Surgical Scrubbing & Gowning', type: 'PROCEDURAL', room: 'Wet Lab 3', examinerA: 'Dr. James Sterling', examinerB: 'Dr. Ananya Roy', currentCandidate: 'STU-2026004 (Aria Takahashi)', standardPatient: 'Sterile OT Scrub Station', scoreA: 15.0, scoreB: 18.5, maxScore: 20, variancePct: 21.0, status: 'ANOMALY_VARIANCE_FLAGGED' },
      { id: 'STN-05', stationNumber: 5, title: 'Paediatric Dehydration & ORS Prescription', type: 'PRESCRIPTION', room: 'SimLab Room 105', examinerA: 'Dr. Nasir Uddin', examinerB: 'Dr. Farhana Ahmed', currentCandidate: 'STU-2026005 (Liam O\'Connor)', standardPatient: 'Baby Sim Manikin', scoreA: 18.0, scoreB: 18.0, maxScore: 20, variancePct: 0.0, status: 'EVALUATING' },
      { id: 'STN-06', stationNumber: 6, title: 'Rest Station (Preparation & Sanitization)', type: 'REST', room: 'Student Lounge Area', examinerA: 'N/A', examinerB: 'N/A', currentCandidate: 'STU-2026006 (Priya Sharma)', standardPatient: 'N/A', scoreA: null, scoreB: null, maxScore: 0, variancePct: 0.0, status: 'REST_PERIOD' },
    ],
  }),

  submitOSCEScore: (payload: { stationId: string; candidateId: string; examinerRole: 'A' | 'B'; scores: Record<string, number>; notes: string }) =>
    request({ method: 'POST', url: '/osce/submit-station-score', data: payload }),

  // ──── DOPS & MINI-CEX BEDSIDE CLINICAL COMPETENCY ────
  getDOPSCompetencies: (studentId: string = 'STU-2026001') => request<any[]>({ method: 'GET', url: `/dops/student/${studentId}` }, [
    {
      id: 'DOPS-101',
      procedureName: 'Lumbar Puncture & CSF Manometry',
      category: 'Neurology / General Medicine',
      requiredQuota: 10,
      completedQuota: 8,
      lastEvaluatedAt: '2026-09-28T14:30:00Z',
      evaluatorName: 'Prof. Alistair Who (HOD Neurology)',
      evaluatorId: 'FAC-985',
      wardLocation: 'Neurology High Dependency Ward (Ward 4B)',
      geoVerification: { verified: true, hospitalCoordinates: '23.777176, 90.399452', radiusMeters: 45 },
      digitalStamp: 'BMDC-STAMP-FAC985-SHA256-4b92ae1f',
      scores: {
        indicationConsent: 6, // out of 6
        asepticPreparation: 5,
        anatomicalLandmarkIdentification: 6,
        technicalExecution: 5,
        postProcedureCare: 6,
        professionalismCommunication: 6,
      },
      totalScorePct: 94.4,
      competencyLevel: 'INDEPENDENT_WITH_DISTINCTION', // 'NOVICE' | 'DIRECT_SUPERVISION' | 'INDIRECT_SUPERVISION' | 'INDEPENDENT_WITH_DISTINCTION'
      evaluatorFeedback: 'Flawless anatomical landmark palpation at L3-L4 interspace. Patient reassured throughout.',
    },
    {
      id: 'DOPS-102',
      procedureName: 'Aseptic Foley Catheterization (Male & Female)',
      category: 'General Surgery / Urology',
      requiredQuota: 25,
      completedQuota: 25,
      lastEvaluatedAt: '2026-09-22T11:00:00Z',
      evaluatorName: 'Dr. James Sterling (Professor Surgery)',
      evaluatorId: 'FAC-983',
      wardLocation: 'Surgical Ward 2A',
      geoVerification: { verified: true, hospitalCoordinates: '23.777180, 90.399460', radiusMeters: 30 },
      digitalStamp: 'BMDC-STAMP-FAC983-SHA256-9a81bc3c',
      scores: {
        indicationConsent: 6,
        asepticPreparation: 6,
        anatomicalLandmarkIdentification: 6,
        technicalExecution: 6,
        postProcedureCare: 5,
        professionalismCommunication: 6,
      },
      totalScorePct: 97.2,
      competencyLevel: 'INDEPENDENT_WITH_DISTINCTION',
      evaluatorFeedback: 'Quota complete. Certified ready for unassisted casualty night shift posting.',
    },
    {
      id: 'DOPS-103',
      procedureName: 'Normal Spontaneous Vaginal Delivery (NSVD) Conduct',
      category: 'Obstetrics & Gynaecology',
      requiredQuota: 30,
      completedQuota: 18,
      lastEvaluatedAt: '2026-09-29T22:15:00Z',
      evaluatorName: 'Prof. Clara Oswald (HOD Ob/Gyn)',
      evaluatorId: 'FAC-984',
      wardLocation: 'Labour Ward Suite 1',
      geoVerification: { verified: true, hospitalCoordinates: '23.777170, 90.399440', radiusMeters: 20 },
      digitalStamp: 'BMDC-STAMP-FAC984-SHA256-3c77d88e',
      scores: {
        indicationConsent: 5,
        asepticPreparation: 5,
        anatomicalLandmarkIdentification: 5,
        technicalExecution: 4,
        postProcedureCare: 5,
        professionalismCommunication: 5,
      },
      totalScorePct: 80.5,
      competencyLevel: 'INDIRECT_SUPERVISION',
      evaluatorFeedback: 'Good control of fetal head expulsion. Perineal support technique needs slightly firmer guarding.',
    },
    {
      id: 'DOPS-104',
      procedureName: 'Endotracheal Intubation & Video Laryngoscopy',
      category: 'Anaesthesiology & Critical Care',
      requiredQuota: 15,
      completedQuota: 11,
      lastEvaluatedAt: '2026-09-30T08:45:00Z',
      evaluatorName: 'Dr. Sarah Jenkins (Assoc. Professor ICU)',
      evaluatorId: 'FAC-991',
      wardLocation: 'Main OT Suite 4',
      geoVerification: { verified: true, hospitalCoordinates: '23.777165, 90.399475', radiusMeters: 15 },
      digitalStamp: 'BMDC-STAMP-FAC991-SHA256-55d21a99',
      scores: {
        indicationConsent: 6,
        asepticPreparation: 6,
        anatomicalLandmarkIdentification: 5,
        technicalExecution: 5,
        postProcedureCare: 6,
        professionalismCommunication: 6,
      },
      totalScorePct: 94.4,
      competencyLevel: 'INDEPENDENT_WITH_DISTINCTION',
      evaluatorFeedback: 'Smooth Cormack-Lehane Grade 1 view under video blade. Tube anchored securely on first attempt.',
    },
  ]),

  submitDOPSEvaluation: (payload: any) => request({ method: 'POST', url: '/dops/evaluate', data: payload }),

  // ──── SIM-LAB EQUIPMENT TELEMETRY & UTILIZATION ────
  getSimLabTelemetry: () => request<any[]>({ method: 'GET', url: '/skill-labs/telemetry' }, [
    { id: 'EQP-01', model: 'Laerdal SimMan 3G PLUS', room: 'High-Fidelity Trauma Sim Room 1', uptimeHours: 342, batteryLevel: 98, status: 'ONLINE_ACTIVE', consumables: { simulatedBloodLiters: 4.2, airwayLubePct: 85, cprSensorHealth: '100% Calibrated' }, nextCalibrationDate: '2026-11-15' },
    { id: 'EQP-02', model: 'Harvey The Cardiopulmonary Patient Simulator', room: 'Cardiology Acoustic Suite', uptimeHours: 512, batteryLevel: 100, status: 'ONLINE_STANDBY', consumables: { stethoscopeSensors: '5/5 Working', acousticDrivers: 'Nominal' }, nextCalibrationDate: '2026-12-01' },
    { id: 'EQP-03', model: 'LapVR Laparoscopic Virtual Reality Trainer', room: 'Minimally Invasive Surgery Sim 2', uptimeHours: 198, batteryLevel: 100, status: 'ONLINE_ACTIVE', consumables: { hapticMotors: 'Operational', trocarSeals: 'Replaced 2026-09-20' }, nextCalibrationDate: '2026-10-28' },
    { id: 'EQP-04', model: 'Lucina Maternal Fetal Childbirth Simulator', room: 'Obstetric Simulation Suite', uptimeHours: 275, batteryLevel: 89, status: 'MAINTENANCE_REQUIRED', consumables: { amnioticFluidRes: 'Low (15%)', deliveryTractionBelt: 'Check Tension' }, nextCalibrationDate: '2026-10-05' },
  ]),

  // ──── NARCOTIC & SCHEDULE-H CONTROLLED SUBSTANCE VAULT ────
  getControlledSubstanceVault: () => request<any>({ method: 'GET', url: '/pharmacy/narcotic-vault' }, {
    vaultStatus: 'BIOMETRIC_ARMED',
    vaultChiefSignatory: 'Dr. James Sterling (Reg # BMDC-3918)',
    headPharmacist: 'Pharm. Nazmul Huda (Lic # DGDA-4912)',
    lastAuditTimestamp: '2026-10-02T18:00:00Z',
    activeDispensationsToday: 14,
    items: [
      { id: 'NAR-01', drugName: 'Morphine Sulphate Inj 15mg/ml', schedule: 'SCHEDULE_X_NARCOTIC', batchNo: 'MPH-2026-88B', stockAmpoules: 84, minThreshold: 30, unitPrice: 450, expiryDate: '2027-08-31', lastDispensedTo: 'IPD Bed 304 (Post-Op Laparotomy)', dispensedBy: 'Dr. Tariqul Islam', witnessSignatory: 'Sister In-Charge Mary', status: 'SECURE' },
      { id: 'NAR-02', drugName: 'Fentanyl Citrate Inj 50mcg/ml (2ml)', schedule: 'SCHEDULE_X_NARCOTIC', batchNo: 'FNT-2026-04A', stockAmpoules: 120, minThreshold: 50, unitPrice: 620, expiryDate: '2027-12-31', lastDispensedTo: 'Main OT Suite 2 (CABG Anaesthesia)', dispensedBy: 'Dr. Sarah Jenkins', witnessSignatory: 'Sister In-Charge Mary', status: 'SECURE' },
      { id: 'NAR-03', drugName: 'Pethidine Hydrochloride Inj 50mg/ml', schedule: 'SCHEDULE_X_NARCOTIC', batchNo: 'PTH-2026-19C', stockAmpoules: 19, minThreshold: 25, unitPrice: 380, expiryDate: '2027-04-30', lastDispensedTo: 'Emergency Trauma Bay 1', dispensedBy: 'Dr. Alistair Who', witnessSignatory: 'Staff Nurse Kamal', status: 'CRITICAL_LOW_STOCK' },
      { id: 'NAR-04', drugName: 'Midazolam HCL Inj 5mg/ml', schedule: 'SCHEDULE_H_SEDATIVE', batchNo: 'MDZ-2026-72D', stockAmpoules: 160, minThreshold: 40, unitPrice: 180, expiryDate: '2028-01-31', lastDispensedTo: 'Endoscopy Suite 1', dispensedBy: 'Dr. James Sterling', witnessSignatory: 'Pharm. Nazmul Huda', status: 'SECURE' },
      { id: 'NAR-05', drugName: 'Ketamine Hydrochloride Inj 50mg/ml (10ml)', schedule: 'SCHEDULE_H_SEDATIVE', batchNo: 'KTM-2026-31E', stockAmpoules: 42, minThreshold: 20, unitPrice: 290, expiryDate: '2027-09-30', lastDispensedTo: 'Paediatric OT Suite 3', dispensedBy: 'Dr. Sarah Jenkins', witnessSignatory: 'Sister In-Charge Mary', status: 'SECURE' },
    ],
    recentAuditLogs: [
      { id: 'NLOG-01', timestamp: '2026-10-03T06:30:00Z', drugName: 'Morphine Sulphate Inj 15mg/ml', quantity: 2, recipientPatient: 'IPD-8891 (Marcus Sterling)', reason: 'Severe Breakthrough Post-Thoracotomy Pain', primaryDoctor: 'Dr. Tariqul Islam', witness: 'Sister In-Charge Mary', verificationHash: 'VAULT-SIG-8492049182' },
      { id: 'NLOG-02', timestamp: '2026-10-02T22:15:00Z', drugName: 'Fentanyl Citrate Inj 50mcg/ml', quantity: 3, recipientPatient: 'OT-4902 (Emergency Craniotomy)', reason: 'Intraoperative Analgesia Infusion', primaryDoctor: 'Dr. Sarah Jenkins', witness: 'Sister In-Charge Mary', verificationHash: 'VAULT-SIG-1948201948' },
    ],
  }),

  dispenseControlledDrug: (payload: { drugId: string; quantity: number; patientId: string; doctorPin: string; witnessPin: string; indication: string }) =>
    request({ method: 'POST', url: '/pharmacy/narcotic-vault/dispense', data: payload }),

  // ──── CRRI INTERNSHIP ROSTER & MANDATORY PROCEDURE QUOTA ────
  getInternshipRosters: (params?: any) => request<any[]>({ method: 'GET', url: '/clinical-rotations/internship/rosters', params }, []),
  createInternshipRoster: (payload: any) => request({ method: 'POST', url: '/clinical-rotations/internship/rosters', data: payload }),
  updateInternshipClearance: (id: string, payload: any) => request({ method: 'PATCH', url: `/clinical-rotations/internship/rosters/${id}/clearance`, data: payload }),
  getInternProgressSummary: (rollNumber: string) => request<any>({ method: 'GET', url: `/clinical-rotations/internship/progress/${rollNumber}` }, null),
  getProcedureLogs: (params?: any) => request<any[]>({ method: 'GET', url: '/clinical-rotations/procedures/logs', params }, []),
  logClinicalProcedure: (payload: any) => request({ method: 'POST', url: '/clinical-rotations/procedures/logs', data: payload }),
  verifyClinicalProcedure: (id: string, payload: any) => request({ method: 'PATCH', url: `/clinical-rotations/procedures/logs/${id}/verify`, data: payload }),

  // ──── MORBIDITY & MORTALITY (M&M) CLINICAL AUDIT & SENTINEL GOVERNANCE ────
  getClinicalAudits: (params?: any) => request<any[]>({ method: 'GET', url: '/incidents/clinical-audits', params }, []),
  logClinicalAuditCase: (payload: any) => request({ method: 'POST', url: '/incidents/clinical-audits', data: payload }),
  reviewClinicalAuditCase: (id: string, payload: any) => request({ method: 'PATCH', url: `/incidents/clinical-audits/${id}/review`, data: payload }),
  getClinicalAuditStats: () => request<any>({ method: 'GET', url: '/incidents/clinical-audits/stats' }, null),

  // ──── PHARMACY FEFO AUTO-QUARANTINE & SUPPLIER DEBIT NOTES ────
  getFefoBatches: (params?: any) => request<any[]>({ method: 'GET', url: '/pharmacy/fefo/batches', params }, []),
  createFefoBatch: (payload: any) => request({ method: 'POST', url: '/pharmacy/fefo/batches', data: payload }),
  runFefoQuarantineScan: () => request<any>({ method: 'POST', url: '/pharmacy/fefo/scan-quarantine' }, null),
  issueFefoDebitNote: (id: string) => request({ method: 'PATCH', url: `/pharmacy/fefo/batches/${id}/debit-note` }),

  // ──── BIO-MEDICAL ENGINEERING (BME) CALIBRATION & FLEET UPTIME ────
  getBmeEquipments: (params?: any) => request<any[]>({ method: 'GET', url: '/maintenance/bme/equipments', params }, []),
  registerBmeEquipment: (payload: any) => request({ method: 'POST', url: '/maintenance/bme/equipments', data: payload }),
  logBmeCalibration: (id: string, payload: any) => request({ method: 'PATCH', url: `/maintenance/bme/equipments/${id}/calibration`, data: payload }),
  getBmeStats: () => request<any>({ method: 'GET', url: '/maintenance/bme/stats' }, null),
};

