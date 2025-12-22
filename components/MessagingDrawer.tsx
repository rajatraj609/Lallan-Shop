import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { getMessages, sendMessage, markMessageAsRead, endDiscussion, getUsers, getCurrentUser } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const MessagingDrawer: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableRecipients, setAvailableRecipients] = useState<User[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        loadData();
        const interval = setInterval(loadData, 3000); // Poll for new messages
        return () => clearInterval(interval);
    }
  }, [isOpen, selectedRecipientId]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const loadData = () => {
      const allMsgs = getMessages();
      setMessages(allMsgs);

      // Filter Users for "New Chat" based on Role Logic
      const allUsers = getUsers();
      let targets: User[] = [];

      if (currentUser.role === UserRole.ADMIN) {
          targets = allUsers.filter(u => u.id !== currentUser.id);
      } else if (currentUser.role === UserRole.MANUFACTURER) {
          targets = allUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SELLER);
      } else if (currentUser.role === UserRole.SELLER) {
          targets = allUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.MANUFACTURER || u.role === UserRole.BUYER); 
          // Note: Logic says Seller replies only to Buyer, but usually needs to see them to reply. 
          // We'll list Buyers who have messaged first? Or allows initiating? 
          // Prompt says "Reply-only to Buyers". 
          // We will filter Buyers out of "New Chat" list if no existing chat? 
          // For simplicity, we allow initiating to Admin/Mfg, and Buyers show up in "Active Chats" list.
          
          // Strict interpretation: Seller can message Admin or Mfg.
          // Buyers only if they messaged first (handled by conversation list logic below)
      } else if (currentUser.role === UserRole.BUYER) {
          targets = allUsers.filter(u => u.role === UserRole.ADMIN);
      }
      setAvailableRecipients(targets);
  };

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || !selectedRecipientId) return;

      const recipient = getUsers().find(u => u.id === selectedRecipientId);
      if (!recipient) return;

      const newMessage: Message = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: recipient.id,
          receiverName: recipient.name,
          text: inputText,
          timestamp: new Date().toISOString(),
          isRead: false
      };

      sendMessage(newMessage);
      setInputText('');
      loadData();
  };

  const handleEndDiscussion = () => {
      if (selectedRecipientId && confirm("Archive this discussion?")) {
          endDiscussion(currentUser.id, selectedRecipientId);
          loadData();
          setSelectedRecipientId(null);
      }
  };

  // Group messages by conversation partner
  const getConversations = () => {
      const convos = new Set<string>();
      messages.forEach(m => {
          if (m.senderId === currentUser.id) convos.add(m.receiverId);
          if (m.receiverId === currentUser.id) convos.add(m.senderId);
      });
      
      return Array.from(convos).map(partnerId => {
          const partner = getUsers().find(u => u.id === partnerId);
          const lastMsg = messages.filter(m => 
              (m.senderId === currentUser.id && m.receiverId === partnerId) || 
              (m.receiverId === currentUser.id && m.senderId === partnerId)
          ).sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];

          const unreadCount = messages.filter(m => m.receiverId === currentUser.id && m.senderId === partnerId && !m.isRead).length;
          
          return {
              partner,
              lastMsg,
              unreadCount
          };
      }).filter(c => c.partner && (!c.lastMsg.isClosed || c.partner.role === UserRole.ADMIN)); // Keep admin chats visible? Or hide closed.
  };

  const activeChatMessages = selectedRecipientId 
      ? messages.filter(m => 
          (m.senderId === currentUser.id && m.receiverId === selectedRecipientId) || 
          (m.receiverId === currentUser.id && m.senderId === selectedRecipientId)
        ).sort((a,b) => a.timestamp.localeCompare(b.timestamp))
      : [];
      
  const isChatClosed = activeChatMessages.length > 0 && activeChatMessages[activeChatMessages.length - 1].isClosed;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-4xl h-full bg-neutral-900 border-l border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Sidebar: Conversations */}
            <div className="w-full md:w-80 border-r border-white/5 bg-neutral-950 flex flex-col">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-neutral-900">
                    <h2 className="font-display font-bold text-white">Messages</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {getConversations().map(c => (
                        <button 
                            key={c.partner?.id}
                            onClick={() => { setSelectedRecipientId(c.partner!.id); }}
                            className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selectedRecipientId === c.partner?.id ? 'bg-white/10' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-white text-sm">{c.partner?.name}</span>
                                {c.unreadCount > 0 && <span className="bg-red-600 text-white text-[10px] px-1.5 rounded-full">{c.unreadCount}</span>}
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-xs text-neutral-500 truncate max-w-[140px]">{c.lastMsg?.text}</p>
                                <span className="text-[10px] text-neutral-600 border border-white/10 px-1 rounded">{c.partner?.role}</span>
                            </div>
                        </button>
                    ))}
                    
                    {getConversations().length === 0 && (
                        <div className="p-8 text-center text-neutral-600 text-sm">No active discussions.</div>
                    )}
                </div>

                {/* New Chat Button */}
                <div className="p-4 border-t border-white/5 bg-neutral-900">
                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wide">Start New Chat</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {availableRecipients.map(u => (
                            <button 
                                key={u.id}
                                onClick={() => setSelectedRecipientId(u.id)}
                                className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 border border-white/10 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-xs font-bold"
                                title={`Message ${u.name} (${u.role})`}
                            >
                                {u.name.charAt(0)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-900/50 relative">
                {selectedRecipientId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur">
                            <div>
                                <h3 className="text-white font-bold">{getUsers().find(u => u.id === selectedRecipientId)?.name}</h3>
                                <span className="text-xs text-neutral-500">{getUsers().find(u => u.id === selectedRecipientId)?.role}</span>
                            </div>
                            {!isChatClosed && (
                                <button 
                                  onClick={handleEndDiscussion}
                                  className="text-xs bg-red-900/30 text-red-400 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    End Discussion
                                </button>
                            )}
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {activeChatMessages.map(msg => {
                                const isMe = msg.senderId === currentUser.id;
                                if (!isMe && !msg.isRead) markMessageAsRead(msg.id); // Auto read

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                            isMe 
                                            ? 'bg-white text-black rounded-tr-none' 
                                            : 'bg-neutral-800 text-neutral-200 border border-white/10 rounded-tl-none'
                                        }`}>
                                            <p>{msg.text}</p>
                                            <span className={`text-[9px] block mt-1 ${isMe ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {isChatClosed && (
                                <div className="text-center py-4">
                                    <span className="text-xs text-neutral-600 bg-neutral-950 px-3 py-1 rounded-full">Discussion Archived</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        {!isChatClosed ? (
                            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-neutral-900 flex gap-2">
                                <input 
                                    type="text"
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                />
                                <button type="submit" className="px-4 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        ) : (
                            <div className="p-4 bg-neutral-950 border-t border-white/10 text-center text-sm text-neutral-500">
                                This conversation has ended.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600">
                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p>Select a contact to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MessagingDrawer;