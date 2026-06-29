import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_KB = [
  {
    id: 'kb-1',
    category: 'rfq',
    question: 'How do I request a quote?',
    answer: 'You can submit a Request for Quote (RFQ) in 3 easy steps:\n\n1. **Browse our catalog** to find the part you need\n2. Click "Request Quote" on the part page\n3. Fill in quantity, urgency, and shipping details\n\nVisit /rfq to start now. We guarantee a quote within **24 business hours**!',
    keywords: ['quote', 'rfq', 'request', 'price', 'how to order', 'buy part'],
    priority: 10,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'kb-2',
    category: 'contact',
    question: 'What is your phone number and email?',
    answer: 'You can reach us at:\n\n📞 **Phone:** +1-713-842-5500\n📧 **RFQ Email:** rfq@aeroturbinespare.com\n📧 **General:** info@aeroturbinespare.com\n\n**Address:** 12801 North Freeway, Suite 400, Houston, TX 77060, USA',
    keywords: ['phone', 'email', 'contact', 'call', 'address'],
    priority: 7,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

export async function GET() {
  return NextResponse.json({ items: DEFAULT_KB });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = {
      id: `kb-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create KB item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update KB item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    return NextResponse.json({ deleted: id, success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete KB item' }, { status: 500 });
  }
}
