'use client';

import React, { useState, useEffect } from 'react';
import { smartContextEngine, SmartSuggestion } from '../lib/smart-context';

interface SmartBoxProps {
  userId: string;
  restaurantId: string;
  restaurantType?: string; // For Universal Intelligence Hub
  className?: string;
  onSuggestionClick?: (suggestion: SmartSuggestion) => void;
  variant?: 'floating' | 'inline' | 'popup' | 'banner';
  position?: 'top-right' | 'bottom-right' | 'center' | 'bottom-center';
}

export default function SmartBox({ 
  userId, 
  restaurantId, 
  restaurantType = 'fast-food',
  className = '',
  onSuggestionClick,
  variant = 'floating',
  position = 'bottom-right'
}: SmartBoxProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<SmartSuggestion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSuggestions();
    
    // Set up behavior tracking
    const trackingInterval = setInterval(() => {
      smartContextEngine.trackBehavior(userId, 'time_spent', { duration: 5000 });
    }, 5000);

    return () => clearInterval(trackingInterval);
  }, [userId, restaurantId]);

  const loadSuggestions = async () => {
    try {
      const newSuggestions = await smartContextEngine.generateSmartSuggestions(userId, {
        restaurantId,
        currentPage: window.location.pathname
      });
      
      setSuggestions(newSuggestions);
      
      if (newSuggestions.length > 0) {
        setCurrentSuggestion(newSuggestions[0]);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    // Collect training data for both local and universal intelligence
    smartContextEngine.collectTrainingData(suggestion, 'clicked', restaurantId, restaurantType);
    onSuggestionClick?.(suggestion);
    
    // Show next suggestion after interaction
    const nextIndex = suggestions.findIndex(s => s.id === suggestion.id) + 1;
    if (nextIndex < suggestions.length) {
      setCurrentSuggestion(suggestions[nextIndex]);
    } else {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    if (currentSuggestion) {
      smartContextEngine.collectTrainingData(currentSuggestion, 'dismissed', restaurantId, restaurantType);
    }
    setIsVisible(false);
  };

  const handleIgnore = () => {
    if (currentSuggestion) {
      smartContextEngine.collectTrainingData(currentSuggestion, 'ignored', restaurantId, restaurantType);
    }
    
    // Show next suggestion
    const nextIndex = suggestions.findIndex(s => s.id === currentSuggestion?.id) + 1;
    if (nextIndex < suggestions.length) {
      setCurrentSuggestion(suggestions[nextIndex]);
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible || !currentSuggestion) {
    return null;
  }

  const baseClasses = "transition-all duration-300 ease-in-out";
  const variantClasses = {
    floating: "fixed z-50 shadow-2xl rounded-2xl",
    inline: "relative rounded-xl shadow-lg",
    popup: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
    banner: "w-full rounded-lg shadow-md"
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${variant === 'floating' ? positionClasses[position] : ''} ${className}`}
      style={{ 
        maxWidth: variant === 'floating' ? '320px' : '100%',
        width: variant === 'banner' ? '100%' : 'auto'
      }}
    >
      {variant === 'popup' && (
        <div className="bg-white rounded-2xl max-w-md mx-4 p-6 relative">
          <SmartBoxContent 
            suggestion={currentSuggestion}
            onAction={handleSuggestionClick}
            onDismiss={handleDismiss}
            onIgnore={handleIgnore}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </div>
      )}
      
      {variant !== 'popup' && (
        <SmartBoxContent 
          suggestion={currentSuggestion}
          onAction={handleSuggestionClick}
          onDismiss={handleDismiss}
          onIgnore={handleIgnore}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      )}
    </div>
  );
}

interface SmartBoxContentProps {
  suggestion: SmartSuggestion;
  onAction: (suggestion: SmartSuggestion) => void;
  onDismiss: () => void;
  onIgnore: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

function SmartBoxContent({ 
  suggestion, 
  onAction, 
  onDismiss, 
  onIgnore,
  isExpanded,
  setIsExpanded 
}: SmartBoxContentProps) {
  const getThemeStyles = () => {
    switch (suggestion.type) {
      case 'themed':
        return {
          background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
          border: '2px solid #FFD700'
        };
      case 'loyalty':
        return {
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          border: '2px solid #FF8C00'
        };
      case 'upsell':
        return {
          background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
          border: '2px solid #90EE90'
        };
      case 'personalized':
        return {
          background: 'linear-gradient(135deg, #9370DB 0%, #8A2BE2 100%)',
          border: '2px solid #DDA0DD'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          border: '2px solid #A78BFA'
        };
    }
  };

  const getIcon = () => {
    switch (suggestion.type) {
      case 'themed': return '🎬';
      case 'loyalty': return '🌟';
      case 'upsell': return '🔥';
      case 'cross-sell': return '🍟';
      case 'personalized': return '👋';
      case 'behavioral': return '⏰';
      default: return '💡';
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-2xl border-2 transition-all duration-300 ${
        isExpanded ? 'p-6' : 'p-4'
      }`}
      style={getThemeStyles()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{getIcon()}</div>
          <div className="text-white">
            <div className="font-bold text-sm">Smart Suggestion</div>
            <div className="text-xs opacity-75 capitalize">{suggestion.type} • {Math.round(suggestion.confidence * 100)}% confidence</div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Main Message */}
      <div className="text-white mb-4">
        <p className="text-sm leading-relaxed">{suggestion.message}</p>
        
        {isExpanded && (
          <div className="mt-3 p-3 bg-white/10 rounded-lg">
            <p className="text-xs opacity-75 mb-2">Why this suggestion:</p>
            <p className="text-xs">{suggestion.reasoning}</p>
            {suggestion.data && (
              <div className="mt-2">
                <p className="text-xs opacity-75">Additional info:</p>
                <pre className="text-xs mt-1 opacity-60">{JSON.stringify(suggestion.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onAction(suggestion)}
          className="flex-1 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
        >
          {getActionText(suggestion.action)}
        </button>
        
        <button
          onClick={onIgnore}
          className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Special themed content */}
      {suggestion.type === 'themed' && suggestion.data?.voiceActor === 'samuel_l_jackson' && (
        <div className="mt-3 p-3 bg-black/20 rounded-lg">
          <div className="flex items-center space-x-2 text-white">
            <span className="text-lg">🎤</span>
            <span className="text-xs font-medium">Voice by Samuel L. Jackson</span>
          </div>
          <p className="text-xs text-white/80 mt-1 italic">
            "Click to hear this order in my voice, mother..."
          </p>
        </div>
      )}

      {/* Progress indicator for multiple suggestions */}
      <div className="mt-3 flex justify-center">
        <div className="flex space-x-1">
          {[1, 2, 3].map((dot) => (
            <div 
              key={dot}
              className={`w-2 h-2 rounded-full ${
                dot === 1 ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getActionText(action: string): string {
  const actionMap: Record<string, string> = {
    'add_to_cart': '🛒 Add to Cart',
    'add_fries': '🍟 Add Fries',
    'show_lunch_combos': '🍽️ View Combos',
    'show_vip_menu': '⭐ VIP Menu',
    'samuel_jackson_order': '🎬 Order with Samuel L.',
    'show_dietary_menu': '🥗 Dietary Options',
    'apply_discount': '💰 Apply Discount',
    'start_food_quiz': '❓ Food Quiz',
    'show_specials': '🔥 View Specials'
  };

  return actionMap[action] || '✨ Try This';
}

// Behavior tracking hook
export function useSmartBoxTracking(userId: string) {
  useEffect(() => {
    // Track page view
    smartContextEngine.trackBehavior(userId, 'page_view', {
      page: window.location.pathname,
      timestamp: new Date()
    });

    // Track scroll behavior
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      smartContextEngine.trackBehavior(userId, 'scroll', { depth: scrollDepth });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [userId]);

  const trackItemView = (itemName: string) => {
    smartContextEngine.trackBehavior(userId, 'item_view', { itemName });
  };

  const trackCartAbandon = () => {
    smartContextEngine.trackBehavior(userId, 'cart_abandon', {});
  };

  return { trackItemView, trackCartAbandon };
} 