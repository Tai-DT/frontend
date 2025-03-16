"use client"
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import LogoDisplay from './LogoDisplay';
import { PhoneIcon } from '@heroicons/react/24/solid';

interface ChatLogo {
  id: number;
  documentId: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface ChatItem {
  id: number;
  documentId: string;
  name: string;
  id_sdt: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  logo: ChatLogo | null;
}

interface StrapiResponse {
  data: ChatItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const ChatWidget: React.FC = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<StrapiResponse>('/api/chats?populate=*');
        setChats(response.data.data);
      } catch (error) {
        console.error("Error fetching chat options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chat: ChatItem) => {
    if (chat.name.toLowerCase() === 'phone') {
      window.location.href = `tel:${chat.id_sdt}`;
    } else if (chat.name.toLowerCase() === 'zalo') {
      window.open(`https://zalo.me/${chat.id_sdt}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="w-12 h-12 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">
          <PhoneIcon className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {expanded ? (
        <div className="flex flex-col gap-2 mb-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center w-12 h-12"
              aria-label={`Chat with ${chat.name}`}
            >
              {chat.logo ? (
                <LogoDisplay companyName={chat.logo.company} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-xs font-semibold">{chat.name}</span>
              )}
            </button>
          ))}
        </div>
      ) : null}
      
      <button 
        onClick={() => setExpanded(!expanded)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center w-14 h-14"
        aria-label={expanded ? "Close chat options" : "Open chat options"}
      >
        <PhoneIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatWidget;
