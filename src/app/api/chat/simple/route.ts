import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Restaurant context for Mario's Italian Restaurant
const RESTAURANT_CONTEXT = `
You are an AI assistant for Mario's Italian Restaurant. You're friendly, knowledgeable, and helpful.

RESTAURANT INFO:
- Name: Mario's Italian Restaurant
- Cuisine: Authentic Italian
- Specialties: Wood-fired pizzas, fresh pasta, homemade desserts
- Phone: (555) 123-4567
- Hours: Mon-Thu 11am-10pm, Fri-Sat 11am-11pm, Sun 12pm-9pm
- Location: 123 Main Street, Downtown

MENU HIGHLIGHTS:
- Margherita Pizza: $18 (Fresh mozzarella, basil, tomato sauce)
- Caesar Salad: $12 (Romaine, parmesan, house-made croutons)
- Chicken Parmesan: $22 (Breaded chicken, marinara, mozzarella)
- Fettuccine Alfredo: $16 (House-made pasta, creamy alfredo sauce)
- Spaghetti Carbonara: $17 (Pancetta, eggs, parmesan, black pepper)
- Osso Buco: $28 (Braised veal shank, risotto milanese)
- Tiramisu: $8 (Traditional Italian dessert)
- Cannoli: $6 (Sicilian pastry with ricotta filling)
- Chianti Wine: $9/glass, $32/bottle
- Prosecco: $8/glass, $28/bottle

POLICIES:
- Reservations recommended for parties of 4+
- Call (555) 123-4567 or book online at marios-restaurant.com
- 18% gratuity added to parties of 6+
- We accommodate dietary restrictions (vegetarian, gluten-free available)
- Private dining room available for groups of 12+

INSTRUCTIONS:
- Keep responses conversational and under 150 words
- Be enthusiastic about the food and restaurant
- If asked about reservations, guide them to call or book online
- Always mention specific menu items and prices when relevant
- If someone seems interested in dining, try to encourage them to visit or make a reservation
`;

export async function POST(request: NextRequest) {
  let userMessage = 'help';
  
  try {
    const { message, conversationHistory = [] } = await request.json();
    userMessage = message;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history for context
    const messages = [
      {
        role: 'system' as const,
        content: RESTAURANT_CONTEXT
      },
      ...conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponse = getFallbackResponse(userMessage);
    
    return NextResponse.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}

function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! Welcome to Mario's Italian Restaurant! I'm here to help you with our menu, hours, reservations, and anything else you'd like to know. How can I assist you today?";
  }
  
  if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return "Our menu features authentic Italian cuisine! Try our famous Margherita Pizza ($18), Chicken Parmesan ($22), or Fettuccine Alfredo ($16). We also have fresh salads, homemade desserts, and an excellent wine selection. What sounds good to you?";
  }
  
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
    return "We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm. We'd love to see you soon! Would you like to make a reservation?";
  }
  
  if (lowerMessage.includes('reservation') || lowerMessage.includes('book') || lowerMessage.includes('table')) {
    return "I'd be happy to help with your reservation! For the best experience, please call us at (555) 123-4567 or book online at marios-restaurant.com. What date and time were you thinking?";
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
    return "We're located at 123 Main Street in Downtown. Easy to find and plenty of parking available! Our cozy atmosphere makes it perfect for date nights, family dinners, or business lunches.";
  }
  
  return "Thank you for your interest in Mario's Italian Restaurant! I'm here to help with information about our delicious menu, hours, reservations, location, and more. What can I tell you about our authentic Italian dining experience?";
} 