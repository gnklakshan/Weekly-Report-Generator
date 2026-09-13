# Weekly Reports

Weekly report generator and team dashboard for internal delivery teams. Built as a frontend-only demo — all data lives in an in-memory mock database mirrored to `localStorage`.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (Pages Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Radix) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack React Query |
| Icons | Lucide React |
| Toasts | Sonner |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

Every account uses the password **`password123`**.

| Name | Email | Role | What you can do |
|------|-------|------|-----------------|
| Priya Wickramasinghe | `manager@example.com` | Manager | Full access: dashboard, reports, reviews, team, projects |
| Ruwan Gunasekara | `admin@example.com` | Admin | Full access including user management |
| Alex Perera | `member@example.com` | Team Member | Own reports, personal dashboard |
| Sarah Fernando | `sarah@example.com` | Team Member | Own reports, personal dashboard |
| Daniel Silva | `daniel@example.com` | Team Member | Own reports, personal dashboard |
| Nethmi Jayasinghe | `nethmi@example.com` | Team Member | Own reports, personal dashboard |
| Kavindu Peris | `kavindu@example.com` | Team Member | Own reports, personal dashboard |

## Project Structure

```
src/
├── components/
│   ├── charts/        # Reusable chart components (trend, workload, status)
│   ├── common/        # Shared UI: empty/error/loading states, confirm dialog
│   ├── dashboard/     # Dashboard views (team + personal), metrics, filters
│   ├── layout/        # App shell, sidebar, breadcrumbs, permission gate
│   ├── projects/      # Project management table, filters, form dialog
│   ├── reports/       # Report list, detail, multi-step form, review timeline
│   ├── reviews/       # Review queue, review detail, approve/correct panel
│   ├── team/          # Team directory, member profiles, activity cards
│   ├── ui/            # shadcn/ui primitives
│   └── users/         # User management table, filters, form dialog
├── config/            # Navigation config, activity presentation config
├── data/              # Mock data (users, projects, reports, dashboard)
├── hooks/             # Custom hooks (auth, dashboard, reports, team, etc.)
├── lib/               # Constants, permissions, mock database, validators
├── pages/             # Next.js pages (routes)
├── services/          # Service interfaces + mock implementations
├── styles/            # Global CSS (Tailwind)
└── types/             # Shared TypeScript types
```

## Architecture

### Data Flow

```
Page → Feature component → Custom hook → Service interface → Mock service → Mock data
```

- **Service interfaces** (`src/services/`) define the contract. Mock implementations (`src/services/mock-*.ts`) back them with in-memory data.
- The mock database persists to `localStorage` with a 260 ms simulated latency.
- Swap mock services for REST clients by implementing the same interfaces — no component changes needed.

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
- **UX Polish** — Breadcrumbs, skeleton loading, empty/error states, confirmation dialogs, success/error toasts, unsaved-changes warnings, responsive layout.

## Build

```bash
npm run build    # Production build
npm run lint     # ESLint
```
