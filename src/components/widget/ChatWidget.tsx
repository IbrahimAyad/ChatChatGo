'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { WidgetConfig, Message, ChatSession } from '@/types';
import { VoiceHandler } from './VoiceHandler';
import { MessageList } from './MessageList';
import { LeadCaptureForm } from './LeadCaptureForm';

interface ChatWidgetProps {
  config: WidgetConfig;
  embedded?: boolean;
  className?: string;
}

export function ChatWidget({ config, embedded = false, className = '' }: ChatWidgetProps) {
  // Widget state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Voice state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Lead capture state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceHandlerRef = useRef<VoiceHandler | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize voice handler
  useEffect(() => {
    voiceHandlerRef.current = new VoiceHandler({
      onTranscript: handleTranscript,
      onListeningChange: setIsListening,
      onError: handleVoiceError,
    });

    return () => {
      voiceHandlerRef.current?.cleanup();
    };
  }, []);

  // Check voice permissions on mount
  useEffect(() => {
    if (config.appearance.colors?.primary) {
      document.documentElement.style.setProperty('--widget-primary', config.appearance.colors.primary);
    }
    
    checkVoicePermissions();
  }, [config]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkVoicePermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setIsVoiceEnabled(true);
    } catch (error) {
      console.warn('Voice permission denied, falling back to text only');
      setIsVoiceEnabled(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSession = async () => {
    try {
      const response = await fetch(`/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: config.botId,
          tenantId: config.tenantId,
          metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            deviceType: getDeviceType(),
            voiceUsed: false,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to start session');
      
      const sessionData = await response.json();
      setSession(sessionData.data);
      
      // Add greeting message
      if (config.behavior.greeting) {
        const greetingMessage: Message = {
          id: `greeting-${Date.now()}`,
          sessionId: sessionData.data.id,
          type: 'assistant',
          content: config.behavior.greeting,
          timestamp: new Date(),
        };
        setMessages([greetingMessage]);
      }
    } catch (error) {
      console.error('Failed to start chat session:', error);
    }
  };

  const sendMessage = async (content: string, isVoice = false) => {
    if (!session || !content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sessionId: session.id,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: content.trim(),
          isVoice,
          botId: config.botId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const result = await response.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sessionId: session.id,
        type: 'assistant',
        content: result.data.response,
        audioUrl: result.data.audioUrl,
        intent: result.data.intent,
        confidence: result.data.confidence,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Play audio if available and not muted
      if (assistantMessage.audioUrl && !isMuted) {
        playAudio(assistantMessage.audioUrl);
      }

      // Show lead form if suggested
      if (result.data.shouldCollectLead && !leadCaptured) {
        setTimeout(() => setShowLeadForm(true), 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sessionId: session.id,
        type: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscript = (transcript: string) => {
    if (transcript.trim()) {
      sendMessage(transcript, true);
    }
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice error:', error);
    // Could show a toast notification here
  };

  const toggleVoiceRecording = () => {
    if (!isVoiceEnabled) return;

    if (isListening) {
      voiceHandlerRef.current?.stopListening();
    } else {
      voiceHandlerRef.current?.startListening();
    }
  };

  const playAudio = async (audioUrl: string) => {
    try {
      setIsPlaying(true);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendMessage(currentMessage);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!session) {
      startSession();
    }
  };

  const handleLeadSubmitted = () => {
    setShowLeadForm(false);
    setLeadCaptured(true);
  };

  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Widget positioning
  const getWidgetPosition = () => {
    if (embedded) return {};
    
    switch (config.appearance.widgetPosition) {
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'center':
        return { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
      default: // bottom-right
        return { bottom: '20px', right: '20px' };
    }
  };

  if (embedded) {
    return (
      <div className={`h-full w-full bg-white rounded-lg shadow-lg ${className}`}>
        <ChatContent />
      </div>
    );
  }

  function ChatContent() {
    return (
      <>
        {/* Chat Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ backgroundColor: config.appearance.colors?.primary || '#0ea5e9' }}
        >
          <div className="flex items-center space-x-3">
            {config.appearance.avatar && (
              <img 
                src={config.appearance.avatar} 
                alt="Assistant" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-white">
              <h3 className="font-semibold">Chat Assistant</h3>
              <p className="text-xs opacity-90">
                {isLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            
            {!embedded && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Chat Body */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="flex flex-col h-96"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading}
                  isPlaying={isPlaying}
                  onPlayAudio={playAudio}
                />
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-gray-50">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  
                  {isVoiceEnabled && (
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={!currentMessage.trim() || isLoading}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lead Capture Form */}
        <AnimatePresence>
          {showLeadForm && (
            <LeadCaptureForm 
              onSubmit={handleLeadSubmitted}
              onClose={() => setShowLeadForm(false)}
              config={config}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div 
      className="fixed z-50"
      style={getWidgetPosition()}
    >
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-lg shadow-2xl w-80 max-h-[500px] overflow-hidden"
          >
            <ChatContent />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={handleOpen}
            className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: config.appearance.colors?.primary || '#0ea5e9' }}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
} 