'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, CheckCircle2, ArrowRight,
  Building2, Mail, Hash, StickyNote, Package,
  Clock, DollarSign, Handshake,
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { submitInventory } from '@/services/inventoryService';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormState {
  companyName: string;
  contactEmail: string;
  partCount: string;
  notes: string;
}

interface FormErrors {
  companyName?: string;
  contactEmail?: string;
  file?: string;
}

// ─── Process steps ───────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  {
    icon: FileText,
    step: '01',
    title: 'Evaluate',
    description:
      'Our QA team reviews your inventory list, verifies part numbers against NSN and CAGE data, and assesses marketability and condition.',
  },
  {
    icon: DollarSign,
    step: '02',
    title: 'Offer',
    description:
      'We provide a fair, market-rate purchase offer within 2 business days. No obligations — you decide whether to accept.',
  },
  {
    icon: Handshake,
    step: '03',
    title: 'Purchase',
    description:
      'Accept the offer and we handle logistics, insurance, and payment. Fast settlement, no storage hassle for you.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [form, setForm] = useState<FormState>({
    companyName: '',
    contactEmail: '',
    partCount: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── File handling ────────────────────────────────────────────────────────
  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] ?? null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (!file) newErrors.file = 'Please attach your inventory file';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setProgress(0);

    // Simulated upload progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    try {
      const result = await submitInventory({
        companyName: form.companyName.trim(),
        contactEmail: form.contactEmail.trim(),
        fileName: file!.name,
        partCount: form.partCount ? parseInt(form.partCount, 10) : undefined,
        notes: form.notes.trim() || undefined,
      });
      clearInterval(interval);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setSubmissionId(result.submissionId);
      setSubmitted(true);
    } catch {
      clearInterval(interval);
      setProgress(0);
      setErrors({ file: 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-bg">
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-text mb-3">
              Inventory Received!
            </h1>
            <p className="text-text-muted mb-4">
              Thank you for submitting your surplus inventory list. Our procurement team
              will review your parts and get back to you within 2 business days.
            </p>
            <div className="inline-flex items-center gap-2 bg-navy/8 rounded-xl px-5 py-3 mb-8">
              <span className="text-sm font-medium text-text-muted">Submission ID:</span>
              <span className="font-mono font-bold text-navy text-lg tracking-widest">
                {submissionId}
              </span>
            </div>

            <div className="bg-orange/8 border border-orange/20 rounded-2xl p-6 text-left mb-8">
              <h3 className="font-bold text-text mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange" />
                What Happens Next
              </h3>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange/20 text-orange text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Our QA team reviews your inventory list (typically within 24 hours)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange/20 text-orange text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  We email a purchase offer to {form.contactEmail}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange/20 text-orange text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  If you accept, we arrange pickup and payment — no hassle
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="orange"
                size="lg"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ companyName: '', contactEmail: '', partCount: '', notes: '' });
                  setFile(null);
                  setSubmissionId('');
                  setProgress(0);
                }}
              >
                Submit Another List
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="bg-navy-dark text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-orange" />
              Sell Your Excess Parts
              <span className="w-6 h-px bg-orange" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Turn Your Excess Inventory{' '}
              <span className="gradient-text">Into Cash</span>
            </h1>
            <p className="text-silver/80 text-lg max-w-2xl mx-auto leading-relaxed">
              AeroTurbineSpare actively purchases surplus aerospace parts from
              OEMs, MROs, and distributors worldwide. Get a fair offer within 2
              business days — no storage costs, no auction risk.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-silver/70">
              {[
                'No listing fees',
                'Market-rate offers',
                'Fast payment',
                'We handle logistics',
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <section className="bg-bg py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-silver p-6 sm:p-8">
              <h2 className="text-xl font-bold text-text mb-1">
                Submit Your Inventory List
              </h2>
              <p className="text-text-muted text-sm mb-6">
                Upload a spreadsheet, PDF, or parts list to get started. We accept
                any format — our team will review it manually.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Company Name */}
                <Input
                  label="Company Name"
                  name="companyName"
                  required
                  placeholder="Acme Aviation LLC"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  value={form.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                />

                {/* Email */}
                <Input
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  required
                  placeholder="procurement@company.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={form.contactEmail}
                  onChange={handleChange}
                  error={errors.contactEmail}
                />

                {/* File upload */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Inventory File <span className="text-orange">*</span>
                  </label>

                  {file ? (
                    <div className="flex items-center gap-4 border border-navy/30 bg-navy/5 rounded-xl px-4 py-4">
                      <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-navy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text text-sm truncate">{file.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {(file.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs text-orange hover:underline font-medium flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      className={cn(
                        'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 px-4 cursor-pointer transition-colors',
                        isDragging
                          ? 'border-orange bg-orange/5'
                          : 'border-silver-dark bg-bg hover:border-orange/60 hover:bg-orange/5',
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                          isDragging ? 'bg-orange/20' : 'bg-silver',
                        )}
                      >
                        <Upload
                          className={cn(
                            'w-6 h-6 transition-colors',
                            isDragging ? 'text-orange' : 'text-text-muted',
                          )}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-text">
                          Click to browse or drag files here
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          CSV, XLS, XLSX, PDF — max 25 MB
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xls,.xlsx,.pdf"
                        className="hidden"
                        onChange={onFileInput}
                      />
                    </label>
                  )}
                  {errors.file && (
                    <p className="mt-1 text-xs text-red-500">{errors.file}</p>
                  )}
                </div>

                {/* Part count */}
                <Input
                  label="Approximate Part Count"
                  name="partCount"
                  type="number"
                  placeholder="e.g. 250"
                  leftIcon={<Hash className="w-4 h-4" />}
                  hint="Optional — helps us prioritize your review"
                  value={form.partCount}
                  onChange={handleChange}
                  min="1"
                />

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-text mb-1.5"
                  >
                    <span className="flex items-center gap-1.5">
                      <StickyNote className="w-4 h-4 text-text-muted" />
                      Notes About the Inventory
                      <span className="text-text-muted font-normal">(Optional)</span>
                    </span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    placeholder="Part conditions, storage history, aircraft platforms, any known certifications, urgency of sale, etc."
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full border border-silver-dark rounded-lg px-3 py-2.5 text-sm text-text bg-white placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition-colors duration-150 resize-none"
                  />
                </div>

                {/* Progress bar */}
                {isSubmitting && (
                  <div className="rounded-lg overflow-hidden bg-silver">
                    <div
                      className="h-2 bg-orange transition-all duration-200 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                    <div className="text-xs text-text-muted px-1 py-1">
                      Uploading... {progress}%
                    </div>
                  </div>
                )}

                {/* Terms notice */}
                <p className="text-xs text-text-muted bg-silver/60 rounded-lg px-4 py-3 border border-silver">
                  By submitting, you agree to our evaluation process. We&apos;ll contact
                  you within 2 business days with any questions or a purchase offer.
                  Submission does not obligate you to sell.
                </p>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="orange"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Uploading Inventory...' : 'Submit Inventory List'}
                  {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* ── What Happens Next ────────────────────────────────────────── */}
        <section className="bg-white py-16 px-4 border-t border-silver">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Simple Process
                <span className="w-6 h-px bg-orange" />
              </div>
              <h2 className="text-3xl font-black text-text">
                What Happens After You Submit
              </h2>
              <p className="text-text-muted mt-2 max-w-lg mx-auto">
                We make selling your surplus parts straightforward and hassle-free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROCESS_STEPS.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="relative">
                    <div className="bg-bg border border-silver rounded-2xl p-6 h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-orange" />
                        </div>
                        <div className="text-4xl font-black text-silver-dark leading-none pt-1">
                          {s.step}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-text mb-2">{s.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                    {/* Connector arrow */}
                    {idx < PROCESS_STEPS.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                        <ArrowRight className="w-6 h-6 text-orange" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* What we accept */}
            <div className="mt-12 bg-navy rounded-2xl p-6 sm:p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange" />
                    What Parts We Buy
                  </h3>
                  <ul className="space-y-2 text-silver/80 text-sm">
                    {[
                      'Turbine blades, vanes, and nozzles',
                      'Avionics LRUs and sub-assemblies',
                      'Landing gear components',
                      'Engine accessory gearboxes',
                      'Flight control surfaces and actuators',
                      'Mil-Spec connectors and wiring harnesses',
                      'Bearings, seals, and fasteners (bulk)',
                      'NSN-cataloged military parts',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange" />
                    Accepted File Formats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { ext: 'CSV', desc: 'Comma-separated parts list' },
                      { ext: 'XLSX', desc: 'Excel spreadsheet' },
                      { ext: 'XLS', desc: 'Legacy Excel format' },
                      { ext: 'PDF', desc: 'Inventory report or datasheet' },
                    ].map((f) => (
                      <div
                        key={f.ext}
                        className="bg-white/10 border border-white/15 rounded-xl px-4 py-3"
                      >
                        <div className="font-mono font-bold text-orange text-sm">
                          .{f.ext}
                        </div>
                        <div className="text-xs text-silver/70 mt-0.5">{f.desc}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-silver/60 mt-4">
                    No specific template required. Any format that lists part numbers
                    and quantities is acceptable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
