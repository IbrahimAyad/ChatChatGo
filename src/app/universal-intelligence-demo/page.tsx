'use client';

import { useState, useEffect } from 'react';
import { useUniversalIntelligence } from '@/lib/universal-intelligence';

interface RestaurantDemo {
  id: string;
  name: string;
  type: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  activeUsers: number;
  todayOrders: number;
  insights?: any;
  connectionStrength: number;
  learningRate: number;
}

const DEMO_RESTAURANTS: RestaurantDemo[] = [
  {
    id: 'burger-palace',
    name: 'Burger Palace',
    type: 'fast-food',
    color: 'bg-red-500',
    gradientFrom: 'from-red-400',
    gradientTo: 'to-red-600',
    icon: '🍔',
    activeUsers: 47,
    todayOrders: 234,
    connectionStrength: 95,
    learningRate: 12.4
  },
  {
    id: 'pizza-corner',
    name: 'Pizza Corner',
    type: 'pizza',
    color: 'bg-yellow-500',
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-orange-500',
    icon: '🍕',
    activeUsers: 63,
    todayOrders: 189,
    connectionStrength: 88,
    learningRate: 15.7
  },
  {
    id: 'sushi-zen',
    name: 'Sushi Zen',
    type: 'ethnic',
    color: 'bg-green-500',
    gradientFrom: 'from-green-400',
    gradientTo: 'to-emerald-600',
    icon: '🍣',
    activeUsers: 29,
    todayOrders: 156,
    connectionStrength: 92,
    learningRate: 8.9
  },
  {
    id: 'fine-dining-bistro',
    name: 'Le Bistro',
    type: 'fine-dining',
    color: 'bg-purple-500',
    gradientFrom: 'from-purple-400',
    gradientTo: 'to-purple-700',
    icon: '🍷',
    activeUsers: 18,
    todayOrders: 78,
    connectionStrength: 85,
    learningRate: 6.3
  }
];

export default function UniversalIntelligenceDemo() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantDemo>(DEMO_RESTAURANTS[0]);
  const [restaurants, setRestaurants] = useState<RestaurantDemo[]>(DEMO_RESTAURANTS);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [globalMetrics, setGlobalMetrics] = useState({
    totalInteractions: 12847,
    globalSuccessRate: 0.823,
    trendsIdentified: 15,
    restaurantsConnected: 4
  });
  const [pulseActive, setPulseActive] = useState(false);
  const [dataFlowAnimation, setDataFlowAnimation] = useState(false);

  const { getInsights, generateSuggestion, analytics } = useUniversalIntelligence(
    selectedRestaurant.id, 
    selectedRestaurant.type
  );

  useEffect(() => {
    // Load insights for each restaurant
    const updatedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      insights: getInsights()
    }));
    setRestaurants(updatedRestaurants);
    
    // Start pulse animation
    const pulseInterval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 2000);

    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    // Continuous data flow animation
    const flowInterval = setInterval(() => {
      setDataFlowAnimation(prev => !prev);
    }, 3000);

    return () => clearInterval(flowInterval);
  }, []);

  const simulateDataSharing = async () => {
    setSimulationRunning(true);
    
    // Enhanced simulation with visual feedback
    for (let i = 0; i < 8; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Randomly select a restaurant and simulate an interaction
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      const isSuccess = Math.random() > 0.25;
      
      setGlobalMetrics(prev => ({
        ...prev,
        totalInteractions: prev.totalInteractions + Math.floor(Math.random() * 5) + 1,
        globalSuccessRate: Math.min(0.95, prev.globalSuccessRate + (Math.random() * 0.01)),
        trendsIdentified: prev.trendsIdentified + (Math.random() > 0.7 ? 1 : 0)
      }));

      // Update restaurant metrics with animation
      setRestaurants(prev => prev.map(r => 
        r.id === randomRestaurant.id 
          ? { 
              ...r, 
              activeUsers: r.activeUsers + (isSuccess ? Math.floor(Math.random() * 3) + 1 : 0),
              todayOrders: r.todayOrders + (isSuccess ? Math.floor(Math.random() * 2) + 1 : 0),
              learningRate: Math.min(20, r.learningRate + Math.random() * 0.5)
            }
          : r
      ));
    }
    
    setSimulationRunning(false);
  };

  const getUniversalSuggestion = () => {
    return generateSuggestion({
      currentOrder: ['burger'],
      timeOfDay: new Date().getHours(),
      userBehavior: ['browsing_long'],
      sentiment: 'positive'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Data Flow Lines */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${dataFlowAnimation ? 'opacity-30' : 'opacity-10'}`}>
          <div className="absolute top-1/4 left-1/4 w-1 h-32 bg-gradient-to-b from-cyan-400 to-transparent animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-1 bg-gradient-to-r from-green-400 to-transparent animate-pulse animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1 h-24 bg-gradient-to-t from-yellow-400 to-transparent animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
                🧠 Universal Intelligence Hub
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-lg blur-lg opacity-20 animate-pulse"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the future of AI-powered food ordering where every restaurant learns from collective intelligence while maintaining their unique personality
            </p>
          </div>

          {/* Enhanced Global Metrics */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <span className="animate-spin mr-3">🌍</span> 
                Global Network Status
              </h2>
              <div className={`px-4 py-2 rounded-full ${pulseActive ? 'bg-green-500/20 border-green-400' : 'bg-blue-500/20 border-blue-400'} border transition-all duration-1000`}>
                <span className="text-white font-medium flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${pulseActive ? 'bg-green-400 animate-ping' : 'bg-blue-400 animate-pulse'}`}></div>
                  {pulseActive ? 'Data Syncing' : 'Connected'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 shadow-lg">
                  <div className="text-5xl font-bold text-white mb-2">{globalMetrics.totalInteractions.toLocaleString()}</div>
                  <div className="text-blue-100 font-medium">Total Interactions</div>
                  <div className="mt-2 text-xs text-blue-200">↗ +247 today</div>
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 shadow-lg">
                  <div className="text-5xl font-bold text-white mb-2">{(globalMetrics.globalSuccessRate * 100).toFixed(1)}%</div>
                  <div className="text-green-100 font-medium">Success Rate</div>
                  <div className="mt-2 text-xs text-green-200">↗ +2.3% this week</div>
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 shadow-lg">
                  <div className="text-5xl font-bold text-white mb-2">{globalMetrics.trendsIdentified}</div>
                  <div className="text-purple-100 font-medium">AI Trends</div>
                  <div className="mt-2 text-xs text-purple-200">🔥 3 new today</div>
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 shadow-lg">
                  <div className="text-5xl font-bold text-white mb-2">{globalMetrics.restaurantsConnected}</div>
                  <div className="text-orange-100 font-medium">Connected</div>
                  <div className="mt-2 text-xs text-orange-200">🌐 Real-time sync</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={simulateDataSharing}
                disabled={simulationRunning}
                className={`relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  simulationRunning 
                    ? 'bg-gray-500/50 cursor-not-allowed text-gray-300' 
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {simulationRunning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                <span className="relative flex items-center">
                  {simulationRunning ? (
                    <>
                      <div className="animate-spin mr-3">🔄</div>
                      AI Learning in Progress...
                    </>
                  ) : (
                    <>
                      <span className="mr-3">🚀</span>
                      Simulate Intelligence Sharing
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Enhanced Restaurant Network */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            {/* Restaurant Selection */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="animate-bounce mr-3">🏪</span> 
                Restaurant Network
              </h3>
              
              <div className="space-y-4">
                {restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className={`relative overflow-hidden p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                      selectedRestaurant.id === restaurant.id
                        ? 'bg-gradient-to-r from-white/20 to-white/10 border-2 border-cyan-400 shadow-lg'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {selectedRestaurant.id === restaurant.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 animate-pulse"></div>
                    )}
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${restaurant.gradientFrom} ${restaurant.gradientTo} shadow-lg`}>
                          {restaurant.icon}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{restaurant.name}</div>
                          <div className="text-gray-300 capitalize text-sm">{restaurant.type}</div>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                            <span className="text-xs text-gray-400">Learning Rate: {restaurant.learningRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white text-xl">{restaurant.activeUsers}</div>
                        <div className="text-gray-300 text-sm">active users</div>
                        <div className="font-medium text-gray-400 text-lg">{restaurant.todayOrders}</div>
                        <div className="text-gray-400 text-xs">orders today</div>
                        
                        {/* Connection Strength Indicator */}
                        <div className="mt-2 flex items-center justify-end">
                          <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-1000"
                              style={{ width: `${restaurant.connectionStrength}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 ml-2">{restaurant.connectionStrength}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Data Flow Animation */}
                    {selectedRestaurant.id === restaurant.id && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-slide-right"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Individual Insights */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">{selectedRestaurant.icon}</span>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {selectedRestaurant.name}
                </span>
                <span className="ml-2">Intelligence</span>
              </h3>
              
              <div className="space-y-6">
                <div className="relative p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl border border-blue-400/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <h4 className="font-bold text-blue-300 mb-3 flex items-center">
                    <span className="mr-2">🎯</span> AI Recommendations
                  </h4>
                  <ul className="text-blue-100 space-y-2 text-sm">
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▸</span> Optimal upsell timing: First 30 seconds</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▸</span> Top converting offer: "Add fries for $2.99"</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▸</span> Peak performance: 12-1pm, 6-8pm</li>
                    <li className="flex items-center"><span className="text-cyan-400 mr-2">▸</span> Voice order success: 89.3%</li>
                  </ul>
                </div>
                
                <div className="relative p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl border border-green-400/30 overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/10 rounded-full translate-y-8 -translate-x-8"></div>
                  <h4 className="font-bold text-green-300 mb-3 flex items-center">
                    <span className="mr-2">🌍</span> Universal Learning
                  </h4>
                  <ul className="text-green-100 space-y-2 text-sm">
                    <li className="flex items-center"><span className="text-emerald-400 mr-2">▸</span> Learned from 2,847 similar restaurants</li>
                    <li className="flex items-center"><span className="text-emerald-400 mr-2">▸</span> Global voice ordering trend: +23%</li>
                    <li className="flex items-center"><span className="text-emerald-400 mr-2">▸</span> Evening healthy options surge detected</li>
                    <li className="flex items-center"><span className="text-emerald-400 mr-2">▸</span> Cross-cuisine insights applied</li>
                  </ul>
                </div>
                
                <div className="relative p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl border border-purple-400/30 overflow-hidden">
                  <div className="absolute top-0 left-1/2 w-12 h-12 bg-purple-400/10 rounded-full -translate-y-6"></div>
                  <h4 className="font-bold text-purple-300 mb-3 flex items-center">
                    <span className="mr-2">⚡</span> Auto-Optimizations
                  </h4>
                  <ul className="text-purple-100 space-y-2 text-sm">
                    <li className="flex items-center"><span className="text-violet-400 mr-2">▸</span> Conversation tone: {selectedRestaurant.type}-optimized</li>
                    <li className="flex items-center"><span className="text-violet-400 mr-2">▸</span> Local preference adaptation active</li>
                    <li className="flex items-center"><span className="text-violet-400 mr-2">▸</span> Real-time strategy updates: 12/day</li>
                    <li className="flex items-center"><span className="text-violet-400 mr-2">▸</span> A/B testing 4 conversation variants</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Universal Trends */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <span className="animate-pulse mr-3">📈</span> 
              Universal AI Trends & Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="text-center p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30 shadow-lg hover:shadow-xl">
                  <div className="text-5xl mb-4 group-hover:animate-bounce">🗣️</div>
                  <div className="font-bold text-blue-300 text-lg">Voice Ordering Revolution</div>
                  <div className="text-4xl font-bold text-cyan-400 my-3 group-hover:scale-110 transition-transform">+23%</div>
                  <div className="text-blue-200 text-sm">Month-over-month growth</div>
                  <div className="mt-4 text-xs text-blue-300 bg-blue-500/10 rounded-full px-3 py-1">
                    🔥 Trending globally
                  </div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="text-center p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-400/30 shadow-lg hover:shadow-xl">
                  <div className="text-5xl mb-4 group-hover:animate-bounce animation-delay-300">🥗</div>
                  <div className="font-bold text-green-300 text-lg">Healthy Lifestyle Shift</div>
                  <div className="text-4xl font-bold text-emerald-400 my-3 group-hover:scale-110 transition-transform">+31%</div>
                  <div className="text-green-200 text-sm">Evening demand increase</div>
                  <div className="mt-4 text-xs text-green-300 bg-green-500/10 rounded-full px-3 py-1">
                    📊 Data-driven insight
                  </div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="text-center p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 shadow-lg hover:shadow-xl">
                  <div className="text-5xl mb-4 group-hover:animate-bounce animation-delay-600">📱</div>
                  <div className="font-bold text-purple-300 text-lg">Mobile-First Experience</div>
                  <div className="text-4xl font-bold text-pink-400 my-3 group-hover:scale-110 transition-transform">67%</div>
                  <div className="text-purple-200 text-sm">Prefer mobile ordering</div>
                  <div className="mt-4 text-xs text-purple-300 bg-purple-500/10 rounded-full px-3 py-1">
                    🎯 User preference
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Live Universal Suggestion */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="animate-pulse mr-3">🎯</span> 
              Live AI Universal Suggestion
            </h3>
            
            <div className="relative p-8 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-2xl border border-orange-400/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              
              <div className="relative flex items-start space-x-6">
                <div className="text-6xl p-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-lg">
                  {selectedRestaurant.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-orange-300 mb-3 text-xl">
                    AI-Powered Suggestion for {selectedRestaurant.name}
                  </div>
                  <div className="text-orange-100 mb-4 text-lg leading-relaxed">
                    "🍟 Hey there! Customers who ordered burgers also absolutely loved our crispy golden fries! 
                    Would you like to add them for just $2.99? Perfect combo!"
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-orange-200">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Confidence: 87.3%</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-200">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Based on 3,247 orders</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-200">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>Success rate: 76.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={getUniversalSuggestion}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-2xl hover:from-orange-400 hover:to-pink-500 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="animate-spin mr-3">🔄</span>
                  Generate New AI Suggestion
                </span>
              </button>
            </div>
          </div>

          {/* Enhanced Privacy & Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">🔒</span> Privacy & Security
              </h3>
              <ul className="space-y-4">
                {[
                  "All user data anonymized with SHA-256 encryption",
                  "Zero personal information crosses restaurant boundaries", 
                  "Only behavioral patterns and interaction analytics shared",
                  "Each restaurant maintains unique brand personality"
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-4 text-gray-200">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">🚀</span> Intelligence Benefits
              </h3>
              <ul className="space-y-4">
                {[
                  "Instant learning from industry-wide behavioral patterns",
                  "Superior AI suggestions available from day one", 
                  "Automatic trend detection and strategic adaptation",
                  "Continuous improvement without manual intervention"
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-4 text-gray-200">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⚡</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-slide-right {
          animation: slide-right 2s infinite;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
} 