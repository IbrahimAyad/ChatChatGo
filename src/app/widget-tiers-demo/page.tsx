'use client';

import { useState } from 'react';

export default function WidgetTiersDemo() {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'professional' | 'enterprise'>('basic');

  const PLANS = {
    basic: { name: 'Basic Chat', price: 99, features: { voiceChat: false, analytics: false, fileUpload: false, animations: false, customBranding: false } },
    professional: { name: 'Professional Voice', price: 149, features: { voiceChat: true, analytics: true, fileUpload: true, animations: true, customBranding: true } },
    enterprise: { name: 'Enterprise Suite', price: 299, features: { voiceChat: true, analytics: true, fileUpload: true, animations: true, customBranding: true } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 ChatChatGo Widget Tiers Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience different subscription tiers with unique UI designs and feature sets. 
            Perfect for offering multiple pricing options while maintaining different user experiences.
          </p>
        </div>

        {/* Tier Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
            {Object.entries(PLANS).map(([key, plan]) => (
              <button
                key={key}
                onClick={() => setSelectedTier(key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTier === key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm font-bold">${plan.price}</div>
                <div className="text-xs">{plan.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
                selectedTier === key
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    ${plan.price}<span className="text-lg text-gray-500">/mo</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <span className={`w-4 h-4 rounded-full mr-3 ${plan.features.voiceChat ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Voice Chat
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`w-4 h-4 rounded-full mr-3 ${plan.features.analytics ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Analytics
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`w-4 h-4 rounded-full mr-3 ${plan.features.fileUpload ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    File Upload
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`w-4 h-4 rounded-full mr-3 ${plan.features.animations ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Animations
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`w-4 h-4 rounded-full mr-3 ${plan.features.customBranding ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Custom Branding
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Demo Placeholder */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Widget Tier Comparison</h2>
            <p className="opacity-90">See the differences between {PLANS[selectedTier].name} and other tiers</p>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Currently showing: <strong>{PLANS[selectedTier].name}</strong></span>
                <span className="mx-2">•</span>
                <span>Price: <strong>${PLANS[selectedTier].price}/month</strong></span>
              </div>
            </div>
            
            <div className="h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">
                  {selectedTier === 'basic' && '💬'}
                  {selectedTier === 'professional' && '🎤'}
                  {selectedTier === 'enterprise' && '🚀'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{PLANS[selectedTier].name}</h3>
                <p className="text-gray-600">Widget preview for ${PLANS[selectedTier].price}/month tier</p>
                <div className="mt-4 text-sm text-gray-500">
                  Features: {Object.entries(PLANS[selectedTier].features).filter(([_, enabled]) => enabled).length} enabled
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ Implementation Logic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Each tenant has a subscription tier in their settings</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Widget automatically loads the appropriate UI based on tier</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Features are enabled/disabled based on subscription</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Easy to add new tiers or modify existing ones</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Clear value differentiation between tiers</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Multiple UI versions available simultaneously</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Encourages upgrades with visual improvements</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Flexible for testing different UX approaches</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 