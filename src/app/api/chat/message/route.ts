import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';

// Mock bot data - in production this would come from your database
const mockBot = {
  id: 'demo-bot',
  tenantId: 'demo-tenant',
  name: 'Demo Restaurant Assistant',
  description: 'AI assistant for restaurant inquiries',
  vertical: 'restaurant' as const,
  template: {
    id: 'restaurant-template',
    name: 'Restaurant Template',
    vertical: 'restaurant' as const,
    description: 'Template for restaurant chatbots',
    personality: {
      tone: 'friendly' as const,
      style: 'conversational' as const,
      emoji: true,
      humor: true,
      empathy: true,
    },
    flows: [],
    intents: [
      {
        id: 'greeting',
        name: 'greeting',
        description: 'User greeting',
        examples: ['hello', 'hi', 'hey', 'good morning'],
        responses: ['Hello! How can I help you today?'],
        confidence_threshold: 0.7,
      },
      {
        id: 'menu_inquiry',
        name: 'menu_inquiry',
        description: 'Questions about menu items',
        examples: ['what do you have?', 'menu', 'food options'],
        responses: ['We have a variety of delicious options!'],
        confidence_threshold: 0.6,
      },
      {
        id: 'reservation',
        name: 'reservation',
        description: 'Booking a table',
        examples: ['book a table', 'reservation', 'make booking'],
        responses: ['I\'d be happy to help with your reservation!'],
        confidence_threshold: 0.8,
      },
    ],
    responses: [],
    demoScripts: [],
  },
  config: {
    voice: {
      enabled: true,
      provider: 'openai' as const,
      voiceId: 'alloy',
      speed: 1.0,
      pitch: 1.0,
      fallbackToText: true,
    },
    appearance: {
      widgetPosition: 'bottom-right' as const,
      colors: {
        primary: '#0ea5e9',
        secondary: '#64748b',
        background: '#ffffff',
        text: '#1f2937',
      },
    },
    behavior: {
      greeting: 'Hello! Welcome to our restaurant. How can I assist you today?',
      fallbackMessages: [
        'I\'m sorry, I didn\'t quite understand that. Could you please rephrase?',
        'Let me help you with that. Could you provide more details?',
        'I\'m here to help! What would you like to know?',
      ],
      maxRetries: 3,
      sessionTimeout: 1800000, // 30 minutes
      collectLeadInfo: true,
      requireName: false,
      requireEmail: false,
      requirePhone: false,
    },
    integrations: {
      n8n: {
        enabled: false,
        webhookUrl: '',
        workflows: [],
      },
    },
  },
  status: 'active' as const,
  analytics: {
    totalSessions: 0,
    completedSessions: 0,
    averageSessionDuration: 0,
    leadsGenerated: 0,
    conversionRate: 0,
    voiceUsageRate: 0,
    topIntents: [],
    satisfaction: {
      averageRating: 0,
      totalRatings: 0,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// POST /api/chat/message - Process chat message and generate AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, isVoice = false, botId } = body;

    // Validate required fields
    if (!sessionId || !message || !botId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: 'sessionId, message, and botId are required' } },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Fetch the bot configuration from database
    // 2. Fetch conversation history from database
    // 3. Validate session exists and is active

    const bot = mockBot; // Use mock for demo
    const conversationHistory: any[] = []; // In production, fetch from DB

    // Generate AI response using the AI service
    const aiResponse = await aiService.generateResponse(
      message,
      bot,
      conversationHistory,
      {
        sessionId,
        isVoice,
        timestamp: new Date(),
      }
    );

    // In production, you would:
    // 1. Store the user message in database
    // 2. Store the AI response in database
    // 3. Update session analytics
    // 4. Trigger N8N webhooks if configured

    // Mock storing messages
    console.log('User message:', { sessionId, message, isVoice });
    console.log('AI response:', aiResponse);

    // Send N8N webhook if configured (mock implementation)
    if (bot.config.integrations.n8n?.enabled) {
      // await sendN8NWebhook(bot.config.integrations.n8n.webhookUrl, {
      //   sessionId,
      //   userMessage: message,
      //   aiResponse: aiResponse.response,
      //   intent: aiResponse.intent,
      //   shouldCollectLead: aiResponse.shouldCollectLead,
      // });
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse.response,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        shouldCollectLead: aiResponse.shouldCollectLead,
        audioUrl: aiResponse.audioUrl,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Message processing error:', error);
    
    // Return fallback response
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'MESSAGE_PROCESSING_FAILED', 
          message: 'Failed to process message' 
        },
        data: {
          response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
          intent: 'error',
          confidence: 0,
          shouldCollectLead: false,
          timestamp: new Date(),
        }
      },
      { status: 500 }
    );
  }
}

// Helper function to send N8N webhook (mock implementation)
async function sendN8NWebhook(webhookUrl: string, data: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('N8N webhook failed:', response.statusText);
    }
  } catch (error) {
    console.error('N8N webhook error:', error);
  }
} 