# SaaS Notes — Multi‑Tenant MERN App

A production‑ready, multi‑tenant SaaS Notes application built with the MERN stack. Each tenant (company) manages its own users and notes with strict tenant isolation, role‑based access control, and a simple subscription model (Free vs Pro).

## Features

- Multi‑tenant isolation: users and notes scoped by tenant
- Authentication & authorization: JWT auth; roles: `admin`, `member`
- Notes CRUD with subscription gating:
  - Free plan: up to 3 notes per tenant
  - Pro plan: unlimited notes
- Admin actions:
  - Invite users to the tenant
  - Upgrade tenant plan to Pro
- Modern UI:
  - Clean, responsive dashboard
  - Inline edit for notes
  - Invite User modal (admin only)
- Session persistence on the frontend
- API-first backend with clear endpoints

## Tech Stack

- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT
- Frontend: React (Vite), Tailwind CSS, Axios
- Tooling: ESLint (where configured), Vercel/Node deployment ready

## Monorepo Structure

```
.
├─ backend/
│  ├─ src/
│  │  ├─ models/        # Tenant, User, Note schemas
│  │  ├─ routes/        # auth, notes, tenants
│  │  └─ server.js      # Express app bootstrap
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  │  ├─ NotesDashboard.jsx
│  │  │  └─ InviteUser.jsx
│  │  └─ App.jsx
│  ├─ .env.example
│  └─ package.json
└─ README.md
```

Note: File names may vary slightly depending on last edits, but this is the intended layout.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ (bundled with Node)
- MongoDB 5+ running locally or a MongoDB Atlas connection string

## Environment Variables

Create `.env` files for both backend and frontend.

Backend `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saas-notes
JWT_SECRET=replace_with_a_long_random_string
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Frontend `frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

- Set `VITE_API_URL` to your backend base URL (without a trailing slash).

## Installation & Running (Local)

Open two terminals or use split panes.

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

- Backend will start on `http://localhost:5000` (configurable via `.env`).
- Frontend will start on `http://localhost:5173`.

Ensure MongoDB is running:

## Usage

1. Login

   - Use an existing seeded admin/member account (or create one based on your setup).
   - On successful login, the frontend will persist the JWT and user info.

2. Create notes

   - Use the “Create a note” card on the left panel.
   - On Free plan, tenants are limited to 3 notes total.

3. Upgrade plan (Admin only)

   - If the tenant reaches the Free limit, admins will see an Upgrade action.
   - Upgrading switches the tenant to Pro and removes the limit.

4. Invite users (Admin only)

   - Click “Invite User” in the top header to open the Invite modal.
   - Provide email and role (`member` or `admin`) and submit.

5. Edit/Delete notes
   - Edit is inline; Save/Cancel actions appear near the fields.
   - Delete removes the note permanently.

## Frontend Highlights

- `NotesDashboard.jsx`
  - Header shows current user and tenant
  - “Invite User” (admin) button opens `InviteUser` in a modal
  - Left: Note composer form
  - Right: Notes list with edit and delete actions (always visible)
  - Handles plan gating and shows upgrade prompts for admins
- `InviteUser.jsx`
  - Reusable as a page or modal via `variant` prop
  - Admin-only rendering

## API Overview

Base URL: `VITE_API_URL` (e.g., `http://localhost:5000`)

Auth

- POST `/auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret" }`
  - Returns: `{ token, user }`

Notes (JWT required)

- GET `/notes` — list notes for the user’s tenant
- POST `/notes` — create a note `{ title, content }`
  - Enforces plan limits (Free: max 3 per tenant)
- GET `/notes/:id` — fetch a single note
- PUT `/notes/:id` — update a note `{ title, content }`
- DELETE `/notes/:id` — delete a note

Tenants (JWT required)

- GET `/tenants/:slug` — get tenant info (e.g., plan)
- POST `/tenants/:slug/upgrade` — admin only; upgrade to Pro
- POST `/tenants/:slug/invite` — admin only; invite a user `{ email, role }`

Health

- GET `/health` — basic server healthcheck

All protected endpoints expect `Authorization: Bearer <token>`.

## Data Model (Conceptual)

- Tenant
  - `slug`, `name`, `plan` in {`free`, `pro`}
- User
  - `email`, `passwordHash`, `name?`, `role` in {`admin`, `member`}, `tenant` ref
- Note
  - `title`, `content`, `tenant` ref, `createdBy` ref, timestamps

All accesses are scoped to the authenticated user’s `tenant`.

## Multi‑Tenancy Strategy

Chosen approach: Shared schema with a tenant field (single database, shared collections).

- What this means

  - A single MongoDB database and shared collections for all tenants.
  - Each multi-tenant document includes a `tenant` field referencing the `Tenant` (e.g., on `User` and `Note`).
  - All read/write queries include a tenant filter to enforce isolation.

- Why i chose this

  - Simple to develop and operate; lowest cost at early stages.
  - Easy to onboard new tenants without provisioning separate schemas/DBs.
  - Straightforward migrations and maintenance.

