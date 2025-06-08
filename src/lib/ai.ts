import OpenAI from 'openai';
import { ChatBot, Message, Intent, LeadInformation } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate AI response for a chat message
   */
  async generateResponse(
    message: string,
    bot: ChatBot,
    conversationHistory: Message[] = [],
    context: Record<string, any> = {}
  ): Promise<{
    response: string;
    intent?: string;
    confidence: number;
    shouldCollectLead: boolean;
    audioUrl?: string;
  }> {
    try {
      // Build conversation context
      const systemPrompt = this.buildSystemPrompt(bot, context);
      const messages = this.buildMessageHistory(conversationHistory, message);

      // Get completion from OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
        functions: [
          {
            name: 'identify_intent',
            description: 'Identify the user intent and determine if lead collection is needed',
            parameters: {
              type: 'object',
              properties: {
                intent: {
                  type: 'string',
                  description: 'The identified user intent',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score between 0 and 1',
                },
                shouldCollectLead: {
                  type: 'boolean',
                  description: 'Whether to collect lead information',
                },
                response: {
                  type: 'string',
                  description: 'The assistant response',
                },
              },
              required: ['intent', 'confidence', 'shouldCollectLead', 'response'],
            },
          },
        ],
        function_call: { name: 'identify_intent' },
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('Failed to get structured response from AI');
      }

      const aiResponse = JSON.parse(functionCall.arguments);

      // Generate audio if voice is enabled
      let audioUrl: string | undefined;
      if (bot.config.voice.enabled) {
        audioUrl = await this.generateSpeech(aiResponse.response, bot);
      }

      return {
        response: aiResponse.response,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        shouldCollectLead: aiResponse.shouldCollectLead,
        audioUrl,
      };
    } catch (error) {
      console.error('AI Service error:', error);
      
      // Fallback response
      const fallbackResponse = this.getFallbackResponse(bot);
      return {
        response: fallbackResponse,
        intent: 'fallback',
        confidence: 0.5,
        shouldCollectLead: false,
      };
    }
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text: string, bot: ChatBot): Promise<string> {
    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: bot.config.voice.voiceId as any || 'alloy',
        input: text,
        speed: bot.config.voice.speed,
      });

      // Convert to blob and create URL (in a real app, you'd upload to storage)
      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      // In production, upload to Firebase Storage or CDN
      // For now, return a placeholder URL
      return `data:audio/mp3;base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Speech generation error:', error);
      throw error;
    }
  }

  /**
   * Convert speech to text using OpenAI Whisper
   */
  async speechToText(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Speech to text error:', error);
      throw error;
    }
  }

  /**
   * Analyze lead quality and scoring
   */
  analyzeLeadQuality(leadInfo: Partial<LeadInformation>, conversationHistory: Message[]): {
    score: number;
    qualified: boolean;
    tags: string[];
  } {
    let score = 0;
    const tags: string[] = [];

    // Basic info scoring
    if (leadInfo.name) score += 20;
    if (leadInfo.email) score += 30;
    if (leadInfo.phone) score += 25;
    if (leadInfo.company) score += 15;

    // Engagement scoring based on conversation
    const messageCount = conversationHistory.filter(m => m.type === 'user').length;
    if (messageCount >= 3) score += 10;
    if (messageCount >= 5) score += 10;

    // Intent analysis
    const hasBookingIntent = conversationHistory.some(m => 
      m.intent?.includes('booking') || m.intent?.includes('reservation')
    );
    if (hasBookingIntent) {
      score += 20;
      tags.push('booking-intent');
    }

    const hasPricingIntent = conversationHistory.some(m => 
      m.intent?.includes('pricing') || m.intent?.includes('cost')
    );
    if (hasPricingIntent) {
      score += 15;
      tags.push('pricing-inquiry');
    }

    // Qualification logic
    const qualified = score >= 60 && (!!leadInfo.email || !!leadInfo.phone);

    return { score, qualified, tags };
  }

  /**
   * Build system prompt based on bot configuration
   */
  private buildSystemPrompt(bot: ChatBot, context: Record<string, any>): string {
    const { personality } = bot.template;
    const { vertical } = bot;

    let prompt = `You are an AI assistant for ${bot.name}, specializing in ${vertical}.

Personality:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Use emoji: ${personality.emoji === true ? 'yes' : 'no'}
- Use humor: ${personality.humor === true ? 'yes' : 'no'}
- Show empathy: ${personality.empathy === true ? 'yes' : 'no'}

Your greeting: "${bot.config.behavior.greeting}"

Guidelines:
1. Always be helpful and professional
2. Stay focused on ${vertical}-related topics
3. If asked about unrelated topics, politely redirect
4. Collect lead information when appropriate
5. Use the provided intents and responses when possible
6. Keep responses concise but informative

Available intents: ${bot.template.intents.map(i => i.name).join(', ')}

Context: ${JSON.stringify(context, null, 2)}`;

    // Add vertical-specific instructions
    if (vertical === 'restaurant') {
      prompt += `\n\nRestaurant-specific instructions:
- Help with menu inquiries, reservations, hours, location
- Collect contact info for reservations
- Be enthusiastic about food and dining experience`;
    }

    return prompt;
  }

  /**
   * Build message history for OpenAI
   */
  private buildMessageHistory(history: Message[], currentMessage: string) {
    const messages = history
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

    messages.push({ role: 'user', content: currentMessage });
    return messages;
  }

  /**
   * Get fallback response when AI fails
   */
  private getFallbackResponse(bot: ChatBot): string {
    const fallbacks = bot.config.behavior.fallbackMessages;
    return fallbacks[Math.floor(Math.random() * fallbacks.length)] || 
      "I'm sorry, I'm having trouble understanding right now. Could you please try again?";
  }

  /**
   * Match user message against predefined intents
   */
  matchIntent(message: string, intents: Intent[]): {
    intent: Intent | null;
    confidence: number;
  } {
    let bestMatch: Intent | null = null;
    let bestConfidence = 0;

    for (const intent of intents) {
      for (const example of intent.examples) {
        const similarity = this.calculateSimilarity(message.toLowerCase(), example.toLowerCase());
        if (similarity > bestConfidence && similarity >= intent.confidence_threshold) {
          bestMatch = intent;
          bestConfidence = similarity;
        }
      }
    }

    return { intent: bestMatch, confidence: bestConfidence };
  }

  /**
   * Simple similarity calculation (in production, use more sophisticated NLP)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  }
}

export const aiService = AIService.getInstance(); 