export interface VoiceProvider {
  name: string;
  type: 'elevenlabs' | 'openai' | 'google' | 'azure';
  config: {
    apiKey: string;
    voiceId?: string;
    model?: string;
    settings?: Record<string, any>;
  };
  features: {
    realTimeConversation: boolean;
    textToSpeech: boolean;
    speechToText: boolean;
    voiceCloning: boolean;
    streaming: boolean;
  };
  pricing: {
    charactersPerCredit: number;
    realTimeMinuteRate: number;
    freeQuota?: number;
  };
}

export interface VoiceResponse {
  audioUrl?: string;
  audioBuffer?: Buffer;
  duration: number;
  cost: number;
  provider: string;
}

export class VoiceProviderManager {
  private providers: Map<string, VoiceProvider> = new Map();
  private activeProvider: string = 'elevenlabs';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // ElevenLabs Configuration
    this.providers.set('elevenlabs', {
      name: 'ElevenLabs',
      type: 'elevenlabs',
      config: {
        apiKey: process.env.ELEVENLABS_API_KEY!,
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
        settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      },
      features: {
        realTimeConversation: true,
        textToSpeech: true,
        speechToText: false,
        voiceCloning: true,
        streaming: true
      },
      pricing: {
        charactersPerCredit: 1000,
        realTimeMinuteRate: 0.20,
        freeQuota: 10000
      }
    });

    // OpenAI GPT Voice Configuration
    this.providers.set('openai', {
      name: 'OpenAI Voice',
      type: 'openai',
      config: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4-audio-preview',
        settings: {
          voice: 'alloy',
          speed: 1.0,
          response_format: 'mp3'
        }
      },
      features: {
        realTimeConversation: true,
        textToSpeech: true,
        speechToText: true,
        voiceCloning: false,
        streaming: true
      },
      pricing: {
        charactersPerCredit: 4000,
        realTimeMinuteRate: 0.06,
        freeQuota: 0
      }
    });

    // Google Cloud TTS Configuration
    this.providers.set('google', {
      name: 'Google Cloud TTS',
      type: 'google',
      config: {
        apiKey: process.env.GOOGLE_CLOUD_API_KEY!,
        settings: {
          voice: 'en-US-Neural2-F',
          speakingRate: 1.0,
          pitch: 0,
          audioEncoding: 'MP3'
        }
      },
      features: {
        realTimeConversation: false,
        textToSpeech: true,
        speechToText: true,
        voiceCloning: false,
        streaming: false
      },
      pricing: {
        charactersPerCredit: 4000000,
        realTimeMinuteRate: 0.004,
        freeQuota: 1000000
      }
    });

    // Azure Speech Configuration
    this.providers.set('azure', {
      name: 'Azure Speech',
      type: 'azure',
      config: {
        apiKey: process.env.AZURE_SPEECH_KEY!,
        settings: {
          voice: 'en-US-AriaNeural',
          rate: 1.0,
          pitch: 0,
          outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
        }
      },
      features: {
        realTimeConversation: true,
        textToSpeech: true,
        speechToText: true,
        voiceCloning: false,
        streaming: true
      },
      pricing: {
        charactersPerCredit: 1000000,
        realTimeMinuteRate: 0.01,
        freeQuota: 500000
      }
    });
  }

  async generateSpeech(text: string, options?: {
    provider?: string;
    voiceId?: string;
    speed?: number;
  }): Promise<VoiceResponse> {
    const providerName = options?.provider || this.activeProvider;
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Voice provider ${providerName} not found`);
    }

    // Implementation would route to specific provider
    switch (provider.type) {
      case 'elevenlabs':
        return this.generateElevenLabsSpeech(text, provider, options);
      case 'openai':
        return this.generateOpenAISpeech(text, provider, options);
      case 'google':
        return this.generateGoogleSpeech(text, provider, options);
      case 'azure':
        return this.generateAzureSpeech(text, provider, options);
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  private async generateElevenLabsSpeech(
    text: string, 
    provider: VoiceProvider, 
    options?: any
  ): Promise<VoiceResponse> {
    // ElevenLabs implementation (existing logic)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${provider.config.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': provider.config.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: provider.config.settings
      })
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audioBuffer,
      duration: Math.ceil(text.length / 10), // Rough estimate
      cost: (text.length / provider.pricing.charactersPerCredit) * 0.30,
      provider: provider.name
    };
  }

  private async generateOpenAISpeech(
    text: string, 
    provider: VoiceProvider, 
    options?: any
  ): Promise<VoiceResponse> {
    // OpenAI GPT Voice implementation
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.config.model,
        input: text,
        voice: provider.config.settings?.voice || 'alloy',
        speed: options?.speed || 1.0,
        response_format: 'mp3'
      })
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    return {
      audioBuffer,
      duration: Math.ceil(text.length / 12),
      cost: (text.length / provider.pricing.charactersPerCredit) * 0.015,
      provider: provider.name
    };
  }

  private async generateGoogleSpeech(
    text: string, 
    provider: VoiceProvider, 
    options?: any
  ): Promise<VoiceResponse> {
    // Google implementation placeholder
    throw new Error('Google TTS implementation pending');
  }

  private async generateAzureSpeech(
    text: string, 
    provider: VoiceProvider, 
    options?: any
  ): Promise<VoiceResponse> {
    // Azure implementation placeholder
    throw new Error('Azure Speech implementation pending');
  }

  getAvailableProviders(): VoiceProvider[] {
    return Array.from(this.providers.values());
  }

  setActiveProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider ${providerName} not available`);
    }
    this.activeProvider = providerName;
  }

  getProvider(providerName: string): VoiceProvider | undefined {
    return this.providers.get(providerName);
  }

  // Compare providers for cost analysis
  async compareProviders(text: string): Promise<{
    provider: string;
    estimatedCost: number;
    features: string[];
    speed: 'fast' | 'medium' | 'slow';
  }[]> {
    const comparisons: {
      provider: string;
      estimatedCost: number;
      features: string[];
      speed: 'fast' | 'medium' | 'slow';
    }[] = [];
    
    for (const [name, provider] of Array.from(this.providers.entries())) {
      const estimatedCost = (text.length / provider.pricing.charactersPerCredit) * 
        (provider.pricing.realTimeMinuteRate || 0.10);
      
      const speed: 'fast' | 'medium' | 'slow' = provider.type === 'google' ? 'fast' : 
               provider.type === 'elevenlabs' ? 'medium' : 'fast';
      
      comparisons.push({
        provider: name,
        estimatedCost,
        features: Object.entries(provider.features)
          .filter(([, enabled]) => enabled)
          .map(([feature]) => feature),
        speed
      });
    }
    
    return comparisons.sort((a, b) => a.estimatedCost - b.estimatedCost);
  }
}

// Export singleton instance
export const voiceProviderManager = new VoiceProviderManager();

// Utility function for restaurant use
export async function generateRestaurantVoiceResponse(
  message: string,
  context: {
    restaurant: string;
    urgency?: 'low' | 'medium' | 'high';
    cost_preference?: 'budget' | 'balanced' | 'premium';
  }
): Promise<VoiceResponse> {
  // Select provider based on context
  let provider = 'elevenlabs'; // Default
  
  if (context.cost_preference === 'budget') {
    provider = 'google';
  } else if (context.urgency === 'high') {
    provider = 'openai'; // Fast response
  } else if (context.cost_preference === 'premium') {
    provider = 'elevenlabs'; // Best quality
  }
  
  return voiceProviderManager.generateSpeech(message, { provider });
} 