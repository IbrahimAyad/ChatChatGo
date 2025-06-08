'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Zap, TrendingUp, Users, DollarSign } from 'lucide-react';

interface VoiceAssistantProps {
  onAnalyticsUpdate?: (data: any) => void;
  restaurantData?: any;
  className?: string;
}

interface VoiceInsight {
  type: 'menu' | 'social' | 'analytics' | 'order' | 'weather' | 'trend';
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function VoiceAssistant({ 
  onAnalyticsUpdate, 
  restaurantData,
  className = '' 
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [voiceInsights, setVoiceInsights] = useState<VoiceInsight[]>([]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    checkMicrophonePermission();
    loadRestaurantData();
    initializeSpeechRecognition();
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported');
        setMicPermission(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      console.log('Microphone permission granted');
      stream.getTracks().forEach(track => {
        console.log('Audio track:', track.label, track.kind, track.enabled);
        track.stop();
      });
      setMicPermission(true);
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission(false);
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('🚫 Speech recognition not supported in this browser');
      console.log('💡 Try using Chrome, Edge, or Safari for voice features');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        console.log('🗣️ Transcript:', transcript);
        setTranscript(transcript);
        processVoiceCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🚫 Speech recognition error:', event.error);
      let errorMessage = 'Speech recognition failed';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
      }
      
      setResponse(errorMessage);
      setIsListening(false);
    };

    recognition.onnomatch = () => {
      console.warn('🤔 Speech not recognized');
      setResponse('I didn\'t understand that. Please try again.');
    };

    recognitionRef.current = recognition;
  };

  const loadRestaurantData = async () => {
    try {
      const analytics = {
        currentRevenue: 15420,
        avgOrderValue: 28.50,
        peakHours: ['11:30 AM', '7:30 PM'],
        topItems: ['Truffle Burger', 'Caesar Salad', 'Pasta Carbonara'],
        socialMetrics: {
          mentions: 147,
          sentiment: 0.78,
          viralityIndex: 85,
          trendingTags: ['#TruffleBurger', '#MariosBest', '#FoodieHeaven']
        },
        weatherImpact: {
          condition: 'sunny',
          temperature: 78,
          expectedIncrease: 15
        }
      };
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to load restaurant data:', error);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || !micPermission || !isEnabled) return;

    try {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase();
    let aiResponse = '';
    let insights: VoiceInsight[] = [];

    try {
      if (lowerCommand.includes('menu') || lowerCommand.includes('pricing') || lowerCommand.includes('popular')) {
        aiResponse = `Our top trending items today are: ${analyticsData?.topItems?.join(', ')}. The Truffle Burger is going viral on social media with a 35% sales boost! Current menu pricing is 92% optimized based on demand and social trends.`;
        insights.push({
          type: 'menu',
          title: 'Menu Intelligence',
          content: 'Current pricing optimization: 92% efficiency with viral social boost',
          confidence: 95,
          actionable: true,
          priority: 'high'
        });
      }
      
      else if (lowerCommand.includes('social') || lowerCommand.includes('viral') || lowerCommand.includes('trending')) {
        const sentiment = Math.round((analyticsData?.socialMetrics?.sentiment || 0.78) * 100);
        const mentions = analyticsData?.socialMetrics?.mentions || 147;
        const viralityIndex = analyticsData?.socialMetrics?.viralityIndex || 85;
        
        aiResponse = `Social media pulse: ${mentions} mentions today with ${sentiment}% positive sentiment. Your virality index is ${viralityIndex}/100. Hashtag TruffleBurger is trending with 2,300 engagements across platforms!`;
        insights.push({
          type: 'social',
          title: 'Social Media Pulse',
          content: `Virality Index: ${viralityIndex}/100 - Trending on TikTok and Instagram`,
          confidence: 92,
          actionable: true,
          priority: 'high'
        });
      }
      
      else if (lowerCommand.includes('analytics') || lowerCommand.includes('revenue') || lowerCommand.includes('sales')) {
        aiResponse = `Today's revenue is $${analyticsData?.currentRevenue?.toLocaleString()} with an average order value of $${analyticsData?.avgOrderValue}. We're tracking 15% above yesterday's performance with peak hours at ${analyticsData?.peakHours?.join(' and ')}!`;
        insights.push({
          type: 'analytics',
          title: 'Revenue Intelligence',
          content: `Today's revenue: $${analyticsData?.currentRevenue?.toLocaleString()} (+15% vs yesterday)`,
          confidence: 98,
          actionable: true,
          priority: 'high'
        });
      }
      
      else if (lowerCommand.includes('weather') || lowerCommand.includes('forecast')) {
        const weather = analyticsData?.weatherImpact;
        aiResponse = `Current weather: ${weather?.condition} at ${weather?.temperature}°F. This is driving a ${weather?.expectedIncrease}% increase in demand. Perfect weather for our outdoor dining specials and cold beverages!`;
        insights.push({
          type: 'weather',
          title: 'Weather Impact',
          content: `Expected ${weather?.expectedIncrease}% increase due to ${weather?.condition} weather`,
          confidence: 87,
          actionable: true,
          priority: 'medium'
        });
      }
      
      else if (lowerCommand.includes('order') || lowerCommand.includes('recommend') || lowerCommand.includes('suggest')) {
        const topItem = analyticsData?.topItems?.[0] || 'Truffle Burger';
        aiResponse = `I recommend our ${topItem} - it's trending on social media and has a 35% sales boost today. Our Caesar Salad pairs perfectly with it, and both are optimized for current weather conditions!`;
        insights.push({
          type: 'order',
          title: 'Smart Recommendations',
          content: `Top trending: ${topItem} (+35% today, viral on social media)`,
          confidence: 91,
          actionable: true,
          priority: 'high'
        });
      }
      
      else {
        aiResponse = `I heard: "${command}". I'm your restaurant intelligence assistant! I can help with menu optimization, social media insights, revenue analytics, weather impact analysis, and smart recommendations. What would you like to know?`;
        insights.push({
          type: 'trend',
          title: 'AI Assistant Ready',
          content: 'Ask about menu, social media, analytics, weather, or order recommendations',
          confidence: 100,
          actionable: true,
          priority: 'medium'
        });
      }

      setResponse(aiResponse);
      setVoiceInsights(insights);
      
      if (onAnalyticsUpdate) {
        onAnalyticsUpdate({
          command: command,
          response: aiResponse,
          insights: insights,
          timestamp: new Date()
        });
      }

      await speakResponse(aiResponse);

    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorResponse = "I encountered an issue processing your request. Please try again.";
      setResponse(errorResponse);
      await speakResponse(errorResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    if (!isEnabled) return;
    
    try {
      setIsSpeaking(true);
      console.log('🎤 Starting speech synthesis for:', text.substring(0, 50) + '...');
      
      // Import ElevenLabs dynamically with better error handling
      try {
        const { elevenLabsTTS, getRestaurantVoice } = await import('../lib/elevenlabs');
        console.log('✅ ElevenLabs module imported successfully');
        
        // Test API connection first
        const isConnected = await elevenLabsTTS.testConnection();
        console.log('🔗 ElevenLabs connection test:', isConnected ? 'SUCCESS' : 'FAILED');
        
        if (isConnected) {
          // Use professional voice for restaurant responses
          const voiceId = getRestaurantVoice('professional');
          console.log('🎯 Using voice ID:', voiceId);
          
          // Try ElevenLabs first for natural voice
          const success = await elevenLabsTTS.speak(text, voiceId);
          
          if (success) {
            console.log('✅ ElevenLabs speech completed successfully');
            return; // Exit early on success
          } else {
            console.log('⚠️ ElevenLabs speak() returned false, trying fallback');
          }
        } else {
          console.log('⚠️ ElevenLabs connection failed, using fallback TTS');
        }
      } catch (importError) {
        console.error('❌ Failed to import ElevenLabs module:', importError);
      }
      
      // Fallback to browser TTS if ElevenLabs fails
      console.log('🔄 Using browser TTS fallback');
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          console.log('✅ Browser TTS completed');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (error) => {
          console.error('❌ Browser TTS error:', error);
          setIsSpeaking(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        console.error('❌ Browser does not support speech synthesis');
        setIsSpeaking(false);
      }
      
    } catch (error) {
      console.error('🚨 Critical text-to-speech error:', error);
      setIsSpeaking(false);
    }
  };

  const toggleVoiceAssistant = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (micPermission === false) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <MicOff className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-300 font-medium">Microphone access required</p>
            <p className="text-red-400 text-sm">Please enable microphone permissions to use voice features</p>
            <button 
              onClick={checkMicrophonePermission}
              className="mt-2 text-sm bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg text-red-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-white/20 rounded-xl ${className}`}>
      {/* Voice Control Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={toggleVoiceAssistant}
                disabled={!micPermission || isProcessing}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50'
                }`}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
                
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                )}
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white">🎤 Voice Restaurant Intelligence</h3>
              <p className="text-purple-200 text-sm">
                {isListening ? 'Listening... speak now' : 
                 isProcessing ? 'Processing your request...' :
                 isSpeaking ? 'Speaking response...' :
                 'Tap to speak with your AI assistant'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isEnabled ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'
              }`}
              title={isEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {isEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Analytics Display */}
      {analyticsData && (
        <div className="p-4 border-b border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">${analyticsData.currentRevenue?.toLocaleString()}</span>
              </div>
              <p className="text-purple-200 text-xs">Today's Revenue</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{analyticsData.socialMetrics?.viralityIndex}/100</span>
              </div>
              <p className="text-purple-200 text-xs">Virality Index</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">{analyticsData.socialMetrics?.mentions}</span>
              </div>
              <p className="text-purple-200 text-xs">Social Mentions</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{Math.round((analyticsData.socialMetrics?.sentiment || 0.78) * 100)}%</span>
              </div>
              <p className="text-purple-200 text-xs">Sentiment</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Display */}
      <div className="p-6 space-y-4">
        {transcript && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm font-medium mb-1">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}
        
        {response && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-200 text-sm font-medium mb-1">AI Assistant:</p>
            <p className="text-white">{response}</p>
            {isSpeaking && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm">Speaking...</span>
              </div>
            )}
          </div>
        )}

        {/* Voice Insights */}
        {voiceInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">📈 Real-time Insights</h4>
            {voiceInsights.map((insight, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{insight.title}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {insight.priority}
                    </span>
                    <span className="text-xs text-purple-300">{insight.confidence}%</span>
                  </div>
                </div>
                <p className="text-purple-200 text-sm">{insight.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-white/20">
          <p className="text-purple-200 text-sm mb-3">Try saying:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Show me menu analytics',
              'What\'s trending on social media?',
              'How are sales today?',
              'Weather impact on orders',
              'Recommend popular items',
              'Social media sentiment'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => processVoiceCommand(suggestion)}
                className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-2 text-purple-200 hover:text-white transition-colors"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 