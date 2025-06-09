import { useState, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // First check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      
      if (err.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotSupportedError') {
        throw new Error('Microphone access is not supported in this browser.');
      } else {
        throw new Error('Failed to access microphone. Please check your browser settings.');
      }
    }
  };

  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      setError(null);
      
      // Check microphone permission first
      await checkMicrophonePermission();

      // Create speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsListening(false);
        
        switch (event.error) {
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
            break;
          case 'no-speech':
            setError('No speech detected. Please speak clearly and try again.');
            break;
          case 'audio-capture':
            setError('No microphone found. Please connect a microphone and try again.');
            break;
          case 'network':
            setError('Network error occurred. Please check your internet connection.');
            break;
          case 'service-not-allowed':
            setError('Speech recognition service not allowed. Please try again.');
            break;
          case 'bad-grammar':
            setError('Speech recognition grammar error. Please try again.');
            break;
          case 'language-not-supported':
            setError('Language not supported. Please try again.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setError(err.message || 'Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
};