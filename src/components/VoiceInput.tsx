'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

interface SpeechRecognitionEvent {
  results: Array<Array<{ transcript: string }>>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, language }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      !('SpeechRecognition' in window) &&
      !('webkitSpeechRecognition' in window)
    ) {
      setSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!supported) {
      alert('Speech recognition is not supported in your current browser.');
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };

    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set voice language
    if (language === 'ta') {
      recognition.lang = 'ta-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      if (text) {
        onTranscript(text);
      }
    };

    recognition.start();
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-xl transition-all border ${
        isListening
          ? 'bg-rose-600 text-white border-rose-500 animate-bounce shadow-lg shadow-rose-500/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-400 hover:border-purple-500/30'
      }`}
      title={isListening ? 'Stop Listening' : 'Speak (Tamil/English Mic)'}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};
