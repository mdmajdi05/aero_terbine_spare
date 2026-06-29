# Project Context — AeroTurbineSpare

## Purpose
AeroTurbineSpare is a B2B aerospace parts sourcing platform for OEMs, MRO facilities, military contractors, and procurement professionals. Users search a catalog of 55,000+ parts (NSN, CAGE, part number), submit RFQs, track orders, and manage their procurement — all with ISO/AS9120 quality assurance.

## Brand Identity
- **Tagline**: "Precision Aerospace Parts Sourcing — Fast, Certified, Global"
- **CAGE Code**: 8ATR9 (trust signal displayed prominently)
- **Tone**: Professional, data-driven, enterprise-grade (not a portfolio site)

## Frontend Pages (48 routes)

| Route | Purpose | Auth Required |
|---|---|---|
| `/` | Homepage — hero, search, stats, industries, testimonials | No |
| `/catalog` | Parts catalog with search, filter, grid/list toggle, sort, pagination | No |
| `/catalog/[id]` | Part detail — specs, stock, cross-refs, actions | No |
| `/products/[slug]` | **NEW** — Product category detail with items (list/card toggle) | No |
| `/parts/[slug]` | **NEW** — Part category detail with items (list/card toggle) | No |
| `/items/[slug]` | **NEW** — Single item detail page | No |
| `/industries` | All industry verticals grid | No |
| `/industries/[slug]` | Industry detail + product/part categories | No |
| `/rfq` | Multi-step RFQ form (Standard / Urgent / Critical) | No (optional auth) |
| `/inventory` | Submit excess inventory for evaluation | Yes (Trader+) |
| `/about` | Company story, mission, certifications | No |
| `/quality` | Quality assurance process, ISO/AS9120 details | No |
| `/contact` | Contact form, phone, address | No |
| `/blog` | Blog listing | No |
| `/blog/[slug]` | Blog post detail | No |
| `/login` | Login form | No |
| `/register` | Registration form | No |
| `/terms` | Terms & Conditions | No |
| `/privacy` | Privacy Policy | No |
| `/dashboard` | User dashboard (stats, recent RFQs) | Yes (any role) |
| `/dashboard/rfqs` | My RFQ history | Yes |
| `/dashboard/orders` | My orders | Yes |
| `/dashboard/saved` | Saved parts | Yes |
| `/dashboard/profile` | Profile settings | Yes |
| `/dashboard/parts` | My parts (Trader) | Yes (Trader+) |
| `/dashboard/posts` | My blog posts (ContentManager+) | Yes |
| `/dashboard/posts/new` | New blog post | Yes (ContentManager+) |
| `/dashboard/posts/edit/[id]` | Edit blog post | Yes (ContentManager+) |
| `/dashboard/categories` | Manage blog categories | Yes (ContentManager+) |
| `/dashboard/tags` | Manage blog tags | Yes (ContentManager+) |
| `/dashboard/media` | Blog media library | Yes (ContentManager+) |
| `/dashboard/comments` | Moderate blog comments | Yes (ContentManager+) |
| `/admin` | Admin panel (user mgmt, RFQ mgmt, parts, inventory, categories, items) | Yes (Admin+) |
| `/admin/users` | Manage users | Yes (Admin+) |
| `/admin/parts` | Manage parts catalog | Yes (Admin+) |
| `/admin/rfqs` | Manage RFQs | Yes (Admin+) |
| `/admin/export` | Export data | Yes (Admin+) |
| `/admin/branding` | Branding / site config | Yes (Admin+) |
| `/admin/categories` | **NEW** — Manage Nav categories (FSG/Industry/Product/Part) with config editors | Yes (Admin+) |
| `/admin/category-items` | **NEW** — CRUD items per category + Bulk Import + Live Excel | Yes (Admin+) |
| `/superadmin` | SuperAdmin dashboard (full system control) | Yes (SuperAdmin) |
| `/superadmin/users` | Create/manage all users | Yes (SuperAdmin) |
| `/superadmin/audit-logs` | View all audit logs | Yes (SuperAdmin) |
| `/superadmin/settings` | System settings (SMTP, limits, maintenance) | Yes (SuperAdmin) |
| `/superadmin/backup` | Database backup | Yes (SuperAdmin) |
| `/superadmin/export` | Master data export | Yes (SuperAdmin) |
| `/unauthorized` | Access denied page | No |

## Data Flow

### Original (Mock + Real API)
```
User Action → Service (src/services/) → request() (src/lib/api-client.ts)
                                            ├── USE_MOCK=true  → JSON file / localStorage (mockRouter)
                                            └── USE_MOCK=false → fetch() to backend API
```

### CMS — Dynamic Categories & Items
```
Admin UI → Backend API → DB (source of truth)
                           ↓
               regeneratePublicJson()
                           ↓
               public/data/categories.json (includes items + config)
                           ↓
               Frontend reads via API or static JSON fallback
```

## Auth Flow

```
Login → POST /auth/login → Mock: check users.json / Real: check DB
     → Response: { token, user }
     → Save to localStorage (ats_session)
     → Set cookie `ats_role` (for Next.js middleware)
     → Middleware checks cookie on protected routes
     → On 401: clear session, redirect to /login
```

## RBAC Matrix

| Role | Dashboard | Admin Pages | SuperAdmin Pages | Blog (write) | Inventory |
|------|-----------|-------------|------------------|--------------|-----------|
| User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Trader | ✅ | ❌ | ❌ | ❌ | ✅ |
| ContentManager | ✅ | ❌ | ❌ | ✅ | ❌ |
| Admin | ✅ | ✅ | ❌ | ✅ | ✅ |
| SuperAdmin | ✅ | ✅ | ✅ | ✅ | ✅ |

## Database Schema (Prisma — 19 models)

- **Core**: `User`, `Part`, `RFQ`, `RFQItem`, `Order`, `OrderItem`, `SavedPart`
- **Navigation**: `NavCategory` (types: fsg, industry, product, part), `CategoryItem`
- **Inventory**: `InventorySubmission`
- **Content**: `BlogPost`, `BlogCategory`, `BlogTag`, `BlogMedia`, `BlogComment`
- **Blog Admin**: `BlogPostVersion`, `BlogRedirect`
- **Admin**: `AuditLog`, `BackupRecord`, `SystemSetting`, `ExcelFeed`

## Backend API Endpoints (35+ routes)

| Domain | Prefix | Key Endpoints |
|--------|--------|---------------|
| Auth | `/api/v1/auth` | login, register, logout, me, refresh |
| Parts | `/api/v1/parts` | list (search/filter), getById, CRUD (admin) |
| RFQ | `/api/v1/rfqs` | submit, my-rfqs, status update (admin) |
| Dashboard | `/api/v1/dashboard` | orders, saved-parts, profile |
| **Nav Categories** | `/nav-categories` | GET full tree (FSG, industries, products+items, parts+items) |
| **Nav Categories** | `/categories` | GET FSG categories |
| **Nav Categories** | `/industries`, `/industries/:slug` | GET industries |
| **Category Items** | `/category-items`, `/category-items/:slug` | GET items (public) |
| **Category Items (Admin)** | `/admin/category-items` | POST/PUT/DELETE, bulk-import, reorder |
| Admin | `/api/v1/admin` | users (CRUD+), parts, rfqs, export, import |
| SuperAdmin | `/api/v1/superadmin` | stats, audit-logs, settings, backup, make-admin |
| Inventory | `/api/v1/inventory` | submit, list (admin) |
| Blog | `/api/v1/blog` | posts (public), manage (auth), categories, tags, media, comments |
| Blog | `/api/v1/blog/manage/posts/search` | internal link search |
| Blog | `/api/v1/blog/versions` | post version history |
| Blog | `/api/v1/blog/redirects` | URL redirect management |
| Blog | `/api/v1/blog/seo/link-checker` | link analysis |
| Config | `/api/v1/config` | site config (read public, write admin) |
| Excel | `/api/v1/admin/excel` | status, rows, connect, toggle, disconnect |

## Integration Points

| Integration | Purpose | Status |
|-------------|---------|--------|
| **Neon PostgreSQL** | Primary database | Connected (real creds in .env) |
| **Cloudinary** | Blog media storage / upload | Env vars placeholders; DB override supported |
| **SendGrid (Nodemailer)** | RFQ notifications, order updates | SMTP creds are placeholders |
| **Helmet / CORS** | Security headers | Active |
| **Rate Limiting** | Global + RFQ-specific | Active (100 req/window, 10 RFQ/window) |
| **Prisma Studio** | DB admin UI | Available via `npm run db:studio` |

## Technical Debt & Gaps

1. **No tests** anywhere — frontend or backend
2. **Blog system** has full backend and frontend UI but no seed/mock data
3. **JWT secrets are placeholders** in backend .env
4. **SMTP credentials are placeholders** — email sending non-functional in real mode
5. **Parts Comparison tool** designed but not implemented
6. **Multi-currency** stubbed in types but not wired in UI
7. **PDF/CSV export** only has JSON export implemented (backend has json2csv dep)
8. **Docker setup** not configured despite being referenced in docs
9. **Backend `.env` still has placeholder JWT secrets** — functional for dev only, must be replaced for production

## CMS Architecture Summary (June 2026)

- **Single `NavCategory` table** with `type` discriminator (fsg, industry, product, part)
- **`CategoryItem` model** — flexible `data` JSON field for any column structure
- **cardConfig/pageConfig** as JSON fields on NavCategory — extendable without migrations
- **Auto-sync public JSON** — `regeneratePublicJson()` called on every CRUD mutation
- **Public JSON fallback** — frontend serves from `public/data/categories.json` when backend offline
- **Live Excel** — frontend reads XLSX directly via XLSX.js (no backend dependency)
- **ListView** (sortable table) + **CardView** (configurable grid) — toggle per category view
- **39 categories** + **82 sample items** seeded by default

## Recent Improvements (June 2026)

### CMS — Categories & Items
- Full NavCategory CRUD with `cardConfig`/`pageConfig` support
- CategoryItem CRUD (create, update, delete, bulk import, reorder)
- Dynamic routes: `/products/[slug]`, `/parts/[slug]`, `/items/[slug]`
- ListView + CardView components with search + sort + toggle
- Admin bulk import: JSON upload, Excel upload, paste, Live Excel Connect

### Previous — Blog & Auth
- Open Graph tags (og:title, og:description, og:image, og:url, og:type) on blog/[slug]
- Twitter Card tags (summary_large_image, title, description, image)
- Canonical URL per post with `<link rel="canonical">`
- Per-post robots meta (index/noindex, follow/nofollow)
- SERP preview component in SEO sidebar — real-time Google result simulation
- Image alt text SEO check (5 pts) added to scoring engine
- Zod validation on all blog mutation endpoints
- Rate limiting on comment submission (5 per 15 min per IP)
- DOMPurify HTML sanitization before saving post content
- SafeImage component — auto-detects Cloudinary URLs for `next/image`
- TipTap image dialog with Upload (Cloudinary) and From URL tabs
- Bulk operations on posts list
- beforeunload confirmation via `useUnsavedChanges` hook
- Keyboard shortcut cheat sheet
- Centralized token refresh with 401 retry
