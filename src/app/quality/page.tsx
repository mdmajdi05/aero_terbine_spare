import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  CheckCircle2, Search, FlaskConical, FileText,
  Package, AlertTriangle, Award, Shield,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const COMMITMENTS = [
  {
    icon: Search,
    title: '100% Inspection on Every Order',
    description:
      'No part ships without a physical inspection by our in-house QA team. We verify part numbers, CAGE codes, NSN markings, condition codes, and cross-reference against OEM documentation before any item is packaged.',
    details: [
      'Visual and dimensional inspection',
      'Part number & NSN verification',
      'Condition code assessment',
      'Cross-reference validation',
    ],
  },
  {
    icon: Award,
    title: 'Full-Time QA Department',
    description:
      'Our Quality Assurance department is staffed with certified AS9120 auditors and former OEM quality engineers — not contractors, not part-time reviewers. Quality is never outsourced.',
    details: [
      'AS9120 Lead Auditor on staff',
      'Former OEM QA engineers',
      'Dedicated incoming inspection bay',
      'Internal non-conformance tracking system',
    ],
  },
  {
    icon: FlaskConical,
    title: 'Part Warranty — All Materials Certified',
    description:
      'Every shipment is accompanied by a Certificate of Conformance (CoC), traceability documentation back to the OEM or approved supplier, and a statement of condition. We stand behind our parts.',
    details: [
      'Certificate of Conformance (CoC) included',
      'OEM or approved source traceability',
      'DD Form 1348 / 8130-9 where applicable',
      '12-month defect warranty on in-stock parts',
    ],
  },
  {
    icon: Shield,
    title: 'AS9120 Accredited Supply Chain',
    description:
      'Our entire supply chain is governed by AS9120 Rev B — the aerospace distribution quality management standard. This covers supplier qualification, receiving inspection, storage, and traceability from source to delivery.',
    details: [
      'Approved Supplier List (ASL) maintained',
      'Supplier audit program active',
      'Climate-controlled, ESD-safe warehouse',
      'Shelf-life tracking for time-limited parts',
    ],
  },
];

const TIMELINE_STEPS = [
  {
    icon: CheckCircle2,
    title: 'Supplier Qualification',
    description:
      'All suppliers undergo a rigorous vetting process: financial review, AS9120 certification check, reference verification, and initial sample inspection before being added to our Approved Supplier List.',
  },
  {
    icon: Package,
    title: 'Receiving Inspection',
    description:
      'Every inbound shipment is quarantined, logged, and inspected within 24 hours of arrival. Parts are compared against purchase orders and original OEM datasheets.',
  },
  {
    icon: FlaskConical,
    title: 'Functional Testing',
    description:
      'Serviceable and overhauled parts undergo functional testing per OEM test procedures where test equipment is available. Results are logged and traceable.',
  },
  {
    icon: FileText,
    title: 'Documentation Review',
    description:
      'All serialized parts require full documentation package: CoC, airworthiness approval tags (8130-3, EASA Form 1, or equivalent), and maintenance records where applicable.',
  },
  {
    icon: Package,
    title: 'Packaging & Shipping',
    description:
      'Approved parts are packaged to MIL-SPEC-2073 standards, labeled with part number and NSN, and shipped with a full document package including the CoC and packing list.',
  },
];

const CERTS = [
  {
    name: 'ISO 9001:2015',
    subtitle: 'Quality Management System',
    certBody: 'Bureau Veritas Certification',
    certNum: 'BVC-QMS-2024-0047',
    scope: 'Procurement, warehousing, and distribution of aerospace and defense components.',
    color: 'bg-blue-50 border-blue-300',
    badge: 'text-blue-700',
  },
  {
    name: 'AS9120 Rev B',
    subtitle: 'Aerospace Distributor Quality Standard',
    certBody: 'SAE International / IAQG',
    certNum: 'AS9120-2024-8ATR9',
    scope: 'Distribution of aerospace, space, and defense products in compliance with aviation authority requirements.',
    color: 'bg-purple-50 border-purple-300',
    badge: 'text-purple-700',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function QualityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-orange" />
              Quality Assurance
              <span className="w-6 h-px bg-orange" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Quality Is Our Foundation
            </h1>
            <p className="text-silver/80 text-xl max-w-2xl mx-auto leading-relaxed">
              Every part we supply has been inspected, documented, and traced to
              its original source. We hold ourselves to the standards that keep
              aircraft flying safely.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {['ISO 9001:2015', 'AS9120 Rev B', 'CAGE 8ATR9', '100% Inspection'].map(
                (badge) => (
                  <span
                    key={badge}
                    className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ── Commitments ───────────────────────────────────────────────── */}
        <section className="bg-bg py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Our Commitments
              </div>
              <h2 className="text-3xl font-black text-text">
                Quality at Every Step
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {COMMITMENTS.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="bg-white border border-silver rounded-2xl p-6 sm:p-8 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-orange" />
                      </div>
                      <h3 className="text-lg font-bold text-text leading-snug">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed mb-4">
                      {c.description}
                    </p>
                    <ul className="space-y-1.5">
                      {c.details.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2 text-sm text-text"
                        >
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Process Timeline ──────────────────────────────────────────── */}
        <section className="bg-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Our Process
              </div>
              <h2 className="text-3xl font-black">
                From Supplier to Your Hangar
              </h2>
              <p className="text-silver/70 mt-2">
                Every part passes through five rigorous checkpoints before
                shipment.
              </p>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/15 hidden sm:block" />

              <div className="space-y-8">
                {TIMELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex gap-6 relative">
                      {/* Step circle */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange flex items-center justify-center z-10">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-orange text-xs font-bold uppercase tracking-widest">
                            Step {idx + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-silver/75 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Certifications ────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                <span className="w-6 h-px bg-orange" />
                Certifications
              </div>
              <h2 className="text-3xl font-black text-text">
                Independently Audited &amp; Certified
              </h2>
              <p className="text-text-muted mt-2 max-w-xl mx-auto">
                Our quality management system is audited annually by accredited
                third-party certification bodies.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CERTS.map((cert) => (
                <div
                  key={cert.name}
                  className={`rounded-2xl border-2 p-6 sm:p-8 ${cert.color}`}
                >
                  <div className={`text-3xl font-black mb-1 ${cert.badge}`}>
                    {cert.name}
                  </div>
                  <div
                    className={`text-sm font-semibold uppercase tracking-wider mb-4 ${cert.badge} opacity-70`}
                  >
                    {cert.subtitle}
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-text mb-0.5">
                        Certification Body
                      </dt>
                      <dd className="text-text-muted">{cert.certBody}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text mb-0.5">
                        Certificate Number
                      </dt>
                      <dd className="font-mono text-text-muted">{cert.certNum}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-text mb-0.5">Scope</dt>
                      <dd className="text-text-muted leading-relaxed">
                        {cert.scope}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Anti-counterfeit ──────────────────────────────────────────── */}
        <section className="bg-bg py-16 px-4 border-t border-silver">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-red-800 mb-1">
                    Anti-Counterfeit Policy
                  </h2>
                  <p className="text-red-700 text-sm">
                    We take an uncompromising stance against suspect counterfeit parts.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-red-800 leading-relaxed">
                <p>
                  AeroTurbineSpare fully complies with the requirements of{' '}
                  <strong>AS5553 Rev B</strong> (Counterfeit Electrical, Electronic,
                  and Electromechanical Parts) and{' '}
                  <strong>AS6174</strong> (Counterfeit Materiel Risk Mitigation for
                  Non-Electronic Parts). All parts are sourced exclusively from
                  OEMs, authorized distributors, or approved independent sources
                  on our Approved Supplier List.
                </p>
                <p>
                  Incoming parts from independent distributors undergo enhanced
                  inspection including external visual examination per{' '}
                  <strong>IDEA-STD-1010</strong>, documentation review, and in
                  cases of doubt, X-ray, acetone testing, or third-party laboratory
                  analysis. Any suspect counterfeit part (SCRP) is immediately
                  quarantined, documented, and reported to the original supplier
                  and relevant authorities including{' '}
                  <strong>ERAI</strong> and the <strong>U.S. DLA PQDR system</strong>.
                </p>
                <p>
                  No part that fails our anti-counterfeit screening is ever
                  released to inventory or shipped to a customer, regardless of
                  commercial pressure or urgency. This is non-negotiable.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {['AS5553 Compliant', 'AS6174 Compliant', 'IDEA-STD-1010', 'ERAI Reporting'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200"
                    >
                      {badge}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
