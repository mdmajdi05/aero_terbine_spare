# TODO — AeroTurbineSpare

## 🔴 High Priority
- [ ] Replace placeholder JWT secrets in `backend/.env` (lines 27-28 are still `CHANGE_ME_*`)
- [ ] Configure real SMTP/SendGrid credentials in `backend/.env` (line 35-36: `your_sendgrid_api_key`)
- [ ] Add Cloudinary credentials to `backend/.env` (missing; only in `.env.example`)
- [ ] Set a real `BACKUP_ENCRYPTION_KEY` in `backend/.env` (line 54: `CHANGE_ME_32_CHARS_*`)
- [ ] Apply migration to Neon DB: `cd backend && npx prisma migrate dev`
- [ ] Seed categories + items: `cd backend && npm run seed:categories`

## ✅ Completed

### CMS — Categories + Items System (June 2026)
- [x] CategoryItem Prisma model + cardConfig/pageConfig JSON fields on NavCategory
- [x] Migration: `20260628000001_add_category_items` (new table + columns)
- [x] Backend `category-item.controller.ts` — CRUD + bulk import + reorder
- [x] Backend `nav-category.controller.ts` — DB reads, items in JSON output
- [x] Seed script: 39 categories + 82 sample items + config defaults
- [x] `/products/[slug]` — dynamic product category page with items
- [x] `/parts/[slug]` — dynamic part category page with items
- [x] `/industries/[slug]` — industry detail + product/part sections
- [x] `/items/[slug]` — single item detail page
- [x] `/catalog` — ?view=list|card toggle
- [x] `ListView.tsx` — sortable, searchable, auto-columns, mobile responsive
- [x] `CardView.tsx` — grid, image/placeholder, configurable fields/buttons
- [x] Admin `/admin/category-items` — full CRUD + Bulk Import (JSON/Excel/paste) + Live Excel Connect
- [x] Admin `/admin/categories` — Manage Items button + cardConfig/pageConfig editors
- [x] Admin layout — Category Items sidebar link
- [x] `api-client.ts` — mock handlers for category-items, removed static intercepts
- [x] `public/data/categories.json` — auto-synced (39 cats, 82 items)
- [x] ARCHITECTURE.md — updated with all changes
- [x] All 6 phases implemented. Frontend + Backend TypeScript: 0 errors

### Previous (Blog + Auth + Dashboard)
- [x] Token refresh mechanism — `src/lib/token.ts` shared module with auto-refresh on 401
- [x] Blog service 401 handling — `src/services/blogService.ts` now refreshes + retries on 401
- [x] Main API client 401 handling — `src/lib/api-client.ts` now refreshes before clearing session
- [x] Blog form auto-save — `src/app/dashboard/posts/new/page.tsx` saves/restores all form fields to localStorage
- [x] JWT expiry increased — `backend/.env` `JWT_EXPIRES_IN` changed from `15m` to `24h`
- [x] Neon connection resilience — pooled URL via PgBouncer, retry on connect & query, token refresh tolerant of DB blips
- [x] Blog editor overhaul — full TipTap editor with SVG toolbar, bubble menu, slash commands, tables, YouTube, task lists, text color, highlight, alignment, focus mode, word/char count, reading time
- [x] Internal linking — backend search endpoint `GET /blog/manage/posts/search`, frontend link editor with internal post search popover
- [x] SEO score enhanced — internal/external link counting, keyword-in-heading check, image alt check, redistributed scoring
- [x] SafeImage component — auto-detects Cloudinary URLs for `next/image`, falls back to `<img>` for external URLs (eliminates `remotePatterns` errors)
- [x] OG Tags + Twitter Cards — dynamic meta tags on blog/[slug] page via useEffect
- [x] Canonical URL + Robots meta per post — new fields in Prisma schema, backend API, SEO sidebar, and blog frontend rendering
- [x] SERP Preview component — real-time Google search result preview in SEO sidebar
- [x] Cover image alt text field — separate `coverAlt` input in new/edit post pages, stored in DB, rendered on blog frontend
- [x] TipTap image dialog — Upload tab (Cloudinary) + URL tab (external) with alt text input + preview
- [x] Image bubble menu alt text editing — click image in editor → set/edit alt text inline
- [x] Drag-and-drop / paste image alt prompt — opens image dialog for alt text after upload
- [x] Bulk operations on posts list — select multiple posts → bulk publish/draft/archive/trash/delete
- [x] beforeunload confirmation — useUnsavedChanges hook protects against accidental navigation
- [x] Keyboard shortcut cheat sheet — press `?` or click toolbar button to view all shortcuts
- [x] DOMPurify HTML sanitization — cleans post content before saving
- [x] Zod validation on all blog backend endpoints — create/update post, category, tag, comment
- [x] Rate limiting on comment submissions — 5 per 15 min per IP via express-rate-limit

## 🟡 Medium Priority
- [ ] Seed blog data (categories, tags, sample posts) in `backend/prisma/seed.ts`
- [ ] Create blog mock JSON data in `src/data/` — blog frontend pages exist but no mock data
- [ ] Clean up or remove `src/data/industries-old.json` (appears to be a duplicate/legacy copy)
- [ ] Add a test framework and write initial tests (none exist anywhere in project)
- [ ] Add `GET /api/branding` route or file-based handler — `useSiteConfig` calls `/api/branding` but no handler exists

## 🟢 Low Priority
- [ ] Implement Parts Comparison tool (mentioned in `prompt.md` §3.2, not implemented)
- [ ] Add multi-currency / multi-language i18n support (stubbed in types, not wired)
- [ ] Add Docker Compose config for local dev (for PostgreSQL + app)
- [ ] Implement PDF export for quotes/orders (`backend` has `json2csv` dep, no PDF library)
- [ ] Add `Loading` / `ErrorBoundary` components for pages that currently lack them
- [ ] Review 404 and error pages for consistency across the app
