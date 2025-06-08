'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VoiceTest() {
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [speechSupport, setSpeechSupport] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = [];
    
    // Test 1: Check browser support
    const speechSupported = !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    setSpeechSupport(speechSupported);
    results.push({
      test: 'Speech Recognition Support',
      status: speechSupported ? 'pass' : 'fail',
      message: speechSupported ? 'Browser supports speech recognition' : 'Browser does not support speech recognition'
    });

    // Test 2: Check microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
      results.push({
        test: 'Microphone Permission',
        status: 'pass',
        message: 'Microphone access granted'
      });
    } catch (error) {
      setMicPermission(false);
      results.push({
        test: 'Microphone Permission',
        status: 'fail',
        message: `Microphone access denied: ${error}`
      });
    }

    // Test 3: Check HTTPS (required for speech recognition)
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    results.push({
      test: 'HTTPS/Localhost',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'Running on secure connection' : 'Speech recognition requires HTTPS or localhost'
    });

    setTestResults(results);
  };

  const testVoiceRecognition = () => {
    if (!speechSupport || !micPermission) return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setTranscript(`Error: ${event.error}`);
    };

    recognition.start();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎤 Voice System Diagnostics
        </h1>

        {/* Diagnostic Results */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">System Tests</h2>
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="text-white font-medium">{result.test}</div>
                  <div className="text-gray-300 text-sm">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Test */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Voice Recognition Test</h2>
          
          <div className="text-center space-y-6">
            <button
              onClick={testVoiceRecognition}
              disabled={!speechSupport || !micPermission || isListening}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : speechSupport && micPermission
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
            
            <div className="text-white">
              {isListening ? 'Listening... speak now!' : 'Click to test voice recognition'}
            </div>
            
            {transcript && (
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-purple-300 text-sm mb-2">Transcript:</div>
                <div className="text-white">{transcript}</div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/30 rounded-2xl p-6 border border-blue-500/50">
          <h3 className="text-blue-300 font-bold mb-4">🔧 Troubleshooting</h3>
          <ul className="text-blue-200 space-y-2 text-sm">
            <li>• Make sure you're using Chrome, Edge, or Safari</li>
            <li>• Allow microphone permissions when prompted</li>
            <li>• Ensure you're on HTTPS or localhost</li>
            <li>• Check that your microphone is working in other apps</li>
            <li>• Try refreshing the page if tests fail</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}