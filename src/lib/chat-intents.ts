export type Intent =
  | 'greeting'
  | 'part_search_nsn'
  | 'part_search_partno'
  | 'part_search_cage'
  | 'part_search_general'
  | 'rfq_help'
  | 'rfq_start'
  | 'company_info'
  | 'contact_info'
  | 'certifications'
  | 'urgent_help'
  | 'blog_help'
  | 'quality_info'
  | 'pricing_info'
  | 'thank_you'
  | 'knowledge_base'
  | 'human_handoff'
  | 'unknown';

interface IntentPattern {
  intent: Intent;
  patterns: RegExp[];
  priority: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'greeting',
    priority: 1,
    patterns: [
      /^(hi|hello|hey|howdy|greetings|good morning|good evening|good afternoon|yo|sup)\b/i,
      /^(what'?s up|wasup|heylo)\b/i,
    ],
  },
  {
    intent: 'part_search_nsn',
    priority: 10,
    patterns: [
      /\b(nsn|national stock number)\s*[:#]?\s*[\d-]{8,15}\b/i,
      /\b[\d]{4}[\s-]?[\d]{2}[\s-]?[\d]{4,6}\b/,
      /find\s+(a\s+)?part\s+(by\s+)?nsn/i,
      /search\s+nsn/i,
    ],
  },
  {
    intent: 'part_search_partno',
    priority: 10,
    patterns: [
      /\b(part\s*(no|number|#)?|p\/?n|part\s*number)\s*[:#]?\s*[a-z0-9][-a-z0-9\/]{2,}/i,
      /do\s+you\s+(have|stock|carry)\s+/i,
      /looking\s+for\s+(a\s+)?part/i,
      /need\s+(a\s+)?part/i,
    ],
  },
  {
    intent: 'part_search_cage',
    priority: 9,
    patterns: [
      /\b(cage|cage\s*code)\s*[:#]?\s*[a-z0-9]{3,}/i,
      /parts?\s+(from|by|with)\s+cage/i,
      /manufacturer\s+code/i,
    ],
  },
  {
    intent: 'part_search_general',
    priority: 5,
    patterns: [
      /\b(search|find|browse|catalog|inventory)\s+(parts?|items?|products?)/i,
      /\bparts?\s+(catalog|list|search|finder)/i,
      /what\s+parts?\s+do\s+you\s+(have|sell|stock|carry)/i,
    ],
  },
  {
    intent: 'rfq_help',
    priority: 7,
    patterns: [
      /(how\s+(to|do\s+I|can\s+I)\s+)?(request|submit|create|make|send)\s+(a\s+)?(quote|rfq|order|purchase)/i,
      /(what\s+is|how\s+does)\s+(a\s+)?(rfq|quote)\b/i,
      /quote\s+(request|form|process|steps)/i,
      /how\s+(long|quick)\s+(does\s+)?(a\s+)?quote\s+take/i,
    ],
  },
  {
    intent: 'rfq_start',
    priority: 8,
    patterns: [
      /i\s+(want|would\s+like|need)\s+to\s+(buy|purchase|order|get)\s+/i,
      /i\s+(want|would\s+like|need)\s+(a\s+)?quote/i,
      /start\s+(a\s+)?(rfq|quote)/i,
      /submit\s+(a\s+)?(rfq|quote)/i,
    ],
  },
  {
    intent: 'company_info',
    priority: 3,
    patterns: [
      /(tell|talk)\s+(me\s+)?(about|regarding)\s+(your\s+)?(company|business|firm)/i,
      /what\s+(is|does)\s+(your\s+)?(company|business)\s+(about|do)/i,
      /who\s+(are|is)\s+(you|your\s+company)/i,
      /about\s+(us|your\s+company)/i,
    ],
  },
  {
    intent: 'contact_info',
    priority: 6,
    patterns: [
      /(what'?s?\s+)?(your\s+)?(phone|telephone|contact|email|address|location)/i,
      /how\s+(can\s+I\s+)?(reach|contact|call|email)\s+(you|your\s+team)/i,
      /(phone|telephone|cell|mobile)\s+(number|#)/i,
      /email\s+(address|id)/i,
      /where\s+are\s+you\s+(located|based)/i,
    ],
  },
  {
    intent: 'certifications',
    priority: 6,
    patterns: [
      /\b(iso|as\d{4}|certif|certification|certified|accredit|quality\s+standard)\b/i,
      /are\s+you\s+(iso|as|certified)/i,
      /what\s+certifications?\s+do\s+you\s+have/i,
    ],
  },
  {
    intent: 'urgent_help',
    priority: 9,
    patterns: [
      /\b(urgent|aog|aircraft\s+on\s+ground|emergency|critical|asap|rush)\b/i,
      /need\s+(a\s+)?part\s+(urgently|immediately|right\s+now|fast)/i,
      /fastest\s+(shipping|delivery)/i,
    ],
  },
  {
    intent: 'blog_help',
    priority: 2,
    patterns: [
      /\b(blog|articles?|posts?|insights|guides?|news)\b/i,
      /show\s+(me\s+)?(blog|articles?|posts?)/i,
      /latest\s+(blog|news|posts?|articles?)/i,
    ],
  },
  {
    intent: 'quality_info',
    priority: 4,
    patterns: [
      /\b(quality|inspection|warranty|guarantee|counterfeit)\b/i,
      /quality\s+(assurance|control|process|management)/i,
      /(your\s+)?quality\s+(policy|standard)/i,
    ],
  },
  {
    intent: 'pricing_info',
    priority: 5,
    patterns: [
      /(how\s+much|price|cost|pricing|rate|fee)/i,
      /what\s+(is\s+)?the\s+price/i,
      /(cheapest|most\s+expensive|affordable)/i,
    ],
  },
  {
    intent: 'thank_you',
    priority: 1,
    patterns: [
      /^(thanks|thank\s+you|thx|ty|appreciate|grateful)\b/i,
      /thank\s+you\s+(so\s+much|very\s+much)/i,
    ],
  },
  {
    intent: 'human_handoff',
    priority: 7,
    patterns: [
      /(talk|speak)\s+(to|with)\s+(a\s+)?(human|person|agent|representative|team\s+member)/i,
      /(connect|transfer|forward)\s+me\s+to/i,
      /customer\s+support/i,
      /help\s+me\s+please/i,
    ],
  },
];

export function detectIntent(text: string): { intent: Intent; confidence: number } {
  const trimmed = text.trim();
  if (!trimmed) return { intent: 'unknown', confidence: 0 };

  let best: { intent: Intent; confidence: number } = { intent: 'unknown', confidence: 0 };

  for (const entry of INTENT_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(trimmed)) {
        const confidence = entry.priority / 10;
        if (confidence > best.confidence) {
          best = { intent: entry.intent, confidence };
        }
        break;
      }
    }
  }

  return best;
}
