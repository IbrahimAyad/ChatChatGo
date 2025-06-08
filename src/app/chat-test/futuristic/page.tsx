'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FuturisticChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🔮 Greetings from the future! I'm your advanced AI entity in this quantum widget. Ready to explore tomorrow?",
      sender: 'ai',
      timestamp: '',
      confidence: 0.98
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiInsights, setAiInsights] = useState('Neural pathways optimized');
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

  useEffect(() => {
    const insights = [
      'Neural pathways optimized',
      'Quantum entanglement stable',
      'Predictive algorithms active',
      'Consciousness patterns detected'
    ];
    
    const interval = setInterval(() => {
      setAiInsights(insights[Math.floor(Math.random() * insights.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString(),
      confidence: Math.random() * 0.3 + 0.7
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "🚀 Processing complete! This futuristic widget showcases quantum-inspired animations and AI insights. The future is here!",
        sender: 'ai' as const,
        timestamp: new Date().toLocaleTimeString(),
        confidence: Math.random() * 0.2 + 0.8
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Chat Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="w-full max-w-md bg-black/90 backdrop-blur-sm rounded-2xl overflow-hidden relative z-10 border border-cyan-500/30 shadow-2xl"
        style={{ height: '650px' }}
      >
        {/* Widget Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="relative w-8 h-8"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg transform rotate-45"></div>
                <div className="absolute inset-1 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-cyan-400 text-xs">🔮</span>
                </div>
              </motion.div>
              <div>
                <h1 className="text-sm font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  QUANTUM CHAT
                </h1>
                <p className="text-xs text-cyan-300/60">Neural Interface</p>
              </div>
            </div>
            
            <motion.div 
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{ 
                boxShadow: [
                  '0 0 5px #00ffff',
                  '0 0 15px #00ffff',
                  '0 0 5px #00ffff'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          
          {/* AI Status */}
          <div className="mt-2 text-xs text-cyan-400/60 font-mono">{aiInsights}</div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '450px' }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                  delay: index * 0.1
                }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] relative ${
                  message.sender === 'user' ? 'mr-0' : 'ml-0'
                }`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border-cyan-500/30 rounded-br-sm'
                        : 'bg-black/60 backdrop-blur-sm text-cyan-100 border-cyan-500/20 rounded-bl-sm'
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-cyan-100' : 'text-cyan-400/60'
                      }`} suppressHydrationWarning>
                        {message.timestamp}
                      </span>
                      {message.confidence && (
                        <span className="text-xs text-cyan-400/60 font-mono">
                          {Math.round(message.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Quantum Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-start"
            >
              <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/20 px-3 py-2 rounded-lg rounded-bl-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-cyan-400 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-cyan-400/60 font-mono">Processing...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-cyan-500/30 p-3">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Interface ready for input..."
              className="flex-1 resize-none bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              rows={1}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 text-white p-2 rounded-lg transition-all border border-cyan-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Powered by ChatChatGo */}
        <div className="bg-black/60 border-t border-cyan-500/20 px-3 py-2">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-xs text-cyan-400/60">Powered by</span>
            <span className="text-xs font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">ChatChatGo</span>
            <span className="text-xs text-cyan-400">🔮</span>
          </div>
        </div>
      </motion.div>

      {/* Background Branding */}
      <div className="absolute bottom-4 left-4 text-cyan-400/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-sm font-medium">ChatChatGo Test Lab</span>
        </div>
      </div>

      {/* Widget Info */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-cyan-500/20">
        <div className="text-xs text-cyan-300">
          <div className="font-medium text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">Quantum Widget</div>
          <div className="text-cyan-400/60">Future Interface</div>
        </div>
      </div>
    </div>
  );
} 