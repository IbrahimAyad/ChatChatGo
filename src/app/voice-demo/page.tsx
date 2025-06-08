'use client';

import { useState, useEffect } from 'react';
import { VoiceChatWidget } from '@/components/widget/VoiceChatWidget';
import { Button } from '@/components/ui/Button';

export default function VoiceDemo() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Check voice API status on load
    checkVoiceServices();
  }, []);

  const checkVoiceServices = async () => {
    try {
      const response = await fetch('/api/voice/test');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      console.error('Failed to check voice services:', error);
      setApiStatus({ status: 'error', message: 'Failed to connect to voice services' });
    }
  };

  const testVoice = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Hello! Welcome to ChatChatGo's voice-first AI assistant demo. I'm powered by ElevenLabs voice synthesis and OpenAI Whisper speech recognition.",
          voice_settings: {
            voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
        
        const source = audioContext.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(audioContext.destination);
        source.start();
        
        alert('Voice test successful! 🎉');
      } else {
        throw new Error('Voice test failed');
      }
    } catch (error) {
      console.error('Voice test error:', error);
      alert('Voice test failed. Check console for details.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              🎤 Voice-First AI Demo
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Experience the future of conversational AI with real-time speech recognition 
              and natural voice synthesis
            </p>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 API Status</h2>
          
          {apiStatus ? (
            <div className={`p-4 rounded-lg ${
              apiStatus.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium ${
                apiStatus.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {apiStatus.status === 'success' ? '✅ ' : '❌ '}
                {apiStatus.message}
              </div>
              
              {apiStatus.services && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <strong>OpenAI Whisper:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      apiStatus.services.openai_whisper === 'configured' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiStatus.services.openai_whisper}
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>ElevenLabs:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      apiStatus.services.elevenlabs === 'configured' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiStatus.services.elevenlabs}
                    </span>
                  </div>
                </div>
              )}

              {apiStatus.elevenlabs_voices && (
                <div className="mt-3 text-sm text-gray-600">
                  <strong>Available Voices:</strong> {apiStatus.elevenlabs_voices} voices loaded
                </div>
              )}
            </div>
          ) : (
            <div className="animate-pulse bg-gray-100 h-20 rounded"></div>
          )}

          <div className="mt-4 flex gap-4">
            <Button 
              onClick={checkVoiceServices}
              variant="outline" 
              size="sm"
            >
              🔄 Refresh Status
            </Button>
            <Button 
              onClick={testVoice}
              isLoading={testing}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              🔊 Test Voice Synthesis
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎤 Speech Recognition
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                OpenAI Whisper integration
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Real-time transcription
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Restaurant context optimization
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                High accuracy & low latency
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🔊 Voice Synthesis
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                ElevenLabs AI voices
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Natural speech patterns
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Configurable voice settings
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                23+ premium voices available
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Try the Voice Assistant
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            The voice chat widget is embedded below. You can speak naturally or type messages.
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-6 max-w-md mx-auto border">
            <h4 className="font-semibold text-gray-900 mb-3">Sample Voice Commands:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div>💬 "What's on your menu today?"</div>
              <div>💬 "Do you have vegetarian options?"</div>
              <div>💬 "I'd like to make a reservation"</div>
              <div>💬 "What are your business hours?"</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="font-semibold text-purple-800">🎤 Step 1</div>
              <div className="text-purple-700">Click the microphone button</div>
            </div>
            <div className="bg-pink-100 rounded-lg p-4">
              <div className="font-semibold text-pink-800">🗣️ Step 2</div>
              <div className="text-pink-700">Speak your question naturally</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="font-semibold text-blue-800">🔊 Step 3</div>
              <div className="text-blue-700">Listen to the AI response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Voice Chat Widget */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <h3 className="text-xl font-bold text-white text-center">
              🎤 Mario's Voice Restaurant Assistant
            </h3>
          </div>
          <VoiceChatWidget embedded={true} className="h-[500px]" />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Powered by <span className="text-purple-400">OpenAI GPT-3.5 Turbo</span> • 
            <span className="text-pink-400 ml-1">OpenAI Whisper</span> • 
            <span className="text-blue-400 ml-1">ElevenLabs AI</span>
          </p>
        </div>
      </div>
    </div>
  );
} 