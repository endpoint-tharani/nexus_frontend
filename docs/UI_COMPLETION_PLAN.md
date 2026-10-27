# Payroll & Tax Web App — Professional UI Completion Plan

A complete, end-to-end roadmap to take the frontend from "mostly scaffolded" to a
polished, consistent, production-quality product.

The plan is **already organized into 3 self-contained parts** in dependency order.
Hand them back to me **one at a time, in order** (Part 1 → 2 → 3). Each part is
buildable on top of the previous one.

---

## 0. Current State (verified against the code)

**Already in place (strong foundation — keep it):**
- API layer (`src/api/*`), react-query hooks (`src/hooks/*`), zustand stores
  (auth, company), TS types, zod schemas.
- React Router with role-based guards (`AppRoutes.tsx`, `constants/navigation.ts`).
- MUI theme (`theme.ts`) + dashboard layout with collapsible sidebar (brand "Auronox").
- Pages exist for: Login, Register, VerifyEmail, Forgot/Reset password, Dashboard,
  Company, Departments, Employees, Payroll, Tax, MyTax, Profile, Sessions, NotFound.

**Problems to fix (the reason for this plan):**
1. **Inconsistent branding** — theme/sidebar use purple `#8b5cf6`; auth pages
   hardcode teal `#0B2B40`. No single design language.
2. **Mock dashboard** — KPIs/charts show fake ERP data, not real payroll/tax data.
3. **Per-screen `sx` hacks** — no shared component library; styling is duplicated.
4. **Missing flows** — staff invite + accept, passwordless OTP employee login,
   accept-invite, "enable login" per employee, employee pay-statement screen.
5. **Inconsistent states** — loading/empty/error not handled uniformly.
6. Pre-existing TypeScript (`tsc -b`) errors to clear before release.

**Design principles for the whole app:**
- One theme, zero hardcoded colors in pages. Everything reads from the MUI theme.
- Every list/data screen has 4 states: loading (skeleton), empty, error, content.
- Every destructive/owner-only action is gated by role AND confirmed by a dialog.
- Responsive: works at 360px (mobile) → 1440px+ (desktop).
- Accessible: labels, focus states, keyboard nav, aria-current on nav.
- Consistent feedback: toasts for actions, inline errors for forms.

---

# PART 1 — Design System & App Shell (Foundation)

> **Goal:** Establish the single visual language and the shared building blocks so
> Parts 2 & 3 are just "apply the system to screens." Nothing below ships new
> business features — it makes everything that follows consistent and fast to build.

### 1.1 Brand & Design Tokens
- Decide ONE brand palette (resolve purple-vs-teal). Define: primary, secondary,
  success, warning, error, info, neutral/gray scale, surface/background.
- Typography scale (h1–h6, body, caption, button) with one font family.
- Spacing scale, border radius, elevation/shadow tokens, z-index layers.
- Document tokens at top of `theme.ts` (or a `theme/tokens.ts`).

### 1.2 MUI Theme Overhaul (`src/theme.ts`)
- Centralize ALL component overrides so pages need no `sx` color hacks:
  Button, IconButton, Card, Paper, TextField/Select, Chip, Dialog, Table,
  Tabs, Tooltip, Menu, Alert, Snackbar, Drawer, ListItemButton.
- Add light theme now; structure so a dark theme can be added later.
- Remove hardcoded colors from existing pages (start with `Login.tsx`).

### 1.3 Shared UI Component Library (`src/components/ui/`)
Build these reusable primitives (used everywhere in Parts 2 & 3):
- `PageHeader` — title, subtitle, breadcrumb, right-aligned action slot.
- `StatCard` — label, value, delta/trend, icon (replaces ad-hoc KPICard).
- `DataTable` — wrapper around `@tanstack/react-table`: sorting, pagination,
  column config, row actions, sticky header, responsive overflow, built-in
  loading/empty/error states.
- `StatusChip` — maps enum values (EmployeeStatus, PayrollRunStatus,
  DeclarationStatus) → colored chips, one source of truth.
- `ConfirmDialog` — generic destructive-action confirm (title, message, confirm
  label, loading state).
- `FormDialog` / `FormDrawer` — standard create/edit container with footer actions.
- `EmptyState`, `ErrorState`, `LoadingSkeleton` (table/card/form variants).
- `MoneyText` / `DateText` — consistent formatting (uses `utils/format.ts`).
- `SectionCard` — titled card container for grouping content.

### 1.4 App Shell Polish (`dashboardlayout.tsx`)
- Topbar: page title + breadcrumbs, company name/switcher, notifications slot,
  user menu (already partially there — standardize).
- Sidebar: finalize active states, collapse behavior, mobile drawer, tooltips.
- Add a global breadcrumb derived from the route.
- Company switcher (keep `companyId` in store; show active company).
- Standardize page content padding/max-width via a `PageContainer`.

### 1.5 Auth Shell Redesign (`components/auth/AuthLayout.tsx` + all auth pages)
- One `AuthLayout` (brand panel + form panel) used by every auth page.
- Restyle Login, Register, ForgotPassword, ResetPassword, VerifyEmail to the new
  tokens (remove teal hardcodes). Consistent inputs, buttons, links, error alerts.

### Part 1 Deliverables / Acceptance
- `theme.ts` is the single styling source; no page hardcodes hex colors.
- `src/components/ui/*` library exists and is exported from an index.
- Auth + shell visually consistent with the new brand.
- App builds (`npm run build`) with no new TS errors.

---

# PART 2 — Core Admin/Owner Workflows

> **Goal:** Make the owner/admin operational screens real, complete, and polished
> using the Part 1 component library. Depends on Part 1.

### 2.1 Dashboard — real data (`pages/dashboard/Dashboard.tsx`)
- Replace mock KPIs with real numbers: employee count (`/employee/get-employees`),
  payroll runs summary (`/payroll/runs`), tax declaration summary (`/tax/summary`).
- Role-aware: employees see a self-service dashboard (their tax status + pay).
- Charts (recharts) driven by real data: declarations by status, payroll trend,
  headcount by department. Each chart has loading/empty states.
- Quick actions linking to the main workflows.

### 2.2 Company Settings + Team/Staff (`pages/dashboard/CompanySettings.tsx`)
- View/edit company (owner-only edit): name, email, phone, address, etc.
- **NEW: Team management** — list staff, invite ADMIN/HR (`/company/invite-staff`),
  show pending/invited state. Owner-only.
- **NEW: Accept-staff-invite page** (public route, token from email) → set password
  → `POST /auth/accept-staff-invite` → store tokens → redirect to dashboard.

### 2.3 Departments (`pages/dashboard/Departments.tsx`)
- Polish existing CRUD with `DataTable` + `FormDialog` + `ConfirmDialog`.
- Owner-only create/edit/delete; everyone with access can view.

### 2.4 Employees (`pages/dashboard/Employees.tsx`)
- List: server pagination (page/limit), search, filter by status + department.
  Remember: API returns a raw array — last page when `length < limit`.
- Employee detail drawer/page (all fields, PAN doc, status, login state).
- Create / edit forms (zod-validated, mirrors backend fields).
- Bulk upload dialog (.xlsx/.xls/.csv, ≤5MB, field `file`) with result feedback.
- Status change (the DELETE-verb `Status-update-employee`) via ConfirmDialog.
- **NEW: "Enable login"** action per employee (`/employee/enable-login`) — creates
  passwordless account + emails them; handle 409 (already enabled).

### 2.5 Payroll (`pages/dashboard/Payroll.tsx`)
- Upload run: 3-step S3 flow — `GET /payroll/upload-url` → `PUT` bytes to S3 →
  `POST /payroll/upload` (year, month, uploadType, sourceFileKey, replace?).
  Progress + error handling.
- Run list with filters (year/month/uploadType) + run detail (entries + components).
- Per-entry editor (`PATCH /payroll/entry`): components[], days, remarks; locked-row
  awareness. Delete entry / delete run (owner-only, confirmed).
- Money + totals formatted consistently (Decimal-as-string safe math).

### Part 2 Deliverables / Acceptance
- Dashboard shows only real data; no mock imports remain.
- Staff invite + accept flow works end-to-end.
- Employees + Payroll fully usable with loading/empty/error states and role gating.
- Owner-only actions hidden/disabled for non-owners.

---

# PART 3 — Tax, Employee Self-Service & Global Finishers

> **Goal:** Complete the tax workflows (admin + employee), employee self-service,
> the remaining auth flows, and the global quality pass. Depends on Parts 1 & 2.

### 3.1 Tax Declarations — Admin (`pages/dashboard/TaxDeclarations.tsx`)
- Tracking table filtered by year/status/employee; summary cards (`/tax/summary`).
- Declaration detail: salary components, computed tax fields, items/proofs.
- Approve / Reject (with reason) — owner-only, confirmed.
- Manage proofs: add/update/remove proof items.
- **Exports**: `/tax/export/tracking` and `/tax/export/declaration` — request as a
  **blob**, trigger browser download (use `utils/download.ts`).

### 3.2 Employee Self-Service
- **My Tax Declaration** (`pages/dashboard/MyTaxDeclaration.tsx`): view by year,
  edit, add/remove proofs (S3 upload for proof docs), submit for approval; show
  status (Draft/Submitted/Approved/Rejected) + any `rejectionReason`.
- **NEW: My Pay Statement** — wire `PayStatementView` to a real route using
  `/payroll/pay-statement` for the user's own `employeeId` (FY view + projection).
  Add nav item for EMPLOYEE role.
- **My Profile** (`Profile.tsx`) + **Sessions** (`Sessions.tsx`): polish to the
  component library; change password, revoke sessions, delete account.

### 3.3 Remaining Auth Flows
- **NEW: Passwordless OTP login** — `request-login-otp` (enter email) →
  `verify-login-otp` (6-digit code, single-use, 10-min expiry). New public pages.
- **NEW: Accept-invite page** (`/auth/accept-invite`) for the generic invite token.
- Wire "Email not verified" → verify-email flow consistently.

### 3.4 Global Quality Pass (cross-cutting)
- **401 handling**: response interceptor in `api/axios.ts` — on 401 try
  `refresh-access-token`, retry once, else clear tokens → `/login`.
- Standardize toasts (success/error) and the envelope unwrap + `error.field`
  form-field mapping on 400/409.
- Apply loading/empty/error states uniformly via Part 1 components.
- ErrorBoundary coverage, 404 page polish, route-guard final review.
- **Fix all `tsc -b` errors**; ensure `npm run build` is clean.
- Responsive QA pass (mobile → desktop) on every screen.
- Accessibility pass: labels, focus order, keyboard nav, color contrast.
- README + `.env.example` (`VITE_API_BASE_URL`), brief screen/feature docs.

### Part 3 Deliverables / Acceptance
- Tax (admin + employee) fully functional incl. xlsx export + proof uploads.
- Employee can OTP-login, see pay statement, manage own tax declaration.
- Global 401 refresh-retry works; build is clean; app is responsive + accessible.

---

## Appendix — Screen ↔ Endpoint quick map
- Auth: `/auth/*` (login, signup, refresh, OTP, invites, verify, reset).
- Dashboard: `/tax/summary`, `/payroll/runs`, `/employee/get-employees`.
- Company/Team: `/company/*`, `/auth/accept-staff-invite`.
- Departments: `/department/*`.
- Employees: `/employee/*` incl. `bulk-upload`, `enable-login`.
- Payroll: `/payroll/upload-url|upload|runs|run|entry|pay-statement`.
- Tax (admin): `/tax/declarations|summary|declaration|approve|reject|proof|export/*`.
- Tax (me): `/me/tax/declaration|submit|proof`.
- User: `/user/me|update-me|change-password|delete-me|sessions`.

> Owner-only (✅ in backend contract): company/department/employee/payroll
> create-update-delete, tax approve/reject/proof. Hide/disable for non-owners.
