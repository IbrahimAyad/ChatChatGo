import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  category: string;
  dataAiHint: string;
  popularity_rank: number;
  social_mentions: number;
  weekly_sales: number;
  trending?: boolean;
  social_viral?: boolean;
  chef_recommendation?: boolean;
  chef_special?: boolean;
  spice_level?: string;
}

interface MenuCategory {
  slug: string;
  name: string;
  description: string;
  image: string;
  dataAiHint: string;
  items: MenuItem[];
}

interface MenuData {
  restaurant: {
    name: string;
    description: string;
    phone: string;
    address: string;
    hours: Record<string, string>;
    specialties: string[];
    dietary_options: string[];
  };
  menu: MenuCategory[];
  specials: Array<{
    id: string;
    name: string;
    description: string;
    discount: string;
    valid_until: string;
    days: string[];
    active: boolean;
  }>;
  analytics: {
    current_revenue_today: number;
    revenue_change_vs_last_week: string;
    top_selling_item: string;
    social_trending_item: string;
    social_sentiment: string;
    peak_hour_today: string;
    current_wait_time: string;
    weather_impact: string;
    total_orders_today: number;
    average_order_value: number;
  };
  drink_pairings: Record<string, string[]>;
  allergen_info: {
    gluten_free_options: string[];
    vegan_options: string[];
    nut_allergies: string;
  };
  last_updated: string;
  version: string;
}

// GET - Return current menu data
export async function GET() {
  try {
    const menuPath = path.join(process.cwd(), 'royale-with-cheese-menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    return NextResponse.json(menuData);
  } catch (error) {
    console.error('Error reading menu data:', error);
    return NextResponse.json({ error: 'Failed to load menu data' }, { status: 500 });
  }
}

// POST - Update menu with real-time analytics
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const menuPath = path.join(process.cwd(), 'royale-with-cheese-menu.json');
    
    // Read current menu data
    const currentMenu: MenuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    // Update analytics section
    if (updates.analytics) {
      currentMenu.analytics = {
        ...currentMenu.analytics,
        ...updates.analytics
      };
    }
    
    // Update menu items with new sales data, social mentions, etc.
    if (updates.menu_updates) {
      Object.entries(updates.menu_updates).forEach(([categorySlug, items]) => {
        const categoryIndex = currentMenu.menu.findIndex(cat => cat.slug === categorySlug);
        if (categoryIndex !== -1) {
          (items as any[]).forEach((updatedItem: any) => {
            const existingItemIndex = currentMenu.menu[categoryIndex].items.findIndex(
              (item: MenuItem) => item.id === updatedItem.id
            );
            if (existingItemIndex !== -1) {
              Object.assign(currentMenu.menu[categoryIndex].items[existingItemIndex], updatedItem);
            }
          });
        }
      });
    }
    
    // Update specials
    if (updates.specials) {
      currentMenu.specials = updates.specials;
    }
    
    // Update last_updated timestamp
    currentMenu.last_updated = new Date().toISOString();
    
    // Update version
    const versionParts = currentMenu.version.split('.');
    versionParts[1] = (parseInt(versionParts[1]) + 1).toString();
    currentMenu.version = versionParts.join('.');
    
    // Write updated menu back to file
    fs.writeFileSync(menuPath, JSON.stringify(currentMenu, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu updated successfully',
      version: currentMenu.version 
    });
    
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}

// PUT - Complete menu replacement (for major updates)
export async function PUT(request: NextRequest) {
  try {
    const newMenuData = await request.json();
    const menuPath = path.join(process.cwd(), 'royale-with-cheese-menu.json');
    
    // Add metadata
    newMenuData.last_updated = new Date().toISOString();
    if (!newMenuData.version) {
      newMenuData.version = '1.0';
    }
    
    // Write new menu data
    fs.writeFileSync(menuPath, JSON.stringify(newMenuData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu replaced successfully',
      version: newMenuData.version 
    });
    
  } catch (error) {
    console.error('Error replacing menu:', error);
    return NextResponse.json({ error: 'Failed to replace menu' }, { status: 500 });
  }
}