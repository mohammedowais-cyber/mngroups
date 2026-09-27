# MN Groups — Property Maintenance App: Build Brief for Antigravity

This is a handoff package for an agentic IDE (e.g. Google Antigravity) to scaffold the
real, installable version of this system. It distills two sources:
1. `MN_GROUPS_Property_Maintenance_Blueprint_With_Mockups.pdf` — the original business
   requirements document.
2. `mn-groups-app.html` — a clickable web prototype that already implements the
   workflow, screens, and data model end to end (open it in a browser to click through
   every screen before building).

## 1. What to build

A Flutter mobile app (Tenant + Vendor experiences) and a React web portal (Admin/Property
Manager), backed by a Node.js or FastAPI API and PostgreSQL, per the blueprint's tech
stack. The HTML prototype is a faithful reference for screens, states, and copy — treat
it as the source of truth for UX, not a throwaway mockup.

## 2. Roles & screens (from the prototype)

**Tenant app**
- Home: property/unit header, open vs. completed counts, quick actions (raise
  complaint, call manager), recent requests list
- Raise complaint: category grid (11 categories), description field, photo attach
- Track: list of all requests with status badges
- Complaint detail: status timeline (Submitted → Assigned → In Progress → Completed →
  Closed), assigned vendor + phone, photos, star rating + feedback once vendor
  finishes, view of vendor's completion notes/photos
- Profile: tenant info, property + manager contact

**Vendor app**
- Jobs list: tabs for Assigned / In Progress / Done, counts per tab
- Job detail: tenant + property info, tenant's photos, actions: "Accept & start job" →
  "Submit completion report" (before/after photos, materials used, notes)

**Admin / property manager portal**
- Dashboard: KPIs (total properties, tenants, open complaints, closed this month +
  avg rating), 6-week raised-vs-closed trend chart, complaints-by-category donut,
  recent complaints table
- Complaints: full filterable table (status, category) → detail view
- Vendors: roster with categories handled, rating, active job count
- Properties / Tenants: directory views
- Placeholder nav items for Finance, Inventory, Documents, Settings (Phase 5 per the
  blueprint's roadmap — not built yet)

## 3. Data model (already implemented in the prototype's JS — mirror this in Postgres)

```
Property   { id, name, type[PG|Residential|Commercial], address, manager_name }
Tenant     { id, name, phone, property_id, unit }
Vendor     { id, name, phone, categories[], rating, jobs_done }
Category   { id, name, default_vendor_id }  -- Electrical, Plumbing, Carpentry,
             Painting, Cleaning, Civil Work, Internet, Air Conditioning,
             Appliances, Security, Other

Complaint  {
  id                -- format MC-YYYY-##### in the prototype
  tenant_id, property_id, unit, category_id
  description
  status            -- Submitted | Assigned | In Progress | Completed | Closed
  vendor_id
  created_at, assigned_at, started_at, completed_at, verified_at, closed_at
  before_photos[]   -- tenant-uploaded, at creation
  after_photos[]    -- vendor-uploaded, at completion
  materials_used
  completion_notes
  rating (1-5), feedback
}
```

Status transitions (state machine to implement server-side):
`Submitted → Assigned` (auto-assign by category → default vendor)
`Assigned → In Progress` (vendor accepts)
`In Progress → Completed` (vendor submits report: requires ≥1 after-photo + notes)
`Completed → Closed` (tenant verifies: requires a 1-5 rating)

## 4. API surface to scaffold

- `POST /complaints` (tenant raises; auto-assign vendor by category)
- `GET /complaints?tenant_id=` / `?vendor_id=` / `?status=&category=` (admin filters)
- `PATCH /complaints/:id/start` (vendor)
- `PATCH /complaints/:id/complete` (vendor: photos, materials, notes)
- `PATCH /complaints/:id/verify` (tenant: rating, feedback)
- `GET /dashboard/summary` (KPI + chart data for admin)
- Auth: role-based (Tenant / Vendor / Property Manager / Admin), per blueprint section
  "User Roles"
- Notifications: Firebase push on assignment, status change, completion (per blueprint)
- Photo storage: S3/Azure Blob equivalent, not embedded base64 (the prototype embeds
  base64 only because it has no backend)

## 5. What's out of scope for v1 (per blueprint's Phase 5 / Future Vision)

AI complaint categorization, predictive maintenance, digital agreements, rent
collection, BI dashboards — build the core workflow first.

## 6. Suggested prompt to paste into Antigravity

> Build a Flutter app with two flows (Tenant, Vendor) and a React admin web portal,
> backed by a FastAPI + PostgreSQL API, implementing the property-maintenance workflow
> described in ANTIGRAVITY_BUILD_BRIEF.md. Use mn-groups-app.html as the UX/screen
> reference — replicate its screens, states, and copy, but wire them to real API calls
> and a Postgres database instead of localStorage. Start by scaffolding the Postgres
> schema and FastAPI endpoints from section 3–4 of the brief, then build the Flutter
> tenant flow, then the vendor flow, then the React admin dashboard. Use Firebase for
> push notifications and S3-compatible storage for photos. Set up an Android build
> (Gradle) so I can generate a signed APK once the tenant flow is working end to end.

## 7. Files to bring into the Antigravity workspace

- `MN_GROUPS_Property_Maintenance_Blueprint_With_Mockups.pdf`
- `mn-groups-app.html`
- `ANTIGRAVITY_BUILD_BRIEF.md` (this file)
