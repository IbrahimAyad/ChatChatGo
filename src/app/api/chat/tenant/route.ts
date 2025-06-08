import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TenantChatRequest {
  tenantId: string;
  message: string;
  conversationHistory?: any[];
  userId?: string;
  sessionId?: string;
}

// GET tenant by ID/slug (mock implementation)
async function getTenant(tenantId: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/tenants/${tenantId}`);
    if (response.ok) {
      const data = await response.json();
      return data.tenant;
    }
  } catch (error) {
    console.error('Failed to fetch tenant:', error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, message, conversationHistory = [], userId, sessionId }: TenantChatRequest = await request.json();

    if (!tenantId || !message) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['tenantId', 'message']
      }, { status: 400 });
    }

    // Get tenant configuration
    const tenant = await getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json({
        error: 'Tenant not found',
        message: `No tenant found with ID: ${tenantId}`
      }, { status: 404 });
    }

    // Check if tenant is active
    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return NextResponse.json({
        error: 'Tenant inactive',
        message: `Tenant ${tenant.name} is currently ${tenant.status}`
      }, { status: 403 });
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map((msg: any) => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      }));

    // Check if tenant has N8N workflow enabled
    const settings = tenant.settings as any;
    let response: string;
    let provider = 'openai';
    let orderDetected = false;
    let items: any[] = [];
    
    if (settings.n8nEnabled && settings.n8nWebhookUrl) {
      try {
        console.log(`[CHAT] Using N8N workflow for ${tenant.name}: ${settings.n8nWebhookUrl}`);
        
        // Send message to N8N workflow
        const n8nResponse = await fetch(settings.n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId: sessionId,
            customerInfo: {
              timestamp: new Date().toISOString(),
              timezone: tenant.settings.timezone,
              userId
            },
            conversationHistory: conversationHistory.slice(-3) // Last 3 messages for context
          }),
        });

        if (n8nResponse.ok) {
          const n8nData = await n8nResponse.json();
          response = n8nData.response || "I'm sorry, I didn't receive a proper response.";
          provider = 'n8n-workflow';
          orderDetected = n8nData.orderDetected || false;
          items = n8nData.items || [];
          
          console.log(`[CHAT] N8N response for ${tenant.name}:`, response.substring(0, 100) + '...');
        } else {
          console.warn(`[CHAT] N8N workflow failed for ${tenant.name}, status: ${n8nResponse.status}`);
          throw new Error(`N8N webhook returned ${n8nResponse.status}`);
        }
      } catch (n8nError) {
        console.error(`[CHAT] N8N workflow error for ${tenant.name}:`, n8nError);
        console.log(`[CHAT] Falling back to OpenAI for ${tenant.name}`);
        
        // Fall through to OpenAI implementation
        const systemPrompt = buildSystemPrompt(tenant);
        const completion = await openai.chat.completions.create({
          model: tenant.settings.aiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationContext,
            { role: 'user', content: message }
          ],
          temperature: tenant.settings.temperature,
          max_tokens: tenant.settings.maxTokens,
        });
        
        response = completion.choices[0]?.message?.content || tenant.settings.fallbackMessage;
        provider = 'openai-fallback';
      }
    } else {
      // Standard OpenAI implementation
      console.log(`[CHAT] Using OpenAI for ${tenant.name} (N8N not enabled)`);
      
      const systemPrompt = buildSystemPrompt(tenant);
      const completion = await openai.chat.completions.create({
        model: tenant.settings.aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext,
          { role: 'user', content: message }
        ],
        temperature: tenant.settings.temperature,
        max_tokens: tenant.settings.maxTokens,
      });
      
      response = completion.choices[0]?.message?.content || tenant.settings.fallbackMessage;
    }

    // Log usage (in production, this would update the database)
    console.log(`Tenant ${tenantId} chat: ${message.length} chars in, ${response.length} chars out`);

    return NextResponse.json({
      response,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        branding: tenant.branding,
      },
      provider,
      orderDetected,
      items,
      metadata: {
        model: tenant.settings.aiModel,
        temperature: tenant.settings.temperature,
        sessionId,
        timestamp: new Date().toISOString(),
        workflowId: settings.n8nWorkflowId || null,
      },
    });

  } catch (error) {
    console.error('Tenant chat error:', error);
    
    return NextResponse.json({
      error: 'Chat processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
    }, { status: 500 });
  }
}

function buildSystemPrompt(tenant: any): string {
  const basePrompt = tenant.settings.systemPrompt;
  
  // Add business hours context
  const currentHour = new Date().getHours();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase().slice(0, 3); // 'mon', 'tue', etc.
  const todaySchedule = tenant.settings.businessHours[today + 'day'];
  
  let hoursContext = '';
  if (todaySchedule?.open) {
    const openTime = todaySchedule.openTime;
    const closeTime = todaySchedule.closeTime;
    hoursContext = `Today we are open from ${openTime} to ${closeTime}.`;
    
    const openHour = parseInt(openTime.split(':')[0]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    
    if (currentHour < openHour || currentHour >= closeHour) {
      hoursContext += ' We are currently closed.';
    } else {
      hoursContext += ' We are currently open.';
    }
  } else {
    hoursContext = 'We are closed today.';
  }

  // Add industry-specific context
  let industryContext = '';
  switch (tenant.industry) {
    case 'restaurant':
      industryContext = `
      Key information about our restaurant:
      - We serve authentic cuisine with fresh, high-quality ingredients
      - We accept reservations and walk-ins
      - We offer dine-in, takeout, and delivery options
      - Ask about our daily specials and seasonal menu items
      `;
      break;
    case 'retail':
      industryContext = `
      Key information about our store:
      - We offer a wide selection of products with competitive pricing
      - We provide product warranties and customer support
      - We offer both in-store pickup and shipping options
      - Ask about current promotions and deals
      `;
      break;
    case 'healthcare':
      industryContext = `
      Important healthcare guidelines:
      - For medical emergencies, direct patients to call 911
      - Cannot provide medical advice - refer to healthcare professionals
      - Help with appointment scheduling and general clinic information
      - Maintain HIPAA compliance in all interactions
      `;
      break;
  }

  // Add feature-specific capabilities
  let capabilitiesContext = '';
  const capabilities = [];
  
  if (tenant.features.appointments) {
    capabilities.push('schedule appointments');
  }
  if (tenant.features.leadCapture) {
    capabilities.push('collect contact information');
  }
  if (tenant.features.payments) {
    capabilities.push('assist with payment information');
  }
  
  if (capabilities.length > 0) {
    capabilitiesContext = `I can help you ${capabilities.join(', ')}.`;
  }

  return `${basePrompt}

${industryContext}

${hoursContext}

${capabilitiesContext}

Remember to be helpful, professional, and aligned with our brand voice. Always prioritize customer satisfaction and provide accurate information about our ${tenant.industry} business.`;
} 