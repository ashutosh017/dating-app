"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatView } from "@/components/ChatView";
import { AuthModal } from "@/components/AuthModal";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserProfile, MatchItem } from "@/lib/types";
import { MessageCircle, Sparkles, Heart, ArrowRight, Clock, Flame } from "lucide-react";
import Link from "next/link";

function MatchesContent() {
  const { user, signInWithGoogle } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatProfile, setActiveChatProfile] = useState<UserProfile | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // Fetch real matches for this user via async callback
  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    fetch(`/api/matches?userId=${user.uid}`)
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((data) => {
        if (isMounted) {
          setMatches(data.matches || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load matches:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const refreshMatches = () => {
    if (!user) return;
    fetch(`/api/matches?userId=${user.uid}`)
      .then((res) => (res.ok ? res.json() : { matches: [] }))
      .then((data) => setMatches(data.matches || []))
      .catch((err) => console.error("Failed to refresh matches:", err));
  };

  const handleOpenChat = async (match: MatchItem) => {
    try {
      const res = await fetch(`/api/profile?userId=${match.user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setActiveChatProfile(data.profile);
          setActiveMatchId(match.id);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch full profile for chat, using card info:", e);
    }

    const fallbackProfile: UserProfile = {
      id: match.user.id,
      userId: match.user.id,
      name: match.user.name,
      age: match.user.age,
      gender: "unspecified",
      sexualOrientation: "straight",
      interestedIn: ["everyone"],
      bio: "",
      address: match.user.address,
      photos: match.user.photos,
      interests: [],
    };
    setActiveChatProfile(fallbackProfile);
    setActiveMatchId(match.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4FA]">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} unreadCount={0} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col pb-24 sm:pb-8">
        {activeChatProfile && activeMatchId ? (
          <ChatView
            matchId={activeMatchId}
            matchedProfile={activeChatProfile}
            onBack={() => {
              setActiveChatProfile(null);
              setActiveMatchId(null);
              refreshMatches();
            }}
          />
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coy-mint text-[#0E8F48] border-2 border-coy-dark font-black text-xs shadow-pop-sm mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mutual Connections
                </div>
                <h1 className="text-3xl font-black text-coy-dark tracking-tight">
                  Your Matches
                </h1>
                <p className="text-xs font-semibold text-coy-muted mt-1">
                  When you both like each other, conversations unlock here.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="w-full py-16 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-coy-dark border-t-coy-pink rounded-full animate-spin mb-2" />
                <span className="text-xs font-bold text-coy-muted">Loading matches...</span>
              </div>
            ) : !user ? (
              <div className="bg-white rounded-3xl border-3 border-coy-dark shadow-pop-lg p-8 text-center my-6">
                <div className="w-14 h-14 rounded-2xl bg-coy-yellow border-2 border-coy-dark shadow-pop flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-coy-dark fill-coy-dark" />
                </div>
                <h3 className="text-xl font-black text-coy-dark mb-2">
                  Sign in to view your matches
                </h3>
                <p className="text-xs font-medium text-coy-muted max-w-xs mx-auto mb-6">
                  Sign in with Google to start matching with people around you.
                </p>
                <button
                  onClick={() => {
                    void signInWithGoogle();
                  }}
                  className="btn-coy px-6 py-2.5 bg-coy-pink text-coy-dark text-xs font-black shadow-pop inline-block cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            ) : matches.length === 0 ? (
              /* Genuine Empty State */
              <div className="bg-white rounded-3xl border-3 border-coy-dark shadow-pop-lg p-8 text-center my-6">
                <div className="w-14 h-14 rounded-2xl bg-[#FFE4EF] border-2 border-coy-dark shadow-pop flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-coy-pink stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-coy-dark mb-2">
                  No matches yet
                </h3>
                <p className="text-xs font-medium text-coy-muted max-w-xs mx-auto mb-6 leading-relaxed">
                  Start swiping on profiles in Discover. When you both like each other, you can message here instantly!
                </p>
                <Link
                  href="/"
                  className="btn-coy px-6 py-2.5 bg-coy-pink text-coy-dark text-xs font-black shadow-pop inline-flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>Explore Profiles</span>
                </Link>
              </div>
            ) : (
              <div>
                {/* Horizontal Matches Avatars Tray */}
                <div className="mb-6">
                  <h2 className="text-xs font-black uppercase tracking-wider text-coy-dark mb-3">
                    Recent Matches
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => handleOpenChat(match)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
                      >
                        <div className="relative w-16 h-16 rounded-full border-3 border-coy-dark bg-coy-yellow overflow-hidden shadow-pop-sm group-hover:scale-105 active:scale-95 transition-transform">
                          {match.user.photos?.[0] ? (
                            <img
                              src={match.user.photos[0]}
                              alt={match.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-lg text-coy-dark">
                              {match.user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-black text-coy-dark">
                          {match.user.name.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Messages List */}
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-coy-dark mb-3">
                    Conversations
                  </h2>
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => handleOpenChat(match)}
                        className="w-full bg-white rounded-2xl border-2 border-coy-dark shadow-pop p-3.5 flex items-center gap-3.5 cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-pop-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                      >
                        <div className="relative w-14 h-14 rounded-2xl border-2 border-coy-dark bg-[#FFE45C] overflow-hidden flex-shrink-0 shadow-pop-sm">
                          {match.user.photos?.[0] ? (
                            <img
                              src={match.user.photos[0]}
                              alt={match.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-coy-dark">
                              {match.user.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-sm text-coy-dark truncate">
                              {match.user.name}
                              {match.user.age > 0 && `, ${match.user.age}`}
                            </h3>
                            <span className="text-[10px] font-bold text-coy-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(match.matchedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>

                          <p className="text-xs text-coy-muted font-medium truncate mt-0.5">
                            {match.lastMessage
                              ? match.lastMessage.content
                              : `Say hello to ${match.user.name.split(" ")[0]}!`}
                          </p>

                          {match.user.address && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="badge-sticker bg-[#D7ECFF] text-coy-dark text-[10px] py-0 px-2">
                                {match.user.address}
                              </span>
                            </div>
                          )}
                        </div>

                        <ArrowRight className="w-4 h-4 text-coy-dark stroke-[2.5] flex-shrink-0 mr-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={refreshMatches} />
    </div>
  );
}

export default function MatchesPage() {
  return (
    <AuthProvider>
      <MatchesContent />
    </AuthProvider>
  );
}
