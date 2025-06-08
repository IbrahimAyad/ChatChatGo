'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Zap } from 'lucide-react';
import { elevenLabsConversation } from '../lib/elevenlabs';

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
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    checkMicrophonePermission();
    setupConversationHandler();
    
    return () => {
      cleanup();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermission(false);
        return;
      }

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
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission(false);
    }
  };

  const setupConversationHandler = () => {
    // Set up message handler for ElevenLabs responses
    elevenLabsConversation.onMessage((data) => {
      if (data.type === 'audio') {
        // Play received audio
        playAudioData(data.data);
      } else if (data.type === 'transcript' || data.content) {
        // Add assistant message to chat
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: data.content || data.transcript || 'Assistant response',
          timestamp: new Date()
        }]);
        setIsProcessing(false);
      }
    });
  };

  const startConversation = async () => {
    if (!micPermission) {
      alert('Microphone permission is required for voice chat');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Start ElevenLabs conversation
      const connected = await elevenLabsConversation.startConversation();
      
      if (connected) {
        setIsConnected(true);
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: `Hi! I'm your ${restaurantData?.name || 'restaurant'} assistant. How can I help you today?`,
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Failed to connect to conversation service');
      }
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start voice conversation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = async () => {
    if (!isConnected || !micPermission) return;

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

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioBuffer = await audioBlob.arrayBuffer();
        
        // Send audio to ElevenLabs
        try {
          await elevenLabsConversation.sendAudio(audioBuffer);
          setIsProcessing(true);
        } catch (error) {
          console.error('Failed to send audio:', error);
        }
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const playAudioData = async (audioData: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const endConversation = async () => {
    await elevenLabsConversation.endConversation();
    setIsConnected(false);
    setIsListening(false);
    setIsProcessing(false);
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    elevenLabsConversation.endConversation();
  };

  const sendTextMessage = async (text: string) => {
    if (!isConnected) return;

    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: text,
      timestamp: new Date()
    }]);

    try {
      setIsProcessing(true);
      await elevenLabsConversation.sendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MessageCircle className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                🎤 ElevenLabs Voice Assistant
              </h3>
              <p className="text-purple-200 text-sm">
                Natural conversation powered by AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="mb-6 h-64 overflow-y-auto bg-black/20 rounded-lg p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-purple-200 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Start a conversation to see messages here</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!isConnected ? (
            <button
              onClick={startConversation}
              disabled={isProcessing || micPermission === false}
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
            <div className="flex space-x-3">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`flex-1 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    {isProcessing ? 'Processing...' : 'Hold to Speak'}
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
          )}

          {micPermission === false && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm text-center">
                ⚠️ Microphone access is required for voice conversations
              </p>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-4 text-xs text-purple-200 space-y-1">
          <p>• Microphone: {micPermission ? '✅ Enabled' : '❌ Disabled'}</p>
          <p>• ElevenLabs: {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ Connected' : '❌ No API Key'}</p>
          <p>• Natural Voice: {isConnected ? '✅ Active' : '⏸️ Inactive'}</p>
        </div>
      </div>
    </div>
  );
} 