'use client';

import { useState } from 'react';

export default function TestElevenLabsQuick() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testWithoutWebhook = async () => {
    setLoading(true);
    setResult('Testing ElevenLabs Conversational AI without webhooks...');
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        setResult('❌ No API key found');
        return;
      }
      
      // Test creating a conversation session directly
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: 'agent_01jx6z1ve6fqzv43akcfesaebe',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Conversation started! ID: ${data.conversation_id}`);
      } else {
        const errorText = await response.text();
        setResult(`❌ Conversation failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 ElevenLabs Quick Test
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Test Without Webhooks</h2>
          <p className="text-gray-300 mb-4">
            This tests the ElevenLabs Conversational AI API directly without requiring HTTPS webhooks.
          </p>
          
          <button
            onClick={testWithoutWebhook}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🚀 Test Conversation API'}
          </button>
        </div>

        {result && (
          <div className="bg-black/20 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Result:</h3>
            <pre className="text-green-400 whitespace-pre-wrap font-mono text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">💡 About This Test</h3>
          <p className="text-yellow-300 text-sm">
            This bypasses the webhook requirement and tests the core ElevenLabs API directly. 
            If this works, your API key and access are correct.
          </p>
        </div>
      </div>
    </div>
  );
} 