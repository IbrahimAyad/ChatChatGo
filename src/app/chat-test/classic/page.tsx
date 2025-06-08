'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassicChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to the Classic Chat Widget. I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: ''
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle hydration by setting initial timestamp on client
  useEffect(() => {
    setMounted(true);
    setMessages(prev => prev.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || new Date().toLocaleTimeString()
    })));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "Thank you for your message! This is the Classic Chat Widget - clean, simple, and focused on clear communication. How else can I assist you?",
        sender: 'ai' as const,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render time until mounted to avoid hydration mismatch
  const renderTimestamp = (timestamp: string) => {
    if (!mounted) return null;
    return (
      <p className={`text-xs mt-1 ${
        timestamp ? 'text-blue-100' : 'text-gray-500'
      }`} suppressHydrationWarning>
        {timestamp}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gray-200 bg-opacity-30" 
             style={{
               backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(100, 100, 100, 0.1) 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      {/* Chat Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10"
        style={{ height: '600px' }}
      >
        {/* Widget Header */}
        <div className="bg-blue-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">💬</span>
              </div>
              <div>
                <h1 className="font-semibold text-sm">Classic Chat</h1>
                <p className="text-xs text-blue-100">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '400px' }}>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p>{message.text}</p>
                  {message.sender === 'user' ? (
                    <p className="text-xs mt-1 text-blue-100" suppressHydrationWarning>
                      {message.timestamp}
                    </p>
                  ) : (
                    <p className="text-xs mt-1 text-gray-500" suppressHydrationWarning>
                      {message.timestamp}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Powered by ChatChatGo */}
        <div className="bg-gray-50 border-t border-gray-200 px-3 py-2">
          <div className="flex items-center justify-center space-x-1 text-gray-500">
            <span className="text-xs">Powered by</span>
            <span className="text-xs font-semibold text-blue-600">ChatChatGo</span>
            <span className="text-xs">🚀</span>
          </div>
        </div>
      </motion.div>

      {/* Background Branding */}
      <div className="absolute bottom-4 left-4 text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-sm font-medium">ChatChatGo Test Lab</span>
        </div>
      </div>

      {/* Widget Info */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="text-xs text-gray-600">
          <div className="font-medium">Classic Widget</div>
          <div>Clean & Simple</div>
        </div>
      </div>
    </div>
  );
} 