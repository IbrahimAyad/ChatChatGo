'use client';

import React, { useState, useEffect } from 'react';
import SmartBox, { useSmartBoxTracking } from '../../components/SmartBox';
import { smartContextEngine } from '../../lib/smart-context';

export default function SmartContextDemo() {
  const [userId, setUserId] = useState('sarah@example.com');
  const [currentPage, setCurrentPage] = useState('menu');
  const [userStats, setUserStats] = useState<any>(null);
  const [simulatedBehavior, setSimulatedBehavior] = useState<string[]>([]);
  
  const { trackItemView, trackCartAbandon } = useSmartBoxTracking(userId);

  useEffect(() => {
    loadUserStats();
  }, [userId]);

  const loadUserStats = async () => {
    const profile = await smartContextEngine.recognizeUser(userId);
    setUserStats(profile);
  };

  const simulateUserAction = (action: string, data?: any) => {
    setSimulatedBehavior(prev => [...prev, `${new Date().toLocaleTimeString()}: ${action}`]);
    
    switch (action) {
      case 'View Burger':
        trackItemView('Classic Burger');
        smartContextEngine.trackBehavior(userId, 'item_view', { itemName: 'Classic Burger' });
        break;
      case 'Add Burger to Cart':
        trackItemView('Classic Burger');
        break;
      case 'View Fries':
        trackItemView('French Fries');
        break;
      case 'Abandon Cart':
        trackCartAbandon();
        break;
      case 'Browse Menu':
        smartContextEngine.trackBehavior(userId, 'page_view', { 
          page: '/menu', 
          duration: 5000 
        });
        break;
      case 'Scroll Down':
        smartContextEngine.trackBehavior(userId, 'scroll', { depth: 75 });
        break;
    }
  };

  const switchUser = (newUserId: string) => {
    setUserId(newUserId);
    setSimulatedBehavior([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">🧠 Smart Context Detection Demo</h1>
            <p className="text-gray-600 mt-2">
              Experience personalized smart suggestions based on user behavior and recognition
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* User Simulation Panel */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">👤 User Simulation</h3>
              
              {/* User Switcher */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current User
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => switchUser('sarah@example.com')}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      userId === 'sarah@example.com' 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Sarah (Returning Customer)</div>
                    <div className="text-xs text-gray-500">12 previous orders • $247.50 total</div>
                  </button>
                  
                  <button
                    onClick={() => switchUser('guest_user')}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      userId === 'guest_user' 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Guest User (New)</div>
                    <div className="text-xs text-gray-500">First time visitor</div>
                  </button>
                  
                  <button
                    onClick={() => switchUser('vip@example.com')}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      userId === 'vip@example.com' 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">VIP Customer</div>
                    <div className="text-xs text-gray-500">$500+ spent • Premium member</div>
                  </button>
                </div>
              </div>

              {/* User Stats */}
              {userStats && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">User Profile</h4>
                  <div className="space-y-1 text-sm">
                    <div>Name: {userStats.name || 'Guest'}</div>
                    <div>Orders: {userStats.orderHistory?.length || 0}</div>
                    <div>Total Spent: ${userStats.totalOrderAmount || 0}</div>
                    <div>Loyalty: {userStats.loyaltyLevel || 'new'}</div>
                    {userStats.preferences?.favoriteItems?.length > 0 && (
                      <div>Favorite: {userStats.preferences.favoriteItems[0]}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Behavior Simulation */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Simulate User Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => simulateUserAction('View Burger')}
                    className="bg-blue-100 text-blue-800 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    🍔 View Burger
                  </button>
                  <button
                    onClick={() => simulateUserAction('View Fries')}
                    className="bg-yellow-100 text-yellow-800 py-2 px-3 rounded text-sm hover:bg-yellow-200 transition-colors"
                  >
                    🍟 View Fries
                  </button>
                  <button
                    onClick={() => simulateUserAction('Add Burger to Cart')}
                    className="bg-green-100 text-green-800 py-2 px-3 rounded text-sm hover:bg-green-200 transition-colors"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => simulateUserAction('Abandon Cart')}
                    className="bg-red-100 text-red-800 py-2 px-3 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    💔 Abandon Cart
                  </button>
                  <button
                    onClick={() => simulateUserAction('Browse Menu')}
                    className="bg-purple-100 text-purple-800 py-2 px-3 rounded text-sm hover:bg-purple-200 transition-colors"
                  >
                    📖 Browse Menu
                  </button>
                  <button
                    onClick={() => simulateUserAction('Scroll Down')}
                    className="bg-gray-100 text-gray-800 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    📜 Scroll Down
                  </button>
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Activity Log</h4>
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {simulatedBehavior.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No activity yet...</p>
                  ) : (
                    <div className="space-y-1">
                      {simulatedBehavior.map((activity, index) => (
                        <div key={index} className="text-xs text-gray-600 font-mono">
                          {activity}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Restaurant Interface */}
          <div className="col-span-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b bg-gradient-to-r from-red-800 to-red-600 text-white rounded-t-lg">
                <h3 className="font-bold text-xl">🍔 Royale with Cheese</h3>
                <p className="text-red-100 text-sm">A Pulp Fiction inspired burger joint</p>
              </div>
              
              <div className="p-6 relative min-h-96">
                
                {/* Menu Items */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => simulateUserAction('View Burger')}>
                    <div className="text-4xl mb-2">🍔</div>
                    <h4 className="font-semibold">Royale with Cheese</h4>
                    <p className="text-gray-600 text-sm mb-2">Our signature quarter pounder with cheese</p>
                    <p className="font-bold text-lg">$8.99</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => simulateUserAction('View Fries')}>
                    <div className="text-4xl mb-2">🍟</div>
                    <h4 className="font-semibold">French Fries</h4>
                    <p className="text-gray-600 text-sm mb-2">Crispy golden fries</p>
                    <p className="font-bold text-lg">$2.99</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-2">🥤</div>
                    <h4 className="font-semibold">$5 Milkshake</h4>
                    <p className="text-gray-600 text-sm mb-2">Martin & Lewis or Amos & Andy?</p>
                    <p className="font-bold text-lg">$5.00</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-2">🥓</div>
                    <h4 className="font-semibold">Big Kahuna Burger</h4>
                    <p className="text-gray-600 text-sm mb-2">That's a tasty burger!</p>
                    <p className="font-bold text-lg">$12.99</p>
                  </div>
                </div>

                {/* Smart Boxes - These will appear based on user behavior */}
                <SmartBox
                  userId={userId}
                  restaurantId="royale-with-cheese"
                  variant="floating"
                  position="bottom-right"
                  onSuggestionClick={(suggestion) => {
                    setSimulatedBehavior(prev => [
                      ...prev, 
                      `${new Date().toLocaleTimeString()}: Clicked suggestion: ${suggestion.message.substring(0, 30)}...`
                    ]);
                  }}
                />

                {/* Welcome Message for returning users */}
                {userId === 'sarah@example.com' && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl max-w-xs">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">👋</div>
                      <div>
                        <h4 className="font-bold text-sm">Welcome back, Sarah!</h4>
                        <p className="text-xs opacity-75">We missed you</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">Your usual chicken sandwich with no onions?</p>
                    <button 
                      className="w-full bg-white text-indigo-600 font-medium py-2 rounded-lg text-sm"
                      onClick={() => simulateUserAction('Add Usual Order')}
                    >
                      Yes, add it! 🛒
                    </button>
                  </div>
                )}

                {/* Pulp Fiction Theme Trigger */}
                {userId === 'vip@example.com' && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-800 to-red-600 text-white p-4 rounded-2xl border-2 border-yellow-400 max-w-xs">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">🎬</div>
                      <div>
                        <h4 className="font-bold text-sm">Samuel L. Jackson</h4>
                        <p className="text-xs opacity-75">Voice Actor</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3 italic">
                      "What do they call a Quarter Pounder with Cheese in Paris? Try our Royale with Cheese, mother..."
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 bg-yellow-400 text-red-800 font-bold py-2 rounded-lg text-sm"
                        onClick={() => simulateUserAction('Samuel L. Jackson Order')}
                      >
                        🎬 Order with Samuel L.
                      </button>
                      <button className="px-3 bg-white/20 rounded-lg text-xs">🎤</button>
                    </div>
                  </div>
                )}

                {simulatedBehavior.some(b => b.includes('View Burger')) && !simulatedBehavior.some(b => b.includes('View Fries')) && (
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl max-w-xs animate-pulse">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">🔥</span>
                      <span className="font-bold text-sm">Smart Suggestion</span>
                    </div>
                    <p className="text-sm mb-3">🍟 Add fries for just $2.99? Perfect with your burger!</p>
                    <button 
                      className="w-full bg-white text-green-600 font-medium py-2 rounded-lg text-sm"
                      onClick={() => simulateUserAction('Add Fries Upsell')}
                    >
                      🛒 Add Fries
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Smart Context Analytics</h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-gray-600">Suggestion Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">23%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">$4.20</div>
                  <div className="text-sm text-gray-600">Avg Order Increase</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Top Performing Triggers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>🍟 Upsell Triggers</span>
                      <span className="font-medium">78% success</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>👋 Welcome Back</span>
                      <span className="font-medium">92% success</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>🎬 Themed Content</span>
                      <span className="font-medium">65% success</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Context Detection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>User Recognition</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Behavior Tracking</span>
                      <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ML Training</span>
                      <span className="text-blue-600">📈 Learning</span>
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