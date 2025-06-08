'use client';

import { useState } from 'react';

export default function TestElevenLabsAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBasicAPI = async () => {
    setLoading(true);
    setResult('Testing basic ElevenLabs API...');
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        setResult('❌ No API key found');
        return;
      }
      
      // Test basic voices endpoint
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Basic API works! Found ${data.voices?.length || 0} voices`);
      } else {
        setResult(`❌ Basic API failed: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testConversationalAI = async () => {
    setLoading(true);
    setResult('Testing Conversational AI API...');
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        setResult('❌ No API key found');
        return;
      }
      
      // Test conversation creation
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
      
      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        setResult(`✅ Conversational AI works! Conversation ID: ${data.conversation_id || 'unknown'}`);
      } else {
        setResult(`❌ Conversational AI failed: ${response.status} ${response.statusText}\nResponse: ${responseText}`);
      }
      
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🔍 ElevenLabs API Debug
        </h1>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">API Testing</h2>
              <p className="text-purple-200 mb-6">
                Let's test each API endpoint separately to find the issue
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={testBasicAPI}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg"
              >
                {loading ? '🔄 Testing...' : '🎯 Test Basic API'}
              </button>
              
              <button
                onClick={testConversationalAI}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg"
              >
                {loading ? '🔄 Testing...' : '🤖 Test Conversational AI'}
              </button>
            </div>
            
            <div className="bg-black/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">Test Results:</h3>
              <pre className="text-green-200 font-mono text-sm whitespace-pre-wrap">{result || 'Click a button to test...'}</pre>
            </div>
            
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-300 mb-3">Debug Info:</h3>
              <div className="text-blue-200 text-sm space-y-1">
                <p>• API Key: {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ Present' : '❌ Missing'}</p>
                <p>• Agent ID: agent_01jx6z1ve6fqzv43akcfesaebe</p>
                <p>• Environment: {process.env.NODE_ENV}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 