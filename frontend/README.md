# Weekly Reports — Frontend

Weekly report generator and team dashboard for internal delivery teams. Connects to a Spring Boot REST API backend with PostgreSQL.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (Pages Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Radix) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | Custom `useApi` hook (direct fetch to REST API) |
| Icons | Lucide React |
| Toasts | Sonner |

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running on `http://localhost:8080` (see `../backend/`)

### Setup

```bash
# Create .env.local with the API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

Every account uses the password **`password123`** (after seeding the backend).

| Name | Email | Role | What you can do |
|------|-------|------|-----------------|
| Nuwan Admin | `admin@example.com` | Admin | Full access: dashboard, reports, reviews, team, projects, users |
| Sarah Manager | `manager@example.com` | Admin (Manager) | Full access: dashboard, reports, reviews, team, projects |
| Daniel Perera | `daniel@example.com` | Team Member | Own reports, personal dashboard |
| Nethmi Silva | `nethmi@example.com` | Team Member | Own reports, personal dashboard |
| Kavindu Jay | `kavindu@example.com` | Team Member | Own reports, personal dashboard |
| Team Member | `member@example.com` | Team Member | Own reports, personal dashboard |

## Project Structure

```
src/
├── components/
│   ├── charts/        # Reusable chart components (trend, workload, status)
│   ├── common/        # Shared UI: empty/error/loading states, confirm dialog, AI assistant
│   ├── dashboard/     # Dashboard views (team + personal), metrics, filters
│   ├── layout/        # App shell, sidebar, breadcrumbs, permission gate
│   ├── projects/      # Project management table, filters, form dialog
│   ├── reports/       # Report list, detail, multi-step form, review timeline
│   ├── reviews/       # Review queue, review detail, approve/correct panel
│   ├── team/          # Team directory, member profiles, activity cards
│   ├── ui/            # shadcn/ui primitives
│   └── users/         # User management table, filters, form dialog
├── config/            # Navigation config, activity presentation config
├── hooks/             # Custom hooks (auth, API client, report form)
├── lib/               # Constants, permissions, validators, API transform utilities
├── pages/             # Next.js pages (routes)
├── services/          # Mock DB reset utility (dev only)
├── styles/            # Global CSS (Tailwind)
└── types/             # Shared TypeScript types
```

## Architecture

### Data Flow

```
Page → Feature component → Custom hook → useApi (fetch) → Spring Boot REST API → PostgreSQL
```

- **`useApi` hook** (`src/hooks/use-api.ts`) handles all API calls with JWT auth, request caching, and abort controller management.
- **`useAuth` hook** (`src/hooks/use-auth.tsx`) manages authentication state, login/register/logout, and session persistence via localStorage.
- **`api-transform.ts`** (`src/lib/api-transform.ts`) normalizes backend DTO shapes into frontend types.

### Permission Model

Access control is centralized in `src/lib/permissions.ts` via `hasPermission(user, permission)`. Components use the `<RequirePermission>` wrapper or call permission helpers (`canEditReport`, `canReviewReport`) — role checks are never scattered across UI code.

### Report Workflow

```
DRAFT → SUBMITTED → APPROVED
                  → NEEDS_CORRECTION → SUBMITTED (re-submit)
```

Each re-submission creates a new version. Reviewers see the full version history and timeline.

## Features

- **Dashboard** — Team and personal views with derived metrics, week stepper, project/member filters, and Recharts visualizations (task trends, status breakdown, workload distribution, time by task type).
- **Weekly Reports** — Multi-step form with task tracking (current + next week), hours breakdown, achievements, blockers, notes, and reference links. Supports draft, submit, and re-submit after correction.
- **Reviews** — Queue of submitted reports with approve/request-correction actions. Full read-only report view with review timeline and version history.
- **Team Directory** — Browse all team members with profile pages showing stats, projects, recent activity, blockers, and task trend charts.
- **Projects** — CRUD management with status tracking, member assignment, and filtering.
- **User Management** — Admin-only user CRUD with role and status management.
- **AI Assistant** — Optional demo chat modal with predefined mock responses.
- **UX Polish** — Breadcrumbs, skeleton loading, empty/error states, confirmation dialogs, success/error toasts, responsive layout.

## Build

```bash
npm run build    # Production build
npm run lint     # ESLint
npm start        # Run production build
```
