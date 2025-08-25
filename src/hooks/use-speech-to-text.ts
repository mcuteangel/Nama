"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorManager } from '@/lib/error-manager';

interface SpeechToTextHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
  error: string | null;
}

// Declare SpeechRecognition and webkitSpeechRecognition globally
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeechToText(): SpeechToTextHook {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const browserSupportsSpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError(ErrorManager.getErrorMessage('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.'));
      ErrorManager.notifyUser('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.', 'error');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Listen for a single utterance
    recognitionRef.current.interimResults = true; // Get interim results
    recognitionRef.current.lang = i18n.language === 'fa' ? 'fa-IR' : 'en-US'; // Set language based on i18n

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started.');
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended.');
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      const errorMessage = `خطا در تشخیص گفتار: ${event.error}`;
      setError(errorMessage);
      ErrorManager.logError(event, { context: 'useSpeechToText', eventType: 'onerror' });
      ErrorManager.notifyUser(errorMessage, 'error');
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current.start();
  }, [browserSupportsSpeechRecognition, i18n.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('Speech recognition stopped.');
    }
  }, []);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
    error,
  };
}