# Organization Management — Frontend

A React + TypeScript single-page app for managing organizations, branches,
departments, and account access. Payroll, tax, attendance, employee, and
subscription features are not part of the active application.

---

## Tech Stack

| Concern            | Library                                   |
| ------------------ | ----------------------------------------- |
| Framework          | React 19 + TypeScript (strict)            |
| Build tool         | Vite 8                                     |
| UI library         | MUI 9 (`@mui/material`, `@mui/icons`)      |
| Data fetching      | TanStack Query 5                          |
| Tables             | TanStack Table 8                          |
| Forms + validation | react-hook-form + Zod                     |
| Global state       | Zustand (persisted auth/company stores)   |
| HTTP               | Axios (single instance + interceptors)    |
| Routing            | React Router 7                            |
| Notifications      | react-hot-toast                           |
| Charts             | Recharts                                  |
| Dates / money      | Day.js + `Intl.NumberFormat` (en-IN, INR) |

---

## Project Structure

```
src/
├── api/          # Axios instance + one module per backend resource
├── components/   # Feature components + the shared design system (components/ui)
├── constants/    # Enums, nav matrix, query-key factory, app constants
├── hooks/        # TanStack Query hooks, grouped by resource
├── pages/        # Route-level screens (auth/ and dashboard/)
├── providers/    # QueryClient provider
├── routes/       # AppRoutes — route table + auth/role guards
├── schemas/      # Zod form schemas
├── store/        # Zustand stores (auth, company)
├── theme/        # MUI theme: tokens, palette, typography, component overrides
├── types/        # Domain + transport types
└── utils/        # format, download, error mapping helpers
```

The design-system primitives live in `src/components/ui` (`PageHeader`,
`DataTable`, `StatCard`, `StatusChip`, `ConfirmDialog`, `FormDialog`,
`FormDrawer`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `MoneyText`,
`DateText`, `SectionCard`). Build screens from these rather than raw MUI.

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Setup

```bash
npm install
cp .env.example .env   # then edit .env with your API URL
```

### Environment Variables

Only `VITE_`-prefixed variables are exposed to the client. See `.env.example`.

| Variable       | Required | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `VITE_API_URL` | No\*     | Base URL of the backend API, including `/api`. Defaults to `https://nexus-backend-dun-iota.vercel.app/api` when unset. |

\* Recommended in every environment so the build is never silently pointed at
the hosted default.

---

## Development

```bash
npm run dev        # start the Vite dev server (http://localhost:5173)
npm run lint       # eslint
npx tsc -b         # type-check only
```

---

## Build

```bash
npm run build      # tsc -b && vite build  -> dist/
npm run preview    # serve the production build locally
```

`npm run build` type-checks first and fails the build on any TypeScript error.

---

## Deployment

The app builds to a static `dist/` folder — deploy it to any static host
(Vercel, Netlify, S3 + CloudFront, Render static site, …).

1. Set `VITE_API_URL` in the host's build environment.
2. Run `npm run build`.
3. Serve `dist/` and configure an SPA fallback so deep links resolve to
   `index.html` (every unknown path is handled by the client router).

---

## Authentication & Authorization

- JWT access/refresh tokens are stored in `localStorage` and mirrored in a
  persisted Zustand auth store.
- A single Axios response interceptor handles **401 → refresh → retry once**,
  with single-flight refresh and a waiter queue so concurrent 401s trigger only
  one refresh; a failed refresh clears tokens and redirects to `/login`.
- Routes are guarded by `ProtectedRoute` (auth), `GuestRoute` (auth-free), and
  `RoleRoute` (role matrix). The sidebar and route guards both read the single
  nav/role matrix in `src/constants/navigation.ts`, so visibility and
  reachability can never drift.

---

## Active Feature List

**Authentication**

- Login and registration
- Email verification, password recovery, and OTP login
- Invite acceptance
- Profile and active-session management

**Organization hierarchy**

- One organization contains multiple branches
- Each branch contains multiple departments
- Organization owners/admins manage the organization and all branches/departments
- Branch admins are scoped to their branch; department admins are scoped to
  their department

Backend authorization must enforce these role and scope restrictions; frontend
route guards only control visibility and navigation.

---

## Conventions

- **TypeScript strict mode** — no `any` in app code; enums are `as const`
  objects (project disallows TS `enum`).
- **Currency** always renders through `MoneyText` / `formatCurrency`
  (`₹`, en-IN grouping).
- **Errors** are mapped centrally: `utils/errorHandler` for friendly copy and
  `utils/apiError` for structured field/code mapping; user feedback is delivered
  through standardized `react-hot-toast` success/error toasts.
- **Empty / loading / error** states use `EmptyState`, `LoadingSkeleton`,
  `ErrorState` consistently.
