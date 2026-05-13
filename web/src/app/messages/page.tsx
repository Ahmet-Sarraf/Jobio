'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { getSocketAsync, disconnectSocket } from '@/lib/socket';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';

export default function MessagesPage() {
  const { user, token, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Data Fetching
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data);
      } catch (error) {
        console.error('Sohbetler alınamadı', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [isAuthenticated, token, _hasHydrated, router]);

  // 2. Socket Lifecycle & Message Handling
  useEffect(() => {
    if (!token || !isAuthenticated || !_hasHydrated) return;

    let activeSocket: any = null;

    const setupSocket = async () => {
      activeSocket = await getSocketAsync(token);
      if (!activeSocket) return;

      if (!activeSocket.connected) activeSocket.connect();

      activeSocket.on('receive_message', onReceiveMessage);
      activeSocket.on('messages_read', onMessagesRead);
    };

    const onReceiveMessage = (message: any) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });

      setConversations((prev) => prev.map(conv => {
        if (conv.id === message.conversationId) {
          return { ...conv, messages: [message] };
        }
        return conv;
      }));

      // If this message belongs to the current active chat, mark as read
      if (activeChat?.id === message.conversationId) {
        activeSocket?.emit('read_messages', message.conversationId);
      }
    };

    const onMessagesRead = ({ conversationId, readBy }: any) => {
      setMessages((prev) => prev.map(msg =>
        msg.conversationId === conversationId && msg.senderId !== readBy
          ? { ...msg, isRead: true }
          : msg
      ));
    };

    const onSocketError = (err: any) => {
      console.error('Socket hatası:', err);
      alert(`Soket hatası: ${err.message || JSON.stringify(err)}`);
    };

    setupSocket().then(() => {
      if (activeSocket) {
        activeSocket.on('error', onSocketError);
      }
    });

    return () => {
      if (activeSocket) {
        activeSocket.off('receive_message', onReceiveMessage);
        activeSocket.off('messages_read', onMessagesRead);
        activeSocket.off('error', onSocketError);
      }
    };
  }, [token, isAuthenticated, _hasHydrated, activeChat?.id]);

  // 3. Room Management (Join/Leave on activeChat change)
  useEffect(() => {
    if (!activeChat || !token) return;

    let activeSocket: any = null;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${activeChat.id}/messages`);
        setMessages(res.data);

        activeSocket = await getSocketAsync(token);
        if (activeSocket) {
          activeSocket.emit('join_conversation', activeChat.id);
          activeSocket.emit('read_messages', activeChat.id);
        }
      } catch (error) {
        console.error('Mesajlar alınamadı', error);
      }
    };

    fetchMessages();

    return () => {
      if (activeSocket) {
        activeSocket.emit('leave_conversation', activeChat.id);
      } else {
        // Fallback for fast unmount
        getSocketAsync(token).then(s => s?.emit('leave_conversation', activeChat.id));
      }
    };
  }, [activeChat?.id, token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !token) return;

    if (activeChat.isBlocked) {
      alert('Bu sohbet engellendi.');
      return;
    }

    const socket = await getSocketAsync(token);
    if (socket) {
      socket.emit('send_message', {
        conversationId: activeChat.id,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleBlockConversation = async () => {
    if (!activeChat) return;
    try {
      await api.post(`/chat/conversations/${activeChat.id}/block`);
      setActiveChat({ ...activeChat, isBlocked: true });
      setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, isBlocked: true } : c));
      alert('Sohbet engellendi.');
    } catch (error) {
      console.error('Sohbet engellenemedi', error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeChat) return;
    try {
      await api.delete(`/chat/conversations/${activeChat.id}`);
      setConversations(prev => prev.filter(c => c.id !== activeChat.id));
      setActiveChat(null);
      alert('Sohbet başarıyla silindi.');
    } catch (error) {
      console.error('Sohbet silinemedi', error);
      alert('Sohbet silinirken bir hata oluştu.');
    }
  };

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-brutal-bg flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-black border-t-brutal-pink"></div>
      </div>
    );
  }

  const isFreelancer = user?.role === 'FREELANCER' || (user as any)?.user_metadata?.user_role === 'FREELANCER';

  return (
    <div className="h-[calc(100vh-76px)] bg-white flex overflow-hidden">
      <ChatSidebar 
        conversations={conversations} 
        activeChat={activeChat} 
        setActiveChat={setActiveChat} 
        isFreelancer={isFreelancer} 
      />
      <ChatArea 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleBlockConversation={handleBlockConversation}
        handleDeleteConversation={handleDeleteConversation}
        isFreelancer={isFreelancer}
        user={user}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
