"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Paperclip, Plus, X, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocket } from "@/hooks/useSocket";
import DOMPurify from "dompurify";

export default function ChatPage() {
  const { user } = useAuthStore();
  const userName = user?.name || user?.email || "User";
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [newConvParticipants, setNewConvParticipants] = useState("");
  const [newConvMessage, setNewConvMessage] = useState("");

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isTyping, setIsTyping] = useState(false);

  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery<any[]>({
    queryKey: ["conversations"],
    queryFn: api.getConversations,
  });

  const { data: messages = [], isLoading: isLoadingMsgs } = useQuery<any[]>({
    queryKey: ["messages", activeConvId],
    queryFn: () => api.getMessages(activeConvId!),
    enabled: !!activeConvId,
  });

  const sendMutation = useMutation({
    mutationFn: api.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setNewMessage("");
      setAttachmentFile(null);
    },
  });

  const createConvMutation = useMutation({
    mutationFn: api.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setShowNewConvModal(false);
      setNewConvParticipants("");
      setNewConvMessage("");
    },
  });

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    const handleNewConversation = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    socket.on("new-message", handleNewMessage);
    socket.on("new-conversation", handleNewConversation);
    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("new-conversation", handleNewConversation);
    };
  }, [socket, queryClient, activeConvId]);

  const activeConv = conversations.find((c: any) => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleTyping = useCallback((value: string) => {
    setNewMessage(value);
    if (value.length > 0) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    } else {
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachmentFile) return;
    if (!activeConvId) return;

    let content = newMessage.trim();
    if (attachmentFile) {
      content = content
        ? `${content} [attached: ${attachmentFile.name}]`
        : `[attached: ${attachmentFile.name}]`;
    }

    sendMutation.mutate({
      conversationId: activeConvId,
      sender: userName,
      content,
    });
  };

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    const participants = newConvParticipants
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (participants.length === 0) return;
    createConvMutation.mutate({
      participants,
      sender: userName,
      content: newConvMessage.trim(),
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="h-[calc(100vh-8rem)] font-sans flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="text-[#2563EB]" />
          Messages
        </h1>
        <p className="text-xs text-slate-400 mt-1">Direct messaging and conversations with campus community.</p>
      </div>

      <div className="flex-1 flex border border-[#e1e2ed] rounded-xl overflow-hidden bg-white shadow-sm min-h-0">
        {/* Conversations Sidebar */}
        <div className="w-72 border-r border-[#e1e2ed] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversations</span>
            <button
              onClick={() => setShowNewConvModal(true)}
              className="h-6 w-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-md transition-colors flex items-center justify-center cursor-pointer"
              title="New Conversation"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingConvs ? (
              <div className="p-3 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">No conversations yet.</p>
            ) : (
              conversations.map((conv: any) => {
                const otherParticipants = conv.participants.filter((p: string) => p !== userName);
                const displayName =
                  conv.participants.length > 2
                    ? otherParticipants.join(", ")
                    : otherParticipants[0] || conv.participants[0];
                const isGroup = conv.participants.length > 2;
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3 border-b border-[#e1e2ed] hover:bg-slate-50 transition-colors cursor-pointer ${
                      isActive ? "bg-[#2563EB]/5 border-l-2 border-l-[#2563EB]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs flex items-center gap-1.5 ${isActive ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}>
                        {isGroup && <Users size={12} className="text-[#2563EB] shrink-0" />}
                        {displayName}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#2563EB] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(conv.lastMessage || "") }} />
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                      {new Date(conv.lastMessageTime).toLocaleDateString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-semibold">Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-[#e1e2ed] bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                  {activeConv?.participants.length > 2 ? (
                    <Users size={14} />
                  ) : (
                    activeConv?.participants.find((p: string) => p !== userName)?.charAt(0) || "?"
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-700 block">
                    {activeConv?.participants.length > 2
                      ? activeConv.participants.filter((p: string) => p !== userName).join(", ")
                      : activeConv?.participants.find((p: string) => p !== userName) || "Unknown"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeConv?.participants.length > 2
                      ? `${activeConv.participants.length} members`
                      : "Online"}
                  </span>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {isLoadingMsgs ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <Skeleton className={`h-10 rounded-xl ${i % 2 === 0 ? "w-64 rounded-bl-sm" : "w-48 rounded-br-sm"}`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-slate-400">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.sender === userName;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[75%]">
                          <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-[#2563EB] text-white rounded-br-sm"
                              : "bg-white border border-[#e1e2ed] text-slate-700 rounded-bl-sm"
                          }`}>
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content || "") }} />
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-1 bg-slate-50/30 overflow-hidden"
                  >
                    <p className="text-[10px] text-slate-400 italic">typing...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attachment Preview */}
              {attachmentFile && (
                <div className="px-3 py-2 border-t border-[#e1e2ed] bg-slate-50 flex items-center gap-2">
                  <Paperclip size={12} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{attachmentFile.name}</span>
                  <button
                    onClick={removeAttachment}
                    className="h-4 w-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              {/* Send Message Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-[#e1e2ed] bg-white flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors flex items-center justify-center cursor-pointer shrink-0"
                  title="Attach file"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 h-10 px-4 bg-slate-50 border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !attachmentFile) || sendMutation.isPending}
                  className="h-10 w-10 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConvModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowNewConvModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-xl border border-[#e1e2ed] w-full max-w-md mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">New Conversation</span>
                <button
                  onClick={() => setShowNewConvModal(false)}
                  className="h-6 w-6 rounded-md hover:bg-slate-200 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleCreateConversation} className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Participants <span className="text-slate-400 font-normal">(comma separated)</span>
                  </label>
                  <textarea
                    value={newConvParticipants}
                    onChange={(e) => setNewConvParticipants(e.target.value)}
                    placeholder="e.g. john@example.com, jane@example.com"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">First Message</label>
                  <textarea
                    value={newConvMessage}
                    onChange={(e) => setNewConvMessage(e.target.value)}
                    placeholder="Type your first message..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewConvModal(false)}
                    className="h-9 px-4 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newConvParticipants.trim() || createConvMutation.isPending}
                    className="h-9 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    {createConvMutation.isPending ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
