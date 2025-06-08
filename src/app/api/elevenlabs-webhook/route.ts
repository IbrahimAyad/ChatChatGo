import { NextRequest, NextResponse } from 'next/server';

// This endpoint is called by ElevenLabs when a conversation starts
// It returns real-time restaurant data for dynamic variables
// 
// 🚨 PRODUCTION NOTE: Update ElevenLabs webhook URL to https://ChatChatGo.ai/api/elevenlabs-webhook when going live!
// Currently configured for: http://localhost:3000/api/elevenlabs-webhook
// 
// 🚨 PRODUCTION NOTE: Update ElevenLabs webhook URL to https://ChatChatGo.ai/api/elevenlabs-webhook when going live!
// Currently configured for: http://localhost:3000/api/elevenlabs-webhook
export async function POST(request: NextRequest) {
  try {
    // Verify webhook authentication
    const authHeader = request.headers.get('authorization');
    const expectedAuth = 'Bearer webhook_secret_2024_secure_key_xyz';
    
    if (!authHeader || authHeader !== expectedAuth) {
      console.log('Unauthorized webhook call - invalid auth header');
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('ElevenLabs webhook called:', body);
    
    // Extract restaurant identifier from the request
    // ElevenLabs will send call metadata that helps identify which restaurant
    const restaurantId = body.restaurant_id || 'royale_with_cheese'; // Default for testing
    
    // Fetch real-time restaurant data
    const restaurantData = await fetchRestaurantData(restaurantId);
    
    // Return dynamic variables for the specific restaurant
    return NextResponse.json({
      restaurant_name: restaurantData.name,
      wait_time: restaurantData.currentWaitTime,
      current_special: restaurantData.todaysSpecial,
      popular_item: restaurantData.popularItem,
      trending_item: restaurantData.trendingItem,
      phone_number: restaurantData.phone,
      business_hours: restaurantData.hours,
      chef_recommendation: restaurantData.chefRecommendation,
      dietary_special: restaurantData.dietaryOptions,
      seasonal_item: restaurantData.seasonalItem,
      location: restaurantData.location,
      delivery_time: restaurantData.deliveryTime,
      takeout_time: restaurantData.takeoutTime
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Return fallback data if something goes wrong
    return NextResponse.json({
      restaurant_name: "Royale with Cheese",
      wait_time: "5-10 minutes",
      current_special: "Daily special available",
      popular_item: "Mia Wallace BBQ Burger",
      trending_item: "Nacho Cheese Ravioli",
      phone_number: "(555) 123-ROYALE",
      business_hours: "Mon-Thu 11AM-10PM, Fri-Sat 11AM-11PM",
      chef_recommendation: "Truffle Pasta",
      dietary_special: "Gluten-free options available",
      seasonal_item: "Winter special",
      location: "Downtown",
      delivery_time: "25-30 minutes",
      takeout_time: "15 minutes"
    });
  }
}

// Fetch real-time data for specific restaurant
async function fetchRestaurantData(restaurantId: string) {
  // This would connect to your restaurant's live data
  // For now, returning Royale with Cheese data
  
  return {
    name: "Royale with Cheese",
    currentWaitTime: await getCurrentWaitTime(restaurantId),
    todaysSpecial: await getTodaysSpecial(restaurantId),
    popularItem: "Mia Wallace BBQ Burger",
    trendingItem: await getTrendingItem(restaurantId),
    phone: "(555) 123-ROYALE",
    hours: "Mon-Thu 11AM-10PM, Fri-Sat 11AM-11PM, Sun 12PM-9PM",
    chefRecommendation: "Truffle Pasta",
    dietaryOptions: "Gluten-free buns and vegan patties available",
    seasonalItem: "Winter truffle special",
    location: "Downtown location",
    deliveryTime: "25-30 minutes", 
    takeoutTime: "15 minutes"
  };
}

// Helper functions to get live data
async function getCurrentWaitTime(restaurantId: string): Promise<string> {
  // Connect to your restaurant management system
  // Return current wait time based on orders, capacity, etc.
  return "8 minutes";
}

async function getTodaysSpecial(restaurantId: string): Promise<string> {
  // Get today's special from restaurant system
  const today = new Date().getDay();
  const specials = {
    1: "Mia Wallace Monday - 25% off BBQ Burger",
    2: "Bite Night Tuesday - Buy 2 bites, get 1 free", 
    3: "Wine Wednesday - Half price wine bottles",
    4: "Throwback Thursday - Classic menu items",
    5: "Friday Night Special - Truffle fries with any burger",
    6: "Weekend Brunch Special",
    0: "Sunday Family Special - Kids eat free"
  };
  return specials[today as keyof typeof specials] || "Daily special available";
}

async function getTrendingItem(restaurantId: string): Promise<string> {
  // Get trending item from social media monitoring or sales data
  return "Nacho Cheese Ravioli";
} 