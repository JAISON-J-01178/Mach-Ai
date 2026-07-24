'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check, Volume2, VolumeX, User } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);

    const voices = window.speechSynthesis.getVoices();
    const taVoice = voices.find((v) => v.lang.includes('ta') || v.lang.includes('IN'));
    if (taVoice) {
      utterance.voice = taVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
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
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs text-cyan-300 shadow-inner">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Code Snippet</span>
              <button
                onClick={() => navigator.clipboard.writeText(part.text)}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre-wrap">{part.text}</pre>
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
          ? 'bg-slate-900/90 border border-slate-800 ml-auto max-w-[88%] sm:max-w-[80%]'
          : 'bg-slate-950/80 border border-slate-800/80 max-w-[95%] sm:max-w-[90%]'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="relative w-8 h-8 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden relative">
              <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
            </div>
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-slate-200 font-heading">
            {isUser ? 'You' : 'MACHI Ai'}
          </span>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>

        <div className="text-sm text-slate-200 leading-relaxed font-normal break-words">
          {renderFormattedContent(message.content)}
        </div>

        {!isUser && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-900 text-slate-400 text-xs">
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                speaking ? 'bg-cyan-600 text-white' : 'hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title="Text to Speech"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{speaking ? 'Stop' : 'Listen'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:text-cyan-300 hover:bg-slate-900 transition-colors"
              title="Copy response"
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
          </div>
        )}
      </div>
    </div>
  );
};
