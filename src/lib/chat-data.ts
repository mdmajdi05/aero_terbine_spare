export const COMPANY_INFO = {
  name: 'AeroTurbineSpare',
  tagline: 'Precision Aerospace Parts Sourcing — Fast, Certified, Global',
  cageCode: '8ATR9',
  phone: '+1-713-842-5500',
  emails: {
    rfq: 'rfq@aeroturbinespare.com',
    info: 'info@aeroturbinespare.com',
    quality: 'quality@aeroturbinespare.com',
  },
  address: '12801 North Freeway, Suite 400, Houston, TX 77060, USA',
  certifications: ['ISO 9001', 'AS9120B'],
  founded: '2018',
  website: 'https://aeroturbinespare.com',
};

export const QUICK_SUGGESTIONS = [
  { label: '🔍 Search Parts', payload: 'I need to find a part' },
  { label: '📋 Request Quote', payload: 'How do I request a quote?' },
  { label: '📞 Contact Info', payload: 'What is your phone number?' },
  { label: '✅ Certifications', payload: 'Are you ISO certified?' },
  { label: '🚚 Shipping Info', payload: 'Do you ship internationally?' },
  { label: '⚡ Urgent Part', payload: 'I need an urgent part' },
];

export const FAQ_RESPONSES: Record<string, { answer: string; category: string }> = {
  'how to request quote': {
    answer: 'You can submit a Request for Quote (RFQ) in 3 easy steps:\n\n1. **Browse our catalog** at /catalog to find the part you need\n2. Click "Request Quote" on the part page\n3. Fill in quantity, urgency, and shipping details\n\nOr go directly to /rfq to start a new RFQ.\n\nWe guarantee a quote within **24 business hours**!',
    category: 'rfq',
  },
  'shipping': {
    answer: 'Yes, we ship to **150+ countries worldwide**. We use trusted carriers including FedEx, DHL, and UPS. Shipping costs depend on destination, weight, and urgency.\n\nStandard shipping: 5-10 business days\nExpress shipping: 2-3 business days\nUrgent/AOG: Same-day dispatch available',
    category: 'shipping',
  },
  'return policy': {
    answer: 'All parts come with our **100% satisfaction guarantee**. If a part does not meet specifications, contact us within 14 days of delivery. Conditions apply based on part condition and certification status.',
    category: 'general',
  },
  'payment methods': {
    answer: 'We accept:\n- Wire Transfer (preferred for B2B)\n- Credit Card (Visa, Mastercard, Amex)\n- Net 30 terms (for qualified companies)\n- Letter of Credit (for large orders)',
    category: 'general',
  },
};

export const GREETING_MESSAGE = 'Hello! Welcome to AeroTurbineSpare. How can I help you today? You can ask me about parts, quotes, certifications, or anything else!';
export const BOT_NAME = 'AeroBot';
