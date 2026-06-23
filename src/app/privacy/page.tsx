import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const lastUpdated = 'June 1, 2025';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-bg">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
            <p className="text-silver/70 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-silver rounded-2xl p-8 sm:p-10">

              <div className="bg-navy/5 border border-navy/10 rounded-xl px-5 py-4 mb-8">
                <p className="text-sm text-text-muted leading-relaxed">
                  AeroTurbineSpare, Inc. (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
                  protecting your privacy. This Privacy Policy explains what
                  information we collect, how we use it, and the choices you
                  have regarding your personal data when you use our website and
                  services. If you have any questions, contact us at{' '}
                  <a
                    href="mailto:privacy@aeroturbinespare.com"
                    className="text-orange hover:underline"
                  >
                    privacy@aeroturbinespare.com
                  </a>
                  .
                </p>
              </div>

              {/* 1. Data Collection */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-sm text-text-muted leading-relaxed">
                  <p>
                    We collect information in the following ways when you interact
                    with our platform:
                  </p>
                  <div>
                    <h3 className="font-semibold text-text mb-2">
                      1.1 Information You Provide Directly
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Account Registration:</strong> Name, email address,
                        company name, phone number, country, and CAGE code.
                      </li>
                      <li>
                        <strong>RFQ Submissions:</strong> Part numbers, quantities,
                        shipping address, and special instructions.
                      </li>
                      <li>
                        <strong>Inventory Submissions:</strong> Company name, contact
                        email, uploaded inventory files, and part descriptions.
                      </li>
                      <li>
                        <strong>Contact Forms:</strong> Name, email, phone, and
                        message content.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-2">
                      1.2 Information Collected Automatically
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Log Data:</strong> IP address, browser type,
                        operating system, referring URLs, pages viewed, and
                        timestamps.
                      </li>
                      <li>
                        <strong>Device Information:</strong> Hardware model, unique
                        device identifiers, and mobile network information.
                      </li>
                      <li>
                        <strong>Cookies &amp; Tracking:</strong> Session tokens,
                        analytics data, and user preferences. See Section 7
                        for details.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 2. Use */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  2. How We Use Your Information
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Process RFQs, inventory submissions, and purchase orders
                    </li>
                    <li>
                      Communicate with you about your account, orders, and inquiries
                    </li>
                    <li>
                      Verify your identity and company credentials for regulated
                      transactions
                    </li>
                    <li>
                      Comply with export control laws (EAR, ITAR) and anti-money
                      laundering obligations
                    </li>
                    <li>
                      Send transactional emails, quote notifications, and order
                      updates
                    </li>
                    <li>
                      Analyze usage patterns to improve our platform and services
                    </li>
                    <li>
                      Send marketing communications where you have provided consent
                      (you may opt out at any time)
                    </li>
                    <li>
                      Detect, prevent, and address fraud, security breaches, and
                      technical issues
                    </li>
                  </ul>
                  <p>
                    We will not use your personal data for purposes materially
                    different from those described above without first notifying
                    you and, where required by law, obtaining your consent.
                  </p>
                </div>
              </section>

              {/* 3. Storage */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  3. Data Storage &amp; Security
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    Your data is stored on servers located in the United States.
                    We implement industry-standard security measures, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>TLS 1.3 encryption for all data in transit</li>
                    <li>
                      AES-256 encryption for sensitive data at rest (passwords
                      are hashed with bcrypt; we never store plaintext passwords)
                    </li>
                    <li>Role-based access controls limiting internal data access</li>
                    <li>Regular third-party security audits and penetration testing</li>
                    <li>SOC 2 Type II compliant hosting infrastructure</li>
                  </ul>
                  <p>
                    We retain personal data for as long as necessary to fulfill
                    the purposes outlined in this Policy, or as required by
                    applicable law (typically 7 years for transaction records
                    due to export control and tax compliance requirements). When
                    data is no longer required, it is securely deleted or
                    anonymized.
                  </p>
                  <p>
                    While we implement strong security measures, no system is
                    completely secure. In the event of a data breach that poses
                    a risk to your rights and freedoms, we will notify affected
                    users and relevant authorities as required by applicable law.
                  </p>
                </div>
              </section>

              {/* 4. Third Parties */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  4. Sharing with Third Parties
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    We do not sell your personal data. We may share your
                    information with the following categories of third parties
                    only to the extent necessary:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Service Providers:</strong> Cloud hosting (AWS),
                      email delivery, analytics, payment processors, and CRM
                      tools. These parties process data solely on our behalf
                      under data processing agreements.
                    </li>
                    <li>
                      <strong>Logistics Partners:</strong> Freight forwarders and
                      couriers who require your shipping address and contact
                      details to complete delivery.
                    </li>
                    <li>
                      <strong>Export Compliance:</strong> U.S. government agencies
                      (e.g., BIS, OFAC, DCSA) where disclosure is required by
                      export control regulations.
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> Law enforcement or
                      regulatory authorities when legally required or to protect
                      the rights, property, or safety of AeroTurbineSpare,
                      our customers, or others.
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> In connection with any
                      merger, acquisition, or sale of assets, with appropriate
                      confidentiality protections in place.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 5. Your Rights */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  5. Your Rights &amp; Choices
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    Depending on your jurisdiction, you may have the following
                    rights regarding your personal data:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Access:</strong> Request a copy of the personal data
                      we hold about you.
                    </li>
                    <li>
                      <strong>Correction:</strong> Request correction of inaccurate
                      or incomplete data.
                    </li>
                    <li>
                      <strong>Deletion:</strong> Request deletion of your personal
                      data, subject to legal retention requirements.
                    </li>
                    <li>
                      <strong>Portability:</strong> Request a machine-readable
                      export of your data.
                    </li>
                    <li>
                      <strong>Objection:</strong> Object to processing for direct
                      marketing or where we rely on legitimate interests.
                    </li>
                    <li>
                      <strong>Withdrawal of Consent:</strong> Withdraw consent at
                      any time where processing is based on consent.
                    </li>
                  </ul>
                  <p>
                    To exercise any of these rights, contact us at{' '}
                    <a
                      href="mailto:privacy@aeroturbinespare.com"
                      className="text-orange hover:underline"
                    >
                      privacy@aeroturbinespare.com
                    </a>
                    . We will respond within 30 days. For EU/UK residents,
                    you also have the right to lodge a complaint with your local
                    data protection authority.
                  </p>
                </div>
              </section>

              {/* 6. Cookies */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  6. Cookies &amp; Tracking Technologies
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>We use the following types of cookies and similar technologies:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        type: 'Essential',
                        desc: 'Required for the platform to function. Cannot be disabled. Includes authentication tokens and session management.',
                      },
                      {
                        type: 'Analytics',
                        desc: 'Help us understand how visitors use our site (e.g., Google Analytics with IP anonymization). You may opt out.',
                      },
                      {
                        type: 'Preferences',
                        desc: 'Remember your settings and choices to provide a personalized experience.',
                      },
                      {
                        type: 'Marketing',
                        desc: 'Used with your consent to deliver relevant advertising. We do not use behavioral tracking for advertising.',
                      },
                    ].map((cookie) => (
                      <div
                        key={cookie.type}
                        className="bg-bg border border-silver rounded-xl p-4"
                      >
                        <div className="font-semibold text-text text-sm mb-1">
                          {cookie.type} Cookies
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {cookie.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p>
                    You can manage cookie preferences through your browser
                    settings. Note that disabling certain cookies may affect the
                    functionality of our platform.
                  </p>
                </div>
              </section>

              {/* 7. Contact */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  7. Contact &amp; Data Controller
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    The data controller responsible for your personal information is:
                  </p>
                  <div className="bg-bg border border-silver rounded-xl px-5 py-4">
                    <p className="font-semibold text-text">AeroTurbineSpare, Inc.</p>
                    <p>12801 North Freeway, Suite 400</p>
                    <p>Houston, TX 77060, USA</p>
                    <p className="mt-2">
                      Privacy inquiries:{' '}
                      <a
                        href="mailto:privacy@aeroturbinespare.com"
                        className="text-orange hover:underline"
                      >
                        privacy@aeroturbinespare.com
                      </a>
                    </p>
                    <p>
                      General contact:{' '}
                      <a
                        href="mailto:info@aeroturbinespare.com"
                        className="text-orange hover:underline"
                      >
                        info@aeroturbinespare.com
                      </a>
                    </p>
                    <p>
                      Phone:{' '}
                      <a
                        href="tel:+17138425500"
                        className="text-orange hover:underline"
                      >
                        +1-713-842-5500
                      </a>
                    </p>
                  </div>
                  <p>
                    If you are located in the European Economic Area or United
                    Kingdom, our EU/UK Representative may be contacted for
                    GDPR-related inquiries. Please email the address above with
                    &ldquo;GDPR Inquiry&rdquo; in the subject line and we will provide
                    representative contact details.
                  </p>
                </div>
              </section>

              <div className="bg-silver/50 rounded-xl px-5 py-4 text-xs text-text-muted">
                This Privacy Policy is effective as of {lastUpdated} and supersedes
                all previous versions. We will update this page if our practices
                change materially and will notify registered users by email for
                significant changes.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
