'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Tenant } from '@/types/tenant';

interface TenantChatWidgetProps {
  tenantId: string;
  className?: string;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

export default function TenantChatWidget({ tenantId, className }: TenantChatWidgetProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice functionality states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTenant = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setTenant(data.tenant);
        
        // Add welcome message
        if (data.tenant?.settings?.welcomeMessage) {
          setMessages([{
            id: 'welcome',
            content: data.tenant.settings.welcomeMessage,
            type: 'assistant',
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to load tenant:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !tenant) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      type: 'user',
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      content: 'Thinking...',
      type: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          message,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: data.response,
          type: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
        
        // Auto-speak AI responses if voice is enabled
        if (tenant?.settings?.voiceEnabled) {
          speakResponse(data.response);
        }
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: data.fallback || tenant.settings.fallbackMessage || "I'm sorry, I couldn't process your request.",
          type: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => prev.slice(0, -1).concat(errorMessage));
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: tenant.settings.fallbackMessage || "I'm sorry, something went wrong. Please try again.",
        type: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      // Process the audio after stopping
      setTimeout(() => {
        if (audioChunks.length > 0) {
          processVoiceInput();
        }
      }, 100);
    }
  };

  const processVoiceInput = async () => {
    if (audioChunks.length === 0) return;
    
    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('tenantId', tenantId);
      
      setIsLoading(true);
      
      const response = await fetch('/api/voice/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.transcription) {
        setInputValue(data.transcription);
        // Auto-send the transcribed message
        await sendMessage(data.transcription);
      } else {
        console.error('Speech-to-text failed:', data.error);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
    } finally {
      setIsLoading(false);
      setAudioChunks([]);
    }
  };

  const speakResponse = async (text: string) => {
    if (!tenant?.settings?.voiceEnabled) return;
    
    try {
      setIsPlayingAudio(true);
      
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tenantId,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.onended = () => setIsPlayingAudio(false);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlayingAudio(false);
    }
  };

  if (!tenant) {
    return null; // Or loading state
  }

  const widgetStyle = {
    position: 'fixed' as const,
    [tenant.branding.widgetPosition.includes('right') ? 'right' : 'left']: '20px',
    [tenant.branding.widgetPosition.includes('top') ? 'top' : 'bottom']: '20px',
    zIndex: 1000,
  };

  const primaryColor = tenant.branding.primaryColor;
  const secondaryColor = tenant.branding.secondaryColor;

  return (
    <div style={widgetStyle} className={className}>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white font-semibold text-xl transition-all duration-300 hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              borderRadius: `${tenant.branding.borderRadius}px`,
            }}
          >
            💬
            {tenant?.settings?.voiceEnabled && (
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">🎤</span>
              </div>
            )}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">!</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{
              width: tenant.branding.widgetSize === 'small' ? '320px' : 
                     tenant.branding.widgetSize === 'large' ? '400px' : '360px',
              height: '500px',
              borderRadius: `${tenant.branding.borderRadius}px`,
              fontFamily: tenant.branding.fontFamily,
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 text-white flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{tenant.name}</h3>
                  <p className="text-xs opacity-90">AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-800'
                    } ${message.isLoading ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: message.type === 'user' ? primaryColor : undefined,
                      borderRadius: `${tenant.branding.borderRadius * 0.8}px`,
                    }}
                  >
                    {message.content}
                    {message.isLoading && (
                      <span className="ml-1">
                        <span className="animate-ping">.</span>
                        <span className="animate-ping animation-delay-100">.</span>
                        <span className="animate-ping animation-delay-200">.</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${tenant.name.split(' ')[0]} anything...`}
                  disabled={isLoading || isRecording}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                  style={{
                    borderRadius: `${tenant.branding.borderRadius * 0.6}px`,
                    borderColor: primaryColor + '40',
                  }}
                />
                
                {/* Voice Button */}
                {tenant?.settings?.voiceEnabled && (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{
                      borderRadius: `${tenant.branding.borderRadius * 0.6}px`,
                    }}
                    title={isRecording ? 'Stop recording' : 'Start voice input'}
                  >
                    {isRecording ? '🛑' : '🎤'}
                  </button>
                )}
                
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim() || isRecording}
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: primaryColor,
                    borderRadius: `${tenant.branding.borderRadius * 0.6}px`,
                  }}
                >
                  {isLoading ? '⏳' : '📤'}
                </button>
              </div>
              
              {/* Voice status indicator */}
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-red-600 flex items-center space-x-2"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening... Tap the stop button when done</span>
                </motion.div>
              )}
              
              {/* Audio playback indicator */}
              {isPlayingAudio && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs flex items-center space-x-2"
                  style={{ color: primaryColor }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                  <span>Playing audio response...</span>
                </motion.div>
              )}

              {/* Powered by */}
              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">
                  Powered by{' '}
                  <span className="font-semibold" style={{ color: primaryColor }}>
                    ChatChatGo
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Business Hours Notice */}
      {tenant.settings.businessHours && (
        <AnimatePresence>
          {isOpen && !isBusinessHours(tenant.settings.businessHours) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800"
              style={{ borderRadius: `${tenant.branding.borderRadius * 0.8}px` }}
            >
              <span className="font-medium">ℹ️ Outside Business Hours</span>
              <br />
              We may not respond immediately, but we'll get back to you as soon as possible!
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {/* Hidden audio element for voice playback */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
}

function isBusinessHours(businessHours: any): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const daySchedule = businessHours[currentDay];
  
  if (!daySchedule?.open) {
    return false;
  }

  const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return currentTime >= openTime && currentTime <= closeTime;
} 