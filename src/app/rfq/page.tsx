'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Search, Plus, Trash2, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, Zap, Clock,
  Package, Truck, FileText, ClipboardList, Eye,
  Paperclip, Upload, User, Building2, Mail, Phone as PhoneIcon,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { submitRFQ } from '@/services/rfqService';
import { searchProducts } from '@/services/productService';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Part Identification', icon: Package },
  { id: 2, label: 'Order Details',       icon: ClipboardList },
  { id: 3, label: 'Shipping & Contact',  icon: Truck },
  { id: 4, label: 'Instructions',        icon: FileText },
  { id: 5, label: 'Review & Submit',     icon: Eye },
] as const;

const URGENCY_OPTIONS = [
  {
    value: 'Standard',
    label: 'Standard',
    desc: '5–10 business days',
    color: 'border-silver-dark bg-white text-text',
    activeColor: 'border-navy bg-navy text-white',
    icon: Clock,
    iconColor: 'text-text-muted',
    activeIconColor: 'text-white',
  },
  {
    value: 'Urgent',
    label: 'Urgent',
    desc: '24–72 hours',
    color: 'border-orange/40 bg-orange/5 text-orange',
    activeColor: 'border-orange bg-orange text-white',
    icon: Zap,
    iconColor: 'text-orange',
    activeIconColor: 'text-white',
  },
  {
    value: 'Critical',
    label: 'Critical (AOG)',
    desc: 'Same day / next flight',
    color: 'border-red-300 bg-red-50 text-red-600',
    activeColor: 'border-red-600 bg-red-600 text-white',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    activeIconColor: 'text-white',
  },
] as const;

const INCOTERMS_OPTIONS = [
  { value: 'EXW', label: 'EXW — Ex Works' },
  { value: 'FCA', label: 'FCA — Free Carrier' },
  { value: 'FOB', label: 'FOB — Free On Board' },
  { value: 'CIF', label: 'CIF — Cost, Insurance & Freight' },
  { value: 'DDP', label: 'DDP — Delivered Duty Paid' },
  { value: 'DAP', label: 'DAP — Delivered At Place' },
];

const CONDITION_OPTIONS = [
  { value: '',            label: 'Any Condition' },
  { value: 'New',         label: 'New' },
  { value: 'Overhauled',  label: 'Overhauled' },
  { value: 'Refurbished', label: 'Refurbished' },
  { value: 'Used',        label: 'Used' },
];

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const rfqItemSchema = z.object({
  productId:   z.string(),
  partNumber:  z.string().min(1, 'Part number is required'),
  nsn:         z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity:    z.number().int().min(1, 'Min quantity is 1'),
  targetPrice: z.number().min(0).optional(),
  condition:   z.string().optional(),
});

// Master schema (all fields)
const masterSchema = z.object({
  items:               z.array(rfqItemSchema).min(1),
  urgency:             z.enum(['Standard', 'Urgent', 'Critical']),
  deliveryDeadline:    z.string().min(1),
  contactName:         z.string().min(2),
  companyName:         z.string().min(2),
  email:               z.string().email(),
  phone:               z.string().min(7),
  shippingAddress:     z.string().min(10),
  shippingCountry:     z.string().min(2),
  incoterms:           z.string().min(1),
  specialInstructions: z.string().optional(),
  termsAccepted:       z.boolean(),
});

type MasterFormValues = z.infer<typeof masterSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayPlus1(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

type RFQFormItem = {
  productId:   string;
  partNumber:  string;
  nsn:         string;
  description: string;
  quantity:    number;
  targetPrice?: number;
  condition?:  string;
};

function productToRFQFormItem(p: Product): RFQFormItem {
  return {
    productId:   p.id,
    partNumber:  p.partNumber,
    nsn:         p.nsn,
    description: p.description,
    quantity:    1,
    targetPrice: undefined,
    condition:   p.condition,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepProgress({ current }: { current: number }) {
  return (
    <div className="w-full mb-8">
      {/* Mobile: simple label */}
      <div className="sm:hidden mb-4 text-center">
        <span className="text-sm font-semibold text-orange">
          Step {current} of {STEPS.length}:
        </span>
        <span className="ml-2 text-sm text-text font-medium">
          {STEPS[current - 1].label}
        </span>
      </div>

      {/* Desktop: full step row */}
      <div className="hidden sm:flex items-center w-full">
        {STEPS.map((step, idx) => {
          const done    = current > step.id;
          const active  = current === step.id;
          const Icon    = step.icon;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  done   && 'bg-navy border-navy',
                  active && 'bg-orange border-orange shadow-lg shadow-orange/30',
                  !done && !active && 'bg-white border-silver-dark',
                )}>
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={cn(
                      'w-4 h-4',
                      active ? 'text-white' : 'text-text-muted',
                    )} />
                  )}
                </div>
                <span className={cn(
                  'text-xs font-medium whitespace-nowrap hidden md:block',
                  active ? 'text-orange' : done ? 'text-navy' : 'text-text-muted',
                )}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'h-0.5 flex-1 mx-2 transition-all duration-300',
                  current > step.id ? 'bg-navy' : 'bg-silver-dark',
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-silver rounded-full overflow-hidden">
        <div
          className="h-full bg-orange rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RFQPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params      = use(searchParams);
  const { user }    = useAuth();

  // URL params
  const urlUrgency    = typeof params.urgency    === 'string' ? params.urgency    : undefined;
  const urlPartId     = typeof params.partId     === 'string' ? params.partId     : undefined;
  const urlPartNumber = typeof params.partNumber === 'string' ? params.partNumber : undefined;

  // Step state
  const [step, setStep]         = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [rfqId, setRfqId]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Part search state (Step 1)
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState<Product[]>([]);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [showDropdown, setShowDropdown]       = useState(false);
  const [manualMode, setManualMode]           = useState(false);
  const [manualPart, setManualPart]           = useState({ partNumber: '', nsn: '', description: '', condition: '' });
  const [manualError, setManualError]         = useState('');
  const searchRef                             = useRef<HTMLDivElement>(null);

  // File attachment (mock)
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Main form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<MasterFormValues>({
    resolver: zodResolver(masterSchema),
    defaultValues: {
      items:               [],
      urgency:             (urlUrgency?.toLowerCase() === 'urgent'   ? 'Urgent'
                          : urlUrgency?.toLowerCase() === 'critical' ? 'Critical'
                          : 'Standard'),
      deliveryDeadline:    getTodayPlus1(),
      contactName:         user?.fullName  || '',
      companyName:         user?.company   || '',
      email:               user?.email     || '',
      phone:               user?.phone     || '',
      shippingAddress:     user?.address   || '',
      shippingCountry:     user?.country   || '',
      incoterms:           '',
      specialInstructions: '',
      termsAccepted:       false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems   = watch('items');
  const watchedUrgency = watch('urgency');

  // Pre-fill from auth session when user loads
  useEffect(() => {
    if (user) {
      if (!watch('contactName') && user.fullName)  setValue('contactName',     user.fullName);
      if (!watch('companyName') && user.company)   setValue('companyName',     user.company);
      if (!watch('email')       && user.email)     setValue('email',           user.email);
      if (!watch('phone')       && user.phone)     setValue('phone',           user.phone);
      if (!watch('shippingAddress') && user.address) setValue('shippingAddress', user.address);
      if (!watch('shippingCountry') && user.country) setValue('shippingCountry', user.country);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Pre-add part from URL params
  useEffect(() => {
    if (urlPartId && urlPartNumber && fields.length === 0) {
      append({
        productId:    urlPartId,
        partNumber:   urlPartNumber,
        nsn:          '',
        description:  urlPartNumber,
        quantity:     1,
        targetPrice:  undefined,
        condition:    '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPartId, urlPartNumber]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || manualMode) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchProducts(searchQuery.trim(), 8);
        setSearchResults(results);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [searchQuery, manualMode]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Add product from search result
  const addFromSearch = useCallback((product: Product) => {
    const alreadyAdded = watchedItems.some(i => i.partNumber === product.partNumber);
    if (alreadyAdded) {
      toast.error(`${product.partNumber} is already in your list`);
      setShowDropdown(false);
      setSearchQuery('');
      return;
    }
    append(productToRFQFormItem(product));
    setSearchQuery('');
    setShowDropdown(false);
    toast.success(`${product.partNumber} added to RFQ`);
  }, [watchedItems, append]);

  // Add from manual entry
  const addManualPart = () => {
    if (!manualPart.partNumber.trim()) {
      setManualError('Part number is required');
      return;
    }
    if (!manualPart.description.trim()) {
      setManualError('Description is required');
      return;
    }
    setManualError('');
    const alreadyAdded = watchedItems.some(i => i.partNumber === manualPart.partNumber.trim());
    if (alreadyAdded) {
      toast.error(`${manualPart.partNumber} is already in your list`);
      return;
    }
    append({
      productId:   '',
      partNumber:  manualPart.partNumber.trim().toUpperCase(),
      nsn:         manualPart.nsn.trim(),
      description: manualPart.description.trim(),
      quantity:    1,
      targetPrice: undefined,
      condition:   manualPart.condition || undefined,
    });
    setManualPart({ partNumber: '', nsn: '', description: '', condition: '' });
    toast.success('Part added to RFQ');
  };

  // Step navigation with validation
  const STEP_FIELDS: Record<number, (keyof MasterFormValues)[]> = {
    1: ['items'],
    2: ['urgency', 'deliveryDeadline'],
    3: ['contactName', 'companyName', 'email', 'phone', 'shippingAddress', 'shippingCountry', 'incoterms'],
    4: ['specialInstructions', 'termsAccepted'],
    5: [],
  };

  const goNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step] as (keyof MasterFormValues)[];
    const valid = await trigger(fieldsToValidate);
    if (!valid) return;
    setStep(s => Math.min(s + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission
  const onSubmit: SubmitHandler<MasterFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        companyName:         data.companyName,
        contactName:         data.contactName,
        email:               data.email,
        phone:               data.phone,
        items:               data.items.map(item => ({
          ...item,
          targetPrice: item.targetPrice ? Number(item.targetPrice) : undefined,
        })),
        urgency:             data.urgency,
        deliveryDeadline:    data.deliveryDeadline,
        shippingAddress:     data.shippingAddress,
        shippingCountry:     data.shippingCountry,
        incoterms:           data.incoterms,
        specialInstructions: data.specialInstructions || undefined,
      };
      const result = await submitRFQ(payload);
      setRfqId(result.rfqId);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit RFQ. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4 bg-bg">
          <div className="max-w-xl w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-text mb-2">RFQ Submitted!</h1>
            <p className="text-text-muted mb-2">
              Your request for quote has been received.
            </p>
            <div className="inline-flex items-center gap-2 bg-navy/8 rounded-xl px-5 py-3 mb-6">
              <span className="text-sm font-medium text-text-muted">RFQ Reference:</span>
              <span className="font-mono font-bold text-navy text-lg tracking-widest">{rfqId}</span>
            </div>
            <div className="bg-orange/10 border border-orange/25 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-text mb-0.5">Our team will respond within 24 hours</div>
                  <p className="text-sm text-text-muted">
                    A dedicated trader will review your requirements and contact you at <strong>{watch('email')}</strong>.
                    For urgent needs, call us directly at <a href="tel:+17138425500" className="text-orange hover:underline">+1-713-842-5500</a>.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="orange"
                size="lg"
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                  setRfqId('');
                }}
              >
                Submit Another RFQ
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Step renderers ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Identify Your Parts</h2>
        <p className="text-sm text-text-muted">Search our catalog or enter part details manually. Add as many parts as needed.</p>
      </div>

      {/* Toggle: Search vs Manual */}
      <div className="flex gap-2 p-1 bg-silver rounded-xl w-fit">
        <button
          type="button"
          onClick={() => { setManualMode(false); setManualError(''); }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            !manualMode ? 'bg-white shadow text-navy' : 'text-text-muted hover:text-text',
          )}
        >
          <Search className="w-4 h-4 inline mr-1.5" />
          Search Catalog
        </button>
        <button
          type="button"
          onClick={() => { setManualMode(true); setShowDropdown(false); setManualError(''); }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            manualMode ? 'bg-white shadow text-navy' : 'text-text-muted hover:text-text',
          )}
        >
          <Plus className="w-4 h-4 inline mr-1.5" />
          Manual Entry
        </button>
      </div>

      {/* Search field */}
      {!manualMode && (
        <div ref={searchRef} className="relative">
          <Input
            label="Search by Part Number, NSN, or Description"
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="e.g. MS20470AD3-3, 2510-01-234-5678..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            autoComplete="off"
          />
          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-silver-dark rounded-xl shadow-xl z-30 overflow-hidden">
              {searchLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted">
                  <span className="inline-block w-4 h-4 border-2 border-orange/40 border-t-orange rounded-full animate-spin" />
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No results for &ldquo;{searchQuery}&rdquo; — try manual entry below.
                </div>
              ) : (
                <ul className="max-h-72 overflow-y-auto divide-y divide-silver">
                  {searchResults.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => addFromSearch(p)}
                        className="w-full text-left px-4 py-3 hover:bg-silver transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-mono text-sm font-semibold text-navy part-number truncate">
                              {p.partNumber}
                            </div>
                            <div className="text-xs text-text-muted mt-0.5 truncate">{p.description}</div>
                            {p.nsn && (
                              <div className="text-xs text-text-muted/70 mt-0.5">NSN: {p.nsn}</div>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end gap-1">
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              p.stockStatus === 'In Stock'  && 'bg-green-100 text-green-700',
                              p.stockStatus === 'On Order'  && 'bg-yellow-100 text-yellow-700',
                              p.stockStatus === 'Limited'   && 'bg-purple-100 text-purple-700',
                              p.stockStatus === 'Obsolete'  && 'bg-red-100 text-red-700',
                            )}>
                              {p.stockStatus}
                            </span>
                            {p.unitPrice > 0 && (
                              <span className="text-xs text-text-muted">{formatPrice(p.unitPrice)}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual entry fields */}
      {manualMode && (
        <div className="border border-silver-dark rounded-xl p-4 space-y-4 bg-bg">
          <h3 className="text-sm font-semibold text-text">Enter Part Details Manually</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Part Number"
              required
              placeholder="e.g. MS20470AD3-3"
              value={manualPart.partNumber}
              onChange={(e) => setManualPart(p => ({ ...p, partNumber: e.target.value }))}
              className="uppercase"
            />
            <Input
              label="NSN (National Stock Number)"
              placeholder="e.g. 5310-01-234-5678"
              value={manualPart.nsn}
              onChange={(e) => setManualPart(p => ({ ...p, nsn: e.target.value }))}
            />
          </div>
          <Input
            label="Description"
            required
            placeholder="e.g. Rivet, Blind, Aluminum, 3/32 Diameter"
            value={manualPart.description}
            onChange={(e) => setManualPart(p => ({ ...p, description: e.target.value }))}
          />
          <div className="w-48">
            <Select
              label="Condition"
              options={CONDITION_OPTIONS}
              value={manualPart.condition}
              onChange={(e) => setManualPart(p => ({ ...p, condition: e.target.value }))}
            />
          </div>
          {manualError && (
            <p className="text-xs text-red-500">{manualError}</p>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={addManualPart}>
            <Plus className="w-4 h-4" /> Add to RFQ
          </Button>
        </div>
      )}

      {/* Parts list */}
      {errors.items && (
        <p className="text-sm text-red-500 font-medium">{errors.items.message as string}</p>
      )}

      {fields.length > 0 && (
        <div className="border border-silver-dark rounded-xl overflow-hidden">
          <div className="bg-silver px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-text">
              Parts List ({fields.length} {fields.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-silver-dark bg-silver/50">
                  <th className="text-left px-4 py-2.5 font-medium text-text-muted text-xs uppercase tracking-wider">Part Number</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">NSN</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-muted text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-2.5 font-medium text-text-muted text-xs uppercase tracking-wider w-24">Qty</th>
                  <th className="text-right px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver">
                {fields.map((field, idx) => (
                  <tr key={field.id} className="bg-white hover:bg-silver/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-navy part-number">
                        {watchedItems[idx]?.partNumber || '—'}
                      </span>
                      {watchedItems[idx]?.condition && (
                        <span className="ml-2 text-xs bg-navy/10 text-navy px-1.5 py-0.5 rounded">
                          {watchedItems[idx].condition}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted font-mono text-xs hidden md:table-cell">
                      {watchedItems[idx]?.nsn || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs max-w-xs truncate">
                      {watchedItems[idx]?.description || '—'}
                    </td>
                    <td className="px-4 py-3 w-24">
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                        className="w-20 border border-silver-dark rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-text-muted hover:text-red-500 transition-colors p-1 rounded"
                        aria-label="Remove part"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {fields.length === 0 && (
        <div className="border-2 border-dashed border-silver-dark rounded-xl py-10 text-center text-text-muted">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No parts added yet</p>
          <p className="text-xs mt-1">Search the catalog or use manual entry above</p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Order Details</h2>
        <p className="text-sm text-text-muted">Set quantities, urgency level, and your target delivery date.</p>
      </div>

      {/* Quantities per part */}
      <div className="border border-silver-dark rounded-xl overflow-hidden">
        <div className="bg-silver px-4 py-2.5">
          <span className="text-sm font-semibold text-text">Quantity & Target Price per Part</span>
        </div>
        <div className="divide-y divide-silver">
          {fields.map((field, idx) => (
            <div key={field.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-semibold text-navy part-number">
                  {watchedItems[idx]?.partNumber}
                </div>
                <div className="text-xs text-text-muted mt-0.5 truncate">
                  {watchedItems[idx]?.description}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-28">
                  <label className="block text-xs font-medium text-text-muted mb-1">Quantity <span className="text-orange">*</span></label>
                  <input
                    type="number"
                    min="1"
                    {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                    className="w-full border border-silver-dark rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                  />
                  {errors.items?.[idx]?.quantity && (
                    <p className="text-xs text-red-500 mt-0.5">{errors.items[idx]?.quantity?.message}</p>
                  )}
                </div>
                <div className="w-36">
                  <label className="block text-xs font-medium text-text-muted mb-1">Target Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      {...register(`items.${idx}.targetPrice`, { valueAsNumber: true, setValueAs: v => v === '' || isNaN(Number(v)) ? undefined : Number(v) })}
                      className="w-full border border-silver-dark rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange"
                    />
                  </div>
                </div>
                <div className="w-40">
                  <label className="block text-xs font-medium text-text-muted mb-1">Condition</label>
                  <select
                    {...register(`items.${idx}.condition`)}
                    className="w-full border border-silver-dark rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange bg-white"
                  >
                    {CONDITION_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency toggle */}
      <div>
        <label className="block text-sm font-medium text-text mb-3">
          Urgency Level <span className="text-orange">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {URGENCY_OPTIONS.map((opt) => {
            const Icon     = opt.icon;
            const isActive = watchedUrgency === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('urgency', opt.value as 'Standard' | 'Urgent' | 'Critical', { shouldValidate: true })}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 text-left',
                  isActive ? opt.activeColor : `${opt.color} hover:border-opacity-70`,
                )}
              >
                <Icon className={cn('w-6 h-6 flex-shrink-0', isActive ? opt.activeIconColor : opt.iconColor)} />
                <div>
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className={cn('text-xs mt-0.5', isActive ? 'opacity-80' : 'text-text-muted')}>{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.urgency && <p className="text-xs text-red-500 mt-1">{errors.urgency.message}</p>}
      </div>

      {/* Delivery date */}
      <div className="max-w-xs">
        <Input
          label="Target Delivery Date"
          type="date"
          required
          min={getTodayPlus1()}
          error={errors.deliveryDeadline?.message}
          {...register('deliveryDeadline')}
        />
        <p className="mt-1 text-xs text-text-muted">Must be a future date</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Shipping & Contact</h2>
        <p className="text-sm text-text-muted">
          {user ? 'We\'ve pre-filled your details from your account. Please verify and update if needed.' : 'Enter your contact and shipping details.'}
        </p>
      </div>

      {user && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Pre-filled from your account &mdash; verify details below.</span>
        </div>
      )}

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contact Name"
          required
          placeholder="John Smith"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.contactName?.message}
          {...register('contactName')}
        />
        <Input
          label="Company Name"
          required
          placeholder="Acme Aviation LLC"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={errors.companyName?.message}
          {...register('companyName')}
        />
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="john@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone Number"
          type="tel"
          required
          placeholder="+1 (555) 000-0000"
          leftIcon={<PhoneIcon className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      {/* Shipping */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Shipping Address <span className="text-orange">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Street, City, State, ZIP..."
            className={cn(
              'w-full border border-silver-dark rounded-lg px-3 py-2.5 text-sm text-text bg-white',
              'placeholder:text-text-muted/60',
              'focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange',
              'transition-colors duration-150 resize-none',
              errors.shippingAddress && 'border-red-400 focus:ring-red-300',
            )}
            {...register('shippingAddress')}
          />
          {errors.shippingAddress && (
            <p className="mt-1 text-xs text-red-500">{errors.shippingAddress.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Country"
            required
            placeholder="United States"
            error={errors.shippingCountry?.message}
            {...register('shippingCountry')}
          />
          <Select
            label="Incoterms"
            required
            placeholder="Select Incoterms"
            options={INCOTERMS_OPTIONS}
            error={errors.incoterms?.message}
            {...register('incoterms')}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text mb-1">Special Instructions</h2>
        <p className="text-sm text-text-muted">Provide any additional details or attach supporting documents.</p>
      </div>

      {/* Special instructions */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Special Instructions <span className="text-text-muted font-normal">(Optional)</span>
        </label>
        <textarea
          rows={5}
          placeholder="Packaging requirements, certification needs, cross-reference information, specific approved vendors, etc."
          className="w-full border border-silver-dark rounded-lg px-3 py-2.5 text-sm text-text bg-white placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition-colors duration-150 resize-none"
          {...register('specialInstructions')}
        />
        <p className="mt-1 text-xs text-text-muted">
          Include packaging requirements, certifications needed, approved vendor lists, or any other relevant details.
        </p>
      </div>

      {/* File attachment (mock) */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Attach Document <span className="text-text-muted font-normal">(Optional)</span>
        </label>
        <label className={cn(
          'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors',
          attachedFile ? 'border-navy bg-navy/5' : 'border-silver-dark bg-bg hover:border-orange/50 hover:bg-orange/5',
        )}>
          {attachedFile ? (
            <>
              <Paperclip className="w-8 h-8 text-navy" />
              <div className="text-center">
                <div className="text-sm font-medium text-text">{attachedFile.name}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {(attachedFile.size / 1024).toFixed(0)} KB &bull;{' '}
                  <button type="button" className="text-orange hover:underline" onClick={(e) => { e.preventDefault(); setAttachedFile(null); }}>
                    Remove
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-text-muted" />
              <div className="text-center">
                <div className="text-sm font-medium text-text">Drop a file or click to upload</div>
                <div className="text-xs text-text-muted mt-0.5">PDF, XLS, XLSX, CSV — max 10 MB</div>
              </div>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.xls,.xlsx,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAttachedFile(file);
            }}
          />
        </label>
      </div>

      {/* Terms acceptance */}
      <div className="border border-silver-dark rounded-xl p-4 bg-bg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-silver-dark text-orange focus:ring-orange/40 flex-shrink-0"
            {...register('termsAccepted')}
          />
          <span className="text-sm text-text">
            I confirm that the information provided is accurate and I agree to the{' '}
            <Link href="/terms" target="_blank" className="text-orange hover:underline font-medium">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="text-orange hover:underline font-medium">
              Privacy Policy
            </Link>. I understand that submitting this RFQ does not create a binding purchase order.
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="mt-2 text-xs text-red-500 ml-7">{errors.termsAccepted.message}</p>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => {
    const data = watch();
    const urgencyOpt = URGENCY_OPTIONS.find(u => u.value === data.urgency);
    const UrgencyIcon = urgencyOpt?.icon || Clock;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text mb-1">Review Your RFQ</h2>
          <p className="text-sm text-text-muted">Please verify all details before submitting.</p>
        </div>

        {/* Parts */}
        <ReviewSection title="Parts Requested" onEdit={() => setStep(1)}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-silver">
                  <th className="text-left py-2 font-medium text-text-muted text-xs">Part Number</th>
                  <th className="text-left py-2 font-medium text-text-muted text-xs hidden sm:table-cell">Description</th>
                  <th className="text-center py-2 font-medium text-text-muted text-xs">Qty</th>
                  <th className="text-right py-2 font-medium text-text-muted text-xs hidden sm:table-cell">Target Price</th>
                  <th className="text-left py-2 font-medium text-text-muted text-xs hidden md:table-cell">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver">
                {data.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-mono text-sm font-semibold text-navy part-number pr-3">{item.partNumber}</td>
                    <td className="py-2.5 text-text-muted text-xs max-w-xs truncate hidden sm:table-cell">{item.description}</td>
                    <td className="py-2.5 text-center font-semibold text-text">{item.quantity}</td>
                    <td className="py-2.5 text-right text-text-muted text-xs hidden sm:table-cell">
                      {item.targetPrice ? formatPrice(Number(item.targetPrice)) : '—'}
                    </td>
                    <td className="py-2.5 text-text-muted text-xs hidden md:table-cell">{item.condition || 'Any'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReviewSection>

        {/* Order details */}
        <ReviewSection title="Order Details" onEdit={() => setStep(2)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReviewField label="Urgency">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                data.urgency === 'Standard' && 'bg-navy/10 text-navy',
                data.urgency === 'Urgent'   && 'bg-orange/15 text-orange',
                data.urgency === 'Critical' && 'bg-red-100 text-red-600',
              )}>
                <UrgencyIcon className="w-3.5 h-3.5" />
                {data.urgency}
              </span>
            </ReviewField>
            <ReviewField label="Delivery Deadline">
              {data.deliveryDeadline ? new Date(data.deliveryDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </ReviewField>
          </div>
        </ReviewSection>

        {/* Contact & Shipping */}
        <ReviewSection title="Contact & Shipping" onEdit={() => setStep(3)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReviewField label="Contact Name">{data.contactName}</ReviewField>
            <ReviewField label="Company">{data.companyName}</ReviewField>
            <ReviewField label="Email">{data.email}</ReviewField>
            <ReviewField label="Phone">{data.phone}</ReviewField>
            <ReviewField label="Shipping Address" className="sm:col-span-2">{data.shippingAddress}</ReviewField>
            <ReviewField label="Country">{data.shippingCountry}</ReviewField>
            <ReviewField label="Incoterms">{data.incoterms}</ReviewField>
          </div>
        </ReviewSection>

        {/* Special instructions */}
        {data.specialInstructions && (
          <ReviewSection title="Special Instructions" onEdit={() => setStep(4)}>
            <p className="text-sm text-text whitespace-pre-wrap">{data.specialInstructions}</p>
          </ReviewSection>
        )}

        {/* Attachment */}
        {attachedFile && (
          <ReviewSection title="Attachment" onEdit={() => setStep(4)}>
            <div className="flex items-center gap-2 text-sm text-text">
              <Paperclip className="w-4 h-4 text-text-muted flex-shrink-0" />
              {attachedFile.name}
            </div>
          </ReviewSection>
        )}

        {/* Submit */}
        <div className="bg-orange/8 border border-orange/20 rounded-xl p-4 text-sm text-text">
          <strong>Ready to submit?</strong> Once submitted, our team will review your RFQ and respond within 24 hours with pricing and availability.
        </div>
      </div>
    );
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-bg py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'Home',          href: '/' },
              { label: 'Request Quote', href: '/rfq' },
              { label: STEPS[step - 1].label },
            ]}
          />

          {/* Hero header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-1">
              <span className="w-6 h-px bg-orange" />
              Request for Quote
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text">
              Get a Quote in <span className="text-orange">24 Hours</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">
              ISO 9001 &amp; AS9120 certified &bull; Full traceability &bull; 150+ countries served
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-silver p-6 sm:p-8">
            {/* Step progress */}
            <StepProgress current={step} />

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-silver">
                <div>
                  {step > 1 && (
                    <Button type="button" variant="secondary" size="lg" onClick={goBack}>
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted hidden sm:block">
                    Step {step} of {STEPS.length}
                  </span>
                  {step < STEPS.length ? (
                    <Button type="button" variant="orange" size="lg" onClick={goNext}>
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="orange"
                      size="lg"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit RFQ'}
                      {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-text-muted">
            {[
              '24-Hour Quote Guarantee',
              'ISO 9001 & AS9120 Certified',
              '100% Inspection',
              'Full Traceability',
              'Global Shipping',
            ].map((badge) => (
              <span key={badge} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Review helper sub-components ─────────────────────────────────────────────

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-silver-dark rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-silver border-b border-silver-dark">
        <span className="text-sm font-semibold text-text">{title}</span>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-orange hover:underline font-medium"
        >
          Edit
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ReviewField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm text-text font-medium">{children}</div>
    </div>
  );
}
