# Weekly Report Generator & Team Dashboard

A full-stack web application that allows team members to submit structured weekly work reports, managers to review and send back reports for correction, and provides a consolidated dashboard for managers to view and analyze reports across the whole team.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Recharts |
| Backend | Spring Boot 4.1.1, Spring Security, Spring Data JPA / Hibernate |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (JJWT 0.12.6), BCrypt password hashing |
| Build | Maven (backend), npm (frontend) |

## Prerequisites

- **Java 21** or higher
- **Node.js 18** or higher
- **Maven 3.8+** (or use the included `mvnw` wrapper)
- **PostgreSQL 15+** (or a Supabase account for hosted PostgreSQL)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Weekly Report Generator"
```

### 2. Database Setup

The application uses PostgreSQL. You can either use a local PostgreSQL instance or a hosted one (e.g., Supabase).

**Option A: Local PostgreSQL**

```bash
# Create a database
createdb weeklyreport

# Note your connection details:
# Host: localhost, Port: 5432, Database: weeklyreport
# Username/password: your PostgreSQL credentials
```

**Option B: Supabase (Hosted)**

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note the connection string from **Settings → Database**

### 3. Backend Setup

```bash
cd backend
```

**Configure environment variables** — create a `.env` file in the `backend/` directory (or set them in your shell):

```env
DB_URL=jdbc:postgresql://localhost:5432/weeklyreport
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=YourSecretKeyForJWTSigningMustBeAtLeast256BitsLongForHS256Algorithm!!
JWT_EXPIRATION_MS=86400000
```

> If you prefer, you can also set these directly in `src/main/resources/application.properties` (not recommended for production).

**Install dependencies and run:**

```bash
# Install dependencies (Maven will download automatically)
./mvnw clean install

# Run the backend (starts on port 8080)
./mvnw spring-boot:run
```

The backend API will be available at `http://localhost:8080`.

**Seed demo data (optional):**

Once the backend is running, you can populate demo data by calling the seed endpoint:

```bash
curl -X POST http://localhost:8080/api/seed
```

This creates:
- 6 users (1 admin, 1 manager, 4 team members) — all with password `password123`
- 4 projects
- Sample reports in various statuses (Draft, Submitted, Approved)
- Activity feed entries

### 4. Frontend Setup

```bash
cd frontend
```

**Configure the API URL** — create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Install dependencies and run:**

```bash
# Install dependencies
npm install

# Run the development server (starts on port 3000)
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 5. Demo Accounts

After seeding, you can log in with any of these accounts (password: `password123` for all):

| Name | Email | Role |
|------|-------|------|
| Nuwan Admin | `admin@example.com` | Admin |
| Sarah Manager | `manager@example.com` | Admin (Manager) |
| Daniel Perera | `daniel@example.com` | Team Member |
| Nethmi Silva | `nethmi@example.com` | Team Member |
| Kavindu Jay | `kavindu@example.com` | Team Member |
| Team Member | `member@example.com` | Team Member |

## Project Structure

```
Weekly Report Generator/
├── backend/
│   └── src/main/java/com/nuwan/weeklyreport/
│       ├── config/          # Security, CORS, JWT, seed data
│       ├── controller/      # REST API endpoints
│       ├── dao/entity/      # JPA entities (database models)
│       ├── dao/repository/  # Spring Data repositories
│       ├── dto/request/     # Request DTOs (input validation)
│       ├── dto/response/    # Response DTOs (output shapes)
│       ├── enums/           # Status, role, priority enums
│       ├── exception/       # Error handling
│       └── service/         # Business logic
│
└── frontend/
    └── src/
        ├── components/      # React components (charts, dashboard, reports, etc.)
        ├── config/          # Navigation, activity config
        ├── hooks/           # Custom hooks (auth, API, report form)
        ├── lib/             # Utilities, permissions, validators
        ├── pages/           # Next.js routes
        ├── services/        # Mock DB utilities (dev only)
        ├── styles/          # Global CSS
        └── types/           # TypeScript type definitions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/session` | Get current session |
| GET | `/api/reports?page=0&size=8` | List reports (paginated + filtered) |
| GET | `/api/reports/{id}` | Get single report |
| POST | `/api/reports` | Create report |
| PUT | `/api/reports/{id}` | Update report |
| POST | `/api/reports/{id}/submit` | Submit report for review |
| DELETE | `/api/reports/{id}` | Delete report |
| GET | `/api/reviews/queue` | Get review queue |
| POST | `/api/reviews/approve` | Approve report |
| POST | `/api/reviews/request-correction` | Request changes |
| GET | `/api/dashboard` | Get dashboard data |
| GET | `/api/activity` | Get activity feed |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| POST | `/api/seed` | Seed demo data |

## Key Features

- **Role-based access control** — Team Members and Admin/Manager roles with granular permissions
- **Weekly report management** — Create, edit, submit reports with structured fields (tasks, blockers, achievements, hours breakdown)
- **Review workflow** — Full Draft → Submitted → Approved / Needs Correction → Resubmit cycle
- **Version history** — Track every version of a report through the correction cycle
- **Team dashboard** — Metrics, charts (task trends, status by member, workload by project, time by task type), activity feed
- **Project management** — CRUD with member assignment
- **User management** — Admin-only user CRUD with role and status management
- **AI Assistant (demo)** — Chat widget with mock responses (bonus feature)

## Build for Production

```bash
# Backend
cd backend
./mvnw clean package -DskipTests
java -jar target/weeklyreport-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
npm start
```
