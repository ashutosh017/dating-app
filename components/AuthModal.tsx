"use client";

import React, { useState } from "react";
import { X, Sparkles /*, Smartphone, ArrowRight, ShieldCheck */ } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signInWithGoogle /*, sendPhoneOtp, verifyPhoneOtp */ } = useAuth();
  // Phone + OTP authentication temporarily commented out
  // const [authMode, setAuthMode] = useState<"choice" | "phone">("choice");
  // const [phone, setPhone] = useState("");
  // const [otp, setOtp] = useState("");
  // const [step, setStep] = useState<"phone_input" | "otp_input">("phone_input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter a valid phone number");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await sendPhoneOtp(phone.trim());
      setStep("otp_input");
    } catch (err: any) {
      setError(err?.message || "Could not send OTP. Try with country code (e.g. +1 or +91)");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await verifyPhoneOtp(otp.trim());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121D]/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-3 border-coy-dark shadow-pop-xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border-2 border-coy-dark bg-[#F6F4FA] flex items-center justify-center text-coy-dark hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-pop-sm"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coy-yellow text-coy-dark border-2 border-coy-dark font-extrabold text-xs shadow-pop-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Find Your Match
          </div>
          <h2 className="text-3xl font-extrabold text-coy-dark tracking-tight">
            Meet your match.
          </h2>
          <p className="text-sm font-medium text-coy-muted mt-1">
            Discover people near you, like profiles, and text once matched.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-coy-danger text-coy-danger text-xs font-bold shadow-pop-sm">
            {error}
          </div>
        )}

        {/* Mode 1: Main Choice */}
        <div className="space-y-3">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full btn-coy btn-coy-white py-3.5 px-4 text-sm font-extrabold flex items-center justify-center gap-3 text-coy-dark border-2 border-coy-dark shadow-pop cursor-pointer hover:bg-[#F6F4FA] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>{loading ? "Redirecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* Mobile + OTP Button (Temporarily commented out) */}
          {/*
          <button
            onClick={() => {
              setAuthMode("phone");
              setStep("phone_input");
            }}
            className="w-full btn-coy py-3.5 px-4 text-sm font-extrabold flex items-center justify-center gap-3 bg-coy-yellow text-coy-dark border-2 border-coy-dark shadow-pop"
          >
            <Smartphone className="w-5 h-5 text-coy-dark" />
            <span>Continue with Mobile OTP</span>
          </button>
          */}
        </div>

        {/* Mode 2: Phone + OTP Flow (Temporarily commented out) */}
        {/*
        {authMode === "phone" && (
          <div>
            {step === "phone_input" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-coy-dark uppercase tracking-wider mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-coy-dark bg-[#F6F4FA] font-bold text-coy-dark placeholder-coy-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-coy-muted mt-1.5">
                    We will send a 6-digit verification code via SMS.
                  </p>
                </div>

                <div id="recaptcha-container"></div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("choice")}
                    className="flex-1 btn-coy btn-coy-white py-3 text-xs font-extrabold border-2 border-coy-dark shadow-pop-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-2 btn-coy py-3 text-xs font-extrabold bg-coy-pink text-coy-dark border-2 border-coy-dark shadow-pop flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? "Sending..." : "Send SMS Code"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-coy-dark uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-black rounded-2xl border-2 border-coy-dark bg-[#F6F4FA] text-coy-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-coy-pink shadow-pop-sm"
                    required
                  />
                  <p className="text-[11px] font-bold text-center text-coy-muted mt-1.5">
                    Sent to {phone}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("phone_input")}
                    className="flex-1 btn-coy btn-coy-white py-3 text-xs font-extrabold border-2 border-coy-dark shadow-pop-sm"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-2 btn-coy py-3 text-xs font-extrabold bg-coy-mint text-coy-dark border-2 border-coy-dark shadow-pop flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        */}

        {/* Footer Note */}
        <p className="text-[11px] text-center text-coy-muted mt-6 font-medium">
          By continuing you agree to Sparks&apos;s Community Standards & Privacy Promise.
        </p>
      </div>
    </div>
  );
}
