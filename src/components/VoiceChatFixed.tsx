'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageCircle, AlertTriangle } from 'lucide-react';
import { elevenLabsTTS, getRestaurantVoice } from '../lib/elevenlabs';

interface VoiceChatFixedProps {
  restaurantData?: any;
  className?: string;
}

export default function VoiceChatFixed({ 
  restaurantData, 
  className = '' 
}: VoiceChatFixedProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    checkMicrophonePermission();
    setupSpeechRecognition();
    
    return () => {
      cleanup();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission(false);
        setError('Microphone not supported in this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      setError(null);
      console.log('✅ Microphone permission granted');
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      setMicPermission(false);
      
      if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please enable microphone in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Microphone error: ' + error.message);
      }
    }
  };

  const setupSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        console.log('Speech recognition result:', result);
        if (result.trim()) {
          sendTextMessage(result.trim());
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try speaking clearly.');
        } else if (event.error === 'network') {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Speech recognition error: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        setError(null);
        console.log('Speech recognition started');
      };
    } else {
      setError('Speech recognition not supported in this browser. Please use Chrome, Safari, or Edge.');
    }
  };

  const startListening = async () => {
    if (!isClient || micPermission !== true) {
      if (micPermission === false) {
        await checkMicrophonePermission();
      }
      return;
    }

    try {
      setError(null);
      
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
        console.log('Started listening...');
      } else {
        setError('Speech recognition not available');
      }
      
    } catch (error: any) {
      console.error('Failed to start listening:', error);
      setError('Failed to start listening: ' + error.message);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      console.log('Stopped listening');
    }
    setIsListening(false);
  };

  const sendTextMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to chat
    const userMessage = {
      type: 'user' as const,
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsProcessing(true);
      setError(null);
      
      // Generate AI response
      const response = generateAIResponse(text, restaurantData);
      
      // Add AI response
      const aiMessage = {
        type: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if possible
      if (process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
        await speakResponse(response);
      }
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Failed to process message: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      const voiceId = getRestaurantVoice('professional');
      const audioData = await elevenLabsTTS(text, voiceId);
      
      if (audioData && isClient) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedAudio = await audioContext.decodeAudioData(audioData);
        
        const source = audioContext.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          setIsSpeaking(false);
        };
        
        source.start();
        console.log('Started speaking response');
      }
    } catch (error: any) {
      console.error('Speech synthesis error:', error);
      // Don't show error for TTS failures - just log them
      setIsSpeaking(false);
    }
  };

  const generateAIResponse = (userText: string, restaurantData: any): string => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('menu') || lowerText.includes('food') || lowerText.includes('dish')) {
      return `Great question about our menu! We have amazing ${restaurantData?.cuisine || 'cuisine'} with daily specials. Our chef's recommendations include fresh seasonal dishes. What type of food interests you most?`;
    }
    
    if (lowerText.includes('reservation') || lowerText.includes('book') || lowerText.includes('table')) {
      return `I'd be happy to help with reservations! We're open ${restaurantData?.hours || 'daily'} and have tables available. What date and time work best for your party?`;
    }
    
    if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('where')) {
      return `We're conveniently located at ${restaurantData?.address || 'our main location downtown'}. There's plenty of parking and we're accessible by public transport. Need directions?`;
    }
    
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      return `Hello and welcome to ${restaurantData?.name || 'our restaurant'}! I'm your AI assistant and I'm here to help with menu questions, reservations, directions, or anything else. How can I assist you today?`;
    }

    if (lowerText.includes('hours') || lowerText.includes('open') || lowerText.includes('closed')) {
      return `We're open ${restaurantData?.hours || 'Monday through Sunday from 11 AM to 10 PM'}. We also offer takeout and delivery during these hours. Would you like to know about any special holiday hours?`;
    }
    
    return `Thanks for your question! I'm here to help with information about ${restaurantData?.name || 'our restaurant'}, including our menu, making reservations, directions, hours, and special events. What would you like to know?`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendTextMessage(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const clearError = () => {
    setError(null);
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Don't render until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <div className={`bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-xl p-6 text-white ${className}`}>
        <div className="text-center">
          <div className="animate-pulse">Loading voice assistant...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-xl p-6 text-white ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            🎤 Voice Assistant
          </h3>
          <p className="text-purple-200 text-sm mt-2">
            {restaurantData?.name || 'Restaurant'} AI Assistant
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-300 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{error}</p>
              <button 
                onClick={clearError}
                className="text-red-300 hover:text-red-100 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/20 text-purple-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1" suppressHydrationWarning>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {(isProcessing || isSpeaking) && (
              <div className="flex justify-start">
                <div className="bg-white/20 text-purple-100 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs">{isSpeaking ? 'Speaking...' : 'Thinking...'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex space-x-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking || micPermission !== true}
              className={`flex-1 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  {isProcessing || isSpeaking ? 'Processing...' : 'Start Talking'}
                </>
              )}
            </button>
          </div>

          {/* Text Input */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type your message here..."
              disabled={isProcessing || isSpeaking}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing || isSpeaking}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </form>

          {micPermission === false && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm text-center">
                ⚠️ Microphone access required for voice chat.{' '}
                <button 
                  onClick={checkMicrophonePermission}
                  className="underline hover:text-red-100"
                >
                  Enable microphone
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="text-xs text-purple-200 space-y-1">
          <p suppressHydrationWarning>
            • Microphone: {micPermission === null ? '⏳ Checking...' : micPermission ? '✅ Ready' : '❌ Disabled'}
          </p>
          <p>
            • Voice Synthesis: {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ ElevenLabs' : '⚠️ No API Key'}
          </p>
          <p suppressHydrationWarning>
            • Speech Recognition: {recognitionRef.current ? '✅ Available' : '❌ Not supported'}
          </p>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-purple-200 text-xs text-center">
            💡 <strong>How to use:</strong> Click "Start Talking" and speak clearly, or type your message below. 
            Ask about our menu, reservations, location, or hours!
          </p>
        </div>
      </div>
    </div>
  );
} 