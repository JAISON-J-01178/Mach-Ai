'use client';

import React from 'react';

export const Ticker3D: React.FC = () => {
  const items = [
    'MACHI Ai',
    'உன் தோழன்',
    'உன் AI நண்பன்',
    'SMART',
    'FRIENDLY',
    'ALWAYS HERE',
    'மச்சி AI',
    'TAMIL & ENGLISH AI'
  ];

  return (
    <div className="w-full overflow-hidden bg-slate-950/40 border-y border-cyan-500/10 py-1.5 backdrop-blur-md">
      <div className="flex whitespace-nowrap animate-marquee">
        {items.concat(items).map((text, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 mx-4 text-xs font-semibold tracking-wider font-heading text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
