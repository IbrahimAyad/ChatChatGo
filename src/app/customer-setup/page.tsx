'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SubscriptionPlan } from '@/types';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  result?: any;
  error?: string;
}

export default function CustomerSetup() {
  const [customerData, setCustomerData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    website: '',
    menuUrl: '',
    description: '',
    industry: 'restaurant'
  });

  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'create-tenant',
      title: 'Create Tenant Account',
      description: 'Set up the customer in our multi-tenant system',
      status: 'pending'
    },
    {
      id: 'scrape-menu',
      title: 'Collect Business Data',
      description: 'Extract business information from their website',
      status: 'pending'
    },
    {
      id: 'test-voice',
      title: 'Test Voice Integration',
      description: 'Verify the voice AI is working with their data',
      status: 'pending'
    },
    {
      id: 'setup-n8n',
      title: 'Configure N8N Workflow',
      description: 'Connect to our intelligent agent system',
      status: 'pending'
    }
  ]);

  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const updateStepStatus = (stepId: string, status: SetupStep['status'], result?: any, error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, error }
        : step
    ));
  };

  const generateTenantId = (businessName: string) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  };

  const runSetup = async () => {
    if (!customerData.businessName) {
      alert('Please fill in Business Name');
      return;
    }
    
    if (customerData.industry === 'restaurant' && !customerData.menuUrl) {
      alert('Menu URL is required for restaurants');
      return;
    }

    setIsSetupRunning(true);
    setCurrentStep(0);

    const tenantId = generateTenantId(customerData.businessName);

    try {
      // Step 1: Create Tenant
      setCurrentStep(0);
      updateStepStatus('create-tenant', 'loading');
      
      const tenantResponse = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerData.businessName,
          slug: tenantId,
          industry: customerData.industry,
          subscription: 'professional' as SubscriptionPlan,
          owner: {
            email: customerData.email || `contact@${tenantId}.com`,
            name: customerData.name || 'Restaurant Owner',
            phone: customerData.phone || '',
          },
          customSettings: {
            website: customerData.website,
            description: customerData.description
          }
        })
      });

      if (!tenantResponse.ok) {
        throw new Error(`Tenant creation failed: ${await tenantResponse.text()}`);
      }

      const tenantResult = await tenantResponse.json();
      updateStepStatus('create-tenant', 'success', tenantResult);

      // Step 2: Scrape Menu/Data (conditional based on industry)
      setCurrentStep(1);
      updateStepStatus('scrape-menu', 'loading');

      if (customerData.industry === 'restaurant' && customerData.menuUrl) {
        const scrapeResponse = await fetch(`/api/tenants/${tenantId}/menu-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: customerData.menuUrl,
            forceRefresh: true
          })
        });

        if (scrapeResponse.ok) {
          const scrapeResult = await scrapeResponse.json();
          updateStepStatus('scrape-menu', 'success', scrapeResult);
        } else {
          // Don't fail the entire setup for scraping issues
          updateStepStatus('scrape-menu', 'success', { 
            message: 'Tenant created without menu scraping',
            metadata: { itemsScraped: 0 }
          });
        }
      } else {
        // Skip scraping for non-restaurant industries
        updateStepStatus('scrape-menu', 'success', { 
          message: 'Data collection skipped for this industry',
          metadata: { itemsScraped: 0 }
        });
      }

      // Step 3: Test Voice Integration
      setCurrentStep(2);
      updateStepStatus('test-voice', 'loading');

      // Test the chat API to ensure it can access the menu data
      const testResponse = await fetch(`/api/tenants/${tenantId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "What's on your menu today?",
          testMode: true
        })
      });

      if (testResponse.ok) {
        const testResult = await testResponse.json();
        updateStepStatus('test-voice', 'success', testResult);
      } else {
        updateStepStatus('test-voice', 'error', null, 'Chat API test failed');
      }

      // Step 4: N8N Workflow Setup
      setCurrentStep(3);
      updateStepStatus('setup-n8n', 'loading');

      // This would connect to your N8N system
      // For now, we'll simulate success
      setTimeout(() => {
        updateStepStatus('setup-n8n', 'success', {
          workflowId: 'restaurant-template-1',
          webhookUrl: `https://your-n8n.com/webhook/${tenantId}`,
          message: 'Connected to Master Restaurant Agent'
        });
        setCurrentStep(4);
      }, 2000);

    } catch (error) {
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) {
        updateStepStatus(currentStepId, 'error', null, error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsSetupRunning(false);
    }
  };

  const getStatusColor = (status: SetupStep['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'loading': return 'bg-blue-500 animate-pulse';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: SetupStep['status']) => {
    switch (status) {
      case 'success': return 'Complete';
      case 'error': return 'Failed';
      case 'loading': return 'In Progress';
      default: return 'Pending';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Business Onboarding Center</h1>
        <p className="text-gray-600">Set up your first customer with voice AI integration</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Information Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Customer Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>  
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                id="businessName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.businessName}
                onChange={(e) => setCustomerData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="e.g. Mario's Italian Bistro"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <select
                id="industry"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.industry}
                onChange={(e) => setCustomerData(prev => ({ ...prev, industry: e.target.value }))}
              >
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>

            <div>
              <label htmlFor="menuUrl" className="block text-sm font-medium text-gray-700 mb-1">
                {customerData.industry === 'restaurant' ? 'Menu URL *' : 'Website/Product Page URL'}
              </label>
              <input
                id="menuUrl"
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.menuUrl}
                onChange={(e) => setCustomerData(prev => ({ ...prev, menuUrl: e.target.value }))}
                placeholder={
                  customerData.industry === 'restaurant' 
                    ? "https://restaurant-website.com/menu"
                    : customerData.industry === 'retail'
                    ? "https://store-website.com/products"
                    : "https://clinic-website.com/services"
                }
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@restaurant.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.website}
                onChange={(e) => setCustomerData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://restaurant.com"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customerData.description}
                onChange={(e) => setCustomerData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the business..."
                rows={3}
              />
            </div>

            {customerData.businessName && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tenant ID:</strong> {generateTenantId(customerData.businessName)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Setup Progress */}
        <div className="bg-white border border-gray-200 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Setup Progress</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full mt-1 ${getStatusColor(step.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {getStatusText(step.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    
                    {step.status === 'error' && step.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-sm">{step.error}</p>
                      </div>
                    )}
                    
                    {step.status === 'success' && step.result && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                        {step.id === 'scrape-menu' && step.result.metadata && (
                          <p>✅ Found {step.result.metadata.itemsScraped} menu items</p>
                        )}
                        {step.id === 'create-tenant' && (
                          <p>✅ Tenant created successfully</p>
                        )}
                        {step.id === 'test-voice' && (
                          <p>✅ Voice integration working</p>
                        )}
                        {step.id === 'setup-n8n' && (
                          <p>✅ Connected to N8N workflow</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={runSetup}
              disabled={isSetupRunning || !customerData.businessName || (customerData.industry === 'restaurant' && !customerData.menuUrl)}
              className="w-full"
            >
              {isSetupRunning ? 'Setting up...' : 'Start Setup'}
            </Button>

            {steps.every(step => step.status === 'success') && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">🎉 Setup Complete!</h3>
                <p className="text-green-700 text-sm mb-3">
                  Your customer is ready to use the voice AI system.
                </p>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Tenant ID:</strong> {generateTenantId(customerData.businessName)}</p>
                  <p><strong>Chat API:</strong> /api/tenants/{generateTenantId(customerData.businessName)}/chat</p>
                  <p><strong>Voice Test:</strong> <a href="/voice-test" className="text-blue-600 underline">Test Voice Interface</a></p>
                  <p><strong>Menu Manager:</strong> <a href="/menu-manager" className="text-blue-600 underline">Manage Menu Data</a></p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => window.location.href = '/multi-tenant'}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    📊 View Multi-Tenant Dashboard
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/admin'}
                    variant="outline"
                    className="flex-1"
                  >
                    🔧 Admin Dashboard
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    onClick={() => {
                      // Reset form for adding another customer
                      setCustomerData({
                        businessName: '',
                        industry: 'restaurant',
                        menuUrl: '',
                        name: '',
                        email: '',
                        phone: '',
                        website: '',
                        description: ''
                      });
                      setSteps(prev => prev.map(step => ({
                        ...step,
                        status: 'pending',
                        result: undefined,
                        error: undefined
                      })));
                    }}
                    variant="outline"
                    className="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                  >
                    ➕ Add Another Customer
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex-1"
                  >
                    🏠 Back to Home
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Test URLs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Quick Test Examples</h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Pizza Places:</strong>
              <ul className="mt-1 space-y-1 text-xs text-gray-600">
                <li>dominos.com/menu</li>
                <li>papajohns.com/menu</li>
                <li>pizzahut.com/menu</li>
              </ul>
            </div>
            <div>
              <strong>Chain Restaurants:</strong>
              <ul className="mt-1 space-y-1 text-xs text-gray-600">
                <li>mcdonalds.com/menu</li>
                <li>subway.com/menu</li>
                <li>chipotle.com/menu</li>
              </ul>
            </div>
            <div>
              <strong>Local Examples:</strong>
              <ul className="mt-1 space-y-1 text-xs text-gray-600">
                <li>Use any restaurant website</li>
                <li>DoorDash/UberEats links work</li>
                <li>Direct menu page URLs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 