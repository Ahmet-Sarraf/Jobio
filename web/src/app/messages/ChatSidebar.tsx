'use client';

import { User as UserIcon } from 'lucide-react';

interface ChatSidebarProps {
  conversations: any[];
  activeChat: any;
  setActiveChat: (chat: any) => void;
  isFreelancer: boolean;
}

export default function ChatSidebar({ conversations, activeChat, setActiveChat, isFreelancer }: ChatSidebarProps) {
  return (
    <div className={`w-full sm:w-1/3 border-r-[4px] border-black flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
      <div className="p-6 bg-brutal-yellow border-b-[4px] border-black">
        <h2 className="text-3xl font-black uppercase text-black">Mesajlar</h2>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 font-bold uppercase">Hiç sohbetin yok.</div>
        ) : (
          conversations.map((conv) => {
            const otherUser = isFreelancer ? conv.customer?.user : conv.freelancer?.user;
            const lastMsg = conv.messages?.[0];
            return (
              <button
                key={conv.id}
                onClick={() => setActiveChat(conv)}
                className={`w-full text-left p-4 border-b-[3px] border-black hover:bg-brutal-pink transition-colors ${activeChat?.id === conv.id ? 'bg-brutal-pink' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                    {otherUser?.avatarUrl ? (
                       <img src={otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                       <UserIcon className="text-white w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-black text-lg truncate text-black">{otherUser?.name || 'Bilinmeyen Kullanıcı'}</div>
                    <div className="text-sm font-bold text-gray-600 truncate">
                      {lastMsg ? lastMsg.content : 'Henüz mesaj yok...'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
