# AeroTurbineSpare — Backend API

Node.js · Express 4 · TypeScript 5 · Prisma 5 · Neon PostgreSQL

## Quick start

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL and JWT secrets
npm install
npx prisma generate           # generate Prisma client
npx prisma migrate dev        # run migrations (needs DIRECT_DATABASE_URL)
npm run db:seed               # seed demo users + parts
npm run dev                   # start with hot-reload (tsx watch)
```

The API will be available at `http://localhost:4000/api/v1`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooled connection string (PgBouncer) |
| `DIRECT_DATABASE_URL` | ✅ | Direct Neon URL for migrations |
| `JWT_SECRET` | ✅ | Access token secret (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (≥ 32 chars) |
| `DB_TYPE` | optional | `neon` (default) — informational only |
| `SMTP_HOST/PORT/USER/PASS` | optional | SMTP credentials for email |
| `FRONTEND_URL` | optional | CORS allowed origin (default `http://localhost:3000`) |

## API routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Create account |
| POST | `/api/v1/auth/login` | — | Login, receive JWT pair |
| POST | `/api/v1/auth/refresh` | — | Exchange refresh token |
| GET | `/api/v1/auth/me` | User | Get own profile |
| PUT | `/api/v1/auth/me` | User | Update own profile |
| POST | `/api/v1/auth/me/change-password` | User | Change password |
| GET | `/api/v1/parts` | — | List parts (search, category, stockStatus, page, limit) |
| GET | `/api/v1/parts/:id` | — | Get single part by id or NSN |
| GET | `/api/v1/parts/summary` | — | Stock summary counts |
| POST | `/api/v1/parts` | Admin | Create part |
| PUT | `/api/v1/parts/:id` | Admin | Update part |
| DELETE | `/api/v1/parts/:id` | Admin | Delete part |
| POST | `/api/v1/rfqs` | — | Submit RFQ (rate-limited) |
| GET | `/api/v1/rfqs/my` | User | Own RFQs |
| GET | `/api/v1/rfqs` | Admin | All RFQs |
| GET | `/api/v1/rfqs/:id` | User | Single RFQ |
| PUT | `/api/v1/rfqs/:id/status` | Admin | Update RFQ status |
| GET | `/api/v1/dashboard/stats` | User | Dashboard stats |
| GET | `/api/v1/dashboard/saved-parts` | User | Saved parts list |
| POST | `/api/v1/dashboard/saved-parts` | User | Save a part |
| DELETE | `/api/v1/dashboard/saved-parts/:partId` | User | Unsave a part |
| GET | `/api/v1/dashboard/orders` | User | Order history |
| GET | `/api/v1/admin/stats` | Admin | Admin dashboard stats |
| GET | `/api/v1/admin/users` | Admin | All users |
| PUT | `/api/v1/admin/users/:id` | Admin | Update user role / active |
| POST | `/api/v1/admin/users/:id/suspend` | Admin | Suspend user |
| GET | `/api/v1/admin/parts` | Admin | All parts (admin view) |
| POST | `/api/v1/admin/import/parts` | Admin | Bulk import parts (JSON array) |
| GET | `/api/v1/admin/export/:target?format=json|csv` | Admin | Export users/rfqs/parts |
| GET | `/api/v1/superadmin/stats` | SuperAdmin | Super-admin stats |
| GET | `/api/v1/superadmin/users` | SuperAdmin | All users |
| PUT | `/api/v1/superadmin/users/:id/role` | SuperAdmin | Change user role |
| GET | `/api/v1/superadmin/audit-logs` | SuperAdmin | Audit log viewer |
| DELETE | `/api/v1/superadmin/audit-logs` | SuperAdmin | Purge all audit logs |
| GET | `/api/v1/superadmin/settings` | SuperAdmin | System settings |
| PUT | `/api/v1/superadmin/settings` | SuperAdmin | Update system settings |
| POST | `/api/v1/superadmin/backup/trigger` | SuperAdmin | Trigger manual backup |
| GET | `/api/v1/superadmin/backup/list` | SuperAdmin | List backups |
| GET | `/api/v1/superadmin/backup/:id/download` | SuperAdmin | Download backup ZIP |
| GET | `/api/v1/superadmin/export/master` | SuperAdmin | Master ZIP export (all data) |
| POST | `/api/v1/inventory` | — | Submit inventory listing |
| GET | `/api/v1/inventory` | Admin | List inventory submissions |
| PUT | `/api/v1/inventory/:id` | Admin | Update submission status |

## Switching databases

1. Change `DB_TYPE` in `.env` (informational only)
2. Update `provider` in `prisma/schema.prisma` (e.g. `"mysql"`)
3. Run `npx prisma migrate dev`

No application code changes required — all database access goes through Prisma repositories.

## Default seed credentials

| Email | Password | Role |
|---|---|---|
| superadmin@aeroturbinespare.com | SuperAdmin@2025! | SuperAdmin |
| admin@aeroturbinespare.com | Admin@2025! | Admin |
| trader@aeroturbinespare.com | Trader@2025! | Trader |
| alice@boeing.com | User@2025! | User |
| jean@airbus.com | User@2025! | User |
