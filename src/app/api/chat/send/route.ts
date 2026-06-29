import { NextRequest, NextResponse } from 'next/server';

interface SendRequest {
  conversationId?: string;
  text: string;
  pageUrl?: string;
  pageTitle?: string;
  visitorName?: string;
  visitorEmail?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendRequest = await req.json();
    const { conversationId, text, pageUrl, pageTitle, visitorName, visitorEmail } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const id = conversationId || `conv-${Date.now()}`;

    const reply = {
      id: `bot-${Date.now()}`,
      conversationId: id,
      sender: 'bot',
      type: 'text' as const,
      text: `You said: "${text}". I'll process this and get back to you.`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      conversationId: id,
      reply,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
