# DCMS API Server

Express + Prisma + PostgreSQL backend for the Debt Collection Management System.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or Docker)

### PostgreSQL with Docker

From the project root:

```bash
docker compose up -d
```

Or a one-off container:

```bash
docker run --name dcms-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dcms -p 5432:5432 -d postgres:16
```

## Setup

```bash
cd server
cp .env.example .env
# Edit .env if your Postgres credentials differ

npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

API runs at **http://localhost:3001**.

## Seed users

| Username        | Password      | Role          |
|-----------------|---------------|---------------|
| `manager`       | `password123` | Manager       |
| `field.officer` | `password123` | Field officer |

## API endpoints

| Method | Path                 | Auth | Description                    |
|--------|----------------------|------|--------------------------------|
| GET    | `/api/health`        | No   | Health + DB connectivity       |
| POST   | `/api/auth/login`    | No   | Returns JWT + user             |
| GET    | `/api/auth/me`       | Yes  | Current user                   |
| GET    | `/api/accounts`      | Yes  | List accounts (role-filtered)  |
| GET    | `/api/accounts/:id`  | Yes  | Account detail + history       |
| POST   | `/api/visits`        | FO   | Record a field visit           |

### Login example

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"manager\",\"password\":\"password123\"}"
```

### Accounts example

```bash
curl http://localhost:3001/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend integration

From the project root, run the Vite dev server (`npm run dev`). Requests to `/api/*` are proxied to this server (see root `vite.config.ts`).

Use `VITE_API_URL=` empty in dev to rely on the proxy, or set `VITE_API_URL=http://localhost:3001` for direct calls.
