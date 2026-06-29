import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const mockMessages = [
    {
      id: 'msg-1',
      conversationId: id,
      sender: 'bot' as const,
      type: 'text' as const,
      text: 'Hello! Welcome to AeroTurbineSpare. How can I help you today?',
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: id,
      sender: 'user' as const,
      type: 'text' as const,
      text: 'I need help finding a part.',
      createdAt: new Date(Date.now() - 590000).toISOString(),
    },
    {
      id: 'msg-3',
      conversationId: id,
      sender: 'bot' as const,
      type: 'text' as const,
      text: 'Sure! What part number or NSN are you looking for?',
      createdAt: new Date(Date.now() - 580000).toISOString(),
    },
  ];

  return NextResponse.json({
    conversation: {
      id,
      visitorName: 'John Doe',
      visitorEmail: 'john@example.com',
      source: 'website',
      status: 'active',
      isUnread: false,
      pageUrl: '/catalog',
      lastMessage: 'I need help finding a part.',
      lastMessageAt: new Date(Date.now() - 580000).toISOString(),
      messageCount: 3,
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 580000).toISOString(),
    },
    messages: mockMessages,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    return NextResponse.json({
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}
