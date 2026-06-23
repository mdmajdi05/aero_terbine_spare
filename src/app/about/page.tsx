import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MapPin, Phone, Mail, Clock, Award, Globe, Shield, Zap } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const CORE_VALUES = [
  {
    icon: Shield,
    title: 'Integrity',
    description:
      'Every part we supply is fully documented, traceable, and honestly represented. We never knowingly deal in counterfeit or misrepresented components.',
  },
  {
    icon: Award,
    title: 'Quality',
    description:
      'Our full-time QA department inspects 100% of incoming inventory against OEM specs. ISO 9001:2015 and AS9120 Rev B certifications are maintained annually.',
  },
  {
    icon: Zap,
    title: 'Speed',
    description:
      'We guarantee a 24-hour quote response for all RFQs, and same-day response for AOG situations. Time on the ground costs more than any part.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'With clients in over 150 countries, our logistics network covers every major air hub and military base. We handle export compliance and ITAR documentation.',
  },
];

const CERTIFICATIONS = [
  {
    code: 'ISO 9001:2015',
    body: 'Bureau Veritas',
    description: 'Quality Management System — scope covers procurement, storage, and distribution of aerospace components.',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  {
    code: 'AS9120 Rev B',
    body: 'SAE International',
    description: 'Aviation, Space and Defense distributors standard — the highest supply chain quality benchmark in aerospace.',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  {
    code: 'CAGE 8ATR9',
    body: 'DCSA / U.S. DoD',
    description: 'Commercial and Government Entity code authorizing transactions with U.S. military and defense contractors.',
    color: 'bg-green-50 border-green-200 text-green-800',
  },
];

const TEAM = [
  {
    initials: 'RC',
    name: 'Robert Chen',
    title: 'Chief Executive Officer',
    bio: '20+ years in aerospace procurement. Former sourcing director at Heico Corporation.',
    bg: 'bg-navy',
  },
  {
    initials: 'SP',
    name: 'Sarah Patterson',
    title: 'Director of Quality Assurance',
    bio: 'AS9120 Lead Auditor. Previously with Boeing Global Services quality operations.',
    bg: 'bg-orange',
  },
  {
    initials: 'MK',
    name: 'Marcus Kowalski',
    title: 'VP of Global Procurement',
    bio: '15 years building aerospace supply chains across North America, Europe, and Asia-Pacific.',
    bg: 'bg-navy-dark',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-orange" />
              Company
              <span className="w-6 h-px bg-orange" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              About AeroTurbineSpare
            </h1>
            <p className="text-silver/80 text-xl max-w-2xl mx-auto leading-relaxed">
              Your trusted partner for precision aerospace parts — certified,
              traceable, and delivered on time, every time.
            </p>
          </div>
        </section>

        {/* ── Company Story ─────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-4">
                  <span className="w-6 h-px bg-orange" />
                  Our Story
                </div>
                <h2 className="text-3xl font-black text-text mb-6">
                  Built by Procurement Professionals, for Procurement Professionals
                </h2>
                <div className="space-y-4 text-text-muted leading-relaxed">
                  <p>
                    AeroTurbineSpare was founded in 2009 by a team of aerospace
                    procurement veterans who experienced firsthand the frustration
                    of sourcing certified parts under AOG pressure. Headquartered
                    in Houston, Texas — the heart of the U.S. energy and aviation
                    corridor — we set out to build the platform we always wished
                    existed.
                  </p>
                  <p>
                    From our initial focus on turbine hardware for legacy military
                    platforms, we have grown into a full-spectrum aerospace parts
                    distributor serving commercial airlines, MRO facilities, OEM
                    production lines, and defense contractors across 150+ countries.
                    Today, our warehouse holds over 32,000 line items with same-day
                    shipping capability for in-stock NSN parts.
                  </p>
                  <p>
                    Our growth has been driven by a single principle: never ship a
                    part we would not put on our own aircraft. That uncompromising
                    standard earned us ISO 9001:2015 and AS9120 Rev B certifications,
                    and the long-term loyalty of some of the world&apos;s most demanding
                    aerospace operators.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Parts in Catalog', value: '32,000+' },
                  { label: 'Countries Served', value: '150+' },
                  { label: 'Years in Business', value: '15+' },
                  { label: 'Quote Response', value: '24 hrs' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-bg border border-silver rounded-2xl p-6 text-center"
                  >
                    <div className="text-3xl font-black text-navy mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ──────────────────────────────────────────── */}
        <section className="bg-bg py-16 px-4 border-y border-silver">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-text">Mission &amp; Vision</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-navy text-white rounded-2xl p-8">
                <div className="text-orange text-xs font-bold uppercase tracking-widest mb-3">
                  Our Mission
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Enabling Aviation Safety Through Certified Supply
                </h3>
                <p className="text-silver/80 leading-relaxed">
                  To provide aerospace procurement professionals with instant access
                  to quality-assured parts, backed by full traceability and the
                  industry&apos;s highest certification standards — so that no aircraft
                  stays on the ground for lack of a genuine, certified component.
                </p>
              </div>
              <div className="bg-white border border-silver rounded-2xl p-8">
                <div className="text-orange text-xs font-bold uppercase tracking-widest mb-3">
                  Our Vision
                </div>
                <h3 className="text-xl font-bold text-text mb-3">
                  The Global Standard for Aerospace Parts Trust
                </h3>
                <p className="text-text-muted leading-relaxed">
                  To become the world&apos;s most trusted aerospace parts marketplace —
                  where every OEM, MRO, airline, and defense contractor instinctively
                  turns when they need a part fast, certified, and at a fair price,
                  regardless of geography or platform age.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Core Values ───────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                What We Stand For
              </div>
              <h2 className="text-3xl font-black text-text">Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CORE_VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="bg-bg border border-silver rounded-2xl p-6 text-center hover:border-orange/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-orange" />
                    </div>
                    <h3 className="text-base font-bold text-text mb-2">{v.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Certifications ────────────────────────────────────────────── */}
        <section className="bg-bg py-16 px-4 border-y border-silver">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Accreditations
              </div>
              <h2 className="text-3xl font-black text-text">Our Certifications</h2>
              <p className="text-text-muted mt-2">
                Independently audited and certified to the highest aerospace supply
                chain standards.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.code}
                  className={`rounded-2xl border-2 p-6 ${cert.color}`}
                >
                  <div className="text-2xl font-black mb-1">{cert.code}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">
                    Issued by {cert.body}
                  </div>
                  <p className="text-sm leading-relaxed opacity-80">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ──────────────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Leadership
              </div>
              <h2 className="text-3xl font-black text-text">Meet the Team</h2>
              <p className="text-text-muted mt-2">
                Decades of combined aerospace procurement experience at your service.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="bg-bg border border-silver rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-20 h-20 rounded-full ${member.bg} text-white flex items-center justify-center mx-auto mb-4 text-2xl font-black`}
                  >
                    {member.initials}
                  </div>
                  <h3 className="font-bold text-text text-base mb-0.5">
                    {member.name}
                  </h3>
                  <div className="text-orange text-xs font-semibold uppercase tracking-wide mb-3">
                    {member.title}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Office ────────────────────────────────────────────────────── */}
        <section className="bg-bg py-16 px-4 border-t border-silver">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Find Us
              </div>
              <h2 className="text-3xl font-black text-text">Our Office</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact details */}
              <div className="space-y-6">
                <div className="bg-white border border-silver rounded-2xl p-6">
                  <h3 className="font-bold text-text mb-4">Contact Information</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-text-muted">
                      <MapPin className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-text">Headquarters</div>
                        12801 North Freeway, Suite 400
                        <br />
                        Houston, TX 77060, USA
                      </div>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Phone className="w-5 h-5 text-orange flex-shrink-0" />
                      <a
                        href="tel:+17138425500"
                        className="text-text hover:text-orange transition-colors font-medium"
                      >
                        +1-713-842-5500
                      </a>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-orange flex-shrink-0" />
                      <a
                        href="mailto:info@aeroturbinespare.com"
                        className="text-text hover:text-orange transition-colors"
                      >
                        info@aeroturbinespare.com
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="bg-white border border-silver rounded-2xl p-6">
                  <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange" />
                    Business Hours
                  </h3>
                  <dl className="space-y-2 text-sm">
                    {[
                      { day: 'Monday – Friday', hours: '7:00 AM – 7:00 PM CST' },
                      { day: 'Saturday', hours: '9:00 AM – 3:00 PM CST' },
                      { day: 'Sunday', hours: 'Closed (AOG line active)' },
                    ].map((row) => (
                      <div key={row.day} className="flex justify-between gap-4">
                        <dt className="font-medium text-text">{row.day}</dt>
                        <dd className="text-text-muted">{row.hours}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex items-center gap-2 text-xs text-success font-semibold">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    AOG Emergency Line: 24/7 at +1-713-842-5500 ext. 9
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-silver rounded-2xl flex items-center justify-center min-h-64 border border-silver-dark">
                <div className="text-center text-text-muted">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <div className="text-sm font-medium">Map Placeholder</div>
                  <div className="text-xs mt-1">
                    12801 North Freeway, Houston TX
                  </div>
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
