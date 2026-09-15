<div align="center">

# EDU-ERP

### Medical College Management System — Frontend

A comprehensive, role-based ERP for medical colleges — managing academics, students, clinical operations, finance, and campus life in one unified platform.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

</div>

---

## Features

**50+ modules** across 7 functional areas, built with role-based access control (RBAC) for students, faculty, staff, and administrators.

| Area | Modules |
|------|---------|
| **Academics** | Semesters, Faculty Directory, Course Catalog, Departments, Attendance, Exams & Grades, Timetable, Academic Calendar, Transcripts, Curriculum, Syllabus, Research, Accreditation |
| **Students** | Student Directory, Student Onboarding, Admissions, Enrollment, Scholarships, Leave Management |
| **Clinical** | Health Center, Clinical & Counseling, OPD, IPD, Laboratory, Pharmacy, Logbook, Skill Lab |
| **Finance** | Fees & Ledger, Receipts (PDF), Payroll, Expenses, Budget |
| **Campus Life** | Dorms & Rooms, Mess & Meals, Transport, Library, Study Materials, Security Desk, Grievances, Maintenance Desk, Notices, Alumni, Parent Portal |
| **Communication** | Notifications, Chat, Activity Log |
| **Administration** | User Management, Audit Trail, Reports, Settings |

### Key Highlights

- **Firebase Authentication** — Secure login with email/password
- **Role-Based Access** — Students see only their data; staff see their domain; admins see everything
- **Collapsible Sidebar** — 7 organized sections with active-route highlighting
- **Command Palette** — `Cmd+K` / `Ctrl+K` for instant navigation
- **Dashboard** — KPI cards, charts, activity feed, and quick actions
- **PDF Receipts** — Generate and download payment receipts via jsPDF
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Accessible** — Reduced motion support, keyboard navigation

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Server State | [TanStack React Query 5](https://tanstack.com/query) |
| Authentication | [Firebase Auth](https://firebase.google.com/docs/auth) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| PDF Generation | [jsPDF](https://www.npmjs.com/package/jspdf) |
| HTTP Client | [Axios](https://axios-http.com/) |
| Real-time | [Socket.io Client](https://socket.io/) |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** / **yarn** / **pnpm**
- **Backend API** running (see [EDU-ERP-SERVER](https://github.com/iamafridi/EDU-ERP-SERVER))

### Installation

```bash
# Clone the repository
git clone https://github.com/iamafridi/EDU-ERP-CLIENT.git
cd EDU-ERP-CLIENT

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Configuration (Client SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Demo accounts UI (login demo panel, header role switcher, /demo guide).
# Enabled automatically in development. REQUIRED to be set explicitly for a
# production build, otherwise the demo UI is omitted from the bundle entirely.
NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true
```

> **Note:** Never commit `.env.local` to version control. It is already in `.gitignore`.

---

## Demo Accounts

The backend seed creates the accounts used for client demonstrations and prints
them to the console on every start:

```bash
cd ../backend && npm run dev
```

The seed **clears the database first**, so each restart produces a clean, known
dataset. Two things to know when presenting:

1. **The role selected at login is part of the credential.** The backend rejects a
   sign-in whose selected role does not match the account's stored role.
2. **`View-Only` accounts are blocked from writes** by the backend `demoGuard` and
   show an amber banner in the app. All other demo accounts have full write access.

Every account is defined in one place, `src/config/demoAccounts.ts`, which drives
the login demo panel, the header role switcher and the `/demo` guide. That file is
also the single source of truth for the shared demo password.

> For a production build, set `NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true` to expose the
> demo UI, or leave it unset to ship without it.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Webpack mode) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # All dashboard routes
│   │   ├── academics/        # Academic management
│   │   ├── students/         # Student management
│   │   ├── health-center/    # Clinical operations
│   │   ├── fees/             # Finance module
│   │   ├── mess/             # Campus life
│   │   ├── settings/         # App settings
│   │   └── ...               # 50+ route modules
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   ├── providers.tsx         # Query client provider
│   └── globals.css           # Global styles + Tailwind
│
├── components/
│   ├── dashboard/            # Layout, Sidebar, Navbar, CommandPalette
│   ├── ui/                   # DataTable, Skeleton, Toast, Can (RBAC)
│   └── receipt/              # PDF receipt generator
│
├── hooks/                    # usePermission, useKeyboardShortcut, useReducedMotion
├── lib/                      # Firebase config, Query client
├── services/                 # API layer (Axios)
└── store/                    # Zustand stores (auth, layout, toast)
```

---

## Role-Based Access

The app supports multiple user roles with granular permissions:

| Role | Access Level |
|------|-------------|
| `super-admin` | Full system access |
| `domain-admin` | Admin for specific domain (academic, finance, clinical, etc.) |
| `staff` | Department-level access based on sub-role |
| `faculty` | Course and student management |
| `student` | Own profile, grades, fees, leave applications |

---

## Contributing

This is a private project. For internal contributors:

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm test`
4. Submit a pull request

---

## License

This project is private and proprietary. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
