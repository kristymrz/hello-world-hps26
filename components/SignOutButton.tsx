"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const [isHovered, setIsHovered] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
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
      Sign Out
    </button>
  );
}


