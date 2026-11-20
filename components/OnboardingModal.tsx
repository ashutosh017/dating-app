"use client";

import React, { useState } from "react";
import { X, Check, Sparkles, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const INTEREST_CATEGORIES = [
  {
    category: "Sports & Fitness",
    items: [
      "Gym & Lifting",
      "Running",
      "Hiking",
      "Bouldering",
      "Yoga & Pilates",
      "Swimming",
      "Cycling",
      "Tennis & Pickleball",
      "Boxing",
      "Skiing & Snowboarding",
    ],
  },
  {
    category: "Food & Drinks",
    items: [
      "Coffee & Cafes",
      "Matcha Lattes",
      "Cooking & Baking",
      "Foodie & Street Food",
      "Wine & Cocktails",
      "Sushi & Ramen",
      "Boba",
      "Plant-based",
      "Craft Beer",
      "Dessert Hunting",
    ],
  },
  {
    category: "Arts & Creativity",
    items: [
      "Film Photography",
      "Painting & Drawing",
      "Graphic Design",
      "Cinema & Movies",
      "Creative Writing",
      "Fashion & Styling",
      "Museums & Galleries",
      "Architecture",
      "Ceramics & Pottery",
      "Interior Design",
    ],
  },
  {
    category: "Music & Entertainment",
    items: [
      "Live Concerts",
      "Vinyl Records",
      "Indie Rock",
      "Hip Hop & Rap",
      "Techno & House",
      "R&B & Soul",
      "Stand-up Comedy",
      "Board Games",
      "Video Games",
      "Anime & Manga",
    ],
  },
  {
    category: "Lifestyle & Learning",
    items: [
      "Reading & Books",
      "Travel & Backpacking",
      "Tech & Startups",
      "Dogs & Pets",
      "Cats",
      "Urban Gardening",
      "Thrifting & Vintage",
      "Podcasts",
      "Volunteering",
      "Astrology & Tarot",
    ],
  },
];

const GENDERS = [
  { label: "Woman", value: "woman" },
  { label: "Man", value: "man" },
  { label: "Non-Binary", value: "non-binary" },
];

const ORIENTATIONS = [
  { label: "Straight", value: "straight" },
  { label: "Bisexual", value: "bisexual" },
  { label: "Lesbian", value: "lesbian" },
  { label: "Gay", value: "gay" },
  { label: "Queer", value: "queer" },
];

const INTERESTED_IN_OPTIONS = [
  { label: "Women", value: "woman" },
  { label: "Men", value: "man" },
  { label: "Everyone", value: "everyone" },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { profile, updateProfile, user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State: nothing selected by default for preference
  const [name, setName] = useState(profile?.name || user?.displayName || "");
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [sexualOrientation, setSexualOrientation] = useState(profile?.sexualOrientation || "");
  const [interestedIn, setInterestedIn] = useState<string[]>(profile?.interestedIn || []);
  
  const [address, setAddress] = useState(profile?.address || "");
  const [education, setEducation] = useState(profile?.education || "");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const [photos, setPhotos] = useState<string[]>(profile?.photos ? profile.photos.slice(0, 3) : []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);

  if (!isOpen) return null;

  const handleInterestedInToggle = (val: string) => {
    if (val === "everyone") {
      setInterestedIn(["everyone"]);
      return;
    }

    const withoutEveryone = interestedIn.filter((i) => i !== "everyone");
    if (withoutEveryone.includes(val)) {
      setInterestedIn(withoutEveryone.filter((i) => i !== val));
    } else {
      setInterestedIn([...withoutEveryone, val]);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length < 7) {
        setSelectedInterests([...selectedInterests, interest]);
      } else {
        setError("You can choose up to 7 passions.");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 3) {
      setError("Maximum 3 photos allowed.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setPhotos((prev) => [...prev, data.url].slice(0, 3));
        }
      } else {
        setError("Failed to upload photo. Please try another image.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Network error uploading photo.");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const canContinueStep1 =
    name.trim().length > 0 &&
    age.trim().length > 0 &&
    gender !== "" &&
    sexualOrientation !== "" &&
    interestedIn.length > 0;
  const canContinueStep2 = address.trim().length > 0;
  const canContinueStep3 = photos.length > 0 && photos.length <= 3;

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError("Please upload at least 1 photo.");
      setStep(3);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim(),
        age: parseInt(age, 10) || 21,
        gender,
        sexualOrientation,
        interestedIn,
        address: address.trim(),
        education: education.trim(),
        profession: profession.trim(),
        company: company.trim(),
        bio: bio.trim(),
        photos: photos.slice(0, 3),
        interests: selectedInterests,
        verified: false, // Default is unverified
      });
      onComplete();
    } catch (err) {
      console.error("Profile save error:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121D]/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-3 border-coy-dark shadow-pop-xl p-6 sm:p-8 my-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b-2 border-coy-line pb-4 mb-6">
          <div>
            <span className="text-xs font-black text-coy-pink uppercase tracking-wider">
              Step {step} of 4
            </span>
            <h2 className="text-2xl font-extrabold text-coy-dark tracking-tight">
              {step === 1 && "Create Your Profile"}
              {step === 2 && "Location & Background"}
              {step === 3 && "Photos (Max 3)"}
              {step === 4 && "Passions & Interests"}
            </h2>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-3.5 h-3.5 rounded-full border-2 border-coy-dark transition-all ${
                  s === step
                    ? "bg-coy-pink shadow-pop-sm scale-110"
                    : s < step
                    ? "bg-coy-mint"
                    : "bg-[#F6F4FA]"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-coy-danger text-coy-danger text-xs font-bold shadow-pop-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="22"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1.5">
                I identify as *
              </label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={`px-4 py-2 rounded-full font-bold text-xs border-2 border-coy-dark transition-all ${
                      gender === g.value
                        ? "bg-coy-pink text-coy-dark shadow-pop"
                        : "bg-white text-coy-muted hover:text-coy-dark shadow-pop-sm"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sexual Orientation */}
            <div>
              <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1.5">
                Sexual Orientation *
              </label>
              <div className="flex flex-wrap gap-2">
                {ORIENTATIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setSexualOrientation(o.value)}
                    className={`px-4 py-2 rounded-full font-bold text-xs border-2 border-coy-dark transition-all ${
                      sexualOrientation === o.value
                        ? "bg-coy-yellow text-coy-dark shadow-pop"
                        : "bg-white text-coy-muted hover:text-coy-dark shadow-pop-sm"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interested In: NOT selected by default */}
            <div>
              <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1.5">
                Show Me (Preference) *
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTED_IN_OPTIONS.map((opt) => {
                  const isSelected = interestedIn.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleInterestedInToggle(opt.value)}
                      className={`px-4 py-2 rounded-full font-bold text-xs border-2 border-coy-dark transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-coy-mint text-[#0E8F48] shadow-pop"
                          : "bg-white text-coy-muted hover:text-coy-dark shadow-pop-sm"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {interestedIn.length === 0 && (
                <p className="text-[11px] font-semibold text-coy-muted mt-1.5">
                  Select who you would like to discover.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Life, Career & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                Your City or Neighborhood *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Brooklyn, NY"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                  Profession / Role
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Architect"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Studio"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                College / Education
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. University"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-coy-dark uppercase mb-1">
                Your Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a few lines about what you love and what you're looking for..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-coy-dark bg-[#F6F4FA] font-semibold text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Photos (Max 3) */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-coy-dark uppercase">
                Profile Photos (Upload 1 to 3 photos) *
              </label>
              <span className={`text-xs font-bold ${photos.length === 3 ? "text-coy-pink font-black" : "text-coy-muted"}`}>
                {photos.length} / 3 photos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] rounded-2xl border-2 border-coy-dark overflow-hidden shadow-pop-sm group bg-[#F6F4FA]"
                >
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white border border-coy-dark flex items-center justify-center text-coy-dark opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coy-pink shadow-pop-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-coy-yellow border border-coy-dark text-[10px] font-black text-coy-dark shadow-pop-sm">
                      Main
                    </div>
                  )}
                </div>
              ))}

              {/* Upload Card: Disabled if 3 photos already uploaded */}
              {photos.length < 3 && (
                <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-coy-dark bg-[#F6F4FA] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-coy-pink transition-all shadow-pop-sm">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-coy-dark flex items-center justify-center text-coy-dark shadow-pop-sm mb-1.5">
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-coy-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-coy-dark">
                    {loading ? "Uploading..." : "Upload Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading || photos.length >= 3}
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] font-medium text-coy-muted">
              You can upload up to 3 pictures for your profile card.
            </p>
          </div>
        )}

        {/* STEP 4: Broadened Passions & Sticker Badges */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-extrabold text-coy-dark uppercase">
                  Select Your Passions & Hobbies
                </label>
                <span className="text-xs font-bold text-coy-pink">
                  {selectedInterests.length} / 7 selected
                </span>
              </div>
              <p className="text-xs text-coy-muted font-medium mb-3">
                Choose up to 7 passions across different categories.
              </p>

              {/* Category Pills Navigation */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {INTEREST_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveCategoryTab(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border-2 border-coy-dark whitespace-nowrap transition-all ${
                      activeCategoryTab === idx
                        ? "bg-coy-pink text-coy-dark shadow-pop-sm"
                        : "bg-white text-coy-muted hover:text-coy-dark"
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* Badges for active category */}
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1">
                {INTEREST_CATEGORIES[activeCategoryTab].items.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`badge-sticker transition-all ${
                        isSelected
                          ? "bg-coy-yellow text-coy-dark scale-105"
                          : "bg-white text-coy-muted hover:text-coy-dark"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3] text-coy-dark" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-coy-muted" />
                      )}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <div className="flex items-center justify-between border-t-2 border-coy-line pt-4 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
              }}
              className="btn-coy btn-coy-white px-5 py-2.5 text-xs font-extrabold border-2 border-coy-dark shadow-pop-sm"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !canContinueStep1) {
                  setError("Please fill in your name, age, gender, orientation, and preference.");
                  return;
                }
                if (step === 2 && !canContinueStep2) {
                  setError("Please enter your city/neighborhood.");
                  return;
                }
                if (step === 3 && !canContinueStep3) {
                  setError("Please upload at least 1 photo (up to 3).");
                  return;
                }
                setError(null);
                setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
              }}
              className="btn-coy px-6 py-2.5 text-xs font-extrabold bg-coy-pink text-coy-dark border-2 border-coy-dark shadow-pop"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-coy px-7 py-2.5 text-xs font-extrabold bg-coy-mint text-[#0E8F48] border-2 border-coy-dark shadow-pop flex items-center gap-2"
            >
              <span>{loading ? "Saving..." : "Save Profile"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
