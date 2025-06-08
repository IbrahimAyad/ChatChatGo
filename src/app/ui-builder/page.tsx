'use client';

import React, { useState, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HexColorPicker } from 'react-colorful';

// Types for UI components with absolute positioning
interface UIComponent {
  id: string;
  type: 'chat-bubble' | 'button' | 'input' | 'header' | 'avatar' | 'typing-indicator' | 'square-box' | 'blue-circle-animation' | 'food-order-bubble' | 'early-access-popup' | 'voice-indicator' | 'demo-button' | 'timestamped-chat' | 'voice-input-button' | 'gradient-background' | 'control-button' | 'smart-box-floating' | 'smart-box-inline' | 'smart-box-popup' | 'smart-box-banner' | 'welcome-back' | 'samuel-jackson';
  config: Record<string, any>;
  position: { x: number; y: number };
  zIndex: number;
  size: { width: number; height: number };
}

interface ChatConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
  };
  canvasMode: 'widget' | 'fullscreen';
  canvasSize: { width: number; height: number };
  components: UIComponent[];
}

// Enhanced component palette with voice AI components
const COMPONENT_PALETTE = [
  { id: 'chat-bubble', label: '💬 Chat Bubble', type: 'chat-bubble' },
  { id: 'button', label: '🔘 Button', type: 'button' },
  { id: 'input', label: '📝 Input Field', type: 'input' },
  { id: 'header', label: '📋 Header', type: 'header' },
  { id: 'avatar', label: '👤 Avatar', type: 'avatar' },
  { id: 'typing', label: '⌨️ Typing Indicator', type: 'typing-indicator' },
  { id: 'square-box', label: '⬜ Square Box', type: 'square-box' },
  { id: 'blue-circle', label: '🔵 Blue Circle Animation', type: 'blue-circle-animation' },
  { id: 'food-order', label: '🍕 Food Order Bubble', type: 'food-order-bubble' },
  { id: 'early-access', label: '🚀 Early Access Popup', type: 'early-access-popup' },
  // New Voice AI Components
  { id: 'voice-indicator', label: '🎵 Voice Indicator', type: 'voice-indicator' },
  { id: 'demo-button', label: '🍔 Demo Button', type: 'demo-button' },
  { id: 'timestamped-chat', label: '💬 Chat with Time', type: 'timestamped-chat' },
  { id: 'voice-input', label: '🎤 Voice Input', type: 'voice-input-button' },
  { id: 'gradient-bg', label: '🌈 Gradient Background', type: 'gradient-background' },
  { id: 'control-btn', label: '🔊 Control Button', type: 'control-button' },
  // Smart Context Components
  { id: 'smart-box-floating', label: '🧠 Smart Box (Floating)', type: 'smart-box-floating' },
  { id: 'smart-box-inline', label: '🧠 Smart Box (Inline)', type: 'smart-box-inline' },
  { id: 'smart-box-popup', label: '🧠 Smart Box (Popup)', type: 'smart-box-popup' },
  { id: 'smart-box-banner', label: '🧠 Smart Box (Banner)', type: 'smart-box-banner' },
  { id: 'welcome-back', label: '👋 Welcome Back', type: 'welcome-back' },
  { id: 'samuel-jackson', label: '🎬 Samuel L. Jackson', type: 'samuel-jackson' },
];

// Draggable component wrapper
function DraggableComponent({ 
  component, 
  isSelected, 
  onSelect,
  onDrag,
  onResize,
  popupStates,
  setPopupStates
}: { 
  component: UIComponent; 
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  popupStates: Record<string, boolean>;
  setPopupStates: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from anywhere within the component
    setIsDragging(true);
    setDragStart({
      x: e.clientX - component.position.x,
      y: e.clientY - component.position.y
    });
    onSelect(component.id);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: Math.max(0, e.clientX - dragStart.x),
      y: Math.max(0, e.clientY - dragStart.y)
    };
    
    onDrag(component.id, newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={componentRef}
      className={`absolute cursor-move transition-all ${
        isSelected ? 'ring-2 ring-blue-400 ring-opacity-70 shadow-lg scale-105' : 'hover:ring-1 hover:ring-gray-300'
      } ${isDragging ? 'opacity-75 scale-110 z-50' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        zIndex: isDragging ? 9999 : component.zIndex,
        width: component.size.width,
        height: component.size.height,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      {/* Drag Handle - Always visible for better UX */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-move shadow-lg border-2 border-white text-white text-xs opacity-80 hover:opacity-100">
        ⋮⋮
      </div>
      
      <ComponentRenderer 
        component={component} 
        popupStates={popupStates} 
        setPopupStates={setPopupStates} 
      />
      
      {/* Resize handles when selected */}
      {isSelected && (
        <>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full cursor-se-resize flex items-center justify-center text-white text-xs shadow-lg border-2 border-white"
               onMouseDown={(e) => {
                 e.stopPropagation();
                 // Handle resize logic here
               }}>
            ↘
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full cursor-pointer flex items-center justify-center text-white text-xs shadow-lg border-2 border-white"
               onClick={(e) => {
                 e.stopPropagation();
                 // Delete component
                 onSelect(''); // deselect first
                 setTimeout(() => {
                   const event = new CustomEvent('deleteComponent', { detail: component.id });
                   document.dispatchEvent(event);
                 }, 100);
               }}>
            ×
          </div>
        </>
      )}
    </div>
  );
}

// Enhanced component renderer with new voice AI components
function ComponentRenderer({ 
  component, 
  popupStates, 
  setPopupStates 
}: { 
  component: UIComponent;
  popupStates?: Record<string, boolean>;
  setPopupStates?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const { type, config } = component;

  switch (type) {
    case 'voice-indicator':
      return (
        <div className="flex items-center justify-center">
          <div 
            className="relative flex items-center justify-center"
            style={{ 
              width: `${config.size || 120}px`,
              height: `${config.size || 120}px`,
              backgroundColor: config.backgroundColor || '#ff6b35',
              borderRadius: '50%'
            }}
          >
            {/* Outer ring animations */}
            <div 
              className="absolute border-2 rounded-full animate-ping opacity-30"
              style={{ 
                width: `${(config.size || 120) + 40}px`,
                height: `${(config.size || 120) + 40}px`,
                borderColor: config.ringColor || '#9333ea'
              }}
            />
            <div 
              className="absolute border-2 rounded-full animate-ping opacity-20"
              style={{ 
                width: `${(config.size || 120) + 80}px`,
                height: `${(config.size || 120) + 80}px`,
                borderColor: config.ringColor || '#9333ea',
                animationDelay: '0.3s'
              }}
            />
            
            {/* Animated dots inside */}
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      );

    case 'demo-button':
      return (
        <button
          className="px-6 py-3 rounded-full font-medium text-white shadow-lg transition-all hover:scale-105"
          style={{
            backgroundColor: config.backgroundColor || 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <span className="mr-2">{config.emoji || '🍔'}</span>
          {config.text || 'Burger Joint'}
        </button>
      );

    case 'timestamped-chat':
      return (
        <div className="max-w-sm">
          <div className="flex items-start space-x-3 mb-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: config.avatarColor || '#ff6b35' }}
            >
              {config.avatarText || '🤖'}
            </div>
            <div 
              className="flex-1 p-4 rounded-2xl shadow-sm"
              style={{ 
                backgroundColor: config.backgroundColor || 'rgba(255, 255, 255, 0.9)',
                color: config.textColor || '#374151'
              }}
            >
              <p className="text-sm leading-relaxed">
                {config.message || 'Want to see SayBite in action? Try one of these demos to explore our voice AI in real time.'}
              </p>
              <p className="text-xs opacity-60 mt-2">
                {config.timestamp || '02:10 PM'}
              </p>
            </div>
          </div>
        </div>
      );

    case 'voice-input-button':
      return (
        <button
          className="px-8 py-4 rounded-full font-medium transition-all hover:scale-105 flex items-center space-x-2"
          style={{
            backgroundColor: config.backgroundColor || 'rgba(107, 33, 168, 0.8)',
            color: config.textColor || 'white',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span>🎤</span>
          <span>{config.text || 'Voice'}</span>
        </button>
      );

    case 'gradient-background':
      return (
        <div 
          className="w-full h-full rounded-lg"
          style={{
            background: config.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: component.size.width,
            height: component.size.height
          }}
        />
      );

    case 'control-button':
      return (
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
          style={{
            backgroundColor: config.backgroundColor || 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {config.icon || '🔊'}
        </button>
      );

    // Smart Context Components
    case 'smart-box-floating':
      return (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-2xl shadow-2xl max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🧠</span>
              <span className="font-bold text-sm">Smart Suggestion</span>
            </div>
            <button className="text-xs bg-white/20 px-2 py-1 rounded">×</button>
          </div>
          <p className="text-sm mb-3">{config.message || "🍟 Add fries for just $2.99? Perfect with your burger!"}</p>
          <button className="w-full bg-white text-purple-600 font-medium py-2 rounded-lg text-sm">
            {config.actionText || "🛒 Add to Cart"}
          </button>
        </div>
      );

    case 'smart-box-inline':
      return (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
          <div className="flex items-center space-x-2 mb-1">
            <span>🔥</span>
            <span className="font-medium text-green-800 text-sm">Upsell Opportunity</span>
          </div>
          <p className="text-green-700 text-sm">{config.message || "Customers who bought this also added fries"}</p>
        </div>
      );

    case 'smart-box-popup':
      return (
        <div className="bg-black/50 fixed inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🌟</span>
              <h3 className="font-bold text-gray-800 mb-2">VIP Suggestion!</h3>
              <p className="text-gray-600 text-sm mb-4">{config.message || "Based on your order history, try our premium burger!"}</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm">Try It</button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm">Skip</button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'smart-box-banner':
      return (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⏰</span>
              <span className="font-medium text-sm">{config.message || "Lunch special: 15-min quick combos!"}</span>
            </div>
            <button className="bg-white/20 px-3 py-1 rounded text-xs">View</button>
          </div>
        </div>
      );

    case 'welcome-back':
      return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">👋</div>
            <div>
              <h4 className="font-bold text-sm">Welcome back, {config.userName || 'Sarah'}!</h4>
              <p className="text-xs opacity-75">We missed you</p>
            </div>
          </div>
          <p className="text-sm mb-3">{config.message || "Your usual chicken sandwich with no onions?"}</p>
          <button className="w-full bg-white text-indigo-600 font-medium py-2 rounded-lg text-sm">
            Yes, add it! 🛒
          </button>
        </div>
      );

    case 'samuel-jackson':
      return (
        <div className="bg-gradient-to-r from-red-800 to-red-600 text-white p-4 rounded-2xl border-2 border-yellow-400">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">🎬</div>
            <div>
              <h4 className="font-bold text-sm">Samuel L. Jackson</h4>
              <p className="text-xs opacity-75">Voice Actor</p>
            </div>
          </div>
          <p className="text-sm mb-3 italic">
            {config.message || '"What do they call a Quarter Pounder with Cheese in Paris? Try our Royale with Cheese, mother..."'}
          </p>
          <div className="flex space-x-2">
            <button className="flex-1 bg-yellow-400 text-red-800 font-bold py-2 rounded-lg text-sm">
              🎬 Order with Samuel L.
            </button>
            <button className="px-3 bg-white/20 rounded-lg text-xs">🎤</button>
          </div>
        </div>
      );

    case 'chat-bubble':
      return (
        <div 
          className="p-3 rounded-lg max-w-xs"
          style={{ 
            backgroundColor: config.backgroundColor || '#3b82f6',
            color: config.textColor || 'white',
            borderRadius: `${config.borderRadius || 12}px`
          }}
        >
          {config.text || 'Hello! How can I help you?'}
        </div>
      );
    
    case 'button':
      return (
        <button 
          className="px-4 py-2 rounded-lg font-medium mb-2"
          style={{ 
            backgroundColor: config.backgroundColor || '#10b981',
            color: config.textColor || 'white',
            borderRadius: `${config.borderRadius || 8}px`
          }}
        >
          {config.text || 'Click me'}
        </button>
      );
    
    case 'input':
      return (
        <input 
          className="px-3 py-2 border rounded-lg mb-2 w-full"
          placeholder={config.placeholder || 'Type your message...'}
          style={{ 
            borderRadius: `${config.borderRadius || 8}px`,
            borderColor: config.borderColor || '#d1d5db'
          }}
        />
      );
    
    case 'header':
      return (
        <div 
          className="p-4 font-bold text-center mb-2"
          style={{ 
            backgroundColor: config.backgroundColor || '#1f2937',
            color: config.textColor || 'white'
          }}
        >
          {config.text || 'ChatChatGo Assistant'}
        </div>
      );
    
    case 'avatar':
      return (
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2"
          style={{ backgroundColor: config.backgroundColor || '#6366f1' }}
        >
          {config.text || 'AI'}
        </div>
      );
    
    case 'typing-indicator':
      return (
        <div className="flex space-x-1 p-2 mb-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      );

    case 'square-box':
      return (
        <div 
          className="flex items-center justify-center mb-2 border-2 font-medium"
          style={{ 
            width: `${config.size || 80}px`,
            height: `${config.size || 80}px`,
            backgroundColor: config.backgroundColor || '#f3f4f6',
            borderColor: config.borderColor || '#d1d5db',
            borderRadius: `${config.borderRadius || 8}px`,
            color: config.textColor || '#374151'
          }}
        >
          {config.text || '📦'}
        </div>
      );

    case 'blue-circle-animation':
      return (
        <div className="flex items-center justify-center mb-2">
          <div 
            className="relative flex items-center justify-center animate-pulse"
            style={{ 
              width: `${config.size || 60}px`,
              height: `${config.size || 60}px`,
              backgroundColor: config.backgroundColor || '#3b82f6',
              borderRadius: '50%'
            }}
          >
            {/* Outer ring animation */}
            <div 
              className="absolute border-2 rounded-full animate-ping opacity-20"
              style={{ 
                width: `${(config.size || 60) + 20}px`,
                height: `${(config.size || 60) + 20}px`,
                borderColor: config.backgroundColor || '#3b82f6'
              }}
            />
            {/* Inner content */}
            <div className="text-white font-bold text-sm">
              {config.text || '🤖'}
            </div>
            {/* Pulse effect */}
            <div 
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ 
                backgroundColor: config.backgroundColor || '#3b82f6',
                opacity: 0.6
              }}
            />
          </div>
        </div>
      );

    case 'food-order-bubble':
      return (
        <div className="mb-2">
          <div 
            className="p-4 rounded-lg max-w-xs relative shadow-sm border"
            style={{ 
              backgroundColor: config.backgroundColor || '#fef3c7',
              borderColor: config.borderColor || '#fbbf24',
              borderRadius: `${config.borderRadius || 12}px`,
              color: config.textColor || '#92400e'
            }}
          >
            {/* Order status indicator */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">
                {config.status || 'Order in progress...'}
              </span>
            </div>
            
            {/* Order content */}
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {config.orderTitle || '🍕 Your Order'}
              </div>
              <div className="text-sm opacity-80">
                {config.orderItems || '• 1x Large Pizza\n• 1x Coca Cola'}
              </div>
              <div className="text-xs pt-1 border-t border-current border-opacity-20">
                {config.orderTime || 'Est. 15-20 mins'}
              </div>
            </div>
            
            {/* Chat tail */}
            <div 
              className="absolute -bottom-1 left-4 w-3 h-3 transform rotate-45"
              style={{ backgroundColor: config.backgroundColor || '#fef3c7' }}
            />
          </div>
        </div>
      );

    case 'early-access-popup':
      const isPopupOpen = popupStates?.[component.id] || false;
      
      return (
        <div className="mb-2 relative">
          {!isPopupOpen ? (
            // Button State
            <button
              onClick={() => setPopupStates?.(prev => ({ ...prev, [component.id]: true }))}
              className="px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
              style={{
                backgroundColor: config.buttonColor || '#3b82f6',
                color: config.buttonTextColor || 'white',
                borderRadius: `${config.borderRadius || 8}px`
              }}
            >
              {config.buttonText || '🚀 Get Early Access'}
            </button>
          ) : (
            // Popup State - Takes only half the chat width
            <div className="relative">
              <div 
                className="p-4 rounded-lg shadow-lg border-2 max-w-[50%] relative"
                style={{
                  backgroundColor: config.popupBackgroundColor || '#ffffff',
                  borderColor: config.popupBorderColor || '#e5e7eb',
                  borderRadius: `${config.borderRadius || 12}px`
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setPopupStates?.(prev => ({ ...prev, [component.id]: false }))}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm"
                >
                  ×
                </button>
                
                {/* Header */}
                <div className="mb-3">
                  <h3 className="font-bold text-sm mb-1" style={{ color: config.textColor || '#1f2937' }}>
                    {config.popupTitle || '🚀 Early Access'}
                  </h3>
                  <p className="text-xs opacity-75" style={{ color: config.textColor || '#1f2937' }}>
                    {config.popupSubtitle || 'Join our exclusive early access program'}
                  </p>
                </div>
                
                {/* Form Fields */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={config.field1Placeholder || 'Full Name'}
                    className="w-full px-3 py-2 text-xs border rounded"
                    style={{ borderRadius: `${config.borderRadius || 6}px` }}
                  />
                  <input
                    type="email"
                    placeholder={config.field2Placeholder || 'Email Address'}
                    className="w-full px-3 py-2 text-xs border rounded"
                    style={{ borderRadius: `${config.borderRadius || 6}px` }}
                  />
                  <input
                    type="text"
                    placeholder={config.field3Placeholder || 'Company (Optional)'}
                    className="w-full px-3 py-2 text-xs border rounded"
                    style={{ borderRadius: `${config.borderRadius || 6}px` }}
                  />
                  {config.showField4 && (
                    <input
                      type="text"
                      placeholder={config.field4Placeholder || 'Phone Number'}
                      className="w-full px-3 py-2 text-xs border rounded"
                      style={{ borderRadius: `${config.borderRadius || 6}px` }}
                    />
                  )}
                </div>
                
                {/* Submit Button */}
                <button
                  className="w-full mt-3 px-4 py-2 text-xs font-medium rounded"
                  style={{
                    backgroundColor: config.submitButtonColor || '#10b981',
                    color: config.submitButtonTextColor || 'white',
                    borderRadius: `${config.borderRadius || 6}px`
                  }}
                >
                  {config.submitButtonText || 'Join Early Access'}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    
    default:
      return <div className="p-2 text-gray-500 mb-2">Unknown component</div>;
  }
}

export default function UIBuilderPage() {
  const [chatConfig, setChatConfig] = useState<ChatConfig>({
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981', 
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: 12,
    },
    canvasMode: 'fullscreen',
    canvasSize: { width: 1200, height: 800 },
    components: [],
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [popupStates, setPopupStates] = useState<Record<string, boolean>>({});

  // Listen for delete component events
  React.useEffect(() => {
    const handleDeleteComponent = (event: any) => {
      const componentId = event.detail;
      setChatConfig(prev => ({
        ...prev,
        components: prev.components.filter(comp => comp.id !== componentId)
      }));
    };

    document.addEventListener('deleteComponent', handleDeleteComponent);
    return () => document.removeEventListener('deleteComponent', handleDeleteComponent);
  }, []);

  function addComponent(type: string) {
    const newComponent: UIComponent = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      config: getDefaultConfig(type),
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      zIndex: 1,
      size: getDefaultSize(type),
    };
    
    setChatConfig(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
  }

  function getDefaultConfig(type: string) {
    switch (type) {
      case 'voice-indicator':
        return {
          size: 120,
          backgroundColor: '#ff6b35',
          ringColor: '#9333ea'
        };
      case 'demo-button':
        return {
          emoji: '🍔',
          text: 'Burger Joint',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        };
      case 'timestamped-chat':
        return {
          message: 'Want to see SayBite in action? Try one of these demos to explore our voice AI in real time.',
          timestamp: '02:10 PM',
          avatarColor: '#ff6b35',
          avatarText: '🤖',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          textColor: '#374151'
        };
      case 'voice-input-button':
        return {
          text: 'Voice',
          backgroundColor: 'rgba(107, 33, 168, 0.8)',
          textColor: 'white'
        };
      case 'gradient-background':
        return {
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
      case 'control-button':
        return {
          icon: '🔊',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        };
      case 'chat-bubble':
        return { 
          text: 'Hello! How can I help you?',
          backgroundColor: chatConfig.theme.primaryColor,
          textColor: 'white',
          borderRadius: chatConfig.theme.borderRadius 
        };
      case 'button':
        return { 
          text: 'Get Started',
          backgroundColor: chatConfig.theme.secondaryColor,
          textColor: 'white',
          borderRadius: 8 
        };
      case 'input':
        return { 
          placeholder: 'Type your message...',
          borderColor: '#d1d5db',
          borderRadius: 8 
        };
      case 'header':
        return { 
          text: 'ChatChatGo Assistant',
          backgroundColor: '#1f2937',
          textColor: 'white' 
        };
      case 'avatar':
        return { 
          text: 'AI',
          backgroundColor: chatConfig.theme.primaryColor 
        };
      case 'square-box':
        return {
          text: '📦',
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          textColor: '#374151',
          size: 80,
          borderRadius: 8
        };
      case 'blue-circle-animation':
        return {
          text: '🤖',
          backgroundColor: '#3b82f6',
          size: 60
        };
      case 'food-order-bubble':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#fbbf24',
          textColor: '#92400e',
          borderRadius: 12,
          status: 'Order in progress...',
          orderTitle: '🍕 Your Order',
          orderItems: '• 1x Large Pizza\n• 1x Coca Cola',
          orderTime: 'Est. 15-20 mins'
        };
      case 'early-access-popup':
        return {
          buttonText: '🚀 Get Early Access',
          buttonColor: '#3b82f6',
          buttonTextColor: 'white',
          popupTitle: '🚀 Early Access',
          popupSubtitle: 'Join our exclusive early access program',
          popupBackgroundColor: '#ffffff',
          popupBorderColor: '#e5e7eb',
          textColor: '#1f2937',
          borderRadius: 8,
          field1Placeholder: 'Full Name',
          field2Placeholder: 'Email Address',
          field3Placeholder: 'Company (Optional)',
          field4Placeholder: 'Phone Number',
          showField4: false,
          submitButtonText: 'Join Early Access',
          submitButtonColor: '#10b981',
          submitButtonTextColor: 'white'
        };
      
      // Smart Context Component Configs
      case 'smart-box-floating':
        return {
          message: "🍟 Add fries for just $2.99? Perfect with your burger!",
          actionText: "🛒 Add to Cart",
          confidence: 80,
          type: 'upsell'
        };
      
      case 'smart-box-inline':
        return {
          message: "Customers who bought this also added fries",
          type: 'cross-sell'
        };
      
      case 'smart-box-popup':
        return {
          message: "Based on your order history, try our premium burger!",
          type: 'vip'
        };
      
      case 'smart-box-banner':
        return {
          message: "Lunch special: 15-min quick combos!",
          type: 'behavioral'
        };
      
      case 'welcome-back':
        return {
          userName: 'Sarah',
          message: "Your usual chicken sandwich with no onions?",
          lastOrder: "3 days ago",
          totalOrders: 12
        };
      
      case 'samuel-jackson':
        return {
          message: '"What do they call a Quarter Pounder with Cheese in Paris? Try our Royale with Cheese, mother..."',
          restaurant: 'Royale with Cheese',
          voiceEnabled: true,
          pulpFictionTheme: true
        };
      
      default:
        return {};
    }
  }

  function getDefaultSize(type: string) {
    switch (type) {
      case 'gradient-background':
        return { width: 400, height: 600 };
      case 'voice-indicator':
        return { width: 200, height: 200 };
      case 'timestamped-chat':
        return { width: 350, height: 120 };
      case 'demo-button':
        return { width: 150, height: 50 };
      case 'smart-box-floating':
      case 'smart-box-popup':
      case 'welcome-back':
      case 'samuel-jackson':
        return { width: 300, height: 140 };
      case 'smart-box-inline':
        return { width: 280, height: 60 };
      case 'smart-box-banner':
        return { width: 350, height: 50 };
      default:
        return { width: 200, height: 60 };
    }
  }

  function updateComponentPosition(componentId: string, position: { x: number; y: number }) {
    setChatConfig(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId 
          ? { ...comp, position }
          : comp
      ),
    }));
  }

  function updateComponentSize(componentId: string, size: { width: number; height: number }) {
    setChatConfig(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId 
          ? { ...comp, size }
          : comp
      ),
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="py-4">
              <h1 className="text-2xl font-bold text-gray-900">📱 Chat Interface Builder</h1>
              <p className="text-gray-600">Design beautiful chat interfaces with drag-and-drop ease</p>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Component Palette */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4">🧩 Components</h3>
              <div className="space-y-2">
                {COMPONENT_PALETTE.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addComponent(item.type)}
                    className="w-full p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 text-left text-sm"
                  >
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Interface Canvas */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">
                  📱 Chat Interface Preview ({chatConfig.components.length} components)
                </h3>
              </div>
              
              {/* Mobile Chat Frame */}
              <div className="p-8 bg-gray-100">
                <div className="max-w-sm mx-auto">
                  {/* Phone Frame */}
                  <div className="bg-black rounded-3xl p-2 shadow-2xl">
                    {/* Screen */}
                    <div className="bg-white rounded-2xl overflow-hidden">
                      {/* Chat Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          🤖
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">ChatChatGo AI</h4>
                          <p className="text-xs opacity-75">Online now</p>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">📞</div>
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">⚙️</div>
                        </div>
                      </div>

                      {/* Chat Canvas Area */}
                      <div 
                        className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 overflow-hidden"
                        style={{ 
                          height: chatConfig.canvasMode === 'fullscreen' ? '500px' : '350px' 
                        }}
                        onClick={() => setSelectedComponent(null)}
                      >
                        {/* Grid background */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="w-full h-full" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '15px 15px'
                          }} />
                        </div>

                        {/* Components */}
                        {chatConfig.components.map((component) => (
                          <DraggableComponent
                            key={component.id}
                            component={component}
                            isSelected={selectedComponent === component.id}
                            onSelect={setSelectedComponent}
                            onDrag={updateComponentPosition}
                            onResize={updateComponentSize}
                            popupStates={popupStates}
                            setPopupStates={setPopupStates}
                          />
                        ))}

                        {/* Empty state */}
                        {chatConfig.components.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white/60">
                              <p className="text-sm font-medium">Start building your chat interface</p>
                              <p className="text-xs mt-1">Drag components from the left panel</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input Area */}
                      <div className="bg-gray-50 p-3 border-t">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-white rounded-full px-4 py-2 border border-gray-200">
                            <span className="text-gray-400 text-sm">Type your message...</span>
                          </div>
                          <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            ➤
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Canvas Mode Toggle */}
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setChatConfig(prev => ({ 
                        ...prev, 
                        canvasMode: prev.canvasMode === 'widget' ? 'fullscreen' : 'widget' 
                      }))}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors"
                    >
                      {chatConfig.canvasMode === 'widget' ? '📱 Compact' : '📺 Extended'} View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">⚙️ Properties</h3>
              
              {selectedComponent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">
                      Selected Component
                    </h4>
                    <button
                      onClick={() => {
                        setChatConfig(prev => ({
                          ...prev,
                          components: prev.components.filter(comp => comp.id !== selectedComponent)
                        }));
                        setSelectedComponent(null);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Click and drag components on the canvas to reposition them.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select a component to edit its properties</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const voiceDemo = [
                      { type: 'gradient-background', x: 0, y: 0 },
                      { type: 'voice-indicator', x: 200, y: 150 },
                      { type: 'timestamped-chat', x: 50, y: 350 },
                      { type: 'demo-button', x: 50, y: 480 },
                      { type: 'demo-button', x: 220, y: 480 },
                      { type: 'voice-input-button', x: 150, y: 520 }
                    ];
                    
                    voiceDemo.forEach((item, index) => {
                      setTimeout(() => addComponent(item.type), index * 200);
                    });
                  }}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  🎵 Create Voice AI Demo
                </button>
                
                <button
                  onClick={() => {
                    const smartDemo = [
                      { type: 'welcome-back', x: 50, y: 50 },
                      { type: 'smart-box-floating', x: 250, y: 200 },
                      { type: 'samuel-jackson', x: 50, y: 220 },
                      { type: 'smart-box-banner', x: 50, y: 380 },
                      { type: 'smart-box-inline', x: 50, y: 450 }
                    ];
                    
                    smartDemo.forEach((item, index) => {
                      setTimeout(() => addComponent(item.type), index * 300);
                    });
                  }}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  🧠 Create Smart Context Demo
                </button>
                
                <button
                  onClick={() => {
                    setChatConfig(prev => ({
                      ...prev,
                      components: []
                    }));
                    setSelectedComponent(null);
                  }}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  🧹 Clear Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 