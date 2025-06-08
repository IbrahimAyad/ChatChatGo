'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isPlaying: boolean;
  onPlayAudio?: (audioUrl: string) => void;
}

export function MessageList({ messages, isLoading, isPlaying, onPlayAudio }: MessageListProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : isSystem
              ? 'bg-gray-100 text-gray-600 text-sm italic'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* Audio playback button for assistant messages */}
          {message.audioUrl && !isUser && onPlayAudio && (
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={() => onPlayAudio(message.audioUrl!)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <Pause size={12} />
                ) : (
                  <Play size={12} />
                )}
                <span>{isPlaying ? 'Playing...' : 'Play'}</span>
              </button>
            </div>
          )}
          
          {/* Intent and confidence for debugging (only in dev mode) */}
          {process.env.NODE_ENV === 'development' && message.intent && (
            <div className="mt-1 text-xs opacity-70">
              Intent: {message.intent} ({Math.round((message.confidence || 0) * 100)}%)
            </div>
          )}
          
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start mb-4"
        >
          <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-2 max-w-xs">
            <div className="flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Start a conversation!</p>
          <p className="text-xs mt-1">
            You can type a message or use voice input if available.
          </p>
        </div>
      )}
    </div>
  );
} 