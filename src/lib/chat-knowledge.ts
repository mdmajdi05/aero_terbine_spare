import type { KnowledgeBaseItem, KBCategory } from '@/types/chat';

const STORAGE_KEY = 'ats_knowledge_base';

const DEFAULT_KB: KnowledgeBaseItem[] = [
  {
    id: 'kb-1',
    category: 'rfq',
    question: 'How do I request a quote?',
    answer: 'You can submit a Request for Quote (RFQ) in 3 easy steps:\n\n1. **Browse our catalog** to find the part you need\n2. Click "Request Quote" on the part page\n3. Fill in quantity, urgency, and shipping details\n\nVisit /rfq to start now. We guarantee a quote within **24 business hours**!',
    keywords: ['quote', 'rfq', 'request', 'price', 'how to order', 'buy part'],
    priority: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-2',
    category: 'quality',
    question: 'Are you ISO certified?',
    answer: 'Yes! AeroTurbineSpare is **ISO 9001** and **AS9120B** certified. We maintain strict quality control with 100% inspection on every order and a zero-counterfeit policy. CAGE Code: 8ATR9.',
    keywords: ['iso', 'certified', 'as9120', 'quality', 'certification', 'standard'],
    priority: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-3',
    category: 'contact',
    question: 'What is your phone number and email?',
    answer: 'You can reach us at:\n\n📞 **Phone:** +1-713-842-5500\n📧 **RFQ Email:** rfq@aeroturbinespare.com\n📧 **General Inquiries:** info@aeroturbinespare.com\n📧 **Quality:** quality@aeroturbinespare.com\n\n📍 **Address:** 12801 North Freeway, Suite 400, Houston, TX 77060, USA\n\nWe offer 24/7 support for AOG (Aircraft on Ground) emergencies.',
    keywords: ['phone', 'email', 'contact', 'call', 'address', 'location', 'reach'],
    priority: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-4',
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to **150+ countries worldwide**.\n\n- **Standard:** 5-10 business days\n- **Express:** 2-3 business days\n- **Urgent/AOG:** Same-day dispatch available\n\nWe partner with FedEx, DHL, and UPS for reliable global delivery.',
    keywords: ['shipping', 'international', 'delivery', 'ship', 'freight', 'global', 'worldwide'],
    priority: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-5',
    category: 'parts',
    question: 'What if my part is not listed in the catalog?',
    answer: 'If you don\'t find the part you need, don\'t worry! Submit an RFQ with your requirements and our team will source it for you. We have access to **55,000+ parts** and a global network of 1,200+ OEM manufacturers and suppliers.\n\nContact us at rfq@aeroturbinespare.com or submit an RFQ at /rfq.',
    keywords: ['not found', 'not listed', 'missing', 'unavailable', 'can\'t find', 'search'],
    priority: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-6',
    category: 'general',
    question: 'What payment methods do you accept?',
    answer: 'We accept the following payment methods:\n\n- 💳 **Credit Card** (Visa, Mastercard, Amex)\n- 🏦 **Wire Transfer** (preferred for B2B)\n- 📄 **Net 30 Terms** (for qualified companies)\n- 📑 **Letter of Credit** (for large orders)',
    keywords: ['payment', 'pay', 'credit card', 'wire', 'net 30', 'invoice', 'method'],
    priority: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kb-7',
    category: 'general',
    question: 'What is your return policy?',
    answer: 'All parts come with our **100% satisfaction guarantee**. If a part does not meet specifications, please contact us within **14 days of delivery**. Conditions apply based on part condition (New, Used, Refurbished) and certification status.\n\nContact our quality team at quality@aeroturbinespare.com for return authorization.',
    keywords: ['return', 'refund', 'guarantee', 'satisfaction', 'exchange', 'warranty'],
    priority: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getKnowledgeBase(): KnowledgeBaseItem[] {
  if (typeof window === 'undefined') return DEFAULT_KB;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as KnowledgeBaseItem[];
  } catch { /* ignore */ }
  return DEFAULT_KB;
}

export function saveKnowledgeBase(items: KnowledgeBaseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

export function searchKnowledgeBase(query: string): KnowledgeBaseItem | null {
  const items = getKnowledgeBase().filter((i) => i.isActive);
  const lower = query.toLowerCase();

  let bestMatch: KnowledgeBaseItem | null = null;
  let bestScore = 0;

  for (const item of items) {
    let score = 0;

    const qScore = item.question.toLowerCase().includes(lower) ? 15 : 0;
    score += qScore;

    const questionWords = item.question.toLowerCase().split(/\s+/);
    const queryWords = lower.split(/\s+/);
    const wordMatches = queryWords.filter((w) => questionWords.some((qw) => qw.includes(w) || w.includes(qw))).length;
    score += wordMatches * 3;

    const kwMatches = item.keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    score += kwMatches * 5;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore >= 5 ? bestMatch : null;
}
