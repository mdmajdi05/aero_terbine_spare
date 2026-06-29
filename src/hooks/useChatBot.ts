'use client';

import { useCallback } from 'react';
import { useChat } from './useChat';
import { useSiteConfig } from './useSiteConfig';
import { detectIntent, type Intent } from '@/lib/chat-intents';
import { searchKnowledgeBase } from '@/lib/chat-knowledge';
import { COMPANY_INFO, QUICK_SUGGESTIONS, BOT_NAME } from '@/lib/chat-data';
import type { ChatMessage, QuickReply } from '@/types/chat';

let msgCounter = 0;
function genId() { return `msg-${++msgCounter}-${Date.now()}`; }
function now() { return new Date().toISOString(); }

function buildMessage(
  text: string,
  quickReplies?: QuickReply[],
  extra?: Partial<ChatMessage>,
): ChatMessage {
  return {
    id: genId(),
    conversationId: 'pending',
    sender: 'bot',
    type: 'text',
    text,
    quickReplies,
    createdAt: now(),
    ...extra,
  };
}

const DEFAULT_SUGGESTIONS: QuickReply[] = QUICK_SUGGESTIONS.map((s) => ({
  label: s.label,
  payload: s.payload,
}));

const PART_SEARCH_REPLIES: QuickReply[] = [
  { label: '🔍 Search by NSN', payload: 'I want to search by NSN' },
  { label: '🔍 Search by Part Number', payload: 'I want to search by part number' },
  { label: '📋 Browse Catalog', payload: 'Show me the catalog' },
];

export function useChatBot() {
  const { addMessage, setTyping, setConversation, messages } = useChat();
  const { config } = useSiteConfig();

  const getBotName = useCallback(() => {
    return config?.chat?.botName || BOT_NAME;
  }, [config]);

  const processUserMessage = useCallback(async (text: string, pageUrl?: string, pageTitle?: string) => {
    const { intent, confidence } = detectIntent(text);

    setTyping(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    let reply: ChatMessage;

    // First, check knowledge base
    const kbMatch = searchKnowledgeBase(text);
    if (kbMatch && intent === 'unknown') {
      reply = buildMessage(kbMatch.answer, [
        { label: '👍 That helps!', payload: 'thanks' },
        { label: '❓ Ask something else', payload: 'help' },
      ]);
      addMessage(reply);
      setTyping(false);
      return reply;
    }

    // Intent-based responses
    switch (intent) {
      case 'greeting':
        reply = buildMessage(
          `Hello! 👋 Welcome to **${COMPANY_INFO.name}**. I'm ${getBotName()}, your AI assistant. How can I help you today?`,
          DEFAULT_SUGGESTIONS,
        );
        break;

      case 'part_search_nsn':
      case 'part_search_partno':
      case 'part_search_cage':
      case 'part_search_general':
        reply = buildMessage(
          `I can help you find parts! You can search by:\n\n` +
          `🔹 **NSN** (National Stock Number)\n` +
          `🔹 **Part Number**\n` +
          `🔹 **CAGE Code**\n` +
          `🔹 **Manufacturer**\n\n` +
          `Try using the search bar at the top of the page, or visit our **parts catalog** at [/catalog](/catalog).`,
          PART_SEARCH_REPLIES,
        );
        break;

      case 'rfq_help':
        reply = buildMessage(
          `📋 **Request for Quote (RFQ) Process:**\n\n` +
          `1️⃣ Find your part in our [catalog](/catalog)\n` +
          `2️⃣ Click "Request Quote" on the part page\n` +
          `3️⃣ Fill in quantity, urgency, and shipping details\n` +
          `4️⃣ Receive your quote within **24 hours**\n\n` +
          `👉 [Start an RFQ Now](/rfq)\n\n` +
          `Or you can email us directly at rfq@aeroturbinespare.com`,
          [
            { label: '📝 Start RFQ', payload: 'I want to start an RFQ' },
            { label: '📞 Call Us', payload: 'What is your phone number?' },
            { label: '⏱️ Urgent RFQ', payload: 'I need an urgent quote' },
          ],
        );
        break;

      case 'rfq_start':
        reply = buildMessage(
          `Great! Let's get you started with a quote.\n\n` +
          `👉 [Click here to submit an RFQ](/rfq)\n\n` +
          `You can also email your requirements to **rfq@aeroturbinespare.com** or call us at **+1-713-842-5500** for immediate assistance.`,
          [
            { label: '🚀 Go to RFQ Page', payload: 'Open RFQ page' },
            { label: '📞 Call Now', payload: 'Call AeroTurbineSpare' },
          ],
        );
        break;

      case 'company_info':
        reply = buildMessage(
          `**${COMPANY_INFO.name}** is a US-based aerospace parts procurement platform.\n\n` +
          `🔹 **Founded:** ${COMPANY_INFO.founded}\n` +
          `🔹 **CAGE Code:** ${COMPANY_INFO.cageCode}\n` +
          `🔹 **Certifications:** ${COMPANY_INFO.certifications.join(', ')}\n` +
          `🔹 **Global Reach:** Shipping to 150+ countries\n` +
          `🔹 **Inventory:** 55,000+ parts available\n\n` +
          `We serve OEMs, MRO facilities, military contractors, and procurement professionals worldwide.`,
          [
            { label: '✅ Certifications', payload: 'Are you ISO certified?' },
            { label: '📍 Location', payload: 'Where are you located?' },
            { label: '📋 Services', payload: 'Tell me about your services' },
          ],
        );
        break;

      case 'contact_info':
        reply = buildMessage(
          `📞 **Phone:** +1-713-842-5500\n` +
          `📧 **RFQ:** rfq@aeroturbinespare.com\n` +
          `📧 **General:** info@aeroturbinespare.com\n` +
          `📧 **Quality:** quality@aeroturbinespare.com\n\n` +
          `📍 **Address:** ${COMPANY_INFO.address}\n\n` +
          `⏰ **Support Hours:** 24/7 for AOG emergencies\n` +
          `📋 **Quote Response:** Within 24 business hours`,
          [
            { label: '📞 Call Now', payload: 'Call +1-713-842-5500' },
            { label: '📝 Submit RFQ', payload: 'How do I request a quote?' },
          ],
        );
        break;

      case 'certifications':
        reply = buildMessage(
          `✅ **Yes! We are certified.**\n\n` +
          `**${COMPANY_INFO.certifications.join(' & ')}**\n\n` +
          `🔹 **ISO 9001** — Quality Management System\n` +
          `🔹 **AS9120B** — Aerospace Quality Standards\n` +
          `🔹 **CAGE Code:** ${COMPANY_INFO.cageCode}\n` +
          `🔹 **Zero Counterfeit Policy**\n` +
          `🔹 **100% Inspection** on every order\n\n` +
          `[Learn more about our quality](/quality)`,
          [
            { label: '🔍 View Quality Page', payload: 'Show quality page' },
            { label: '📋 Submit RFQ', payload: 'How do I request a quote?' },
          ],
        );
        break;

      case 'urgent_help':
        reply = buildMessage(
          `⚡ **Urgent Part Needed?**\n\n` +
          `We offer **24/7 AOG (Aircraft on Ground) support.**\n\n` +
          `📞 **Call our emergency line:** **+1-713-842-5500**\n\n` +
          `Or submit an urgent RFQ and we'll respond within **4 hours**:\n\n` +
          `👉 [Submit Urgent RFQ](/rfq?urgency=urgent)`,
          [
            { label: '📞 Call Now', payload: 'Call +1-713-842-5500' },
            { label: '🚀 Urgent RFQ', payload: 'Submit urgent RFQ' },
          ],
        );
        break;

      case 'blog_help':
        reply = buildMessage(
          `📖 **Check out our blog!**\n\n` +
          `We share aerospace insights, MRO guides, industry news, and more.\n\n` +
          `👉 [Visit our Blog](/blog)`,
          [
            { label: '📖 Open Blog', payload: 'Open blog page' },
            { label: '🔍 Search Parts', payload: 'I need to find a part' },
          ],
        );
        break;

      case 'quality_info':
        reply = buildMessage(
          `**Quality Assurance at ${COMPANY_INFO.name}**\n\n` +
          `🔹 ISO 9001 & AS9120B Certified\n` +
          `🔹 100% Inspection on Every Order\n` +
          `🔹 Zero Counterfeit Policy\n` +
          `🔹 Full Traceability & Documentation\n` +
          `🔹 24-Hour Quote Guarantee\n\n` +
          `👉 [View Our Quality Page](/quality)`,
          [
            { label: '🔍 View Quality Page', payload: 'Open quality page' },
            { label: '✅ Certifications', payload: 'Tell me about certifications' },
          ],
        );
        break;

      case 'pricing_info':
        reply = buildMessage(
          `Pricing depends on the specific part, condition (New/Used/Refurbished), quantity, and current market rates.\n\n` +
          `To get an accurate quote:\n\n` +
          `1️⃣ Find your part in our [catalog](/catalog)\n` +
          `2️⃣ Click "Request Quote"\n` +
          `3️⃣ Get a price within **24 hours**\n\n` +
          `👉 [Submit an RFQ](/rfq) for a personalized quote.`,
          [
            { label: '📝 Get Quote', payload: 'How do I request a quote?' },
            { label: '🔍 Search Parts', payload: 'I need to find a part' },
          ],
        );
        break;

      case 'thank_you':
        reply = buildMessage(
          `You're welcome! 😊 Is there anything else I can help you with?`,
          DEFAULT_SUGGESTIONS,
        );
        break;

      case 'human_handoff':
        reply = buildMessage(
          `I'll connect you with our team. In the meantime, you can:\n\n` +
          `📞 **Call us:** +1-713-842-5500\n` +
          `📧 **Email us:** info@aeroturbinespare.com\n\n` +
          `Our team typically responds within **2-4 hours** during business hours.`,
          [
            { label: '📞 Call Now', payload: 'Call +1-713-842-5500' },
            { label: '📧 Send Email', payload: 'Send email' },
            { label: '📝 Submit RFQ', payload: 'How do I request a quote?' },
          ],
        );
        break;

      default:
        if (kbMatch) {
          reply = buildMessage(kbMatch.answer, [
            { label: '👍 Thanks!', payload: 'thanks' },
            { label: '❓ Something else', payload: 'help' },
          ]);
        } else {
          reply = buildMessage(
            `I'm not sure I understand. Let me connect you with our team, or you can try one of these options:\n\n` +
            `📞 **Call us:** +1-713-842-5500\n`,
            DEFAULT_SUGGESTIONS,
          );
        }
        break;
    }

    addMessage(reply);
    setTyping(false);
    return reply;
  }, [addMessage, setTyping, getBotName]);

  const sendWelcomeMessage = useCallback(() => {
    const welcome = buildMessage(
      `Hello! 👋 Welcome to **${COMPANY_INFO.name}**. I'm ${getBotName()}, your AI assistant. How can I help you today?`,
      DEFAULT_SUGGESTIONS,
    );
    addMessage(welcome);
    return welcome;
  }, [addMessage, getBotName]);

  return { processUserMessage, sendWelcomeMessage };
}
