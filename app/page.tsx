"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SwipeDeck } from "@/components/SwipeDeck";
import { AuthModal } from "@/components/AuthModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { MatchModal } from "@/components/MatchModal";
import { NotificationToast } from "@/components/NotificationToast";
import { ChatView } from "@/components/ChatView";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserProfile, LikeNotification } from "@/lib/types";
import { getPusherClient } from "@/lib/pusher/client";
import {
  Sparkles,
  ShieldCheck,
  Users,
  RefreshCw,
  MessageCircle,
  BellRing,
  // ArrowRight,
} from "lucide-react";

function DiscoverContent() {
  const { user, profile, loading: authLoading, signInWithGoogle /*, sendPhoneOtp, verifyPhoneOtp */ } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false);
  
  // Real Feed State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  
  // Active Chat
  const [activeChatProfile, setActiveChatProfile] = useState<UserProfile | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  
  // Match Celebration
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  
  // Real-time Notification
  const [incomingNotification, setIncomingNotification] = useState<LikeNotification | null>(null);

  // Direct In-Page Authentication State (No redundant popup modal!)
  // Phone + OTP authentication temporarily commented out
  // const [phone, setPhone] = useState("");
  // const [otp, setOtp] = useState("");
  // const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [homeAuthLoading, setHomeAuthLoading] = useState(false);
  const [homeAuthError, setHomeAuthError] = useState<string | null>(null);

  // Derived state: open onboarding if user has no profile yet
  const isOnboardingOpen = Boolean(user && !profile && !authLoading && !isOnboardingDismissed);

  // Fetch real profiles from DB ONLY if logged in
  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    fetch(`/api/feed?userId=${user.uid}`)
      .then((res) => (res.ok ? res.json() : { profiles: [] }))
      .then((data) => {
        if (isMounted) {
          setProfiles(data.profiles || []);
          setFeedLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load feed:", err);
        if (isMounted) setFeedLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const refreshFeed = () => {
    if (!user) return;
    setFeedLoading(true);
    fetch(`/api/feed?userId=${user.uid}`)
      .then((res) => (res.ok ? res.json() : { profiles: [] }))
      .then((data) => {
        setProfiles(data.profiles || []);
        setFeedLoading(false);
      })
      .catch((err) => {
        console.error("Failed to refresh feed:", err);
        setFeedLoading(false);
      });
  };

  // Direct Google Sign In on Home Page
  const handleDirectGoogle = async () => {
    setHomeAuthLoading(true);
    setHomeAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign in failed";
      setHomeAuthError(msg);
    } finally {
      setHomeAuthLoading(false);
    }
  };

  /*
  // Direct Phone OTP Send on Home Page (Temporarily commented out)
  const handleDirectSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setHomeAuthError("Please enter your mobile phone number.");
      return;
    }
    setHomeAuthLoading(true);
    setHomeAuthError(null);
    try {
      await sendPhoneOtp(phone.trim(), "home-recaptcha-container");
      setPhoneStep("otp");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send SMS code. Include country code (e.g. +1 or +91).";
      setHomeAuthError(msg);
    } finally {
      setHomeAuthLoading(false);
    }
  };

  // Direct Phone OTP Verify on Home Page (Temporarily commented out)
  const handleDirectVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setHomeAuthError("Please enter the 6-digit verification code.");
      return;
    }
    setHomeAuthLoading(true);
    setHomeAuthError(null);
    try {
      await verifyPhoneOtp(otp.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code. Please try again.";
      setHomeAuthError(msg);
    } finally {
      setHomeAuthLoading(false);
    }
  };
  */

  // Subscribe to real-time notifications for the logged in user
  useEffect(() => {
    if (!user) return;

    const pusher = getPusherClient();
    if (pusher) {
      const channel = pusher.subscribe(`user-${user.uid}`);

      channel.bind("notification", async (data: { type?: string; actorId?: string; matchId?: string }) => {
        if (!data.actorId) return;

        if (data.type === "MUTUAL_MATCH") {
          try {
            const res = await fetch(`/api/profile?userId=${data.actorId}`);
            if (res.ok) {
              const resData = await res.json();
              if (resData.profile) {
                setMatchedProfile(resData.profile);
                setActiveMatchId(data.matchId || `match_${Date.now()}`);
                setIsMatchModalOpen(true);
                return;
              }
            }
          } catch (e) {
            console.error("Failed to fetch matched profile:", e);
          }
        } else if (data.type === "LIKE_RECEIVED") {
          try {
            const res = await fetch(`/api/profile?userId=${data.actorId}`);
            if (res.ok) {
              const resData = await res.json();
              const actorProfile = resData.profile;
              setIncomingNotification({
                id: `notif_${Date.now()}`,
                actorId: data.actorId,
                actorName: actorProfile?.name || "Someone nearby",
                actorPhoto: actorProfile?.photos?.[0] || "",
                type: "LIKE_RECEIVED",
                createdAt: new Date().toISOString(),
                read: false,
              });
            }
          } catch (e) {
            console.error("Failed to fetch actor profile for notification:", e);
          }
        }
      });

      return () => {
        pusher.unsubscribe(`user-${user.uid}`);
      };
    }
  }, [user]);

  // Handle Swipe (Like / Pass)
  const handleSwipe = async (targetProfile: UserProfile, direction: "LIKE" | "PASS") => {
    if (!user) return;

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swiperId: user.uid,
          targetId: targetProfile.userId,
          type: direction,
        }),
      });

      const data = await res.json();

      if (data.isMatch) {
        setMatchedProfile(targetProfile);
        setActiveMatchId(data.matchId);
        setIsMatchModalOpen(true);
      }
    } catch (err) {
      console.error("Swipe processing error:", err);
    }
  };

  // Like Back from Notification Toast
  const handleLikeBack = async (actorId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swiperId: user.uid,
          targetId: actorId,
          type: "LIKE",
        }),
      });
      const data = await res.json();
      if (data.isMatch) {
        const actorRes = await fetch(`/api/profile?userId=${actorId}`);
        if (actorRes.ok) {
          const actorData = await actorRes.json();
          setMatchedProfile(actorData.profile);
          setActiveMatchId(data.matchId);
          setIsMatchModalOpen(true);
        }
      }
    } catch (e) {
      console.error("Like back error:", e);
    }
  };

  // 1. Loading State while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F4FA] items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-coy-pink border-3 border-coy-dark shadow-pop flex items-center justify-center animate-bounce mb-3">
          <Sparkles className="w-6 h-6 text-coy-dark fill-coy-dark" />
        </div>
        <span className="text-sm font-black text-coy-dark tracking-tight">sparks.</span>
      </div>
    );
  }

  // 2. Unauthenticated State: Sign in directly on home page without redundant popup modal!
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F4FA]">
        <Navbar onOpenAuth={() => {
          const el = document.getElementById("home-signin-card");
          el?.scrollIntoView({ behavior: "smooth" });
        }} />

        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center select-none text-center">
          <div id="home-signin-card" className="w-full bg-white rounded-3xl border-3 border-coy-dark shadow-pop-xl p-6 sm:p-10 text-center">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-coy-yellow border-2 border-coy-dark font-black text-xs shadow-pop-sm mb-4 -rotate-2">
              <Sparkles className="w-3.5 h-3.5 text-coy-dark fill-coy-dark" />
              <span>DISCOVER &amp; CONNECT</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-coy-dark tracking-tight leading-[1.05] mb-2">
              Sign in to browse profiles.
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-coy-muted max-w-sm mx-auto mb-6 leading-relaxed">
              Connect with real people, like profiles, and start chatting the moment sparks fly.
            </p>

            {/* Error Message */}
            {homeAuthError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border-2 border-coy-danger text-coy-danger text-xs font-bold shadow-pop-sm text-left">
                {homeAuthError}
              </div>
            )}

            {/* Direct Google Sign-In */}
            <button
              onClick={handleDirectGoogle}
              disabled={homeAuthLoading}
              className="w-full btn-coy btn-coy-white py-3.5 px-4 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-3 text-coy-dark border-2 border-coy-dark shadow-pop hover:bg-[#F6F4FA] transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{homeAuthLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Direct Phone OTP Form (Temporarily commented out) */}
            {/*
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t-2 border-coy-line" />
              <span className="flex-shrink mx-3 text-[11px] font-black text-coy-muted uppercase tracking-wider">
                or with mobile number
              </span>
              <div className="flex-grow border-t-2 border-coy-line" />
            </div>

            {phoneStep === "phone" ? (
              <form onSubmit={handleDirectSendOtp} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-extrabold text-coy-dark uppercase mb-1">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555 019 2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-sm text-coy-dark placeholder-coy-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                    required
                  />
                </div>

                <div id="home-recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={homeAuthLoading}
                  className="w-full btn-coy py-3 px-4 text-xs font-black bg-coy-yellow text-coy-dark border-2 border-coy-dark shadow-pop flex items-center justify-center gap-2"
                >
                  <span>{homeAuthLoading ? "Sending SMS..." : "Send Verification Code"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleDirectVerifyOtp} className="space-y-3 text-left">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-extrabold text-coy-dark uppercase">
                      Enter 6-Digit Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setPhoneStep("phone")}
                      className="text-[11px] font-black text-coy-pink underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-xl font-black rounded-2xl border-2 border-coy-dark bg-[#F6F4FA] text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                    required
                  />
                  <p className="text-[11px] font-semibold text-coy-muted mt-1 text-center">
                    Sent to {phone}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={homeAuthLoading}
                  className="w-full btn-coy py-3 px-4 text-xs font-black bg-coy-mint text-[#0E8F48] border-2 border-coy-dark shadow-pop flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>{homeAuthLoading ? "Verifying..." : "Verify & Start Browsing"}</span>
                </button>
              </form>
            )}
            */}

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-2 pt-6 mt-6 border-t-2 border-coy-line text-left">
              <div className="bg-[#F6F4FA] p-3 rounded-2xl border border-coy-dark/30">
                <BellRing className="w-4 h-4 text-coy-pink mb-1" />
                <h4 className="text-[11px] font-black text-coy-dark leading-tight">Like Alerts</h4>
                <p className="text-[10px] font-semibold text-coy-muted leading-tight mt-0.5">Instant notices</p>
              </div>

              <div className="bg-[#F6F4FA] p-3 rounded-2xl border border-coy-dark/30">
                <MessageCircle className="w-4 h-4 text-[#0E8F48] mb-1" />
                <h4 className="text-[11px] font-black text-coy-dark leading-tight">Instant Chat</h4>
                <p className="text-[10px] font-semibold text-coy-muted leading-tight mt-0.5">Realtime text</p>
              </div>

              <div className="bg-[#F6F4FA] p-3 rounded-2xl border border-coy-dark/30">
                <ShieldCheck className="w-4 h-4 text-[#4285F4] mb-1" />
                <h4 className="text-[11px] font-black text-coy-dark leading-tight">Verified</h4>
                <p className="text-[10px] font-semibold text-coy-muted leading-tight mt-0.5">Real people</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Authenticated State: Render the Discover Swipe Deck
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4FA]">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-start pb-24 sm:pb-8">
        {/* Active Chat Overlay if a conversation is open */}
        {activeChatProfile && activeMatchId ? (
          <div className="w-full flex justify-center py-2">
            <ChatView
              matchId={activeMatchId}
              matchedProfile={activeChatProfile}
              onBack={() => {
                setActiveChatProfile(null);
                setActiveMatchId(null);
              }}
            />
          </div>
        ) : (
          <>
            {/* Loading State */}
            {feedLoading ? (
              <div className="w-full max-w-sm mx-auto h-[calc(100dvh-220px)] min-h-[420px] max-h-[560px] sm:h-[540px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-3 border-coy-dark shadow-pop-lg text-center">
                <div className="w-10 h-10 border-3 border-coy-dark border-t-coy-pink rounded-full animate-spin mb-3" />
                <p className="text-xs font-black text-coy-dark">Finding profiles near you...</p>
              </div>
            ) : profiles.length > 0 ? (
              <SwipeDeck
                profiles={profiles}
                onSwipe={handleSwipe}
                onReset={refreshFeed}
              />
            ) : (
              /* Empty State */
              <div className="relative w-full max-w-sm mx-auto h-[calc(100dvh-220px)] min-h-[420px] max-h-[560px] sm:h-[540px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-3 border-coy-dark shadow-pop-lg text-center select-none">
                <div className="w-16 h-16 rounded-2xl bg-coy-yellow border-2 border-coy-dark shadow-pop flex items-center justify-center mb-4 rotate-3">
                  <Users className="w-8 h-8 text-coy-dark stroke-[2]" />
                </div>
                <h3 className="text-2xl font-black text-coy-dark tracking-tight mb-2">
                  No profiles around you yet
                </h3>
                <p className="text-xs font-medium text-coy-muted max-w-xs mb-6 leading-relaxed">
                  You&apos;re among the first here! When new people create profiles matching your preference, they&apos;ll appear right here.
                </p>
                <button
                  onClick={refreshFeed}
                  className="btn-coy px-6 py-2.5 bg-coy-pink text-coy-dark font-extrabold flex items-center gap-2 text-xs shadow-pop"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Feed</span>
                </button>
              </div>
            )}

            {/* Notification Notice Banner */}
            <div className="w-full max-w-sm mt-6 p-3 rounded-2xl bg-white border-2 border-coy-dark shadow-pop-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-coy-mint border border-coy-dark flex items-center justify-center flex-shrink-0">
                <BellRing className="w-4 h-4 text-[#0E8F48] stroke-[2.5]" />
              </div>
              <p className="text-[11px] font-semibold text-coy-dark leading-tight">
                <strong className="font-black">Instant Match Alerts:</strong> When someone likes your profile, you will get a notification on your app so you can like them back to match!
              </p>
            </div>
          </>
        )}
      </main>

      {/* Modals & Live Toasts */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsOnboardingDismissed(false);
          refreshFeed();
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingDismissed(true);
          refreshFeed();
        }}
      />

      <MatchModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        currentUserProfile={profile}
        matchedProfile={matchedProfile}
        matchId={activeMatchId || undefined}
        onOpenChat={(mId) => {
          setActiveMatchId(mId);
          setActiveChatProfile(matchedProfile);
        }}
      />

      <NotificationToast
        notification={incomingNotification}
        onClose={() => setIncomingNotification(null)}
        onLikeBack={handleLikeBack}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <DiscoverContent />
    </AuthProvider>
  );
}
