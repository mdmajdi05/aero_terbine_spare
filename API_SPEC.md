# AeroTurbineSpare — Backend API Specification

**Base URL:** `{{base_url}}` (no `/api/v1` prefix for nav/category routes)  
**Version:** 1.0  
**Auth:** Bearer JWT token in `Authorization: Bearer <token>` header for protected routes.  
**Content-Type:** `application/json`

---

## Response Envelope

All responses follow this structure:

```json
{ "success": true | false, "data": ..., "message": "...", "error": "..." }
```

Paginated responses:
```json
{ "success": true, "data": [...], "pagination": { "total": 250, "page": 1, "limit": 20, "totalPages": 13 } }
```

---

## Navigation Categories & Items

### GET /nav-categories
Full tree of all categories — FSG, industries, product categories (with items), part categories (with items).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "fsgCategories": [
      {
        "id": "uuid",
        "name": "Gas Turbines & Jet Engines",
        "slug": "gas-turbines",
        "fsg": "28",
        "fsc": "2840",
        "description": "...",
        "icon": "...",
        "partCount": 3150,
        "cardConfig": { "defaultView": "list", "gridCols": 3, "showImage": true, "fields": ["title", "description", "manufacturer"] },
        "pageConfig": { "heroTitle": "...", "heroSubtitle": "...", "sections": [] }
      }
    ],
    "industries": [...],
    "productCategories": [
      {
        "id": "uuid",
        "name": "Turbine Blades",
        "slug": "turbine-blades",
        "type": "product",
        "parentId": "aerospace",
        "industryIds": ["aerospace"],
        "manufacturer": "GE",
        "description": "...",
        "icon": "...",
        "partCount": 150,
        "sortOrder": 1,
        "cardConfig": { "defaultView": "card", "gridCols": 3, "showImage": true, "showDescription": true, "showButton": true, "buttonLabel": "View Details", "fields": ["title", "description", "manufacturer"] },
        "pageConfig": { "heroTitle": "Turbine Blades", "heroSubtitle": "...", "sections": [{ "type": "features", "title": "Why Choose Us" }] },
        "items": [
          {
            "id": "uuid",
            "navCategoryId": "uuid",
            "title": "High-Pressure Turbine Blade",
            "slug": "hp-turbine-blade-001",
            "description": "Nickel-based superalloy...",
            "image": "/images/products/blade-001.jpg",
            "link": "/items/hp-turbine-blade-001",
            "data": { "material": "Inconel 718", "weight": "2.5 kg", "operatingTemp": "1200°C" },
            "sortOrder": 1,
            "isActive": true,
            "cardConfig": { "showImage": true, "showDescription": true, "buttonLabel": "Request Quote" },
            "createdAt": "2026-06-28T00:00:00Z",
            "updatedAt": "2026-06-28T00:00:00Z"
          }
        ]
      }
    ],
    "partCategories": [...]
  }
}
```

---

### GET /categories
List all FSG categories.

**Response 200:** `{ "success": true, "data": [FsgCategory] }`

---

### GET /industries
List all industry verticals.

**Response 200:** `{ "success": true, "data": [Industry] }`

---

### GET /industries/:slug
Get a specific industry by slug.

**Response 200:** `{ "success": true, "data": Industry }`

---

### GET /category-items
List category items. Items are also included inline in `/nav-categories` response under each product/part category.

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| categoryId | string | Filter by nav category ID |
| isActive | boolean | Filter by active status (default: true) |

**Response 200:** `{ "success": true, "data": [CategoryItem] }`

---

### GET /category-items/:slug
Get a single category item by slug.

**Response 200:** `{ "success": true, "data": CategoryItem }`
**Response 404:** `{ "success": false, "error": "Item not found" }`

---

### Admin — Categories

**Base path:** `/admin/categories`

#### POST /admin/categories
Create a new nav category.

**Request body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "type": "product",
  "parentId": "aerospace",
  "description": "...",
  "icon": "turbine",
  "manufacturer": "GE",
  "partCount": 0,
  "sortOrder": 1,
  "industryIds": ["aerospace", "defense"],
  "cardConfig": { "defaultView": "list", "gridCols": 3, "showImage": true, "fields": [] },
  "pageConfig": { "heroTitle": "", "heroSubtitle": "", "sections": [] }
}
```

**Response 201:** Created NavCategory (auto-syncs public JSON)

---

#### PUT /admin/categories/:id
Update a nav category. All fields optional (partial update).

**Response 200:** Updated NavCategory (auto-syncs public JSON)

---

#### DELETE /admin/categories/:id
Delete a nav category. **Cascade deletes all associated CategoryItems.**

**Response 200:** (auto-syncs public JSON)

---

#### POST /admin/categories/sync
Force-regenerate `public/data/categories.json` from DB.

**Response 200:** `{ "success": true, "message": "Public JSON regenerated" }`

---

### Admin — Category Items

**Base path:** `/admin/category-items`

#### POST /admin/category-items
Create a new category item.

**Request body:**
```json
{
  "navCategoryId": "uuid",
  "title": "New Item",
  "slug": "new-item",
  "description": "...",
  "image": "/images/item.jpg",
  "link": "/items/new-item",
  "data": { "material": "Titanium", "weight": "1.2 kg" },
  "sortOrder": 1,
  "isActive": true,
  "cardConfig": { "showImage": true, "buttonLabel": "View Details" }
}
```

**Response 201:** Created CategoryItem (auto-syncs public JSON)

---

#### PUT /admin/category-items/:id
Update a category item. All fields optional.

**Response 200:** Updated CategoryItem (auto-syncs public JSON)

---

#### DELETE /admin/category-items/:id
Delete a category item.

**Response 200:** (auto-syncs public JSON)

---

#### POST /admin/category-items/bulk-import
Bulk import items for a category from JSON array.

**Request body:**
```json
{
  "navCategoryId": "uuid",
  "items": [
    { "title": "Item 1", "slug": "item-1", "description": "...", "data": {}, "sortOrder": 1 },
    { "title": "Item 2", "slug": "item-2", "description": "...", "data": {}, "sortOrder": 2 }
  ]
}
```

**Response 200:** `{ "success": true, "data": { "imported": 2, "errors": [] } }` (auto-syncs public JSON)

---

#### PUT /admin/category-items/reorder
Reorder items within a category.

**Request body:**
```json
{
  "categoryId": "uuid",
  "orderedIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response 200:** `{ "success": true }` (auto-syncs public JSON)

---

## Authentication

### POST /auth/login
Login with email and password.

**Request body:**
```json
{ "email": "user@example.com", "password": "Password@123" }
```

**Response 200:**
```json
{ "success": true, "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "user": { "id": "uuid", "email": "...", "fullName": "...", "company": "...", "role": "User" } }
```

**Response 401:** `{ "success": false, "error": "Invalid credentials" }`

---

### POST /auth/register
Register new user account.

**Request body:**
```json
{ "email": "...", "password": "...", "fullName": "...", "company": "...", "phone": "...", "country": "US", "cageCode": "8ATR9" }
```

**Response 201:** `{ "success": true, "message": "User registered successfully" }`

**Response 409:** `{ "success": false, "error": "Email already exists" }`

---

### POST /auth/logout
Invalidate the user's JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "success": true, "message": "Logged out" }`

---

## Products

### GET /products
Search and filter the parts catalog.

**Query parameters:**
| Param | Type | Description |
|-------|------|-------------|
| search | string | Full-text search across partNumber, description, nsn, cage, manufacturer |
| category | string | Filter by category name |
| fsg | string | Filter by FSG code (e.g. "28") |
| fsc | string | Filter by FSC code (e.g. "2840") |
| cage | string | Filter by CAGE code |
| condition | string | "New" \| "Used" \| "Refurbished" \| "Overhauled" |
| stockStatus | string | "In Stock" \| "On Order" \| "Obsolete" \| "Limited" |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**Response 200:** Paginated array of Product objects.

---

### GET /products/:id
Get a single product by ID or part number.

**URL Params:** `id` — product UUID or part number

**Response 200:** `{ "success": true, "data": Product }`

**Response 404:** `{ "success": false, "error": "Product not found" }`

---

## Testimonials

### GET /testimonials
List all client testimonials.

**Response 200:** Array of Testimonial objects.

---

## RFQ

### POST /rfq/submit
Submit a Request for Quote.

**Headers:** `Authorization: Bearer <token>` (optional)

**Request body:**
```json
{
  "companyName": "Acme MRO",
  "contactName": "John Smith",
  "email": "john@acmemro.com",
  "phone": "+1-555-123-4567",
  "items": [
    { "productId": "prod-001", "partNumber": "GE-CF6-LPT-001", "nsn": "1560-00-178-9421", "description": "LPT Rotor Blade", "quantity": 5 }
  ],
  "urgency": "Standard",
  "deliveryDeadline": "2026-09-01",
  "shippingAddress": "123 Main St, Houston TX 77001",
  "shippingCountry": "US",
  "incoterms": "DDP",
  "specialInstructions": "Include 8130-3 tags"
}
```

**Response 201:**
```json
{ "success": true, "rfqId": "RFQ-ABC123", "message": "RFQ submitted. Our team will respond within 24 hours." }
```

---

## Dashboard (Auth Required)

### GET /dashboard/rfqs
Get the authenticated user's RFQ history.

**Response 200:** `{ "success": true, "data": [RFQ] }`

---

### GET /dashboard/orders
Get the authenticated user's orders.

**Response 200:** `{ "success": true, "data": [Order] }`

---

### GET /dashboard/saved
Get the authenticated user's saved parts.

**Response 200:** `{ "success": true, "data": [Product] }`

---

### POST /dashboard/saved
Save a part to the user's list.

**Request body:** `{ "productId": "prod-001" }`

**Response 200:** `{ "success": true }`

---

### DELETE /dashboard/saved/:productId
Remove a part from saved list.

**Response 200:** `{ "success": true }`

---

### GET /dashboard/profile
Get the authenticated user's profile.

**Response 200:** `{ "success": true, "data": User }`

---

### PUT /dashboard/profile
Update user profile fields.

**Request body:** Partial User object.

**Response 200:** `{ "success": true, "data": User }`

---

## Inventory Submission

### POST /inventory/submit
Submit excess inventory for evaluation.

**Request body (multipart/form-data for production, JSON for mock):**
```json
{
  "companyName": "AeroSurplus Inc",
  "contactEmail": "sales@aerosurplus.com",
  "fileName": "inventory-q2-2026.xlsx",
  "partCount": 450,
  "notes": "All parts from 737NG teardown"
}
```

**Response 201:**
```json
{ "success": true, "submissionId": "INV-1234567890", "status": "Processing" }
```

---

## Data Models

### NavCategory
```typescript
{
  id: string;                    // UUID
  name: string;
  slug: string;                  // unique
  type: "fsg" | "industry" | "product" | "part";
  parentId?: string;             // industry slug for product/part
  description?: string;
  icon?: string;
  manufacturer?: string;
  partCount?: number;
  sortOrder?: number;
  longDescription?: string;      // industry only
  keyParts?: string[];           // industry only
  clients?: string[];            // industry only
  fsgCode?: string;
  fscCode?: string;
  industryIds?: string[];        // product/part links
  cardConfig?: Record<string, any>;  // display/layout configuration
  pageConfig?: Record<string, any>;  // page hero, sections, SEO
  items?: CategoryItem[];        // populated in /nav-categories response
}
```

### CategoryItem
```typescript
{
  id: string;                    // UUID
  navCategoryId: string;         // FK → NavCategory
  title: string;
  slug: string;                  // unique
  description?: string;
  image?: string;                // URL or path
  link?: string;                 // external URL or internal slug
  data?: Record<string, any>;    // flexible — columns from Excel/JSON import
  sortOrder: number;
  isActive: boolean;
  cardConfig?: Record<string, any>; // per-item display override
  createdAt: string;             // ISO 8601
  updatedAt: string;
}
```

### Product
```typescript
{
  id: string;             // UUID
  nsn: string;            // "XXXX-XX-XXX-XXXX"
  cage: string;           // 5-char alphanumeric
  partNumber: string;
  description: string;
  shortDescription: string;
  fsg: string;            // 2-digit FSG
  fsc: string;            // 4-digit FSC
  category: string;
  manufacturer: string;
  condition: "New" | "Used" | "Refurbished" | "Overhauled";
  stockStatus: "In Stock" | "On Order" | "Obsolete" | "Limited";
  quantityAvailable: number;
  unitPrice: number;
  currency: string;       // "USD"
  datasheetUrl?: string;
  imageUrl?: string;
  crossReferences: string[];
  specifications: Record<string, string>;
  tags: string[];
  createdAt: string;      // ISO 8601
  updatedAt: string;
}
```

### User
```typescript
{
  id: string;
  email: string;
  fullName: string;
  company: string;
  cageCode?: string;
  phone: string;
  role: "Admin" | "User" | "Trader" | "ContentManager" | "SuperAdmin";
  country: string;
  address?: string;
  createdAt: string;
}
```

### RFQ
```typescript
{
  id: string;
  userId?: string;
  companyName: string; contactName: string; email: string; phone: string;
  items: Array<{ productId: string; partNumber: string; nsn: string; description: string; quantity: number; targetPrice?: number; condition?: string; }>;
  urgency: "Standard" | "Urgent" | "Critical";
  deliveryDeadline: string;
  shippingAddress: string; shippingCountry: string; incoterms: string;
  specialInstructions?: string;
  status: "Pending" | "Under Review" | "Quoted" | "Accepted" | "Ordered" | "Cancelled";
  quoteAmount?: number; quoteCurrency?: string; quotedAt?: string;
  createdAt: string; updatedAt: string;
}
```

---

## Blog (Content Management)

**Base path:** `/api/blog`

### Public Endpoints

#### GET /posts
List published blog posts with pagination.

**Query parameters:** `page`, `limit`, `category`, `tag`, `search`

**Response 200:** Paginated array of BlogPost (public fields only).

---

#### GET /posts/:slug
Get a single published blog post by slug.

**Response 200:** Full BlogPost with author, categories, tags, approved comments.

---

#### GET /categories
List all blog categories.

**Response 200:** Array of BlogCategory with `_count.posts`.

---

#### GET /tags
List all blog tags.

**Response 200:** Array of BlogTag with `_count.posts`.

---

#### GET /sitemap
Get sitemap data (published posts, categories, tags).

**Response 200:** `{ posts: [...], categories: [...], tags: [...], totalUrls: number, generatedAt: string }`

---

#### POST /posts/:postId/comments
Submit a comment on a blog post.

**Rate limited:** 5 requests per 15 minutes per IP.

**Request body:**
```json
{ "content": "Great article!", "guestName": "John", "guestEmail": "john@example.com" }
```

**Response 201:** `{ "success": true }`

---

### Protected Endpoints (ContentManager+)

#### GET /manage/posts
List all posts (admin view) with pagination and status filtering.

#### GET /manage/posts/search?q=
Search posts by title/slug for internal linking.

#### GET /manage/posts/:id
Get a single post by ID (admin view).

#### POST /manage/posts
Create a new blog post.

**Request body fields:** `title`, `content`, `excerpt`, `coverImage`, `coverAlt`, `canonicalUrl`, `robotsIndex`, `robotsFollow`, `status`, `scheduledAt`, `metaTitle`, `metaDesc`, `focusKw`, `seoScore`, `categoryIds[]`, `tagIds[]`

#### PUT /manage/posts/:id
Update an existing blog post. All fields optional.

#### PATCH /manage/posts/:id/trash
Soft-delete a post.

#### PATCH /manage/posts/:id/restore
Restore a soft-deleted post.

#### DELETE /manage/posts/:id
Permanently delete a post. **Admin+ only.**

#### POST /categories
Create a blog category.

#### PUT /categories/:id
Update a blog category.

#### DELETE /categories/:id
Delete a category (disconnects from posts).

#### POST /tags
Create a blog tag.

#### PUT /tags/:id
Update a blog tag.

#### DELETE /tags/:id
Delete a tag (disconnects from posts).

#### GET /media
List uploaded media (paginated).

#### POST /media/upload
Upload an image (multipart/form-data). Supports JPEG, PNG, WEBP, GIF (max 10MB).

#### DELETE /media/:id
Delete a media item.

#### GET /comments
List all comments (paginated, filterable).

#### PATCH /comments/:id/approve
Approve a pending comment.

#### DELETE /comments/:id
Delete a comment.

---

## Blog Data Models

### BlogPost
```typescript
{
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;              // HTML (sanitized via DOMPurify)
  coverImage?: string;
  coverAlt?: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  status: "Draft" | "Published" | "Scheduled" | "Archived";
  publishedAt?: string;
  scheduledAt?: string;
  deletedAt?: string;
  metaTitle?: string;
  metaDesc?: string;
  focusKw?: string;
  seoScore: number;
  viewCount: number;
  author: { id: string; fullName: string };
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  comments: BlogComment[];
  createdAt: string;
  updatedAt: string;
}
```

### BlogCategory, BlogTag, BlogMedia, BlogComment
*(standard content models — see Prisma schema for full field list)*

---

## Switching from Mock to Real API

1. Set `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`
2. Set `NEXT_PUBLIC_API_URL=https://api.aeroturbinespare.com/v1`
3. All API calls in `src/lib/api-client.ts` will automatically route to the real backend
4. No frontend code changes required

---

*Generated: 2026-06-29 | AeroTurbineSpare v1.0*
