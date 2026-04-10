"use client";

import React from 'react';
import Link from 'next/link';
import { SignOutButton } from './SignOutButton';

interface NavbarProps {
  userEmail?: string;
}

const StarButton = ({ href, text }: { href: string; text: string }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="inline-flex items-center justify-center">
      <Link 
        href={href} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="no-underline"
      >
        <svg
          viewBox="0 0 180 180"
          className="navbar-star-svg"
          style={{
            width: '220px',
            height: '220px',
            transition: 'transform 300ms ease-in-out',
            transform: isHovered ? 'rotate(20deg)' : 'rotate(0deg)'
          }}
        >
          {/* 5-point star centered at 90,90: Outer R=85, Inner r=34 */}
          <polygon 
            points="90,5 110.0,62.5 170.8,63.7 122.3,100.5 140.0,158.8 90,124 40.0,158.8 57.7,100.5 9.2,63.7 70.0,62.5" 
            style={{ 
              transition: 'fill 300ms ease-in-out, stroke 300ms ease-in-out',
              fill: isHovered ? '#FAFF4A' : 'transparent',
              stroke: isHovered ? '#FAFF4A' : '#ffffff',
              strokeWidth: 3,
              pointerEvents: 'fill',
              cursor: 'pointer'
            }}
          />
          <text
            x="90"
            y="90"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="17"
            fontWeight="600"
            fontFamily="Handjet, sans-serif"
            pointerEvents="none"
            style={{
              fill: isHovered ? '#28290D' : '#ffffff',
              transition: 'fill 300ms ease-in-out'
            }}
          >
            {text}
          </text>
        </svg>
      </Link>
    </div>
  );
};

export function Navbar({ userEmail }: NavbarProps) {
  return (
    <div className="w-full">
      {/* Top right Sign Out button with margin */}
      <div className="flex justify-end" style={{ padding: '16px 24px' }}>
        <SignOutButton />
      </div>

      <nav className="w-full pb-4 px-4">
        <div className="navbar-nav flex items-center justify-center">
          {/* Left Link Container */}
          <div className="flex-1 flex justify-center">
            <StarButton href="/voting" text="voting" />
          </div>

          {/* Center: Title and Subtitle Pair */}
          <div className="navbar-title-container flex flex-col items-center text-center">
            <h1 className="navbar-title font-[700] leading-none uppercase m-0 text-white" style={{ fontSize: '90px' }}>
              the humor project
            </h1>
            {userEmail && (
              <h2 className="navbar-subtitle font-[600] mt-[-50px] text-white opacity-90" style={{ fontSize: '40px' }}>
                Welcome, {userEmail}
              </h2>
            )}
          </div>


          {/* Right Link Container */}
          <div className="flex-1 flex justify-center">
            <StarButton href="/upload" text="upload" />
          </div>
        </div>
      </nav>
    </div>
  );
}
