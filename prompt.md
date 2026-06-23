
AeroturbineSpare.com — Complete Website Development Prompt for Claude Code
Below is a step-by-step, production-ready prompt for building aeroturbinespare.com — a premium US-based aerospace parts sourcing platform. This prompt is designed so Claude Code cannot skip any critical element.

## STEP 1: PROJECT OVERVIEW & BRAND IDENTITY
1.1 Domain & Branding
Domain: aeroturbinespare.com

Company Name: AeroTurbineSpare

Tagline: "Precision Aerospace Parts Sourcing — Fast, Certified, Global"

CAGE Code: (placeholder) — display prominently as trust signal

Target Audience: Aerospace OEMs, MRO facilities, military contractors, procurement professionals

1.2 Architecture Philosophy — Frontend-First with Backend Ready
⚠️ CRITICAL DECISION: Yeh project Frontend-First approach follow karega. Abhi sirf frontend banwana hai, lekin backend ka complete API spec ready rakhenge taaki baad mein backend connect karte waqt koi code change na karna pade.

Current Phase: Pure Frontend (Next.js App Router with "use client" components)

Data Strategy: Local JSON files (/src/data/) + Browser localStorage (for Auth sessions & RFQ tracking)

Backend Readiness: Complete API documentation (API_SPEC.md) generate karenge with all endpoints

Switch Mechanism: .env.local mein NEXT_PUBLIC_USE_MOCK=true rahega. Backend banne par false karke real API URL daalna hai — bina ek line code change kiye

1.3 Brand Positioning
This is NOT a portfolio site. This is a functional B2B procurement platform. The site must feel:

Enterprise-grade — like a tool professionals rely on daily

Trustworthy — ISO certifications, quality badges, warranty seals must be visually prominent

Fast & efficient — minimal clicks to find parts and submit RFQs

Modern & premium — think Siemens/Airbus procurement portals, not generic WordPress themes

1.4 Color Palette (Premium Industrial Theme)
Primary: Deep Navy Blue #0A1628 or #0B1A33

Secondary: Aviation Silver/Grey #E8EDF2 and #C0C9D5

Accent: Turbine Orange #E8751A or #FF6B00 (for CTAs and highlights)

Success: #00A651

Background: #F5F7FA

Text: #1A1A2E (primary), #4A4A6A (secondary)

White: #FFFFFF with subtle opacity overlays

## STEP 2: UI/UX DESIGN PHILOSOPHY
2.1 Design Principles
Clean & Uncluttered: Generous white space, clear visual hierarchy

Data-Rich but Digestible: Part numbers, specs, and pricing displayed in structured tables/cards

Mobile-Responsive: Fully responsive with hamburger menu on mobile

Accessibility: WCAG 2.1 AA compliant minimum

Performance: Lighthouse score > 90 on desktop and mobile

2.2 Premium UI Elements (Must Include)
Glassmorphism effects on cards and modals (subtle backdrop blur)

Micro-interactions: Hover animations, loading skeletons, smooth transitions

Gradient accents on buttons and section dividers

Custom icons (Font Awesome or custom SVG) for all categories

Status badges (In Stock, On Order, Obsolete, Urgent) with color coding

Breadcrumb navigation on all interior pages

Sticky header with search bar that shrinks on scroll

Animated counters for stats (parts available, customers served, etc.)

2.3 Typography
Headings: Inter or Poppins (bold, modern)

Body: Inter or Roboto (clean, readable)

Monospace: JetBrains Mono for part numbers and technical data

## STEP 3: FEATURES TO IMPLEMENT (Inspired by PartTarget.com)
3.1 Core Features (Must Have)
#	Feature	Description
1	Advanced Part Search	Search by NSN, CAGE, Part Number, Description, FSG/FSC
2	RFQ (Request for Quote) System	Multi-step form with part details, quantity, urgency, delivery address
3	Product Catalog	Browse by FSG (Federal Supply Groups) and FSC (Federal Supply Classes)
4	Part Detail Pages	Full specs, datasheets, cross-references, stock status, pricing
5	Quote Management	Users can view, compare, and accept quotes
6	Urgent Buy Option	Flag RFQs as urgent with priority handling
7	Excess/Surplus Inventory Submission	Sellers can submit inventory lists
8	Order Tracking	Track order status from quote to delivery
9	User Dashboard	RFQ history, saved parts, profile management
10	Quality Assurance Badges	ISO 9001, AS9120, warranty seals displayed globally
3.2 Supporting Features
Live Chat (intercom or custom) for instant support

Email Notifications for RFQ responses, order updates

Multi-currency & Multi-language support (USD default)

PDF Export for quotes and order confirmations

Parts Comparison tool (side-by-side spec comparison)

Saved Searches with email alerts for new inventory

3.3 Trust & Credibility Signals (Non-Negotiable)
"100% Inspection on Every Order" badge on every page

"Full-Time Quality Assurance Department" section

"Part Warranty — All Materials Certified" banner

"Direct Access to Your Trader" personal account manager feature

Customer testimonials with real company logos

"Trusted by [X] Companies Worldwide" counter

## STEP 4: PAGE STRUCTURE & SITEMAP
4.1 Pages to Build
text
aeroturbinespare.com/
├── Homepage (index.html)
├── Parts Catalog
│   ├── By NSN Number
│   ├── By CAGE Code
│   ├── By FSG/FSC Category
│   └── Advanced Search
├── Part Detail Page (dynamic)
├── Request a Quote (RFQ)
│   ├── Standard RFQ
│   └── Urgent RFQ
├── Submit Excess Inventory
├── About Us
├── Quality Assurance
├── Industries Served
│   ├── Aerospace
│   ├── Military & Defense
│   ├── Automotive
│   ├── Medical
│   └── Electronics
├── Contact Us
├── User Dashboard
│   ├── My RFQs
│   ├── My Orders
│   ├── Saved Parts
│   └── Profile Settings
├── Terms & Conditions
├── Privacy Policy
└── Sitemap
4.2 Homepage Layout (Critical — Must Match This Structure)
Section	Content
Header	Logo + Primary Nav + Search Bar + CTA (Get Quote)
Hero	Full-width background image (turbine/aviation), headline, sub-headline, dual CTAs: "Search Parts" and "Request Quote"
Trust Bar	4-5 trust badges: ISO Certified, 100% Inspection, Warranty, Global Shipping, 24hr Quotes
Search Section	Prominent search bar with filters (NSN, Part #, Description, CAGE)
Industries We Serve	Grid of industry icons/cards (Aerospace, Military, Automotive, Medical, Electronics, Telecom)
Featured Categories	Top FSG categories with icons and part counts
How It Works	3-4 step process: Search → RFQ → Quote → Delivery
Why AeroTurbineSpare	USP section with stats (parts available, customers, countries)
Testimonials	Carousel of client testimonials
Latest Parts/Inventory	Scrollable grid of recently added parts
CTA Section	"Need a Part Urgently?" with orange button
Footer	Company info, links, social, newsletter signup, copyright
## STEP 5: TECHNICAL STACK & REQUIREMENTS
5.1 Frontend
Framework: React.js with Next.js (App Router) OR pure HTML/CSS/JS with a modern build tool

Styling: Tailwind CSS (primary) with custom CSS for premium touches

Animations: Framer Motion or GSAP for smooth interactions

State Management: Zustand or Context API

Form Handling: React Hook Form with Zod validation

Icons: Font Awesome Pro or Lucide Icons

5.2 Backend (If Full Stack)
Framework: Node.js with Express or Next.js API routes

Database: PostgreSQL (with full-text search for parts) or MongoDB

Authentication: JWT-based with role-based access (Admin, User, Trader)

Search Engine: Elasticsearch or PostgreSQL full-text search

Email: Nodemailer or SendGrid for RFQ notifications

File Upload: Multer for inventory file uploads (Excel/CSV)

5.3 Hosting & Deployment
Hosting: Vercel, Netlify, or AWS

Domain: aeroturbinespare.com (already registered)

SSL: Auto-renewing SSL certificate

Analytics: Google Analytics 4 or Plausible

Monitoring: Sentry for error tracking

## STEP 6: DATABASE SCHEMA (Minimum Required Tables)
sql
-- Parts Catalog
parts (
  id UUID PRIMARY KEY,
  nsn VARCHAR(20),
  cage VARCHAR(10),
  part_number VARCHAR(50),
  description TEXT,
  fsg VARCHAR(4),
  fsc VARCHAR(4),
  category VARCHAR(100),
  manufacturer VARCHAR(100),
  condition VARCHAR(20), -- New, Used, Refurbished
  stock_status VARCHAR(20), -- In Stock, On Order, Obsolete
  quantity_available INT,
  unit_price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  datasheet_url VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- RFQs
rfqs (
  id UUID PRIMARY KEY,
  user_id UUID,
  part_id UUID,
  quantity INT,
  urgency VARCHAR(20), -- Standard, Urgent
  delivery_deadline DATE,
  shipping_address TEXT,
  special_instructions TEXT,
  status VARCHAR(20), -- Pending, Quoted, Ordered, Cancelled
  quote_amount DECIMAL(12,2),
  quote_currency VARCHAR(3),
  quoted_by UUID,
  quoted_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(100),
  company_name VARCHAR(100),
  cage_code VARCHAR(10),
  phone VARCHAR(20),
  role VARCHAR(20), -- Admin, User, Trader
  created_at TIMESTAMP
)

-- Inventory Submissions
inventory_submissions (
  id UUID PRIMARY KEY,
  user_id UUID,
  file_url VARCHAR(255),
  status VARCHAR(20), -- Pending, Processing, Complete, Rejected
  submitted_at TIMESTAMP,
  processed_at TIMESTAMP
)
## STEP 7: PAGE-BY-PAGE DEVELOPMENT SPECS
7.1 Homepage (/)
Element	Specification
Hero Section	Full viewport height, background video or animated image of turbine, overlay gradient, headline in white, sub-headline in light grey, two CTAs (primary orange, secondary outline)
Trust Bar	Horizontal scroll on mobile, 5 badges with icons, light grey background
Search	Prominent, centered, with dropdown filters for NSN/Part #/CAGE/Description, autocomplete suggestions
Industry Grid	6 industries, each with icon, name, brief description, hover effect with orange border
How It Works	4 steps in a horizontal flow, numbered circles, icons, short descriptions
Stats Counter	4 stats (Parts Available, Customers Served, Countries, Years in Business) with animated counting
Testimonials	3-4 testimonials with photo, name, company, quote, star ratings
CTA	Full-width orange gradient banner with "Need a Part Urgently?" and button
7.2 Parts Catalog (/catalog)
Filters: NSN, CAGE, Part Number, Manufacturer, FSG/FSC, Condition, Stock Status

View Toggle: Grid view (cards) and List view (table)

Sort: Relevance, Price (low-high), Price (high-low), Newest

Pagination: 20 items per page with "Load More" or numbered pagination

Each Result: Thumbnail, Part Number, NSN, Description, Stock Status badge, Price (or "Request Quote"), Quick View button

7.3 Part Detail Page (/part/[id])
Top Section: Part image (placeholder if none), Part Number, NSN, CAGE, Manufacturer

Specs Table: All available specifications in a clean table

Stock & Pricing: Stock status, quantity available, price (or "Call for Pricing")

Cross-References: Alternative part numbers, NSN cross-references

Actions: "Request Quote" (primary), "Add to Saved" (secondary), "Compare" (tertiary)

Similar Parts: Carousel of related parts

Datasheet: Downloadable PDF link if available

7.4 RFQ Form (/rfq)
Step 1: Part identification (search or manual entry)

Step 2: Quantity, Delivery Deadline, Urgency Toggle

Step 3: Shipping Address (auto-fill from profile if logged in)

Step 4: Special Instructions, File Attachment (optional)

Step 5: Review & Submit

Post-Submission: Confirmation page with RFQ number and estimated response time (24 hours)

7.5 User Dashboard (/dashboard)
Sidebar Navigation: My RFQs, My Orders, Saved Parts, Profile, Logout

My RFQs: Table with RFQ #, Part, Date, Status, Actions (View, Cancel)

My Orders: Table with Order #, Parts, Total, Status, Tracking

Saved Parts: Grid of saved parts with "Request Quote" button

Profile: Editable fields, change password, notification preferences

7.6 About Us (/about)
Company story, mission, vision

Team photos (placeholders)

Certifications & accreditations (ISO, AS9120, etc.)

Timeline or milestones

Office location with map (Google Maps embed)

7.7 Contact (/contact)
Contact form: Name, Email, Phone, Subject, Message

Phone numbers (toll-free and direct)

Physical address

Business hours

Map embed

## STEP 8: RESPONSIVE BREAKPOINTS
Breakpoint	Width	Layout Adjustments
Desktop	> 1024px	Full layout, multi-column, mega menus
Tablet	768px - 1024px	2-column grids, collapsed sidebar
Mobile	< 768px	Single column, hamburger menu, stacked elements
## STEP 9: PERFORMANCE & SEO REQUIREMENTS
9.1 Performance Targets
Largest Contentful Paint (LCP): < 2.5s

First Input Delay (FID): < 100ms

Cumulative Layout Shift (CLS): < 0.1

Time to Interactive (TTI): < 3.5s

Page Size: < 2MB initial load

9.2 SEO Requirements
Meta titles and descriptions for all pages

Open Graph tags for social sharing

JSON-LD structured data (Product, Organization, BreadcrumbList)

XML sitemap auto-generated

robots.txt configured

Canonical URLs on all pages

Alt text on all images

## STEP 10: SECURITY REQUIREMENTS
HTTPS enforced (HSTS)

Input sanitization on all forms

CSRF protection

Rate limiting on RFQ submissions

Secure session management

Password hashing with bcrypt/Argon2

Environment variables for all secrets

Regular security headers (X-Frame-Options, X-Content-Type-Options, etc.)

## STEP 11: DEVELOPMENT PHASES (For Claude Code to Follow)
Phase 1: Project Setup (Day 1)
Initialize project with Next.js + TypeScript + Tailwind

Set up folder structure (components, pages, styles, utils, lib, types)

Configure ESLint, Prettier, Husky

Set up environment variables

Create basic layout (Header, Footer, global styles)

Phase 2: Core UI Components (Day 2-3)
Build reusable components: Button, Input, Card, Modal, Table, Badge, Tabs, Breadcrumb

Build layout components: Header (with navigation and search), Footer

Implement responsive grid system

Create the design system/token file (colors, fonts, spacing, shadows)

Phase 3: Homepage (Day 4-5)
Hero section with background and CTAs

Trust bar with icons

Search bar with filters

Industries grid

How It Works section

Stats counter with animation

Testimonials carousel

CTA banner

Featured parts (placeholder data)

Phase 4: Parts Catalog & Search (Day 6-8)
Catalog page with filters and sorting

Grid/List view toggle

Pagination

Search functionality with autocomplete

Filter by NSN, CAGE, Part Number, Category

Part card component

Phase 5: Part Detail Page (Day 9-10)
Dynamic route for part details

Specs table

Stock status and pricing display

Cross-references

Similar parts carousel

RFQ button and saved parts functionality

Phase 6: RFQ System (Day 11-13)
Multi-step RFQ form

Part search within RFQ

Urgent buy toggle

Form validation

Submission with confirmation

Email notification on submission

Phase 7: User Authentication & Dashboard (Day 14-16)
Login/Register pages

JWT authentication

Dashboard layout with sidebar

My RFQs list

My Orders list

Saved parts

Profile management

Phase 8: Inventory Submission (Day 17)
Upload form for excess inventory

File upload (Excel/CSV)

Submission tracking

Phase 9: About, Contact, & Static Pages (Day 18)
About Us page

Contact page with form

Industries pages

Quality Assurance page

Terms & Privacy pages

Phase 10: SEO, Performance, & Testing (Day 19-20)
Meta tags for all pages

Structured data

Sitemap generation

Performance optimization (lazy loading, image optimization)

Cross-browser testing

Mobile testing

Accessibility audit

Phase 11: Deployment (Day 21)
Deploy to Vercel/Netlify

Configure custom domain

Set up SSL

Configure analytics

Final QA

⚙️ Phase 0: Data Layer & Mock Setup (Day 0 - Must Do First)
Environment Setup: .env.local file banayein with NEXT_PUBLIC_USE_MOCK=true and NEXT_PUBLIC_API_URL= (blank).

JSON Creation: src/data/ folder me upar diye gaye saare JSON files create karein. Kam se kam 40-50 products daalein taaki site dummy na lage.

API Client Library: src/lib/api-client.js banayein. Isme ek generic request() function ho jo:

Agar USE_MOCK=true → Local JSON file se data return kare + setTimeout for delay.

Agar USE_MOCK=false → Actual fetch kare API_URL + endpoint ko.

Services Build: Product, Auth, RFQ, Dashboard services banayein jo sirf api-client ko call karein.

LocalStorage Sync: RFQ submit hone par data localStorage me save ho aur Dashboard me dikhe (taaki dummy site na lage, user ko lage ki kaam ho raha hai).

## STEP 12: MOCK DATA REQUIREMENTS
12.1 Sample Parts Data (Minimum 50 parts)
Each part should have:

NSN (13-digit format: XXXX-XX-XXX-XXXX)

CAGE Code (5 characters)

Part Number

Description

FSG (2 digits) and FSC (2 digits)

Manufacturer

Condition (New/Used/Refurbished)

Stock Status (In Stock/On Order/Obsolete)

Quantity Available

Unit Price

Category

12.2 Sample FSG/FSC Categories
FSG 12: Fire Control Equipment

FSG 13: Ammunition & Explosives

FSG 14: Guided Missiles

FSG 15: Aircraft & Airframe Structural Components

FSG 16: Aircraft Components & Accessories

FSG 28: Engines, Turbines & Components

FSG 29: Engine Accessories

FSG 31: Bearings

FSG 53: Hardware & Abrasives

FSG 59: Electrical & Electronic Equipment Components

FSG 61: Electric Wire & Power Distribution Equipment

FSG 62: Lighting Fixtures & Lamps

## STEP 13: COPY & CONTENT GUIDELINES
13.1 Tone of Voice
Professional but not robotic

Confident in capabilities

Customer-centric — focus on solving procurement pain points

Urgency when needed (for urgent buy)

Trustworthy — data-driven, transparent

13.2 Key Messages
"We source hard-to-find and obsolete parts"

"100% inspection on every order"

"Quotes within 24 hours"

"Global shipping to over 150 countries"

"ISO-certified quality assurance"

13.3 Required Page Copy
Page	Required Elements
Homepage	Hero headline + sub-headline, USP statements, value proposition
About	Company story, mission, vision, values, team
Quality	Quality process, certifications, inspection protocols, warranty
Industries	Each industry page: overview, parts we supply, case studies
Contact	Phone, email, address, hours, form
## STEP 14: "DO NOT" LIST (What to Avoid)
❌ Don't Do	✅ Instead
Use generic stock photos of people	Use industry-specific imagery (turbines, aircraft, parts)
Copy PartTarget.com's design exactly	Create a unique, modern UI with your own design language
Make it look like a portfolio/dummy site	Include real functionality: search, RFQ, dashboards
Clutter the homepage with too much text	Use visuals, icons, and short, punchy copy
Ignore mobile responsiveness	Design mobile-first
Skip SEO metadata	Add proper meta tags, structured data, sitemap
Use inconsistent colors/fonts	Stick to the defined design system
Forget loading states	Add skeleton loaders and spinners
Skip error handling	Show user-friendly error messages
Hardcode data	Use a database or API for all dynamic content

## STEP 15: FINAL CHECKLIST (For Claude Code to Verify)
Domain resolves to aeroturbinespare.com

SSL certificate is active

All pages load without errors

Search functionality works

RFQ form submits successfully

Email notifications are sent

User registration and login work

Dashboard displays user data

Responsive on all screen sizes

Lighthouse score > 90

All links are functional

No console errors

Analytics is configured

Sitemap is generated

robots.txt is configured

All images have alt text

All forms have validation

Security headers are set

## STEP 16: FRONTEND-ONLY ARCHITECTURE WITH MOCK DATA & BACKEND READINESS (CRITICAL)
Yeh step ensure karta hai ki website purely static (HTML/CSS/JS ya Next.js SSG) mode me run ho, lekin iska data layer itna mature ho ki backend banate hi sirf .env change karke live ho jaye.

16.1 Core Architecture Rules (Claude ko Strictly Follow Karna Hai)
#	Rule	Explanation
1	"use client" Directive	Dashboard, RFQ forms, aur search filters wale saare pages ke top par "use client" use karein, kyunki hum browser state (localStorage) use kar rahe hain
2	No /src/app/api/ Folder	Abhi koi bhi Next.js API routes nahi banane. Saari mocking src/services/ folder mein normal functions aur Promises se handle hogi
3	Auth Session Persistence	Mock mode mein login ke baad user data localStorage mein save karein taaki page refresh par dashboard log-out na ho
4	Toast Notifications	Har mock action (RFQ Submit, Inventory Upload, Login) par react-hot-toast se alerts dikhayein
5	File Upload Mocking	Inventory upload par fake progress bar (2-second loading) dikhayein, phir success state trigger karein — actual network call nahi
16.2 Environment Variables (.env.local)
env
# Mock Mode — Jab tak backend nahi hai, ye TRUE rakhein
NEXT_PUBLIC_USE_MOCK=true

# Backend URL — Jab backend ban jaye, ise change karke REAL URL daalein
NEXT_PUBLIC_API_URL=https://api.aeroturbinespare.com/v1

# Optional: Mock delay (ms) — real backend jaisa feel dene ke liye
NEXT_PUBLIC_MOCK_DELAY=400
16.3 Folder Structure (Frontend Data Layer)
text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # "use client"
│   │   └── register/page.tsx     # "use client"
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx    # "use client"
│   │   ├── rfqs/page.tsx         # "use client"
│   │   └── profile/page.tsx      # "use client"
│   ├── catalog/
│   │   ├── page.tsx              # "use client" — search/filter
│   │   └── [id]/page.tsx         # "use client" — part detail
│   ├── rfq/
│   │   └── page.tsx              # "use client" — multi-step form
│   ├── inventory/
│   │   └── page.tsx              # "use client" — upload form
│   └── layout.tsx                # Root layout (server component)
│
├── lib/
│   ├── api-client.ts             # MAIN — checks env, routes to mock or real
│   └── mock-data.ts              # Loads all JSON files
│
├── data/                         # STATIC JSON FILES (Edit karte rahiye)
│   ├── products.json             # 50+ products (NSN, Price, Stock, etc.)
│   ├── categories.json           # FSG/FSC Categories
│   ├── industries.json           # Industries we serve
│   ├── testimonials.json         # Client reviews
│   └── users.json                # Demo users for login simulation
│
├── services/                     # ALL BUSINESS LOGIC HERE
│   ├── productService.ts         # getAll, getById, search, filter
│   ├── rfqService.ts             # submitRFQ (stores in localStorage)
│   ├── authService.ts            # login/register (checks users.json)
│   └── dashboardService.ts       # getMyRFQs, getMyOrders (localStorage)
│
├── hooks/
│   ├── useAuth.ts                # Auth state management
│   └── useToast.ts               # Toast notifications
│
└── types/
    └── index.ts                  # TypeScript interfaces
16.4 API Client (src/lib/api-client.ts) — The Heart of the System
typescript
// src/lib/api-client.ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const MOCK_DELAY = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '400');

// Mock data imports
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import industriesData from '@/data/industries.json';
import testimonialsData from '@/data/testimonials.json';
import usersData from '@/data/users.json';

// Generic request handler
export async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return mockResponse<T>(endpoint, options);
  }
  
  // Real API call
  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// Mock response router
function mockResponse<T>(endpoint: string, options?: RequestInit): T {
  const method = options?.method || 'GET';
  const url = endpoint.split('?')[0];
  
  // Auth endpoints
  if (url === '/auth/login' && method === 'POST') {
    const body = JSON.parse(options?.body as string);
    const user = usersData.find(u => u.email === body.email && u.password === body.password);
    if (!user) throw new Error('Invalid credentials');
    return { success: true, token: 'mock-jwt-token', user } as T;
  }
  
  // Products
  if (url === '/products' && method === 'GET') {
    // Handle search params
    const params = new URLSearchParams(endpoint.split('?')[1] || '');
    let results = [...productsData];
    if (params.get('search')) {
      const q = params.get('search')!.toLowerCase();
      results = results.filter(p => 
        p.partNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.nsn.includes(q)
      );
    }
    // ... more filters
    return { success: true, data: results, pagination: { total: results.length, page: 1, limit: 20 } } as T;
  }
  
  // RFQ Submit
  if (url === '/rfq/submit' && method === 'POST') {
    const body = JSON.parse(options?.body as string);
    const rfq = {
      id: `RFQ-${Date.now()}`,
      ...body,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    localStorage.setItem('user_rfqs', JSON.stringify([rfq, ...existing]));
    return { success: true, rfqId: rfq.id, message: 'RFQ submitted successfully' } as T;
  }
  
  // Dashboard RFQs
  if (url === '/dashboard/rfqs' && method === 'GET') {
    const rfqs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    return { success: true, data: rfqs } as T;
  }
  
  // Categories
  if (url === '/categories') {
    return { success: true, data: categoriesData } as T;
  }
  
  // Industries
  if (url === '/industries') {
    return { success: true, data: industriesData } as T;
  }
  
  // Testimonials
  if (url === '/testimonials') {
    return { success: true, data: testimonialsData } as T;
  }
  
  // Default: return empty
  return { success: true, data: [] } as T;
}
16.5 JSON Data Schema — Products (products.json)
json
[
  {
    "id": "prod-001",
    "nsn": "2840-01-123-4567",
    "cage": "12345",
    "partNumber": "TURBO-FAN-100",
    "description": "High-pressure turbine fan blade for commercial aircraft engines. Nickel-based alloy with thermal barrier coating.",
    "shortDescription": "Turbine fan blade, high-pressure",
    "fsg": "28",
    "fsc": "2840",
    "category": "Gas Turbines & Jet Engines",
    "manufacturer": "General Electric",
    "condition": "New",
    "stockStatus": "In Stock",
    "quantityAvailable": 15,
    "unitPrice": 2499.99,
    "currency": "USD",
    "datasheetUrl": "/datasheets/turbo-fan-100.pdf",
    "imageUrl": "/images/products/turbo-fan-100.jpg",
    "crossReferences": ["ALT-9876", "XYZ-123"],
    "specifications": {
      "material": "Nickel-based alloy",
      "weight": "2.5 kg",
      "operatingTemp": "1200°C",
      "lifeCycle": "5000 hours"
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-06-01T14:30:00Z"
  }
]
16.6 PartTarget.com Features — Complete Checklist (Ensure All Are Covered)
#	Feature	Implementation Status
1	Advanced Part Search — by NSN, CAGE, Part Number, Description, FSG/FSC	✅ JSON + filter logic
2	RFQ (Request for Quote) System — multi-step form	✅ localStorage save
3	Product Catalog — Browse by FSG/FSC categories	✅ JSON categories
4	Part Detail Pages — Full specs, cross-references, stock status	✅ Dynamic routes
5	Quote Management — View, compare, accept quotes	✅ Dashboard
6	Urgent Buy Option — Flag RFQs as urgent	✅ Form field
7	Excess/Surplus Inventory Submission — Upload CSV/Excel	✅ Mock upload + progress
8	Order Tracking — Track status	✅ Dashboard
9	User Dashboard — RFQ history, saved parts, profile	✅ localStorage
10	Quality Assurance Badges — ISO, AS9120, warranty	✅ UI trust bar
11	100% Inspection on Every Order — Trust signal	✅ Badge
12	Full-time QA Department — Trust signal	✅ Section
13	Part Warranty — All Materials Certified	✅ Badge
14	Direct Access to Your Trader — Personal account manager	✅ Contact/About
15	Industries Served — Aerospace, Military, Automotive, Medical, etc.	✅ JSON + UI grid
16	"Amazon for Parts" — Quick, easy procurement experience	✅ UX design
16.7 API Documentation — Backend Ready (API_SPEC.md)
📄 Yeh documentation Claude ko generate karni hai — root folder mein API_SPEC.md file banayein.

Base URL: {{base_url}}/api/v1

#	Endpoint	Method	Request	Response	Description
1	/products	GET	Query: ?search=fan&nsn=2840&cage=12345&category=engines&page=1&limit=20	{ success: true, data: [Product], pagination: { total, page, limit } }	Search/Filter products
2	/products/:id	GET	URL Params: id	{ success: true, data: Product }	Get single product
3	/categories	GET	-	{ success: true, data: [{ id, name, fsg, count }] }	All categories
4	/industries	GET	-	{ success: true, data: [{ id, name, icon, description }] }	All industries
5	/testimonials	GET	-	{ success: true, data: [{ id, name, company, quote, rating }] }	Client testimonials
6	/auth/login	POST	{ email, password }	{ success: true, token, user: { id, name, company } }	User Login
7	/auth/register	POST	{ email, password, companyName, fullName, phone }	{ success: true, message: "User registered" }	User Registration
8	/auth/logout	POST	Auth Header	{ success: true, message: "Logged out" }	Logout
9	/rfq/submit	POST	{ productId, quantity, urgency, deliveryDeadline, shippingAddress, specialInstructions }	{ success: true, rfqId, message }	Submit RFQ
10	/dashboard/rfqs	GET	Auth Header	{ success: true, data: [{ rfqId, product, status, date }] }	User's RFQs
11	/dashboard/orders	GET	Auth Header	{ success: true, data: [{ orderId, items, total, status }] }	User's orders
12	/dashboard/profile	GET/PUT	Auth Header	{ success: true, data: User }	Get/Update profile
13	/inventory/submit	POST	FormData: file (CSV/Excel)	{ success: true, submissionId, status: "Processing" }	Submit excess inventory
16.8 Step-by-Step Implementation Checklist (Claude ko follow karna hai)
.env.local create karein with NEXT_PUBLIC_USE_MOCK=true

src/data/ folder mein sab JSON files banayein (minimum 50 products)

src/lib/api-client.ts banayein — mock router with all endpoints

src/services/ folder mein sab services banayein

src/hooks/useAuth.ts — localStorage-based auth session

src/hooks/useToast.ts — react-hot-toast integration

Sabhi pages ke top par "use client" directive daalein

src/app/api/ folder bilkul nahi banana

RFQ submit → localStorage save → Dashboard mein dikhe

Login → localStorage save → Page refresh par bhi logged in rahe

Inventory upload → 2-second progress bar → Success toast

API_SPEC.md root folder mein generate karein

Har mock action par toast notification dikhe


SUMMARY
This prompt provides everything Claude Code needs to build aeroturbinespare.com from scratch — a premium, functional, US-based aerospace parts sourcing platform. The site must look nothing like a portfolio and must feel like a real, production-grade B2B procurement tool.

The key differentiators from PartTarget.com:

Modern, premium UI with glassmorphism and micro-interactions

Better mobile responsiveness

Enhanced search with autocomplete

User dashboard with full account management

Cleaner, more professional typography and spacing

Trust signals integrated throughout the UX

Start building immediately. Do not skip any step. Do not use placeholder or dummy content that makes the site feel unfinished. Every page must look complete and production-ready.


