# AeroTurbineSpare — Precision Aerospace Parts Sourcing Platform

**B2B procurement platform** for aerospace OEMs, MRO facilities, military contractors, and procurement professionals.  
Search 55,000+ parts by NSN, CAGE, or part number — submit RFQs, track orders, manage procurement.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express.js, Prisma ORM, Neon PostgreSQL |
| Auth | JWT (access + refresh tokens), RBAC (5 roles) |
| Editor | TipTap (ProseMirror) with 15+ extensions |
| Icons | Lucide React |

---

## Quick Start

```bash
# Frontend
npm install
npm run dev              # → http://localhost:3000

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev   # requires DIRECT_DATABASE_URL in .env
npm run seed:categories   # 39 categories + 82 sample items
npm run dev               # → http://localhost:4000
```

**Mock mode** runs without backend — set `NEXT_PUBLIC_USE_MOCK=true` in `.env.local`.

---

## CMS Features

- **Dynamic categories** — Add industries, products, parts via admin — pages auto-create
- **Category items** — CRUD per category with flexible `data` JSON field
- **Bulk import** — Upload JSON, Excel (.xlsx/.xls/.csv), or paste tabular data
- **Live Excel Connect** — Frontend reads Excel directly via XLSX.js, real-time preview
- **ListView** — Sortable table with search, auto-detected columns, mobile responsive
- **CardView** — Configurable grid with images, placeholders, buttons
- **Offline fallback** — `public/data/categories.json` auto-synced from DB on every change

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, search, stats, industries, testimonials |
| `/catalog` | Parts catalog with search/filter, grid/list toggle |
| `/products/[slug]` | Dynamic product category + items |
| `/parts/[slug]` | Dynamic part category + items |
| `/industries/[slug]` | Industry detail + categories |
| `/items/[slug]` | Single item detail |
| `/admin/categories` | Manage nav categories + config editors |
| `/admin/category-items` | CRUD items per category + Bulk Import |

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | No | `true` = mock mode (no backend needed) |
| `NEXT_PUBLIC_API_URL` | No | Backend URL for real mode |
| `DATABASE_URL` | Backend only | Neon pooled connection string |
| `DIRECT_DATABASE_URL` | Backend only | Direct Neon URL for migrations |
| `JWT_SECRET` | Backend only | Access token secret (≥ 32 chars) |

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon PostgreSQL](https://neon.tech/docs)
