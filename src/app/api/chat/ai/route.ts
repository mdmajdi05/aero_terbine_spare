import { NextRequest, NextResponse } from 'next/server';

interface AIRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

const SYSTEM_PROMPT = `You are AeroBot, an AI assistant for AeroTurbineSpare, a US-based aerospace parts sourcing platform.

Company info:
- Name: AeroTurbineSpare
- Phone: +1-713-842-5500
- Email: rfq@aeroturbinespare.com
- Address: 12801 North Freeway, Suite 400, Houston, TX 77060, USA
- Certifications: ISO 9001, AS9120B
- CAGE Code: 8ATR9
- Inventory: 55,000+ parts
- Shipping: 150+ countries

Services: Parts sourcing, RFQ processing, excess inventory purchasing, 24/7 AOG support.

Keep responses concise, professional, and helpful. Always include relevant links to the website when applicable.`;

function getBaseUrl(provider: string, customBaseUrl?: string): string {
  if (customBaseUrl) return customBaseUrl.replace(/\/$/, '');
  switch (provider) {
    case 'anthropic': return 'https://api.anthropic.com/v1';
    case 'google': return 'https://generativelanguage.googleapis.com/v1beta';
    case 'openrouter': return 'https://openrouter.ai/api/v1';
    case 'custom': return customBaseUrl || 'https://api.openai.com/v1';
    default: return 'https://api.openai.com/v1';
  }
}

function getModel(provider: string, model?: string): string {
  if (model) return model;
  switch (provider) {
    case 'anthropic': return 'claude-sonnet-4-20250514';
    case 'google': return 'gemini-2.0-flash';
    case 'openrouter': return 'openai/gpt-4o-mini';
    default: return 'gpt-4o-mini';
  }
}

async function callAI(
  messages: AIRequest['messages'],
  provider: string,
  model: string,
  apiKey: string,
  baseUrl: string,
) {
  const url = `${baseUrl}/chat/completions`;

  const body = JSON.stringify({
    model: getModel(provider, model),
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 500,
    temperature: 0.7,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else if (provider === 'google') {
    // Gemini uses query param for key
    const key = apiKey;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${key}`;
    const geminiBody = { contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : m.role, parts: [{ text: m.content }] })) };
    const resp = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) });
    return resp;
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return fetch(url, { method: 'POST', headers, body });
}

export async function POST(req: NextRequest) {
  try {
    const body: AIRequest = await req.json();
    const { messages, provider = 'openai', model, apiKey, baseUrl } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const resolvedKey = apiKey || process.env.AI_API_KEY || '';
    if (!resolvedKey) {
      return NextResponse.json({
        error: 'AI API key not configured. Add your key in Admin → Branding → AI Settings.',
      }, { status: 400 });
    }

    const resolvedBaseUrl = getBaseUrl(provider, baseUrl);
    const resolvedModel = getModel(provider, model);

    const response = await callAI(messages, provider, resolvedModel, resolvedKey, resolvedBaseUrl);

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({
        error: `AI provider error (${response.status}): ${errText}`,
      }, { status: response.status });
    }

    const data = await response.json();

    let replyText = '';
    if (provider === 'google') {
      replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      replyText = data?.choices?.[0]?.message?.content || '';
    }

    return NextResponse.json({
      reply: replyText,
      model: resolvedModel,
    });
  } catch (err) {
    return NextResponse.json({
      error: `AI request failed: ${(err as Error).message}`,
    }, { status: 500 });
  }
}
