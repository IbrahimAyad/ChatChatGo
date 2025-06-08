import { NextRequest, NextResponse } from 'next/server';
import { TenantScrapedMenuData } from '@/types/tenant';

// Use the same storage as the main endpoint
declare global {
  var tenantMenuData: Record<string, TenantScrapedMenuData>;
}

if (!global.tenantMenuData) {
  global.tenantMenuData = {};
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId = 'mario-restaurant' } = await request.json();
    
    const demoData: TenantScrapedMenuData = {
      restaurantName: "Mario's Italian Bistro",
      cuisine: "Italian",
      location: "123 Main St, Brooklyn, NY 11201",
      phone: "(718) 555-0123",
      hours: "Mon-Thu: 11am-10pm, Fri-Sat: 11am-11pm, Sun: 12pm-9pm",
      website: "https://marios-bistro.demo",
      
      menu: [
        {
          name: "Margherita Pizza",
          description: "Fresh mozzarella, tomato sauce, and basil on our house-made dough",
          price: "$18.99",
          category: "Pizzas",
          allergens: ["gluten", "dairy"],
          availability: true,
          isPopular: true
        },
        {
          name: "Spaghetti Carbonara",
          description: "Classic Roman pasta with eggs, pancetta, pecorino cheese, and black pepper",
          price: "$22.99",
          category: "Pasta",
          allergens: ["gluten", "dairy", "eggs"],
          availability: true,
          isPopular: true
        },
        {
          name: "Caesar Salad",
          description: "Crisp romaine lettuce, parmesan cheese, croutons, and our house Caesar dressing",
          price: "$14.99",
          category: "Salads",
          allergens: ["gluten", "dairy"],
          availability: true
        },
        {
          name: "Tiramisu",
          description: "Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone",
          price: "$8.99",
          category: "Desserts",
          allergens: ["gluten", "dairy", "eggs"],
          availability: true,
          isPopular: true
        },
        {
          name: "Chicken Parmigiana",
          description: "Breaded chicken breast with marinara sauce and melted mozzarella, served with spaghetti",
          price: "$24.99",
          category: "Main Courses",
          allergens: ["gluten", "dairy"],
          availability: true
        }
      ],
      
      specialOffers: [
        "Lunch Special: Any pasta + salad + drink for $19.99 (Mon-Fri 11am-3pm)",
        "Family Night: 15% off orders over $50 (Sundays)",
        "Happy Hour: Half-price appetizers (Weekdays 4pm-6pm)"
      ],
      
      aiContext: `Welcome to Mario's Italian Bistro!

MENU:
1. Margherita Pizza - $18.99
   Fresh mozzarella, tomato sauce, and basil on our house-made dough

2. Spaghetti Carbonara - $22.99
   Classic Roman pasta with eggs, pancetta, pecorino cheese, and black pepper

3. Caesar Salad - $14.99
   Crisp romaine lettuce, parmesan cheese, croutons, and our house Caesar dressing

4. Tiramisu - $8.99
   Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone

5. Chicken Parmigiana - $24.99
   Breaded chicken breast with marinara sauce and melted mozzarella, served with spaghetti

SPECIAL OFFERS:
• Lunch Special: Any pasta + salad + drink for $19.99 (Mon-Fri 11am-3pm)
• Family Night: 15% off orders over $50 (Sundays)
• Happy Hour: Half-price appetizers (Weekdays 4pm-6pm)`,
      
      source: "demo-setup",
      dataSource: "manual",
      lastScraped: new Date(),
      lastUpdated: new Date(),
      isStale: false,
      
      scrapingHistory: [
        {
          timestamp: new Date(),
          source: "demo-setup",
          success: true,
          itemsFound: 5,
          processingTime: 50
        }
      ]
    };
    
    // Store the data (this will be accessible by the main menu-data endpoint)
    global.tenantMenuData[tenantId] = demoData;
    
    // Also store it in the main system by making a request to our own API
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/tenants/${tenantId}/menu-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoData)
      });
      
      if (!response.ok) {
        // If PUT fails, the data doesn't exist yet, so we'll need to use POST
        // But since our POST expects a URL, we'll handle this differently
        console.log('PUT failed, tenant needs initial data creation');
      }
    } catch (error) {
      console.log('Failed to sync with main API:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: `Demo restaurant "${demoData.restaurantName}" created successfully`,
      tenantId,
      data: demoData,
      usage: {
        menuEndpoint: `/api/tenants/${tenantId}/menu-data`,
        menuManager: `/menu-manager`,
        testN8N: 'Use the tenantId in your N8N webhook payload'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create demo restaurant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 