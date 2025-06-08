import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock tenant data (this would come from your database)
const getTenantData = async (tenantId: string) => {
  // This would typically fetch from your database
  // For now, we'll use basic tenant info
  return {
    id: tenantId,
    name: tenantId.charAt(0).toUpperCase() + tenantId.slice(1).replace(/-/g, ' '),
    settings: {
      systemPrompt: "You are a helpful restaurant assistant. You help customers with menu inquiries, reservations, hours, and general questions about the restaurant. Be warm, welcoming, and knowledgeable.",
      welcomeMessage: "Welcome! I'm here to help you with our menu, reservations, or any questions about our restaurant. How can I assist you today?",
      fallbackMessage: "I apologize, but I didn't understand your request. Could you please rephrase your question about our restaurant?",
      aiModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
    }
  };
};

// Get menu data for context
const getMenuData = async (tenantId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/tenants/${tenantId}/menu-data`);
    if (response.ok) {
      const data = await response.json();
      return data.menuData;
    }
  } catch (error) {
    console.log('Could not fetch menu data:', error);
  }
  return null;
};

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const { message, testMode = false } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`💬 Chat request for tenant: ${tenantId}`);

    // Get tenant configuration
    const tenant = await getTenantData(tenantId);
    
    // Get menu data for context
    const menuData = await getMenuData(tenantId);

    // Build context
    let contextPrompt = tenant.settings.systemPrompt;
    
    if (menuData && menuData.menu && menuData.menu.length > 0) {
      contextPrompt += `\n\nOur Restaurant: ${menuData.restaurantName || tenant.name}`;
      
      if (menuData.hours) {
        contextPrompt += `\nHours: ${menuData.hours}`;
      }
      
      if (menuData.phone) {
        contextPrompt += `\nPhone: ${menuData.phone}`;
      }
      
      contextPrompt += `\n\nMENU ITEMS:\n`;
      menuData.menu.forEach((item: any) => {
        contextPrompt += `- ${item.name}`;
        if (item.price) contextPrompt += ` ($${item.price})`;
        if (item.description) contextPrompt += `: ${item.description}`;
        contextPrompt += '\n';
      });
      
      if (menuData.specialOffers && menuData.specialOffers.length > 0) {
        contextPrompt += `\nSPECIAL OFFERS:\n`;
        menuData.specialOffers.forEach((offer: any) => {
          contextPrompt += `- ${offer}\n`;
        });
      }
    } else {
      contextPrompt += `\n\nNote: I don't currently have specific menu information loaded, but I can help with general restaurant questions and will try to assist as best I can.`;
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: tenant.settings.aiModel,
      messages: [
        {
          role: 'system',
          content: contextPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: tenant.settings.temperature,
      max_tokens: tenant.settings.maxTokens,
    });

    const aiResponse = completion.choices[0]?.message?.content || tenant.settings.fallbackMessage;

    const response = {
      message: aiResponse,
      tenantId,
      timestamp: new Date().toISOString(),
      metadata: {
        model: tenant.settings.aiModel,
        tokensUsed: completion.usage?.total_tokens || 0,
        hasMenuData: !!(menuData && menuData.menu && menuData.menu.length > 0),
        menuItems: menuData?.menu?.length || 0,
        testMode
      }
    };

    console.log(`✅ Chat response generated for ${tenantId} (${completion.usage?.total_tokens} tokens)`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    return NextResponse.json({
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'I apologize, but I\'m having technical difficulties right now. Please try again in a moment.',
      tenantId: params.tenantId,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// GET method for testing/health check
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params;
  
  try {
    const tenant = await getTenantData(tenantId);
    const menuData = await getMenuData(tenantId);
    
    return NextResponse.json({
      tenantId,
      tenantName: tenant.name,
      status: 'ready',
      hasMenuData: !!(menuData && menuData.menu && menuData.menu.length > 0),
      menuItems: menuData?.menu?.length || 0,
      lastUpdated: menuData?.lastUpdated || null,
      endpoints: {
        chat: `POST /api/tenants/${tenantId}/chat`,
        menuData: `GET /api/tenants/${tenantId}/menu-data`
      }
    });
  } catch (error) {
    return NextResponse.json({
      tenantId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 