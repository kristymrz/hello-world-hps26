"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, Suspense } from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://hello-world-hps26.vercel.app/auth/callback',
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome - Please Sign In</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorDisplay />
      </Suspense>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleSignIn}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Sign in with Google
      </button>
    </div>
  );
}
