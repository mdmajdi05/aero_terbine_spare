import { Search, FileText, CheckCircle, Package } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Search or Submit RFQ',
    desc: 'Enter your part number, NSN, or CAGE code. Or submit a detailed RFQ directly — no account required.',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Receive Your Quote',
    desc: 'Our team reviews your requirement and responds within 24 hours with a competitive, certified quote.',
  },
  {
    icon: CheckCircle,
    step: '03',
    title: 'Review & Accept',
    desc: 'Review the quote, approve pricing, and confirm your order. We handle all certification documentation.',
  },
  {
    icon: Package,
    step: '04',
    title: 'Delivery Worldwide',
    desc: 'We package and ship to your facility globally. Real-time tracking keeps you updated every step.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
            <span className="w-6 h-px bg-orange" /> Simple Process <span className="w-6 h-px bg-orange" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text">How It Works</h2>
          <p className="text-text-muted mt-3 max-w-xl mx-auto">
            From initial inquiry to delivery, we make aerospace parts procurement effortless.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
            <div key={step} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-24px)] w-12 h-px bg-silver-dark z-0" />
              )}
              <div className="relative bg-white rounded-2xl p-6 border border-silver hover:shadow-md hover:border-orange/30 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5.5 h-5.5 text-orange" />
                  </div>
                  <span className="text-4xl font-black text-silver-dark/50 leading-none">{step}</span>
                </div>
                <h3 className="font-bold text-text mt-4 mb-2">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
