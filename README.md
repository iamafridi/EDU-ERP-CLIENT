# 🏢 HOSTEL-PRO ERP — Frontend Enterprise Client Architecture

<div align="center">
  <img src="./public/logo.jpg" alt="HOSTEL-PRO ERP Logo" width="160" style="border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.6);" />
  <h2>HOSTEL-PRO ERP</h2>
  <p><strong>Cloud-Native Residential Campus, Living & Enterprise Resource Planning Operating System</strong></p>
  <p><em>Built on Next.js 14 App Router • TypeScript 5 • Tailwind CSS 3.4 • Framer Motion • Zustand • Edge OpenGraph</em></p>

  <p>
    <a href="#-executive-overview--system-scale">System Scale</a> •
    <a href="#-system-architecture--data-pipelines">Architecture & Pipelines</a> •
    <a href="#-visual-showcase--screen-gallery">Visual Showcase</a> •
    <a href="#-deep-dive-domain-modules">Domain Modules Deep Dive</a> •
    <a href="#-99-route-enterprise-manifest">99-Route Manifest</a> •
    <a href="#-state-management--resilient-api-pipeline">API Pipeline</a> •
    <a href="#-design-system--tokens">Design System</a> •
    <a href="#-production-benchmarks--deployment">Deployment</a>
  </p>
</div>

---

## 📊 Executive Overview & System Scale

**HOSTEL-PRO ERP** is an enterprise-grade, multi-tenant campus operations and residential living platform engineered to manage complex university housing facilities, high-concurrency student life workflows, double-entry multi-fund financial accounting, and capital project operations.

```text
========================================================================================
                                SYSTEM SCALE & METRICS
========================================================================================
 [✓] 99 App Router Routes        — 100% Pre-rendered or Server-Hydrated across 7 Workers
 [✓] 8 Core Enterprise Domains   — Housing, Dining, Security, Finance, Advising, Wages, WBS
 [✓] 5-Segment CoA Ledger        — GASB 34/35 Multi-Fund Accounting (Funds 10, 20, 30, 40, 50)
 [✓] Real-Time Encumbrance       — Available = Budget - Actuals - PreEncumbered - Encumbered
 [✓] Prerequisite DAG Engine     — High-concurrency atomic seat locking with TTL hold queues
 [✓] Double-Blind Exam Engine    — Independent Dual Evaluation with automated >5% variance arbitration
 [✓] EHS Hazardous Waste Matrix  — OSHA/GHS reactive chemical matrix & EPA 8700-22 Manifests
 [✓] Construction WBS & RA Bills — Work Breakdown Structure, BOQ measurement & CIP capitalization
========================================================================================
```

---

## 🏛️ System Architecture & Data Pipelines

```text
                                       ┌────────────────────────────────────────┐
                                       │       Client Presentation Layer        │
                                       │   Next.js 14 (App Router / RSC / SSR)  │
                                       └───────────────────┬────────────────────┘
                                                           │
                                   ┌───────────────────────┴───────────────────────┐
                                   ▼                                               ▼
                    ┌─────────────────────────────┐                 ┌─────────────────────────────┐
                    │    Zustand Store Engine     │                 │   Resilient API Pipeline    │
                    │  • Auth & Cross-Tab Sync    │                 │  • JWT Bearer Interceptor   │
                    │  • UI Sidebar & Drawer State│                 │  • Silent Mock Fallback     │
                    │  • Live Telemetry Caches    │                 │  • Zero-Leak Error Boundary │
                    └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                                   │                                               │
                                   └───────────────────────┬───────────────────────┘
                                                           │ HTTPS / REST (Clean Envelopes)
                                                           ▼
                                       ┌────────────────────────────────────────┐
                                       │          REST API & Switchboard        │
                                       │      (Express.js / Node.js Cluster)    │
                                       └───────────────────┬────────────────────┘
                                                           │
                               ┌───────────────────────────┴───────────────────────────┐
                               ▼                                                       ▼
                ┌─────────────────────────────┐                         ┌─────────────────────────────┐
                │   Campus & Living Engine    │                         │  Finance & Ledger Engine    │
                ├─────────────────────────────┤                         ├─────────────────────────────┤
                │ • Block / Room / Bed Tree   │                         │ • GASB 34/35 5-Segment GL   │
                │ • Mess Meal Subscriptions   │                         │ • Encumbrance Hard/Soft Gate│
                │ • Digital Gate Out-Passes   │                         │ • P2P 3-Way Match Tolerances│
                │ • Daily Wages Muster Rolls  │                         │ • WBS / RA Bill Retentions  │
                └──────────────┬──────────────┘                         └──────────────┬──────────────┘
                               │                                                       │
                               └───────────────────────────┬───────────────────────────┘
                                                           ▼
                                       ┌────────────────────────────────────────┐
                                       │         Storage & Persistence          │
                                       │      MongoDB Atlas Multi-Tenant DB     │
                                       └────────────────────────────────────────┘
```

---
 

## 🔬 Deep Dive: Domain Modules

### 1. 🏢 Dormitory Block & Bed Hierarchy Engine (`/rooms`, `/rooms/[id]`, `/rooms/new`)
- **4-Tier Allocation Tree**: `Campus Building -> Dormitory Block -> Floor Level -> Room Number -> Individual Bed Index`.
- **Dynamic Policy Assignment**: Automatic bed allocation based on gender isolation, academic seniority, disability accessibility requirements, and student roommate pairing preferences.
- **Checkout Clearance Engine**: Multi-signoff checklist (Warden, Electrician, Linen Inventory, Bursar Deposit Refund) before releasing caution money.

### 2. 🍽️ Mess Logistics & Turnstile Gate Attendance (`/mess`, `/mess/[id]`, `/mess/new`)
- **Meal Subscription Management**: Full Board (Breakfast, Lunch, Snacks, Dinner), Day Scholar Flexi-Plan, and Special Medical/Dietary packages.
- **Anti-Proxy Turnstile Verification**: QR token and biometric validation preventing duplicate meal scans within the same dining window.
- **Dry/Perishable Kitchen Inventory**: FIFO stock consumption tracking linked to daily meal headcounts.

### 3. 🛡️ Security, Digital Gate Passes & Curfews (`/security`, `/incidents`, `/grievances`)
- **Gate Pass Lifecycle**: Student out-pass submission $\rightarrow$ Automated parent SMS confirmation $\rightarrow$ Warden digital signoff $\rightarrow$ Security gate scan with timestamped check-out/in.
- **Overdue Return Engine**: Automatic escalation flags when a student exceeds approved curfew hours without authorized extension.
- **Incident & Infraction Logs**: Disciplinary tribunal tracking, penalty assessments, and parent notification audit trail.

### 4. 💰 Multi-Fund Financial Accounting & Encumbrances (`/budget`, `/fees`, `/accounting/*`)
- **5-Segment Dimensional Accounting**: Real-time isolation across 5 institutional funds:
  - **Fund 10**: General Operating & Student Rent
  - **Fund 20**: Research Grants & Sponsored Labs
  - **Fund 30**: Endowments & Institutional Trusts
  - **Fund 40**: Capital Projects, Dormitory Construction & Expansion
  - **Fund 50**: Auxiliary Services (Mess, Cafeteria, Transport Fleet)
- **Real-Time Encumbrance Formula**:
  $$\text{Available Balance} = \text{Authorized Budget} + \text{Transfers} - \text{Actuals} - \text{PreEncumbered} - \text{Encumbered}$$
- **Hard & Soft Stop Gates**: Hard-stop blocks PO approval if available balance $< \$0$; soft-stop triggers Dean/CFO override escalation.

### 5. 👷 Daily Workers & Wage Muster System (`/daily-wages`)
- **Skill-Grade Wage Cards**: Unskilled (Sweepers/Cleaners), Semi-Skilled (Mess Helpers), and Skilled (Electricians, Plumbers, Masonry).
- **Muster Attendance Rolls**: Shift logging with morning check-in and evening checkout verification.
- **Wage Slip Engine**: Automated calculation of base daily wage + overtime multipliers $-$ cash advance recoveries $=$ net payable cash slip.

### 6. 🏗️ Construction & Capital Projects WBS (`/construction`)
- **Work Breakdown Structure (WBS)**: Multi-level hierarchy tracking Foundation, Structural Framework, Masonry, MEP (Mechanical, Electrical, Plumbing), and Finishing.
- **Running Account (RA) Bills**: Certified contractor item measurements against Bill of Quantities (BOQ) with automatic retention money deduction (5-10%) and tax withholding.
- **CIP Capitalization**: Automatic transfer from Construction-In-Progress (CIP) to Fixed Asset subledgers upon Engineer-In-Charge commissioning signoff.

### 7. 🎓 Academic Advising, Seat Locks & Degree Audit (`/advising`, `/courses`)
- **High-Concurrency Seat Locking**: In-memory atomic hold reservation with 15-minute TTL locks and automatic FIFO waitlist cascade upon drop.
- **Prerequisite DAG Graph**: Recursive dependency tree evaluation ensuring all prerequisite and co-requisite requirements are satisfied prior to enrollment.

### 8. 📝 Double-Blind Examination Marks Entry (`/exams`, `/grades`)
- **Dual Blind Scorer Masking**: First Evaluator and Second Evaluator score independently against masked dummy roll tokens.
- **5% Discrepancy Adjudication**: If $|\text{Score}_1 - \text{Score}_2| > 5\%$, the system automatically locks the grade and routes the script to the Department Chair / 3rd Arbiter for final resolution.

---

## 🗺️ 99-Route Enterprise Manifest

Below is the complete route tree rendered and verified across the application:

```text
Route (app)                                     Access Level            Primary Domain
┌ ○ /                                           Public                  Landing Portal
├ ○ /about                                      Public                  Institutional Profile
├ ○ /pricing                                    Public                  Fee Schedules & Plans
├ ○ /showcase                                   Public                  Interactive Showcase
├ ○ /demo                                       Public                  Interactive Sandbox
├ ○ /login                                      Public                  Authentication Gateway
├ ○ /signup                                     Public                  Applicant Registration
├ ○ /dashboard                                  Authenticated           Multi-Role Operations Hub
├ ○ /switchboard                                Super-Admin             Governance & Impersonation
│
│ ── [ CAMPUS & HOSTEL OPERATIONS ] ────────────────────────────────────────────────────────
├ ○ /rooms                                      Admin / Warden          Dormitory Blocks & Floors
├ ƒ /rooms/[id]                                 Admin / Warden          Room & Bed Detail View
├ ○ /rooms/new                                  Admin                   Add Room / Bed Unit
├ ○ /mess                                       Staff / Students        Mess Menu & Plans
├ ƒ /mess/[id]                                  Staff                   Meal Plan Detail
├ ○ /mess/new                                   Staff                   Create Meal Subscription
├ ○ /security                                   Admin / Security        Gate Passes & Curfews
├ ƒ /security/[id]                              Security                Gate Pass Verification
├ ○ /security/new                               Student                 Request Out-Pass
├ ○ /incidents                                  Admin / Warden          Disciplinary Incidents
├ ƒ /incidents/[id]                             Warden                  Incident Review
├ ○ /incidents/new                              All                     File Incident Report
├ ○ /grievances                                 All                     Student Grievance Queue
├ ƒ /grievances/[id]                            Admin                   Grievance Resolution
├ ○ /grievances/new                             Student                 Submit Grievance
├ ○ /transport                                  Staff / Students        Campus Shuttle Routes
├ ƒ /transport/[id]                             Staff                   Vehicle Detail View
├ ○ /transport/new                              Admin                   Register Shuttle Fleet
│
│ ── [ FINANCE, BUDGET & CAPITAL WBS ] ─────────────────────────────────────────────────────
├ ○ /budget                                     Finance Admin           GASB 34/35 Multi-Fund Budget
├ ○ /expenses                                   Finance Admin           Operating Expenses & AP
├ ○ /receipts                                   Finance Admin           Bursar AR & Collections
├ ○ /fees                                       Finance Admin           Cohort Fee Schedules
├ ○ /accounting/chart-of-accounts               Finance Admin           5-Segment Chart of Accounts
├ ○ /accounting/journals                        Finance Admin           Double-Entry Journal Engine
├ ○ /accounting/reports                         Finance Admin           Balance Sheet & Fund Summary
├ ○ /accounting/subledgers                      Finance Admin           Vendor & Student Subledgers
├ ○ /construction                               Finance / Engineer      Capital Projects WBS & RA
├ ○ /daily-wages                                Staff / Supervisor      Daily Worker Muster Rolls
├ ○ /procurement                                Admin / Staff           P2P Purchase Requisitions
├ ○ /requisitions                               Staff                   Internal Store Requests
├ ○ /scholarships                               Finance / Admin         Scholarship Stacking
│
│ ── [ ACADEMIC ADVISING & SIS ] ───────────────────────────────────────────────────────────
├ ○ /advising                                   Faculty / Student       Course Advising & Seat Locks
├ ○ /courses                                    All                     Master Course Catalog
├ ƒ /courses/[id]                               All                     Course Detail & Syllabus
├ ○ /curriculum                                 Faculty / Admin         Degree Program Trees
├ ○ /enrollment                                 Registrar               Section Rosters & Drops
├ ○ /exams                                      Faculty / Exam Office   Double-Blind Exam Entry
├ ○ /grades                                     Faculty / Registrar     UGC 4.0 Grade Tabulation
├ ○ /transcripts                                Registrar               Official Academic Records
├ ○ /academic-calendar                          All                     Semester Milestones
├ ○ /timetable                                  Faculty / Students      Class & Exam Schedules
├ ○ /routines                                   All                     Weekly Schedule Grid
├ ○ /semesters                                  Admin                   Term & Cohort Setup
├ ○ /departments                                Admin                   Academic Departments
│
│ ── [ HUMAN CAPITAL & STUDENT LIFE ] ──────────────────────────────────────────────────────
├ ○ /students                                   Faculty / Admin         Student Master Records
├ ƒ /students/[id]                              Faculty / Admin         360° Student Profile
├ ○ /students/register                          Admin                   New Student Registration
├ ○ /faculties                                  Admin                   Faculty Workload Directory
├ ƒ /faculties/[id]                             Admin                   Faculty Dossier
├ ○ /staff                                      Admin                   Support Staff Directory
├ ○ /payroll                                    Finance / HR            Staff Payroll & Payslips
├ ○ /leave                                      All                     Leave Management
├ ○ /attendance                                 Faculty / Warden        Student & Worker Attendance
├ ○ /parents                                    Admin / Warden          Parent Portal Links
├ ○ /alumni                                     Public / Admin          Alumni Directory & Network
│
│ ── [ HEALTH, SAFETY & FACILITIES ] ───────────────────────────────────────────────────────
├ ○ /health-center                              Medical Staff           Campus Clinic OPD/IPD
├ ƒ /health-center/[id]                         Medical Staff           Patient Clinical Record
├ ○ /health-center/new                          Medical Staff           New Patient Intake
├ ○ /laboratory                                 Lab Faculty             Lab Equipment & EHS Waste
├ ƒ /laboratory/[id]                            Lab Faculty             Chemical Drum Manifest
├ ○ /laboratory/new                             Lab Faculty             Register Hazardous Waste
├ ○ /pharmacy                                   Pharmacist              Dispensary & Stock
├ ƒ /pharmacy/[id]                              Pharmacist              Medication Detail
├ ○ /pharmacy/new                               Pharmacist              Add Medicine SKU
├ ○ /blood-bank                                 Medical Staff           Donor & Unit Tracking
├ ○ /clinical                                   Faculty / Students      Clinical Rotation Logs
├ ○ /logbook                                    Students                Bedside Procedure Logs
├ ƒ /logbook/[id]                               Faculty                 Preceptor Verification
├ ○ /logbook/new                                Student                 Log Clinical Case
│
│ ── [ PLATFORM TOOLS & GOVERNANCE ] ───────────────────────────────────────────────────────
├ ○ /admin                                      Super-Admin             Institutional Administration
├ ○ /users                                      Admin                   User Directory & RBAC
├ ○ /settings                                   Authenticated           User & Theme Preferences
├ ○ /profile                                    Authenticated           Personal Account Info
├ ○ /chat                                       Authenticated           Internal Messaging
├ ○ /notifications                              Authenticated           System Notification Center
├ ○ /notices                                    All                     Official Circulars
├ ○ /activity-log                               Admin                   Immutable Audit Trail
├ ○ /audit                                      Super-Admin             Compliance Verification
├ ○ /accreditation                              Admin                   Quality Assurance & Metrics
├ ○ /career                                     Students                Internship & Placement Board
├ ○ /digital-locker                             Students                Verified Document Vault
├ ○ /disciplinary                               Admin                   Disciplinary Records
├ ○ /feedback                                   All                     Institutional Surveys
├ ○ /iot                                        Admin / Engineer        Smart Meters & Sensors
├ ○ /library                                    Staff / Students        Library Catalog & Circulation
├ ○ /lms                                        Faculty / Students      Courseware & LMS Content
├ ○ /study-materials                            Students                Lecture Notes Repository
├ ○ /syllabus                                   All                     Course Outlines
├ ○ /telemedicine                               Medical Staff           Remote Consultations
├ ○ /development                                Admin                   Developer Sandbox
├ ƒ /icon                                       Edge Dynamic            High-Resolution Tab Favicon
└ ƒ /apple-icon                                 Edge Dynamic            High-DPI Mobile Touch Icon
```

---

## ⚙️ State Management & Resilient API Pipeline

### 1. Cross-Tab Synchronized Zustand Store (`useAuthStore.ts`)
```typescript
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  activeRole: UserRole;
  impersonatingAs?: UserProfile | null;
  login: (credentials: LoginInput) => Promise<void>;
  switchRole: (role: UserRole) => void;
  impersonateUser: (targetUser: UserProfile) => void;
  revertImpersonation: () => void;
  logout: () => void;
}
```

### 2. Silent Gated Mock Fallback Architecture (`client.ts`)
The API layer guarantees **100% application stability and zero console pollution**:
- **Automatic Bearer Token Injection**: Attaches JWT tokens from synchronized browser storage to every outgoing HTTP call.
- **Silent Fallback Engine**: If backend services are restarting or unreachable, the client smoothly activates structured mock fallbacks without leaking raw API URLs, query keys, or stack traces into the browser console.
- **Serverless Resilience**: Handles dynamic cold starts on Vercel without throwing disruptive crashes to users.

---

## 🎨 Design System & Custom Tokens

The frontend uses an enterprise-tailored design system configured in [`tailwind.config.ts`](file:///c:/projects/Next%20Level%20Web%20Developer/MedicalCollegeERP/MedicalCollegeERP/frontend/tailwind.config.ts) and [`globals.css`](file:///c:/projects/Next%20Level%20Web%20Developer/MedicalCollegeERP/MedicalCollegeERP/frontend/src/app/globals.css):

### Color Palette Matrix
- **Primary Cyan / Teal** (`#0284c7`, `#38bdf8`): Used for primary interactions, active tabs, and telemetry indicators.
- **Gold / Amber** (`#d97706`, `#f59e0b`): Used for financial balances, caution deposits, and warden clearance alerts.
- **Obsidian Dark / Slate** (`#070D14`, `#0F172A`): Deep glassmorphic backgrounds with `backdrop-filter: blur(16px)`.
- **Status Tone Matrix**:
  - `success`: Emerald (`#10b981`) — Verified allocations, paid invoices, clear gate passes.
  - `warning`: Amber (`#f59e0b`) — Pending warden reviews, curfew warnings, soft-stop budgets.
  - `danger`: Rose (`#f43f5e`) — Hard-stop over-encumbrances, overdue returns, disciplinary flags.
  - `info`: Sky (`#0ea5e9`) — System broadcasts, timetable notices, room transfer queues.

---

## ⚡ Production Benchmarks & Deployment

### Build Verification Results
```bash
$ next build --webpack
▲ Next.js 16.2.9 (webpack)
✓ Compiled successfully in 58.0s
✓ Finished TypeScript in 21.0s
✓ Generated static pages across 7 workers (99/99) in 4.0s
✓ Dynamic Edge Icon endpoints (/icon, /apple-icon) generated
✓ Output: 0 compilation errors, 0 lint warnings
```

### Vercel Serverless Deployment Configuration
1. **Repository**: Push the `frontend/` directory to your GitHub repository.
2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```
3. **Deployment Settings**:
   - **Framework Preset**: Next.js
   - **Node.js Version**: 20.x
   - **Root Directory**: `frontend`

---

## 🔑 Interactive Demo Personas

| Persona | Email | Password | Institutional Permissions |
|---|---|---|---|
| **Super Admin** | `super.admin@college.edu` | `Demo@123` | Institutional Switchboard, RBAC, System Audit, Full Governance |
| **Hostel Warden / Staff** | `faculty.admin@college.edu` | `Demo@123` | Block Allotment, Gate Pass Approvals, Curfew & Muster Roll Management |
| **Finance Officer** | `finance.admin@college.edu` | `Demo@123` | Multi-Fund Ledger, Encumbrance Gate, WBS Bills, Fee Collections |
| **Resident Student** | `demo.student@erp.demo` | `Demo@123` | Room Allocation Status, Digital Out-Pass Requests, Mess Subscriptions |

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for details.
