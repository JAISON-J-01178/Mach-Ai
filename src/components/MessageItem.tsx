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
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-[#27272a] bg-[#09090b] font-mono text-xs text-[#fafafa]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181b] border-b border-[#27272a] text-[11px] text-[#a1a1aa]">
              <span>Code Snippet</span>
              <button
                onClick={() => navigator.clipboard.writeText(part.text)}
                className="hover:text-[#fafafa] transition-colors flex items-center gap-1"
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
          ? 'bg-[#27272a] border border-[#3f3f46] ml-auto max-w-[88%] sm:max-w-[80%]'
          : 'bg-[#18181b] border border-[#27272a] max-w-[95%] sm:max-w-[90%]'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-[#fafafa] text-[#09090b] font-bold flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-[#09090b]" />
          </div>
        ) : (
          <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#27272a] shadow-sm">
            <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-[#fafafa] font-heading">
            {isUser ? 'You' : 'Machi AI'}
          </span>
          <span className="text-[10px] text-[#71717a]">{message.timestamp}</span>
        </div>

        <div className="text-sm text-[#fafafa] leading-relaxed font-normal break-words">
          {renderFormattedContent(message.content)}
        </div>

        {/* Action Toolbar for AI responses */}
        {!isUser && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#27272a] text-[#a1a1aa] text-xs">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
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
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
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
                  feedback === 'up' ? 'text-[#fafafa] bg-[#27272a]' : 'hover:text-[#fafafa] hover:bg-[#27272a]'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                className={`p-1 rounded-md transition-colors ${
                  feedback === 'down' ? 'text-rose-400 bg-rose-500/10' : 'hover:text-[#fafafa] hover:bg-[#27272a]'
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
