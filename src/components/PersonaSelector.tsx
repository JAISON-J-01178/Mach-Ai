'use client';

import React from 'react';
import { Smile, Film, Flame, Briefcase } from 'lucide-react';

interface PersonaSelectorProps {
  currentPersona: string;
  setPersona: (persona: string) => void;
}

export const PERSONAS = [
  {
    id: 'chill',
    name: 'Chill Machi',
    tamilName: 'நட்பான மச்சி',
    icon: Smile,
    desc: 'Friendly Tamil bro, casual & supportive',
    color: 'from-purple-500 to-indigo-500',
    badge: 'Popular'
  },
  {
    id: 'cinema',
    name: 'Cinema Machi',
    tamilName: 'சினிமா மச்சி',
    icon: Film,
    desc: 'Mass dialogues, trending quotes & cinema vibes',
    color: 'from-amber-500 to-orange-500',
    badge: 'Trending'
  },
  {
    id: 'kalaai',
    name: 'Kalaai Machi',
    tamilName: 'கலாய் மச்சி',
    icon: Flame,
    desc: 'Hilarious comedy roasts & funny Tamil banter',
    color: 'from-rose-500 to-pink-500',
    badge: 'Funny'
  },
  {
    id: 'pro',
    name: 'Pro Machi',
    tamilName: 'பிராஃபெஷனல்',
    icon: Briefcase,
    desc: 'Code, work, translation & smart solutions',
    color: 'from-cyan-500 to-blue-500',
    badge: 'Smart'
  }
];

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  currentPersona,
  setPersona
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = currentPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={`relative text-left p-3 rounded-xl transition-all duration-200 border ${
                isSelected
                  ? 'bg-slate-900/90 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div
                  className={`p-1.5 rounded-lg bg-gradient-to-br ${p.color} text-white shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {p.badge}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-100 font-heading tracking-wide">
                {p.name}
              </div>
              <div className="text-[11px] text-purple-300/80 font-medium">
                {p.tamilName}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {p.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
