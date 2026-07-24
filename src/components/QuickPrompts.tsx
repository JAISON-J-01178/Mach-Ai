'use client';

import React from 'react';
import { Heart, Sparkles, Code, MessageCircle, Music, Flame } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

const QUICK_ITEMS = [
  {
    icon: Heart,
    label: 'Love Advice',
    tamil: 'காதல் அட்வைஸ் 💔',
    prompt: 'Machi, enakku oru love advice thaa da! Love ah kaapathuradhukku enna pannanum?',
    color: 'hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400'
  },
  {
    icon: Flame,
    label: 'Tamil Meme Caption',
    tamil: 'மீம் கேப்ஷன் 🎭',
    prompt: 'Machi! Trending Tamil meme captions 5 funny ah sollu da Vadivelu style la!',
    color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400'
  },
  {
    icon: Code,
    label: 'Tanglish Code Helper',
    tamil: 'கோடிங் உதவி 💻',
    prompt: 'Machi, Javascript array map vs filter enna nu simple Tanglish la explain pannu!',
    color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400'
  },
  {
    icon: MessageCircle,
    label: 'Slang Translator',
    tamil: 'ஸ்லாங் டிரான்ஸ்லேட்டர் 🗣️',
    prompt: 'Chennai slang "Gethu", "Kalaai", "Gabbai" and Kovai slang "Enna maama" translate to simple English!',
    color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400'
  },
  {
    icon: Music,
    label: 'Instant Tamil Poem',
    tamil: 'தமிழ் கவிதை 🎵',
    prompt: 'Natpu (Friendship) pathi oru mass Tamil kavithai 4 lines sollu Machi!',
    color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400'
  },
  {
    icon: Sparkles,
    label: 'Cinema Dialogue Remake',
    tamil: 'சினிமா டயலாக் 🎬',
    prompt: 'Rajini / Vijay style mass Tamil dialogue for surviving Monday morning office work!',
    color: 'hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400'
  }
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-4">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 px-1">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span>Quick Tamil Trending Prompts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 transition-all ${item.color} active:scale-95`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.tamil}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
