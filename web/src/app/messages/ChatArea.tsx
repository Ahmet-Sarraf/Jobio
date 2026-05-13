'use client';

import { Send, Ban, Check, CheckCheck, Trash2 } from 'lucide-react';
import { RefObject } from 'react';

interface ChatAreaProps {
  activeChat: any;
  setActiveChat: (chat: any) => void;
  messages: any[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleBlockConversation: () => void;
  handleDeleteConversation: () => void;
  isFreelancer: boolean;
  user: any;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatArea({
  activeChat,
  setActiveChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleBlockConversation,
  handleDeleteConversation,
  isFreelancer,
  user,
  messagesEndRef
}: ChatAreaProps) {
  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="bg-white border-[4px] border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
          <h2 className="text-3xl font-black uppercase mb-2 text-black">Mesaj Seç</h2>
          <p className="font-bold text-xl text-gray-700">Başlamak için soldan bir sohbet seçin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full sm:w-2/3 flex flex-col ${!activeChat ? 'hidden sm:flex' : 'flex'} relative`}>
      {/* Header */}
      <div className="p-4 bg-white border-b-[4px] border-black flex items-center justify-between z-10 shadow-brutal-sm">
        <div className="flex items-center gap-3">
          <button className="sm:hidden font-black border-2 border-black px-2 py-1 bg-brutal-yellow" onClick={() => setActiveChat(null)}>GERİ</button>
          <h3 className="text-2xl font-black uppercase truncate text-black">
            {isFreelancer ? activeChat.customer?.user?.name : activeChat.freelancer?.user?.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (window.confirm('Bu sohbeti tamamen silmek istediğinize emin misiniz?')) {
                handleDeleteConversation();
              }
            }}
            className="flex items-center gap-2 bg-red-600 text-white border-[3px] border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            title="Sohbeti Sil"
          >
            <Trash2 className="w-5 h-5" strokeWidth={3} />
          </button>
          
          {!activeChat.isBlocked && (
            <button 
              onClick={handleBlockConversation}
              className="flex items-center gap-2 bg-red-500 text-white border-[3px] border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <Ban className="w-5 h-5" strokeWidth={3} /> Engelle
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100">
        {messages.map((msg) => {
          const isSentByMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] relative">
                <div 
                  className={`px-5 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-lg leading-relaxed whitespace-pre-wrap
                    ${isSentByMe ? 'bg-brutal-green text-black' : 'bg-white text-black'}`}
                  style={{ borderRadius: isSentByMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px' }}
                >
                  {msg.content}
                  
                  <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mt-1 items-center space-x-1`}>
                    <span className="text-[10px] uppercase font-black opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isSentByMe && (
                      msg.isRead ? (
                        <CheckCheck className="w-4 h-4 text-black" strokeWidth={3} />
                      ) : (
                        <Check className="w-4 h-4 text-black opacity-60" strokeWidth={3} />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {activeChat.isBlocked ? (
        <div className="p-6 bg-gray-200 border-t-[4px] border-black flex items-center justify-center">
          <div className="bg-white border-[4px] border-black p-4 font-black uppercase text-xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Bu sohbet engellendi / Mesaj gönderilemez
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t-[4px] border-black flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Bir mesaj yaz..."
            className="flex-1 bg-white border-[3px] border-black p-4 font-bold text-lg outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-brutal-blue text-white border-[3px] border-black px-6 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
          >
            Gönder <Send className="w-5 h-5" strokeWidth={3} />
          </button>
        </form>
      )}
    </div>
  );
}
