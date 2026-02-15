"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function ErrorDisplay() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "no_code":
          setError("Authentication failed: No authorization code received");
          break;
        case "auth_failed":
          setError("Authentication failed: Unable to establish session");
          break;
        default:
          setError("An error occurred during sign in");
          break;
      }
    }
  }, [searchParams]);

  if (!error) {
    return null;
  }

  return <p className="text-red-500 mb-4">{error}</p>;
}
