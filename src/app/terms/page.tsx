import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  const lastUpdated = 'June 1, 2025';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-bg">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-black mb-3">Terms &amp; Conditions</h1>
            <p className="text-silver/70 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-silver rounded-2xl p-8 sm:p-10 prose-custom">

              <div className="bg-orange/8 border border-orange/20 rounded-xl px-5 py-4 mb-8">
                <p className="text-sm text-text-muted leading-relaxed">
                  Please read these Terms and Conditions carefully before using
                  the AeroTurbineSpare platform or placing any orders. By
                  accessing this website or submitting a Request for Quote (RFQ),
                  you confirm that you have read, understood, and agree to be
                  bound by these terms.
                </p>
              </div>

              {/* 1. Acceptance */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to
                    and use of the AeroTurbineSpare website (
                    <strong>aeroturbinespare.com</strong>) and all associated
                    services, including the parts catalog, RFQ system, and
                    inventory submission portal (collectively, the
                    &ldquo;Services&rdquo;), operated by AeroTurbineSpare, Inc., a Texas
                    corporation (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
                  </p>
                  <p>
                    By accessing the Services, you represent that you are at
                    least 18 years of age and have the legal authority to enter
                    into binding commercial agreements on behalf of yourself or
                    your organization. If you do not agree to these Terms, you
                    must not use the Services.
                  </p>
                  <p>
                    We reserve the right to modify these Terms at any time. Your
                    continued use of the Services following any modification
                    constitutes acceptance of the revised Terms.
                  </p>
                </div>
              </section>

              {/* 2. Services */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  2. Description of Services
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    AeroTurbineSpare provides an online platform for the
                    procurement and distribution of aerospace, defense, and
                    industrial parts and components. Our Services include, but
                    are not limited to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Parts catalog browsing and search by part number, NSN, and
                      CAGE code
                    </li>
                    <li>
                      Request for Quote (RFQ) submission and management
                    </li>
                    <li>
                      Excess inventory submission and purchase evaluation
                    </li>
                    <li>
                      Account dashboard for tracking RFQs and orders
                    </li>
                    <li>
                      Industry-specific procurement support
                    </li>
                  </ul>
                  <p>
                    Submission of an RFQ does not constitute a binding purchase
                    order. A binding agreement is formed only when a formal
                    purchase order is issued and confirmed in writing by
                    AeroTurbineSpare.
                  </p>
                </div>
              </section>

              {/* 3. Payment */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  3. Pricing, Payment &amp; Orders
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    All prices quoted are in U.S. Dollars (USD) unless expressly
                    stated otherwise. Prices are subject to change without notice
                    until a formal purchase order has been confirmed in writing
                    by both parties.
                  </p>
                  <p>
                    Accepted payment methods include wire transfer (T/T), ACH,
                    and approved credit terms for qualified accounts. Credit card
                    payments may be accepted for orders under $5,000 USD at our
                    discretion. All payments must be received in full prior to
                    shipment unless prior credit terms have been established.
                  </p>
                  <p>
                    Late payments are subject to a finance charge of 1.5% per
                    month (18% per annum) or the maximum rate permitted by
                    applicable law, whichever is lower. The buyer is responsible
                    for all costs of collection, including attorney&apos;s fees, if
                    payment is not received when due.
                  </p>
                  <p>
                    Export transactions are subject to U.S. Export Administration
                    Regulations (EAR) and the International Traffic in Arms
                    Regulations (ITAR). Buyer is responsible for obtaining all
                    required export licenses and ensuring compliance with all
                    applicable export control laws.
                  </p>
                </div>
              </section>

              {/* 4. Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  4. Intellectual Property
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    All content on the AeroTurbineSpare platform — including but
                    not limited to text, graphics, logos, images, part
                    descriptions, catalog data, and software — is the property
                    of AeroTurbineSpare, Inc. or its licensors and is protected
                    by U.S. and international copyright, trademark, and other
                    intellectual property laws.
                  </p>
                  <p>
                    You are granted a limited, non-exclusive, non-transferable
                    license to access and use the Services for your legitimate
                    business procurement purposes only. You may not reproduce,
                    distribute, modify, create derivative works from, or
                    commercially exploit any content from this platform without
                    prior written consent from AeroTurbineSpare.
                  </p>
                  <p>
                    Part numbers, NSNs, and manufacturer names referenced in
                    our catalog are used for identification purposes only and
                    remain the property of their respective owners.
                    AeroTurbineSpare is not affiliated with, sponsored by, or
                    endorsed by any OEM unless expressly stated.
                  </p>
                </div>
              </section>

              {/* 5. Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  5. Limitation of Liability &amp; Warranty Disclaimer
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    Parts are sold with a Certificate of Conformance (CoC)
                    and traceability documentation. AeroTurbineSpare warrants
                    that all parts are as described at the time of sale. This
                    warranty does not extend to consequential damages, loss of
                    aircraft revenue, or damage resulting from improper
                    installation or use.
                  </p>
                  <p className="uppercase font-semibold text-text text-xs tracking-wide">
                    To the maximum extent permitted by applicable law,
                    AeroTurbineSpare shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages —
                    including loss of profits, data, or business — arising out
                    of or in connection with your use of the Services or any
                    parts purchased through the platform, even if advised of
                    the possibility of such damages.
                  </p>
                  <p>
                    Our total liability in connection with any single
                    transaction shall not exceed the invoice value of the parts
                    in question. Some jurisdictions do not allow limitation of
                    liability for consequential damages, so the above limitation
                    may not apply to you.
                  </p>
                </div>
              </section>

              {/* 6. Governing Law */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-text mb-3 pb-2 border-b border-silver">
                  6. Governing Law &amp; Dispute Resolution
                </h2>
                <div className="space-y-3 text-sm text-text-muted leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with the laws of the State of Texas, United States, without
                    regard to its conflict of law provisions. The United Nations
                    Convention on Contracts for the International Sale of Goods
                    (CISG) is expressly excluded.
                  </p>
                  <p>
                    Any dispute, claim, or controversy arising out of or relating
                    to these Terms or the Services shall first be submitted to
                    good-faith mediation in Houston, Texas. If mediation fails
                    to resolve the dispute within 60 days, the parties agree to
                    submit to binding arbitration under the rules of the American
                    Arbitration Association (AAA), Commercial Arbitration Rules,
                    with proceedings conducted in Houston, Texas.
                  </p>
                  <p>
                    Notwithstanding the foregoing, AeroTurbineSpare reserves
                    the right to seek injunctive or other equitable relief in
                    any court of competent jurisdiction for violations of
                    intellectual property rights or confidentiality obligations.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <div className="bg-silver/50 rounded-xl px-5 py-4 text-sm text-text-muted">
                <p>
                  Questions about these Terms? Contact our legal department at{' '}
                  <a
                    href="mailto:legal@aeroturbinespare.com"
                    className="text-orange hover:underline"
                  >
                    legal@aeroturbinespare.com
                  </a>{' '}
                  or by mail at AeroTurbineSpare, Inc., 12801 North Freeway,
                  Suite 400, Houston, TX 77060, USA.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
