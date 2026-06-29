# AeroTurbineSpare — Chat System Implementation Plan

## Overview
Full customer support chat system: Website chatbot + WhatsApp integration + Admin inbox + Knowledge Base.
Self-hosted alternative to Intercom/Crisp/Tidio.

## Architecture

```
Website Widget ─┐                    ┌── Admin Inbox
WhatsApp API ───┼── Chat Backend ───┼── Knowledge Base
                │                    └── AI Provider (OpenAI/Claude/Gemini/OpenRouter/Custom)
                └── Intent Engine
```

## Files to Create (23)

### Types & Libs
| File | Purpose |
|---|---|
| `src/types/chat.ts` | All chat types: Conversation, ChatMessage, KnowledgeBaseItem, ChatConfig, AIProviderConfig |
| `src/lib/chat-data.ts` | Website data corpus for chatbot (parts, company info, FAQs) |
| `src/lib/chat-intents.ts` | Intent detection engine (14 intents via pattern/keyword matching) |
| `src/lib/chat-knowledge.ts` | Knowledge base search & matching logic |

### Hooks
| File | Purpose |
|---|---|
| `src/hooks/useChat.ts` | Visitor chat state (Zustand) — messages, open/close, send |
| `src/hooks/useChatBot.ts` | Bot brain — intent detection → response generation → knowledge base lookup |
| `src/hooks/useChatInbox.ts` | Admin inbox — conversations list, unread count, mark read, send as admin |
| `src/hooks/useKnowledgeBase.ts` | Admin knowledge base — CRUD operations, search |

### UI Components
| File | Purpose |
|---|---|
| `src/components/chat/ChatWidget.tsx` | Main chat window (header + messages + suggestions + input) |
| `src/components/chat/ChatButton.tsx` | Floating chat FAB button with unread badge |
| `src/components/chat/WhatsAppButton.tsx` | Floating WhatsApp button (normal `wa.me` or Business API) |
| `src/components/chat/ChatMessage.tsx` | Single message bubble — text, quick_reply, part_result, contact_card |
| `src/components/chat/ChatSuggestions.tsx` | Quick reply chip buttons |
| `src/components/chat/ChatInput.tsx` | Text input + send button |

### API Routes
| File | Purpose |
|---|---|
| `src/app/api/chat/send/route.ts` | Send message → bot processes → returns response |
| `src/app/api/chat/conversations/route.ts` | List/create conversations |
| `src/app/api/chat/conversations/[id]/route.ts` | Get single conversation + messages, update status |
| `src/app/api/chat/knowledge-base/route.ts` | CRUD for knowledge base items |
| `src/app/api/chat/ai/route.ts` | AI fallback — generic OpenAI-compatible provider |
| `src/app/api/whatsapp/webhook/route.ts` | WhatsApp Cloud API webhook (receive/send messages) |

### Admin Pages
| File | Purpose |
|---|---|
| `src/app/admin/chat/page.tsx` | Chat inbox — left: conversation list, right: active chat |
| `src/app/admin/knowledge-base/page.tsx` | KB management — list, add, edit, delete, search |

## Files to Modify (8)

| File | Change |
|---|---|
| `src/types/index.ts` | Add `ChatConfig` to `SiteConfig` interface |
| `src/hooks/useSiteConfig.ts` | Add default chat config values in `DEFAULT_CONFIG` |
| `src/lib/api-client.ts` | Update `getDefaultSiteConfig` with chat defaults |
| `src/app/admin/branding/page.tsx` | Add "Chat & WhatsApp Configuration" section |
| `src/app/admin/layout.tsx` | Add nav links: Chat Inbox, Knowledge Base |
| `src/app/layout.tsx` | Add `<ChatWidget />` and `<WhatsAppButton />` before `</body>` |
| `public/data/branding.json` | Add chat config defaults |

## Chatbot Intents (14)

| Intent | Example | Response |
|---|---|---|
| `greeting` | "hi/hello" | Welcome + suggestions |
| `part_search_nsn` | "find NSN 1234-56-789" | Search results + link |
| `part_search_partno` | "do you have P/N XYZ-123" | Part search |
| `part_search_cage` | "parts from CAGE 12345" | Parts by manufacturer |
| `rfq_help` | "how to request quote" | RFQ steps + link |
| `rfq_start` | "i want to buy a part" | Start RFQ flow |
| `company_info` | "tell me about company" | About + certifications |
| `contact_info` | "what's your phone" | Phone, email, address |
| `certifications` | "are you ISO certified" | ISO 9001, AS9120 |
| `urgent_help` | "urgent part needed" | AOG hotline + urgent RFQ |
| `blog_help` | "show me blog posts" | Blog listing link |
| `quality_info` | "quality assurance" | Quality page summary |
| `thank_you` | "thanks" | You're welcome |
| `unknown` | anything else | KB search → AI fallback → human handoff |

## Chat Flow

```
Visitor → types message
  → Intent detection (14 intents)
  → Knowledge base search (admin-provided Q&A)
  → Website data lookup (parts, company, etc.)
  → Match? → Auto reply
  → No match? → AI fallback (if configured, any provider)
  → Still no? → Flag for human → Admin sees in inbox → Manual reply
```

## AI Provider System

Generic OpenAI-compatible provider abstraction:
- OpenAI (gpt-4o, gpt-4o-mini)
- Anthropic/Claude via API (claude-sonnet-4, claude-haiku)
- Google/Gemini (gemini-2.0-flash, gemini-2.0-pro)
- OpenRouter (any model via unified API)
- Custom (any OpenAI-compatible endpoint)
- Admin selects provider, enters key, selects model

## Chat Inbox Features

- Real-time conversation list with unread indicators
- Chatbot auto-reply + manual admin reply
- Take over / release conversation
- Mark resolved / flag
- Visitor info (name, email, page, source)
- Search conversations

## Knowledge Base Features

- CRUD for Q&A entries
- Categories (general, parts, rfq, shipping, quality, contact, blog)
- Keywords for matching
- Priority scoring
- Search & filter

## WhatsApp Integration

- **Normal mode**: Simple `wa.me` link
- **Business API mode**: Meta Cloud API webhook
  - Receive messages → same bot logic
  - Send replies via API
  - Same inbox as website chat

## Design Guide

- Floating buttons: bottom-right, z-50, brand-indigo (#4F46E5)
- Chat widget: 380px desktop, full-screen mobile
- Dark mode supported (CSS variables)
- Animations: framer-motion (already in project)
- Icons: lucide-react (already in project)
- State: Zustand (already in project)
- Toast: react-hot-toast (already in project)
