'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadingOut(true);
    }, 2200);

    const timer2 = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-700 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D Glowing Ambient Lights */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/20 blur-[100px] animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-purple-500/20 blur-[100px] animate-pulse delay-500" />

      <div className="relative z-10 flex flex-col items-center text-center p-6 animate-scaleUp">
        {/* Logo Container with 3D Border Glow */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-2xl shadow-cyan-500/40 mb-6">
          <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden flex items-center justify-center relative">
            <Image
              src="/logo.jpg"
              alt="MACHI Ai Logo"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider gradient-text-cyan font-heading mb-2">
          MACHI Ai
        </h1>

        {/* Tamil Slogan */}
        <p className="text-lg sm:text-xl font-bold text-slate-200 font-heading mb-1">
          உன் தோழன், உன் AI நண்பன்
        </p>

        <p className="text-xs tracking-widest text-cyan-400 font-semibold uppercase mb-6">
          Smart • Friendly • Always Here
        </p>

        {/* Loading Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Starting AI Engine...</span>
        </div>
      </div>
    </div>
  );
};
