"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, MessageCircle, User, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onOpenAuth?: () => void;
  unreadCount?: number;
}

export function Navbar({ onOpenAuth, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const { user, profile, logout, signInWithGoogle } = useAuth();

  const navItems = [
    { label: "Discover", href: "/", icon: Flame },
    { label: "Matches", href: "/matches", icon: MessageCircle, badge: unreadCount },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-coy-dark px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="w-9 h-9 rounded-xl bg-coy-pink border-2 border-coy-dark shadow-pop-sm flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
              <Sparkles className="w-5 h-5 text-coy-dark fill-coy-dark" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-coy-dark">
              sparks<span className="text-coy-pink">.</span>
            </span>
          </Link>

          {/* Desktop Center Navigation Pill */}
          <nav className="hidden sm:flex items-center gap-1.5 bg-[#F6F4FA] p-1.5 rounded-full border-2 border-coy-dark shadow-pop-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-5 py-1.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-coy-pink text-coy-dark shadow-pop-sm border-2 border-coy-dark"
                      : "text-coy-muted hover:text-coy-dark"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="w-5 h-5 bg-[#FFE45C] text-coy-dark rounded-full text-xs font-black flex items-center justify-center border border-coy-dark">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth State & Quick Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1 bg-[#F6F4FA] rounded-full border-2 border-coy-dark shadow-pop-sm hover:bg-white transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-coy-yellow border border-coy-dark flex items-center justify-center text-xs font-black overflow-hidden">
                    {profile?.photos?.[0] ? (
                      <img
                        src={profile.photos[0]}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <span className="text-xs font-bold text-coy-dark hidden md:inline">
                    {profile?.name || user.displayName || "My Profile"}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-bold text-coy-muted hover:text-coy-dark underline px-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) {
                    onOpenAuth();
                  } else {
                    void signInWithGoogle();
                  }
                }}
                className="btn-coy px-5 py-2 text-sm bg-coy-pink text-coy-dark font-extrabold flex items-center justify-center cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-coy-dark px-4 py-2 flex items-center justify-around pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(21,18,29,0.08)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-1.5 transition-transform ${
                isActive ? "scale-105" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all relative ${
                  isActive
                    ? "bg-coy-pink border-2 border-coy-dark shadow-pop-sm text-coy-dark"
                    : "text-coy-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFE45C] text-coy-dark rounded-full text-[10px] font-black flex items-center justify-center border border-coy-dark">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold ${
                  isActive ? "text-coy-dark font-black" : "text-coy-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
