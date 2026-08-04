'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickSplashProps {
  onFinish: () => void;
}

export const QuickSplash: React.FC<QuickSplashProps> = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onFinish, 400);
    }, 1100);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 selection:bg-sky-500 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute w-64 h-64 rounded-full bg-sky-500/10 blur-[80px]" />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center text-center p-6"
          >
            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-sky-500/20 mb-4">
              <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" priority />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text-sky font-heading mb-1">
              Machi AI
            </h1>
            <p className="text-xs font-semibold text-slate-400 font-heading">
              உன் தோழன், உன் AI நண்பன்
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
