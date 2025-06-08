// ElevenLabs Text-to-Speech Integration
// Provides natural, human-like voices for the restaurant voice assistant

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
}

// Popular ElevenLabs voices for restaurant assistants
export const RESTAURANT_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional female
    name: "Rachel",
    category: "professional",
    description: "Professional, warm female voice - perfect for customer service"
  },
  {
    voice_id: "AZnzlk1XvdvUeBnXmlld", // Domi - Confident female
    name: "Domi", 
    category: "confident",
    description: "Confident, friendly female voice - great for recommendations"
  },
  {
    voice_id: "EXAVITQu4vr4xnSDxMaL", // Bella - Young female
    name: "Bella",
    category: "friendly", 
    description: "Young, energetic female voice - perfect for casual dining"
  },
  {
    voice_id: "ErXwobaYiN019PkySvjV", // Antoni - Warm male
    name: "Antoni",
    category: "warm",
    description: "Warm, welcoming male voice - ideal for fine dining"
  },
  {
    voice_id: "VR6AewLTigWG4xSOukaG", // Josh - Deep male
    name: "Josh", 
    category: "authoritative",
    description: "Deep, authoritative male voice - great for announcements"
  }
];

interface TTSOptions {
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

// Get API key with fallback
function getApiKey(): string {
  return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
         process.env.ELEVENLABS_API_KEY || 
         '';
}

// Main TTS function using direct API calls
export async function elevenLabsTTS(text: string, voiceId: string = 'EXAVITQu4vr4xnSDxMaL') {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found');
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error);
    throw error;
  }
}

// Get voice for restaurant context
export function getRestaurantVoice(sentiment?: string) {
  const voices = {
    default: 'EXAVITQu4vr4xnSDxMaL', // Bella
    friendly: 'EXAVITQu4vr4xnSDxMaL', // Bella
    professional: '21m00Tcm4TlvDq8ikWAM', // Rachel
    warm: 'ErXwobaYiN019PkySvjV', // Antoni
  };

  return voices[sentiment as keyof typeof voices] || voices.default;
}

// Voice sentiment mapping
function getVoiceForSentiment(sentiment: 'positive' | 'neutral' | 'urgent'): string {
  const sentimentVoices = {
    positive: 'EXAVITQu4vr4xnSDxMaL', // Bella - energetic
    neutral: '21m00Tcm4TlvDq8ikWAM',   // Rachel - professional  
    urgent: 'VR6AewLTigWG4xSOukaG'     // Josh - authoritative
  };
  
  return sentimentVoices[sentiment];
}

// ElevenLabs Conversational AI Integration
class ElevenLabsConversationalAI {
  private agentId: string;
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;
  private apiKey: string;
  private messageHandler: ((data: any) => void) | null = null;

  constructor(agentId: string = 'default-agent') {
    this.agentId = agentId;
    this.apiKey = getApiKey();
    if (!this.apiKey) {
      console.warn('⚠️ ElevenLabs API key not found for conversational AI');
    }
  }

  // Start a conversation session
  async startConversation(): Promise<boolean> {
    if (!this.apiKey) {
      console.error('❌ ElevenLabs API key missing');
      return false;
    }

    try {
      console.log('🤖 Starting ElevenLabs conversation...');
      
      // For now, just return true for basic TTS functionality
      // Real conversational AI requires specific agent setup
      this.isConnected = true;
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start conversation:', error);
      return false;
    }
  }

  // Send text message to the conversation
  async sendMessage(text: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Conversation not active');
    }

    try {
      // Use basic TTS for now
      const audioData = await elevenLabsTTS(text, getRestaurantVoice('professional'));
      
      // Play the audio
      if (typeof window !== 'undefined' && audioData) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedAudio = await audioContext.decodeAudioData(audioData);
        
        const source = audioContext.createBufferSource();
        source.buffer = decodedAudio;
        source.connect(audioContext.destination);
        source.start();
      }

      // Trigger message handler
      if (this.messageHandler) {
        this.messageHandler({
          type: 'transcript',
          content: text,
          timestamp: new Date()
        });
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Send audio data to the conversation (placeholder for now)
  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.websocket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    // For now, just log - would need speech-to-text integration
    console.log('Audio data received:', audioData.byteLength, 'bytes');
  }

  // Set up message handler for receiving responses
  onMessage(callback: (data: any) => void): void {
    this.messageHandler = callback;
  }

  // End conversation
  async endConversation(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    console.log('🔌 Conversation ended');
  }

  // Check if conversation is active
  isConversationActive(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const elevenLabsConversation = new ElevenLabsConversationalAI();

// Export all functionality
export { elevenLabsConversation, getVoiceForSentiment }; 