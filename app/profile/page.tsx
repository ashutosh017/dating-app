"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AuthModal } from "@/components/AuthModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Edit3,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

function ProfileContent() {
  const { user, profile, logout, signInWithGoogle } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F4FA]">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-coy-yellow border-2 border-coy-dark shadow-pop flex items-center justify-center mb-4 rotate-3">
            <Sparkles className="w-8 h-8 text-coy-dark fill-coy-dark" />
          </div>
          <h2 className="text-2xl font-black text-coy-dark tracking-tight mb-2">
            Sign in to view your profile
          </h2>
          <p className="text-xs font-semibold text-coy-muted mb-6">
            Create your dating card, customize your photos, and start matching.
          </p>
          <button
            onClick={() => {
              void signInWithGoogle();
            }}
            className="btn-coy px-6 py-3 text-sm font-black bg-coy-pink text-coy-dark border-2 border-coy-dark shadow-pop inline-block cursor-pointer"
          >
            Sign In with Google 
          </button>
        </main>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4FA]">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col pb-24 sm:pb-8 select-none">
        {/* Profile Card Preview */}
        <div className="bg-white rounded-3xl border-3 border-coy-dark shadow-pop-xl overflow-hidden mb-6">
          {/* Main Photo Banner */}
          <div className="relative aspect-[4/5] bg-coy-dark">
            {profile.photos[0] ? (
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#F6F4FA] text-coy-dark p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-coy-yellow border-2 border-coy-dark flex items-center justify-center font-black text-2xl mb-2 shadow-pop-sm">
                  {profile.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-coy-muted">No photo uploaded yet</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#15121D] via-[#15121D]/20 to-transparent pointer-events-none" />

            {/* Edit Floating Badge */}
            <button
              onClick={() => setIsEditOpen(true)}
              className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-white border-2 border-coy-dark shadow-pop-sm flex items-center gap-1.5 text-xs font-black text-coy-dark hover:bg-coy-yellow active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit Card</span>
            </button>

            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                  {profile.name}, {profile.age}
                </h1>
                {profile.verified && (
                  <span className="w-5 h-5 rounded-full bg-coy-mint border border-coy-dark flex items-center justify-center">
                    <UserCheck className="w-3 h-3 text-[#0E8F48] stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="badge-sticker bg-[#D7ECFF] text-coy-dark text-[10px]">
                  <MapPin className="w-3 h-3" />
                  {profile.address}
                </span>
                {profile.profession && (
                  <span className="badge-sticker bg-[#FFE45C] text-coy-dark text-[10px]">
                    <Briefcase className="w-3 h-3" />
                    {profile.profession}
                  </span>
                )}
                {profile.education && (
                  <span className="badge-sticker bg-[#E7E0FF] text-coy-dark text-[10px]">
                    <GraduationCap className="w-3 h-3" />
                    {profile.education}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs font-medium text-white/90 bg-[#15121D]/70 backdrop-blur-md p-2.5 rounded-xl border border-white/20 leading-relaxed shadow-pop-sm">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Additional Photos Tray */}
          {profile.photos.length > 1 && (
            <div className="p-4 border-t-2 border-coy-line bg-[#F6F4FA]">
              <span className="text-[10px] font-black uppercase text-coy-muted block mb-2">
                All Photos ({profile.photos.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {profile.photos.map((url, i) => (
                  <div
                    key={i}
                    className="w-16 h-20 rounded-xl border-2 border-coy-dark overflow-hidden flex-shrink-0 shadow-pop-sm"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passions & Sticker Tags */}
          <div className="p-5 border-t-2 border-coy-line">
            <span className="text-[10px] font-black uppercase tracking-wider text-coy-muted block mb-2">
              Passions & Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((tag, i) => {
                const colors = ["bg-[#FFE45C]", "bg-[#CBF4E0]", "bg-[#E7E0FF]", "bg-[#FFE1CF]"];
                return (
                  <span
                    key={tag}
                    className={`badge-sticker ${colors[i % colors.length]} text-coy-dark`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Details & Logout */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border-2 border-coy-dark shadow-pop p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-coy-muted block">
                Logged in as
              </span>
              <span className="text-xs font-black text-coy-dark">
                {user.email || user.phoneNumber || user.uid}
              </span>
            </div>
            <button
              onClick={logout}
              className="btn-coy btn-coy-white px-3.5 py-1.5 text-xs font-black border-2 border-coy-dark shadow-pop-sm flex items-center gap-1.5 text-coy-danger"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log out</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-coy-yellow/30 border-2 border-coy-dark shadow-pop-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-coy-dark flex-shrink-0 stroke-[2.5]" />
            <p className="text-[11px] font-bold text-coy-dark">
              Instant alerts enabled. When someone likes your profile, you will be notified so you can match and chat.
            </p>
          </div>
        </div>
      </main>

      <OnboardingModal
        isOpen={isEditOpen}
        onComplete={() => setIsEditOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}
