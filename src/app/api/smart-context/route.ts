import { NextRequest, NextResponse } from 'next/server';

// Simulated database for demo purposes
// In production, this would be replaced with your actual database
let userProfiles: Record<string, any> = {
  'sarah@example.com': {
    id: 'sarah_123',
    name: 'Sarah',
    email: 'sarah@example.com',
    phone: '555-0123',
    lastOrder: new Date('2025-01-05'),
    totalOrderAmount: 247.50,
    orderHistory: [
      {
        id: 'order_1',
        date: new Date('2025-01-05'),
        items: [
          { name: 'Chicken Sandwich', price: 12.99, customizations: ['no onions'], category: 'sandwich' },
          { name: 'Diet Coke', price: 2.50, customizations: [], category: 'drink' }
        ],
        total: 15.49,
        restaurantId: 'royale-with-cheese'
      }
    ],
    preferences: {
      dietaryRestrictions: [],
      favoriteItems: ['Chicken Sandwich'],
      dislikedIngredients: ['onions'],
      spiceLevel: 'mild',
      avgOrderValue: 15.49,
      preferredOrderTime: 'lunch'
    },
    loyaltyLevel: 'regular'
  },
  'vip@example.com': {
    id: 'vip_456',
    name: 'VIP Customer',
    email: 'vip@example.com',
    totalOrderAmount: 750.00,
    orderHistory: [],
    preferences: {
      dietaryRestrictions: [],
      favoriteItems: ['Premium Burger'],
      dislikedIngredients: [],
      spiceLevel: 'hot',
      avgOrderValue: 25.00,
      preferredOrderTime: 'dinner'
    },
    loyaltyLevel: 'vip'
  }
};

let behaviorData: Record<string, any> = {};
let trainingData: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');
  
  try {
    switch (action) {
      case 'get_suggestions':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }
        
        const suggestions = await generateSmartSuggestions(userId);
        return NextResponse.json({ suggestions });
        
      case 'get_user_profile':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }
        
        const profile = userProfiles[userId] || null;
        return NextResponse.json({ profile });
        
      case 'get_analytics':
        const analytics = {
          totalUsers: Object.keys(userProfiles).length,
          totalSuggestions: trainingData.length,
          conversionRate: calculateConversionRate(),
          topTriggers: getTopTriggers(),
          behaviorMetrics: getBehaviorMetrics()
        };
        return NextResponse.json({ analytics });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Smart context API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    const body = await request.json();
    
    switch (action) {
      case 'track_behavior':
        const { userId, behaviorType, data } = body;
        
        if (!behaviorData[userId]) {
          behaviorData[userId] = {
            pageViews: [],
            timeSpent: 0,
            itemsViewedToday: [],
            cartAbandonment: false,
            scrollDepth: 0
          };
        }
        
        trackUserBehavior(userId, behaviorType, data);
        return NextResponse.json({ success: true });
        
      case 'collect_training_data':
        const { suggestionId, suggestionType, userAction, confidence, reasoning } = body;
        
        const trainingPoint = {
          suggestionId,
          suggestionType,
          userAction,
          confidence,
          reasoning,
          timestamp: new Date(),
          userId: body.userId
        };
        
        trainingData.push(trainingPoint);
        
        console.log('Training data collected:', trainingPoint);
        return NextResponse.json({ success: true });
        
      case 'update_user_profile':
        const { userId: updateUserId, profileData } = body;
        
        if (userProfiles[updateUserId]) {
          userProfiles[updateUserId] = { ...userProfiles[updateUserId], ...profileData };
        } else {
          userProfiles[updateUserId] = profileData;
        }
        
        return NextResponse.json({ success: true });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Smart context POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper Functions

async function generateSmartSuggestions(userId: string) {
  const userProfile = userProfiles[userId];
  const behavior = behaviorData[userId] || {};
  
  const suggestions = [];
  
  // Welcome back trigger for returning users
  if (userProfile && userProfile.orderHistory.length > 0) {
    suggestions.push({
      id: 'welcome_back',
      type: 'personalized',
      message: `Welcome back, ${userProfile.name || 'friend'}! Your usual ${userProfile.preferences.favoriteItems[0] || 'order'}?`,
      action: 'add_to_cart',
      confidence: 0.9,
      reasoning: 'Returning customer with order history',
      data: { item: userProfile.preferences.favoriteItems[0] }
    });
  }
  
  // Upsell trigger based on behavior
  if (behavior.itemsViewedToday && 
      behavior.itemsViewedToday.some((item: string) => item.includes('burger')) && 
      !behavior.itemsViewedToday.some((item: string) => item.includes('fries'))) {
    suggestions.push({
      id: 'cart_upsell',
      type: 'upsell',
      message: '🍟 Add fries for just $2.99? Perfect with your burger!',
      action: 'add_fries',
      confidence: 0.8,
      reasoning: 'User viewing burgers but no sides',
      data: { item: 'fries', price: 2.99 }
    });
  }
  
  // Time-based lunch trigger
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) {
    suggestions.push({
      id: 'lunch_time',
      type: 'behavioral',
      message: '⏰ Quick 15-min lunch combo? Perfect for your busy day!',
      action: 'show_lunch_combos',
      confidence: 0.7,
      reasoning: 'Lunch time detected',
      data: { combos: ['quick_burger_combo', 'salad_wrap_combo'] }
    });
  }
  
  // VIP trigger for high-value customers
  if (userProfile && userProfile.totalOrderAmount > 500) {
    suggestions.push({
      id: 'vip_treatment',
      type: 'loyalty',
      message: '🌟 VIP exclusive: Try our chef\'s special with complimentary dessert!',
      action: 'show_vip_menu',
      confidence: 0.85,
      reasoning: 'High-value customer detected',
      data: { specialOffer: 'chef_special_with_dessert' }
    });
  }
  
  // Samuel L. Jackson themed trigger for specific restaurant
  const hasRoyaleItem = behavior.itemsViewedToday && 
    behavior.itemsViewedToday.some((item: string) => item.toLowerCase().includes('royale'));
  if (hasRoyaleItem || userId === 'vip@example.com') {
    suggestions.push({
      id: 'pulp_fiction_theme',
      type: 'themed',
      message: '🎬 "What do they call a Quarter Pounder with Cheese in Paris?" - Try our Royale with Cheese!',
      action: 'samuel_jackson_order',
      confidence: 0.75,
      reasoning: 'Pulp Fiction themed restaurant interaction',
      data: { 
        voiceActor: 'samuel_l_jackson',
        specialItem: 'royale_with_cheese',
        movieQuote: true
      }
    });
  }
  
  // Cart abandonment recovery
  if (behavior.cartAbandonment) {
    suggestions.push({
      id: 'cart_recovery',
      type: 'behavioral',
      message: '💭 Still thinking? How about 10% off your order to help you decide?',
      action: 'apply_discount',
      confidence: 0.85,
      reasoning: 'Cart abandonment detected',
      data: { discount: 0.1, code: 'THINK10' }
    });
  }
  
  // New customer onboarding
  if ((!userProfile || userProfile.orderHistory.length === 0) && 
      behavior.timeSpent > 30000) { // 30 seconds
    suggestions.push({
      id: 'new_customer',
      type: 'personalized',
      message: '👋 First time here? Let us help you find the perfect meal! What are you in the mood for?',
      action: 'start_food_quiz',
      confidence: 0.7,
      reasoning: 'New customer spending time browsing',
      data: { quiz: 'food_preference_quiz' }
    });
  }
  
  // Sort by confidence and return top 3
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

function trackUserBehavior(userId: string, behaviorType: string, data: any) {
  if (!behaviorData[userId]) {
    behaviorData[userId] = {
      pageViews: [],
      timeSpent: 0,
      itemsViewedToday: [],
      cartAbandonment: false,
      scrollDepth: 0
    };
  }
  
  const currentBehavior = behaviorData[userId];
  
  switch (behaviorType) {
    case 'page_view':
      currentBehavior.pageViews.push({
        page: data.page,
        timestamp: new Date(),
        duration: data.duration || 0
      });
      break;
      
    case 'item_view':
      if (!currentBehavior.itemsViewedToday.includes(data.itemName)) {
        currentBehavior.itemsViewedToday.push(data.itemName);
      }
      break;
      
    case 'time_spent':
      currentBehavior.timeSpent += data.duration;
      break;
      
    case 'scroll':
      currentBehavior.scrollDepth = Math.max(currentBehavior.scrollDepth, data.depth);
      break;
      
    case 'cart_abandon':
      currentBehavior.cartAbandonment = true;
      break;
  }
}

function calculateConversionRate() {
  const totalSuggestions = trainingData.length;
  const clickedSuggestions = trainingData.filter(d => d.userAction === 'clicked').length;
  
  return totalSuggestions > 0 ? (clickedSuggestions / totalSuggestions * 100).toFixed(1) : 0;
}

function getTopTriggers() {
  const triggerCounts: Record<string, number> = {};
  const triggerSuccess: Record<string, number> = {};
  
  trainingData.forEach(point => {
    const type = point.suggestionType;
    triggerCounts[type] = (triggerCounts[type] || 0) + 1;
    
    if (point.userAction === 'clicked') {
      triggerSuccess[type] = (triggerSuccess[type] || 0) + 1;
    }
  });
  
  return Object.entries(triggerCounts).map(([type, count]) => ({
    type,
    count,
    successRate: triggerSuccess[type] ? (triggerSuccess[type] / count * 100).toFixed(1) : 0
  })).slice(0, 5);
}

function getBehaviorMetrics() {
  const users = Object.keys(behaviorData);
  const totalTimeSpent = users.reduce((sum, userId) => sum + (behaviorData[userId].timeSpent || 0), 0);
  const avgScrollDepth = users.length > 0 ? 
    users.reduce((sum, userId) => sum + (behaviorData[userId].scrollDepth || 0), 0) / users.length : 0;
  
  return {
    activeUsers: users.length,
    avgTimeSpent: users.length > 0 ? Math.round(totalTimeSpent / users.length / 1000) : 0, // in seconds
    avgScrollDepth: Math.round(avgScrollDepth)
  };
} 