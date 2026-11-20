"use client";

import React from "react";
import { Heart, Sparkles, X, ArrowRight } from "lucide-react";
import { LikeNotification } from "@/lib/types";

interface NotificationToastProps {
  notification: LikeNotification | null;
  onClose: () => void;
  onLikeBack?: (actorId: string) => void;
}

export function NotificationToast({
  notification,
  onClose,
  onLikeBack,
}: NotificationToastProps) {
  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-white rounded-2xl border-3 border-coy-dark shadow-pop-lg p-4 animate-in slide-in-from-top-4 duration-200 select-none">
      <div className="flex items-start gap-3">
        {/* Avatar / Icon */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full border-2 border-coy-dark overflow-hidden bg-coy-yellow shadow-pop-sm">
            {notification.actorPhoto ? (
              <img
                src={notification.actorPhoto}
                alt={notification.actorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-coy-dark">
                {notification.actorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-coy-pink border border-coy-dark flex items-center justify-center">
            <Heart className="w-3 h-3 fill-coy-dark text-coy-dark" />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-coy-pink tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-coy-pink" />
              New Attraction
            </span>
            <button
              onClick={onClose}
              className="text-coy-muted hover:text-coy-dark p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-black text-coy-dark mt-0.5 leading-snug">
            {notification.actorName} liked your profile!
          </p>
          <p className="text-[11px] font-medium text-coy-muted mt-0.5">
            Like them back to match and start texting.
          </p>

          {/* Quick Action */}
          {onLikeBack && (
            <button
              onClick={() => {
                onLikeBack(notification.actorId);
                onClose();
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coy-yellow text-coy-dark border-2 border-coy-dark text-xs font-black shadow-pop-sm hover:scale-105 active:scale-95 transition-all"
            >
              <span>Like Back to Match</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
