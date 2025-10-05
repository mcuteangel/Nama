"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorManager } from '@/lib/error-manager';

interface SpeechToTextHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: (resetTranscript?: boolean) => void;
  clearTranscript: () => void;
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
  const finalTranscriptRef = useRef('');

  const browserSupportsSpeechRecognition =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition); // Added !! to ensure boolean type

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError(ErrorManager.getErrorMessage('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.'));
      ErrorManager.notifyUser('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.', 'error');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Enhanced settings for better dictation
    recognitionRef.current.continuous = true; // Keep listening even after a pause
    recognitionRef.current.maxAlternatives = 1; // Only get the most likely alternative
    recognitionRef.current.lang = i18n.language === 'fa' ? 'fa-IR' : 'en-US';
    
    // Increase the silence time before considering speech as complete
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          // Add final results to the final transcript
          finalTranscriptRef.current += ' ' + text;
          setTranscript(finalTranscriptRef.current);
        } else {
          // For interim results, show them but don't add to final yet
          setTranscript(finalTranscriptRef.current + ' ' + text);
        }
      }
    };
    
    recognitionRef.current.onend = () => {
      // Automatically restart recognition when it ends
      if (isListening) {
        recognitionRef.current?.start();
      }
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

  const stopListening = useCallback((resetTranscript = true) => {
    if (!isListening) return;
    if (recognitionRef.current) {
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Speech recognition already stopped');
      }
      if (resetTranscript) {
        finalTranscriptRef.current = ''; // Reset the final transcript
        setTranscript(''); // Clear the current transcript
      }
      console.log('Speech recognition stopped.');
    }
  }, []);
  
  // Add a function to clear the transcript without stopping recognition
  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
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
    clearTranscript,
    browserSupportsSpeechRecognition,
    error,
  } as const;
}