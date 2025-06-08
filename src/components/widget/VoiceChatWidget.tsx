'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import VoiceService, { audioUtils } from '@/lib/voice';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  audioUrl?: string;
  isPlaying?: boolean;
}

interface VoiceChatWidgetProps {
  embedded?: boolean;
  className?: string;
}

export function VoiceChatWidget({ embedded = false, className = '' }: VoiceChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micPermission, setMicPermission] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check microphone permissions and browser support
    const checkPermissions = async () => {
      if (VoiceService.isSupported()) {
        const hasPermission = await VoiceService.requestMicrophonePermission();
        setMicPermission(hasPermission);
      } else {
        setVoiceEnabled(false);
      }
    };

    if (isOpen && voiceEnabled) {
      checkPermissions();
    }
  }, [isOpen, voiceEnabled]);

  useEffect(() => {
    // Add initial greeting when opened
    if (isOpen && messages.length === 0) {
      const greeting: VoiceMessage = {
        id: `greeting-${Date.now()}`,
        type: 'assistant',
        content: "Hello! Welcome to Mario's Italian Restaurant! You can speak to me or type your message. How can I help you today? 🍽️",
        timestamp: new Date(),
      };
      setMessages([greeting]);
      
      // Play greeting audio if voice is enabled
      if (voiceEnabled) {
        generateAndPlayAudio(greeting.content);
      }
    }
  }, [isOpen, messages.length, voiceEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, isVoiceMessage = false) => {
    if (!content.trim()) return;

    const userMessage: VoiceMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      isVoice: isVoiceMessage,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Call our OpenAI-powered API
      const response = await fetch('/api/chat/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationHistory: messages.slice(-6), // Send last 6 messages for context
        }),
      });

      const data = await response.json();

      const assistantMessage: VoiceMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate and play audio response if voice is enabled
      if (voiceEnabled) {
        await generateAndPlayAudio(data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const fallbackMessage: VoiceMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndPlayAudio = async (text: string) => {
    try {
      setIsPlaying(true);
      const audioBuffer = await voiceService.textToSpeech(text);
      await voiceService.playAudio(audioBuffer);
    } catch (error) {
      console.error('Error generating/playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!micPermission) {
        const hasPermission = await VoiceService.requestMicrophonePermission();
        setMicPermission(hasPermission);
        if (!hasPermission) return;
      }

      setIsRecording(true);
      await voiceService.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await voiceService.stopRecording();
      setIsRecording(false);
      setIsLoading(true);

      // Convert speech to text
      const transcribedText = await voiceService.speechToText(audioBlob);
      
      if (transcribedText.trim()) {
        await sendMessage(transcribedText.trim(), true);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(currentMessage);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  function ChatContent() {
    return (
      <>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              {voiceEnabled ? '🎤' : '🤖'}
            </div>
            <div>
              <h3 className="font-semibold">Voice Assistant</h3>
              <p className="text-xs opacity-90">
                {isRecording ? 'Listening...' : isLoading ? 'Thinking...' : isPlaying ? 'Speaking...' : 'Ready to chat'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'bg-white/20' : 'bg-white/10'}`}
              title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {voiceEnabled ? '🎤' : '⌨️'}
            </button>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isMinimized ? '⬆️' : '⬇️'}
            </button>
            
            {!embedded && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <div className="flex flex-col h-96">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg message-bubble ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm whitespace-pre-wrap flex-1">{message.content}</p>
                      {message.isVoice && (
                        <span className="text-xs opacity-70 mt-1">🎤</span>
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-2 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce pulse-dot"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce pulse-dot"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce pulse-dot"></div>
                      </div>
                      <span className="text-sm">{isRecording ? 'Processing voice...' : 'Thinking...'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="p-4 border-t bg-gray-50">
              {voiceEnabled && (
                <div className="flex justify-center mb-3">
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {isRecording ? '⏹️' : '🎤'}
                  </motion.button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={voiceEnabled ? "Speak or type your message..." : "Type your message..."}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading || isRecording}
                />
                
                <Button
                  type="submit"
                  disabled={!currentMessage.trim() || isLoading || isRecording}
                  isLoading={isLoading}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Send
                </Button>
              </form>
              
              {voiceEnabled && !micPermission && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                  ⚠️ Microphone permission needed for voice features
                </p>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  if (embedded) {
    return (
      <div className={`h-full w-full bg-white rounded-lg shadow-lg ${className}`}>
        <ChatContent />
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl w-80 max-h-[500px] overflow-hidden"
        >
          <ChatContent />
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          🎤
        </motion.button>
      )}
    </div>
  );
} 