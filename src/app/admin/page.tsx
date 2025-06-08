'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Tenant } from '@/types/tenant';

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testingTenant, setTestingTenant] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants');
      const data = await response.json();
      setTenants(data.tenants || []);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'trial': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'suspended': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'professional': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'starter': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'free': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getMenuStatus = (tenant: Tenant) => {
    const menuData = tenant.settings.scrapedMenuData;
    
    if (!menuData) {
      return {
        status: 'no-menu',
        label: 'No Menu',
        icon: '📋',
        color: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
        description: 'No menu data available'
      };
    }

    const itemCount = menuData.menu?.length || 0;
    const isStale = menuData.isStale;
    const lastScraped = menuData.lastScraped ? new Date(menuData.lastScraped) : null;
    const daysSinceUpdate = lastScraped ? Math.floor((Date.now() - lastScraped.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (itemCount === 0) {
      return {
        status: 'empty',
        label: 'Empty Menu',
        icon: '⚠️',
        color: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
        description: 'Menu scraped but no items found - manual upload needed'
      };
    }

    if (isStale || (daysSinceUpdate && daysSinceUpdate > 7)) {
      return {
        status: 'stale',
        label: 'Outdated',
        icon: '🔄',
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
        description: `Menu data is ${daysSinceUpdate} days old - needs refresh`
      };
    }

    if (itemCount < 5) {
      return {
        status: 'incomplete',
        label: 'Incomplete',
        icon: '📝',
        color: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        description: `Only ${itemCount} items found - may need manual completion`
      };
    }

    return {
      status: 'healthy',
      label: 'Active',
      icon: '✅',
      color: 'bg-green-500/20 text-green-300 border-green-400/30',
      description: `${itemCount} menu items available`
    };
  };

  const testTenantChat = async (tenantId: string) => {
    setTestingTenant(tenantId);
    try {
      const response = await fetch('/api/chat/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          message: 'Hello! This is a test message from the admin dashboard.',
          sessionId: `admin-test-${Date.now()}`,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Chat test successful!\n\nResponse: ${data.response}`);
      } else {
        alert(`❌ Chat test failed!\n\nError: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Chat test failed!\n\nError: ${error}`);
    } finally {
      setTestingTenant(null);
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
          <p className="text-white text-lg font-medium">Loading admin dashboard...</p>
          <p className="text-purple-200 text-sm mt-2">Initializing multi-tenant system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🏢 Multi-Tenant Admin Dashboard
              </h1>
              <p className="text-purple-200">
                Manage all tenants and their AI assistants
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                ✨ Create Tenant
              </Button>
              <Button
                onClick={loadTenants}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg font-medium backdrop-blur-sm transition-all duration-200"
              >
                🔄 Refresh
              </Button>
              <Button
                onClick={() => window.open('/voice-test', '_blank')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🎤 Voice Test Lab
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Tenants</p>
                <p className="text-3xl font-bold text-white">{tenants.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Active Tenants</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Trial Tenants</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.filter(t => t.status === 'trial').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Conversations</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.reduce((sum, t) => sum + t.usage.totalAllTime.conversations, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Healthy Menus</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.filter(t => getMenuStatus(t).status === 'healthy').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Need Attention</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.filter(t => ['no-menu', 'empty', 'stale'].includes(getMenuStatus(t).status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">No Menu Data</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.filter(t => getMenuStatus(t).status === 'no-menu').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Menu Items</p>
                <p className="text-3xl font-bold text-white">
                  {tenants.reduce((sum, t) => sum + (t.settings.scrapedMenuData?.menu?.length || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-white">All Tenants</h2>
            <p className="text-purple-200 text-sm mt-1">Manage your multi-tenant ecosystem</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Menu Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/10 transition-all duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {tenant.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white">
                            {tenant.name}
                          </div>
                          <div className="text-xs text-purple-300">
                            {tenant.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border border-purple-400/30 capitalize">
                        {tenant.industry}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPlanColor(tenant.subscription)}`}>
                        {tenant.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {(() => {
                        const menuStatus = getMenuStatus(tenant);
                        return (
                          <div className="group relative">
                            <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${menuStatus.color}`}>
                              <span className="mr-1">{menuStatus.icon}</span>
                              {menuStatus.label}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {menuStatus.description}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-white">
                      <div>
                        <div className="font-semibold">{tenant.usage.currentMonth.conversations} conversations</div>
                        <div className="text-purple-300 text-xs">{tenant.usage.currentMonth.uniqueUsers} users</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedTenant(tenant)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-1 rounded-lg border border-blue-400/30 transition-all duration-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => window.open(`/dashboard/${tenant.id}`, '_blank')}
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 px-3 py-1 rounded-lg border border-purple-400/30 transition-all duration-200"
                      >
                        📊 Dashboard
                      </button>
                      <button
                        onClick={() => testTenantChat(tenant.id)}
                        disabled={testingTenant === tenant.id}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 px-3 py-1 rounded-lg border border-green-400/30 transition-all duration-200 disabled:opacity-50"
                      >
                        {testingTenant === tenant.id ? '⏳' : '🧪'} Test
                      </button>
                      {(() => {
                        const menuStatus = getMenuStatus(tenant);
                        const needsAttention = ['no-menu', 'empty', 'stale'].includes(menuStatus.status);
                        return (
                          <button
                            onClick={() => window.open(`/menu-manager?tenant=${tenant.id}`, '_blank')}
                            className={`px-3 py-1 rounded-lg border transition-all duration-200 ${
                              needsAttention 
                                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 border-orange-400/30 animate-pulse'
                                : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 border-purple-400/30'
                            }`}
                          >
                            {needsAttention ? '⚠️' : '📋'} Menu
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border border-white/20 w-full max-w-4xl shadow-2xl rounded-2xl bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md">
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedTenant.name}</h3>
                <p className="text-purple-200 text-sm">Tenant Configuration Details</p>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-purple-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-semibold text-purple-200 mb-2">Tenant ID</label>
                  <p className="text-white font-mono text-sm bg-black/20 p-2 rounded">{selectedTenant.id}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-semibold text-purple-200 mb-2">Slug</label>
                  <p className="text-white font-mono text-sm bg-black/20 p-2 rounded">{selectedTenant.slug}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="block text-sm font-semibold text-purple-200 mb-3">System Prompt</label>
                <div className="text-sm text-white bg-black/20 p-4 rounded-lg max-h-40 overflow-y-auto leading-relaxed">
                  {selectedTenant.settings.systemPrompt}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-semibold text-purple-200 mb-2">AI Model</label>
                  <p className="text-white">{selectedTenant.settings.aiModel}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-semibold text-purple-200 mb-2">Voice Enabled</label>
                  <p className="text-white">
                    {selectedTenant.settings.voiceEnabled ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">📊</span>
                  Usage Statistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-purple-200 text-sm">Total Conversations</p>
                    <p className="text-2xl font-bold text-white">{selectedTenant.usage.totalAllTime.conversations.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-200 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{selectedTenant.usage.totalAllTime.uniqueUsers.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-200 text-sm">Voice Minutes</p>
                    <p className="text-2xl font-bold text-white">{selectedTenant.usage.totalAllTime.voiceMinutes.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border border-white/20 w-full max-w-2xl shadow-2xl rounded-2xl bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md">
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <div>
                <h3 className="text-2xl font-bold text-white">✨ Create New Tenant</h3>
                <p className="text-purple-200 text-sm">Set up a new AI assistant for your organization</p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-purple-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🚀</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">Demo Mode Active</h4>
                    <p className="text-purple-200 text-sm mb-4">
                      This is a demonstration form. In a full implementation, this would provide
                      comprehensive tenant configuration options including branding, AI settings,
                      subscription plans, and feature access controls.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <span className="text-xl">⚡</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">API Integration</h4>
                    <p className="text-purple-200 text-sm mb-3">
                      Use the programmatic API to create tenants with full configuration:
                    </p>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-green-300">
                      POST /api/tenants
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('🚀 In production, this would open the full tenant creation wizard!');
                    setShowCreateForm(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Create Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 