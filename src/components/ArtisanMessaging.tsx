import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import { supabase, ArtisanMessage, Artisan } from '../lib/supabase';

interface Conversation {
  artisan: Artisan;
  lastMessage: ArtisanMessage;
  unreadCount: number;
}

export default function ArtisanMessaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ArtisanMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isArtisan, setIsArtisan] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserAndConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadUserAndConversations() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUser(user);

    const { data: artisanData } = await supabase
      .from('artisans')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsArtisan(!!artisanData);

    if (artisanData) {
      await loadArtisanConversations(artisanData.id);
    } else {
      await loadCustomerConversations(user.id);
    }

    setLoading(false);
  }

  async function loadArtisanConversations(artisanId: string) {
    const { data } = await supabase
      .from('artisan_messages')
      .select('*')
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false });

    if (data) {
      const uniqueUsers = new Map<string, ArtisanMessage>();
      data.forEach(msg => {
        if (!uniqueUsers.has(msg.user_id)) {
          uniqueUsers.set(msg.user_id, msg);
        }
      });

      const conversationsList: Conversation[] = [];
      for (const [userId, lastMsg] of uniqueUsers) {
        const unreadCount = data.filter(
          m => m.user_id === userId && !m.is_read && m.sender_type === 'customer'
        ).length;

        conversationsList.push({
          artisan: {
            display_name: 'Customer',
            id: artisanId
          } as Artisan,
          lastMessage: lastMsg,
          unreadCount
        });
      }

      setConversations(conversationsList);
    }
  }

  async function loadCustomerConversations(userId: string) {
    const { data: messageData } = await supabase
      .from('artisan_messages')
      .select('*, artisans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (messageData) {
      const uniqueArtisans = new Map<string, any>();
      messageData.forEach((msg: any) => {
        if (!uniqueArtisans.has(msg.artisan_id)) {
          uniqueArtisans.set(msg.artisan_id, msg);
        }
      });

      const conversationsList: Conversation[] = [];
      for (const [artisanId, lastMsg] of uniqueArtisans) {
        const unreadCount = messageData.filter(
          (m: any) => m.artisan_id === artisanId && !m.is_read && m.sender_type === 'artisan'
        ).length;

        conversationsList.push({
          artisan: lastMsg.artisans,
          lastMessage: lastMsg,
          unreadCount
        });
      }

      setConversations(conversationsList);
    }
  }

  async function loadMessages(conversationId: string) {
    const conversation = conversations.find(
      c => (isArtisan ? c.lastMessage.user_id : c.artisan.id) === conversationId
    );
    if (!conversation) return;

    let query = supabase
      .from('artisan_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (isArtisan) {
      query = query.eq('user_id', conversationId);
    } else {
      query = query.eq('artisan_id', conversationId).eq('user_id', currentUser.id);
    }

    const { data } = await query;

    if (data) setMessages(data);
  }

  async function markAsRead(conversationId: string) {
    if (!currentUser) return;

    let query = supabase
      .from('artisan_messages')
      .update({ is_read: true });

    if (isArtisan) {
      query = query.eq('user_id', conversationId).eq('sender_type', 'customer');
    } else {
      query = query.eq('artisan_id', conversationId).eq('sender_type', 'artisan');
    }

    await query;
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const conversation = conversations.find(
      c => (isArtisan ? c.lastMessage.user_id : c.artisan.id) === selectedConversation
    );
    if (!conversation) return;

    const { data, error } = await supabase
      .from('artisan_messages')
      .insert({
        artisan_id: isArtisan ? conversation.artisan.id : conversation.artisan.id,
        user_id: isArtisan ? conversation.lastMessage.user_id : currentUser.id,
        message: newMessage,
        sender_type: isArtisan ? 'artisan' : 'customer'
      })
      .select()
      .single();

    if (!error && data) {
      setMessages([...messages, data]);
      setNewMessage('');
    }
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Sign In Required</h2>
        <p className="text-secondary">Please sign in to view your messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-surface rounded-lg shadow-theme-lg overflow-hidden" style={{ height: '80vh' }}>
        <div className="grid lg:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-primary mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const conversationId = isArtisan ? conv.lastMessage.user_id : conv.artisan.id;
                  const isSelected = selectedConversation === conversationId;

                  return (
                    <div
                      key={conversationId}
                      onClick={() => setSelectedConversation(conversationId)}
                      className={`p-4 border-b cursor-pointer hover:bg-surface-deep ${
                        isSelected ? 'bg-amber-50 border-l-4 border-l-amber-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-surface-deep rounded-full flex items-center justify-center">
                          {conv.artisan.profile_image ? (
                            <img
                              src={conv.artisan.profile_image}
                              alt={conv.artisan.display_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-primary truncate">
                              {isArtisan ? 'Customer' : conv.artisan.display_name}
                            </h3>
                            {conv.unreadCount > 0 && (
                              <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-secondary truncate">{conv.lastMessage.message}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted text-right">
                        {formatTime(conv.lastMessage.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-deep rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-muted" />
                    </div>
                    <h3 className="font-semibold text-primary">
                      {isArtisan
                        ? 'Customer'
                        : conversations.find(c => c.artisan.id === selectedConversation)?.artisan.display_name}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100% - 140px)' }}>
                  {messages.map((msg) => {
                    const isOwn = isArtisan
                      ? msg.sender_type === 'artisan'
                      : msg.sender_type === 'customer';

                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-amber-600 text-white'
                              : 'bg-surface-deep text-primary'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-amber-100' : 'text-muted'
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 p-3 border rounded-lg"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
