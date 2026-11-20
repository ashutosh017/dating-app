"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { UserProfile } from "@/lib/types";

export interface AuthUser {
  id: string;
  uid: string; // compatibility alias for user.uid
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  name: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, containerId?: string) => Promise<boolean>;
  verifyPhoneOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Consistent initial state on both SSR and client hydration to prevent React hydration mismatch
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfileForUser = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          if (typeof window !== "undefined") {
            localStorage.setItem("sparks_profile", JSON.stringify(data.profile));
          }
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  // Sync session on mount and validate with Better Auth
  useEffect(() => {
    let isMounted = true;

    // Check cached session in microtask to populate quickly post-hydration without React hydration errors
    Promise.resolve().then(() => {
      if (!isMounted) return;
      try {
        const savedUser = localStorage.getItem("sparks_user");
        const savedProfile = localStorage.getItem("sparks_profile");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (err) {
        console.warn("Cached session parse error:", err);
      }
    });

    authClient
      .getSession()
      .then((res) => {
        if (!isMounted) return;
        const sessionUser = res?.data?.user;
        if (sessionUser) {
          const authUser: AuthUser = {
            id: sessionUser.id,
            uid: sessionUser.id,
            email: sessionUser.email || null,
            displayName: sessionUser.name || null,
            name: sessionUser.name || null,
            phoneNumber: null,
            image: sessionUser.image || null,
          };
          setUser(authUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("sparks_user", JSON.stringify(authUser));
          }
          fetchProfileForUser(sessionUser.id);
        } else {
          // If no active session on server, clear persisted session
          setUser(null);
          setProfile(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("sparks_user");
            localStorage.removeItem("sparks_profile");
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Better Auth getSession check deferred:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchProfileForUser]);

  // Google OAuth direct redirect via Better Auth
  const signInWithGoogle = async () => {
    setLoading(true);
    if (typeof window !== "undefined") {
      // Direct full-page navigation to Google OAuth initiation endpoint
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/api/auth/google");
    }
  };

  // Deprecated Phone OTP stubs (commented out in UI)
  const sendPhoneOtp = async (): Promise<boolean> => {
    console.info("Phone OTP is disabled in favor of Better Auth Google authentication.");
    return false;
  };

  const verifyPhoneOtp = async (): Promise<boolean> => {
    console.info("Phone OTP is disabled in favor of Better Auth Google authentication.");
    return false;
  };

  // Profile Update
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...(profile || {
        id: `prof_${user.uid}`,
        userId: user.uid,
        name: user.displayName || "",
        age: 21,
        gender: "unspecified",
        sexualOrientation: "straight",
        interestedIn: ["everyone"],
        bio: "",
        address: "",
        photos: [],
        interests: [],
      }),
      ...profileData,
    };

    setProfile(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("sparks_profile", JSON.stringify(updated));
    }

    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, profile: updated }),
      });
    } catch (e) {
      console.warn("Sync to backend deferred:", e);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Better Auth logout error:", err);
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sparks_user");
      localStorage.removeItem("sparks_profile");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
