'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface SimpleMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SimpleChatWidgetProps {
  embedded?: boolean;
  className?: string;
}

export function SimpleChatWidget({ embedded = false, className = '' }: SimpleChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample responses for demo
  const demoResponses = [
    "Hello! Welcome to Mario's Italian Restaurant! How can I help you today? 🍕",
    "Great question! Our menu features authentic Italian dishes including pizza, pasta, and seafood. What sounds good to you?",
    "I'd be happy to help you make a reservation! For how many people and what date were you thinking?",
    "Our hours are Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm. We're located at 123 Main Street downtown!",
    "Our most popular dishes are the Margherita Pizza, Fettuccine Alfredo, and Chicken Parmigiana. All made fresh daily!",
    "Absolutely! We offer takeout and delivery. Would you like me to help you place an order?",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial greeting when opened
    if (isOpen && messages.length === 0) {
      const greeting: SimpleMessage = {
        id: `greeting-${Date.now()}`,
        type: 'assistant',
        content: "Hello! Welcome to our restaurant. How can I assist you today? 🍽️",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRandomResponse = () => {
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: SimpleMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
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

      const assistantMessage: SimpleMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to demo response if API fails
      const assistantMessage: SimpleMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or call us directly at (555) 123-4567!",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
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
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h3 className="font-semibold">Chat Assistant</h3>
              <p className="text-xs opacity-90">
                {isLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
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
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
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
                
                <Button
                  type="submit"
                  disabled={!currentMessage.trim() || isLoading}
                  isLoading={isLoading}
                  size="sm"
                >
                  Send
                </Button>
              </form>
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
        <div className="bg-white rounded-lg shadow-2xl w-80 max-h-[500px] overflow-hidden animate-fadeIn">
          <ChatContent />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        >
          💬
        </button>
      )}
    </div>
  );
} 