"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, Suspense } from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#571F43]">
      <h1 className="text-4xl font-bold mb-4 text-white"> ⋅˚₊ • ୨୧ ‧₊˚ ⋅ welcome! sign in to find out what's funny... ⋅˚₊ • ୨୧ ‧₊˚ ⋅ </h1>
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ErrorDisplay />
      </Suspense>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <button
        onClick={handleSignIn}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? '#FAFF4A' : '#863067',
          color: isHovered ? '#28290D' : '#ffffff',
          border: '2px solid #ffffff',
          padding: '10px 20px',
          fontSize: '26px',
          borderRadius: '8px',
          transition: 'all 300ms ease-in-out'
        }}
        className="font-bold uppercase cursor-pointer"
      >
        Sign in with Google
      </button>
    </div>
  );
}

