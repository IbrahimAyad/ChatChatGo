'use client';

import React from 'react';
import Link from 'next/link';
import { VoiceChatWidget } from '@/components/widget/VoiceChatWidget';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChatChatGo
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Voice-First AI Assistants for Every Business
              </p>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Customer <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Conversations with AI
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Deploy intelligent voice assistants that understand your business, engage customers naturally, 
              and convert conversations into revenue. Start your free trial today.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                🚀 Start Free Trial
              </Button>
              <Link href="/smart-context-demo">
                <Button variant="outline" size="lg" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold">
                  🧠 Try Smart Context Demo
                </Button>
              </Link>
              <Link href="/customer-setup">
                <Button variant="outline" size="lg" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold">
                  ⚡ Business Onboarding Center
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-gray-600">Uptime Guaranteed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">&lt; 100ms</div>
                <div className="text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">Always Available</div>
              </div>
            </div>

            {/* Developer/Partner Access */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-500 text-sm mb-3">For developers and partners:</p>
              <Link href="/control-center">
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                  🎛️ ChatChatGo Control Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our enterprise-grade platform delivers conversational AI that scales with your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎤</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Voice-First Design</h4>
              <p className="text-gray-600">
                Natural speech recognition with ElevenLabs voices. Your customers talk, we understand.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h4>
              <p className="text-gray-600">
                Real-time dashboards with conversation insights and performance metrics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Scale</h4>
              <p className="text-gray-600">
                Multi-tenant architecture built for reliability and performance at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Widget */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Experience Voice AI
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Try our restaurant assistant demo. Click the microphone button to speak naturally.
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <VoiceChatWidget />
          </div>
          
          <div className="mt-8">
            <p className="text-gray-500 text-sm">
              💡 Try asking about "menu items", "hours", or "reservations"
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of businesses already using ChatChatGo to enhance customer experiences
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 text-xl font-semibold shadow-lg">
              🚀 Start Your Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
              📞 Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 