export type AIProviderId = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

export interface AIProviderConfig {
  enabled: boolean;
  provider: AIProviderId;
  apiKey: string;
  model: string;
  customBaseUrl?: string;
  customModel?: string;
}

export const AI_PROVIDERS = [
  { id: 'openai' as const,    name: 'OpenAI',             models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { id: 'anthropic' as const, name: 'Anthropic (Claude)', models: ['claude-sonnet-4-20250514', 'claude-3-haiku-20240307'] },
  { id: 'google' as const,    name: 'Google (Gemini)',     models: ['gemini-2.0-flash', 'gemini-2.0-pro'] },
  { id: 'openrouter' as const,name: 'OpenRouter (Multi)',  models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4-20250514', 'google/gemini-2.0-flash-001'] },
  { id: 'custom' as const,    name: 'Custom OpenAI-compatible', models: ['custom'] },
];

export type KBCategory = 'general' | 'parts' | 'rfq' | 'shipping' | 'quality' | 'contact' | 'blog' | 'other';

export interface KnowledgeBaseItem {
  id: string;
  category: KBCategory;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MessageSender = 'bot' | 'user' | 'admin';
export type MessageType = 'text' | 'quick_reply' | 'part_result' | 'rfq_link' | 'contact_card' | 'typing';

export interface QuickReply {
  label: string;
  payload: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  type: MessageType;
  text: string;
  quickReplies?: QuickReply[];
  partResults?: Array<{ partNumber: string; nsn: string; description: string; link: string }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ConversationStatus = 'active' | 'resolved' | 'flagged';
export type ConversationSource = 'website' | 'whatsapp';

export interface Conversation {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  source: ConversationSource;
  status: ConversationStatus;
  isUnread: boolean;
  pageUrl?: string;
  pageTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConfig {
  chatbotEnabled: boolean;
  botName: string;
  greetingMessage: string;
  whatsappEnabled: boolean;
  whatsappMode: 'normal' | 'business';
  whatsappNumber: string;
  whatsappBusinessPhoneId: string;
  whatsappBusinessAccountId: string;
  whatsappBusinessToken: string;
  whatsappVerifyToken: string;
  aiConfig: AIProviderConfig;
  inboxNotifyEmail: string;
  humanHandoffEnabled: boolean;
}

export interface SendMessageRequest {
  conversationId?: string;
  text: string;
  pageUrl?: string;
  pageTitle?: string;
  visitorName?: string;
  visitorEmail?: string;
}

export interface SendMessageResponse {
  conversationId: string;
  reply: ChatMessage;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  unreadCount: number;
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: ChatMessage[];
}
