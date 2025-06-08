'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import TenantChatWidget from '@/components/widget/TenantChatWidget';
import { Tenant } from '@/types/tenant';

export default function MultiTenantDemo() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          <p className="text-white text-lg font-medium">Loading multi-tenant demo...</p>
          <p className="text-purple-200 text-sm mt-2">Preparing tenant showcase</p>
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
              🏢 Multi-Tenant AI System
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-6"
            >
              Experience how ChatChatGo creates isolated AI assistants for different businesses
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ Tenant Isolation
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                🎨 Custom Branding
              </div>
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                🤖 Industry-Specific AI
              </div>
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                🔧 Configurable Settings
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tenant Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🎯 Select a Tenant
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Choose a business to see their customized AI assistant in action
              </p>
              
              <div className="space-y-3">
                {tenants.map((tenant) => (
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getIndustryIcon(tenant.industry)}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {tenant.name}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {tenant.industry}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {tenant.subscription}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => window.open('/admin', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  🔧 Admin Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Tenant Details & Demo */}
          <div className="lg:col-span-2">
            {selectedTenant && (
              <TenantDetails 
                tenant={tenants.find(t => t.id === selectedTenant)!} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      {selectedTenant && (
        <TenantChatWidget 
          tenantId={selectedTenant}
          key={selectedTenant} // Force re-render when tenant changes
        />
      )}
    </div>
  );
}

function TenantDetails({ tenant }: { tenant: Tenant }) {
  const [menuData, setMenuData] = useState<any>(null);
  const [menuLoading, setMenuLoading] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (tenant.industry === 'restaurant') {
        setMenuLoading(true);
        try {
          const response = await fetch(`/api/tenants/${tenant.slug}/menu-data`);
          if (response.ok) {
            const data = await response.json();
            setMenuData(data.menuData);
          }
        } catch (error) {
          console.log('No menu data available');
        } finally {
          setMenuLoading(false);
        }
      }
    };

    fetchMenuData();
  }, [tenant.slug, tenant.industry]);

  return (
    <motion.div
      key={tenant.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Business Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {tenant.name}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {tenant.industry === 'restaurant' ? '🍽️' :
               tenant.industry === 'retail' ? '🛍️' :
               tenant.industry === 'healthcare' ? '🏥' : '🏢'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tenant.status)}`}>
              {tenant.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Business Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Industry:</span> <span className="capitalize">{tenant.industry}</span></p>
              <p><span className="text-gray-500">Plan:</span> <span className="capitalize">{tenant.subscription}</span></p>
              <p><span className="text-gray-500">Owner:</span> {tenant.owner.name}</p>
              <p><span className="text-gray-500">Email:</span> {tenant.owner.email}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">AI Configuration</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Model:</span> {tenant.settings.aiModel}</p>
              <p><span className="text-gray-500">Voice:</span> {tenant.settings.voiceEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
              <p><span className="text-gray-500">Temperature:</span> {tenant.settings.temperature}</p>
              <p><span className="text-gray-500">Language:</span> {tenant.settings.language}</p>
            </div>
          </div>

          {/* Menu Data Status - Only for restaurants */}
          {tenant.industry === 'restaurant' && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700 mb-2">🍽️ Menu Data Status</h3>
              {menuLoading ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Loading menu data...</span>
                </div>
              ) : menuData ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-800 font-medium">Menu Data Available</span>
                  </div>
                  <div className="space-y-1 text-sm text-green-700">
                    <p><span className="font-medium">Restaurant:</span> {menuData.restaurantName || 'Unknown'}</p>
                    <p><span className="font-medium">Menu Items:</span> {menuData.menu?.length || 0}</p>
                    <p><span className="font-medium">Last Updated:</span> {menuData.lastUpdated ? new Date(menuData.lastUpdated).toLocaleDateString() : 'Unknown'}</p>
                    <p><span className="font-medium">Data Source:</span> {menuData.dataSource || 'Unknown'}</p>
                    {menuData.source && (
                      <p><span className="font-medium">Source URL:</span> 
                        <a href={menuData.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {menuData.source.length > 40 ? menuData.source.substring(0, 40) + '...' : menuData.source}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-yellow-800 font-medium">No Menu Data</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This restaurant hasn't uploaded menu data yet. Use the{' '}
                    <a href="/customer-setup" className="text-blue-600 hover:underline">Customer Setup Wizard</a>{' '}
                    or <a href="/menu-manager" className="text-blue-600 hover:underline">Menu Manager</a> to add menu information.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Branding Preview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Custom Branding</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Color Scheme</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: tenant.branding.primaryColor }}
                ></div>
                <span className="text-sm">Primary: {tenant.branding.primaryColor}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: tenant.branding.secondaryColor }}
                ></div>
                <span className="text-sm">Secondary: {tenant.branding.secondaryColor}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: tenant.branding.accentColor }}
                ></div>
                <span className="text-sm">Accent: {tenant.branding.accentColor}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Widget Settings</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Position:</span> {tenant.branding.widgetPosition}</p>
              <p><span className="text-gray-500">Size:</span> {tenant.branding.widgetSize}</p>
              <p><span className="text-gray-500">Font:</span> {tenant.branding.fontFamily}</p>
              <p><span className="text-gray-500">Border Radius:</span> {tenant.branding.borderRadius}px</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Usage Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {tenant.usage.totalAllTime.conversations.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Conversations</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {tenant.usage.totalAllTime.uniqueUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Unique Users</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {tenant.usage.totalAllTime.voiceMinutes.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Voice Minutes</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {tenant.usage.totalAllTime.leads.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Leads Generated</p>
          </div>
        </div>
      </div>

      {/* System Prompt Preview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🧠 AI System Prompt</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 font-mono leading-relaxed">
            {tenant.settings.systemPrompt}
          </p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            💡 <strong>Try the chat widget</strong> in the bottom-right corner to see this AI in action!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'trial': return 'bg-blue-100 text-blue-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'suspended': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
} 