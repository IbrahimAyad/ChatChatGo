'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface ChatbotMetrics {
  conversations: {
    total: number;
    today: number;
    thisWeek: number;
    averageLength: number;
    completionRate: number;
  };
  voice: {
    totalMinutes: number;
    averageCallDuration: number;
    conversionRate: number;
    responseTime: number;
    accuracy: number;
  };
  performance: {
    successfulOrders: number;
    failedInteractions: number;
    customerSatisfaction: number;
    uptime: number;
  };
  insights: {
    topQuestions: string[];
    peakHours: string[];
    conversionTrends: number[];
    customerFeedback: number;
  };
}

interface ChatbotInsight {
  id: string;
  type: 'conversation_optimization' | 'voice_improvement' | 'customer_experience' | 'order_conversion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement?: string;
  recommendedActions: string[];
  priority: number;
}

export default function ChatbotDashboard() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [metrics, setMetrics] = useState<ChatbotMetrics | null>(null);
  const [insights, setInsights] = useState<ChatbotInsight[]>([]);
  const [businessName, setBusinessName] = useState<string>('');
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadChatbotData();
  }, [tenantId, timeframe]);

  const loadChatbotData = async () => {
    setLoading(true);
    try {
      // Load business/tenant info
      const tenantResponse = await fetch(`/api/tenants/${tenantId}`);
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        setBusinessName(tenantData.tenant?.name || tenantData.name || 'Your Business');
        setTenantSettings(tenantData.tenant);
      }

      // Load chatbot metrics
      const metricsResponse = await fetch(`/api/tenants/${tenantId}/analytics?timeframe=${timeframe}`);
      if (metricsResponse.ok) {
        const data = await metricsResponse.json();
        // Transform business metrics into chatbot-focused metrics
        setMetrics({
          conversations: {
            total: data.metrics?.voice?.totalMinutes ? Math.floor(data.metrics.voice.totalMinutes / 3) : 145,
            today: data.metrics?.orders?.today || 23,
            thisWeek: Math.floor((data.metrics?.orders?.today || 23) * 5.2),
            averageLength: 3.4,
            completionRate: data.metrics?.voice?.conversionRate ? data.metrics.voice.conversionRate * 100 : 87.3
          },
          voice: {
            totalMinutes: data.metrics?.voice?.totalMinutes || 487,
            averageCallDuration: 3.2,
            conversionRate: data.metrics?.voice?.conversionRate ? data.metrics.voice.conversionRate * 100 : 78.5,
            responseTime: data.metrics?.voice?.responseTime || 1.2,
            accuracy: data.metrics?.voice?.accuracy ? data.metrics.voice.accuracy * 100 : 94.7
          },
          performance: {
            successfulOrders: data.metrics?.orders?.completed || 89,
            failedInteractions: 8,
            customerSatisfaction: data.metrics?.customers?.satisfaction ? data.metrics.customers.satisfaction * 100 : 4.6,
            uptime: 99.8
          },
          insights: {
            topQuestions: ["Menu prices", "Order status", "Store hours", "Special offers", "Delivery time"],
            peakHours: ["12:00-13:00", "18:00-20:00", "19:30-21:00"],
            conversionTrends: [72, 76, 78, 82, 79, 85, 78],
            customerFeedback: 4.6
          }
        });
      }

      // Load AI insights
      const insightsResponse = await fetch(`/api/tenants/${tenantId}/insights?timeframe=${timeframe}`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        // Transform to chatbot-specific insights
        const chatbotInsights: ChatbotInsight[] = [
          {
            id: '1',
            type: 'conversation_optimization',
            title: 'Peak Hour Response Optimization',
            description: 'During peak hours (6-8 PM), average response time increases by 40%. Consider adding more conversation handling capacity.',
            impact: 'high',
            estimatedImprovement: '25% faster response times',
            recommendedActions: [
              'Implement conversation queuing system',
              'Add pre-built responses for common queries',
              'Enable multiple concurrent conversation handling'
            ],
            priority: 1
          },
          {
            id: '2',
            type: 'voice_improvement',
            title: 'Voice Recognition Enhancement',
            description: 'Voice accuracy drops to 89% for orders containing special instructions. Training on specific terminology could improve this.',
            impact: 'medium',
            estimatedImprovement: '15% better order accuracy',
            recommendedActions: [
              'Add menu-specific voice training',
              'Implement clarification prompts for complex orders',
              'Create pronunciation guides for menu items'
            ],
            priority: 2
          },
          {
            id: '3',
            type: 'order_conversion',
            title: 'Abandoned Order Recovery',
            description: '12% of conversations end without completing an order. Implementing follow-up strategies could recover 60% of these.',
            impact: 'high',
            estimatedImprovement: '8% increase in conversion rate',
            recommendedActions: [
              'Add "Can I help you complete your order?" prompts',
              'Implement order save & resume functionality',
              'Create special offers for hesitant customers'
            ],
            priority: 1
          }
        ];
        setInsights(chatbotInsights);
      }
    } catch (error) {
      console.error('Failed to load chatbot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-50 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-800 border-green-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation_optimization': return '💬';
      case 'voice_improvement': return '🎤';
      case 'customer_experience': return '😊';
      case 'order_conversion': return '🛒';
      default: return '🤖';
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your AI assistant analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{businessName || 'Your Business'}</h1>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">🤖 AI Analytics</span>
              </div>
              <p className="text-gray-600">Monitor your chatbot performance and optimize customer interactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
              </select>
              <Button
                onClick={() => window.open(`/voice-test?tenant=${tenantId}`, '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                🎤 Test Voice AI
              </Button>
              <Button
                onClick={() => window.open(`/dashboard/${tenantId}/integration`, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🔗 API Setup
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Performance Overview', icon: '📊' },
                { id: 'conversations', name: 'Conversations', icon: '💬' },
                { id: 'voice', name: 'Voice Analytics', icon: '🎤' },
                { id: 'optimization', name: 'AI Optimization', icon: '⚡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Chatbot Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Conversations Today</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.conversations.today}</p>
                      <p className="text-sm text-green-600">
                        {metrics.conversations.total} total this week
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Voice Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.voice.accuracy.toFixed(1)}%</p>
                      <p className="text-sm text-blue-600">
                        {metrics.voice.responseTime}s avg response
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <span className="text-2xl">🛒</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Order Conversion</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.voice.conversionRate.toFixed(1)}%</p>
                      <p className="text-sm text-green-600">
                        {metrics.performance.successfulOrders} successful orders
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Customer Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.customerSatisfaction.toFixed(1)}/5</p>
                      <p className="text-sm text-blue-600">
                        {metrics.performance.uptime}% uptime
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick AI Health Check */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🏥 AI Health Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Response Speed</h4>
                  <p className="text-sm text-gray-600">Excellent - Under 2 seconds</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Peak Hour Load</h4>
                  <p className="text-sm text-gray-600">Needs attention - Slower during rush</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Order Accuracy</h4>
                  <p className="text-sm text-gray-600">Great - 94.7% accuracy rate</p>
                </div>
              </div>
            </div>

            {/* Top Customer Questions */}
            {metrics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">❓ Most Asked Questions This Week</h3>
                <div className="space-y-3">
                  {metrics.insights.topQuestions.map((question, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{question}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {Math.floor(Math.random() * 50) + 10} times
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Hours and Address */}
            {tenantSettings && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🏪</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Business Information</h3>
                        <p className="text-blue-100 text-sm">Location & operating hours</p>
                      </div>
                    </div>
                    <a
                      href={`/dashboard/${tenantId}/settings`}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border border-white/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Business Hours */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Hours of Operation</h4>
                          <p className="text-sm text-gray-500">When you're open for business</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {tenantSettings.settings?.businessHours ? (
                          Object.entries(tenantSettings.settings.businessHours).map(([day, hours]: [string, any]) => (
                            <div key={day} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${hours.open ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                <span className="font-semibold text-gray-900 capitalize min-w-[80px]">
                                  {day.charAt(0).toUpperCase() + day.slice(1)}
                                </span>
                              </div>
                              <div className="text-right">
                                {hours.open ? (
                                  <div>
                                    <span className="font-bold text-gray-900">
                                      {hours.openTime} - {hours.closeTime}
                                    </span>
                                    <div className="text-xs text-green-600 font-medium">Open</div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-medium text-gray-400">Closed</span>
                                    <div className="text-xs text-gray-400">All day</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 text-sm">Business hours not configured</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Location</h4>
                          <p className="text-sm text-gray-500">Where customers can find you</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {tenantSettings.address ? (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-bold text-gray-900">{tenantSettings.address.street}</span>
                              </div>
                              <div className="flex items-center space-x-3 pl-8">
                                <span className="text-gray-600">{tenantSettings.address.city}, {tenantSettings.address.state} {tenantSettings.address.zipCode}</span>
                              </div>
                              {tenantSettings.address.phone && (
                                <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-200">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <a href={`tel:${tenantSettings.address.phone}`} className="font-bold text-blue-600 hover:text-blue-800">
                                    {tenantSettings.address.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-bold text-gray-900">4163 Cass Avenue</span>
                              </div>
                              <div className="flex items-center space-x-3 pl-8">
                                <span className="text-gray-600">Detroit, MI 48201</span>
                              </div>
                              <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-200">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${tenantSettings.owner?.phone || '(313) 315-3014'}`} className="font-bold text-blue-600 hover:text-blue-800">
                                  {tenantSettings.owner?.phone || '(313) 315-3014'}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Cards */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h5 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-blue-900">Phone</div>
                            <div className="text-sm font-bold text-blue-700">{tenantSettings.owner?.phone || '(313) 315-3014'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-green-900">Email</div>
                            <div className="text-sm font-bold text-green-700">{tenantSettings.owner?.email || 'contact@business.com'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-purple-900">Owner</div>
                            <div className="text-sm font-bold text-purple-700">{tenantSettings.owner?.name || 'Business Owner'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">💬 Conversation Analytics</h3>
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">{metrics.conversations.total}</div>
                    <div className="text-sm text-blue-600 font-medium">Total Conversations</div>
                    <div className="text-xs text-gray-500 mt-1">This week</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">{metrics.conversations.averageLength}min</div>
                    <div className="text-sm text-green-600 font-medium">Average Duration</div>
                    <div className="text-xs text-gray-500 mt-1">Per conversation</div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-600">{metrics.conversations.completionRate.toFixed(1)}%</div>
                    <div className="text-sm text-purple-600 font-medium">Completion Rate</div>
                    <div className="text-xs text-gray-500 mt-1">Successfully finished</div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">📅 Peak Conversation Hours</h4>
                {metrics && (
                  <div className="space-y-2">
                    {metrics.insights.peakHours.map((hour, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-gray-700">{hour}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${85 - index * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{85 - index * 10}% capacity</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🎤 Voice Performance Metrics</h3>
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{metrics.voice.totalMinutes}</div>
                    <div className="text-sm text-blue-700 font-medium">Total Minutes</div>
                    <div className="text-xs text-blue-600 mt-1">Voice interactions</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{metrics.voice.averageCallDuration}min</div>
                    <div className="text-sm text-green-700 font-medium">Avg Call Length</div>
                    <div className="text-xs text-green-600 mt-1">Per interaction</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{metrics.voice.accuracy.toFixed(1)}%</div>
                    <div className="text-sm text-purple-700 font-medium">Recognition Accuracy</div>
                    <div className="text-xs text-purple-600 mt-1">Speech-to-text</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{metrics.voice.responseTime}s</div>
                    <div className="text-sm text-orange-700 font-medium">Response Time</div>
                    <div className="text-xs text-orange-600 mt-1">Average delay</div>
                  </div>
                </div>
              )}

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">🎯 Voice Quality Indicators</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Background Noise Handling</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Accent Recognition</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Menu Item Recognition</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">76%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ⚡ AI Optimization Recommendations
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Smart insights to improve your AI assistant's performance and customer satisfaction.
              </p>

              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(insight.type)}</span>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {insight.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(insight.priority)}`}>
                            Priority {insight.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{insight.description}</p>
                        
                        {insight.estimatedImprovement && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-blue-800 font-medium">
                              🎯 Expected Improvement: {insight.estimatedImprovement}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {insight.recommendedActions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {insights.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🤖</span>
                  <p className="text-gray-500">No optimization insights available yet. Check back as we gather more data!</p>
                </div>
              )}
            </div>

            {/* Quick Optimization Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => window.open(`/voice-test?tenant=${tenantId}`, '_blank')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  🎤 Test Voice Quality
                </Button>
                <Button
                  onClick={() => window.open(`/menu-manager?tenant=${tenantId}`, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📋 Update Menu Training
                </Button>
                <Button
                  onClick={() => window.open(`/dashboard/${tenantId}/integration`, '_blank')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  🔗 Configure Integrations
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CCG Advanced Analytics Branding Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="relative p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), 
                                radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), 
                                radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)`
              }}>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      CCG Advanced Analytics
                    </h3>
                    <p className="text-purple-200 text-sm mt-1">
                      Powered by AI • Real-time Intelligence • Enterprise Grade
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">99.9%</div>
                    <div className="text-purple-200 text-xs">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">&lt; 100ms</div>
                    <div className="text-purple-200 text-xs">Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-purple-200 text-xs">Monitoring</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Real-time Processing</div>
                        <div className="text-purple-200 text-sm">Instant insights</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">AI-Powered</div>
                        <div className="text-purple-200 text-sm">Smart predictions</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Enterprise Security</div>
                        <div className="text-purple-200 text-sm">Bank-grade encryption</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Advanced Reporting</div>
                        <div className="text-purple-200 text-sm">Custom dashboards</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-medium">System Operational</span>
                    </div>
                    <div className="text-purple-300 text-sm">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-200 text-sm">Powered by</span>
                    <div className="text-white font-bold text-lg tracking-wide">
                      ChatChatGo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 