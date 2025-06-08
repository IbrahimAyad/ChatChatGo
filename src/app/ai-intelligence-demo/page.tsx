'use client';

import React, { useState, useEffect } from 'react';

interface CustomerSimulation {
  id: string;
  name: string;
  type: 'new' | 'regular' | 'vip';
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  visitCount: number;
  totalSpent: number;
  preferredItems: string[];
  lastOrderDays: number;
}

export default function AIIntelligenceDemo() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSimulation | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    metadata?: any;
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [customerInsights, setCustomerInsights] = useState<any>(null);
  const [upsellSuggestions, setUpsellSuggestions] = useState<any[]>([]);
  const [conversationContext, setConversationContext] = useState<any>(null);

  const demoCustomers: CustomerSimulation[] = [
    {
      id: 'sarah-johnson',
      name: 'Sarah Johnson',
      type: 'vip',
      loyaltyTier: 'platinum',
      visitCount: 47,
      totalSpent: 1247.50,
      preferredItems: ['Margherita Pizza', 'Caesar Salad', 'Tiramisu'],
      lastOrderDays: 3
    },
    {
      id: 'mike-chen',
      name: 'Mike Chen',
      type: 'regular',
      loyaltyTier: 'gold',
      visitCount: 23,
      totalSpent: 578.30,
      preferredItems: ['Buffalo Wings', 'Beer', 'Nachos'],
      lastOrderDays: 7
    },
    {
      id: 'emily-davis',
      name: 'Emily Davis',
      type: 'new',
      loyaltyTier: 'bronze',
      visitCount: 2,
      totalSpent: 34.50,
      preferredItems: ['Veggie Burger'],
      lastOrderDays: 12
    },
    {
      id: 'alex-rodriguez',
      name: 'Alex Rodriguez',
      type: 'regular',
      loyaltyTier: 'silver',
      visitCount: 15,
      totalSpent: 287.80,
      preferredItems: ['Pasta Alfredo', 'Garlic Bread'],
      lastOrderDays: 21
    }
  ];

  useEffect(() => {
    loadRealTimeMetrics();
    const interval = setInterval(loadRealTimeMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRealTimeMetrics = () => {
    const metrics = {
      metrics: {
        activeConversations: Math.floor(Math.random() * 15) + 5,
        currentConversionRate: 0.67 + (Math.random() * 0.2 - 0.1),
        avgResponseTime: 2.1 + (Math.random() * 1.0 - 0.5),
        upsellSuccessRate: 0.31 + (Math.random() * 0.15 - 0.075),
        currentPeakStatus: ['low', 'moderate', 'peak'][Math.floor(Math.random() * 3)]
      }
    };
    console.log('Loading real-time metrics:', metrics);
    setRealTimeMetrics(metrics);
  };

  const generateIntelligentResponse = (message: string, customer: CustomerSimulation) => {
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || message === 'Hi there!') {
      if (customer.loyaltyTier === 'platinum') {
        response = `Hi ${customer.name}! 🌟 Welcome back, our platinum member! I see you love ${customer.preferredItems[0]}. Would you like your usual, or shall we try something new today?`;
      } else if (customer.visitCount > 10) {
        response = `Hey ${customer.name}! 👋 Great to see you again! You're one of our valued regulars with ${customer.visitCount} visits. What sounds delicious today?`;
      } else if (customer.visitCount <= 2) {
        response = `Welcome ${customer.name}! 😊 I'm excited to help you discover our amazing menu. What type of food are you in the mood for?`;
      } else {
        response = `Hi ${customer.name}! Welcome back! What can I get started for you today?`;
      }
    } else if (lowerMessage.includes('pizza')) {
      response = `Excellent choice! Our pizzas are made fresh with premium ingredients. `;
      if (customer.loyaltyTier === 'gold' || customer.loyaltyTier === 'platinum') {
        response += `As a ${customer.loyaltyTier} member, you get free garlic bread with any large pizza! `;
      }
      response += `Which pizza catches your eye?\n\n🍕 Margherita - $15.99\n🍕 Pepperoni - $17.99\n🍕 Meat Lovers - $19.99\n🍕 Veggie Supreme - $18.99`;
    } else if (lowerMessage.includes('burger')) {
      response = `Our burgers are incredible! Hand-formed patties with fresh ingredients. What kind of burger sounds perfect?\n\n🍔 Classic Burger - $12.99\n🍔 Bacon Cheeseburger - $14.99\n🍔 BBQ Burger - $15.99\n🍟 All burgers come with fries!`;
    } else if (lowerMessage.includes('menu') || (lowerMessage.includes('what') && lowerMessage.includes('good'))) {
      if (customer.preferredItems.length > 0) {
        response = `Great question! Based on your preferences, I'd especially recommend our ${customer.preferredItems[0]}. But here are some popular options:\n\n🍕 Margherita Pizza - $15.99\n🍔 Classic Burger - $12.99\n🥗 Caesar Salad - $9.99\n🍝 Pasta Alfredo - $14.99\n\nWhat sounds good to you?`;
      } else {
        response = `I'd love to help you explore our menu! Here are some of our most popular items:\n\n🍕 Margherita Pizza - $15.99\n🍔 Classic Burger - $12.99\n🥗 Caesar Salad - $9.99\n🍝 Pasta Alfredo - $14.99\n\nWhat type of cuisine are you in the mood for?`;
      }
    } else if (lowerMessage.includes('reward') || lowerMessage.includes('point') || lowerMessage.includes('loyalty')) {
      const loyaltyPoints = Math.floor(customer.totalSpent * 0.1);
      response = `Great question! As a ${customer.loyaltyTier} member, you have ${loyaltyPoints} loyalty points! ⭐\n\nThat's $${(loyaltyPoints * 0.01).toFixed(2)} in rewards you can use today. Plus, `;
      
      if (customer.loyaltyTier === 'platinum') {
        response += `as our platinum member, you get 20% off everything and free delivery! 🌟`;
      } else if (customer.loyaltyTier === 'gold') {
        response += `as a gold member, you get 15% off and priority service! ✨`;
      } else if (customer.loyaltyTier === 'silver') {
        response += `as a silver member, you get 10% off your order! 🥈`;
      } else {
        response += `you're earning points with every order towards silver status! 🚀`;
      }
    } else {
      response = `I'd be happy to help you with that! As a ${customer.loyaltyTier} member with ${Math.floor(customer.totalSpent * 0.1)} points, you're always getting our best service. What can I get started for you today?`;
    }
    
    // Generate smart upsells
    const upsells = [];
    if (lowerMessage.includes('pizza')) {
      upsells.push({
        itemName: 'Garlic Bread',
        reason: 'Garlic bread pairs perfectly with pizza!',
        confidence: 0.85,
        suggestedPrice: 4.99
      });
    } else if (lowerMessage.includes('burger')) {
      upsells.push({
        itemName: 'Onion Rings',
        reason: 'Upgrade your fries to crispy onion rings!',
        confidence: 0.78,
        suggestedPrice: 3.49
      });
    }
    
    return {
      response,
      upsellSuggestions: upsells,
      customerInsights: {
        loyaltyTier: customer.loyaltyTier,
        loyaltyPoints: Math.floor(customer.totalSpent * 0.1),
        visitCount: customer.visitCount,
        averageOrderValue: customer.totalSpent / customer.visitCount,
        preferredItems: customer.preferredItems
      }
    };
  };

  const selectCustomer = (customer: CustomerSimulation) => {
    console.log('Selecting customer:', customer.name);
    setSelectedCustomer(customer);
    setChatMessages([]);
    setUpsellSuggestions([]);
    setCustomerInsights(null);
    setConversationContext(null);
    
    // Auto-start with greeting
    setTimeout(() => {
      console.log('Sending greeting message...');
      sendMessage('Hi there!', true);
    }, 500);
  };

  const sendMessage = (message: string, isAutoGreeting = false) => {
    console.log('sendMessage called with:', message, 'isAutoGreeting:', isAutoGreeting);
    if (!selectedCustomer) {
      console.log('No selected customer, returning');
      return;
    }
    
    console.log('Selected customer:', selectedCustomer.name);
    
    if (!isAutoGreeting) {
      setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    }
    
    setIsLoading(true);
    console.log('Loading set to true');
    
    // Simulate AI processing time
    setTimeout(() => {
      console.log('Processing AI response...');
      const aiResponse = generateIntelligentResponse(message, selectedCustomer);
      console.log('AI Response generated:', aiResponse);
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse.response,
        metadata: {
          upsellSuggestions: aiResponse.upsellSuggestions,
          realTimeMetrics: realTimeMetrics
        }
      }]);
      
      setCustomerInsights(aiResponse.customerInsights);
      setUpsellSuggestions(aiResponse.upsellSuggestions);
      setConversationContext({
        sessionId: `demo-${selectedCustomer.id}-${Date.now()}`,
        stage: message.toLowerCase().includes('pizza') || message.toLowerCase().includes('burger') ? 'ordering' : 'browsing',
        customerId: selectedCustomer.id,
        tenantId: 'royale-with-cheese'
      });
      
      setIsLoading(false);
      console.log('AI response processed and loading set to false');
    }, 1000 + Math.random() * 1000); // 1-2 second delay for realism
  };

  const handleSendMessage = () => {
    if (userInput.trim() && !isLoading) {
      sendMessage(userInput);
      setUserInput('');
    }
  };

  const simulateQuickOrder = (orderType: string) => {
    const orders = {
      pizza: "I'd like a large Margherita pizza",
      burger: "Can I get a bacon cheeseburger with fries?",
      browsing: "What's good on your menu today?",
      loyalty: "Do I have any rewards or points?"
    };
    
    sendMessage(orders[orderType as keyof typeof orders] || orders.browsing);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🧠 Advanced AI Intelligence Demo
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Experience the future of restaurant AI with customer memory, smart upselling, 
            real-time analytics, and predictive intelligence. Each customer gets a personalized experience!
          </p>
        </div>

        {/* Real-time Metrics Dashboard */}
        {realTimeMetrics && (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              📊 Real-time Restaurant Intelligence
              <span className="ml-3 text-sm bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">
                LIVE
              </span>
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white mb-2">
                    {realTimeMetrics.metrics.activeConversations}
                  </div>
                  <div className="text-blue-100 font-medium">Active Chats</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white mb-2">
                    {(realTimeMetrics.metrics.currentConversionRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-green-100 font-medium">Conversion Rate</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white mb-2">
                    {realTimeMetrics.metrics.avgResponseTime.toFixed(1)}s
                  </div>
                  <div className="text-purple-100 font-medium">Response Time</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-white mb-2">
                    {(realTimeMetrics.metrics.upsellSuccessRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-orange-100 font-medium">Upsell Success</div>
                </div>
              </div>
            </div>
            
            {/* Peak Status Indicator */}
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-lg transition-all ${
                realTimeMetrics.metrics.currentPeakStatus === 'peak' 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : realTimeMetrics.metrics.currentPeakStatus === 'moderate'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-green-500 text-white'
              }`}>
                {realTimeMetrics.metrics.currentPeakStatus === 'peak' && '🔥 PEAK TIME'}
                {realTimeMetrics.metrics.currentPeakStatus === 'moderate' && '⚡ BUSY PERIOD'}
                {realTimeMetrics.metrics.currentPeakStatus === 'low' && '😌 NORMAL TRAFFIC'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Selection */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">👥 Customer Profiles</h3>
            
            <div className="space-y-4">
              {demoCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:scale-105 ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-white/20 border-cyan-400 shadow-lg scale-105'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{customer.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold animate-pulse ${
                      customer.loyaltyTier === 'platinum' ? 'bg-purple-500 text-white' :
                      customer.loyaltyTier === 'gold' ? 'bg-yellow-500 text-black' :
                      customer.loyaltyTier === 'silver' ? 'bg-gray-400 text-black' :
                      'bg-orange-600 text-white'
                    }`}>
                      {customer.loyaltyTier.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-purple-200 space-y-1">
                    <div>🏪 {customer.visitCount} visits • ${customer.totalSpent.toFixed(2)} spent</div>
                    <div>💖 Likes: {customer.preferredItems.slice(0, 2).join(', ')}</div>
                    <div>📅 Last order: {customer.lastOrderDays} days ago</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-cyan-500/20 rounded-2xl border border-cyan-400/30">
              <div className="text-cyan-300 text-sm font-medium mb-2">💡 Try This:</div>
              <div className="text-cyan-200 text-xs">
                Click on Sarah Johnson (Platinum) to see how the AI treats VIP customers differently than new customers like Emily Davis!
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-2xl font-bold text-white flex items-center">
                💬 AI Chat Assistant
                {selectedCustomer && (
                  <span className="ml-3 text-lg text-purple-300">
                    with {selectedCustomer.name}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="flex-1 p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {!selectedCustomer ? (
                <div className="text-center text-purple-200 mt-12">
                  <div className="text-6xl mb-4 animate-bounce">🤖</div>
                  <p className="text-lg mb-4">Select a customer to start an intelligent conversation!</p>
                  <div className="text-sm text-purple-300">
                    ← Choose a customer profile to see personalized AI responses
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl transition-all hover:scale-105 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white/20 text-white border border-white/30 shadow-lg'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Show metadata for assistant messages */}
                        {message.role === 'assistant' && message.metadata && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            {message.metadata.upsellSuggestions?.length > 0 && (
                              <div className="text-sm bg-green-500/20 rounded-lg p-2 mb-2 animate-pulse">
                                💡 <strong>Smart Upsell:</strong> {message.metadata.upsellSuggestions[0].reason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-white/20 text-white p-4 rounded-2xl border border-white/30">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="p-6 border-t border-white/20">
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => simulateQuickOrder('pizza')}
                    className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-all hover:scale-105"
                    disabled={isLoading}
                  >
                    🍕 Order Pizza
                  </button>
                  <button
                    onClick={() => simulateQuickOrder('burger')}
                    className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm hover:bg-yellow-500/30 transition-all hover:scale-105"
                    disabled={isLoading}
                  >
                    🍔 Order Burger
                  </button>
                  <button
                    onClick={() => simulateQuickOrder('browsing')}
                    className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-all hover:scale-105"
                    disabled={isLoading}
                  >
                    📋 Browse Menu
                  </button>
                  <button
                    onClick={() => simulateQuickOrder('loyalty')}
                    className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-all hover:scale-105"
                    disabled={isLoading}
                  >
                    ⭐ Check Rewards
                  </button>
                </div>
                
                {/* Message Input */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-purple-500 transition-all hover:scale-105 shadow-lg"
                  >
                    {isLoading ? '⏳' : '📤'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customer Intelligence Panel */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">🧠 Customer Intelligence</h3>
            
            {!selectedCustomer ? (
              <div className="text-center text-purple-200 mt-12">
                <div className="text-4xl mb-4 animate-pulse">🔍</div>
                <p>Customer insights will appear here when you start a conversation.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Customer Profile */}
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                  <h4 className="font-bold text-white mb-3">👤 Profile Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Loyalty Tier:</span>
                      <span className="text-white font-medium">{selectedCustomer.loyaltyTier.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Visits:</span>
                      <span className="text-white font-medium">{selectedCustomer.visitCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Spent:</span>
                      <span className="text-white font-medium">${selectedCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Avg Order:</span>
                      <span className="text-white font-medium">${(selectedCustomer.totalSpent / Math.max(selectedCustomer.visitCount, 1)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Live Customer Insights */}
                {customerInsights && (
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 border border-green-400/30">
                    <h4 className="font-bold text-green-300 mb-3">🔥 Live Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-200">Loyalty Points:</span>
                        <span className="text-green-400 font-medium animate-pulse">{customerInsights.loyaltyPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-200">AOV:</span>
                        <span className="text-green-400 font-medium">${customerInsights.averageOrderValue?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upsell Opportunities */}
                {upsellSuggestions.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-400/30 animate-pulse">
                    <h4 className="font-bold text-yellow-300 mb-3">💡 Smart Upsells</h4>
                    {upsellSuggestions.slice(0, 2).map((upsell, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="text-white font-medium">{upsell.itemName}</div>
                        <div className="text-yellow-200 text-sm">{upsell.reason}</div>
                        <div className="text-yellow-400 text-sm">
                          {(upsell.confidence * 100).toFixed(1)}% confidence • ${upsell.suggestedPrice}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conversation Context */}
                {conversationContext && (
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <h4 className="font-bold text-white mb-3">📊 Context</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Stage:</span>
                        <span className="text-white font-medium capitalize">{conversationContext.stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Session:</span>
                        <span className="text-white font-medium text-xs">{conversationContext.sessionId?.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferred Items */}
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <h4 className="font-bold text-white mb-3">❤️ Preferences</h4>
                  <div className="space-y-1">
                    {selectedCustomer.preferredItems.map((item, index) => (
                      <div key={index} className="text-purple-200 text-sm">• {item}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">🚀 AI Intelligence Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3 animate-bounce">🧠</div>
              <h4 className="font-bold text-white mb-2">Customer Memory</h4>
              <p className="text-purple-200 text-sm">Remembers preferences, orders, and conversation style</p>
            </div>
            
            <div className="text-center p-4 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3 animate-pulse">💡</div>
              <h4 className="font-bold text-white mb-2">Smart Upselling</h4>
              <p className="text-purple-200 text-sm">AI-powered recommendations based on customer behavior</p>
            </div>
            
            <div className="text-center p-4 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-white mb-2">Real-time Analytics</h4>
              <p className="text-purple-200 text-sm">Live performance metrics and conversion tracking</p>
            </div>
            
            <div className="text-center p-4 hover:scale-105 transition-transform">
              <div className="text-4xl mb-3 animate-spin">🔮</div>
              <h4 className="font-bold text-white mb-2">Predictive Intelligence</h4>
              <p className="text-purple-200 text-sm">Anticipates customer needs and peak times</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 