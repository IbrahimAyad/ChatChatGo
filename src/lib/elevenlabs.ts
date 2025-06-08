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

export class ElevenLabsTTS {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || 
                  process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                  process.env.ELEVENLABS_API_KEY || 
                  '';
    if (!this.apiKey) {
      console.warn('⚠️ ElevenLabs API key not found. Falling back to browser TTS.');
    } else {
      console.log('✅ ElevenLabs API key found and loaded');
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(
    text: string, 
    options: TTSOptions = {}
  ): Promise<AudioBuffer | null> {
    if (!this.apiKey) {
      console.warn('No ElevenLabs API key available');
      return null;
    }

    const {
      voice_id = RESTAURANT_VOICES[0].voice_id, // Default to Rachel
      model_id = 'eleven_monolingual_v1',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    } = options;

    try {
      console.log(`🔊 Generating speech with ElevenLabs voice: ${this.getVoiceName(voice_id)}`);
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        return null;
      }

      const audioData = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(audioData);

      console.log('✅ ElevenLabs speech generated successfully');
      return audioBuffer;

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      return null;
    }
  }

  /**
   * Play audio buffer through Web Audio API
   */
  async playAudio(audioBuffer: AudioBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        source.onended = () => resolve();
        source.addEventListener('error', () => reject(new Error('Audio playback failed')));
        
        source.start(0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * High-level speak function with fallback
   */
  async speak(text: string, voiceId?: string): Promise<boolean> {
    try {
      // Try ElevenLabs first
      const audioBuffer = await this.textToSpeech(text, { voice_id: voiceId });
      
      if (audioBuffer) {
        await this.playAudio(audioBuffer);
        return true;
      }
      
      // Fallback to browser TTS
      console.log('🔄 Falling back to browser TTS');
      return this.fallbackSpeak(text);
      
    } catch (error) {
      console.error('Speech error:', error);
      return this.fallbackSpeak(text);
    }
  }

  /**
   * Fallback to browser speech synthesis
   */
  private fallbackSpeak(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        
        speechSynthesis.speak(utterance);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Get voice name by ID
   */
  private getVoiceName(voiceId: string): string {
    const voice = RESTAURANT_VOICES.find(v => v.voice_id === voiceId);
    return voice ? voice.name : 'Unknown Voice';
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): ElevenLabsVoice[] {
    return RESTAURANT_VOICES;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ElevenLabs Conversational AI Integration
class ElevenLabsConversationalAI {
  private agentId: string;
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;
  private apiKey: string;

  constructor(agentId: string = 'agent_01jx6z1ve6fqzv43akcfesaebe') {
    this.agentId = agentId;
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                  process.env.ELEVENLABS_API_KEY || 
                  '';
    if (!this.apiKey) {
      console.warn('⚠️ ElevenLabs API key not found for conversational AI');
    }
  }

  // Start a conversation session
  async startConversation(): Promise<boolean> {
    try {
      console.log('🤖 Starting ElevenLabs conversation...');
      
      // Get signed URL for WebSocket connection
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: this.agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const conversationId = data.conversation_id;
      
      // Connect to WebSocket for real-time conversation
      return this.connectWebSocket(conversationId);
      
    } catch (error) {
      console.error('❌ Failed to start conversation:', error);
      return false;
    }
  }

  // Connect to WebSocket for real-time conversation
  private async connectWebSocket(conversationId: string): Promise<boolean> {
    try {
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversations/${conversationId}/ws`;
      
      this.websocket = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        if (!this.websocket) {
          reject(new Error('WebSocket not initialized'));
          return;
        }

        this.websocket.onopen = () => {
          console.log('🔗 Connected to ElevenLabs conversation');
          this.isConnected = true;
          resolve(true);
        };

        this.websocket.onerror = (error) => {
          console.error('🚫 WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.websocket.onclose = () => {
          console.log('🔌 WebSocket connection closed');
          this.isConnected = false;
        };
      });

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      return false;
    }
  }

  // Send audio data to the conversation
  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.websocket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    // Send audio data as binary
    this.websocket.send(audioData);
  }

  // Send text message to the conversation
  async sendMessage(message: string): Promise<void> {
    if (!this.websocket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const messageData = {
      type: 'message',
      content: message,
    };

    this.websocket.send(JSON.stringify(messageData));
  }

  // Set up message handler for receiving responses
  onMessage(callback: (data: any) => void): void {
    if (!this.websocket) return;

    this.websocket.onmessage = (event) => {
      try {
        // Handle binary audio data
        if (event.data instanceof ArrayBuffer) {
          callback({
            type: 'audio',
            data: event.data,
          });
          return;
        }

        // Handle JSON messages
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  // End the conversation
  async endConversation(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }
  }

  // Check if conversation is active
  isConversationActive(): boolean {
    return this.isConnected;
  }
}

// Utility functions
function getRestaurantVoice(type: 'professional' | 'friendly' | 'warm' | 'confident' = 'professional'): string {
  const voice = RESTAURANT_VOICES.find(v => v.category === type);
  return voice ? voice.voice_id : RESTAURANT_VOICES[0].voice_id;
}

function getVoiceForSentiment(sentiment: 'positive' | 'neutral' | 'urgent'): string {
  switch (sentiment) {
    case 'positive':
      return getRestaurantVoice('friendly');
    case 'urgent':
      return getRestaurantVoice('confident');
    default:
      return getRestaurantVoice('professional');
  }
}

// Create instances
const elevenLabsTTS = new ElevenLabsTTS();
const elevenLabsConversation = new ElevenLabsConversationalAI();

// Single export statement - no duplicates!
export { 
  elevenLabsTTS, 
  getRestaurantVoice, 
  getVoiceForSentiment, 
  elevenLabsConversation 
}; 