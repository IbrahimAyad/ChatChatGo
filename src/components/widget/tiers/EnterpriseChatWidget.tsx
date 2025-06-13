'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface EnterpriseMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface EnterpriseChatWidgetProps {
  tenantData: any;
  embedded?: boolean;
  className?: string;
  config: any;
  hasVoice: boolean;
  hasAnalytics: boolean;
}

export function EnterpriseChatWidget({ 
  tenantData, 
  embedded = false, 
  className = '', 
  config,
  hasVoice,
  hasAnalytics
}: EnterpriseChatWidgetProps) {
  const [messages, setMessages] = useState<EnterpriseMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: `Welcome to ${tenantData?.name || 'our restaurant'}! I'm your AI assistant with enterprise-grade capabilities. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    avgResponseTime: 0,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: EnterpriseMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          tenantId: tenantData?.id,
          conversationHistory: messages.slice(-10), // Extended context for enterprise
        }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const assistantMessage: EnterpriseMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update analytics
      if (hasAnalytics) {
        setAnalytics(prev => ({
          totalMessages: prev.totalMessages + 1,
          avgResponseTime: (prev.avgResponseTime + responseTime) / 2,
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const fallbackMessage: EnterpriseMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: "I apologize for the technical difficulty. Our enterprise support team has been notified. Please try again or contact support directly.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(currentMessage);
  };

  if (embedded) {
    return (
      <div className={`h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
        {/* Enterprise Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{tenantData?.name || 'AI Assistant'}</h3>
              <p className="text-sm opacity-75">Enterprise AI • Advanced Analytics • 24/7 Support</p>
            </div>
            {hasAnalytics && (
              <div className="text-xs text-right">
                <div>Messages: {analytics.totalMessages}</div>
                <div>Avg Response: {Math.round(analytics.avgResponseTime)}ms</div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md p-4 rounded-xl shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-3 text-xs opacity-75">
                    <span>Enterprise AI</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message (Enterprise AI ready)..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !currentMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-slate-700 to-blue-700 text-white rounded-lg hover:from-slate-800 hover:to-blue-800 disabled:opacity-50 transition-all"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enterprise Widget Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-18 h-18 bg-gradient-to-r from-slate-700 to-blue-700 hover:from-slate-800 hover:to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50"
        >
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-xs font-bold">ENTERPRISE</div>
          </div>
        </motion.button>
      )}

      {/* Enterprise Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white rounded-xl shadow-2xl border flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{tenantData?.name || 'AI Assistant'}</h3>
                <p className="text-xs opacity-75">Enterprise AI • Advanced Analytics • 24/7 Support</p>
                {hasAnalytics && (
                  <div className="text-xs mt-1 opacity-75">
                    {analytics.totalMessages} messages • {Math.round(analytics.avgResponseTime)}ms avg
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:text-gray-200 p-1 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 p-1 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-sm p-3 rounded-lg shadow-sm text-sm ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                            <span>Enterprise</span>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t bg-white p-4">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Enterprise AI ready..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !currentMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-slate-700 to-blue-700 text-white rounded-lg hover:from-slate-800 hover:to-blue-800 disabled:opacity-50 text-sm"
                    >
                      Send
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 