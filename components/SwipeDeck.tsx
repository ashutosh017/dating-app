"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  RotateCcw,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserProfile } from "@/lib/types";

interface SwipeDeckProps {
  profiles: UserProfile[];
  onSwipe: (profile: UserProfile, direction: "LIKE" | "PASS") => void;
  onReset?: () => void;
}

export function SwipeDeck({ profiles, onSwipe, onReset }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const currentProfile = profiles[currentIndex];

  const handleSwipeAction = (direction: "LIKE" | "PASS") => {
    if (!currentProfile) return;
    onSwipe(currentProfile, direction);
    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
    setShowFullDetails(false);
  };

  const nextPhoto = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1 < max ? prev + 1 : 0));
  };

  const prevPhoto = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : max - 1));
  };

  // When out of profiles
  if (currentIndex >= profiles.length) {
    return (
      <div className="relative w-full max-w-sm mx-auto h-[calc(100dvh-220px)] min-h-[420px] max-h-[560px] sm:h-[540px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-3 border-coy-dark shadow-pop-lg text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-coy-yellow border-2 border-coy-dark shadow-pop-sm flex items-center justify-center mb-4 rotate-3">
          <Sparkles className="w-8 h-8 text-coy-dark fill-coy-dark" />
        </div>
        <h3 className="text-2xl font-black text-coy-dark tracking-tight mb-2">
          You&apos;ve seen everyone!
        </h3>
        <p className="text-sm font-medium text-coy-muted max-w-xs mb-6">
          No more profiles in your area right now. Likes are confidential until mutual.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            onReset?.();
          }}
          className="btn-coy px-6 py-3 bg-coy-pink text-coy-dark font-extrabold flex items-center gap-2 text-sm shadow-pop"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rewind Profiles</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
      {/* The Stack Box */}
      <div className="relative w-full h-[calc(100dvh-220px)] min-h-[430px] max-h-[560px] sm:h-[540px]">
        {/* Background Ghost Card 2 (Depth effect) */}
        {currentIndex + 2 < profiles.length && (
          <div className="absolute inset-0 bg-[#E7E0FF] rounded-3xl border-2 border-coy-dark shadow-pop-sm scale-[0.92] translate-y-6 pointer-events-none" />
        )}

        {/* Background Ghost Card 1 (Depth effect) */}
        {currentIndex + 1 < profiles.length && (
          <div className="absolute inset-0 bg-[#FFE4EF] rounded-3xl border-2 border-coy-dark shadow-pop scale-[0.96] translate-y-3 pointer-events-none" />
        )}

        {/* Active Draggable Top Card */}
        <AnimatePresence mode="popLayout">
          {currentProfile && (
            <CardItem
              key={currentProfile.id}
              profile={currentProfile}
              photoIndex={photoIndex}
              showFullDetails={showFullDetails}
              onSwipe={handleSwipeAction}
              onNextPhoto={(e) => nextPhoto(e, currentProfile.photos.length)}
              onPrevPhoto={(e) => prevPhoto(e, currentProfile.photos.length)}
              onToggleDetails={() => setShowFullDetails((prev) => !prev)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Tactile Action Buttons */}
      <div className="w-full flex items-center justify-center gap-4 mt-5 z-20">
        {/* Rewind */}
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex((prev) => prev - 1);
              setPhotoIndex(0);
            }
          }}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white border-2 border-coy-dark shadow-pop flex items-center justify-center text-coy-dark hover:bg-coy-yellow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Rewind card"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Pass Button */}
        <button
          onClick={() => handleSwipeAction("PASS")}
          className="w-14 h-14 rounded-full bg-white border-2 border-coy-dark shadow-pop-lg flex items-center justify-center text-coy-dark hover:bg-red-100 hover:text-coy-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
          title="Pass"
        >
          <X className="w-7 h-7 stroke-[3] group-hover:scale-110 transition-transform" />
        </button>

        {/* Superlike / Sparkle Button */}
        <button
          onClick={() => handleSwipeAction("LIKE")}
          className="w-12 h-12 rounded-full bg-[#FFE45C] border-2 border-coy-dark shadow-pop flex items-center justify-center text-coy-dark hover:bg-[#FFDB33] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          title="Superlike"
        >
          <Sparkles className="w-5 h-5 fill-coy-dark text-coy-dark" />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleSwipeAction("LIKE")}
          className="w-16 h-16 rounded-full bg-coy-pink border-2 border-coy-dark shadow-pop-xl flex items-center justify-center text-coy-dark hover:bg-coy-pink-strong active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group scale-105"
          title="Like"
        >
          <Heart className="w-8 h-8 stroke-[2.5] fill-coy-dark text-coy-dark group-hover:scale-110 transition-transform" />
        </button>

        {/* Details Toggle */}
        <button
          onClick={() => setShowFullDetails((prev) => !prev)}
          className={`w-12 h-12 rounded-full border-2 border-coy-dark shadow-pop flex items-center justify-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            showFullDetails
              ? "bg-coy-dark text-white"
              : "bg-white text-coy-dark hover:bg-[#F6F4FA]"
          }`}
          title="View Bio & Details"
        >
          <Info className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Individual Draggable Card Item
// -------------------------------------------------------------
interface CardItemProps {
  profile: UserProfile;
  photoIndex: number;
  showFullDetails: boolean;
  onSwipe: (dir: "LIKE" | "PASS") => void;
  onNextPhoto: (e: React.MouseEvent) => void;
  onPrevPhoto: (e: React.MouseEvent) => void;
  onToggleDetails: () => void;
}

function CardItem({
  profile,
  photoIndex,
  showFullDetails,
  onSwipe,
  onNextPhoto,
  onPrevPhoto,
  onToggleDetails,
}: CardItemProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const currentPhoto = profile.photos[photoIndex] || profile.photos[0];

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) {
          onSwipe("LIKE");
        } else if (info.offset.x < -120 || info.velocity.x < -600) {
          onSwipe("PASS");
        }
      }}
      className="absolute inset-0 bg-white rounded-3xl border-3 border-coy-dark shadow-pop-lg overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
    >
      {/* Visual LIKE Rubber Stamp */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-30 pointer-events-none -rotate-12 border-[3.5px] border-[#0E8F48] bg-[#CBF4E0]/95 text-[#0E8F48] px-4 py-1.5 rounded-2xl font-black text-2xl tracking-wider shadow-pop-sm"
      >
        LIKE
      </motion.div>

      {/* Visual NOPE Rubber Stamp */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-6 right-6 z-30 pointer-events-none rotate-12 border-[3.5px] border-coy-dark bg-white/95 text-coy-dark px-4 py-1.5 rounded-2xl font-black text-2xl tracking-wider shadow-pop-sm"
      >
        PASS
      </motion.div>

      {/* Photo Viewport */}
      <div className="relative w-full h-full bg-coy-dark flex items-center justify-center">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={profile.name}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white pb-32">
            <div className="w-20 h-20 rounded-full bg-coy-yellow border-3 border-coy-dark flex items-center justify-center font-black text-3xl text-coy-dark mb-2 shadow-pop">
              {profile.name?.charAt(0) || "U"}
            </div>
            <span className="text-xs font-bold text-white/70">No photo uploaded</span>
          </div>
        )}

        {/* Photo Stepper Bars (Tinder-style top indicators) */}
        {profile.photos.length > 1 && (
          <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all border border-coy-dark/40 ${
                  i === photoIndex ? "bg-white shadow-pop-sm" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Left/Right Photo Tap Zones */}
        {profile.photos.length > 1 && (
          <div className="absolute inset-y-0 inset-x-0 z-10 flex">
            <div
              onClick={onPrevPhoto}
              className="w-1/2 h-full cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-white/80 border border-coy-dark flex items-center justify-center text-coy-dark">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </div>
            <div
              onClick={onNextPhoto}
              className="w-1/2 h-full cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-white/80 border border-coy-dark flex items-center justify-center text-coy-dark">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#15121D] via-[#15121D]/30 to-transparent pointer-events-none" />

        {/* Profile Card Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white pointer-events-auto">
          {/* Main Info Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {profile.name}, {profile.age}
            </h2>
            {profile.verified && (
              <CheckCircle className="w-6 h-6 fill-coy-mint text-coy-dark stroke-[2]" />
            )}
          </div>

          {/* Quick Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-sticker bg-[#D7ECFF] text-coy-dark text-[11px]">
              <MapPin className="w-3 h-3 stroke-[2.5]" />
              {profile.address}
            </span>
            {profile.profession && (
              <span className="badge-sticker bg-[#FFE45C] text-coy-dark text-[11px]">
                <Briefcase className="w-3 h-3 stroke-[2.5]" />
                {profile.profession}
              </span>
            )}
            {profile.education && (
              <span className="badge-sticker bg-[#E7E0FF] text-coy-dark text-[11px] hidden sm:inline-flex">
                <GraduationCap className="w-3.5 h-3.5 stroke-[2.5]" />
                {profile.education}
              </span>
            )}
          </div>

          {/* Bio Snippet */}
          {profile.bio && (
            <p className="text-xs sm:text-sm font-medium text-white/95 line-clamp-2 leading-relaxed bg-[#15121D]/75 backdrop-blur-md p-2.5 rounded-xl border border-white/20 mb-3 shadow-pop-sm">
              {profile.bio}
            </p>
          )}

          {/* Interest Sticker Pills */}
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((tag, idx) => {
              const colors = ["bg-[#CBF4E0]", "bg-[#FFE1CF]", "bg-[#FFE45C]", "bg-[#E7E0FF]"];
              const bg = colors[idx % colors.length];
              return (
                <span
                  key={tag}
                  className={`badge-sticker ${bg} text-coy-dark text-[10px] py-0.5 px-2.5`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Profile Drawer */}
      {showFullDetails && (
        <div className="absolute inset-0 z-40 bg-white p-6 overflow-y-auto animate-in slide-in-from-bottom duration-200 text-coy-dark">
          <div className="flex items-center justify-between border-b-2 border-coy-line pb-3 mb-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight">{profile.name}, {profile.age}</h3>
              <p className="text-xs font-bold text-coy-muted">{profile.address}</p>
            </div>
            <button
              onClick={onToggleDetails}
              className="w-8 h-8 rounded-full border-2 border-coy-dark bg-[#F6F4FA] flex items-center justify-center hover:bg-coy-pink shadow-pop-sm"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="space-y-4 text-xs font-medium">
            <div>
              <span className="text-[11px] font-black uppercase text-coy-muted block mb-1">About</span>
              <p className="text-sm font-normal text-coy-dark bg-[#F6F4FA] p-3 rounded-xl border-2 border-coy-dark leading-relaxed">
                {profile.bio || "No bio added yet."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F6F4FA] p-2.5 rounded-xl border-2 border-coy-dark">
                <span className="text-[10px] font-black uppercase text-coy-muted block">Gender</span>
                <span className="font-extrabold capitalize">{profile.gender}</span>
              </div>
              <div className="bg-[#F6F4FA] p-2.5 rounded-xl border-2 border-coy-dark">
                <span className="text-[10px] font-black uppercase text-coy-muted block">Orientation</span>
                <span className="font-extrabold capitalize">{profile.sexualOrientation}</span>
              </div>
            </div>

            {profile.profession && (
              <div className="bg-[#F6F4FA] p-2.5 rounded-xl border-2 border-coy-dark">
                <span className="text-[10px] font-black uppercase text-coy-muted block">Work</span>
                <span className="font-extrabold">{profile.profession} {profile.company && `at ${profile.company}`}</span>
              </div>
            )}

            {profile.education && (
              <div className="bg-[#F6F4FA] p-2.5 rounded-xl border-2 border-coy-dark">
                <span className="text-[10px] font-black uppercase text-coy-muted block">Education</span>
                <span className="font-extrabold">{profile.education}</span>
              </div>
            )}

            <div>
              <span className="text-[11px] font-black uppercase text-coy-muted block mb-2">Interests</span>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((tag) => (
                  <span key={tag} className="badge-sticker bg-coy-yellow text-coy-dark">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
