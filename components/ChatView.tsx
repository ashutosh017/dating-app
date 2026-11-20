"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, CheckCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage, UserProfile } from "@/lib/types";
import { getPusherClient } from "@/lib/pusher/client";

interface ChatViewProps {
  matchId: string;
  matchedProfile: UserProfile;
  onBack: () => void;
}

export function ChatView({ matchId, matchedProfile, onBack }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load real conversation history from DB
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/messages?matchId=${matchId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [matchId]);

  // Pusher Realtime Subscription with proper deduplication & unbind
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `match-${matchId}`;
    const channel = pusher.subscribe(channelName);

    const handleNewMessage = (data: ChatMessage) => {
      setMessages((prev) => {
        // 1. Direct ID deduplication
        if (prev.some((m) => m.id === data.id)) {
          return prev;
        }

        // 2. Optimistic match: if this is our own message and we have an identical pending message
        const pendingIndex = prev.findIndex(
          (m) =>
            m.senderId === data.senderId &&
            m.content === data.content &&
            (m.id === data.id || Math.abs(new Date(m.createdAt).getTime() - new Date(data.createdAt).getTime()) < 5000)
        );

        if (pendingIndex !== -1) {
          // Replace optimistic placeholder with real confirmed message
          const updated = [...prev];
          updated[pendingIndex] = data;
          return updated;
        }

        // 3. New message from match partner: append to thread
        return [...prev, data];
      });
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusher.unsubscribe(channelName);
    };
  }, [matchId, user?.uid]);

  // Auto-scroll on message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const messageText = inputText.trim();
    // Unique client-side ID with timestamp and entropy
    const clientMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const outgoing: ChatMessage = {
      id: clientMsgId,
      matchId,
      senderId: user.uid,
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, outgoing]);
    setInputText("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clientMsgId,
          matchId,
          senderId: user.uid,
          content: messageText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          // Reconcile optimistic message with confirmed server message ID
          setMessages((prev) =>
            prev.map((m) => (m.id === clientMsgId ? data.message : m))
          );
        }
      }
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] max-h-[720px] w-full max-w-lg mx-auto bg-white rounded-3xl border-3 border-coy-dark shadow-pop-xl overflow-hidden select-none">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-coy-dark bg-[#F6F4FA]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border-2 border-coy-dark bg-white flex items-center justify-center hover:bg-coy-yellow transition-all shadow-pop-sm"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Matched Avatar & Status */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-coy-dark overflow-hidden bg-coy-yellow shadow-pop-sm">
              {matchedProfile.photos?.[0] ? (
                <img
                  src={matchedProfile.photos[0]}
                  alt={matchedProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-coy-dark">
                  {matchedProfile.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-coy-mint border border-coy-dark" />
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-coy-dark flex items-center gap-1.5">
              <span>{matchedProfile.name}</span>
              <span className="badge-sticker bg-coy-mint text-[#0E8F48] text-[9px] py-0 px-1.5">
                Matched
              </span>
            </h3>
            <p className="text-[11px] font-semibold text-coy-muted">
              {matchedProfile.profession || matchedProfile.address || "Online"}
            </p>
          </div>
        </div>

        {/* WhatsApp Quick Jump */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Hey ${matchedProfile.name}! Continuing our chat from Sparks 😊`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="badge-sticker bg-[#25D366] text-white hover:scale-105 transition-transform"
        >
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6F4FA]">
        {/* Match Announcement Header */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4EF] border border-coy-dark text-[11px] font-black text-coy-dark shadow-pop-sm">
            <Sparkles className="w-3.5 h-3.5 text-coy-pink fill-coy-pink" />
            <span>You matched with {matchedProfile.name}!</span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs font-bold text-coy-muted">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs font-medium text-coy-muted max-w-xs mx-auto">
            No messages sent yet. Break the ice and say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.uid === msg.senderId;
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border-2 border-coy-dark shadow-pop-sm leading-relaxed ${
                    isMe
                      ? "bg-coy-pink text-coy-dark rounded-br-none"
                      : "bg-white text-coy-dark rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-coy-muted px-1">
                  <span>{time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-[#0E8F48]" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t-2 border-coy-dark bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${matchedProfile.name}...`}
          className="flex-1 px-4 py-2.5 rounded-full border-2 border-coy-dark bg-[#F6F4FA] font-bold text-xs sm:text-sm text-coy-dark placeholder-coy-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-coy w-10 h-10 p-0 rounded-full bg-coy-pink text-coy-dark border-2 border-coy-dark shadow-pop flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
