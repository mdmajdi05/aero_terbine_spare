import Link from 'next/link';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import AeroLogo from '@/components/branding/AeroLogo';

const QUICK_LINKS = [
  { label: 'Parts Catalog',      href: '/catalog' },
  { label: 'Request a Quote',    href: '/rfq' },
  { label: 'Urgent Buy',         href: '/rfq?urgency=urgent' },
  { label: 'Sell Excess Inventory', href: '/inventory' },
  { label: 'Order Tracking',     href: '/dashboard/orders' },
];

const INDUSTRIES = [
  { label: 'Aerospace & Aviation', href: '/industries/aerospace' },
  { label: 'Aircraft Components & Accessories',
    href: '/industries/aircraft-components-accessories' },
  { label: 'Aircraft Launching, Landing & Ground Handling',
    href: '/industries/aircraft-launching-landing-ground-handling' },
  { label: 'Engines, Turbines & Components',
    href: '/industries/engines-turbines-components' },
  { label: 'Engine Accessories',
    href: '/industries/engine-accessories' },
  { label: 'Switches & Electrical Connectors',
    href: '/industries/switches-electrical-connectors' },
  { label: 'Microcircuits, Electrical Hardware & More',
    href: '/industries/microcircuits-electrical-hardware' },
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
          <div className="text-center sm:text-left">
            <div className="text-white font-bold text-lg">Need a Part Urgently?</div>
            <div className="text-white/85 text-sm">Our team is available 24/7. Get a quote within hours.</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <a href="tel:+17138425500" className="inline-flex items-center justify-center gap-2 bg-white text-orange font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm flex-1 sm:flex-none">
              <Phone className="w-4 h-4" /> Call Now
            </a>
            <Link href="/rfq?urgency=urgent" className="inline-flex items-center justify-center gap-2 bg-navy text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-navy-dark transition-colors text-sm flex-1 sm:flex-none">
              Submit Urgent RFQ
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <AeroLogo variant="white" />
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
