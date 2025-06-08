'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Brain, Zap, TrendingUp, Users, DollarSign, MessageSquare } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function VoiceIntelligence() {
  const [voiceMetrics, setVoiceMetrics] = useState({
    sessionsToday: 147,
    avgSessionLength: '2:34',
    accuracy: 96.8,
    topCommands: [
      { command: 'Show menu analytics', count: 45, trend: '+12%' },
      { command: 'Social media trending', count: 38, trend: '+8%' },
      { command: 'Revenue insights', count: 32, trend: '+15%' },
      { command: 'Weather impact', count: 28, trend: '+5%' },
      { command: 'Order recommendations', count: 24, trend: '+20%' }
    ],
    languageBreakdown: [
      { language: 'English', percentage: 78, count: 115 },
      { language: 'Spanish', percentage: 15, count: 22 },
      { language: 'French', percentage: 4, count: 6 },
      { language: 'Italian', percentage: 3, count: 4 }
    ],
    sentimentAnalysis: {
      positive: 85,
      neutral: 12,
      negative: 3
    }
  });

  const [realtimeStats, setRealtimeStats] = useState({
    activeUsers: 12,
    avgResponseTime: 1.2,
    successRate: 97.3,
    peakHour: '7:30 PM',
    totalInteractions: 1847
  });

  const handleVoiceAnalyticsUpdate = (data: any) => {
    console.log('Voice Analytics Update:', data);
    setRealtimeStats(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
      avgResponseTime: (prev.avgResponseTime + (data.processingTime || 1.2)) / 2
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🎤 Voice Intelligence Center
          </h1>
          <p className="text-xl text-purple-200 max-w-4xl mx-auto">
            Advanced voice-powered restaurant management with real-time speech recognition, 
            natural language processing, and intelligent voice analytics. The future of hands-free restaurant operations.
          </p>
        </div>

        {/* Real-time Voice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6" />
              <span className="text-2xl font-bold">{realtimeStats.activeUsers}</span>
            </div>
            <div className="text-green-100 text-sm">Active Voice Users</div>
            <div className="text-green-200 text-xs mt-1">🔴 Live now</div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6" />
              <span className="text-2xl font-bold">{realtimeStats.avgResponseTime}s</span>
            </div>
            <div className="text-blue-100 text-sm">Avg Response Time</div>
            <div className="text-blue-200 text-xs mt-1">⚡ Ultra-fast</div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-6 h-6" />
              <span className="text-2xl font-bold">{voiceMetrics.accuracy}%</span>
            </div>
            <div className="text-purple-100 text-sm">Accuracy Rate</div>
            <div className="text-purple-200 text-xs mt-1">🎯 Precise</div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-2xl font-bold">{realtimeStats.successRate}%</span>
            </div>
            <div className="text-orange-100 text-sm">Success Rate</div>
            <div className="text-orange-200 text-xs mt-1">📈 Excellent</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-6 h-6" />
              <span className="text-2xl font-bold">{realtimeStats.totalInteractions}</span>
            </div>
            <div className="text-indigo-100 text-sm">Total Interactions</div>
            <div className="text-indigo-200 text-xs mt-1">💬 All-time</div>
          </div>
        </div>

        {/* Main Voice Assistant */}
        <div className="mb-12">
          <VoiceAssistant 
            onAnalyticsUpdate={handleVoiceAnalyticsUpdate}
            restaurantData={{
              revenue: 15420,
              sentiment: 0.85,
              viralityIndex: 0.89,
              socialMentions: 147,
              topItems: ['Truffle Burger', 'Caesar Salad', 'Pasta Carbonara']
            }}
            className="w-full"
          />
        </div>

        {/* Voice Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Voice Commands */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">🗣️ Top Voice Commands</h3>
            
            <div className="space-y-4">
              {voiceMetrics.topCommands.map((cmd, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">"{cmd.command}"</span>
                    <span className="text-green-400 font-bold text-sm">{cmd.trend}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="bg-gray-700 rounded-full h-2 flex-1 mr-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${(cmd.count / 45) * 100}%` }}
                      />
                    </div>
                    <span className="text-purple-300 text-sm">{cmd.count} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Analytics */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">🌍 Language Analytics</h3>
            
            <div className="space-y-4">
              {voiceMetrics.languageBreakdown.map((lang, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{lang.language}</span>
                    <span className="text-blue-400 font-bold">{lang.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="bg-gray-700 rounded-full h-2 flex-1 mr-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                    <span className="text-cyan-300 text-sm">{lang.count} sessions</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
              <h4 className="text-blue-300 font-bold mb-2">🤖 AI Language Processing</h4>
              <p className="text-blue-200 text-sm">
                Advanced multilingual support with real-time translation and context understanding. 
                Supports 12+ languages with 96.8% accuracy across all dialects.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Sentiment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">😊 Voice Sentiment</h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-400 mb-2">
                  {voiceMetrics.sentimentAnalysis.positive}%
                </div>
                <div className="text-green-300">Positive Interactions</div>
                <div className="text-green-400 text-sm mt-1">😊 Happy customers</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {voiceMetrics.sentimentAnalysis.neutral}%
                  </div>
                  <div className="text-yellow-300 text-sm">Neutral</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {voiceMetrics.sentimentAnalysis.negative}%
                  </div>
                  <div className="text-red-300 text-sm">Negative</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">⏰ Voice Patterns</h3>
            
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white font-medium mb-2">Peak Usage Hour</div>
                <div className="text-3xl font-bold text-purple-400">{realtimeStats.peakHour}</div>
                <div className="text-purple-300 text-sm">Dinner rush period</div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white font-medium mb-2">Avg Session Length</div>
                <div className="text-3xl font-bold text-blue-400">{voiceMetrics.avgSessionLength}</div>
                <div className="text-blue-300 text-sm">Minutes per interaction</div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white font-medium mb-2">Daily Sessions</div>
                <div className="text-3xl font-bold text-green-400">{voiceMetrics.sessionsToday}</div>
                <div className="text-green-300 text-sm">Active today</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 AI Insights</h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg p-4 border border-purple-500/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 font-bold text-sm">HIGH PRIORITY</span>
                </div>
                <div className="text-white font-medium mb-1">Menu queries increased 23%</div>
                <div className="text-purple-200 text-sm">
                  Customers asking about specials more frequently via voice
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-lg p-4 border border-blue-500/50">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-bold text-sm">TRENDING</span>
                </div>
                <div className="text-white font-medium mb-1">Social media commands rising</div>
                <div className="text-blue-200 text-sm">
                  Voice requests for viral items up 35% this week
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-lg p-4 border border-green-500/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-bold text-sm">OPPORTUNITY</span>
                </div>
                <div className="text-white font-medium mb-1">Voice ordering potential</div>
                <div className="text-green-200 text-sm">
                  67% of users ask about ordering through voice interface
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Technology Features */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 border border-indigo-400/30">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">🚀 Advanced Voice Technology</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🧠</div>
              <h4 className="text-xl font-bold text-white mb-2">Neural Speech Recognition</h4>
              <p className="text-gray-300 text-sm mb-4">
                Advanced AI models trained on restaurant-specific vocabulary and acoustic environments
              </p>
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">96.8% ACCURACY</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold text-white mb-2">Real-time Processing</h4>
              <p className="text-gray-300 text-sm mb-4">
                Ultra-low latency voice processing with instant response generation
              </p>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">1.2s RESPONSE</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="text-xl font-bold text-white mb-2">Multilingual Support</h4>
              <p className="text-gray-300 text-sm mb-4">
                Support for 12+ languages with real-time translation and cultural context
              </p>
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">12+ LANGUAGES</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-all">
              <div className="text-4xl mb-4">🔊</div>
              <h4 className="text-xl font-bold text-white mb-2">Noise Cancellation</h4>
              <p className="text-gray-300 text-sm mb-4">
                Advanced audio filtering for busy restaurant environments
              </p>
              <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">RESTAURANT OPTIMIZED</div>
            </div>
          </div>

          <div className="mt-8 bg-black/30 rounded-2xl p-6">
            <h4 className="text-2xl font-bold text-white mb-4">🔧 Technical Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h5 className="text-purple-300 font-bold mb-2">Audio Processing</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 16kHz sampling rate</li>
                  <li>• Noise reduction algorithms</li>
                  <li>• Echo cancellation</li>
                  <li>• Volume normalization</li>
                </ul>
              </div>
              <div>
                <h5 className="text-blue-300 font-bold mb-2">AI Models</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Transformer-based recognition</li>
                  <li>• Restaurant domain adaptation</li>
                  <li>• Sentiment analysis</li>
                  <li>• Intent classification</li>
                </ul>
              </div>
              <div>
                <h5 className="text-green-300 font-bold mb-2">Integration</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Real-time analytics sync</li>
                  <li>• Menu system integration</li>
                  <li>• Social media connectivity</li>
                  <li>• POS system compatibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 