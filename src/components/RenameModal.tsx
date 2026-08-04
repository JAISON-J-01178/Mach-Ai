'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, X } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  currentTitle,
  onSave,
  onCancel
}) => {
  const [titleInput, setTitleInput] = useState(currentTitle);

  useEffect(() => {
    setTitleInput(currentTitle);
  }, [currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onSave(titleInput.trim());
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-2xl"
        >
          {/* Close Icon */}
          <button
            onClick={onCancel}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#27272a] text-[#fafafa]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-[#fafafa]">
                Rename Chat Thread
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                Enter a custom title for this conversation.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Chat title..."
                autoFocus
                className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#52525b] rounded-xl px-3.5 py-2 text-sm text-[#fafafa] outline-none transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-semibold transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!titleInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ffffff] text-[#09090b] text-xs font-bold shadow-md transition-all hover:bg-[#e4e4e7] disabled:opacity-50 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Title</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
