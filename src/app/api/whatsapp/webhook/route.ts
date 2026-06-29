import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'aeroturbine_verify_2025';

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (value?.messages) {
      for (const msg of value.messages) {
        const from = msg.from;
        const text = msg.text?.body || '';
        const msgId = msg.id;

        console.log(`WhatsApp message from ${from}: ${text}`);

        // TODO: Process message through chatbot
        // TODO: Send reply via WhatsApp Business API
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
