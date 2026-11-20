"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Heart, MessageCircle, Sparkles, Send, X } from "lucide-react";
import { UserProfile } from "@/lib/types";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile | null;
  matchedProfile: UserProfile | null;
  matchId?: string;
  onOpenChat: (matchId: string) => void;
}

export function MatchModal({
  isOpen,
  onClose,
  currentUserProfile,
  matchedProfile,
  matchId = "match_1",
  onOpenChat,
}: MatchModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire brand-colored confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF3D81", "#FFE45C", "#CBF4E0", "#E7E0FF"],
      });
    }
  }, [isOpen]);

  if (!isOpen || !matchedProfile) return null;

  const currentPhoto = currentUserProfile?.photos?.[0];
  const matchedPhoto = matchedProfile.photos?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121D]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-3 border-coy-dark shadow-pop-xl p-6 sm:p-8 text-center select-none">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-coy-dark bg-[#F6F4FA] flex items-center justify-center text-coy-dark hover:bg-white shadow-pop-sm"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-coy-yellow border-2 border-coy-dark font-black text-xs shadow-pop-sm mb-4 -rotate-2">
          <Sparkles className="w-4 h-4 text-coy-dark fill-coy-dark" />
          <span>MUTUAL ATTRACTION</span>
        </div>

        <h2 className="text-4xl font-black text-coy-dark tracking-tight mb-2">
          It's a Match!
        </h2>
        <p className="text-sm font-semibold text-coy-muted mb-8">
          You and <span className="text-coy-dark font-extrabold">{matchedProfile.name}</span> liked each other.
        </p>

        {/* Overlapping Avatar Circles */}
        <div className="relative flex items-center justify-center mb-8 h-28">
          <div className="w-24 h-24 rounded-full border-3 border-coy-dark shadow-pop-md overflow-hidden bg-coy-yellow absolute left-1/2 -translate-x-16 z-10 rotate-[-6deg] flex items-center justify-center font-black text-2xl text-coy-dark">
            {currentPhoto ? (
              <img src={currentPhoto} alt="You" className="w-full h-full object-cover" />
            ) : (
              <span>{currentUserProfile?.name?.charAt(0) || "U"}</span>
            )}
          </div>

          <div className="w-24 h-24 rounded-full border-3 border-coy-dark shadow-pop-md overflow-hidden bg-coy-mint absolute left-1/2 -translate-x-4 z-20 rotate-[6deg] flex items-center justify-center font-black text-2xl text-coy-dark">
            {matchedPhoto ? (
              <img src={matchedPhoto} alt={matchedProfile.name} className="w-full h-full object-cover" />
            ) : (
              <span>{matchedProfile.name.charAt(0)}</span>
            )}
          </div>

          {/* Floating Heart Sticker */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-30 w-10 h-10 rounded-full bg-coy-pink border-2 border-coy-dark shadow-pop-sm flex items-center justify-center">
            <Heart className="w-5 h-5 fill-coy-dark text-coy-dark" />
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3">
          {/* In-App Direct Chat */}
          <button
            onClick={() => {
              onOpenChat(matchId);
              onClose();
            }}
            className="w-full btn-coy py-3.5 px-4 text-sm font-black bg-coy-pink text-coy-dark border-2 border-coy-dark shadow-pop flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Send First Message to {matchedProfile.name}</span>
          </button>

          {/* WhatsApp Direct Connect */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hey ${matchedProfile.name}! We matched on Sparks 😊`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-coy btn-coy-whatsapp py-3 px-4 text-xs font-black border-2 border-coy-dark shadow-pop flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Say Hey on WhatsApp</span>
          </a>

          {/* Keep Swiping */}
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-extrabold text-coy-muted hover:text-coy-dark transition-colors"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
