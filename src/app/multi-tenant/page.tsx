'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import TenantChatWidget from '@/components/widget/TenantChatWidget';
import { Tenant } from '@/types/tenant';
import Link from 'next/link';

export default function ControlCenter() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenants');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants');
      const data = await response.json();
      setTenants(data.tenants || []);
      if (data.tenants?.length > 0) {
        setSelectedTenant(data.tenants[0].id);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIndustryIcon = (industry: string) => {
    const icons = {
      restaurant: '🍽️',
      retail: '🛍️',
      healthcare: '🏥',
      education: '🎓',
      finance: '💰',
      'real-estate': '🏠',
      automotive: '🚗',
      hospitality: '🏨',
      fitness: '💪',
      beauty: '💄',
      legal: '⚖️',
      consulting: '💼',
      technology: '💻',
      other: '🏢',
    };
    return icons[industry as keyof typeof icons] || '🏢';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 opacity-20"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading ChatChatGo Control Center...</p>
          <p className="text-purple-200 text-sm mt-2">Initializing systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              🎛️ ChatChatGo Control Center
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-6"
            >
              Central command for managing AI assistants, demos, and platform tools
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ Multi-Tenant Management
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                🎨 Demo Playground
              </div>
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                🤖 AI Tools & Testing
              </div>
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                🔧 Development Center
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Tenants</p>
                <p className="text-white text-3xl font-bold">{tenants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Active Tenants</p>
                <p className="text-white text-3xl font-bold">{tenants.filter(t => t.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Trial Tenants</p>
                <p className="text-white text-3xl font-bold">{tenants.filter(t => t.status === 'trial').length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🔥</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Conversations</p>
                <p className="text-white text-3xl font-bold">3,164</p>
              </div>
              <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tenants'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              🏢 Multi-Tenant Management
            </button>
            <button
              onClick={() => setActiveTab('demos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'demos'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              🎨 Demo Playground
            </button>
            <button
              onClick={() => setActiveTab('chat-test')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chat-test'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              🧪 Chat Test Center
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tools'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              🤖 AI Tools & Testing
            </button>
            <button
              onClick={() => setActiveTab('development')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'development'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              🔧 Development Center
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'tenants' && (
          <TenantManagementTab 
            tenants={tenants}
            selectedTenant={selectedTenant}
            setSelectedTenant={setSelectedTenant}
            getIndustryIcon={getIndustryIcon}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'demos' && <DemoPlaygroundTab />}
        {activeTab === 'chat-test' && <ChatTestCenterTab />}
        {activeTab === 'tools' && <AIToolsTab />}
        {activeTab === 'development' && <DevelopmentCenterTab />}
      </div>
    </div>
  );
}

// Multi-Tenant Management Tab
function TenantManagementTab({ tenants, selectedTenant, setSelectedTenant, getIndustryIcon, getStatusColor }: any) {
  const selectedTenantData = tenants.find((t: Tenant) => t.id === selectedTenant);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Tenant List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🏢 All Tenants
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Manage your multi-tenant ecosystem
          </p>
          
          <div className="space-y-3">
            {tenants.map((tenant: Tenant) => (
              <motion.button
                key={tenant.id}
                onClick={() => setSelectedTenant(tenant.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTenant === tenant.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getIndustryIcon(tenant.industry)}</span>
                    <span className="font-medium text-gray-900">{tenant.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{tenant.id}</p>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/customer-setup">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                ➕ Add New Tenant
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tenant Details */}
      <div className="lg:col-span-2">
        {selectedTenantData ? (
          <TenantDetails tenant={selectedTenantData} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Tenant</h3>
            <p className="text-gray-600">Choose a tenant from the list to view details and manage their AI assistant</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Demo Playground Tab
function DemoPlaygroundTab() {
  const demos = [
    {
      title: '🧠 Smart Context Demo',
      description: 'Intelligent conversation flow with context awareness',
      link: '/smart-context-demo',
      icon: '🧠',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: '🎤 Voice Intelligence Demo',
      description: 'Advanced voice processing and conversation capabilities',
      link: '/voice-intelligence',
      icon: '🎤',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '🍽️ Restaurant Intelligence',
      description: 'Full restaurant AI assistant with menu integration',
      link: '/restaurant-intelligence',
      icon: '🍽️',
      color: 'from-green-500 to-teal-500'
    },
    {
      title: '🤖 AI Intelligence Demo',
      description: 'Core AI capabilities and reasoning demonstration',
      link: '/ai-intelligence-demo',
      icon: '🤖',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {demos.map((demo, index) => (
        <motion.div
          key={demo.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className={`h-2 bg-gradient-to-r ${demo.color}`}></div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${demo.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-white text-xl">{demo.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{demo.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{demo.description}</p>
            <Link href={demo.link}>
              <Button className={`w-full bg-gradient-to-r ${demo.color} text-white hover:opacity-90`}>
                🚀 Launch Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Chat Test Center Tab
function ChatTestCenterTab() {
  const chatInterfaces = [
    {
      title: '🎯 Classic Chat Interface',
      description: 'Clean, minimal design with focus on conversation flow',
      image: '/api/placeholder/400/250',
      link: '/chat-test/classic',
      icon: '💬',
      color: 'from-blue-500 to-indigo-500',
      features: ['Clean UI', 'Fast Loading', 'Mobile Optimized']
    },
    {
      title: '🌟 Premium Chat Experience',
      description: 'Enhanced UI with animations and advanced features',
      image: '/api/placeholder/400/250',
      link: '/chat-test/premium',
      icon: '✨',
      color: 'from-purple-500 to-pink-500',
      features: ['Animations', 'Rich Media', 'Voice Integration']
    },
    {
      title: '🚀 Futuristic Chat Lab',
      description: 'Experimental interface with cutting-edge design',
      image: '/api/placeholder/400/250',
      link: '/chat-test/futuristic',
      icon: '🔮',
      color: 'from-cyan-500 to-blue-500',
      features: ['3D Elements', 'Micro Interactions', 'AI Insights']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-4"
        >
          🧪 Chat Test Center
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-purple-200 mb-8"
        >
          Laboratory for testing different chat interface designs and experiences
        </motion.p>
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 text-yellow-200 max-w-2xl mx-auto">
          <p className="text-sm">
            🔬 <strong>Lab Environment:</strong> Each interface opens in a new tab for isolated testing. 
            Same AI functionality, different user experiences.
          </p>
        </div>
      </div>

      {/* Chat Interface Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {chatInterfaces.map((chatInterface, index) => (
          <motion.div
            key={chatInterface.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            {/* Preview Image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className={`w-24 h-24 bg-gradient-to-r ${chatInterface.color} rounded-full flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {chatInterface.icon}
              </div>
              <div className="absolute top-4 right-4 bg-black/20 text-white px-2 py-1 rounded text-xs">
                Preview
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${chatInterface.color} rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white text-sm">{chatInterface.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{chatInterface.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{chatInterface.description}</p>
              
              {/* Features */}
              <div className="space-y-2 mb-6">
                {chatInterface.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Test Button */}
              <button
                onClick={() => window.open(chatInterface.link, '_blank', 'noopener,noreferrer')}
                className={`w-full bg-gradient-to-r ${chatInterface.color} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                🚀 Open Test Environment
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lab Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Active Tests</p>
              <p className="text-white text-2xl font-bold">3</p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🧪</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Interface Variants</p>
              <p className="text-white text-2xl font-bold">3</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🎨</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Test Sessions</p>
              <p className="text-white text-2xl font-bold">127</p>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Tools Tab
function AIToolsTab() {
  const tools = [
    {
      title: '🎙️ Voice Testing Lab',
      description: 'Test ElevenLabs voices and speech recognition',
      link: '/voice-test',
      icon: '🎙️',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: '📞 Voice Conversation Test',
      description: 'End-to-end voice conversation testing',
      link: '/voice-conversation',
      icon: '📞',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: '🔧 ElevenLabs API Test',
      description: 'Direct API testing and voice generation',
      link: '/test-elevenlabs-api',
      icon: '🔧',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: '🎨 UI Builder',
      description: 'Visual component and interface builder',
      link: '/ui-builder',
      icon: '🎨',
      color: 'from-violet-500 to-purple-500'
    },
    {
      title: '🎯 Widget Tiers Demo',
      description: 'Compare subscription tiers and UI variations',
      link: '/widget-tiers-demo',
      icon: '🎯',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-white text-xl">{tool.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{tool.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{tool.description}</p>
            <Link href={tool.link}>
              <Button className={`w-full bg-gradient-to-r ${tool.color} text-white hover:opacity-90`}>
                🛠️ Open Tool
              </Button>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Development Center Tab
function DevelopmentCenterTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* System Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm">⚡</span>
          </span>
          System Status
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">OpenAI API</span>
            <span className="text-green-600 font-medium">✅ Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">ElevenLabs API</span>
            <span className="text-green-600 font-medium">✅ Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">Voice Processing</span>
            <span className="text-green-600 font-medium">✅ Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">Database</span>
            <span className="text-green-600 font-medium">✅ Operational</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm">🚀</span>
          </span>
          Quick Actions
        </h3>
        <div className="space-y-3">
          <Link href="/customer-setup">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white justify-start">
              ⚡ Business Onboarding Center
            </Button>
          </Link>
          <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white justify-start">
            📊 Analytics Dashboard
          </Button>
          <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white justify-start">
            🔧 API Documentation
          </Button>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white justify-start">
            💻 Developer Console
          </Button>
        </div>
      </div>
    </div>
  );
}

// Tenant Details Component (simplified for space)
function TenantDetails({ tenant }: { tenant: Tenant }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-3">{tenant.industry === 'restaurant' ? '🍽️' : '🏢'}</span>
          {tenant.name}
        </h2>
        <Link href={`/dashboard/${tenant.id}`}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            📊 View Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-medium capitalize">{tenant.status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Industry</p>
          <p className="font-medium capitalize">{tenant.industry}</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Assistant Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <TenantChatWidget tenantId={tenant.id} />
        </div>
      </div>
    </div>
  );
}