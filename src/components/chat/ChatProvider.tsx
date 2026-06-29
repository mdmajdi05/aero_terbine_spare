'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useSiteConfig, DEFAULT_CHAT_CONFIG } from '@/hooks/useSiteConfig';
import type { ChatConfig } from '@/types/chat';
import ChatWidget from './ChatWidget';
import ChatButton from './ChatButton';
import WhatsAppButton from './WhatsAppButton';

function getChatConfigSafe(config: { chat?: ChatConfig } | null): ChatConfig {
  return config?.chat || DEFAULT_CHAT_CONFIG;
}

export default function ChatProvider() {
  const { isOpen, toggle } = useChat();
  const { config } = useSiteConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const chatConfig = getChatConfigSafe(config);
  const showChat = chatConfig.chatbotEnabled !== false;
  const showWhatsApp = chatConfig.whatsappEnabled !== false;

  if (!mounted) return null;
  if (!showChat && !showWhatsApp) return null;

  return (
    <>
      {showChat && (
        <ChatWidget
          botName={chatConfig.botName}
          greetingMessage={chatConfig.greetingMessage}
          humanHandoffEnabled={chatConfig.humanHandoffEnabled}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {showChat && (
          <ChatButton isOpen={isOpen} onClick={toggle} />
        )}
        {showWhatsApp && (
          <WhatsAppButton
            number={chatConfig.whatsappNumber}
            mode={chatConfig.whatsappMode}
            businessPhoneId={chatConfig.whatsappBusinessPhoneId}
            businessToken={chatConfig.whatsappBusinessToken}
          />
        )}
      </div>
    </>
  );
}
