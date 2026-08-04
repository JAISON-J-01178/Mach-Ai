'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, User } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedContent = (content: string) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', text: match[1].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs text-sky-300">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Code Snippet</span>
              <button
                onClick={() => navigator.clipboard.writeText(part.text)}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto whitespace-pre-wrap leading-relaxed">{part.text}</pre>
          </div>
        );
      }

      const formattedText = part.text.split('\n').map((line, lIdx) => (
        <p key={lIdx} className={lIdx > 0 ? 'mt-2' : ''}>
          {line}
        </p>
      ));

      return <div key={index}>{formattedText}</div>;
    });
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-2xl transition-all ${
        isUser
          ? 'bg-slate-800/80 border border-slate-700/80 ml-auto max-w-[88%] sm:max-w-[80%]'
          : 'bg-slate-900/90 border border-slate-800 max-w-[95%] sm:max-w-[90%]'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-slate-950 shadow-md">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-700 shadow-md">
            <Image src="/logo.jpg" alt="Mach-AI" fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-slate-200 font-heading">
            {isUser ? 'You' : 'Mach-AI'}
          </span>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>

        <div className="text-sm text-slate-200 leading-relaxed font-normal break-words">
          {renderFormattedContent(message.content)}
        </div>

        {/* Action Toolbar for AI responses */}
        {!isUser && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800 text-slate-400 text-xs">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-sky-300 hover:bg-slate-800 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-sky-300 hover:bg-slate-800 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                className={`p-1 rounded-md transition-colors ${
                  feedback === 'up' ? 'text-sky-400 bg-sky-500/10' : 'hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                className={`p-1 rounded-md transition-colors ${
                  feedback === 'down' ? 'text-rose-400 bg-rose-500/10' : 'hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
