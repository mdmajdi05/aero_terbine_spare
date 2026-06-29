import { NextRequest, NextResponse } from 'next/server';

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    visitorName: 'John Doe',
    visitorEmail: 'john@example.com',
    source: 'website' as const,
    status: 'active' as const,
    isUnread: true,
    pageUrl: '/catalog',
    pageTitle: 'Parts Catalog',
    lastMessage: 'I need a quote for NSN 1234-56-789',
    lastMessageAt: new Date().toISOString(),
    messageCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2',
    visitorName: 'Jane Smith',
    visitorEmail: 'jane@aerospace.com',
    source: 'whatsapp' as const,
    status: 'active' as const,
    isUnread: false,
    lastMessage: 'Thanks for the information!',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    messageCount: 3,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    conversations: MOCK_CONVERSATIONS,
    total: MOCK_CONVERSATIONS.length,
    unreadCount: MOCK_CONVERSATIONS.filter((c) => c.isUnread).length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const conv = {
      id: `conv-${Date.now()}`,
      visitorName: body.visitorName || 'Anonymous',
      visitorEmail: body.visitorEmail || '',
      source: body.source || 'website',
      status: 'active',
      isUnread: true,
      pageUrl: body.pageUrl || '',
      pageTitle: body.pageTitle || '',
      lastMessage: body.lastMessage || '',
      lastMessageAt: new Date().toISOString(),
      messageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ conversation: conv }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
