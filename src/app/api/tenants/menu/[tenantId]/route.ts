import { NextRequest, NextResponse } from 'next/server';

// Dynamic menu data for different restaurant types
const menuDatabase = {
  'mario-restaurant': {
    cuisine: 'italian',
    items: [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh tomato sauce, mozzarella, basil, extra virgin olive oil',
        price: 16.99,
        category: 'Pizza',
        available: true,
        allergens: ['dairy', 'gluten'],
        customizations: [
          { type: 'size', options: [
            { name: 'Small (10")', priceModifier: -3.00 },
            { name: 'Medium (12")', priceModifier: 0 },
            { name: 'Large (14")', priceModifier: 3.00 },
            { name: 'Extra Large (16")', priceModifier: 6.00 }
          ]},
          { type: 'topping', options: [
            { name: 'Extra Cheese', priceModifier: 2.00 },
            { name: 'Pepperoni', priceModifier: 2.50 },
            { name: 'Mushrooms', priceModifier: 1.50 },
            { name: 'Olives', priceModifier: 1.50 }
          ]}
        ]
      },
      {
        id: '2',
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella and tomato sauce',
        price: 18.99,
        category: 'Pizza',
        available: true,
        allergens: ['dairy', 'gluten'],
        customizations: [
          { type: 'size', options: [
            { name: 'Small (10")', priceModifier: -3.00 },
            { name: 'Medium (12")', priceModifier: 0 },
            { name: 'Large (14")', priceModifier: 3.00 },
            { name: 'Extra Large (16")', priceModifier: 6.00 }
          ]}
        ]
      },
      {
        id: '3',
        name: 'Caesar Salad',
        description: 'Romaine lettuce, parmesan cheese, croutons, Caesar dressing',
        price: 12.99,
        category: 'Salads',
        available: true,
        allergens: ['dairy', 'gluten'],
        customizations: [
          { type: 'side', options: [
            { name: 'Grilled Chicken', priceModifier: 4.00 },
            { name: 'Grilled Shrimp', priceModifier: 6.00 },
            { name: 'Extra Parmesan', priceModifier: 1.50 }
          ]}
        ]
      },
      {
        id: '4',
        name: 'Tiramisu',
        description: 'Traditional Italian dessert with coffee and mascarpone',
        price: 8.99,
        category: 'Desserts',
        available: true,
        allergens: ['dairy', 'eggs'],
        customizations: []
      },
      {
        id: '5',
        name: 'House Wine',
        description: 'Red or white wine selection',
        price: 7.99,
        category: 'Beverages',
        available: true,
        allergens: [],
        customizations: [
          { type: 'drink', options: [
            { name: 'Red Wine', priceModifier: 0 },
            { name: 'White Wine', priceModifier: 0 },
            { name: 'Sparkling', priceModifier: 2.00 }
          ]}
        ]
      }
    ],
    specialOffers: [
      {
        id: 'lunch-combo',
        name: 'Lunch Combo',
        description: 'Any personal pizza + salad + drink',
        discountType: 'fixed',
        discountValue: 5.00,
        validUntil: new Date('2024-12-31'),
        conditions: 'Valid 11am-3pm weekdays'
      },
      {
        id: 'family-deal',
        name: 'Family Night',
        description: '2 Large pizzas + dessert',
        discountType: 'percentage',
        discountValue: 15,
        validUntil: new Date('2024-12-31'),
        conditions: 'Valid Sundays after 5pm'
      }
    ]
  },
  
  'techstore-electronics': {
    cuisine: 'retail',
    items: [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with Pro camera system',
        price: 999.99,
        category: 'Smartphones',
        available: true,
        allergens: [],
        customizations: [
          { type: 'storage', options: [
            { name: '128GB', priceModifier: 0 },
            { name: '256GB', priceModifier: 100 },
            { name: '512GB', priceModifier: 300 }
          ]},
          { type: 'color', options: [
            { name: 'Natural Titanium', priceModifier: 0 },
            { name: 'Blue Titanium', priceModifier: 0 },
            { name: 'White Titanium', priceModifier: 0 }
          ]}
        ]
      }
    ],
    specialOffers: []
  },

  'wellness-clinic': {
    cuisine: 'healthcare',
    items: [
      {
        id: '1',
        name: 'General Consultation',
        description: 'Standard medical consultation with physician',
        price: 150.00,
        category: 'Consultations',
        available: true,
        allergens: [],
        customizations: []
      }
    ],
    specialOffers: []
  }
};

// GET menu for specific tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    // Get menu data for tenant
    const menuData = menuDatabase[tenantId as keyof typeof menuDatabase];
    
    if (!menuData) {
      return NextResponse.json(
        { 
          error: 'Menu not found for tenant',
          tenantId,
          available: Object.keys(menuDatabase)
        },
        { status: 404 }
      );
    }

    // Build menu response for N8N workflow
    const formattedMenu = {
      tenantId,
      cuisine: menuData.cuisine,
      lastUpdated: new Date().toISOString(),
      categories: Array.from(new Set(menuData.items.map(item => item.category))),
      totalItems: menuData.items.length,
      items: menuData.items,
      specialOffers: menuData.specialOffers,
      
      // Pre-formatted context for AI
      contextString: buildMenuContext(menuData, tenantId)
    };

    return NextResponse.json(formattedMenu);

  } catch (error: any) {
    console.error('[MENU API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to load menu',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Build formatted menu context for AI
function buildMenuContext(menuData: any, tenantId: string): string {
  const { items, specialOffers, cuisine } = menuData;
  
  // Group items by category
  const categories: string[] = Array.from(new Set(items.map((item: any) => item.category)));
  
  let context = `MENU INFORMATION:\n`;
  
  categories.forEach((category: string) => {
    const categoryItems = items.filter((item: any) => item.category === category);
    context += `\n${category.toUpperCase()}:\n`;
    
    categoryItems.forEach((item: any) => {
      context += `- ${item.name}: $${item.price.toFixed(2)} - ${item.description}\n`;
      
      // Add customization info
      if (item.customizations && item.customizations.length > 0) {
        item.customizations.forEach((custom: any) => {
          context += `  ${custom.type}: ${custom.options.map((opt: any) => 
            `${opt.name} ${opt.priceModifier > 0 ? `(+$${opt.priceModifier})` : 
             opt.priceModifier < 0 ? `(-$${Math.abs(opt.priceModifier)})` : ''}`
          ).join(', ')}\n`;
        });
      }
    });
  });
  
  // Add special offers
  if (specialOffers && specialOffers.length > 0) {
    context += `\nSPECIAL OFFERS:\n`;
    specialOffers.forEach((offer: any) => {
      const discount = offer.discountType === 'percentage' 
        ? `${offer.discountValue}% off` 
        : `$${offer.discountValue} off`;
      context += `- ${offer.name}: ${offer.description} (${discount}) - ${offer.conditions}\n`;
    });
  }
  
  return context;
}

// POST - Update menu (for restaurant management)
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const updateData = await request.json();
    
    // In production, this would update the database
    console.log(`[MENU API] Menu update request for ${tenantId}:`, updateData);
    
    return NextResponse.json({
      success: true,
      message: `Menu updated for ${tenantId}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
} 