# API Documentation — Legacy Backend Reference

Legacy backend reference for the Auronox platform (Node.js · Express 5 ·
TypeScript · Prisma · PostgreSQL). The active frontend now exposes only
authentication, organization, branch, and department management.

> The backend hierarchy work is separate from this frontend. The current
> frontend expects branch CRUD endpoints and branch-scoped department requests
> described below; those contracts are not confirmed by this legacy reference.
> Enforce all organization/branch/department authorization on the backend.

> Verified against source on 2026-06-20 from `src/routes`, `src/middleware`, and
> `src/routes/index.routes.ts`. Where this drifts from code, the source wins.

---

## Active frontend hierarchy contract (backend work required)

The frontend treats the existing `companyId` as the organization ID:

```text
Organization (companyId)
└── Branch (companyId)
    └── Department (branchId + companyId)
```

Expected branch endpoints (new or to be confirmed):

| Method | Endpoint | Query parameters | Body |
| ------ | -------- | ---------------- | ---- |
| POST | `/api/branch/create-branch` | `companyId` | `{ name, code, addressLine?, city?, state?, country?, pinCode? }` |
| PATCH | `/api/branch/update-branch` | `id`, `companyId` | same branch fields |
| DELETE | `/api/branch/delete-branch` | `id`, `companyId` | — |
| GET | `/api/branch/list-branches` | `companyId`, optional `branchId` | — |

Department create/update requests include `branchId` in both the body and query
parameters; list/detail/delete requests accept `branchId` as a query parameter.
Department list requests also accept `departmentId` to limit department-scoped
accounts to their own department.
The authenticated user response should include `branchId` for branch-scoped
admins and both `branchId` and `departmentId` for department-scoped admins.

Expected authorization:

- `OWNER` / `ADMIN`: organization-wide management.
- `BRANCH_ADMIN`: scoped to the assigned branch and its departments.
- `DEPARTMENT_ADMIN`: scoped to the assigned department.
- `HR` / `EMPLOYEE` and other unscoped roles receive account access only.

The UI role guard is not a security boundary. The API must validate the
authenticated user's organization, role, branch, and department scope on every
request.

---

## 1. Base URL & Conventions

| Setting          | Value                                  | Notes |
| ---------------- | -------------------------------------- | ----- |
| Base URL         | `http://localhost:3000/api`            | Port from `PORT` env (default `3000`). Everything mounts under `/api`. |
| Dev frontend     | `http://localhost:5173`                | Backend `CORS_ORIGIN` default (Vite). |
| CORS             | enabled, `credentials: true`           | Allows `GET, POST, PATCH, PUT, DELETE, OPTIONS`. |
| Auth transport   | `Authorization: Bearer <accessToken>`  | Header-based JWT (not cookies). |
| Content type     | `application/json`                     | Except file uploads (`multipart/form-data`). |
| Health check     | `GET /api/health` → `{ "success": true }` | Use to verify connectivity. |

---

## 2. Response Envelope

Every response is one of three shapes. **Always branch on `success`.**

```jsonc
// Success with data
{ "success": true, "data": { /* object or array */ } }

// Success with only a message (deletes, actions)
{ "success": true, "message": "Operation successful" }

// Error
{ "success": false, "error": { "message": "Human readable error" } }
```

Some errors carry extra Prisma-mapped fields next to `message`:

```json
{ "success": false, "error": { "message": "A record with that email already exists.", "code": "P2002", "field": "email" } }
```

### HTTP status codes

| Code | Meaning                | Frontend action |
| ---- | ---------------------- | --------------- |
| 200  | OK                     | — |
| 201  | Created                | — |
| 400  | Validation / bad input | Show field errors from `error.message` |
| 401  | Missing/expired token  | Try refresh, else go to login |
| 403  | Not allowed            | Hide/disable action, show notice |
| 404  | Not found              | Empty state |
| 409  | Conflict (duplicate)   | Show `error.field` conflict |
| 500  | Server error           | Generic retry message |

---

## 3. Authentication

JWT access token + refresh token. The **access token is the primary credential** —
send it on every protected request.

- **Access token** — JWT, expires in **12 hours**. Header: `Authorization: Bearer <token>`.
- **Refresh token** — JWT, expires in **30 days**. Returned **only by login** (not signup).

### Client logic (recommended)

```text
1. Login → store accessToken (memory/localStorage) + refreshToken (localStorage).
2. Attach `Authorization: Bearer <accessToken>` to every protected call.
3. On 401 → POST /auth/refresh-access-token with { refreshToken }.
     success → save new accessToken, retry original request once.
     failure → clear tokens, redirect to /login.
4. Logout → call /auth/logout, then clear local tokens.
```

If login fails with **"Email not verified"**, route the user into the verify-email flow.

### Passwordless employee login

Employees get **no account** when created/uploaded. An owner enables login —
either **one at a time** (`POST /api/employee/enable-login`) or for the **whole
company at once** (`POST /api/employee/enable-login-all`). Enabling creates the
account and emails the employee. After that they sign in with **email + a
one-time code**:

```text
POST /auth/request-login-otp  { email }          → 6-digit code emailed
POST /auth/verify-login-otp   { email, otp }      → { user, accessToken, refreshToken }
```

The code is **single-use** and expires in **10 minutes**. These accounts have no
password, so `POST /auth/login` does not work for them (and `request-login-otp`
rejects password accounts with 400). The `user` in the login response includes
`companyId` and `userRole` (`EMPLOYEE`), so the client can route straight to the
self-service screens.

An owner can revoke access the same way — one employee
(`POST /api/employee/disable-login`) or all at once
(`POST /api/employee/disable-login-all`). Disabling revokes the employee's active
sessions and removes their login; the employee record itself is untouched and
login can be re-enabled later.

---

## 4. Roles & Access Control

User roles: `OWNER`, `ADMIN`, `HR`, `EMPLOYEE`.

The backend enforces two middleware layers (mirror them in the UI):

| Middleware                | Rule | Applies to |
| ------------------------- | ---- | ---------- |
| `authenticateUser`        | Valid bearer token required | All `/user`, `/company`, `/department`, `/employee`, `/payroll`, `/tax`, `/me/tax` |
| `authorizeCompanyAccess`  | User must own or belong to `companyId` | `/department`, `/employee`, `/payroll`, `/tax` (router-level) and `/company` (per-route) |
| `verifyCompanyRootAccess` | **Company owner only** (root user) | All create/update/delete of company, department, employee, payroll, and tax approve/reject/proof |

> Endpoints marked **✅ owner-only** below require `verifyCompanyRootAccess`.

**Practical rule for the UI:**
- **Owner** → full admin: manage company, employees, payroll, approve/reject tax declarations.
- **Employee / others** → self-service only: view own profile, fill & submit own tax declaration (`/api/me/tax/*`), view own pay statement.

Most company-scoped endpoints require a **`companyId` query parameter**. Keep the
active company id in app state. The current user's company comes from `GET /api/user/me`.

---

## 5. Endpoint Reference

All paths are prefixed with `/api`. ✅ = owner-only. Company-scoped endpoints need `?companyId=<id>`.

### 5.1 Auth — `/api/auth` (public unless noted)

| Method | Path | Body | Returns |
| ------ | ---- | ---- | ------- |
| POST | `/signup` | `{ name, email, password }` | `{ user, accessToken }` (no refresh token) |
| POST | `/login` | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/logout` *(auth)* | — | message |
| POST | `/logout-all-devices` *(auth)* | — | message |
| POST | `/send-verification-email` | `{ email }` | message |
| POST | `/verify-email` | `{ email, otp }` | message |
| POST | `/forgot-password` | `{ email }` | message |
| POST | `/reset-password` | `{ token, newPassword }` | message |
| POST | `/accept-invite` | `{ token, password }` | `{ user, ...tokens }` |
| POST | `/request-login-otp` | `{ email }` | message |
| POST | `/verify-login-otp` | `{ email, otp }` | `{ user, accessToken, refreshToken }` |
| POST | `/accept-staff-invite` | `{ token, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/refresh-access-token` | `{ refreshToken }` | `{ accessToken }` |

### 5.2 User — `/api/user` (auth required)

| Method | Path | Body / Query | Purpose |
| ------ | ---- | ------------ | ------- |
| GET | `/me` | — | Current user profile |
| PUT | `/update-me` | `{ name? }` | Update profile |
| POST | `/change-password` | `{ currentPassword, newPassword }` | Change password |
| DELETE | `/delete-me` | `{ password }` | Delete own account |
| GET | `/get-active-sessions` | — | List active sessions |
| POST | `/revoke-session` | `{ sessionId }` | Revoke a session |

### 5.3 Company — `/api/company` (auth required)

| Method | Path | Query | Purpose |
| ------ | ---- | ----- | ------- |
| POST | `/create-company` | — | Create company (caller becomes owner) |
| GET | `/get-company` | `companyId` | Company details |
| PATCH ✅ | `/update-company` | `companyId` | Update company |
| DELETE ✅ | `/delete-company` | `companyId` | Delete company |
| POST ✅ | `/invite-staff` | `companyId` + `{ email, name, role }` | Invite ADMIN/HR staff — emails a set-password link |

Create/Update body: `{ name, email?, phone?, address? }`.

> **Staff invites.** Only the owner can invite staff, and only as `ADMIN` or `HR`
> (other roles → 400). The invitee gets a link to `/accept-staff-invite?token=…`;
> the frontend collects a password and calls `POST /auth/accept-staff-invite` with
> `{ token, password }`, returning tokens (logged in immediately). These accounts
> log in with **email + password** (not OTP). 409 if the email already has an account.

### 5.4 Department — `/api/department` (auth + company access)

| Method | Path | Query | Purpose |
| ------ | ---- | ----- | ------- |
| POST ✅ | `/create-department` | `companyId` | Create (`{ name }`) |
| GET | `/get-departments` | `companyId` | List all |
| GET | `/get-department-by-id` | `id`, `companyId` | One department |
| PATCH ✅ | `/update-department` | `id`, `companyId` | Update (`{ name }`) |
| DELETE ✅ | `/delete-department` | `id`, `companyId` | Delete |

### 5.5 Employee — `/api/employee` (auth + company access)

| Method | Path | Query / Body | Purpose |
| ------ | ---- | ------------ | ------- |
| POST ✅ | `/create-employee` | `companyId` + Employee body | Create employee |
| POST ✅ | `/bulk-upload` | `companyId` + `multipart` file | Bulk upload (.xlsx/.xls/.csv, ≤5MB, field `file`) |
| GET | `/get-employees` | `companyId`, `page?`, `limit?`, `search?`, `departmentId?`, `status?` | List (paginated) |
| GET | `/get-employee` | `id`, `companyId` | One employee |
| PATCH ✅ | `/update-employee` | `id`, `companyId` + partial body | Update |
| DELETE ✅ | `/Status-update-employee` | `id`, `companyId` | Change status (DELETE verb, updates status) |
| POST ✅ | `/enable-login` | `id`, `companyId` | Enable passwordless login for one employee — creates account + emails them |
| POST ✅ | `/enable-login-all` | `companyId` | Enable login for **all eligible** employees — returns a summary (`enabled` / `skipped`) |
| POST ✅ | `/disable-login` | `id`, `companyId` | Disable login for one employee — revokes sessions + removes their login |
| POST ✅ | `/disable-login-all` | `companyId` | Disable login for **all** employees that have one — returns a summary |

> Creating or bulk-uploading employees sends **no email** and grants **no login**.
> Use `/enable-login` (one employee) or `/enable-login-all` (whole company) to
> grant access, and `/disable-login` / `/disable-login-all` to revoke it. The
> single `/enable-login` returns 409 if that employee already has a login; the
> bulk endpoints never fail on a bad row — they skip ineligible employees (no
> email, already enabled, email already taken) and report them in `skipped`.

### 5.6 Payroll — `/api/payroll` (auth + company access)

| Method | Path | Query / Body | Purpose |
| ------ | ---- | ------------ | ------- |
| GET ✅ | `/upload-url` | `companyId` + `{ fileName }` | Get pre-signed S3 upload URL |
| POST ✅ | `/upload` | `companyId` + `{ year, month, uploadType, sourceFileKey, replace? }` | Register a payroll run |
| GET | `/runs` | `companyId`, `year?`, `month?`, `uploadType?` | List runs (with entries) |
| GET | `/run` | `companyId`, `runId` | One run + full entries + components |
| DELETE ✅ | `/run` | `companyId`, `runId` | Delete run |
| PATCH ✅ | `/entry` | `companyId`, `entryId` + `{ components[], daysInMonth?, effectiveWorkdays?, remarks? }` | Edit one entry |
| DELETE ✅ | `/entry` | `companyId`, `entryId` | Delete entry |
| GET | `/pay-statement` | `companyId`, `employeeId`, `year`, `uploadType?` | FY pay statement (with projection) |

### 5.7 Tax — Admin `/api/tax` (auth + company access)

| Method | Path | Query / Body | Purpose |
| ------ | ---- | ------------ | ------- |
| GET | `/declarations` | `companyId`, `year`, `status?`, `employeeId?` | List declarations (tracking) |
| GET | `/summary` | `companyId`, `year` | Status counts + averages |
| GET | `/declaration` | `companyId`, `declarationId` | One declaration + items |
| GET | `/export/tracking` | `companyId`, `year` | Download tracking `.xlsx` |
| GET | `/export/declaration` | `companyId`, `declarationId` | Download declaration `.xlsx` |
| PATCH ✅ | `/approve` | `companyId`, `declarationId` | Approve |
| PATCH ✅ | `/reject` | `companyId`, `declarationId` + `{ reason }` | Reject |
| POST ✅ | `/proof` | `companyId`, `declarationId` + Proof body | Add/update proof item |
| DELETE ✅ | `/proof` | `companyId`, `declarationId`, `itemId`, `removeItem?` | Remove proof/item |

> The two `/export/*` endpoints stream a binary `.xlsx` with
> `Content-Disposition: attachment` — request as a **blob**, not JSON, and trigger a download.

### 5.8 Tax — Employee self-service `/api/me/tax` (auth only, no companyId)

Operates on the **logged-in user's own** declaration.

| Method | Path | Query / Body | Purpose |
| ------ | ---- | ------------ | ------- |
| GET | `/declaration` | `year`, `regime?` | Get my declaration |
| PATCH | `/declaration` | `year` + update body | Update my declaration |
| POST | `/submit` | `year` | Submit for approval |
| POST | `/proof` | `declarationId` + Proof body | Add proof |
| DELETE | `/proof` | `declarationId`, `itemId`, `removeItem?` | Remove proof |

Proof body (admin & me): `{ itemId?, section, amount, description?, referenceNo?, proofDocKey? }`.

---

## 6. Pagination

List endpoints (notably `/employee/get-employees`) take `page` (default 1) and
`limit` (default 10). **The response is a raw array — no total-count wrapper.**
If the returned array length `< limit`, you're on the last page. Sorted `createdAt DESC`.

---

## 7. File Uploads (S3 flow)

For payroll files and proof/PAN docs:

```text
1. GET /api/payroll/upload-url  →  { uploadUrl, fileKey }
2. PUT the file bytes directly to uploadUrl (S3 pre-signed — no auth header).
3. Send fileKey back as sourceFileKey / proofDocKey to the API.
```

Employee bulk upload is the exception — it posts `multipart/form-data` (field `file`)
directly to `/api/employee/bulk-upload`.

---

## 8. Enums

```ts
type UserRole        = "OWNER" | "ADMIN" | "HR" | "EMPLOYEE";
type EmployeeStatus  = "ACTIVE" | "INACTIVE" | "RESIGNED" | "TERMINATED";

type PayrollUploadType    = "SALARY" | "INCENTIVE" | "OTHER";
type PayrollRunStatus     = "DRAFT" | "PROCESSING" | "PROCESSED" | "FINALISED" | "FAILED";
type PayrollComponentType = "EARNING" | "DEDUCTION";

type TaxRegime         = "OLD" | "NEW";
type DeclarationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

type TaxSection =
  | "SECTION_80C" | "SECTION_80CCD" | "SECTION_80CCD_1B"
  | "SECTION_80D" | "SECTION_80DD" | "SECTION_80DDB"
  | "SECTION_80E" | "SECTION_80G"
  | "HRA" | "HOME_LOAN" | "NPS" | "OTHER";
```

> `Decimal` fields are serialized as JSON — treat as `string | number` and parse
> with care for money math. Dates are ISO-8601 strings.

---

## 9. Salary Structure Engine

Component calculation strategies and their evaluation order:

```text
FIXED  →  PERCENTAGE_OF_CTC  →  PERCENTAGE_OF_BASIC  →  FORMULA  →  BALANCING
```

Strategies: `FIXED`, `PERCENTAGE_OF_CTC`, `PERCENTAGE_OF_BASIC`, `PERCENTAGE_OF_GROSS`,
`FORMULA`, `BALANCING`.

---

*See [FLOW_DOCUMENTATION.html](FLOW_DOCUMENTATION.html) for visual flowcharts of the
request lifecycle, auth, payroll, and tax flows. For frontend integration details
(TypeScript types, screen map), see [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md).*
