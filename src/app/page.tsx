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
              <h1 className="text-6xl font-bold text-gradient-brand">
                ChatChatGo
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Scalable AI Chat SaaS for Industry Domination
              </p>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of <br />
              <span className="text-gradient-brand">
                Conversational AI
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your customer interactions with voice-first, AI-powered assistants. 
              From restaurants to retail, healthcare to finance – we're building the Stripe for conversational AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg">
                Start Free Trial
              </Button>
              <Link href="/customer-setup">
                <Button variant="outline" size="lg" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                  🎯 Customer Setup Wizard
                </Button>
              </Link>
              <Link href="/multi-tenant">
                <Button variant="outline" size="lg">
                  🏢 Multi-Tenant Demo
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg">
                  🔧 Admin Dashboard
                </Button>
              </Link>
              <Link href="/voice-test">
                <Button variant="outline" size="lg" className="border-green-500 text-green-600 hover:bg-green-50">
                  🎤 Voice Test Lab
                </Button>
              </Link>
              <Link href="/ui-builder">
                <Button variant="outline" size="lg" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                  🎨 UI Builder
                </Button>
              </Link>
              <Link href="/smart-context-demo">
                <Button variant="outline" size="lg" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                  🧠 Smart Context Demo
                </Button>
              </Link>
              <Link href="/universal-intelligence-demo">
                <Button variant="outline" size="lg" className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
                  🌍 Universal Intelligence
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">56%</div>
                <div className="text-gray-600">Faster Load Times</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">7+</div>
                <div className="text-gray-600">Industry Verticals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-gray-600">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with enterprise-grade infrastructure 
              to deliver conversational experiences that convert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎤</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Voice-First Design</h4>
              <p className="text-gray-600">
                Built-in speech recognition and synthesis with fallback to text mode. 
                Your customers can talk naturally to your AI assistant.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🏢</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Multi-Tenant SaaS</h4>
              <p className="text-gray-600">
                Purpose-built for scale with tenant isolation, custom branding, 
                and white-label deployment options.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Analytics Intelligence</h4>
              <p className="text-gray-600">
                Real-time dashboards with lead scoring, conversion funnels, 
                and AI-powered insights to optimize your assistants.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🔧</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">N8N Integration</h4>
              <p className="text-gray-600">
                Connect to any system with powerful workflow automation. 
                CRM sync, payment processing, and custom business logic.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎨</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Universal Templates</h4>
              <p className="text-gray-600">
                Database-agnostic templates for any environment. Works with Firebase, Supabase, 
                MySQL, MongoDB, or your existing infrastructure.
              </p>
            </div>

            {/* Feature 6 - Environment Ranking (Clickable) */}
            <Link href="/environment-ranking">
              <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 hover:border-pink-400 transition-all cursor-pointer hover:scale-105">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Environment Ranking</h4>
                <p className="text-gray-600">
                  Intelligent compatibility system that ranks and recommends the best 
                  chatbot setup for your specific infrastructure and requirements.
                </p>
                <div className="mt-4 text-pink-600 font-medium text-sm">
                  → Try the compatibility analyzer
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try our voice-first restaurant assistant below. Click the microphone button in the bottom-right 
              to experience true conversational AI with voice interaction.
            </p>
            <div className="mt-8 space-y-3">
              <div className="p-4 bg-purple-100 border border-purple-200 rounded-lg inline-block">
                <p className="text-purple-800 font-medium">
                  🎤 <strong>Voice-First!</strong> Speak naturally with OpenAI Whisper + ElevenLabs voices
                </p>
              </div>
              <div className="p-4 bg-green-100 border border-green-200 rounded-lg inline-block">
                <p className="text-green-800 font-medium">
                  🚀 <strong>AI-Powered!</strong> Real conversations with OpenAI GPT-3.5 Turbo
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg inline-block">
                <p className="text-blue-800 font-medium">
                  💡 Pro tip: Speak or type about "menu items", "reservations", or "hours"
                </p>
              </div>
            </div>
          </div>

          {/* Demo Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h4 className="text-2xl font-bold text-white mb-2">
                  🎤 Mario's Voice Restaurant Assistant
                </h4>
                <p className="text-blue-100">
                  Experience our voice-first AI assistant with natural speech
                </p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h5 className="text-xl font-semibold text-gray-900 mb-4">
                      Voice & Chat Features:
                    </h5>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        🎤 Speak naturally about menu items
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        🔊 Hear responses with ElevenLabs voices
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        💬 Type messages for traditional chat
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        🤖 Real AI powered by OpenAI GPT
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 text-center border border-purple-200">
                    <div className="text-4xl mb-4">🎤</div>
                    <p className="text-gray-700 font-medium mb-2">
                      Click the voice button in the bottom-right corner!
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Grant microphone permission for full voice experience
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="text-purple-600 font-medium">
                        🎤 Speech-to-Text: OpenAI Whisper
                      </div>
                      <div className="text-pink-600 font-medium">
                        🔊 Text-to-Speech: ElevenLabs AI
                      </div>
                      <div className="text-green-600 font-medium">
                        🤖 Conversations: OpenAI GPT-3.5 Turbo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Universal Architecture
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built to work everywhere. Our ranking system automatically recommends 
              the best setup for your infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl mb-3">🗄️</div>
              <h4 className="font-semibold mb-2">Any Database</h4>
              <p className="text-sm text-gray-600">Firebase, Supabase, MySQL, MongoDB, PostgreSQL</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl mb-3">☁️</div>
              <h4 className="font-semibold mb-2">Any Cloud</h4>
              <p className="text-sm text-gray-600">AWS, Google Cloud, Vercel, Self-hosted</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl mb-3">🔗</div>
              <h4 className="font-semibold mb-2">Any Integration</h4>
              <p className="text-sm text-gray-600">N8N, Zapier, Custom APIs, Webhooks</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold mb-2">Any Platform</h4>
              <p className="text-sm text-gray-600">React, Vue, Angular, WordPress, Shopify</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Customer Experience?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the conversational AI revolution. Start building your intelligent 
            assistant today with our universal platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Voice Chat Widget - This is the main demo! */}
      <VoiceChatWidget />
    </div>
  );
} 