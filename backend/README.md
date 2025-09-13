# SaaS Notes Backend (MERN)

## Multi-Tenancy Approach

Shared schema with a `tenantId` field in all relevant collections (User, Note). This ensures strict data isolation between tenants (Acme, Globex).

## Features

- JWT-based authentication
- Role-based access (Admin, Member)
- Subscription gating (Free: 3 notes, Pro: unlimited)
- CRUD for notes
- Tenant upgrade endpoint
- Health endpoint
- CORS enabled

## Test Accounts

All passwords: `password`

- admin@acme.test (Admin, Acme)
- user@acme.test (Member, Acme)
- admin@globex.test (Admin, Globex)
- user@globex.test (Member, Globex)

## Setup

1. Install dependencies: `npm install`
2. Seed database: `node seed/seed.js`
3. Start server: `npm run dev`

## Environment

- Local MongoDB (update `MONGO_URI` in `.env` for production)

## Endpoints

### Authentication

- POST /auth/login — Login and receive JWT

### Notes (tenant/user scoped)

- POST /notes — Create a new note
- GET /notes — List all notes for tenant
- GET /notes/:id — Get a specific note
- PUT /notes/:id — Update a note
- DELETE /notes/:id — Delete a note

### Tenant Management

- GET /tenants/:slug — Get tenant info
- POST /tenants/:slug/upgrade — Upgrade tenant plan
- POST /tenants/:slug/invite — Invite a user to tenant

### Health

- GET /health — Health check endpoint

## Deployment

Host on Vercel (Node.js API). Update MongoDB URI for production.
