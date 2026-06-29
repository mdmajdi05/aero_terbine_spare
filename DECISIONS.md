# Key Architectural Decisions — AeroTurbineSpare

## 1. Frontend-First with Mock Layer
**Decision**: Build the entire UI with real functionality using JSON files + localStorage before writing backend code. The `request()` function in `src/lib/api-client.ts` transparently routes between mock and real based on `NEXT_PUBLIC_USE_MOCK`.
**Why**: Enabled rapid UI iteration without backend dependency. Switching to production API requires only changing one env var — zero code changes.

## 2. Neon PostgreSQL (Serverless)
**Decision**: Default database is Neon PostgreSQL with PgBouncer connection pooling.
**Why**: Auto-scaling, minimal cold-start, separate `directUrl` for migrations (bypasses pooler). Chosen over MongoDB for relational integrity (NSN/CAGE/parts data needs strict relationships).

## 3. Express.js as Separate Backend
**Decision**: Backend lives in `backend/` as a standalone Express app — not Next.js API routes.
**Why**: Independent deployment, easier load testing, future microservice extraction. Avoids coupling frontend build/deploy to backend concerns.

## 4. Zod as Universal Validator
**Decision**: Use Zod for backend env config validation, form validation (react-hook-form resolver), and request body validation (express-validator with Zod schemas).
**Why**: Single schema definition reused across frontend and backend — eliminates duplication and drift.

## 5. RFQ-Based Purchasing (No Cart/Checkout)
**Decision**: Users submit Request for Quote instead of adding to cart and checking out.
**Why**: B2B aerospace procurement requires negotiation on price, delivery, certifications, and logistics. Direct checkout is incompatible with industry norms (variable pricing, 8130-3 tags, CAGE code verification).

## 6. localStorage for Mock Persistence
**Decision**: Mock auth sessions, RFQs, orders, saved parts, audit logs, and system settings all persist in `localStorage`.
**Why**: Allows full CRUD simulation that survives page refresh. Contributes to the "real app" feel during development and demos without a backend.

## 7. Cloudinary with Dual Config Path
**Decision**: Cloudinary credentials can come from `system_settings` DB table (set via SuperAdmin UI) OR env vars, with DB taking priority.
**Why**: Enables SuperAdmin to update media credentials at runtime without server restart. The `getCloudinary()` function re-configures on every call to pick up DB changes.

## 8. TipTap as Rich Text Editor
**Decision**: Use TipTap (ProseMirror-based) for the blog post editor instead of simpler alternatives (Quill, TinyMCE).
**Why**: Full schema control, extensible via extensions (slash commands, YouTube embeds, tables), and works well with React. Needed for a professional blog/CMS experience.

## 9. Centralized Token Refresh with 401 Retry
**Decision**: Created `src/lib/token.ts` as a shared token management module, used by both `blogService.ts` and `api-client.ts`. On any 401 response, the system automatically calls `POST /auth/refresh` with the stored refresh token before clearing the session. If refresh succeeds, the original request is retried with the new access token. A mutex prevents concurrent refresh calls.
**Why**: Blog writing can take 15+ minutes, exceeding the original 15-minute JWT expiry. Previously, both API clients handled 401 by immediately clearing the session and redirecting to login, causing data loss. The new approach silently extends the session and preserves the user's work.

## 10. Blog Editor Overhaul — TipTap with Full Feature Set
**Decision**: Rewrote `TipTapEditor.tsx` to register all installed-but-unused extensions (TextAlign, Color, Highlight, Table, YouTube, Focus), installed new extensions (TaskList, Subscript, Superscript, CharacterCount), and built a completely redesigned toolbar using inline SVG icons with keyboard shortcut tooltips. The bubble menu now includes Bold/Italic/Underline/Strike/Code/H2/H3/Link/Color/Highlight. The slash command menu is categorized (Text/Blocks/Insert) with more items. A bottom status bar shows word count, character count, and reading time. Implemented a custom link editor popover with two tabs: external URL and internal post search (calls `GET /blog/manage/posts/search?q=`).
**Why**: The original editor had only 5 extensions registered (vs 15+ available) and the toolbar was bare text characters. The bubble menu used `window.prompt()` for links. The redesign makes it competitive with professional blog editors (Notion, WordPress Gutenberg) and provides the internal linking workflow needed for SEO.

## 11. SEO Scoring with Link Analysis
**Decision**: Extended `SEOFields` type with `internalLinks`/`externalLinks` counters. The `SEOSidebar.calcScore()` now parses HTML to count internal links (href starting with `/blog/` or `data-internal-link` attribute) and external links (href starting with `http`). Added three new checks: "Focus keyword in a heading" (10 pts), "At least 2 internal links" (5 pts), "At least 1 external link" (5 pts). Points were redistributed from previous checks to maintain 100 total.
**Why**: Internal linking is a core SEO practice that was previously unmeasured. The link analysis is done on the frontend from content HTML so it's real-time as the user types.

## 12. SafeImage — Conditional next/image vs <img> for External URLs
**Decision**: Created `SafeImage` component that checks if the image source is a Cloudinary URL. If yes, renders `next/image` (optimized); otherwise renders a native `<img>` tag with `loading="lazy"` and `object-fit` CSS. Used across all blog cover image renderings (blog/[slug], PostCard, dashboard previews).
**Why**: Previously every new external image host required adding a `remotePatterns` entry in `next.config.ts`. Users paste images from any website (Medium, Unsplash, Imgur, etc.). Rather than maintaining an ever-growing whitelist or creating a proxy, `SafeImage` gracefully degrades — Cloudinary images get full Next.js optimization, all other URLs just work as plain `<img>` tags. No more "unconfigured host" build errors.

## 13. SEO Metadata Expansion (OG, Twitter, Canonical, Robots)
**Decision**: Added `canonicalUrl`, `robotsIndex`, `robotsFollow` fields to `BlogPost` (Prisma + TypeScript). The blog frontend dynamically injects `<meta>` tags via `useEffect` (OG title/description/image/url/type, Twitter card/image/description, robots, canonical link). The SEO sidebar was extended with a SERP preview (Google search result simulation), canonical URL input, and index/follow checkboxes.
**Why**: Open Graph tags are critical for social sharing (LinkedIn, Facebook, Twitter/X, WhatsApp). Without them, shared posts show broken previews. Canonical URLs prevent duplicate content penalties, and per-post robots control is essential for managing thin content pages. The SERP preview gives writers immediate feedback on how their page appears in search.

## 14. Image Alt Text — Full Pipeline (Editor → DB → Render)
**Decision**: Implemented alt text for all images through the complete pipeline. The TipTap editor now has: (1) image dialog with alt text input for both upload and URL insertions, (2) image bubble menu for post-insertion alt edits, (3) drag-and-drop/paste prompts alt text. Cover images have a separate `coverAlt` field stored in the DB. The SEO score now includes a check for image alt texts (5 pts).
**Why**: Alt text is critical for accessibility (screen readers) and SEO (Google Image Search). Previously images were inserted with `src` only — zero alt attributes. The new pipeline ensures every image has an alt text opportunity.

## 15. Security Hardening — Zod Validation, Rate Limiting, DOMPurify
**Decision**: Three security improvements applied together: (1) Zod validation schemas for all blog mutation endpoints (`createPostSchema`, `updatePostSchema`, etc.) with a generic `validate()` middleware returning structured `{ field, message }` errors, (2) `express-rate-limit` on comment submission — 5 requests per 15 minutes per IP, (3) `DOMPurify` sanitization on the frontend before saving post content (allows safe tags/attrs, strips XSS vectors).
**Why**: Blog endpoints previously accepted raw `req.body` with no validation — any malformed or malicious payload would hit Prisma directly. Comments had no spam/abuse protection. Post content (HTML from TipTap) was stored as-is, creating an XSS vector if someone bypassed the editor. Zod catches malformed requests early with clear error messages, rate limiting prevents comment spam, and DOMPurify ensures stored content is safe even if the editor is bypassed.

## 16. Bulk Operations on Posts List
**Decision**: Added checkbox selection (individual + "select all") and a bulk action bar to the posts list page. Supports bulk publish, move to draft, archive, trash, and permanent delete (with confirmation). Operations execute in parallel via `Promise.all`.
**Why**: Content managers managing dozens of posts needed to individually click each post's action menu for simple status changes. Bulk operations reduce multi-post workflows from minutes to seconds.

## 17. Neon Connection Resilience (Connection Pooling + Retry)

---

## 18. Single NavCategory Table with Type Discriminator
**Decision**: Store FSG categories, industries, product categories, and part categories in a single `NavCategory` table with a `type` field (`"fsg" | "industry" | "product" | "part"`). Not separate tables.
**Why**: Simplifies the admin CRUD (one set of controllers/routes), enables single `regeneratePublicJson()` call to produce the full `categories.json` with all types and their items. The `parentId` field references industry slugs for product/part categories.

## 19. CategoryItem as Separate Model (Not Embedded JSON)
**Decision**: Items per category are stored in a separate `CategoryItem` Prisma model with `navCategoryId` FK, not as an embedded JSON array inside `NavCategory`.
**Why**: Enables proper foreign key constraints (CASCADE delete), database-level indexing on `slug`, `isActive`, `sortOrder`, and individual CRUD operations per item. Bulk import/reorder becomes straightforward. The `data` JSON field provides the same flexibility as embedded JSON.

## 20. cardConfig + pageConfig as JSON Fields
**Decision**: `cardConfig` (display/layout config) and `pageConfig` (page hero, sections, SEO) stored as JSON columns on `NavCategory`.
**Why**: Future display features (column sets, card layouts, hero styles, section controls) can be added without schema migrations. Frontend components read these values at render time without needing new API fields.

## 21. Auto-Sync Public JSON on Every CRUD
**Decision**: Every mutation on `NavCategory` or `CategoryItem` calls `regeneratePublicJson()` which writes the complete tree (categories + items) to `public/data/categories.json`.
**Why**: The frontend always has the latest data available as a static file for offline fallback. No manual sync steps or cron jobs needed. The function is exported from the nav-category controller and imported by the category-item controller for cross-controller consistency.

## 22. Frontend-Only Live Excel (XLSX.js Direct Read)
**Decision**: Live Excel Connect reads the Excel file directly in the browser via the `xlsx` npm package (`XLSX.utils.sheet_to_json()`), renders a real-time preview table, and posts the data to the bulk-import API.
**Why**: The file doesn't need to be uploaded to the backend for the preview — changes are reflected instantly as the user browses rows. The backend only receives the final data on import submission. This eliminates round-trips and keeps the UI responsive.

## 23. ListView + CardView Toggle Pattern
**Decision**: Every dynamic category page (`/products/[slug]`, `/parts/[slug]`) implements a toggle between ListView (tabular, sortable, searchable) and CardView (grid, image/placeholder, configurable buttons/fields). Default view comes from `cardConfig.defaultView`.
**Why**: Different use cases need different views — procurement professionals often prefer tabular data for comparison, while browsing works better as a card grid. The `cardConfig` allows per-category defaults and admin overrides.

## 24. Dynamic Routes for Categories — No Predefined Pages
**Decision**: Product categories and part categories use dynamic routes (`/products/[slug]`, `/parts/[slug]`) instead of predefined pages. Adding a new category in the admin instantly creates a working page.
**Why**: The admin can create unlimited categories without developer involvement. The route component reads `cardConfig` and `pageConfig` from the API response to render the correct hero, sections, and display template — making each page unique without code changes.

## 25. Cascade Delete for Category Items
**Decision**: When a `NavCategory` is deleted, all its `CategoryItem` records are automatically deleted via Prisma `onDelete: Cascade`.
**Why**: Prevents orphaned item records. Since items are only meaningful within a category context, deleting the parent should clean up children. The `regeneratePublicJson()` call after deletion ensures the public JSON stays consistent.
**Decision**: Use Neon's pooled endpoint (`-pooler` suffix + `?pgbouncer=true`) for `DATABASE_URL`, keep direct URL for `DIRECT_DATABASE_URL`. Added exponential-backoff retry (3 attempts) in `connectDB()` and Prisma `$use` middleware that retries individual queries (2 attempts) on transient errors. The token refresh endpoint now tolerates DB unavailability by proceeding with cached JWT state when the user lookup query fails.
**Why**: Neon pauses idle databases after ~5 minutes; the first connection after idle triggers a wake-up that terminates existing connections with `E57P01`. Previously this cascaded into auth refresh failures (which query the DB), clearing user sessions and causing "Missing or invalid Authorization header" on subsequent requests. PgBouncer keeps a warm pool, retries absorb wake-up latency, and the resilient refresh decouples auth from transient DB blips.
