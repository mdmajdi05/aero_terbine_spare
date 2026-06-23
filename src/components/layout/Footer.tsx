import Link from 'next/link';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Parts Catalog',      href: '/catalog' },
  { label: 'Request a Quote',    href: '/rfq' },
  { label: 'Urgent Buy',         href: '/rfq?urgency=urgent' },
  { label: 'Sell Excess Inventory', href: '/inventory' },
  { label: 'Order Tracking',     href: '/dashboard/orders' },
];

const INDUSTRIES = [
  { label: 'Aerospace & Aviation', href: '/industries/aerospace' },
  { label: 'Military & Defense',   href: '/industries/military-defense' },
  { label: 'Automotive',           href: '/industries/automotive' },
  { label: 'Medical Equipment',    href: '/industries/medical' },
  { label: 'Electronics',          href: '/industries/electronics' },
];

const COMPANY = [
  { label: 'About Us',          href: '/about' },
  { label: 'Quality Assurance', href: '/quality' },
  { label: 'Contact Us',        href: '/contact' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy',    href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-silver/80">
      {/* CTA Strip */}
      <div className="bg-orange">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-bold text-lg">Need a Part Urgently?</div>
            <div className="text-white/85 text-sm">Our team is available 24/7. Get a quote within hours.</div>
          </div>
          <div className="flex gap-3">
            <a href="tel:+17138425500" className="inline-flex items-center gap-2 bg-white text-orange font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm">
              <Phone className="w-4 h-4" /> Call Now
            </a>
            <Link href="/rfq?urgency=urgent" className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-navy-dark transition-colors text-sm">
              Submit Urgent RFQ
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2L4 8v4l7 8 7-8V8L11 2z" fill="#fff" />
                  <path d="M11 6l-4 3v2l4 5 4-5V9L11 6z" fill="#E8751A" />
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">AeroTurbineSpare</div>
                <div className="text-silver/60 text-[10px] tracking-wide uppercase">Precision Aerospace Sourcing</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-silver/70">
              US-based aerospace parts procurement platform. ISO 9001 &amp; AS9120 certified.
              Serving OEMs, MROs, military contractors, and procurement professionals worldwide.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['ISO 9001', 'AS9120', 'CAGE 8ATR9'].map((b) => (
                <span key={b} className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/20">
                  {b}
                </span>
              ))}
            </div>
            {/* Contact */}
            <div className="space-y-2 pt-2">
              <a href="tel:+17138425500" className="flex items-center gap-2 text-sm hover:text-orange transition-colors">
                <Phone className="w-4 h-4 text-orange flex-shrink-0" /> +1-713-842-5500
              </a>
              <a href="mailto:rfq@aeroturbinespare.com" className="flex items-center gap-2 text-sm hover:text-orange transition-colors">
                <Mail className="w-4 h-4 text-orange flex-shrink-0" /> rfq@aeroturbinespare.com
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
                <span>12801 North Freeway, Suite 400<br />Houston, TX 77060, USA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-orange transition-colors flex items-center gap-1.5">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Industries</h3>
            <ul className="space-y-2.5">
              {INDUSTRIES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-orange transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-orange transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-silver/50">
          <span>&copy; {new Date().getFullYear()} AeroTurbineSpare. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-orange transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-orange transition-colors">Privacy</Link>
            <Link href="/sitemap.xml" className="hover:text-orange transition-colors flex items-center gap-1">
              Sitemap <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
