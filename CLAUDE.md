# AeroTurbineSpare

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Tiptap, Zustand, react-hook-form + Zod
- **Backend**: Node.js, Express.js, Prisma ORM, Neon PostgreSQL, JWT Auth, Cloudinary, Nodemailer, Winston
- **Mock Layer**: JSON files (`src/data/`) + localStorage — switch via `NEXT_PUBLIC_USE_MOCK`

## Rules
1. Frontend-first with mock data — backend not required for dev
2. All dynamic/pages use `'use client'` (browser state relies on localStorage)
3. No `/src/app/api/` routes — all data flows through `src/lib/api-client.ts`
4. Call `request()` from api-client — it auto-routes mock vs real
5. RBAC: SuperAdmin > Admin > ContentManager > Trader > User (5 roles)
6. Check `AGENTS.md` before writing Next.js code (v16 breaking changes)

## CMS Architecture (NavCategory + CategoryItem)
- Single `NavCategory` table with `type` field (fsg, industry, product, part)
- `CategoryItem` model with `data` JSON for flexible columns
- `cardConfig` / `pageConfig` JSON on NavCategory — extendable without migrations
- `regeneratePublicJson()` auto-syncs to `public/data/categories.json` on every CRUD
- Dynamic routes: `/products/[slug]`, `/parts/[slug]`, `/industries/[slug]`, `/items/[slug]`
- Admin: `/admin/categories` + `/admin/category-items` (Bulk Import, Live Excel Connect)
- Display: ListView (sortable table) + CardView (grid with image/placeholder)

## Folder Structure
```
aeroturbinespare.com/
├── src/                # Next.js frontend (App Router)
│   ├── app/            # Pages: /, /catalog, /rfq, /products/[slug], /parts/[slug], /items/[slug],
│   │                  #         /industries/[slug], /dashboard/*, /superadmin/*, /blog/*,
│   │                  #         /admin/categories, /admin/category-items
│   ├── components/     # UI (Button, Card, Modal) + layout + feature: catalog/ListView, catalog/CardView
│   ├── data/           # JSON mock data: products.json, users.json, categories.json, industries.json
│   ├── hooks/          # useAuth, useSiteConfig, useSavedParts
│   ├── lib/            # api-client.ts (central request router + mock handlers), token.ts
│   ├── services/       # productService, rfqService, authService, blogService, etc.
│   ├── types/          # index.ts (global types + CategoryItem), blog.ts
│   └── middleware.ts   # Next.js edge middleware (RBAC guard + redirect)
├── backend/            # Express.js REST API
│   ├── prisma/         # schema.prisma (19 models: +NavCategory, +CategoryItem)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── nav-category.controller.ts  # DB reads, config fields, items in JSON
│   │   │   └── category-item.controller.ts  # CRUD + bulk import + reorder
│   │   └── routes/
│   │       ├── nav-category.routes.ts
│   │       └── category-item.routes.ts
│   └── uploads/        # Multer file upload destination
└── public/data/        # categories.json (auto-synced by backend)
```
