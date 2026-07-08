"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/app/dashboard/_lib/api";
import { Search, Calendar as CalendarIcon, Trash2, X, MessageSquare, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ChatHistoryPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/livechat/admin/conversations/");
      setConversations(data || []);
    } catch (err) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchMessages = async (chat, start = "", end = "") => {
    if (!chat) return;
    setMessagesLoading(true);
    try {
      const params = { user1_id: chat.user1_id, user2_id: chat.user2_id };
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      
      const data = await api.get("/api/livechat/admin/messages/", params);
      setMessages(data || []);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat, startDate, endDate);
    }
  }, [selectedChat, startDate, endDate]);

  const handleDelete = async () => {
    if (!selectedChat) return;
    setIsDeleting(true);
    try {
      const params = { user1_id: selectedChat.user1_id, user2_id: selectedChat.user2_id };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      await api.delete("/api/livechat/admin/messages/", { params });
      toast.success("Messages deleted successfully");
      setDeleteModalOpen(false);
      
      // Refresh
      fetchMessages(selectedChat, startDate, endDate);
      fetchConversations();
    } catch (err) {
      toast.error(err.message || "Failed to delete messages");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.user1_name.toLowerCase().includes(search.toLowerCase()) || 
    c.user2_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Message Data Store</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all chat conversations between staff and users.</p>
        </div>
        <button 
          onClick={fetchConversations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#00694C] focus:ring-1 focus:ring-[#00694C] transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-[#00694C] animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map(chat => (
                  <button 
                    key={chat.id}
                    onClick={() => { setSelectedChat(chat); setStartDate(""); setEndDate(""); setIsDatePickerOpen(false); }}
                    className={`w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-all cursor-pointer ${selectedChat?.id === chat.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <div className="flex items-center flex-shrink-0">
                          {chat.user1_image ? (
                            <img src={chat.user1_image} alt={chat.user1_name} className="w-6 h-6 rounded-full border border-slate-200 object-cover bg-slate-100 z-10" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-200 bg-[#00694C] text-white flex items-center justify-center text-[10px] font-bold z-10">
                              {chat.user1_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className="w-2 h-[1px] bg-slate-300 mx-0.5 rounded-full"></div>
                          {chat.user2_image ? (
                            <img src={chat.user2_image} alt={chat.user2_name} className="w-6 h-6 rounded-full border border-slate-200 object-cover bg-slate-100 z-10" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-600 text-white flex items-center justify-center text-[10px] font-bold z-10">
                              {chat.user2_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm truncate">
                          {chat.user1_name} & {chat.user2_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5">
                        {chat.total_messages} msgs
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{chat.last_message}</p>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {new Date(chat.last_message_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Chat details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[70vh] relative overflow-hidden">
          {selectedChat ? (
            <>
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 z-10 gap-2">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="flex items-center flex-shrink-0">
                    {selectedChat.user1_image ? (
                      <img src={selectedChat.user1_image} alt={selectedChat.user1_name} className="w-8 h-8 rounded-full border-2 border-slate-100 object-cover bg-slate-100 shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-100 bg-[#00694C] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {selectedChat.user1_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="w-4 h-[1.5px] bg-slate-300 mx-1.5 rounded-full"></div>
                    {selectedChat.user2_image ? (
                      <img src={selectedChat.user2_image} alt={selectedChat.user2_name} className="w-8 h-8 rounded-full border-2 border-slate-100 object-cover bg-slate-100 shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-100 bg-slate-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {selectedChat.user2_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-800 text-sm truncate leading-tight">
                      {selectedChat.user1_name} & {selectedChat.user2_name}
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate leading-tight">Conversation history</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <button 
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${startDate || endDate ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <CalendarIcon size={14} className={startDate || endDate ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="hidden sm:inline-block">
                        {startDate || endDate ? 'Dates Set' : 'Filter'}
                      </span>
                      {(startDate || endDate) && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); setStartDate(""); setEndDate(""); setIsDatePickerOpen(false); }}
                          className="ml-1 p-0.5 hover:bg-emerald-200 hover:text-emerald-900 rounded-full transition-colors cursor-pointer"
                          title="Clear Dates"
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>

                    {isDatePickerOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">Filter by Date</h4>
                          <div className="space-y-3">
                            <label className="block cursor-pointer group">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1 group-hover:text-slate-700 transition-colors">Start Date</span>
                              <div className="relative">
                                <CalendarIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#00694C] transition-colors" />
                                <input 
                                  type="date" 
                                  value={startDate} 
                                  onChange={e => setStartDate(e.target.value)}
                                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                  className="w-full text-xs pl-7 pr-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00694C] focus:ring-1 focus:ring-[#00694C] bg-slate-50 cursor-pointer transition-colors group-hover:border-[#00694C]/40 group-hover:bg-emerald-50/30" 
                                />
                              </div>
                            </label>
                            <label className="block cursor-pointer group">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1 group-hover:text-slate-700 transition-colors">End Date</span>
                              <div className="relative">
                                <CalendarIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#00694C] transition-colors" />
                                <input 
                                  type="date" 
                                  value={endDate} 
                                  min={startDate} 
                                  onChange={e => setEndDate(e.target.value)}
                                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                  className="w-full text-xs pl-7 pr-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00694C] focus:ring-1 focus:ring-[#00694C] bg-slate-50 cursor-pointer transition-colors group-hover:border-[#00694C]/40 group-hover:bg-emerald-50/30" 
                                />
                              </div>
                            </label>
                            <button 
                              onClick={() => setIsDatePickerOpen(false)} 
                              className="w-full mt-1 py-2 bg-[#00694C] text-white text-xs font-bold rounded-lg hover:bg-[#00523b] transition-colors shadow-sm cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={messages.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-red-100 shadow-sm cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline-block">Delete</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 text-[#00694C] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-slate-500">
                    <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
                    <p>{startDate || endDate ? "No messages found for this date range." : "No messages found."}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map(msg => {
                      const isUser1 = msg.sender_id === selectedChat.user1_id;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isUser1 ? 'items-start' : 'items-end'}`}>
                          <span className="text-[10px] text-slate-500 mb-1 ml-1">{msg.sender_name}</span>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isUser1 ? 'bg-white text-slate-800 border border-slate-100 rounded-bl-none' : 'bg-[#00694C] text-white rounded-br-none'}`}>
                            <p className="break-words">{msg.text}</p>
                            <div className={`text-[9px] mt-1 text-right ${isUser1 ? 'text-slate-400' : 'text-emerald-100'}`}>
                              {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100 shadow-sm">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">Select a conversation</p>
              <p className="text-sm mt-1">Choose a chat from the left panel to view messages.</p>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModalOpen && selectedChat && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold">Delete Chat History</h3>
                </div>
                
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Are you sure you want to delete messages between <strong className="text-slate-800">{selectedChat.user1_name}</strong> and <strong className="text-slate-800">{selectedChat.user2_name}</strong>?
                  {startDate || endDate ? (
                    <span className="block mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-md text-amber-800">
                      Only messages from <strong>{startDate || "the beginning"}</strong> to <strong>{endDate || "now"}</strong> will be deleted.
                    </span>
                  ) : (
                    <span className="block mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-md text-red-800">
                      <strong>WARNING:</strong> This will delete ALL messages in this conversation. This action cannot be undone.
                    </span>
                  )}
                </p>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    {isDeleting ? "Deleting..." : "Delete Messages"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
