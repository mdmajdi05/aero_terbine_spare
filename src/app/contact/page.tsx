'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useState } from 'react';
import {
  MapPin, Phone, Mail, Clock,
  MessageSquare, FileText, Wrench, Shield,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// ─── Schema ──────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// ─── Data ────────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'rfq', label: 'RFQ / Quote Request' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'quality', label: 'Quality / Certificate Issue' },
  { value: 'other', label: 'Other' },
];

const CONTACT_CARDS = [
  {
    icon: MessageSquare,
    title: 'General Inquiries',
    email: 'info@aeroturbinespare.com',
    description: 'Company information, partnerships, supplier inquiries, and general questions.',
    response: 'Response within 1 business day',
  },
  {
    icon: FileText,
    title: 'RFQ Submissions',
    email: 'rfq@aeroturbinespare.com',
    description: 'Requests for quote, pricing inquiries, and part availability checks.',
    response: '24-hour quote guarantee',
  },
  {
    icon: Shield,
    title: 'Quality Issues',
    email: 'quality@aeroturbinespare.com',
    description: 'Certificate requests, non-conformance reports, and quality escalations.',
    response: 'Same-day acknowledgment',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (_data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // Mock submission delay
      await new Promise((r) => setTimeout(r, 1200));
      toast.success('Message sent! We\'ll be in touch within 1 business day.');
      setSubmitted(true);
      reset();
    } catch {
      toast.error('Failed to send message. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-orange" />
              Get in Touch
              <span className="w-6 h-px bg-orange" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">Contact Us</h1>
            <p className="text-silver/80 text-lg max-w-xl mx-auto">
              Our team of aerospace procurement specialists is ready to help.
              Reach out by phone, email, or the form below.
            </p>
          </div>
        </section>

        {/* ── Contact Cards ─────────────────────────────────────────────── */}
        <section className="bg-bg py-10 px-4 border-b border-silver">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CONTACT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="bg-white border border-silver rounded-2xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-orange" />
                      </div>
                      <h3 className="font-bold text-text text-sm">{card.title}</h3>
                    </div>
                    <p className="text-text-muted text-xs mb-3 leading-relaxed">
                      {card.description}
                    </p>
                    <a
                      href={`mailto:${card.email}`}
                      className="text-orange text-sm font-medium hover:underline block truncate"
                    >
                      {card.email}
                    </a>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-success font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {card.response}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Two-column layout ─────────────────────────────────────────── */}
        <section className="bg-bg py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* ── Left: contact info ─────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">
                {/* Address */}
                <div className="bg-white border border-silver rounded-2xl p-6">
                  <h2 className="font-bold text-text mb-4">Office Location</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                      <div className="text-text-muted">
                        <div className="font-semibold text-text mb-0.5">
                          AeroTurbineSpare, Inc.
                        </div>
                        12801 North Freeway, Suite 400
                        <br />
                        Houston, TX 77060, USA
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-5 h-5 text-orange flex-shrink-0" />
                      <a
                        href="tel:+17138425500"
                        className="text-text hover:text-orange transition-colors font-medium"
                      >
                        +1-713-842-5500
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-orange flex-shrink-0" />
                      <a
                        href="mailto:rfq@aeroturbinespare.com"
                        className="text-text hover:text-orange transition-colors"
                      >
                        rfq@aeroturbinespare.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-white border border-silver rounded-2xl p-6">
                  <h2 className="font-bold text-text mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange" />
                    Business Hours
                  </h2>
                  <dl className="space-y-2 text-sm">
                    {[
                      { day: 'Mon – Fri', hours: '7:00 AM – 7:00 PM CST' },
                      { day: 'Saturday', hours: '9:00 AM – 3:00 PM CST' },
                      { day: 'Sunday', hours: 'Closed' },
                    ].map((row) => (
                      <div
                        key={row.day}
                        className="flex items-center justify-between border-b border-silver last:border-0 pb-2 last:pb-0"
                      >
                        <dt className="font-medium text-text">{row.day}</dt>
                        <dd className="text-text-muted">{row.hours}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex items-center gap-2 text-xs text-success font-semibold">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    AOG Emergency Line: 24/7
                  </div>
                </div>

                {/* AOG Banner */}
                <div className="bg-orange rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5" />
                    <span className="font-bold">Aircraft on Ground?</span>
                  </div>
                  <p className="text-white/85 text-sm mb-4">
                    Call our AOG emergency line for immediate response, any hour
                    of the day or night.
                  </p>
                  <a
                    href="tel:+17138425500"
                    className="inline-flex items-center gap-2 bg-white text-orange font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    +1-713-842-5500
                  </a>
                </div>
              </div>

              {/* ── Right: Contact form ────────────────────────────────── */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-silver rounded-2xl p-6 sm:p-8">
                  {submitted ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-text mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-text-muted text-sm mb-6">
                        Thank you for reaching out. Our team will respond within
                        1 business day.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-text mb-1">
                        Send Us a Message
                      </h2>
                      <p className="text-text-muted text-sm mb-6">
                        Fill out the form below and we&apos;ll get back to you as
                        quickly as possible.
                      </p>

                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Full Name"
                            required
                            placeholder="John Smith"
                            error={errors.name?.message}
                            {...register('name')}
                          />
                          <Input
                            label="Email Address"
                            type="email"
                            required
                            placeholder="john@company.com"
                            error={errors.email?.message}
                            {...register('email')}
                          />
                        </div>

                        <Input
                          label="Phone Number"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          hint="Optional — for urgent matters"
                          {...register('phone')}
                        />

                        <Select
                          label="Subject"
                          required
                          placeholder="Select a subject..."
                          options={SUBJECT_OPTIONS}
                          error={errors.subject?.message}
                          {...register('subject')}
                        />

                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium text-text mb-1.5"
                          >
                            Message <span className="text-orange">*</span>
                          </label>
                          <textarea
                            id="message"
                            rows={6}
                            placeholder="How can we help you? Please include any relevant part numbers, NSNs, or CAGE codes..."
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-text bg-white placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition-colors duration-150 resize-none ${
                              errors.message
                                ? 'border-red-400 focus:ring-red-300'
                                : 'border-silver-dark'
                            }`}
                            {...register('message')}
                          />
                          {errors.message && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.message.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          variant="orange"
                          size="lg"
                          loading={isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>

                        <p className="text-xs text-text-muted text-center">
                          By sending this message, you agree to our{' '}
                          <a
                            href="/privacy"
                            className="text-orange hover:underline"
                          >
                            Privacy Policy
                          </a>
                          . We will never share your information with third
                          parties without consent.
                        </p>
                      </form>
                    </>
                  )}
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
