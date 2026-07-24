'use client';

import React, { useState } from 'react';
import { Sliders, Flame, Heart, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export interface MoodSettings {
  massLevel: number; // 0 - 100
  kalaaiLevel: number; // 0 - 100
  natpuScore: number; // 0 - 100
  dialect: 'chennai' | 'kovai' | 'madurai' | 'tanglish';
}

interface MoodSynthesizer3DProps {
  mood: MoodSettings;
  setMood: React.Dispatch<React.SetStateAction<MoodSettings>>;
}

export const MoodSynthesizer3D: React.FC<MoodSynthesizer3DProps> = ({ mood, setMood }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto my-2 px-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-500/10 transition-all"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-100 font-heading">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 text-slate-950 shadow-sm">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="gradient-text-cyan text-sm">3D Tamil Meme & Humor Synthesizer</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
            World-First AI Matrix
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline text-[11px]">
            Dialect: <strong className="text-cyan-300 capitalize">{mood.dialect}</strong>
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Synth Panel */}
      {isOpen && (
        <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/20 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mass Meter Sliders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Flame className="w-4 h-4" />
                  Cinema Mass Level (சினிமா மாஸ்)
                </span>
                <span className="font-mono text-cyan-300 font-bold">{mood.massLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood.massLevel}
                onChange={(e) => setMood({ ...mood, massLevel: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1.5 font-bold text-rose-400">
                  <Zap className="w-4 h-4" />
                  Kalaai & Roast Meter (கலாய் ரோஸ்ட்)
                </span>
                <span className="font-mono text-cyan-300 font-bold">{mood.kalaaiLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood.kalaaiLevel}
                onChange={(e) => setMood({ ...mood, kalaaiLevel: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Natpu Score & Dialects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-pink-400">
                  <Heart className="w-4 h-4" />
                  Natpu Warmth Score (நட்பு அன்பு)
                </span>
                <span className="font-mono text-cyan-300 font-bold">{mood.natpuScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood.natpuScore}
                onChange={(e) => setMood({ ...mood, natpuScore: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />

              {/* Slang Dialect Buttons */}
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-300 block mb-1.5">
                  Select Tamil Slang Dialect (தமிழ் ஸ்லாங்):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['tanglish', 'chennai', 'kovai', 'madurai'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setMood({ ...mood, dialect: d })}
                      className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all border ${
                        mood.dialect === d
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
