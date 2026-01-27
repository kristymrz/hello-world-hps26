"use client";

import { useState } from "react";

export default function Home() {
  const emojis = [":P", "xD", ":)", ":D", ":3"];
  const [emoji, setEmoji] = useState("");

  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    setEmoji(emojis[randomIndex]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      {/* Cloud-like container */}
      <div className="bg-pink-100 p-16 rounded-full shadow-lg flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Kristy's first NextJS project :-)</h1>
        <div className="mt-4">
          <button
            onClick={handleClick}
            className="bg-pink-300 hover:bg-pink-400 text-black font-bold py-2 px-4 rounded"
          >
            press me!
          </button>
          {emoji && <span className="ml-4 text-2xl">{emoji}</span>}
        </div>
      </div>
    </main>
  );
}