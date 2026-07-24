'use client';

import React, { useState } from 'react';
import { Message } from '@/components/MessageItem';
import { getUserMemory, UserMemory } from '@/lib/memoryEngine';
import { X, Download, FileText, Copy, Check, ShieldCheck, Brain } from 'lucide-react';

interface ExportVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  userName: string;
}

export const ExportVaultModal: React.FC<ExportVaultModalProps> = ({
  isOpen,
  onClose,
  messages,
  userName
}) => {
  const [copied, setCopied] = useState(false);
  const memory: UserMemory = getUserMemory(userName);

  if (!isOpen) return null;

  // Format messages into clean markdown string
  const generateMarkdown = () => {
    let md = `# MACHI Ai Chat Transcript\n`;
    md += `*Exported on: ${new Date().toLocaleString()}*\n`;
    md += `*User: ${userName || 'Machi User'}*\n\n`;
    md += `---\n\n`;

    messages.forEach((m) => {
      const sender = m.role === 'user' ? `**User (${userName || 'You'})**` : `**MACHI Ai**`;
      md += `${sender} - *${m.timestamp}*\n${m.content}\n\n---\n\n`;
    });

    return md;
  };

  const handleDownloadFile = (format: 'md' | 'txt') => {
    const content = generateMarkdown();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `machi-ai-chat-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-100">
              Export Chat & Memory Vault
            </h2>
            <p className="text-xs text-slate-400">
              Export transcript to file or view your AI memory settings
            </p>
          </div>
        </div>

        {/* Export Options Section */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>1-Click Transcript Export</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleDownloadFile('md')}
              disabled={messages.length === 0}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download .MD</span>
            </button>

            <button
              onClick={() => handleDownloadFile('txt')}
              disabled={messages.length === 0}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .TXT</span>
            </button>
          </div>

          <button
            onClick={handleCopyTranscript}
            disabled={messages.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Transcript Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Full Transcript to Clipboard</span>
              </>
            )}
          </button>
        </div>

        {/* AI Memory Vault Info */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>AI Memory Vault</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Encrypted
            </span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            MACHI Ai remembers your name (<strong className="text-slate-200">{memory.userName || userName || 'Machi User'}</strong>) and automatically prunes old chat history to keep your interface clean while retaining user identity.
          </p>
        </div>
      </div>
    </div>
  );
};
