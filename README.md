# College Fee Management System
**Institution:** Kalasalingam Academy of Research and Education (Deemed to be University)  
**Portal:** Academic & Finance Enterprise Resource Planning (ERP)

---

## 1. Project Purpose
The **College Fee Management System** is a production-grade, responsive academic ERP application designed to streamline student fee billing, auxiliary facility charges (hostel, mess, transport), real-time collection reconciliation, and multi-gateway payment simulation.

The system caters to three primary roles:
- **Students:** View fee structures, semester payment ledgers, real-time pending dues, overdue calculations with late fees, make simulated UPI/Card/NetBanking payments, verify official receipts, and receive deadline notifications.
- **Administrators:** Full management of students, courses, departments, fee structures with semester duplication, late fee rule engines, scholarships, institutional reports, and broadcasts.
- **Accounts & Finance Staff:** Monitor collection velocities, student balance sheets, payment reconciliations, and issue immediate student fee reminders.

---

## 2. Demo Credentials

### Student Portals
| Registration No | Password | Notes |
| :--- | :--- | :--- |
| `2026CSE001` | `student123` | Aarav Sharma (B.Tech CSE, Sem 5, Hostel Resident, Partial Paid) |
| `2026CSE002` | `student123` | Priya Patel (B.Tech CSE, Sem 5, Merit Scholarship ₹25,000, Bus Route) |
| `2026ECE001` | `student123` | Rohan Verma (B.Tech ECE, Sem 4, Overdue Fees with Late Charges) |
| `2026EEE001` | `student123` | Sneha Nair (B.Tech EEE, Sem 6, Day Scholar) |
| `2026IT001` | `student123` | Karthik Iyer (B.Tech IT, Sem 3, Fully Settled) |
| `2026BCA001` | `student123` | Ananya Das (BCA, Sem 2, Partial Paid) |
| `2026BBA001` | `student123` | Vikram Singh (BBA, Sem 4, Overdue Balance) |
| `2026MCA001` | `student123` | Meera Krishnan (MCA, Sem 3, Sports Concession ₹15,000) |
| `2026MECH001` | `student123` | Aditya Joshi (B.Tech Mech, Sem 7, Need-based Concession) |
| `2026CIVIL001` | `student123` | Divya Reddy (B.Tech Civil, Sem 8, Transport Pass) |

### Administrative & Accounts Staff
| Role | Identifier / Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | Full access: Students, Courses, Depts, Fee Structures, Late Fees, Settings |
| **Accounts Staff** | `accounts` | `accounts123` | Finance scope: Ledgers, Payments, Receipts, Pending Dues, Reports |

*(Tip: You can also use the **"Demo Role"** switcher pill in the top navigation bar to switch between test personas in 1 click).*

---

## 3. Dynamic Fee Calculations (Section 32 Compliance)
All financial figures across Student and Admin views are calculated dynamically from underlying sample ledger entries rather than being hardcoded:

1. **Total Fee:**  
   $$\text{Total Fee} = \sum \text{Fee Components}$$
2. **Net Fee:**  
   $$\text{Net Fee} = \max(0, \text{Total Fee} - \text{Approved Scholarship/Concession})$$
3. **Pending Fee:**  
   $$\text{Pending Fee} = \max(0, \text{Net Fee} - \text{Total Paid})$$
4. **Late Fee (Dynamic Surcharge Engine):**  
   Evaluates billable overdue days past configured grace period (default 7 days) and applies flat or slab surcharge up to maximum ceiling.
5. **Outstanding Amount:**  
   $$\text{Outstanding Amount} = \text{Pending Fee} + \text{Applicable Late Fee}$$
6. **Collection Percentage:**  
   $$\text{Collection \%} = \left(\frac{\text{Total Paid}}{\text{Net Fee}}\right) \times 100$$

---

## 4. Main Features
- **Student Dashboard:** Profile summary, 5 KPI cards (Total Fees, Paid, Pending, Overdue, Next Due Date), progress bar, recent payments, pending breakdown.
- **Student Profile:** Complete Personal, Academic, Guardian, and Hostel/Transport records with administrative lock notice.
- **Itemized Fee Structure:** Course and semester-level tuition, lab, library, examination, and auxiliary breakdown with automatic totals.
- **Semester Progression:** Expandable accordion tracking Semesters 1 to 8.
- **Simulated Payment Gateway:** Multi-channel checkout (UPI VPA/QR, Debit Card, Credit Card, Net Banking) with real-time pending balance validation and simulated 256-bit SSL transaction latency.
- **Verifiable Receipts:** Official receipt generator with college crest, student meta, itemized breakdown, QR code verification mark, and clean CSS `@media print` layout.
- **Student Management (Admin):** Full CRUD for students, search across multiple fields, and course/department filters.
- **Course & Department Management:** Manage academic programs, semesters, intakes, and HOD contacts.
- **Fee Structure Management:** Add, edit, remove fee heads, and clone/duplicate fee structures between semesters.
- **Scholarship & Concession Desk:** Merit, Need-based, Sports, and Government concessions with immediate balance deductions.
- **Late Fee Rules Engine:** Configurable grace period, flat/percentage/daily slab calculations, and live impact preview.
- **Hostel & Transport Auxiliary:** Separate tracking of hostel rent, mess bills, security deposits, and bus route passes.
- **10 Institutional Reports:** Student Fee, Daily Collection, Monthly Collection, Semester Collection, Pending Fee, Overdue Fee, Course-wise, Department-wise, Payment Method, and Academic Year reports with CSV export and print preview.
- **Broadcast Notices:** Target individual students, semesters, departments, courses, or the entire student body.

---

## 5. Folder Structure
```
college-fee-management/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfirmDialog.tsx       # Reusable delete/action confirmation modal
│   │   │   ├── FeeStatusBadge.tsx      # Status pills (PAID, OVERDUE, PENDING, etc.)
│   │   │   ├── PaymentModal.tsx        # Multi-gateway simulated checkout modal
│   │   │   ├── ReceiptModal.tsx        # Printable official fee receipt modal
│   │   │   └── StatCard.tsx            # KPI metric cards with trends & icons
│   │   └── layout/
│   │       ├── Navbar.tsx              # Top branding, demo role switcher, notifications
│   │       └── Sidebar.tsx             # Role-based collapsible navigation
│   │
│   ├── context/
│   │   └── AppContext.tsx              # Auth, state reactivity, modals & settings provider
│   │
│   ├── data/
│   │   └── initialData.ts              # 10+ realistic students, courses, fee structures, receipts
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx           # Multi-role login with quick credential autofills
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx    # Welcome card, 5 KPIs, fee progress, quick pay
│   │   │   ├── StudentProfile.tsx      # Personal, academic, guardian, facility details
│   │   │   ├── FeeStructurePage.tsx    # Course/Semester itemized fee schedule
│   │   │   ├── SemesterFeesPage.tsx    # Semesters 1 to 8 expandable progression
│   │   │   ├── PendingFeesPage.tsx     # Unsettled dues, aging days, late fees
│   │   │   ├── MakePaymentPage.tsx     # Online payment counter with gateway selector
│   │   │   ├── PaymentHistoryPage.tsx  # Filterable transaction audit log
│   │   │   ├── FeeReceiptsPage.tsx     # Verifiable receipts table with print/download
│   │   │   └── NotificationsPage.tsx   # Due date alerts, receipts, announcements
│   │   └── admin/
│   │       ├── AdminDashboard.tsx      # Recovery velocity, KPI metrics, dept progress
│   │       ├── StudentsManagement.tsx  # Students CRUD, search, filter, view details
│   │       ├── CourseManagement.tsx    # Degree courses, intake, duration
│   │       ├── DepartmentManagement.tsx# Academic departments, HODs, contacts
│   │       ├── FeeStructureManagement.tsx # Fee heads, semester structure cloner
│   │       ├── StudentFeeManagement.tsx# Overall student fee ledgers, fee assignment
│   │       ├── PaymentManagement.tsx   # All college-wide payments log
│   │       ├── PendingFeeManagement.tsx# Highest-pending recovery, bulk alerts
│   │       ├── ScholarshipManagement.tsx# Grant and approve merit/need concessions
│   │       ├── LateFeeManagement.tsx   # Grace period and penalty engine
│   │       ├── HostelTransportManagement.tsx # Hostel rooms & bus passes
│   │       ├── ReportsPage.tsx         # 10 audit reports, CSV export, print
│   │       ├── AdminNotificationsPage.tsx # Notice broadcaster & dispatcher
│   │       └── SettingsPage.tsx        # College identity, academic year, resets
│   │
│   ├── services/
│   │   └── dataService.ts              # Data abstraction layer, local storage, calculations
│   │
│   ├── types/
│   │   └── index.ts                    # TypeScript models matching future DB entities
│   │
│   ├── utils/
│   │   ├── calculations.ts             # Dynamic financial formulas (Section 32)
│   │   └── formatters.ts               # Currency (₹ INR), date, ID generators
│   │
│   ├── App.tsx                         # Main router & layout container
│   ├── index.css                       # Tailwind v4 setup & print styles
│   └── main.tsx                        # React 19 entry point
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 6. How to Run Locally in Visual Studio Code

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm or yarn

### Steps
1. Open the project folder in Visual Studio Code:
   ```bash
   cd college-fee-management
   code .
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 7. Future Java + JDBC + MySQL Architecture Mapping
The frontend is strictly decoupled through `src/services/dataService.ts` and `src/types/index.ts`. When migrating to an enterprise Java backend, the TypeScript entities map 1:1 to Java Model and DAO layers:

```
Frontend (React 19 / TypeScript)
       ↓ (HTTP REST / JSON / Spring Boot)
Controllers (StudentController.java, FeeController.java, PaymentController.java)
       ↓
Services (FeeCalculationService.java, PaymentService.java, LateFeeRuleService.java)
       ↓
Data Access Objects (DAO / Repository interfaces)
       ↓
JDBC / Hibernate / JPA
       ↓
MySQL Relational Database (InnoDB)
```

### Future Java Model Classes:
- `model.Student` $\rightarrow$ `src/types/index.ts: Student`
- `model.Course` $\rightarrow$ `src/types/index.ts: Course`
- `model.Department` $\rightarrow$ `src/types/index.ts: Department`
- `model.FeeStructure` $\rightarrow$ `src/types/index.ts: FeeStructureItem`
- `model.StudentFee` $\rightarrow$ `src/types/index.ts: StudentFeeItem`
- `model.Payment` $\rightarrow$ `src/types/index.ts: PaymentItem`
- `model.FeeReceipt` $\rightarrow$ `src/types/index.ts: FeeReceiptItem`
- `model.Scholarship` $\rightarrow$ `src/types/index.ts: Scholarship`
- `model.LateFeeConfig` $\rightarrow$ `src/types/index.ts: LateFeeConfig`
