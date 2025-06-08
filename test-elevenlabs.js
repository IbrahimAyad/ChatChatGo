// ElevenLabs Voice Test Script
// Test the ElevenLabs API connection and voice quality

const ELEVENLABS_API_KEY = 'sk_c160ddbc9c876738442298422185c2b1ec9cb1c31946bfbd';
const BASE_URL = 'https://api.elevenlabs.io/v1';

// Rachel's voice ID (professional female voice)
const RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

async function testElevenLabsConnection() {
  console.log('🧪 Testing ElevenLabs API Connection...\n');

  try {
    // Test 1: Check API connection
    console.log('1. Testing API Connection...');
    const response = await fetch(`${BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const voicesData = await response.json();
    console.log(`✅ Connected successfully! Found ${voicesData.voices.length} voices available`);

    // Test 2: Generate a short sample
    console.log('\n2. Testing Voice Generation...');
    const testText = "Hello! Welcome to Mario's Italian Restaurant. How can I help you today?";
    
    const ttsResponse = await fetch(`${BASE_URL}/text-to-speech/${RACHEL_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`TTS Error: ${ttsResponse.status} - ${errorText}`);
    }

    const audioSize = parseInt(ttsResponse.headers.get('content-length') || '0');
    console.log(`✅ Voice generated successfully! Audio size: ${(audioSize / 1024).toFixed(1)}KB`);

    // Test 3: Check quota/limits
    console.log('\n3. Checking Account Status...');
    const quotaResponse = await fetch(`${BASE_URL}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (quotaResponse.ok) {
      const userData = await quotaResponse.json();
      console.log(`✅ Account Status: ${userData.subscription?.tier || 'Free'} plan`);
      if (userData.subscription?.character_count !== undefined) {
        console.log(`   Characters used: ${userData.subscription.character_count}/${userData.subscription.character_limit}`);
      }
    }

    console.log('\n🎉 All tests passed! ElevenLabs is ready for natural voice responses.');
    console.log('\n🎤 Available Restaurant Voices:');
    console.log('   • Rachel (Professional) - Warm, professional female voice');
    console.log('   • Bella (Friendly) - Young, energetic female voice');
    console.log('   • Antoni (Warm) - Welcoming male voice for fine dining');
    console.log('   • Josh (Authoritative) - Deep male voice for announcements');

  } catch (error) {
    console.error('❌ ElevenLabs test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your API key is valid');
    console.log('   2. Ensure you have quota remaining');
    console.log('   3. Check your internet connection');
  }
}

// Run the test
testElevenLabsConnection(); 