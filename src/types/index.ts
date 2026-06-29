// ============================================================
// AeroTurbineSpare — Global TypeScript Interfaces
// ============================================================

import type { ChatConfig } from './chat';

export interface ProductSpecifications {
  material?: string;
  weight?: string;
  dimensions?: string;
  operatingTemp?: string;
  pressure?: string;
  voltage?: string;
  current?: string;
  lifeCycle?: string;
  certifications?: string[];
  compatibleAirframes?: string[];
  threadSize?: string;
  diameter?: string;
  torqueRating?: string;
  bearingType?: string;
  innerDiameter?: string;
  outerDiameter?: string;
  width?: string;
  loadCapacity?: string;
  rpm?: string;
  speedRating?: string;
  hardness?: string;
  finish?: string;
  color?: string;
  conductorSize?: string;
  insulationType?: string;
  connectorType?: string;
  pinCount?: string;
  frequency?: string;
  impedance?: string;
  powerRating?: string;
  [key: string]: string | string[] | undefined;
}

export interface Product {
  id: string;
  nsn: string;
  cage: string;
  partNumber: string;
  description: string;
  shortDescription: string;
  fsg: string;
  fsc: string;
  category: string;
  manufacturer: string;
  condition: 'New' | 'Used' | 'Refurbished' | 'Overhauled';
  stockStatus: 'In Stock' | 'On Order' | 'Obsolete' | 'Limited';
  quantityAvailable: number;
  unitPrice: number;
  currency: string;
  datasheetUrl?: string;
  imageUrl?: string;
  crossReferences: string[];
  specifications: ProductSpecifications;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  fsg: string;
  fsc: string;
  description: string;
  icon: string;
  partCount: number;
  imageUrl?: string;
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId?: string;
  industryIds?: string[];
  manufacturer?: string;
  description?: string;
  icon?: string;
  partCount?: number;
  sortOrder?: number;
  cardConfig?: Record<string, unknown>;
  pageConfig?: Record<string, unknown>;
  items?: CategoryItem[];
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  longDescription?: string;
  partCount?: number;
  keyParts?: string[];
  clients?: string[];
}

export interface FsgCategory {
  id: string;
  name: string;
  fsg: string;
  fsc?: string;
  description?: string;
  icon?: string;
  partCount?: number;
}

export interface NavCategoryTree {
  fsgCategories: FsgCategory[];
  industries: Industry[];
  productCategories: NavCategory[];
  partCategories: NavCategory[];
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  companyLogo?: string;
  quote: string;
  rating: number;
  country: string;
  date: string;
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'ContentManager' | 'Trader' | 'User';

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  company: string;
  cageCode?: string;
  phone: string;
  role: UserRole;
  country: string;
  address?: string;
  avatarUrl?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface RFQItem {
  productId: string;
  partNumber: string;
  nsn: string;
  description: string;
  quantity: number;
  targetPrice?: number;
  condition?: string;
}

export interface RFQ {
  id: string;
  userId?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  items: RFQItem[];
  urgency: 'Standard' | 'Urgent' | 'Critical';
  deliveryDeadline: string;
  shippingAddress: string;
  shippingCountry: string;
  incoterms: string;
  specialInstructions?: string;
  attachmentUrl?: string;
  status: 'Pending' | 'Under Review' | 'Quoted' | 'Accepted' | 'Ordered' | 'Cancelled';
  quoteAmount?: number;
  quoteCurrency?: string;
  quotedAt?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  rfqId?: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  status: 'Processing' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  carrier?: string;
  shippingAddress: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InventorySubmission {
  id: string;
  userId?: string;
  companyName: string;
  contactEmail: string;
  fileName: string;
  fileUrl?: string;
  partCount?: number;
  status: 'Pending' | 'Processing' | 'Complete' | 'Rejected';
  notes?: string;
  submittedAt: string;
  processedAt?: string;
}

export interface SavedPart {
  productId: string;
  savedAt: string;
}

// ── Admin / Super Admin ──────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'Success' | 'Failed' | 'Warning';
  createdAt: string;
}

export interface SystemSettings {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  rfqEmailRecipient: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  maxRFQsPerDay: number;
  sessionTimeoutMinutes: number;
  enableAuditLogging: boolean;
  backupSchedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  dataRetentionDays: number;
  // Media / Cloudinary
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRFQs: number;
  pendingRFQs: number;
  totalParts: number;
  totalOrders: number;
  revenueThisMonth: number;
  newUsersThisMonth: number;
}

// ── Site / Branding config ──────────────────────────────────

export interface SiteConfig {
  /* Logo */
  logoHeight:    number;   // px
  logoWidth:     number;   // px, 0 = auto
  logoPaddingX:  number;   // px
  logoPaddingY:  number;   // px
  logoMarginX:   number;   // px
  logoMarginY:   number;   // px
  logoText:      string;   // display name
  logoSubText:   string;   // subtitle under logo
  logoImageUrl?: string;   // uploaded/linked logo image URL
  logoLink?:     string;   // logo click destination

  /* Hero */
  heroHeading:    string;
  heroSubheading: string;
  heroBadgeText:  string;
  heroBgType:     'gradient' | 'solid' | 'image';
  heroBgValue:    string;   // hex color or image URL
  heroCta1Label:  string;
  heroCta1Href:   string;
  heroCta2Label:  string;
  heroCta2Href:   string;

  /* Chat & WhatsApp */
  chat: ChatConfig;

  updatedAt: string;
  updatedBy: string;
}

export interface BackupRecord {
  id: string;
  triggeredBy: string;
  type: 'manual' | 'scheduled';
  status: 'Running' | 'Complete' | 'Failed';
  sizeBytes?: number;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
}

// ── API response wrappers ───────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: Omit<User, 'password'>;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  company: string;
  cageCode?: string;
  phone: string;
  role: UserRole;
  country: string;
  address?: string;
  avatarUrl?: string;
  isActive?: boolean;
  token: string;
}

export interface CategoryItem {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  link?: string;
  data?: Record<string, unknown>;
  cardConfig?: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MegaMenuItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  desc?: string;
}
export interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}
export interface MegaMenuData {
  label: string;
  href: string;
  sections: MegaMenuSection[];
  featured?: {
    label: string;
    desc: string;
    href: string;
    cta: string;
    badge: string;
  };
}
