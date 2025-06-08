'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Zap, AlertTriangle } from 'lucide-react';
import { elevenLabsConversation, elevenLabsTTS, getRestaurantVoice } from '../lib/elevenlabs';

interface VoiceChatProps {
  restaurantData?: any;
  className?: string;
}

export default function ElevenLabsVoiceChat({ 
  restaurantData, 
  className = '' 
}: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    checkMicrophonePermission();
    setupSpeechRecognition();
    
    return () => {
      cleanup();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('MediaDevices API not supported');
        setMicPermission(false);
        setError('Microphone not supported in this browser');
        return;
      }

      // Request permission and immediately stop to check access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      setError(null);
      console.log('✅ Microphone permission granted');
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      setMicPermission(false);
      
      if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please enable it in your browser settings.');
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
        if (result.trim()) {
          sendTextMessage(result.trim());
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else {
          setError('Speech recognition error: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const startConversation = async () => {
    if (micPermission === false) {
      // Try to request permission again
      await checkMicrophonePermission();
      if (micPermission === false) {
        setError('Microphone permission is required for voice chat. Please enable it in your browser settings.');
        return;
      }
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Start conversation
      const connected = await elevenLabsConversation.startConversation();
      
      if (connected) {
        setIsConnected(true);
        const welcomeMessage = {
          type: 'assistant' as const,
          content: `Hi! I'm your ${restaurantData?.name || 'restaurant'} voice assistant. You can speak to me or type your message. How can I help you today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);

        // Speak welcome message
        await speakResponse(welcomeMessage.content);
      } else {
        throw new Error('Failed to connect to conversation service');
      }
      
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start voice conversation: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = async () => {
    if (!isConnected || micPermission !== true) return;

    try {
      setError(null);
      
      if (recognitionRef.current) {
        // Use Speech Recognition API
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        // Fallback to MediaRecorder
        await startRecording();
      }
      
    } catch (error: any) {
      console.error('Failed to start listening:', error);
      setError('Failed to start listening: ' + error.message);
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsListening(false);
      };

      mediaRecorder.start();
      setIsListening(true);
      console.log('🎤 Started recording with format:', mimeType);
      
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      setError('Failed to access microphone: ' + error.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
    
    setIsListening(false);
  };

  const sendTextMessage = async (text: string) => {
    if (!isConnected || !text.trim()) return;

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
      
      // Speak the response
      await speakResponse(response);
      
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
      
      if (audioData && typeof window !== 'undefined') {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedAudio = await audioContext.decodeAudioData(audioData);
        
        const source = audioContext.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(audioContext.destination);
        
        source.onended = () => {
          setIsSpeaking(false);
        };
        
        source.start();
      }
    } catch (error: any) {
      console.error('Speech synthesis error:', error);
      setError('Speech synthesis failed: ' + error.message);
      setIsSpeaking(false);
    }
  };

  const generateAIResponse = (userText: string, restaurantData: any): string => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('menu') || lowerText.includes('food') || lowerText.includes('dish')) {
      return `Great! We have an amazing menu with fresh ${restaurantData?.cuisine || 'dishes'}. Our specialties include our signature items and daily specials. What type of cuisine are you in the mood for?`;
    }
    
    if (lowerText.includes('reservation') || lowerText.includes('book') || lowerText.includes('table')) {
      return `I'd be happy to help you with a reservation! We're open ${restaurantData?.hours || 'daily'} and we have availability. What date and time would work best for you?`;
    }
    
    if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('where')) {
      return `We're located at ${restaurantData?.address || 'our main location'}. We're easily accessible and have parking available. Would you like directions?`;
    }
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return `Hello! Welcome to ${restaurantData?.name || 'our restaurant'}! I'm here to help you with any questions about our menu, reservations, or anything else. What can I assist you with today?`;
    }
    
    return `Thank you for your question! I'm here to help with information about ${restaurantData?.name || 'our restaurant'}, including our menu, reservations, hours, and location. How can I assist you today?`;
  };

  const endConversation = async () => {
    await elevenLabsConversation.endConversation();
    setIsConnected(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setMessages([]);
    setError(null);
    cleanup();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    elevenLabsConversation.endConversation();
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
          {!isConnected ? (
            <button
              onClick={startConversation}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Zap className="animate-spin h-4 w-4 mr-2" />
                  Connecting...
                </span>
              ) : (
                'Start Voice Conversation'
              )}
            </button>
          ) : (
            <>
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
                      {isProcessing || isSpeaking ? 'Processing...' : 'Speak'}
                    </>
                  )}
                </button>

                <button
                  onClick={endConversation}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                >
                  End Chat
                </button>
              </div>

              {/* Text Input */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Or type your message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing || isSpeaking}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </form>
            </>
          )}

          {micPermission === false && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm text-center">
                ⚠️ Microphone access is required for voice conversations.{' '}
                <button 
                  onClick={checkMicrophonePermission}
                  className="underline hover:text-red-100"
                >
                  Click to retry
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-4 text-xs text-purple-200 space-y-1">
          <p suppressHydrationWarning>
            • Microphone: {micPermission === null ? '⏳ Checking...' : micPermission ? '✅ Enabled' : '❌ Disabled'}
          </p>
          <p>• ElevenLabs: {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ Connected' : '❌ No API Key'}</p>
          <p suppressHydrationWarning>
            • Voice Chat: {isConnected ? '✅ Active' : '⏸️ Inactive'}
          </p>
          <p suppressHydrationWarning>
            • Speech Recognition: {recognitionRef.current ? '✅ Available' : '⚠️ Limited'}
          </p>
        </div>
      </div>
    </div>
  );
} 