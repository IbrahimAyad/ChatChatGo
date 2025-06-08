import { NextRequest, NextResponse } from 'next/server';
import { customerMemory } from '@/lib/customer-memory';
import { analyticsEngine } from '@/lib/analytics-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      customerId, 
      tenantId = 'royale-with-cheese', 
      sessionId,
      conversationContext,
      isVoiceMessage = false 
    } = body;

    console.log(`🧠 Enhanced Chat - Customer: ${customerId}, Message: ${message}`);

    // Start conversation session if new
    if (!conversationContext?.sessionId) {
      const newSession = await customerMemory.startConversationSession(
        customerId, 
        tenantId, 
        sessionId || `session-${Date.now()}`
      );
      console.log(`🆕 New conversation session: ${newSession.sessionId}`);
    }

    // Track conversation event for analytics
    await analyticsEngine.trackConversationEvent(tenantId, {
      type: 'message_sent',
      customerId,
      sessionId: sessionId || `session-${Date.now()}`,
      data: { 
        message, 
        isVoiceMessage,
        messageLength: message.length 
      },
      timestamp: new Date()
    });

    // Generate personalized greeting if first message
    const isGreeting = !conversationContext || conversationContext.stage === 'greeting';
    let personalizedGreeting = '';
    
    if (isGreeting) {
      personalizedGreeting = await customerMemory.generatePersonalizedGreeting(customerId, tenantId);
      console.log(`👋 Personalized greeting: ${personalizedGreeting}`);
    }

    // Analyze customer behavior during conversation
    await analyzeCustomerBehavior(sessionId || `session-${Date.now()}`, message);

    // Get customer profile for context
    const customerProfile = await customerMemory.getCustomerProfile(customerId, tenantId);

    // Load menu data for intelligent responses
    const menuResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tenants/menu/${tenantId}`);
    const menuData = menuResponse.ok ? await menuResponse.json() : null;

    // Build intelligent AI context
    const aiContext = buildIntelligentContext(customerProfile, menuData, conversationContext);

    // Generate AI response with enhanced intelligence
    const aiResponse = await generateIntelligentResponse(
      message, 
      aiContext, 
      personalizedGreeting,
      customerProfile,
      conversationContext
    );

    // Check for upselling opportunities
    const upsellSuggestions = await generateUpsellOpportunities(
      sessionId || `session-${Date.now()}`,
      conversationContext,
      message
    );

    // Generate smart bundles if ordering
    const bundleRecommendations = await generateBundleRecommendations(
      customerId,
      conversationContext
    );

    // Get real-time insights for response enhancement
    const realTimeInsights = await getRealTimeInsights(tenantId);

    // Enhanced response with intelligence
    const enhancedResponse = enhanceResponseWithIntelligence(
      aiResponse,
      upsellSuggestions,
      bundleRecommendations,
      realTimeInsights,
      customerProfile
    );

    // Track successful response generation
    await analyticsEngine.trackConversationEvent(tenantId, {
      type: 'message_sent',
      customerId,
      sessionId: sessionId || `session-${Date.now()}`,
      data: { 
        responseGenerated: true,
        responseLength: enhancedResponse.length,
        upsellsOffered: upsellSuggestions.length,
        bundlesOffered: bundleRecommendations.length
      },
      timestamp: new Date()
    });

    return NextResponse.json({
      response: enhancedResponse,
      customerInsights: {
        loyaltyTier: customerProfile.loyaltyTier,
        loyaltyPoints: customerProfile.loyaltyPoints,
        visitCount: customerProfile.visitCount,
        averageOrderValue: customerProfile.averageOrderValue,
        preferredItems: customerProfile.preferredItems
      },
      upsellSuggestions,
      bundleRecommendations,
      conversationContext: {
        sessionId: sessionId || `session-${Date.now()}`,
        stage: determineConversationStage(message, conversationContext),
        customerId,
        tenantId
      },
      realTimeMetrics: {
        currentPeakStatus: realTimeInsights.currentPeakStatus,
        expectedWaitTime: realTimeInsights.expectedWaitTime,
        popularItemsToday: realTimeInsights.popularItemsToday
      }
    });

  } catch (error) {
    console.error('❌ Enhanced chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process enhanced chat request',
        fallbackResponse: "I'm sorry, I'm having trouble right now. Let me help you with your order - what would you like to try today?"
      },
      { status: 500 }
    );
  }
}

// Analyze customer behavior from message content
async function analyzeCustomerBehavior(sessionId: string, message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Detect hesitation
  if (lowerMessage.includes('maybe') || lowerMessage.includes('not sure') || lowerMessage.includes('hmm')) {
    await customerMemory.trackBehavior(sessionId, {
      type: 'hesitation',
      data: { reason: 'indecisive_language' }
    });
  }
  
  // Detect item mentions
  const itemMentions = extractItemMentions(message);
  for (const item of itemMentions) {
    await customerMemory.trackBehavior(sessionId, {
      type: 'item_mention',
      data: { itemName: item }
    });
  }
  
  // Detect preferences
  const preferences = extractPreferences(message);
  for (const preference of preferences) {
    await customerMemory.trackBehavior(sessionId, {
      type: 'preference_expressed',
      data: { preference }
    });
  }
  
  // Detect mood
  const mood = detectCustomerMood(message);
  if (mood) {
    await customerMemory.trackBehavior(sessionId, {
      type: 'mood_indicator',
      data: { mood }
    });
  }
}

// Build intelligent context for AI
function buildIntelligentContext(customerProfile: any, menuData: any, conversationContext: any) {
  let context = `You are an advanced AI assistant for a restaurant with incredible customer intelligence.

CUSTOMER INTELLIGENCE:
- Customer ID: ${customerProfile.customerId}
- Loyalty Tier: ${customerProfile.loyaltyTier.toUpperCase()} (${customerProfile.loyaltyPoints} points)
- Visit Count: ${customerProfile.visitCount} visits
- Average Order Value: $${customerProfile.averageOrderValue.toFixed(2)}
- Last Order: ${customerProfile.lastOrderDate.toDateString()}

CUSTOMER PREFERENCES:
- Dietary Restrictions: ${customerProfile.dietaryRestrictions.join(', ') || 'None'}
- Preferred Items: ${customerProfile.preferredItems.join(', ') || 'None yet'}
- Disliked Items: ${customerProfile.dislikedItems.join(', ') || 'None'}
- Spice Preference: ${customerProfile.spicePreference}
- Communication Style: ${customerProfile.conversationStyle}

CONVERSATION CONTEXT:
- Stage: ${conversationContext?.stage || 'greeting'}
- Session: ${conversationContext?.sessionId}
`;

  if (menuData?.menu) {
    context += `\nMENU DATA:\n`;
    menuData.menu.slice(0, 10).forEach((item: any) => {
      context += `- ${item.name}: $${item.price} - ${item.description}\n`;
    });
  }

  context += `\nINTELLIGENT RESPONSES:
- Adapt your tone to match the customer's communication style
- Reference their loyalty status naturally
- Suggest items based on their preferences and past orders
- Use their dietary restrictions to filter recommendations
- Be proactive about upselling based on their order history
- Make the experience feel personal and memorable`;

  return context;
}

// Generate intelligent AI response
async function generateIntelligentResponse(
  message: string, 
  context: string, 
  personalizedGreeting: string,
  customerProfile: any,
  conversationContext: any
): Promise<string> {
  
  // For demo purposes, generate an intelligent response based on patterns
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (!conversationContext || conversationContext.stage === 'greeting') {
    if (personalizedGreeting) {
      return personalizedGreeting;
    }
  }
  
  // Menu browsing responses
  if (lowerMessage.includes('menu') || lowerMessage.includes('what do you have')) {
    if (customerProfile.preferredItems.length > 0) {
      return `Great question! Based on your preferences, I'd especially recommend our ${customerProfile.preferredItems[0] || 'signature dishes'}. But let me show you some popular options:\n\n🍕 Margherita Pizza - $15.99\n🍔 Classic Burger - $12.99\n🥗 Caesar Salad - $9.99\n🍝 Pasta Alfredo - $14.99\n\nWhat sounds good to you today?`;
    }
    return `I'd love to help you explore our menu! Here are some of our most popular items:\n\n🍕 Margherita Pizza - $15.99\n🍔 Classic Burger - $12.99\n🥗 Caesar Salad - $9.99\n🍝 Pasta Alfredo - $14.99\n\nWhat type of cuisine are you in the mood for?`;
  }
  
  // Pizza orders
  if (lowerMessage.includes('pizza')) {
    let response = `Excellent choice! Our pizzas are made fresh with premium ingredients. `;
    
    if (customerProfile.loyaltyTier === 'gold' || customerProfile.loyaltyTier === 'platinum') {
      response += `As a ${customerProfile.loyaltyTier} member, you get free garlic bread with any large pizza! `;
    }
    
    response += `Which pizza catches your eye?\n\n🍕 Margherita - $15.99\n🍕 Pepperoni - $17.99\n🍕 Meat Lovers - $19.99\n🍕 Veggie Supreme - $18.99`;
    
    return response;
  }
  
  // Burger orders
  if (lowerMessage.includes('burger')) {
    let response = `Our burgers are incredible! Hand-formed patties with fresh ingredients. `;
    
    if (customerProfile.spicePreference === 'hot') {
      response += `Since you like it spicy, you might love our Jalapeño Burger! `;
    }
    
    response += `What kind of burger sounds perfect?\n\n🍔 Classic Burger - $12.99\n🍔 Bacon Cheeseburger - $14.99\n🍔 BBQ Burger - $15.99`;
    
    return response;
  }
  
  // Default intelligent response
  return `I'd be happy to help you with that! As a ${customerProfile.loyaltyTier} member with ${customerProfile.loyaltyPoints} points, you're always getting our best service. What can I get started for you today?`;
}

// Generate upselling opportunities
async function generateUpsellOpportunities(sessionId: string, conversationContext: any, message: string) {
  if (!conversationContext?.currentOrder) return [];
  
  return await customerMemory.generateUpsellSuggestions(sessionId, conversationContext.currentOrder);
}

// Generate bundle recommendations
async function generateBundleRecommendations(customerId: string, conversationContext: any) {
  if (!conversationContext?.currentOrder) return [];
  
  return await customerMemory.generateBundleRecommendations(customerId, conversationContext.currentOrder);
}

// Get real-time insights
async function getRealTimeInsights(tenantId: string) {
  const analytics = await analyticsEngine.getRealTimeAnalytics(tenantId);
  
  return {
    currentPeakStatus: analytics.metrics.currentPeakStatus,
    expectedWaitTime: analytics.metrics.currentPeakStatus === 'peak' ? '15-20 minutes' : '10-12 minutes',
    popularItemsToday: analytics.popularItems.slice(0, 3).map(item => item.itemName)
  };
}

// Enhance response with intelligence
function enhanceResponseWithIntelligence(
  baseResponse: string,
  upsellSuggestions: any[],
  bundleRecommendations: any[],
  realTimeInsights: any,
  customerProfile: any
): string {
  let enhancedResponse = baseResponse;
  
  // Add peak time information
  if (realTimeInsights.currentPeakStatus === 'peak') {
    enhancedResponse += `\n\n⏰ Just so you know, we're in our dinner rush right now, so your order will take about ${realTimeInsights.expectedWaitTime}. But it'll be worth the wait!`;
  }
  
  // Add upsell suggestions naturally
  if (upsellSuggestions.length > 0) {
    const topUpsell = upsellSuggestions[0];
    enhancedResponse += `\n\n💡 ${topUpsell.reason} Add ${topUpsell.itemName} for just $${topUpsell.suggestedPrice}?`;
  }
  
  // Add bundle recommendations
  if (bundleRecommendations.length > 0) {
    const topBundle = bundleRecommendations[0];
    enhancedResponse += `\n\n🎉 ${topBundle.reason} Save $${topBundle.savings.toFixed(2)}!`;
  }
  
  // Add loyalty points reminder
  if (customerProfile.loyaltyPoints > 0) {
    enhancedResponse += `\n\n⭐ You have ${customerProfile.loyaltyPoints} loyalty points - that's $${(customerProfile.loyaltyPoints * 0.01).toFixed(2)} in rewards!`;
  }
  
  return enhancedResponse;
}

// Helper functions
function extractItemMentions(message: string): string[] {
  const itemKeywords = ['pizza', 'burger', 'salad', 'pasta', 'fries', 'wings', 'sandwich'];
  const lowerMessage = message.toLowerCase();
  
  return itemKeywords.filter(item => lowerMessage.includes(item));
}

function extractPreferences(message: string): string[] {
  const preferences = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('vegetarian') || lowerMessage.includes('veggie')) {
    preferences.push('vegetarian');
  }
  if (lowerMessage.includes('spicy') || lowerMessage.includes('hot')) {
    preferences.push('spicy');
  }
  if (lowerMessage.includes('gluten free') || lowerMessage.includes('gluten-free')) {
    preferences.push('gluten-free');
  }
  
  return preferences;
}

function detectCustomerMood(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('excited') || lowerMessage.includes('hungry') || lowerMessage.includes('starving')) {
    return 'excited';
  }
  if (lowerMessage.includes('quick') || lowerMessage.includes('fast') || lowerMessage.includes('hurry')) {
    return 'hurried';
  }
  if (lowerMessage.includes('maybe') || lowerMessage.includes('not sure') || lowerMessage.includes('hmm')) {
    return 'undecided';
  }
  
  return 'casual';
}

function determineConversationStage(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('order') || lowerMessage.includes('buy') || lowerMessage.includes('get')) {
    return 'ordering';
  }
  if (lowerMessage.includes('menu') || lowerMessage.includes('what do you have')) {
    return 'browsing';
  }
  if (lowerMessage.includes('customize') || lowerMessage.includes('modify') || lowerMessage.includes('add')) {
    return 'customizing';
  }
  if (lowerMessage.includes('checkout') || lowerMessage.includes('pay') || lowerMessage.includes('total')) {
    return 'checkout';
  }
  
  return context?.stage || 'browsing';
} 