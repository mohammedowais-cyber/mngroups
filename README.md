# MN GROUPS — Property Maintenance Management Platform

An end-to-end, multi-role property maintenance platform for **MN GROUPS** managing PG (paying guest), residential, and commercial rental properties across Bengaluru and Mumbai.

---

## System Architecture

```
MN Groups/
├── backend/                  # Node.js + TypeScript + PostgreSQL REST API
│   ├── src/
│   │   ├── db/               # PostgreSQL schema (schema.sql), seed data, PGlite/pg client
│   │   ├── routes/           # /complaints, /dashboard, /properties, /tenants, /vendors, /categories, /upload
│   │   ├── services/         # State machine validator, Push notifications dispatcher
│   │   └── server.ts         # Express server entrypoint (Port 4000)
│   └── test/
│       └── test_workflow.ts  # End-to-end lifecycle & negative validation test suite
│
├── admin-portal/             # React + Vite Admin & Property Manager Web Portal
│   ├── src/
│   │   ├── components/       # Topbar, Sidebar, TrendChart, CategoryChart, StatusBadge, ComplaintModal
│   │   ├── pages/            # Dashboard, Complaints, Vendors, Properties, Tenants
│   │   └── styles/           # Design system tokens (Space Grotesk + Inter)
│   └── vite.config.ts        # Vite dev server with /api proxy to backend (Port 3000)
│
└── mobile-app/               # Flutter Mobile App for Tenants and Vendors
    ├── lib/
    │   ├── models/           # Complaint, Property, Tenant, Vendor, Category Dart models
    │   ├── services/         # ApiService (HTTP client to backend API)
    │   ├── screens/
    │   │   ├── tenant/       # Home, Raise (11 categories), Track, Detail (5-step timeline & rating), Profile
    │   │   └── vendor/       # Jobs tabs (Assigned, In Progress, Done), Detail, Start & Complete report form
    │   └── main.dart         # Flutter entrypoint with instant role switching
    ├── android/              # Full Android Gradle build setup configured for signed APKs
    └── create-keystore.bat   # Script to generate release keystore and key.properties
```

---

## 1. Backend REST API & Database

### Prerequisites
- Node.js (v18+)
- Built-in embedded PostgreSQL (`PGlite`) runs out of the box with zero external setup, or connect external PostgreSQL via `DATABASE_URL`.

### Run the Backend
```bash
cd backend
npm install
npm start
```
- Server starts on `http://localhost:4000`
- API documentation & summary: `http://localhost:4000/dashboard/summary`
- Health check: `http://localhost:4000/health`

### Run Automated Tests
```bash
npm run test:workflow
```
Validates:
1. Auto-assigning vendor by category upon complaint submission (`Submitted` -> `Assigned`).
2. Negative test: rejection of invalid state transitions (skipping `In Progress`).
3. Vendor accepting job (`Assigned` -> `In Progress`).
4. Negative test: rejection of completion without after-photos or notes.
5. Vendor completion submission with photo, materials, and notes (`In Progress` -> `Completed`).
6. Negative test: rejection of verification without 1-5 star rating.
7. Tenant 5-star verification and review (`Completed` -> `Closed`).

---

## 2. React Admin & Property Manager Portal

### Run the Web Portal
```bash
cd admin-portal
npm install
npm run dev
```
- Open in your browser: `http://localhost:3000/`
- Includes:
  - **Dashboard**: KPI cards (Total Properties, Total Tenants, Open Complaints, Closed This Month + Avg Rating), 6-week trend line chart (Raised vs Closed), category breakdown doughnut chart, recent complaints table.
  - **Complaints**: Filterable table by status and category with search, click-to-modal with full audit timeline, before/after photos, vendor report, and tenant review.
  - **Vendors**: Roster with categories handled, star rating, jobs completed, active job counts.
  - **Properties & Tenants**: Complete site directories with manager contact cards.
  - **Later Phase Placeholders**: Finance, Inventory, Documents, Settings with user feedback alerts.

---

## 3. Flutter Mobile App (Tenant & Vendor)

### Run the Flutter App
```bash
cd mobile-app
flutter pub get
flutter run
```
Switch between **Tenant Experience** and **Vendor Experience** via the left drawer or persona dropdowns.

### Generate Signed Android APK
1. Run the keystore generator:
   ```bash
   create-keystore.bat
   ```
2. Build the signed release APK:
   ```bash
   flutter build apk --release
   ```
   The signed APK will be output at `build/app/outputs/flutter-apk/app-release.apk`.
