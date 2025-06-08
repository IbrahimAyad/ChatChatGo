'use client';

import { useState } from 'react';

export default function TestVoice() {
  const [status, setStatus] = useState('Ready to test');
  const [isLoading, setIsLoading] = useState(false);

  const testElevenLabs = async () => {
    setIsLoading(true);
    setStatus('Testing ElevenLabs...');
    
    try {
      // Import the ElevenLabs module
      setStatus('Importing ElevenLabs module...');
      const { elevenLabsTTS, getRestaurantVoice } = await import('../../lib/elevenlabs');
      
      setStatus('Testing API connection...');
      const isConnected = await elevenLabsTTS.testConnection();
      
      if (!isConnected) {
        setStatus('❌ ElevenLabs API connection failed');
        return;
      }
      
      setStatus('✅ Connected! Generating speech...');
      const testText = "Hello! This is a test of ElevenLabs natural voice.";
      const voiceId = getRestaurantVoice('professional');
      
      const success = await elevenLabsTTS.speak(testText, voiceId);
      
      if (success) {
        setStatus('✅ ElevenLabs speech test completed successfully!');
      } else {
        setStatus('⚠️ ElevenLabs speech failed, used browser fallback');
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setStatus(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBrowserTTS = async () => {
    setIsLoading(true);
    setStatus('Testing browser TTS...');
    
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("This is the robotic browser voice for comparison.");
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          setStatus('✅ Browser TTS completed (this is the robotic voice)');
          setIsLoading(false);
        };
        
        utterance.onerror = () => {
          setStatus('❌ Browser TTS failed');
          setIsLoading(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setStatus('❌ Browser does not support speech synthesis');
        setIsLoading(false);
      }
    } catch (error) {
      setStatus(`❌ Browser TTS error: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎤 Voice Test Laboratory
        </h1>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Voice Quality Comparison</h2>
              <p className="text-purple-200 mb-6">
                Test both ElevenLabs (natural) and browser TTS (robotic) to hear the difference
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={testElevenLabs}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg"
              >
                {isLoading ? '🔄 Testing...' : '🎯 Test ElevenLabs (Natural)'}
              </button>
              
              <button
                onClick={testBrowserTTS}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg"
              >
                {isLoading ? '🔄 Testing...' : '🤖 Test Browser TTS (Robotic)'}
              </button>
            </div>
            
            <div className="bg-black/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">Test Status:</h3>
              <p className="text-purple-200 font-mono">{status}</p>
            </div>
            
            <div className="bg-blue-900/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-3">Environment Info:</h3>
              <div className="text-blue-200 text-sm space-y-1">
                <p>• API Key: {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ Set' : '❌ Missing'}</p>
                <p>• Browser TTS: {typeof window !== 'undefined' && 'speechSynthesis' in window ? '✅ Supported' : '❌ Not supported'}</p>
                <p>• HTTPS: {typeof window !== 'undefined' && window.location.protocol === 'https:' ? '✅ Secure' : '⚠️ HTTP (may affect some features)'}</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-purple-200 text-sm">
                💡 <strong>Expected:</strong> ElevenLabs should sound natural and human-like, 
                while browser TTS will sound robotic and mechanical.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 