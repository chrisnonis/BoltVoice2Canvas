import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { cn } from '../lib/utils';

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptChange, className }) => {
  const {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition();

  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  const handleToggleRecording = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleRetry = () => {
    resetTranscript();
    setShowPermissionHelp(false);
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      return {
        browser: 'Chrome',
        steps: [
          'Click the microphone icon in the address bar',
          'Select "Always allow" for microphone access',
          'Refresh the page and try again'
        ]
      };
    } else if (userAgent.includes('Firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the microphone icon in the address bar',
          'Select "Allow" for microphone access',
          'Refresh the page and try again'
        ]
      };
    } else if (userAgent.includes('Safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari > Settings > Websites > Microphone',
          'Set this website to "Allow"',
          'Refresh the page and try again'
        ]
      };
    } else if (userAgent.includes('Edge')) {
      return {
        browser: 'Edge',
        steps: [
          'Click the microphone icon in the address bar',
          'Select "Always allow" for microphone access',
          'Refresh the page and try again'
        ]
      };
    }
    
    return {
      browser: 'your browser',
      steps: [
        'Look for a microphone icon in your address bar',
        'Allow microphone access for this website',
        'Refresh the page and try again'
      ]
    };
  };

  if (!isSupported) {
    return (
      <div className={cn("rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/30", className)}>
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-warning-800 dark:text-warning-200">
              Speech Recognition Not Supported
            </h3>
            <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
              Please use Chrome, Edge, or Safari for voice recording functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-error-600 dark:text-error-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
                  Recording Error
                </h3>
                <p className="mt-1 text-sm text-error-700 dark:text-error-300">
                  {error}
                </p>
                
                {error.includes('denied') || error.includes('not-allowed') ? (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowPermissionHelp(!showPermissionHelp)}
                      className="inline-flex items-center text-sm font-medium text-error-700 hover:text-error-800 dark:text-error-300 dark:hover:text-error-200"
                    >
                      <Settings className="mr-1 h-4 w-4" />
                      Show permission instructions
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center text-sm font-medium text-error-700 hover:text-error-800 dark:text-error-300 dark:hover:text-error-200"
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Permission Help */}
          {showPermissionHelp && (error.includes('denied') || error.includes('not-allowed')) && (
            <div className="mt-4 border-t border-error-200 pt-4 dark:border-error-700">
              <h4 className="text-sm font-medium text-error-800 dark:text-error-200 mb-2">
                How to enable microphone access in {getBrowserInstructions().browser}:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-error-700 dark:text-error-300">
                {getBrowserInstructions().steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center rounded-md bg-error-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center rounded-md border border-error-300 bg-white px-3 py-1.5 text-xs font-medium text-error-700 hover:bg-error-50 dark:border-error-600 dark:bg-error-900 dark:text-error-300 dark:hover:bg-error-800"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleToggleRecording}
          disabled={!isSupported}
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-50",
            isListening
              ? "bg-error-600 text-white shadow-lg hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600"
              : "bg-primary-600 text-white shadow-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          )}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening ? (
            <>
              <MicOff className="h-6 w-6" />
              <div className="absolute inset-0 rounded-full bg-error-600 animate-pulse opacity-75"></div>
            </>
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Recording Status */}
      <div className="text-center">
        {isListening ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-error-500 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-error-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 bg-error-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Listening...
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click the microphone to start recording
          </p>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start space-x-2">
            <Volume2 className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Recorded Speech:
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {transcript}
              </p>
              {confidence > 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Confidence: {Math.round(confidence * 100)}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Alt + M</kbd> to toggle recording
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;