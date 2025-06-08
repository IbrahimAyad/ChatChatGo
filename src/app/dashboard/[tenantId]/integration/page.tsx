'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function APIIntegration() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [regenerating, setRegenerating] = useState(false);
  
  // This would come from your API
  const [integrationData, setIntegrationData] = useState({
    apiKey: 'ccg_live_abc123def456ghi789jkl012mno345pqr',
    webhookUrl: `https://chatchatgo.ai/api/webhook/${tenantId}`,
    businessData: {
      name: 'Royale with Cheese',
      id: tenantId
    }
  });

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerateApiKey = async () => {
    setRegenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIntegrationData(prev => ({
        ...prev,
        apiKey: `ccg_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      }));
      setRegenerating(false);
    }, 1500);
  };

  const embedScript = `<!-- ChatChatGo Voice AI Integration -->
<script src="https://cdn.chatchatgo.ai/voice-widget/v1.0.0/widget.js"></script>
<script>
  ChatChatGo.init({
    apiKey: '${integrationData.apiKey}',
    tenantId: '${tenantId}',
    mode: 'voice', // 'voice' or 'chat'
    position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    theme: 'auto', // 'light', 'dark', 'auto'
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Ask me anything...',
    voiceSettings: {
      autoStart: false,
      language: 'en-US'
    }
  });
</script>`;

  const reactIntegration = `import { ChatChatGoWidget } from '@chatchatgo/react-widget';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <ChatChatGoWidget
        apiKey="${integrationData.apiKey}"
        tenantId="${tenantId}"
        mode="voice"
        position="bottom-right"
        theme="auto"
        welcomeMessage="Hello! How can I help you today?"
        voiceSettings={{
          autoStart: false,
          language: 'en-US'
        }}
      />
    </div>
  );
}`;

  const apiExample = `// Direct API Integration
const response = await fetch('https://chatchatgo.ai/api/voice/conversation', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${integrationData.apiKey}',
    'Content-Type': 'application/json',
    'X-Tenant-ID': '${tenantId}'
  },
  body: JSON.stringify({
    message: 'Hello, I need help with my order',
    voice: true,
    context: {
      customerPhone: '+1234567890',
      previousOrders: []
    }
  })
});

const data = await response.json();
console.log('AI Response:', data.message);
console.log('Audio URL:', data.audioUrl);`;

  const webhookExample = `// Webhook Endpoint Setup (Node.js/Express)
app.post('/chatchatgo-webhook', (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'conversation.started':
      console.log('Customer started conversation:', data.sessionId);
      break;
      
    case 'conversation.ended':
      console.log('Conversation ended:', data.sessionId);
      // Log conversation metrics
      break;
      
    case 'order.detected':
      console.log('Order detected:', data.order);
      // Process the order in your system
      break;
      
    case 'customer.feedback':
      console.log('Customer feedback:', data.rating);
      break;
  }
  
  res.status(200).json({ received: true });
});`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API Integration</h1>
          <p className="text-blue-200">Integrate ChatChatGo Voice AI into your website or application</p>
        </div>

        {/* API Key Section */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">🔑 Your API Key</h2>
            <button
              onClick={regenerateApiKey}
              disabled={regenerating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg flex items-center space-x-2"
            >
              {regenerating ? (
                <>
                  <span className="animate-spin">🔄</span>
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Regenerate</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 font-mono text-green-400 relative">
            <code>{integrationData.apiKey}</code>
            <button
              onClick={() => copyToClipboard(integrationData.apiKey, 'apiKey')}
              className="absolute right-2 top-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              {copied.apiKey ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-400">
            ⚠️ Keep this key secure! It provides access to your ChatChatGo integration.
          </div>
        </div>

        {/* Integration Methods */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Website Embed */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🌐</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Website Embed</h3>
                <p className="text-gray-400 text-sm">Add voice AI to any website with a simple script</p>
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{embedScript}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(embedScript, 'embed')}
                className="absolute right-2 top-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                {copied.embed ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-blue-200">
              💡 Paste this code before the closing &lt;/body&gt; tag of your website
            </div>
          </div>

          {/* React Component */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚛️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">React Integration</h3>
                <p className="text-gray-400 text-sm">Use our React component for modern apps</p>
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{reactIntegration}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(reactIntegration, 'react')}
                className="absolute right-2 top-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                {copied.react ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-cyan-200">
              📦 Install: <code className="bg-gray-700 px-2 py-1 rounded">npm install @chatchatgo/react-widget</code>
            </div>
          </div>

          {/* Direct API */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔗</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Direct API Integration</h3>
                <p className="text-gray-400 text-sm">Custom integration with our REST API</p>
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{apiExample}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(apiExample, 'api')}
                className="absolute right-2 top-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                {copied.api ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-green-200">
              📚 <a href="https://docs.chatchatgo.ai/api" target="_blank" className="text-blue-400 hover:underline">View Full API Documentation</a>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🪝</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Webhook Integration</h3>
                <p className="text-gray-400 text-sm">Receive real-time events from conversations</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Webhook URL</label>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 font-mono text-blue-400 relative">
                <code>{integrationData.webhookUrl}</code>
                <button
                  onClick={() => copyToClipboard(integrationData.webhookUrl, 'webhook')}
                  className="absolute right-2 top-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  {copied.webhook ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{webhookExample}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(webhookExample, 'webhookCode')}
                className="absolute right-2 top-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                {copied.webhookCode ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-4">🚀 Quick Start Guide</h2>
          <div className="grid md:grid-cols-3 gap-6 text-blue-100">
            <div>
              <h3 className="font-medium text-blue-200 mb-2">1. 📋 Copy Integration Code</h3>
              <p className="text-sm">Choose your preferred integration method above and copy the code snippet.</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-200 mb-2">2. 🔧 Customize Settings</h3>
              <p className="text-sm">Modify the configuration options like theme, position, and welcome message.</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-200 mb-2">3. 🚀 Deploy & Test</h3>
              <p className="text-sm">Add the code to your website and test the voice AI functionality.</p>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">2,847</div>
            <div className="text-sm text-gray-400">API Calls Today</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">98.7%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">142ms</div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">5.2k</div>
            <div className="text-sm text-gray-400">Monthly Users</div>
          </div>
        </div>
      </div>
    </div>
  );
} 