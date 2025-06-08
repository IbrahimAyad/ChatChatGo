#!/usr/bin/env node

/**
 * 🎤 Voice Intelligence & N8N Setup Script
 * 
 * This script sets up:
 * 1. Voice microphone functionality with proper permissions
 * 2. N8N workflow integration for restaurant intelligence
 * 3. Environment configuration
 * 4. Testing and validation
 */

const fs = require('fs');
const path = require('path');

console.log('🎤 ChatChatGo Voice Intelligence & N8N Setup');
console.log('='.repeat(50));

// Environment configuration
const ENV_CONFIG = {
  // N8N Configuration
  N8N_BASE_URL: 'http://localhost:5678',
  N8N_API_KEY: 'your-n8n-api-key-here',
  
  // OpenAI Configuration (for voice processing)
  OPENAI_API_KEY: 'your-openai-api-key-here',
  
  // ElevenLabs Configuration (for text-to-speech)
  ELEVENLABS_API_KEY: 'your-elevenlabs-api-key-here',
  
  // Application Configuration
  NEXT_PUBLIC_APP_URL: 'http://localhost:3006',
  NODE_ENV: 'development'
};

// Create .env.local file
function createEnvironmentFile() {
  console.log('📝 Creating environment configuration...');
  
  const envContent = Object.entries(ENV_CONFIG)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Creating backup...');
    fs.copyFileSync(envPath, `${envPath}.backup.${Date.now()}`);
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created at .env.local');
  console.log('📋 Please update the API keys with your actual values');
}

// Fix microphone permissions and voice functionality
function fixVoiceComponent() {
  console.log('🎤 Fixing voice component...');
  
  const voiceComponentPath = path.join(process.cwd(), 'src/components/VoiceAssistant.tsx');
  
  if (!fs.existsSync(voiceComponentPath)) {
    console.log('❌ VoiceAssistant.tsx not found');
    return;
  }
  
  // Read current content
  let content = fs.readFileSync(voiceComponentPath, 'utf8');
  
  // Fix microphone permission check
  const oldPermissionCheck = `  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
    } catch (error) {
      setMicPermission(false);
    }
  };`;
  
  const newPermissionCheck = `  const checkMicrophonePermission = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported');
        setMicPermission(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      console.log('🎤 Microphone permission granted');
      stream.getTracks().forEach(track => {
        console.log('Audio track:', track.label, track.kind, track.enabled);
        track.stop();
      });
      setMicPermission(true);
    } catch (error) {
      console.error('🚫 Microphone permission error:', error);
      setMicPermission(false);
    }
  };`;
  
  // Replace the permission check
  if (content.includes(oldPermissionCheck)) {
    content = content.replace(oldPermissionCheck, newPermissionCheck);
    console.log('✅ Updated microphone permission check');
  }
  
  // Add better error handling for speech recognition
  const oldSpeechInit = `  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };`;
  
  const newSpeechInit = `  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('🚫 Speech recognition not supported in this browser');
      console.log('💡 Try using Chrome, Edge, or Safari for voice features');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        console.log('🗣️ Transcript:', transcript);
        setTranscript(transcript);
        processVoiceCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🚫 Speech recognition error:', event.error);
      let errorMessage = 'Speech recognition failed';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
      }
      
      setResponse(errorMessage);
      setIsListening(false);
    };

    recognition.onnomatch = () => {
      console.warn('🤔 Speech not recognized');
      setResponse('I didn\\'t understand that. Please try again.');
    };

    recognitionRef.current = recognition;
  };`;
  
  if (content.includes(oldSpeechInit)) {
    content = content.replace(oldSpeechInit, newSpeechInit);
    console.log('✅ Enhanced speech recognition initialization');
  }
  
  // Write the updated content
  fs.writeFileSync(voiceComponentPath, content);
  console.log('✅ Voice component updated with better error handling');
}

// Create N8N test workflow
function createN8NTestWorkflow() {
  console.log('🔄 Creating N8N test workflow...');
  
  const workflowConfig = {
    name: 'ChatChatGo Restaurant Test Workflow',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'restaurant-test',
          responseMode: 'responseNode'
        },
        id: 'webhook-trigger',
        name: 'Restaurant Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [240, 300]
      },
      {
        parameters: {
          jsCode: `
// Restaurant AI Response Generator
const message = $input.first().json.message || '';
const lowerMessage = message.toLowerCase();

let response = '';
let orderDetected = false;
let items = [];

// Menu intelligence
if (lowerMessage.includes('menu') || lowerMessage.includes('food')) {
  response = "🍽️ Our trending items today: Truffle Burger ($28), Caesar Salad ($16), Pasta Carbonara ($22). The Truffle Burger is going viral on TikTok with 2.3K views!";
}
// Social media insights
else if (lowerMessage.includes('social') || lowerMessage.includes('viral')) {
  response = "📱 Social Media Pulse: 147 mentions today with 78% positive sentiment. Virality index: 85/100. #TruffleBurger is trending!";
}
// Revenue analytics
else if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
  response = "💰 Today's revenue: $15,420 with avg order value $28.50. We're 15% above yesterday's performance!";
}
// Order detection
else if (lowerMessage.includes('order') || lowerMessage.includes('want') || lowerMessage.includes('get')) {
  response = "🛒 I'd be happy to help with your order! Our Truffle Burger is trending and highly recommended. Would you like to add it to your order?";
  orderDetected = true;
  items = [{ name: 'Truffle Burger', price: 28, trending: true }];
}
// Default response
else {
  response = \`I heard: "\${message}". I'm your restaurant AI assistant! I can help with menu info, social media insights, sales analytics, and taking orders. What would you like to know?\`;
}

return {
  response,
  orderDetected,
  items,
  timestamp: new Date().toISOString(),
  processed: true
};
          `
        },
        id: 'ai-processor',
        name: 'Restaurant AI Processor',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [460, 300]
      },
      {
        parameters: {
          responseBody: '={{ JSON.stringify($json) }}',
          options: {
            responseHeaders: {
              'Content-Type': 'application/json'
            }
          }
        },
        id: 'webhook-response',
        name: 'Send Response',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [680, 300]
      }
    ],
    connections: {
      'Restaurant Webhook': {
        main: [[{ node: 'Restaurant AI Processor', type: 'main', index: 0 }]]
      },
      'Restaurant AI Processor': {
        main: [[{ node: 'Send Response', type: 'main', index: 0 }]]
      }
    }
  };
  
  const workflowPath = path.join(process.cwd(), 'n8n-restaurant-workflow.json');
  fs.writeFileSync(workflowPath, JSON.stringify(workflowConfig, null, 2));
  console.log('✅ N8N test workflow created at n8n-restaurant-workflow.json');
}

// Create voice test page
function createVoiceTestPage() {
  console.log('🧪 Creating voice test page...');
  
  const testPageContent = `'use client';

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
        message: \`Microphone access denied: \${error}\`
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
      setTranscript(\`Error: \${event.error}\`);
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
              className={\`w-32 h-32 rounded-full flex items-center justify-center transition-all \${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : speechSupport && micPermission
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-500 cursor-not-allowed'
              }\`}
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
}`;

  const testPageDir = path.join(process.cwd(), 'src/app/voice-test');
  if (!fs.existsSync(testPageDir)) {
    fs.mkdirSync(testPageDir, { recursive: true });
  }
  
  const testPagePath = path.join(testPageDir, 'page.tsx');
  fs.writeFileSync(testPagePath, testPageContent);
  console.log('✅ Voice test page created at /voice-test');
}

// Main setup function
async function main() {
  try {
    console.log('🚀 Starting setup...\n');
    
    // Step 1: Create environment file
    createEnvironmentFile();
    console.log('');
    
    // Step 2: Fix voice component
    fixVoiceComponent();
    console.log('');
    
    // Step 3: Create N8N test workflow
    createN8NTestWorkflow();
    console.log('');
    
    // Step 4: Create voice test page
    createVoiceTestPage();
    console.log('');
    
    console.log('✅ Setup completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Update .env.local with your actual API keys');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Test voice functionality at: http://localhost:3006/voice-intelligence');
    console.log('4. Test restaurant intelligence at: http://localhost:3006/restaurant-intelligence');
    console.log('');
    console.log('🎤 Voice Features Available:');
    console.log('• Real-time speech recognition');
    console.log('• Restaurant intelligence commands');
    console.log('• Text-to-speech responses');
    console.log('• N8N workflow integration');
    console.log('');
    console.log('🔧 Voice Commands to Try:');
    console.log('• "Show me menu analytics"');
    console.log('• "What\'s trending on social media?"');
    console.log('• "How are sales today?"');
    console.log('• "Weather impact on orders"');
    console.log('• "Recommend popular items"');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('• Use Chrome, Edge, or Safari for best voice support');
    console.log('• Allow microphone permissions when prompted');
    console.log('• Ensure HTTPS or localhost for speech recognition');
    console.log('• Check browser console for detailed error messages');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main(); 