'use client';

import { useState } from 'react';
import {
  MessageCircle, Search, CheckCircle, Flag, Archive,
  Send, Phone, Mail, Globe, Clock,
  ChevronRight, Bot, User,
} from 'lucide-react';
import { useChatInbox } from '@/hooks/useChatInbox';
import { cn } from '@/lib/utils';
import type { Conversation, ChatMessage } from '@/types/chat';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function ConversationItem({
  conv, isActive, onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
        isActive && 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-600',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            {conv.source === 'whatsapp' ? (
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Globe className="w-4 h-4 text-indigo-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {conv.visitorName || 'Anonymous'}
              </span>
              {conv.isUnread && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {conv.lastMessage}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          {formatTime(conv.lastMessageAt)}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.sender === 'bot';
  const isAdmin = msg.sender === 'admin';
  const isUser = msg.sender === 'user';

  return (
    <div className={cn('flex gap-2.5 px-4 py-1.5', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      {isAdmin && (
        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={cn(
        'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
        isBot && 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm',
        isAdmin && 'bg-emerald-50 dark:bg-emerald-900/30 text-gray-900 dark:text-gray-100 border border-emerald-200 dark:border-emerald-800 rounded-tl-sm',
        isUser && 'bg-indigo-600 text-white rounded-tr-sm',
      )}>
        <p className="text-sm">{msg.text}</p>
        <span className={cn(
          'text-[10px] mt-1 block opacity-60',
          isUser ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500',
        )}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      </div>
    </div>
  );
}

export default function ChatInboxPage() {
  const {
    conversations, activeConvId, messages, loading, unreadCount,
    selectConversation, updateStatus, sendAdminMessage,
  } = useChatInbox();

  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'active' | 'resolved'>('all');

  const filtered = conversations.filter((c) => {
    if (filter === 'unread' && !c.isUnread) return false;
    if (filter === 'resolved' && c.status !== 'resolved') return false;
    if (filter === 'active' && c.status === 'resolved') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.visitorName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.visitorEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !activeConvId) return;
    sendAdminMessage(trimmed);
    setReplyText('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Left: Conversation list */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 rounded-l-2xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            Chat Inbox
            {unreadCount > 0 && (
              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          {(['all', 'unread', 'active', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-medium transition-colors capitalize',
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No conversations found
            </div>
          ) : (
            filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => selectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Chat view */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-r-2xl">
        {activeConv ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {activeConv.visitorName || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    {activeConv.visitorEmail && <span>{activeConv.visitorEmail}</span>}
                    {activeConv.pageUrl && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {activeConv.pageUrl}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeConv.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus(activeConv.id, 'resolved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}
                {activeConv.status !== 'flagged' && (
                  <button
                    onClick={() => updateStatus(activeConv.id, 'flagged')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Flag
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {messages.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No messages yet"
                  description="Messages from this visitor will appear here."
                />
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
              )}
            </div>

            {/* Reply input */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="Select a conversation"
            description="Choose a conversation from the left to view messages and reply."
          />
        )}
      </div>
    </div>
  );
}
