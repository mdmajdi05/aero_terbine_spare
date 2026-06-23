# AeroTurbineSpare — Backend API Specification

**Base URL:** `{{base_url}}/api/v1`  
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

## Categories

### GET /categories
List all FSG/FSC categories.

**Response 200:**
```json
{ "success": true, "data": [{ "id": "...", "name": "Gas Turbines", "fsg": "28", "fsc": "2840", "description": "...", "partCount": 3150 }] }
```

---

## Industries

### GET /industries
List all industry verticals.

**Response 200:** Array of Industry objects.

---

### GET /industries/:slug
Get a specific industry by slug.

**Response 200:** `{ "success": true, "data": Industry }`

---

## Testimonials

### GET /testimonials
List all client testimonials.

**Response 200:** Array of Testimonial objects.

---

## RFQ

### POST /rfq/submit
Submit a Request for Quote.

**Headers:** `Authorization: Bearer <token>` (optional — works without login too)

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

**Request body:** Partial User object (excluding email, password, role, id).

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
  "notes": "All parts from 737NG teardown, excellent condition"
}
```

**Response 201:**
```json
{ "success": true, "submissionId": "INV-1234567890", "status": "Processing" }
```

---

## Data Models

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
  role: "Admin" | "User" | "Trader";
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

## Switching from Mock to Real API

1. Set `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`
2. Set `NEXT_PUBLIC_API_URL=https://api.aeroturbinespare.com/v1`
3. All API calls in `src/lib/api-client.ts` will automatically route to the real backend
4. No frontend code changes required

---

*Generated: 2026-06-21 | AeroTurbineSpare Frontend v1.0*
