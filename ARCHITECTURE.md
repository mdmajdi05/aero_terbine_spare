# AeroTurbineSpare — Full CMS Architecture

> **Last updated:** 2026-06-29  
> **Purpose:** Complete planning memory — survives chat compaction. All 6 phases DONE.

---

## Vision
Admin Dashboard se industries, product categories, part categories **CRUD** karo. Har category ke andar **items import karo** (Excel/JSON/Live Excel). Un items ko **List View ya Card View** me display karo. Har page **100% dynamic** hai — add karte hi apne aap create ho jata hai. **Offline fallback** — backend band ho tab bhi site chalti hai. **Live Excel Connect** — Excel file change karo, frontend real-time reflect kare.

---

## Data Model

### NavCategory Table (Prisma `nav_categories`)

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `name` | String | |
| `slug` | String | unique |
| `type` | String | `"fsg" \| "industry" \| "product" \| "part"` |
| `parentId` | String? | industry slug reference |
| `description`, `icon`, `manufacturer` | String? | |
| `partCount`, `sortOrder` | Int | |
| `longDescription` | String? | industry only |
| `keyParts`, `clients` | String[] | industry only |
| `fsgCode`, `fscCode` | String? | fsg only |
| `industryIds` | String[] | product/part links to industry |
| `cardConfig` | JSON | display & layout configuration |
| `pageConfig` | JSON | page hero, sections, SEO |

### CategoryItem Table (Prisma `category_items`)

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `navCategoryId` | String | FK → NavCategory (CASCADE delete) |
| `title` | String | |
| `slug` | String | unique |
| `description` | String? | |
| `image` | String? | URL or path |
| `link` | String? | external URL or internal slug |
| `data` | JSON | flexible fields from Excel/JSON columns |
| `sortOrder` | Int | display order |
| `isActive` | Bool | toggle visibility |
| `cardConfig` | JSON | per-item override of category cardConfig |

### JSON Output Structure (`public/data/categories.json`)

```json
{
  "fsgCategories": [{ "id", "name", "fsg", "fsc", "description", "icon", "partCount", "cardConfig", "pageConfig" }],
  "industries": [{ "id", "name", "slug", "icon", "description", "longDescription", "partCount", "keyParts", "clients", "cardConfig", "pageConfig" }],
  "productCategories": [{ "id", "name", "slug", "type", "parentId", "industryIds", "manufacturer", "description", "icon", "partCount", "sortOrder", "cardConfig", "pageConfig", "items": [{ "id", "title", "slug", "description", "image", "link", "data", "sortOrder", "cardConfig" }] }],
  "partCategories": [{ same as productCategories, "items": [...] }]
}
```

---

## Data Flow

```
Admin UI → API → DB (source of truth)
                  ↓
      regeneratePublicJson()
                  ↓
      public/data/categories.json (always synced, includes items + config)
                  ↓
      Frontend reads from /data/categories.json
      (backend offline bhi kaam karta hai)

Live Excel Connect:
  Admin → Upload Excel → Bulk Import API → DB + JSON
  Frontend can also read Excel directly via XLSX.js for real-time preview

When backend offline:
  Frontend serves from public/data/categories.json (static file)
  No data loss — next CRUD when backend connects → sync
```

---

## API Endpoints

### Public

| Method | Path | Returns |
|---|---|---|
| GET | `/nav-categories` | Full tree: fsgCategories + industries + productCategories (with items) + partCategories (with items) |
| GET | `/categories` | fsgCategories array |
| GET | `/industries` | industries array |
| GET | `/industries/:slug` | single industry |
| GET | `/category-items` | items (query: `?categoryId=xxx`) |
| GET | `/category-items/:slug` | single item |

### Admin

| Method | Path | Auth |
|---|---|---|
| POST | `/admin/categories` | admin |
| PUT | `/admin/categories/:id` | admin |
| DELETE | `/admin/categories/:id` | superadmin |
| POST | `/admin/categories/sync` | superadmin |
| POST | `/admin/category-items` | admin |
| PUT | `/admin/category-items/:id` | admin |
| DELETE | `/admin/category-items/:id` | admin |
| POST | `/admin/category-items/bulk-import` | admin |
| PUT | `/admin/category-items/reorder` | admin |

---

## Dynamic Routes (Next.js App Router)

| Route | Component | Page Content |
|---|---|---|
| `/industries/[slug]` | `src/app/industries/[slug]/page.tsx` | Industry hero + categories grids (Products + Parts) |
| `/products/[slug]` | `src/app/products/[slug]/page.tsx` | Product category + items (ListView / CardView toggle) |
| `/parts/[slug]` | `src/app/parts/[slug]/page.tsx` | Part category + items (ListView / CardView toggle) |
| `/items/[slug]` | `src/app/items/[slug]/page.tsx` | Single item detail with data table |
| `/catalog` | `src/app/catalog/page.tsx` | Parts catalog with List/Card view toggle (via `?view=`) |

---

## Display Components

### ListView (`src/components/catalog/ListView.tsx`)
- Table with auto-detected columns from items' `data` fields
- Sortable columns (click header to sort)
- Search bar to filter items
- Row click → `/items/${slug}`
- Responsive: mobile → card layout

### CardView (`src/components/catalog/CardView.tsx`)
- Grid layout (2/3/4 cols via `cardConfig.gridCols`)
- Configurable fields: showImage, placeholder, showTitle, showDescription, showButton, buttonLabel, buttonLink, fields[]
- Image fallback: placeholder gray box
- Button: links to `/items/${slug}` or `item.link`

---

## Admin Pages

| Route | Features |
|---|---|
| `/admin/categories` | 4 tabs (FSG, Industries, Products, Parts) + CRUD + cardConfig/pageConfig editors + "Manage Items" button |
| `/admin/category-items` | Left sidebar category list → items table + Add/Edit modal + Bulk Import (JSON/Excel/paste) + Live Excel Connect + Delete + Reorder |

### Bulk Import (`/admin/category-items`)
- **Tab 1:** Upload JSON file (drag & drop)
- **Tab 2:** Upload Excel/CSV (.xlsx/.xls/.csv via XLSX.js)
- **Tab 3:** Paste tab-separated or comma-separated data
- Preview table before import
- POST to `/admin/category-items/bulk-import`

### Connect Live Excel
- Upload Excel → columns detected → saved as items with file path
- Frontend can read Excel directly for real-time updates

---

## File Structure

```
aeroturbinespare.com/
├── ARCHITECTURE.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              ← NavCategory + CategoryItem
│   │   └── migrations/
│   │       ├── 20260627000000_add_nav_categories/
│   │       ├── 20260628000000_unify_categories/
│   │       └── 20260628000001_add_category_items/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── nav-category.controller.ts   ← updated: DB reads, config fields, items in JSON
│   │   │   └── category-item.controller.ts  ← NEW: CRUD + bulk import + reorder
│   │   ├── routes/
│   │   │   ├── nav-category.routes.ts       ← updated: + GET /industries/:slug
│   │   │   ├── category-item.routes.ts      ← NEW
│   │   │   └── index.ts                     ← updated: mounts category-item routes
│   │   └── scripts/
│   │       └── seed-categories.ts           ← updated: 39 categories + 82 items + config defaults
│   └── package.json                         ← + seed:categories script
├── public/
│   └── data/
│       └── categories.json                  ← auto-generated by backend (39 cats, 82 items)
└── src/
    ├── types/index.ts                       ← + CategoryItem interface
    ├── lib/api-client.ts                    ← updated: removed static intercepts, + mock handlers for items
    ├── components/
    │   ├── catalog/
    │   │   ├── ListView.tsx                 ← NEW
    │   │   └── CardView.tsx                 ← NEW
    │   └── layout/Header.tsx                ← already dynamic from navTree
    ├── app/
    │   ├── catalog/page.tsx                 ← updated: + ?view=list|card toggle
    │   ├── industries/[slug]/page.tsx        ← updated: dynamic from API
    │   ├── products/[slug]/page.tsx          ← NEW: dynamic product category page
    │   ├── parts/[slug]/page.tsx             ← NEW: dynamic part category page
    │   ├── items/[slug]/page.tsx             ← NEW: single item detail
    │   └── admin/
    │       ├── layout.tsx                   ← updated: + Category Items sidebar link
    │       ├── categories/page.tsx           ← updated: + Manage Items button + config editors
    │       └── category-items/page.tsx       ← NEW: full CRUD + bulk import + Live Excel
    └── data/
        ├── categories.json                  ← seed data (git-tracked)
        └── industries.json                  ← seed data (kept for mock mode)
```

---

## Implementation Status — ALL PHASES DONE ✅

| Phase | What | Status |
|---|---|---|
| 1a | Prisma schema: CategoryItem model + config fields | ✅ |
| 1b | Migration file | ✅ |
| 1c | Backend CategoryItem controller + routes | ✅ |
| 1d | Seed script update | ✅ |
| 2 | Admin CRUD pages (categories + items + config editors) | ✅ |
| 3 | Dynamic pages (products/[slug], parts/[slug], etc.) | ✅ |
| 4 | Display templates (ListView + CardView) | ✅ |
| 5 | Offline system (JSON fallback, mock handlers) | ✅ |
| 6 | Nav + Homepage (already dynamic) | ✅ |

---

## One-Time Setup

```bash
cd backend
npm run seed:categories
# Seeds 39 categories + 82 sample items + generates public/data/categories.json
```

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| All types in one NavCategory table | `type` field discriminator | Simple, single CRUD, easy JSON generation |
| cardConfig + pageConfig | JSON fields | Extendable without schema changes |
| Public JSON auto-sync | `regeneratePublicJson()` on every CRUD | Frontend always has latest, offline works |
| Live Excel | Frontend XLSX.js reads directly | Real-time, no backend needed |
| Category Items | Separate `CategoryItem` model | Unlimited items per category, flexible |
| Views | List + Card toggle | User choice for every category |
| App Router dynamic routes | `/products/[slug]` etc. | Zero config, auto-routing |
| Prisma Client | Library engine (not `--no-engine`) | Works with regular `postgresql://` URL |

---

## User's Original Prompt (Essence)

> Admin dashboard me industries add/delete karo. Industries me product aur part category add/delete karo. Product me data import karo Excel/JSON se. Display options: list view ya card view. List view me upload from JSON/Excel + connect live Excel (frontend direct read, real-time changes). Upload ke baad customize karo (kisko kaise dikhana hai, arrange karna, bulk add, copy-paste). Card view me flexible image (link ho to display, nahi to placeholder), buttons, slug/link. Full customizable. Category page bhi editable (hero, sections, images). Industries page → industry detail → product/part listing → product/part detail. Nav me Products + Parts mega menu. Homepage par new section. Offline fallback — public/data/categories.json serve kare when backend offline. DB sync when available.


## Main prompt
> " sun meri baat, aisa bhi to kr  skte hai ke hamare paas admin dashbaord me ye options ho ke ham industies add delete kr sake aur uss industries me product aur  part category bhi add delete kr sake aur product me option ho hamare paas data import krne ka exel ke through json ke through aur wahi options ho hamare paas ke ham isse kaise show krwaynege cards view krwayenge  hamare paas kai template hoga ek list me dushra card me jb ham list choose kre to wo hame option de upload from json or upload from exel  or connect for live view from your exel which is will be connect direct to your frontend direct without backend when i perform changes in my exel from my exel then it will live reflect and also same option for json agr aur upload hone ke  baad wo hame uss uploaded me customize ka full adavanced option de kisko kaise dikhana hai kaise arrange krna hai aur usi same exel me more data add krne bhi option ho in bulk bhi 
copy paste
aur agr ham card choose kre to bhi  options aaye upload from json or exel aur aur card bilkul flexible  image  link mile to display kr de agr na mile to koi baat nahi image show hi na kre aur agr mai image me select kru placeholder to placeholder dikhe aur card ko customize krna ka option ho kaha pr kya dikhana ha aur aur button lagane ka bhi option ho aur usme slug ka bhi ya link ka bhi agr exel ya json se aaye to thik hai nahi to kuchh nahi waise predefine pehle sehi card ka pages bana hua ho details ke sath aur fully customizable 

aur list view ho ya  card view wo ek apne category ke page par hi to dikhega na to wo page ko bhi edit krne ka bhi full options ho uske contains ko aur images ko 


in website frontend
-when click at industries nav menu then
aur jb industries nav pr click ho to page open ho aur uss page me deatils aur uss industries ke saare peroducts aur parts catogery dikhe aur waha filter aur search ka advances option ho aur jb uss products ya part par click ho to us products ya part ke own page open ho jaha uske saare products aur part show ho in list or card aur waha fully searchable aur filter ho taki user ko koi issue na ho products dhundene me aur hamare pass nav me direct products and part optionss bhi ho menu me with its mega menu or dropdown menu waha se bhi page ko ham navigate kr sake aur ham isse offline fallbacke bhi handle kr ske jb ham dashboard se offline wala mode me import kre to wo direct frontend me file write krke save ho jaye jb backend available na ho wo wahi se serve ho aur ye bilkul database sync ho uptodate always aur home page par new section bana lena ye sb view krnwane ka "

---

> **All 6 phases implemented.** Frontend + Backend TypeScript — 0 errors.



